import 'server-only';

import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// Moves an activity's files between active storage (Standard, original key)
// and the archive (Glacier Instant Retrieval, under archive/). Files are
// always COPIED first; the database changes only after every copy worked and
// the originals are deleted afterwards, so a record never points at a
// missing file.
//
// Glacier Instant Retrieval has a 90-day minimum storage charge: restoring
// or deleting an archived copy earlier is billed as if it stayed 90 days.

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

export type ArchiveStorageClass = 'GLACIER_IR' | 'STANDARD';

export const ARCHIVE_PREFIX = 'archive/';

export const archiveKey = (key: string) => `${ARCHIVE_PREFIX}${key}`;

/** CopySource must be URL-encoded; "/" stays as the separator. */
const copySource = (key: string) =>
  `${BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`;

/** Server-side copy within the bucket, keeping content type and metadata. */
export async function copyObject(
  from: string,
  to: string,
  storageClass: ArchiveStorageClass
): Promise<void> {
  await s3.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      Key: to,
      CopySource: copySource(from),
      StorageClass: storageClass,
      MetadataDirective: 'COPY',
    })
  );
}

const isMissing = (code?: string) =>
  code === 'NoSuchKey' || code === 'NotFound';

/**
 * Delete objects, best effort: a missing key is fine, other errors are
 * logged, and it never throws. Returns the keys it could not delete.
 */
export async function deleteObjects(keys: string[]): Promise<string[]> {
  const failed: string[] = [];
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    try {
      const result = await s3.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        })
      );
      for (const e of result.Errors ?? []) {
        if (isMissing(e.Code)) continue;
        console.error('[archive] delete failed', e.Key, e.Code);
        if (e.Key) failed.push(e.Key);
      }
    } catch (error) {
      if (isMissing((error as { name?: string }).name)) continue;
      console.error('[archive] delete failed', batch, error);
      failed.push(...batch);
    }
  }
  return failed;
}

/** Copy `pairs` in order; on the first failure remove the copies made. */
async function copyAll(
  pairs: { from: string; to: string }[],
  storageClass: ArchiveStorageClass
): Promise<string[]> {
  const done: string[] = [];
  try {
    for (const { from, to } of pairs) {
      await copyObject(from, to, storageClass);
      done.push(to);
    }
  } catch (error) {
    await deleteObjects(done);
    throw error;
  }
  return done;
}

/**
 * Copy each file to archive/<key> in Glacier Instant Retrieval. Throws if
 * any copy fails (after deleting the copies already made). Returns the new
 * keys, in the same order. The originals are left alone.
 */
export function archiveFiles(files: { s3Key: string }[]): Promise<string[]> {
  return copyAll(
    files.map((f) => ({ from: f.s3Key, to: archiveKey(f.s3Key) })),
    'GLACIER_IR'
  );
}

/**
 * Inverse of archiveFiles: copy each file from its archive key back to
 * archivedFromKey in Standard storage. Throws if any copy fails (after
 * deleting the copies already made). Returns the restored keys, in order.
 */
export async function restoreFiles(
  files: { s3Key: string; archivedFromKey: string | null }[]
): Promise<string[]> {
  const pairs = files.map((f) => {
    if (!f.archivedFromKey) {
      throw new Error(`Arquivo sem chave de origem: ${f.s3Key}`);
    }
    return { from: f.s3Key, to: f.archivedFromKey };
  });
  return copyAll(pairs, 'STANDARD');
}
