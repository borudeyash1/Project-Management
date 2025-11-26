import React from 'react';
import { Upload } from 'lucide-react';

interface DropzoneOverlayProps {
  isActive: boolean;
}

const DropzoneOverlay: React.FC<DropzoneOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="border-4 border-dashed border-blue-500 rounded-2xl p-16 bg-blue-500/10"
        style={{
          borderWidth: '4px',
          borderStyle: 'dashed',
          borderColor: '#3B82F6',
          borderRadius: '1rem',
          padding: '4rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-16 h-16 text-blue-400" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Drop to Upload</h3>
            <p className="text-blue-200">Release to upload your files</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropzoneOverlay;
