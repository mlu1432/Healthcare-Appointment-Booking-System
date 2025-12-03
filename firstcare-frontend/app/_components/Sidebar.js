"use client";

/**
 * SIDEBAR COMPONENT - FIRSTCARE KZN HEALTHCARE PLATFORM
 * =====================================================
 * 
 * COMPONENT: AppSidebar
 * DESCRIPTION: Main navigation sidebar for the FirstCare healthcare platform
 * VERSION: 2.0.0
 * AUTHOR: FirstCare Development Team
 * 
 * OVERVIEW:
 * This sidebar provides intuitive navigation for healthcare services across KwaZulu-Natal.
 * It features medical specialty categories, quick action buttons, and responsive design
 * with smooth animations using Framer Motion.
 * 
 * KEY FEATURES:
 * - Medical specialty categories with appropriate icons
 * - Quick access to booking and registration
 * - Responsive design with hover animations
 * - Accessibility compliant (ARIA labels, keyboard navigation)
 * - Glassmorphic design with gradient backgrounds
 * - KZN healthcare district awareness
 * 
 * DEPENDENCIES:
 * - next/link: For client-side navigation
 * - framer-motion: For smooth animations
 * - lucide-react: For healthcare-related icons
 * 
 * USAGE:
 * <AppSidebar /> - Use in layout components for consistent navigation
 * 
 * PROPS: None (self-contained component)
 * 
 * STYLING:
 * - Uses Tailwind CSS for styling
 * - Responsive breakpoints: mobile-first design
 * - Color scheme matches FirstCare brand guidelines
 * 
 * ACCESSIBILITY:
 * - ARIA labels for all interactive elements
 * - Keyboard navigable
 * - Sufficient color contrast
 * - Focus indicators for keyboard users
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Heart,
  User,
  Eye,
  ClipboardList,
  Stethoscope,
  Brain,
  Smile,
  Baby,
  Activity,
  MapPin,
  Clock,
  Shield
} from "lucide-react";

/**
 * CATEGORY CONFIGURATION
 * 
 * Defines the medical specialty categories available in the sidebar.
 * Each category includes:
 * 
 * @property {string} title - Display name for the category
 * @property {string} url - Navigation route (matches app routing)
 * @property {React.Component} icon - Lucide React icon component
 * @property {string} color - Tailwind text color class for icon
 * @property {string} description - Short description for accessibility
 */
const MEDICAL_CATEGORIES = [
  {
    title: "Cardiologists",
    url: "/category/cardiologist",
    icon: Heart,
    color: "text-red-400",
    description: "Heart specialists and cardiovascular care"
  },
  {
    title: "Dentists",
    url: "/category/dentists",
    icon: Smile,
    color: "text-blue-400",
    description: "Oral health and dental care specialists"
  },
  {
    title: "General Practitioners",
    url: "/category/general-practitioner",
    icon: Stethoscope,
    color: "text-green-400",
    description: "Primary healthcare providers and family doctors"
  },
  {
    title: "Gynecologists",
    url: "/category/gynecologists",
    icon: Baby,
    color: "text-pink-400",
    description: "Women's health and reproductive specialists"
  },
  {
    title: "Ophthalmologists",
    url: "/category/ophthalmologist",
    icon: Eye,
    color: "text-purple-400",
    description: "Eye care and vision specialists"
  },
  {
    title: "Psychologists",
    url: "/category/psychologists",
    icon: Brain,
    color: "text-indigo-400",
    description: "Mental health and therapy specialists"
  },
  {
    title: "Pediatricians",
    url: "/category/pediatrician",
    icon: Baby,
    color: "text-teal-400",
    description: "Child healthcare specialists"
  },
  {
    title: "Dermatologists",
    url: "/category/dermatologist",
    icon: User,
    color: "text-orange-400",
    description: "Skin care and dermatology specialists"
  },
  {
    title: "Orthopedic Surgeons",
    url: "/category/orthopedic-surgeon",
    icon: Activity,
    color: "text-gray-400",
    description: "Bone and joint surgery specialists"
  },
  {
    title: "Physiotherapists",
    url: "/category/physiotherapist",
    icon: Activity,
    color: "text-cyan-400",
    description: "Physical therapy and rehabilitation"
  },
  {
    title: "Emergency Care",
    url: "/category/emergency-care",
    icon: Shield,
    color: "text-red-500",
    description: "Urgent medical treatment and emergency services"
  }
];

/**
 * ACTION BUTTONS CONFIGURATION
 * 
 * Defines the primary call-to-action buttons in the sidebar.
 */
const ACTION_BUTTONS = [
  {
    title: "Book Appointment",
    url: "/booking",
    icon: Calendar,
    description: "Schedule a medical appointment",
    gradient: "from-[#F06255] to-orange-500",
    subtext: "Quick & easy booking"
  },
  {
    title: "Patient Registration",
    url: "/auth/bookregister/register",
    icon: ClipboardList,
    description: "Register as a new patient",
    gradient: "from-[#0077B6] to-blue-600",
    subtext: "Join FirstCare KZN"
  }
];

/**
 * SIDEBAR HEADER COMPONENT
 * ------------------------
 * Displays the platform branding and basic information.
 * 
 * @returns {JSX.Element} Header section with logo and platform info
 */
const SidebarHeader = () => (
  <motion.div
    className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-100/50 mb-6"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {/* Logo/Icon */}
    <div className="bg-gradient-to-br from-green-500 to-blue-600 p-2 rounded-xl shadow-lg">
      <Activity className="w-6 h-6 text-white" />
    </div>

    {/* Platform Info */}
    <div className="flex-1 min-w-0">
      <h1 className="font-bold text-gray-900 text-lg leading-tight">
        FirstCare KZN
      </h1>
      <p className="text-gray-600 text-sm leading-tight">
        Healthcare Across KwaZulu-Natal
      </p>

      {/* Quick Stats */}
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>10 Districts</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>24/7 Care</span>
        </div>
      </div>
    </div>
  </motion.div>
);

/**
 * CATEGORY ITEM COMPONENT
 * -----------------------
 * Individual category item with icon, title, and navigation.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.category - Category configuration object
 * @returns {JSX.Element} Individual category navigation item
 */
const CategoryItem = ({ category }) => {
  const Icon = category.icon;

  return (
    <motion.div
      whileHover={{ x: 4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Link
        href={category.url}
        aria-label={`Navigate to ${category.title} - ${category.description}`}
        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-300 group cursor-pointer">
          {/* Icon Container */}
          <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-white group-hover:to-gray-50 group-hover:scale-110 transition-all duration-300 ${category.color} shadow-sm`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <span className="text-gray-800 font-medium text-sm group-hover:text-gray-900 block leading-tight">
              {category.title}
            </span>
            <span className="text-gray-500 text-xs hidden group-hover:block transition-opacity duration-200">
              {category.description}
            </span>
          </div>

          {/* Hover Indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors duration-200"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/**
 * ACTION BUTTON COMPONENT
 *
 * Primary call-to-action button for important user actions.
 * 
 * @param {Object} props - Component props  
 * @param {Object} props.button - Button configuration object
 * @returns {JSX.Element} Action button with gradient background
 */
const ActionButton = ({ button }) => {
  const Icon = button.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href={button.url}
        aria-label={button.description}
        className="block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 rounded-2xl"
      >
        <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${button.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
          {/* Icon with Glassmorphic Effect */}
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/20">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>

          {/* Button Content */}
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm block leading-tight">
              {button.title}
            </span>
            <p className="text-white/80 text-xs leading-tight">
              {button.subtext}
            </p>
          </div>

          {/* Animated Arrow Indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/**
 * SIDEBAR FOOTER COMPONENT
 * 
 * Displays additional information and branding in the sidebar footer.
 * 
 * @returns {JSX.Element} Footer section with campaign info
 */
const SidebarFooter = () => (
  <motion.div
    className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200/30 mt-6"
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transitionDelay={1000}
  >
    <div className="flex items-center gap-3">
      <div className="bg-green-500 p-2 rounded-lg shadow-sm">
        <Activity className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 text-sm font-semibold leading-tight">
          #AsibeHealthyKZN
        </p>
        <p className="text-gray-500 text-xs leading-tight">
          Building a Healthier KwaZulu-Natal Together
        </p>
      </div>
    </div>

    {/* Additional Info */}
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200/30">
      <span className="text-gray-400 text-xs">
        Verified Providers
      </span>
      <span className="text-gray-400 text-xs">
        Secure & Private
      </span>
    </div>
  </motion.div>
);

/**
 * MAIN SIDEBAR COMPONENT - AppSidebar
 * 
 * Primary navigation sidebar for the FirstCare healthcare platform.
 * 
 * FEATURES:
 * - Medical specialty categories with icons
 * - Quick action buttons for booking and registration
 * - Responsive design with smooth animations
 * - Accessibility compliant
 * - Brand-consistent styling
 * 
 * @returns {JSX.Element} Complete sidebar navigation component
 */
export function AppSidebar() {
  return (
    <div
      className="
        w-72 
        bg-white/80 
        backdrop-blur-xl 
        border-r 
        border-gray-200/50 
        shadow-xl 
        h-screen 
        overflow-y-auto 
        flex 
        flex-col
        scrollbar-thin 
        scrollbar-thumb-gray-300 
        scrollbar-track-transparent
        hover:scrollbar-thumb-gray-400
      "
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Content Container */}
      <div className="flex-1 flex flex-col p-4">

        {/* Header Section */}
        <SidebarHeader />

        {/* Navigation Sections */}
        <div className="flex-1 flex flex-col space-y-6">

          {/* Medical Categories Section */}
          <section aria-labelledby="categories-heading">
            <div className="px-2 mb-4">
              <h2
                id="categories-heading"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Medical Specialties
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Find healthcare providers by specialty
              </p>
            </div>

            {/* Categories List */}
            <nav aria-label="Medical specialties">
              <div className="space-y-1">
                {MEDICAL_CATEGORIES.map((category, index) => (
                  <CategoryItem
                    key={category.title}
                    category={category}
                  />
                ))}
              </div>
            </nav>
          </section>

          {/* Action Buttons Section */}
          <section aria-labelledby="actions-heading" className="mt-auto">
            <div className="px-2 mb-4">
              <h2
                id="actions-heading"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Quick Actions
              </h2>
            </div>

            <div className="space-y-3">
              {ACTION_BUTTONS.map((button, index) => (
                <ActionButton
                  key={button.title}
                  button={button}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer Section */}
        <SidebarFooter />
      </div>
    </div>
  );
}

/**
 * SIDEBAR PROVIDER COMPONENT
 * 
 * Context provider for sidebar state management.
 * This is a simplified version that can be expanded for complex state needs.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Sidebar context provider
 */
export function SidebarProvider({ children }) {
  return (
    <div className="flex">
      {/* Sidebar will be rendered alongside children */}
      {children}
    </div>
  );
}

// Export the main sidebar component as default
export default AppSidebar;