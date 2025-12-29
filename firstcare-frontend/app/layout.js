// Root Layout – FirstCare Platform
// Sets up the global page structure shared across the app.
// Includes the Header, Footer, User Context, and global notification system.

"use client";
/**
 * Root Layout Component
 *
 * Wraps all pages with shared UI elements and global providers.
 * Ensures a consistent look and feel across the application.
 *
 * Features:
 *  • Global typography via Outfit font
 *  • Persistent Header and Footer
 *  • User context for authentication and profile state
 *  • Toast notifications for feedback (via Sonner)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render inside the layout
 * @returns {JSX.Element} Application root layout
 */

import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { checkEnvironment } from '@/lib/env-check';

checkEnvironment();

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <UserProvider>
          <div className="md:px-20">
            <Header />
            {children}
            <Toaster /> {/* This is the Sonner toaster */}
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}