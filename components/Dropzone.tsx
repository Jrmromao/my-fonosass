"use client"

import { Upload, X, FileIcon, File, AlertCircle } from "lucide-react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface DropzoneProps {
    onFilesAdded?: (files: File[]) => void
    maxFiles?: number
    maxSize?: number // in bytes
    accept?: Record<string, string[]>
    className?: string
}

export function Dropzone({
                             onFilesAdded,
                             maxFiles = 1,
                             maxSize = 10 * 1024 * 1024, // 10MB default
                             accept = {
                                 'application/pdf': ['.pdf'],
                                 'image/*': ['.png', '.jpg', '.jpeg'],
                             },
                             className
                         }: DropzoneProps) {
    const [files, setFiles] = useState<File[]>([])
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles.map(file => {
                if (file.size > maxSize) return "Arquivo muito grande"
                return "Tipo de arquivo não suportado"
            })
            setError(errors[0])
            return
        }

        if (files.length + acceptedFiles.length > maxFiles) {
            setError(`Máximo de ${maxFiles} arquivos permitidos`)
            return
        }

        const newFiles = [...files, ...acceptedFiles]
        setFiles(newFiles)
        setError(null)
        onFilesAdded?.(newFiles)
    }, [files, maxFiles, maxSize, onFilesAdded])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize,
        accept,
    })

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onFilesAdded?.(newFiles)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          cursor-pointer
          ${className}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-purple-500' : 'text-gray-400'}`} />
                    <p className="mt-2 text-sm text-center text-gray-600">
                        {isDragActive ? (
                            "Solte os arquivos aqui"
                        ) : (
                            <>
                                Arraste arquivos ou <span className="text-teal-700">clique para fazer upload</span>
                                <br />
                                <span className="text-xs text-gray-500">
                  Máximo de {maxFiles} arquivos (até {formatFileSize(maxSize)} cada)
                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 rounded-lg border bg-gray-50"
                        >
                            <FileIcon className="w-4 h-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}