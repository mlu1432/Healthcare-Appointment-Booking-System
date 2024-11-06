// firstcare-frontend/app/(route)/auth/auth.js
// This file combines the Sign-In, Sign-Up, and Google Authentication processes in a
// single component for a healthcare appointment booking application.
// It allows users to create a new account, log in using their existing credentials,
// or log in with their Google account.
// Firebase authentication is used to manage user credentials,
// and the form adapts dynamically for signing in or signing up.
"use client"; // Ensures this component runs on the client side

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import Image from "next/image";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config"; 

export default function Auth({ initialMode = "signIn" }) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(initialMode === "signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email and Password Handlers
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Handle Email Sign In
  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to the home page after successful sign-in
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // Handle Email Sign Up
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to the home page after successful sign-up
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/"); // Redirect to the home page after successful Google sign-in
    } catch (error) {
      console.error("Error with Google sign-in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm relative">
        {/* Background image */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/stethoscope.jpg"
            alt="Background image"
            layout="fill"
            style={{ objectFit: "cover" }}
            quality={100}
          />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        
        {/* Form for sign up or sign in */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            isSignUp ? handleSignUp() : handleSignIn();
          }}
        >
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Email address"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#F06255] text-white py-2 rounded-full hover:bg-[#e05045] transition"
          >
            {isSignUp ? "Sign Up" : "Continue"}
          </button>
        </form>

        {/* Toggle Sign In/Sign Up */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#F06255] underline font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* Google Sign In */}
        <div className="flex items-center mt-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center mt-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-200 transition"
        >
          <Image src="/google.svg" alt="Google logo" width={20} height={20} />
          <span className="ml-2">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}