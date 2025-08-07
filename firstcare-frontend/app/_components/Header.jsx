// Header.jsx
// This Header component provides navigation links and an authentication button for users. 
// The button dynamically changes from "Sign In" to "Sign Out" based on the user's authentication status.
// Uses Next.js Image component for logo, Link for navigation, and router for navigation actions.
// Authentication status is simulated with localStorage and tracked via a `isSignedIn` state,

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function Header() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const userAuthenticated = localStorage.getItem("isSignedIn") === "true";
    setIsSignedIn(userAuthenticated);
  }, []);

  const handleAuthAction = () => {
    if (isSignedIn) {
      localStorage.setItem("isSignedIn", "false");
      setIsSignedIn(false);
      router.push("/");
    } else {
      router.push("/auth/signIn");
    }
  };

  return (
    <header className="bg-[#F06255] py-4 w-full">
      {/* Full width without container */}
      <div className="flex justify-between items-center px-8 w-full">
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
