/**
 * Client-side authentication utilities
 * Note: All JWT validation happens server-side for security
 */

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  createdAt: string;
}

/**
 * Checks if user has a token (client-side check only)
 * Real validation happens server-side
 */
export function hasAuthToken(): boolean {
  const token = localStorage.getItem('authToken');
  return !!token;
}

/**
 * Gets the auth token for API requests
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Gets current user data from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Clears authentication data from localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

/**
 * Verifies a JWT token and returns user data if valid
 * This is a client-side utility that makes an API call to verify the token
 */
export async function verifyToken(): Promise<{ valid: boolean; user?: any }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { valid: false };
    }

    const response = await fetch('/api/auth/verify-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { valid: true, user: data.user };
    } else {
      return { valid: false };
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return { valid: false };
  }
}

/**
 * Creates axios config with authentication headers
 * Use this for protected API endpoints
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}
