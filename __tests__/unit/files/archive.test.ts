import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockSend = jest.fn<(command: unknown) => Promise<unknown>>();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  CopyObjectCommand: jest.fn().mockImplementation((input) => ({
    type: 'copy',
    input,
  })),
  DeleteObjectsCommand: jest.fn().mockImplementation((input) => ({
    type: 'delete',
    input,
  })),
}));

type Cmd = { type: 'copy' | 'delete'; input: Record<string, any> };
const sent = () => mockSend.mock.calls.map((c) => c[0] as Cmd);

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('lib/files/archive', () => {
  it('archiveKey prefixes archive/', async () => {
    const { archiveKey } = await import('@/lib/files/archive');
    expect(archiveKey('activities/a.pdf')).toBe('archive/activities/a.pdf');
  });

  it('copies to archive/ in GLACIER_IR with the metadata kept', async () => {
    const { archiveFiles } = await import('@/lib/files/archive');
    const keys = await archiveFiles([{ s3Key: 'activities/a.pdf' }]);
    expect(keys).toEqual(['archive/activities/a.pdf']);
    const [cmd] = sent();
    expect(cmd.input).toMatchObject({
      Key: 'archive/activities/a.pdf',
      CopySource: 'fonosapp/activities/a.pdf',
      StorageClass: 'GLACIER_IR',
      MetadataDirective: 'COPY',
    });
  });

  it('restores to archivedFromKey in STANDARD', async () => {
    const { restoreFiles } = await import('@/lib/files/archive');
    const keys = await restoreFiles([
      {
        s3Key: 'archive/activities/a.pdf',
        archivedFromKey: 'activities/a.pdf',
      },
    ]);
    expect(keys).toEqual(['activities/a.pdf']);
    expect(sent()[0].input).toMatchObject({
      Key: 'activities/a.pdf',
      CopySource: 'fonosapp/archive/activities/a.pdf',
      StorageClass: 'STANDARD',
    });
  });

  it('restore refuses a file without archivedFromKey, before copying', async () => {
    const { restoreFiles } = await import('@/lib/files/archive');
    await expect(
      restoreFiles([{ s3Key: 'archive/x', archivedFromKey: null }])
    ).rejects.toThrow();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('a failed second copy deletes the first copy and throws', async () => {
    mockSend
      .mockResolvedValueOnce({}) // copy 1
      .mockRejectedValueOnce(new Error('AccessDenied')) // copy 2
      .mockResolvedValueOnce({}); // cleanup
    const { archiveFiles } = await import('@/lib/files/archive');
    await expect(
      archiveFiles([{ s3Key: 'a/1.pdf' }, { s3Key: 'a/2.pdf' }])
    ).rejects.toThrow('AccessDenied');
    const cmds = sent();
    expect(cmds[2].type).toBe('delete');
    expect(cmds[2].input.Delete.Objects).toEqual([{ Key: 'archive/a/1.pdf' }]);
  });

  it('deleteObjects ignores NoSuchKey and never throws', async () => {
    const { deleteObjects } = await import('@/lib/files/archive');
    mockSend.mockResolvedValueOnce({
      Errors: [{ Key: 'a', Code: 'NoSuchKey' }],
    });
    expect(await deleteObjects(['a'])).toEqual([]);

    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('x'), { name: 'NoSuchKey' })
    );
    expect(await deleteObjects(['a'])).toEqual([]);
    expect(console.error).not.toHaveBeenCalled();

    mockSend.mockRejectedValueOnce(new Error('boom'));
    expect(await deleteObjects(['b'])).toEqual(['b']);
    mockSend.mockResolvedValueOnce({
      Errors: [{ Key: 'c', Code: 'AccessDenied' }],
    });
    expect(await deleteObjects(['c'])).toEqual(['c']);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('encodes spaces and accents in CopySource, keeping the slashes', async () => {
    const { copyObject } = await import('@/lib/files/archive');
    await copyObject(
      'activities/Fonema é ç.pdf',
      'archive/activities/Fonema é ç.pdf',
      'GLACIER_IR'
    );
    const { CopySource, Key } = sent()[0].input;
    expect(CopySource).toBe('fonosapp/activities/Fonema%20%C3%A9%20%C3%A7.pdf');
    // The destination key is sent as is; the SDK encodes it.
    expect(Key).toBe('archive/activities/Fonema é ç.pdf');
  });
});
