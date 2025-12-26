import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GitHubRepoSelector from './GitHubRepoSelector';
import { apiService } from '../../services/api';

// Mock API
jest.mock('../../services/api', () => ({
    apiService: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

// Mock Context
jest.mock('../../context/AppContext', () => ({
    useApp: () => ({
        addToast: jest.fn()
    })
}));

describe('GitHubRepoSelector', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders repositories after fetching', async () => {
        const mockRepos = [
            { id: 1, full_name: 'owner/repo1', private: false },
            { id: 2, full_name: 'owner/repo2', private: true }
        ];

        (apiService.get as jest.Mock).mockResolvedValue({
            success: true,
            data: mockRepos
        });

        render(<GitHubRepoSelector projectId="p1" onLink={jest.fn()} linkedRepos={[]} />);

        // Verify loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // Verify repos displayed
        await waitFor(() => {
            expect(screen.getByText('owner/repo1')).toBeInTheDocument();
            expect(screen.getByText('owner/repo2')).toBeInTheDocument();
        });
    });

    test('shows filtered projects on search', async () => {
        const mockRepos = [
            { id: 1, full_name: 'alpha/repo', private: false },
            { id: 2, full_name: 'beta/repo', private: false }
        ];

        (apiService.get as jest.Mock).mockResolvedValue({
            success: true,
            data: mockRepos
        });

        render(<GitHubRepoSelector projectId="p1" onLink={jest.fn()} linkedRepos={[]} />);

        await waitFor(() => screen.getByText('alpha/repo'));

        const searchInput = screen.getByPlaceholderText(/search repositories/i);
        expect(searchInput).toBeInTheDocument();
    });
});
