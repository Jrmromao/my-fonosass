// Mock for AWS SDK modules to avoid ESM parsing issues
const mockSend = jest.fn();

module.exports = {
  CompleteMultipartUploadCommandOutput: class CompleteMultipartUploadCommandOutput {
    constructor() {
      this.$metadata = {};
      this.ETag = 'mock-etag';
      this.Location = 'mock-location';
    }
  },
  S3Client: class S3Client {
    constructor() {}
    send = mockSend;
  },
  PutObjectCommand: class PutObjectCommand {
    constructor() {}
  },
  GetObjectCommand: class GetObjectCommand {
    constructor() {}
  },
  ListObjectsV2Command: class ListObjectsV2Command {
    constructor() {}
  },
  DeleteObjectCommand: class DeleteObjectCommand {
    constructor() {}
  },
  DeleteObjectsCommand: class DeleteObjectsCommand {
    constructor() {}
  },
  HeadBucketCommand: class HeadBucketCommand {
    constructor() {}
  },
  CreateBucketCommand: class CreateBucketCommand {
    constructor() {}
  },
  PutBucketEncryptionCommand: class PutBucketEncryptionCommand {
    constructor() {}
  },
  PutPublicAccessBlockCommand: class PutPublicAccessBlockCommand {
    constructor() {}
  },
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({
      $metadata: {},
      ETag: 'mock-etag',
      Location: 'mock-location',
    }),
  })),
  mockSend, // Export mockSend for tests
};
