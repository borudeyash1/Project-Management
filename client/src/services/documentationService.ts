import api from './api';

export interface DocArticle {
    _id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
    subcategory?: string;
    videoUrl?: string;
    order: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

// Public API - Get all published documentation
export const getAllDocs = async (category?: string): Promise<DocArticle[]> => {
    const url = category && category !== 'all' ? `/docs?category=${category}` : '/docs';
    const response = await api.get(url);
    return response.data || [];
};

// Public API - Get single documentation by slug
export const getDocBySlug = async (slug: string): Promise<DocArticle | null> => {
    try {
        const response = await api.get(`/docs/${slug}`);
        return response.data || null;
    } catch (error) {
        console.error('Error fetching doc by slug:', error);
        return null;
    }
};

// Admin API - Get all documentation (including unpublished)
export const getAdminDocs = async (category?: string): Promise<DocArticle[]> => {
    const url = category && category !== 'all' ? `/docs/admin/all?category=${category}` : '/docs/admin/all';
    const response = await api.get(url);
    return response.data || [];
};

// Admin API - Create new documentation
export const createDoc = async (doc: Partial<DocArticle>): Promise<DocArticle> => {
    const response = await api.post('/docs/admin/create', doc);
    return response.data;
};

// Admin API - Update documentation
export const updateDoc = async (id: string, doc: Partial<DocArticle>): Promise<DocArticle> => {
    const response = await api.put(`/docs/admin/${id}`, doc);
    return response.data;
};

// Admin API - Delete documentation
export const deleteDoc = async (id: string): Promise<void> => {
    await api.delete(`/docs/admin/${id}`);
};
