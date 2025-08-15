/**
 * firstcare-frontend/app/(route)/auth/auth.js
 * 
 * Authentication Component for Healthcare Appointment Booking System
 * 
 * This component handles user authentication flows including:
 * - Email/password sign-up
 * - Email/password sign-in
 * - Google OAuth sign-in
 * 
 * It integrates with Firebase Authentication for credential management
 * and communicates with the backend API to establish secure sessions.
 * 
 * Security Features:
 * - Token storage in HTTP-only cookies (XSS protection)
 * - Password strength enforcement
 * - User-friendly error handling
 * - Secure token transmission
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} [props.initialMode="signIn"] - Initial authentication mode ("signIn" or "signUp")
 * 
 * @example
 * // Render in sign-up mode
 * <Auth initialMode="signUp" />
 * 
 * @version 1.1.0
 * @author Lucas Sekwati
 * @created 2023-08-15
 * @last-modified 2023-10-18
 */

"use client"; // Client-side component for Next.js

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import Image from "next/image";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getIdToken
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config";

export default function Auth({ initialMode = "signIn" }) {
  const router = useRouter();
  
  // State Management
  const [isSignUp, setIsSignUp] = useState(initialMode === "signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles email input changes
   * @param {Object} e - Change event object
   */
  const handleEmailChange = (e) => setEmail(e.target.value);

  /**
   * Handles password input changes
   * @param {Object} e - Change event object
   */
  const handlePasswordChange = (e) => setPassword(e.target.value);

  /**
   * Authenticates users via email/password
   * 
   * Handles both sign-up and sign-in flows:
   * 1. Validates credentials with Firebase
   * 2. Retrieves ID token from Firebase
   * 3. Establishes secure session with backend
   * 4. Redirects to homepage on success
   * 
   * @param {boolean} isSignUpAction - True for sign-up, false for sign-in
   * @async
   */
  const handleEmailAuth = async (isSignUpAction) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Firebase authentication
      const userCredential = isSignUpAction
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      // Get Firebase ID token
      const token = await getIdToken(userCredential.user);
      
      // Establish secure session with backend
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      // Handle backend response errors
      if (!response.ok) {
        throw new Error("Backend session creation failed");
      }

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      console.error("Authentication error:", error);
      setError(getFriendlyErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth authentication
   * 
   * Flow:
   * 1. Launches Google sign-in popup
   * 2. Retrieves Firebase ID token
   * 3. Establishes secure session with backend
   * 4. Redirects to homepage on success
   * 
   * @async
   */
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Google sign-in via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get Firebase ID token
      const token = await getIdToken(result.user);
      
      // Establish secure session with backend
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      // Handle backend response errors
      if (!response.ok) {
        throw new Error("Backend session creation failed");
      }

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(getFriendlyErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Converts Firebase error codes to user-friendly messages
   * 
   * @param {string} errorCode - Firebase authentication error code
   * @returns {string} Human-readable error message
   */
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "Email already registered";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/popup-closed-by-user":
        return "Google sign-in cancelled";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      default:
        return "Authentication failed. Please try again";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm relative">
        {/* Semi-transparent background image */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/stethoscope.jpg"
            alt="Medical background"
            layout="fill"
            style={{ objectFit: "cover" }}
            quality={100}
          />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>
        
        {/* Authentication header */}
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}
        
        {/* Authentication form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailAuth(isSignUp);
          }}
          aria-label={isSignUp ? "Sign up form" : "Sign in form"}
        >
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Email address"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
            aria-required="true"
            aria-label="Email address"
          />
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
            minLength={6}
            aria-required="true"
            aria-label="Password"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#F06255] hover:bg-[#e05045]"
            } text-white py-2 rounded-full transition duration-300`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </span>
            ) : isSignUp ? "Sign Up" : "Continue"}
          </button>
        </form>

        {/* Toggle between sign-in/sign-up */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#F06255] underline font-medium focus:outline-none focus:ring-2 focus:ring-[#F06255] rounded"
            aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* OAuth separator */}
        <div className="flex items-center mt-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        {/* Google sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={`w-full flex items-center justify-center mt-4 py-2 border border-gray-300 rounded-full ${
            isLoading ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"
          } transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300`}
          aria-label="Sign in with Google"
        >
          <Image 
            src="/google.svg" 
            alt="Google logo" 
            width={20} 
            height={20} 
            aria-hidden="true"
          />
          <span className="ml-2">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}