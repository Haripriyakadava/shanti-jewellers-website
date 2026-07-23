import { getItem, StorageKeys } from '@/auth/storage';
import { getCurrentTenantId } from '@/lib/tenant';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * A fetch wrapper that automatically attaches the JWT Bearer token
 * and tenant ID header to outgoing requests.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getItem<string>(StorageKeys.ACCESS_TOKEN);
  const tenantId = await getCurrentTenantId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid or expired
      import('@/auth/authService').then(({ authService }) => {
        authService.logout();
        window.location.href = '/login';
      });
    }

    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Fallback if not JSON
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
