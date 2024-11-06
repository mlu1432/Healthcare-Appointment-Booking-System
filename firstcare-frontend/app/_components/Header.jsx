// Header.jsx
// This Header component provides navigation links and an authentication button for users. 
// The button dynamically changes from "Sign In" to "Sign Out" based on the user's authentication status.
// Uses Next.js Image component for logo, Link for navigation, and router for navigation actions.
// Authentication status is simulated with localStorage and tracked via a `isSignedIn` state, 
// which would ideally be replaced with actual authentication logic in a real application.

"use client"; // Mark this component as a Client Component

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function Header() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Simulated check for user authentication status (this would usually come from context or a global state)
  useEffect(() => {
    // Replace this with real authentication logic
    const userAuthenticated = localStorage.getItem("isSignedIn") === "true";
    setIsSignedIn(userAuthenticated);
  }, []);

  const handleAuthAction = () => {
    if (isSignedIn) {
      // Sign out logic here
      localStorage.setItem("isSignedIn", "false");
      setIsSignedIn(false);
      // Optionally redirect to home or another page after sign out
      router.push("/");
    } else {
      // Navigate to Sign In page
      router.push("/auth/signIn");
    }
  };

  return (
    <header className="bg-[#F06255] py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Image src="/logoipsum-298.svg" alt="Logo" width={55} height={55} />
        
        {/* Navigation Links */}
        <nav>
          <ul className="flex gap-6 text-white">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/explore">Explore</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </nav>

        {/* Auth Button */}
        <button
          className="bg-white text-[#F06255] px-4 py-2 rounded-full"
          onClick={handleAuthAction}
        >
          {isSignedIn ? "Sign Out" : "Sign In"}
        </button>
      </div>
    </header>
  );
}

export default Header;