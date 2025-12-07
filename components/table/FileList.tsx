'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import { ActivityWithFiles } from '@/types/activity';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileDown,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

interface FileListProps {
  files: NonNullable<ActivityWithFiles['files']>;
  activityId: string;
  activityName: string;
}

interface FileDownloadState {
  [fileId: string]: {
    isDownloading: boolean;
    downloadComplete: boolean;
    error: string | null;
  };
}

const FileList: React.FC<FileListProps> = ({
  files,
  activityId,
  activityName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadStates, setDownloadStates] = useState<FileDownloadState>({});

  const handleDownload = async (
    file: NonNullable<ActivityWithFiles['files']>[0]
  ) => {
    try {
      setDownloadStates((prev) => ({
        ...prev,
        [file.id]: {
          isDownloading: true,
          downloadComplete: false,
          error: null,
        },
      }));

      const result = await getFileDownloadUrl({ fileId: file.id });

      if (result.success) {
        // Create a temporary link element
        const link = document.createElement('a');
        //@ts-ignore
        link.href = result.url;
        link.setAttribute('download', file.name);

        // Required for Firefox
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Cleanup
        document.body.removeChild(link);

        // Show success state briefly
        setTimeout(() => {
          setDownloadStates((prev) => ({
            ...prev,
            [file.id]: {
              isDownloading: false,
              downloadComplete: true,
              error: null,
            },
          }));

          setTimeout(() => {
            setDownloadStates((prev) => ({
              ...prev,
              [file.id]: {
                isDownloading: false,
                downloadComplete: false,
                error: null,
              },
            }));
          }, 2000);
        }, 800);
      } else {
        setDownloadStates((prev) => ({
          ...prev,
          [file.id]: {
            isDownloading: false,
            downloadComplete: false,
            error: result.error || 'Download failed',
          },
        }));
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStates((prev) => ({
        ...prev,
        [file.id]: {
          isDownloading: false,
          downloadComplete: false,
          error: 'An unexpected error occurred',
        },
      }));
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'mp4':
      case 'avi':
        return '🎬';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📁';
    }
  };

  const getFileSize = (sizeInBytes: number) => {
    if (sizeInBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
    return (
      parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  };

  if (!files || files.length === 0) {
    return (
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <XCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Sem arquivos</span>
      </div>
    );
  }

  if (files.length === 1) {
    const file = files[0];
    const downloadState = downloadStates[file.id] || {
      isDownloading: false,
      downloadComplete: false,
      error: null,
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{getFileIcon(file.name)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getFileSize(file.sizeInBytes || 0)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(file)}
          disabled={downloadState.isDownloading}
          className="flex items-center gap-1"
        >
          {downloadState.isDownloading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className="text-xs">Baixando...</span>
            </>
          ) : downloadState.downloadComplete ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs">Baixado</span>
            </>
          ) : downloadState.error ? (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs">Erro</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              <span className="text-xs">Baixar</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {files.length} arquivo{files.length > 1 ? 's' : ''}
          </Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {activityName}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-3 space-y-2">
            {files.map((file, index) => {
              const downloadState = downloadStates[file.id] || {
                isDownloading: false,
                downloadComplete: false,
                error: null,
              };

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="text-lg">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getFileSize(file.sizeInBytes || 0)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={downloadState.isDownloading}
                    className="flex items-center gap-1"
                  >
                    {downloadState.isDownloading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <span className="text-xs">Baixando...</span>
                      </>
                    ) : downloadState.downloadComplete ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs">Baixado</span>
                      </>
                    ) : downloadState.error ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs">Erro</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        <span className="text-xs">Baixar</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileList;
