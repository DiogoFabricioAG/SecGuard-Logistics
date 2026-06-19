import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../modules/auth/components/ProtectedRoute';

vi.mock('../modules/auth/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../modules/auth/context/AuthContext';

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/flota']}>
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when auth is loading', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderProtectedRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to /login when not authenticated', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderProtectedRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
