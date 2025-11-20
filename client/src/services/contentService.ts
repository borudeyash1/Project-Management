import api from './api';

export interface ContentBanner {
    _id: string;
    title: string;
    content: string;
    type: 'text' | 'image' | 'both';
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    height: number;
    placement: 'top' | 'bottom';
    routes: string[];
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    priority: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Get all banners (admin)
export const getAllBanners = async (): Promise<ContentBanner[]> => {
    const response = await api.get('/content/banners');
    console.log('API Response:', response);
    console.log('Response data:', response.data);
    // The API returns the array directly in response.data, not response.data.data
    return response.data || [];
};

// Get active banners for a specific route (public)
export const getActiveBanners = async (route: string): Promise<ContentBanner[]> => {
    console.log('[contentService] Fetching active banners for route:', route);
    const response = await api.get(`/content/banners/active?route=${encodeURIComponent(route)}`);
    console.log('[contentService] Active banners response:', response.data);
    return response.data.data || [];
};

// Create new banner (admin)
export const createBanner = async (data: Partial<ContentBanner>): Promise<ContentBanner> => {
    const response = await api.post('/content/banners', data);
    return response.data.data;
};

// Update banner (admin)
export const updateBanner = async (id: string, data: Partial<ContentBanner>): Promise<ContentBanner> => {
    const response = await api.put(`/content/banners/${id}`, data);
    return response.data.data;
};

// Delete banner (admin)
export const deleteBanner = async (id: string): Promise<void> => {
    await api.delete(`/content/banners/${id}`);
};

// Upload banner image
export const uploadBannerImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/content/banners/upload', formData);

    return response.data.url;
};
