import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate upload progress for each file
    for (let i = 0; i < uploadFiles.length; i++) {
      if (uploadFiles[i].status !== 'pending') continue;

      setUploadFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' } : f
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress } : f
        ));
      }

      setUploadFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'success', progress: 100 } : f
      ));
    }

    setIsUploading(false);
    
    // Call the actual upload handler
    try {
      await onUpload(uploadFiles.map(f => f.file));
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  const allUploaded = uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'success');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-2xl border border-[#2C2C2C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2C2C2C]">
          <h2 className="text-xl font-bold text-white">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2C2C2C] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-[#2C2C2C] hover:border-blue-500/50 hover:bg-blue-500/5'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-400">
              or click to browse from your computer
            </p>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
              {uploadFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[#202020] rounded-lg border border-[#2C2C2C]"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : uploadFile.status === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : uploadFile.status === 'uploading' ? (
                      <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                    ) : (
                      <File className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {uploadFile.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {uploadFile.status === 'uploading' && (
                        <p className="text-xs text-blue-400">
                          {uploadFile.progress}%
                        </p>
                      )}
                      {uploadFile.status === 'success' && (
                        <p className="text-xs text-green-400">Uploaded</p>
                      )}
                      {uploadFile.status === 'error' && (
                        <p className="text-xs text-red-400">{uploadFile.error || 'Failed'}</p>
                      )}
                    </div>
                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="w-full h-1 bg-[#2C2C2C] rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {uploadFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-[#2C2C2C] rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#2C2C2C]">
          <p className="text-sm text-gray-400">
            {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white rounded-lg font-medium transition-colors"
            >
              {allUploaded ? 'Done' : 'Cancel'}
            </button>
            {!allUploaded && uploadFiles.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {uploadFiles.length} File{uploadFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
