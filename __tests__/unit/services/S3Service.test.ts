import S3Service from '@/services/S3Service';

// Get the mock functions from the mocked modules
const { mockSend } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

describe('S3Service', () => {
  let s3Service: S3Service;

  beforeEach(() => {
    s3Service = S3Service.getInstance();
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockResponse = { ETag: 'test-etag' };
      const mockUploadInstance = { done: jest.fn().mockResolvedValue(mockResponse) };
      
      // Mock the Upload constructor to return our mock instance
      Upload.mockImplementation(() => mockUploadInstance);

      const result = await s3Service.uploadFile('test.pdf', Buffer.from('test content'), 'application/pdf');

      expect(result).toEqual(mockResponse);
      expect(mockUploadInstance.done).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const mockError = new Error('Upload failed');
      const mockUploadInstance = { done: jest.fn().mockRejectedValue(mockError) };
      
      // Mock the Upload constructor to return our mock instance
      Upload.mockImplementation(() => mockUploadInstance);

      await expect(s3Service.uploadFile('test.pdf', Buffer.from('test content'), 'application/pdf'))
        .rejects.toThrow('Failed to upload file with key test.pdf: Upload failed');
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      const mockResponse = { Body: Buffer.from('test content') };
      mockSend.mockResolvedValue(mockResponse);

      const result = await s3Service.downloadFile('company123', 'test.pdf');

      expect(result).toEqual(mockResponse);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
      const mockError = new Error('Download failed');
      mockSend.mockRejectedValue(mockError);

      await expect(s3Service.downloadFile('company123', 'test.pdf'))
        .rejects.toThrow('Failed to download file for company company123: Download failed');
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const mockResponse = { Contents: [{ Key: 'test.pdf', Size: 1024 }] };
      mockSend.mockResolvedValue(mockResponse);

      const result = await s3Service.listFiles('company123', 'prefix/');

      expect(result).toEqual(mockResponse.Contents);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle list errors', async () => {
      const mockError = new Error('List failed');
      mockSend.mockRejectedValue(mockError);

      await expect(s3Service.listFiles('company123', 'prefix/'))
        .rejects.toThrow('Failed to list files for company company123: List failed');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      mockSend.mockResolvedValue({});

      await s3Service.deleteFile('company123', 'test.pdf');

      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Delete failed');
      mockSend.mockRejectedValue(mockError);

      await expect(s3Service.deleteFile('company123', 'test.pdf'))
        .rejects.toThrow('Failed to delete file for company company123: Delete failed');
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      mockSend.mockResolvedValue({});

      const result = await s3Service.testConnection();

      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      mockSend.mockRejectedValue(new Error('Connection failed'));

      const result = await s3Service.testConnection();

      expect(result).toBe(false);
    });
  });
});