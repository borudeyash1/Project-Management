import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Asset {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  iconLink?: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: string, name: string}>>([{id: 'root', name: 'My Vault'}]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        localStorage.setItem('accessToken', tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        
        if (data.user?.modules?.vault?.isEnabled) {
          fetchAssets();
        }
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssets = async (folderId?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = folderId ? `/api/vault/folder/${folderId}` : '/api/vault/root';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    if (asset.type === 'folder') {
      setCurrentFolder(asset.id);
      setBreadcrumbs([...breadcrumbs, { id: asset.id, name: asset.name }]);
      fetchAssets(asset.id);
    } else if (asset.webViewLink) {
      window.open(asset.webViewLink, '_blank');
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const folderId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
    setCurrentFolder(folderId === 'root' ? null : folderId);
    fetchAssets(folderId === 'root' ? undefined : folderId);
  };

  const createNewFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/vault/folder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, parentId: currentFolder })
      });

      if (response.ok) {
        fetchAssets(currentFolder || undefined);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Sartthi Vault...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-error">
        <h2>Authentication Required</h2>
        <p>Please log in to Sartthi Project Management first.</p>
        <button onClick={() => window.location.href = 'http://localhost:3000'}>
          Go to Login
        </button>
      </div>
    );
  }

  const isVaultConnected = user?.modules?.vault?.isEnabled;

  if (!isVaultConnected) {
    return (
      <div className="connect-vault">
        <div className="connect-container">
          <div className="vault-icon">🔐</div>
          <h1>Activate Sartthi Vault</h1>
          <p>Secure, unlimited cloud storage for your workspace.</p>
          <p className="powered-by">Powered by Google Drive</p>
          <button className="btn-connect" onClick={() => {
            const token = localStorage.getItem('accessToken');
            window.location.href = `${API_URL}/api/auth/sartthi/connect-vault${token ? `?token=${token}` : ''}`;
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Connect Storage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-app">
      <header className="vault-header">
        <div className="header-left">
          <h1>🔐 Sartthi Vault</h1>
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.id}>
                <button onClick={() => handleBreadcrumbClick(index)} className="breadcrumb-btn">
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && <span className="separator">/</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={createNewFolder} className="btn-new">
            + New Folder
          </button>
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="btn-view">
            {viewMode === 'grid' ? '☰' : '⊞'}
          </button>
        </div>
      </header>

      <main className={`vault-content ${viewMode}`}>
        {assets.length === 0 ? (
          <div className="empty-state">
            <p>No files or folders yet</p>
            <button onClick={createNewFolder}>Create your first folder</button>
          </div>
        ) : (
          <div className="assets-container">
            {assets.map(asset => (
              <div key={asset.id} className="asset-card" onClick={() => handleAssetClick(asset)}>
                <div className="asset-icon">
                  {asset.type === 'folder' ? '📁' : '📄'}
                </div>
                <div className="asset-name">{asset.name}</div>
                {asset.type === 'file' && asset.size > 0 && (
                  <div className="asset-size">{(asset.size / 1024).toFixed(1)} KB</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
