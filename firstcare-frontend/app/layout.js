// Root layout component to provide consistent page structure across all pages
// Includes Header, Footer, and general HTML structure

import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { Toaster } from "sonner";

// Corrected declaration
const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "FirstCare - Healthcare Appointment Booking",
  description: "Book Appointments With Trusted Healthcare Experts Easily.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="md:px-20">
          {/* Header component to include consistent navigation */}
          <Header />
          
          {/* Page Content */}
          {children}

          {/* Toaster component for displaying notifications */}
          <Toaster />

          {/* Footer component included for all pages */}
          <Footer />
        </div>
      </body>
    </html>
  );
}