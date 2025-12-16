const API_URL = ''; // Use Vite proxy configured in vite.config.ts

// Helper for fetch options with credentials
const getFetchOptions = (options: RequestInit = {}): RequestInit => {
    const token = localStorage.getItem('accessToken');
    const headers: any = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return {
        ...options,
        credentials: 'include',
        headers,
    };
};

export interface VaultFile {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'image' | 'video' | 'audio';
    extension?: string;
    size?: string;
    modifiedDate?: string;
    thumbnail?: string;
    url?: string;
    viewLink?: string;
    iconLink?: string;
    mimeType?: string;
}

export const vaultApi = {
    // List files in a folder
    listFiles: async (folderId?: string): Promise<VaultFile[]> => {
        const url = folderId
            ? `${API_URL}/api/vault/files?folderId=${folderId}`
            : `${API_URL}/api/vault/files`;

        const response = await fetch(url, getFetchOptions());

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch files: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.data;
    },

    // Upload a file
    uploadFile: async (file: File, folderId?: string): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) {
            formData.append('folderId', folderId);
        }

        const response = await fetch(`${API_URL}/api/vault/upload`, getFetchOptions({
            method: 'POST',
            body: formData,
        }));

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        return await response.json();
    },

    // Download a file
    downloadFile: async (fileId: string, fileName: string): Promise<void> => {
        const response = await fetch(`${API_URL}/api/vault/download/${fileId}`, getFetchOptions());

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Get file view URL (for preview)
    getFileViewUrl: (fileId: string): string => {
        const token = localStorage.getItem('accessToken');
        const baseUrl = `${API_URL}/api/vault/view/${fileId}`;
        return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
    },

    // Delete a file
    deleteFile: async (fileId: string): Promise<void> => {
        const response = await fetch(`${API_URL}/api/vault/files/${fileId}`, getFetchOptions({
            method: 'DELETE',
        }));

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }
    },

    // Rename a file
    renameFile: async (fileId: string, newName: string): Promise<any> => {
        const response = await fetch(`${API_URL}/api/vault/files/${fileId}`, getFetchOptions({
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newName }),
        }));

        if (!response.ok) {
            throw new Error('Failed to rename file');
        }

        return await response.json();
    },

    // Create a folder
    createFolder: async (name: string, parentFolderId?: string): Promise<any> => {
        const response = await fetch(`${API_URL}/api/vault/folders`, getFetchOptions({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, parentFolderId }),
        }));

        if (!response.ok) {
            throw new Error('Failed to create folder');
        }

        return await response.json();
    },
};
