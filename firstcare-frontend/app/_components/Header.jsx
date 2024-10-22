import React from "react";
import Link from "next/link";
import Image from 'next/image';

function Header() {
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
        <button className="bg-white text-[#F06255] px-4 py-2 rounded-full">
          Sign In
        </button>
      </div>
    </header>
  );
}

export default Header;