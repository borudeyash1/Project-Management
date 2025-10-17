import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Paperclip, Link, History, Download } from 'lucide-react';

const DocumentsHubModal = () => {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('files');
  const [files, setFiles] = useState([
    { id: 1, name: 'requirements-v1.pdf', version: 'v1', size: '1.2 MB', updated: 'Oct 18' },
    { id: 2, name: 'wireframe-v2.fig', version: 'v2', size: '3.4 MB', updated: 'Oct 20' },
  ]);
  const [links, setLinks] = useState([
    { id: 1, title: 'Design Figma', url: 'https://figma.com/file/abc', added: 'Oct 19' }
  ]);

  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'documentsHub' });
  const showToast = (m,t='info') => dispatch({ type: 'ADD_TOAST', payload: { message: m, type: t } });
  if (!state.modals.documentsHub) return null;

  const onUpload = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(prev => [...prev, ...list.map((f, i) => ({ id: Date.now()+i, name: f.name, version: 'v1', size: `${(f.size/1024/1024).toFixed(1)} MB`, updated: 'Now' }))]);
    showToast('Files uploaded', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Documents Hub</h2>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pt-3 border-b border-border">
          <div className="flex items-center gap-2">
            <button className={`px-3 py-1.5 rounded-md text-sm ${tab==='files'?'bg-yellow-100':'hover:bg-slate-50 border border-border'}`} onClick={()=>setTab('files')}>Files</button>
            <button className={`px-3 py-1.5 rounded-md text-sm ${tab==='links'?'bg-yellow-100':'hover:bg-slate-50 border border-border'}`} onClick={()=>setTab('links')}>Links</button>
            <button className={`px-3 py-1.5 rounded-md text-sm ${tab==='versions'?'bg-yellow-100':'hover:bg-slate-50 border border-border'}`} onClick={()=>setTab('versions')}>Versions</button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {tab==='files' && (
            <div className="space-y-3">
              <label className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Upload Files
                <input type="file" multiple className="hidden" onChange={onUpload} />
              </label>
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-sm font-medium">{f.name}</div>
                        <div className="text-xs text-slate-500">{f.version} • {f.size} • {f.updated}</div>
                      </div>
                    </div>
                    <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm flex items-center gap-1">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==='links' && (
            <div className="space-y-2">
              {links.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-sm font-medium">{l.title}</div>
                      <div className="text-xs text-slate-500">{l.url} • {l.added}</div>
                    </div>
                  </div>
                  <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">Open</button>
                </div>
              ))}
            </div>
          )}
          {tab==='versions' && (
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="p-3 rounded-lg border border-border">
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-slate-500">{f.version} • {f.updated}</div>
                  <div className="mt-2 text-xs text-slate-500">Version history coming soon…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsHubModal;



