/**
 * User Context for Healthcare Appointment Booking System
 * Enhanced with request debouncing and loop prevention
 * 
 * @file contexts/UserContext.js
 * @description Manages global user authentication state with optimized session verification
 * 
 * Key Features:
 * - Debounced session verification to prevent API spam
 * - Request deduplication for concurrent calls
 * - Optimized re-render prevention
 * - Comprehensive error handling
 * - Memory leak prevention
 * 
 * Performance Optimizations:
 * - Request throttling (2-second minimum between verifications)
 * - Concurrent call prevention
 * - Cleanup on component unmount
 * - Optimized dependency arrays
 * 
 * Security Features:
 * - Secure token management
 * - Automatic session cleanup
 * - Protected state updates
 * 
 * @version 3.2.0
 * @module UserContext
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { userService } from '@/lib/userService';

const UserContext = createContext();

/**
 * UserProvider Component
 * 
 * Provides global user authentication state management with optimized
 * session verification and request deduplication.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} User context provider
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Refs for request management and state tracking
  const verificationInProgress = useRef(false);
  const initializationDone = useRef(false);
  const lastVerificationTime = useRef(0);
  const verificationTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Verify user session with backend with request debouncing
   * 
   * Implements:
   * - Request throttling (2-second minimum between calls)
   * - Concurrent call prevention
   * - Error boundary protection
   * 
   * @returns {Promise<Object|null>} User data or null if not authenticated
   */
  const verifySession = useCallback(async () => {
    // Component unmount protection
    if (!mountedRef.current) {
      console.log('Component unmounted, skipping verification');
      return null;
    }

    // Prevent multiple simultaneous verifications
    if (verificationInProgress.current) {
      console.log('Verification already in progress, skipping duplicate call');
      return null;
    }

    // Throttle requests - minimum 2 seconds between calls
    const now = Date.now();
    if (now - lastVerificationTime.current < 2000) {
      console.log('Verification throttled: too soon since last call');
      return null;
    }

    verificationInProgress.current = true;
    lastVerificationTime.current = now;

    try {
      // Use the user service to get current user data
      const data = await userService.getCurrentUser();
      console.log('User data fetched:', data);

      if (data.user) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Session verification error:', error);
      return null;
    } finally {
      verificationInProgress.current = false;
    }
  }, []);

  /**
   * Refresh access token with error handling
   * 
   * @returns {Promise<string|null>} New access token or null if refresh fails
   */
  const refreshToken = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }, []);

  /**
   * Handle OAuth callback with simplified flow
   * 
   * Processes OAuth redirects and verifies session establishment
   * 
   * @returns {Promise<boolean>} True if OAuth was handled, false otherwise
   */
  const handleOAuthCallback = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('auth') === 'success';
    const oauthError = urlParams.get('error');

    if (oauthError) {
      console.error('OAuth error:', oauthError);
      return false;
    }

    if (oauthSuccess || window.location.pathname === '/auth/success') {
      setIsAuthenticating(true);
      console.log('Handling OAuth callback...');

      try {
        // Allow time for cookies to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        const userData = await verifySession();
        if (userData) {
          console.log('OAuth callback - User authenticated:', userData);
          setUser(userData);

          // Clear OAuth parameters from URL
          if (window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
          }

          return true;
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
      } finally {
        setIsAuthenticating(false);
      }
    }

    return false;
  }, [verifySession]);

  /**
   * Single initialization function with mount protection
   * 
   * Ensures authentication initialization occurs only once
   * and handles both OAuth and regular session verification
   */
  const initializeAuth = useCallback(async () => {
    if (initializationDone.current || !mountedRef.current) {
      console.log('Auth initialization already completed or component unmounted');
      return;
    }

    try {
      setLoading(true);
      initializationDone.current = true;

      console.log('Starting auth initialization...');

      // Handle OAuth callback first
      const oauthHandled = await handleOAuthCallback();

      // If OAuth wasn't handled, perform regular session verification
      if (!oauthHandled) {
        console.log('Performing regular session verification...');
        const userData = await verifySession();

        if (userData) {
          console.log('Regular verification successful:', userData);
          setUser(userData);
        } else {
          console.log('No active session found');
          setUser(null);
        }
      }

    } catch (error) {
      console.error('Auth initialization error:', error);
      if (mountedRef.current) {
        setUser(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [verifySession, handleOAuthCallback]);

  /**
   * Primary authentication initialization effect
   * 
   * Runs once on component mount to establish initial auth state
   */
  useEffect(() => {
    mountedRef.current = true;
    initializeAuth();

    return () => {
      mountedRef.current = false;
    };
  }, [initializeAuth]);

  /**
   * Cleanup effect for resource management
   * 
   * Prevents memory leaks and ensures proper cleanup
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      initializationDone.current = false;

      // Clear any pending timeouts
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Complete user profile
   * 
   * @param {Object} profileData - Profile data to complete
   * @returns {Promise<Object>} Result from the API
   */
  const completeProfile = async (profileData) => {
    try {
      const result = await userService.completeProfile(profileData);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Complete profile error:', error);
      throw error;
    }
  };

  /**
   * Update medical profile
   * 
   * @param {Object} medicalData - Medical data to update
   * @returns {Promise<Object>} Result from the API
   */
  const updateMedicalProfile = async (medicalData) => {
    try {
      const result = await userService.updateMedicalProfile(medicalData);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Update medical profile error:', error);
      throw error;
    }
  };

  /**
   * Update user profile
   * 
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Result from the API
   */
  const updateProfile = async (profileData) => {
    try {
      if (!user?._id) throw new Error('No user ID available');
      const result = await userService.updateProfile(user._id, profileData);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  /**
   * User sign-out handler
   * 
   * Clears local state and invokes backend logout
   * 
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      console.log('User signed out successfully');

    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Reset all state regardless of backend response
      setUser(null);
      setAccessToken(null);
      initializationDone.current = false;
      verificationInProgress.current = false;

      // Clear client-side storage
      localStorage.removeItem('userData');
      sessionStorage.removeItem('authToken');

      // Redirect to signin
      window.location.href = '/auth/signIn';
    }
  };

  /**
   * Force refresh user data from backend
   * 
   * Useful after profile updates or when fresh data is needed
   * 
   * @returns {Promise<Object|null>} Updated user data or null
   */
  const refreshUserData = async () => {
    try {
      console.log('Refreshing user data...');
      const userData = await verifySession();
      if (userData && mountedRef.current) {
        console.log('User data refreshed:', userData);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Refresh user data error:', error);
      return null;
    }
  };

  /**
   * Get current access token with automatic refresh
   * 
   * @returns {Promise<string|null>} Current access token
   */
  const getAccessToken = async () => {
    if (accessToken) {
      return accessToken;
    }

    const newToken = await refreshToken();
    return newToken;
  };

  /**
   * Check if user has specific role
   * 
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  /**
   * Check if user is authenticated
   * 
   * @returns {boolean} Authentication status
   */
  const isAuthenticated = () => {
    return !!user && !loading;
  };

  /**
   * Check if user profile is complete
   * 
   * @returns {boolean} Profile completion status
   */
  const isProfileComplete = () => {
    return user?.isProfileComplete || false;
  };

  /**
   * Update user profile data
   * 
   * @param {Object} updates - User data updates
   */
  const updateUser = (updates) => {
    if (mountedRef.current) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  /**
   * Context value object
   */
  const value = {
    // State
    user,
    loading: loading || isAuthenticating,

    // Actions
    signOut,
    refreshUserData,
    updateUser,
    completeProfile,
    updateMedicalProfile,
    updateProfile,

    // Token management
    getAccessToken,
    refreshToken,

    // Role and permission checks
    hasRole,
    isAuthenticated: isAuthenticated(),
    isProfileComplete,

    // Status
    isAuthenticating
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook to access user context
 * 
 * @returns {Object} User context value
 * @throws {Error} If used outside UserProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export default UserContext;