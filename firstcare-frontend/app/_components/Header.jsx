// Header.jsx
// Header component to provide navigation links and Sign In button for users. Uses Next.js Image component for logo and Link for navigation.
// Marked as a Client Component to enable use of hooks like useRouter.

"use client"; // Mark this component as a Client Component

import React from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Corrected import from next/navigation

function Header() {
  const router = useRouter(); // Initialize router for programmatic navigation

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

        {/* Sign In Button */}
        <button
          className="bg-white text-[#F06255] px-4 py-2 rounded-full"
          onClick={() => router.push('/auth/signIn')} // Use router for navigation to Sign In page
        >
          Sign In
        </button>
      </div>
    </header>
  );
}

export default Header;