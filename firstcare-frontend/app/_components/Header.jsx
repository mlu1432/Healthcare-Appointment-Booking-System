"use client";

/**
 * HEADER COMPONENT - FIRSTCARE
 *
 * Description:
 * - Modern, responsive header for the FirstCare Healthcare platform.
 * - Displays logo, navigation links, and authentication buttons.
 * - Supports mobile toggle menu and dynamic content based on user state.
 * - Features smooth animations using Framer Motion.
 * - Simplified authentication logic (no loading or isAuthenticated).
 *
 * Features:
 * - Fixed positioning with scroll-based background transition
 * - Responsive design with mobile hamburger menu
 * - User authentication state management
 * - Accessibility compliant
 * - Smooth animations for menu transitions and interactions
 *
 * Tech stack:
 * - Next.js (App Router)
 * - Tailwind CSS
 * - Framer Motion for animations
 * - lucide-react for icons (Menu / X)
 * - Custom useUser() from /contexts/UserContext
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Header() {
  const { user, signOut } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Scroll effect handler
   * Adds background blur and shadow when scrolled past 10px
   */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Navigation links configuration
   */
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Specialists", href: "/specialists" },
    { label: "Contact", href: "/contact" },
  ];

  /**
   * Animation Variants for Framer Motion
   */
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  const mobileNavItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-gradient-to-br from-green-900/90 to-blue-900/90 backdrop-blur-md shadow-md"
        : "bg-gradient-to-br from-green-900 to-blue-900"
        }`}
    >
      {/* Main Header Container */}
      <div className="w-full flex items-center justify-between px-4 md:px-8 py-4 max-w-[100%] mx-auto">

        {/* Logo Section */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/logoipsum-298.svg"
              alt="FirstCare Healthcare Logo"
              width={45}
              height={45}
              priority
            />
            <span className="text-xl font-semibold text-white">FirstCare</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8 text-white/90 text-sm font-medium">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.label}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link
                href={link.href}
                className="hover:text-white transition-colors duration-200 relative"
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Authentication Section */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  {/* Profile completion indicator */}
                  {!user.isProfileComplete && (
                    <div className="relative group">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        Complete your profile
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-yellow-100"></div>
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-sm text-white/80 block">
                      Hi, {user.firstName || "User"}
                    </span>
                    {!user.isProfileComplete && (
                      <span className="text-xs text-yellow-300 block">
                        Profile {user.profileCompletionPercentage || 0}% complete
                      </span>
                    )}
                  </div>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className="px-3 py-1.5 text-sm text-white bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors border border-blue-400/30 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Profile
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={signOut}
                    className="px-3 py-1.5 text-sm text-white bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors border border-red-400/30 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signIn"
                  className="text-sm px-4 py-1.5 text-white/80 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sign In
                </Link>
                <Link
                  href="/auth/signUp"
                  className="text-sm px-4 py-1.5 text-white bg-[#F06255] rounded-full hover:bg-[#e05045] transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay with AnimatePresence */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden bg-gradient-to-br from-green-900 to-blue-900 border-t border-white/10 shadow-lg w-full overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-3 text-white/90 text-sm">
              {/* Mobile Navigation Links */}
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={mobileNavItemVariants}
                >
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.hr
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 }}
                className="my-2 border-white/20"
              />

              {/* Mobile Authentication Section */}
              {user ? (
                <>
                  {/* User Info with Profile Completion Status */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={mobileNavItemVariants}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="text-white/80">
                      <div className="font-medium">Hi, {user.firstName || "User"}</div>
                      {!user.isProfileComplete && (
                        <div className="text-yellow-300 text-xs mt-1 flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          Profile {user.profileCompletionPercentage || 0}% complete
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Profile Link */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={mobileNavItemVariants}
                  >
                    <Link
                      href="/profile"
                      className="w-full text-left text-sm px-4 py-2 text-white bg-blue-500/20 rounded-full hover:bg-blue-500/30 border border-blue-400/30 transition-colors flex items-center gap-3 mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      My Profile
                    </Link>
                  </motion.div>

                  {/* Complete Profile Button (only show if incomplete) */}
                  {!user.isProfileComplete && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={mobileNavItemVariants}
                    >
                      <Link
                        href="/profile/complete"
                        className="w-full text-left text-sm px-4 py-2 text-white bg-yellow-500/20 rounded-full hover:bg-yellow-500/30 border border-yellow-400/30 transition-colors flex items-center gap-3 mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Complete Profile
                      </Link>
                    </motion.div>
                  )}

                  {/* Sign Out Button */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={mobileNavItemVariants}
                  >
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left text-sm px-4 py-2 text-white bg-red-500/20 rounded-full hover:bg-red-500/30 border border-red-400/30 transition-colors flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Sign In Link */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={mobileNavItemVariants}
                  >
                    <Link
                      href="/auth/signIn"
                      className="text-sm px-4 py-2 hover:text-white transition-colors block flex items-center gap-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sign In
                    </Link>
                  </motion.div>

                  {/* Sign Up Link */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={mobileNavItemVariants}
                  >
                    <Link
                      href="/auth/signUp"
                      className="text-sm px-4 py-2 text-white bg-[#F06255] rounded-full text-center hover:bg-[#e05045] transition-colors block flex items-center gap-3 justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Join Now
                    </Link>
                  </motion.div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;