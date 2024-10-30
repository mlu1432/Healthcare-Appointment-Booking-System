// This component handles the password reset process for the healthcare appointment booking application.
// Users can request a password reset email to regain access to their account if they forget their credentials.

import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle Email Change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle Password Reset Request
  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError("Unable to send password reset email. Please try again.");
      setMessage(""); // Clear any previous messages
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm relative">
        {/* Background Image */}
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
          Reset Your Password
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordReset();
          }}
        >
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#F06255] text-white py-2 rounded-full hover:bg-[#e05045] transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Display success or error messages */}
        {message && <p className="text-green-500 text-center mt-4">{message}</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <div className="flex items-center justify-between mt-6">
          <span className="text-gray-500">Remember your password?</span>
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-[#F06255] underline font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}