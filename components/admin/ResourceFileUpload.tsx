'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  s3Key?: string;
}

interface ResourceFileUploadProps {
  resourceId?: string;
  onFileUploaded?: (file: UploadedFile) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

export default function ResourceFileUpload({
  resourceId,
  onFileUploaded,
  maxFiles = 5,
  acceptedTypes = ['application/pdf', 'video/*', 'audio/*', 'image/*'],
  maxSize = 50 * 1024 * 1024, // 50MB
}: ResourceFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast({
          title: 'Erro',
          description: `Máximo de ${maxFiles} arquivos permitidos.`,
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);

      for (const file of acceptedFiles) {
        const fileId = Math.random().toString(36).substr(2, 9);
        const newFile: UploadedFile = {
          id: fileId,
          file,
          progress: 0,
          status: 'uploading',
        };

        setUploadedFiles((prev) => [...prev, newFile]);

        try {
          // Simulate file upload with progress
          const formData = new FormData();
          formData.append('file', file);
          formData.append('resourceId', resourceId || '');
          formData.append('fileType', file.type);

          const response = await fetch('/api/resources/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    progress: 100,
                    status: 'success',
                    url: result.url,
                    s3Key: result.s3Key,
                  }
                : f
            )
          );

          onFileUploaded?.({
            ...newFile,
            progress: 100,
            status: 'success',
            url: result.url,
            s3Key: result.s3Key,
          });

          toast({
            title: 'Sucesso',
            description: `Arquivo ${file.name} enviado com sucesso!`,
          });
        } catch (error) {
          console.error('Upload error:', error);

          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: 'error' } : f))
          );

          toast({
            title: 'Erro',
            description: `Falha ao enviar ${file.name}.`,
            variant: 'destructive',
          });
        }
      }

      setIsUploading(false);
    },
    [uploadedFiles.length, maxFiles, resourceId, onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    maxSize,
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📁';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive
                ? 'Solte os arquivos aqui'
                : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Máximo {maxFiles} arquivos, até {formatFileSize(maxSize)} cada
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Tipos aceitos: PDF, Vídeo, Áudio, Imagem
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Arquivos Enviados ({uploadedFiles.length}/{maxFiles})
          </h4>
          {uploadedFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">
                      {getFileIcon(file.file.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {file.file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.file.size)}
                      </p>
                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {file.progress}% enviado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'success' && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enviado
                      </Badge>
                    )}
                    {file.status === 'error' && (
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-600"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
