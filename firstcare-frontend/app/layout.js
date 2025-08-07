// Root Layout Component (layout.js)
// Provides consistent page structure for all pages including Header, Footer, and global structure

"use client"; // Mark as a client-side component

import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <UserProvider>
          <div className="md:px-20">
            {/* Header for consistent navigation */}
            <Header />
            {children}
            {/* Toaster for notifications */}
            <Toaster />
            {/* Footer included on all pages */}
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
