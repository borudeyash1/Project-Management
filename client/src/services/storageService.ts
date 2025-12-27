import { apiService } from './api';

export interface StorageFile {
    id: string;
    name: string;
    type: 'folder' | 'file';
    size?: number;
    modified?: string;
    path: string;
    path_display: string;
}

export interface DownloadResponse {
    link: string;
    metadata: any;
}

export const storageService = {
    listFiles: async (provider: string, path: string = ''): Promise<StorageFile[]> => {
        const response = await apiService.post(`/storage/${provider}/list`, { path });
        return response.data;
    },

    uploadFile: async (provider: string, file: File, path: string = ''): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);
        // Uses apiService.upload which handles FormData and multipart/form-data headers
        return await apiService.upload(`/storage/${provider}/upload`, formData);
    },

    createFolder: async (provider: string, path: string): Promise<any> => {
        const response = await apiService.post(`/storage/${provider}/folder`, { path });
        return response.data;
    },

    deleteFile: async (provider: string, path: string): Promise<any> => {
        const response = await apiService.post(`/storage/${provider}/delete`, { path });
        return response.data;
    },

    getDownloadLink: async (provider: string, path: string): Promise<DownloadResponse> => {
        const response = await apiService.post(`/storage/${provider}/download`, { path });
        return response.data;
    }
};
