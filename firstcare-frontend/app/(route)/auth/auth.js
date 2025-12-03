/**
 * Authentication Component for Healthcare Appointment Booking System
 * 
 * @file firstcare-frontend/app/(route)/auth/auth.js
 * @description Handles user authentication flows with JWT tokens
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function Auth({ initialMode = "signIn" }) {
  const router = useRouter();
  const { user, loading, refreshUserData, isAuthenticated } = useUser();

  // State Management
  const [isSignUp, setIsSignUp] = useState(initialMode === "signUp");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('User is authenticated, redirecting...');
      // Redirect based on profile completion
      if (user?.isProfileComplete) {
        router.push("/");
      } else {
        router.push("/auth/bookregister/register");
      }
    }
  }, [user, loading, isAuthenticated, router]);

  /**
   * Calculate password strength on change
   */
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError("");
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (passwordStrength < 60) {
        setError("Password is too weak. Please use a stronger password.");
        return false;
      }

      if (!formData.firstName || !formData.lastName) {
        setError("First and last name are required");
        return false;
      }
    }

    return true;
  };

  /**
   * Handles email/password authentication with JWT
   */
  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';

      const payload = {
        email: formData.email,
        password: formData.password,
        recaptchaToken: "dev-mode-bypass" // Bypass for development
      };

      if (isSignUp) {
        payload.firstName = formData.firstName;
        payload.lastName = formData.lastName;
      }

      console.log('Sending auth request to:', `${API_BASE}${endpoint}`);

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();

      console.log('Auth response:', data);

      if (response.ok) {
        // Force refresh user data
        await refreshUserData();

        // Show success message
        setError("");

        // Redirect based on success
        if (isSignUp) {
          // For signup, redirect to profile completion
          router.push("/auth/bookregister/register");
        } else {
          // For signin, redirect based on profile completion
          if (data.user?.isProfileComplete) {
            router.push("/");
          } else {
            router.push("/auth/bookregister/register");
          }
        }
      } else {
        throw new Error(data.error || data.message || `Authentication failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(getFriendlyErrorMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth authentication
   */
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const googleAuthUrl = `${API_BASE}/api/auth/google`;

      console.log('Redirecting to Google OAuth:', googleAuthUrl);
      window.location.href = googleAuthUrl;

    } catch (error) {
      console.error("Google sign-in initiation error:", error);
      setError("Failed to start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  /**
   * Converts error codes to user-friendly messages
   */
  const getFriendlyErrorMessage = (errorMessage) => {
    const errorMap = {
      "Invalid email": "Please enter a valid email address",
      "User not found": "No account found with this email",
      "Incorrect password": "Incorrect password. Please try again.",
      "Email already exists": "This email is already registered. Please sign in instead.",
      "Weak password": "Password must be at least 8 characters with a mix of letters, numbers, and symbols",
      "Network error": "Network error. Please check your internet connection.",
      "Too many requests": "Too many attempts. Please try again in a few minutes.",
      "Security verification failed": "Security verification failed. Please try again.",
      "USER_EXISTS": "An account with this email already exists.",
      "INVALID_CREDENTIALS": "Invalid email or password.",
      "VALIDATION_ERROR": "Please check your input and try again.",
      "default": "Authentication failed. Please try again."
    };

    // Find matching error message
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return errorMap.default;
  };

  /**
   * Gets password strength color and feedback
   */
  const getPasswordStrengthInfo = () => {
    if (passwordStrength >= 80) return { color: "bg-green-500", text: "Strong" };
    if (passwordStrength >= 60) return { color: "bg-yellow-500", text: "Medium" };
    if (passwordStrength >= 40) return { color: "bg-orange-500", text: "Weak" };
    return { color: "bg-red-500", text: "Very Weak" };
  };

  const strengthInfo = getPasswordStrengthInfo();

  // Simple password strength calculator
  function getPasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    return Math.min(strength, 100);
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 py-8 px-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Medical-themed decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-teal-100 rounded-full opacity-50"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isSignUp ? "Create Your Account" : "Welcome to FirstCare"}
          </h2>

          <p className="text-center text-gray-600 mb-6">
            {isSignUp ? "Join us to manage your healthcare appointments" : "Sign in to access your healthcare portal"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-3.5 text-gray-500 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {isSignUp && formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className="text-xs font-medium">{passwordStrength}% ({strengthInfo.text})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${strengthInfo.color}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-3 top-3.5 text-gray-500 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (isSignUp && passwordStrength < 60)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isLoading || (isSignUp && passwordStrength < 60)
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </span>
              ) : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <Link
              href={isSignUp ? "/auth/signIn" : "/auth/signUp"}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Link>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-xs text-center text-gray-500">
            <p>By continuing, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}