import React from 'react';
import Folder from './ui/Folder';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import { FileText, Image, Music } from 'lucide-react';

const FolderDemo: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SharedNavbar />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Folder Animation Demo</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 place-items-center">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold">Default Folder</h2>
              <Folder />
            </div>

            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold">Custom Color & Content</h2>
              <Folder 
                color="#FF4D4D" 
                size={1.2}
                items={[
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><FileText size={40} /></div>,
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Image size={40} /></div>,
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Music size={40} /></div>
                ]}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold">Small Green Folder</h2>
              <Folder color="#2ECC71" size={0.8} />
            </div>

            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold">Large Purple Folder</h2>
              <Folder color="#9B59B6" size={1.5} />
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default FolderDemo;
