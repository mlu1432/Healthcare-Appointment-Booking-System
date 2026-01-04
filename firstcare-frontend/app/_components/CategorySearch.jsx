"use client";

/**
 * CATEGORY SEARCH COMPONENT - FIRSTCARE PLATFORM (KZN HEALTHCARE)
 * 
 * Description:
 * - Displays searchable medical categories integrated with backend API
 * - Includes automatic KZN district detection with toast notifications
 * - Contains responsive search bar, KZN coverage badge, and category cards
 * - Integrates with /api/healthcare/facilities and /api/healthcare/doctors endpoints
 * 
 * Features:
 * - Dynamic category loading matching backend appointment categories
 * - Automatic KZN district detection using useDistrictDetection hook
 * - Healthcare facility and doctor search integration
 * - Profile completion validation before allowing searches
 * - Responsive layout for all screen sizes
 * - District-aware routing for category pages
 * 
 * @component
 * @version 3.2.0
 * @author Healthcare System - KZN Implementation
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaTooth, FaRunning } from 'react-icons/fa';
import {
  Search,
  MapPin,
  Stethoscope,
  Heart,
  Eye,
  Brain,
  Baby,
  Bone,
  AlertTriangle,
  User,
  RefreshCw
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from 'sonner'; // Changed to Sonner
import { useDistrictDetection } from "@/hooks/useDistrictDetection";

/**
 * Medical categories that match backend appointment categories from Swagger
 * Aligned with backend enum: General Practitioner, Dentist, Cardiologist, etc.
 */
const MEDICAL_CATEGORIES = [
  {
    id: "general-practitioner",
    title: "General Practitioner",
    description: "Primary Healthcare",
    icon: Stethoscope,
    backendCategory: "General Practitioner",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "gynecologists",
    title: "Gynecologist",
    description: "Women's Health",
    icon: Heart,
    backendCategory: "Obstetrician-Gynecologist",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50"
  },
  {
    id: "dentists",
    title: "Dentist",
    description: "Oral Health",
    icon: FaTooth,
    backendCategory: "Dentist",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    id: "psychologists",
    title: "Psychologist",
    description: "Mental Health",
    icon: Brain,
    backendCategory: "Psychologist",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    id: "cardiologist",
    title: "Cardiologist",
    description: "Heart Health",
    icon: Heart,
    backendCategory: "Cardiologist",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: "ophthalmologist",
    title: "Ophthalmologist",
    description: "Eye Care",
    icon: Eye,
    backendCategory: "Ophthalmologist",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    id: "pediatrician",
    title: "Pediatrician",
    description: "Child Health",
    icon: Baby,
    backendCategory: "Pediatrician",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50"
  },
  {
    id: "dermatologist",
    title: "Dermatologist",
    description: "Skin Care",
    icon: User,
    backendCategory: "Dermatologist",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    id: "orthopedic-surgeon",
    title: "Orthopedic Surgeon",
    description: "Bone & Joint",
    icon: Bone,
    backendCategory: "Orthopedic Surgeon",
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50"
  },
  {
    id: "physiotherapist",
    title: "Physiotherapist",
    description: "Physical Therapy",
    icon: FaRunning,
    backendCategory: "Physiotherapist",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50"
  },
  {
    id: "emergency-care",
    title: "Emergency Care",
    description: "Urgent Treatment",
    icon: AlertTriangle,
    backendCategory: "Emergency Care",
    color: "from-red-600 to-red-700",
    bgColor: "bg-red-50"
  }
];

/**
 * Category Card Component with District-Aware Routing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.category - Category configuration object
 * @param {Function} props.onClick - Click handler function
 * @returns {JSX.Element} Category card component
 */
const CategoryCard = ({ category, onClick }) => {
  const IconComponent = category.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(category)}
      className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl 
                 transition-all duration-300 cursor-pointer border border-gray-100
                 hover:border-blue-300 group"
    >
      {/* Category Icon with Gradient Background */}
      <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-xl ${category.bgColor} group-hover:scale-110 transition-transform duration-300`}>
        <IconComponent className={`w-8 h-8 ${category.color.replace('from-', 'text-').split(' ')[0]}`} />
      </div>

      {/* Category Title */}
      <h3 className="font-semibold text-gray-800 text-center mb-2 text-lg">
        {category.title}
      </h3>

      {/* Category Description */}
      <p className="text-sm text-gray-600 text-center">
        {category.description}
      </p>
    </motion.div>
  );
};

/**
 * Main Category Search Component
 * 
 * @component
 * @returns {JSX.Element} Category search interface
 */
export default function CategorySearch() {
  const router = useRouter();
  const { user, getAccessToken, isProfileComplete } = useUser();
  const { district, isDetecting, detectDistrict } = useDistrictDetection();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("facilities"); // 'facilities' or 'doctors'

  /**
   * Handles category card click navigation with district parameter
   * Validates profile completion and redirects to category page with district filter
   * 
   * @async
   * @param {Object} category - Selected category object
   */
  const handleCardClick = async (category) => {
    if (!user) {
      toast.error("Please sign in to search for healthcare providers");
      router.push("/auth/signIn");
      return;
    }

    // Check if district is detected, if not try to detect first
    if (!district) {
      const detectingToast = toast.loading("Detecting your district for localized results...");
      const detectedDistrict = await detectDistrict();

      if (detectedDistrict) {
        toast.dismiss(detectingToast);
        toast.success(`Detected your district: ${detectedDistrict.displayName}`);
      } else {
        toast.dismiss(detectingToast);
        toast.warning("Proceeding with all districts. Enable location for localized results.");
      }
    }

    // Build URL with district parameter if available
    const districtParam = district ? `?district=${district.id}` : '';
    const categoryUrl = `/category/${category.id}${districtParam}`;

    console.log(`Routing to: ${categoryUrl}`);

    // Show routing toast
    toast.success(`Finding ${category.title.toLowerCase()} in ${district?.displayName || 'KZN'}...`);

    router.push(categoryUrl);
  };

  /**
   * Handles healthcare facility and doctor search with district filtering
   * Integrates with backend /api/healthcare/facilities and /api/healthcare/doctors endpoints
   * 
   * @async
   */
  const handleSearch = async () => {
    if (!user) {
      toast.error("Please sign in to search for healthcare providers");
      router.push("/auth/signIn");
      return;
    }

    if (!isProfileComplete()) {
      toast.error("Please complete your KZN healthcare profile first");
      router.push("/auth/bookregister/register");
      return;
    }

    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setLoading(true);

    const searchToast = toast.loading(`Searching for ${searchType}...`);

    try {
      const token = await getAccessToken();
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Build search query parameters with district filtering
      const searchParams = new URLSearchParams({
        search: searchQuery.trim(),
        district: district?.id || '',
        page: '1',
        limit: '20'
      });

      // Add specialty filter if searching for doctors
      if (searchType === 'doctors') {
        searchParams.append('specialty', searchQuery);
      }

      const endpoint = searchType === 'doctors' ? '/api/healthcare/doctors' : '/api/healthcare/facilities';

      const response = await fetch(`${API_BASE}${endpoint}?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        // Navigate to search results page with district data
        const resultsParams = new URLSearchParams({
          query: searchQuery.trim(),
          district: district?.id || '',
          type: searchType
        });

        router.push(`/search?${resultsParams.toString()}`);

        const resultCount = data.facilities?.length || data.doctors?.length || 0;

        toast.dismiss(searchToast);
        toast.success(`Found ${resultCount} results in ${district?.displayName || 'all districts'}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);

      toast.dismiss(searchToast);
      toast.error(`❌ ${error.message || 'Failed to search healthcare providers. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Enter key press in search input
   * 
   * @param {Object} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Handles search type toggle between facilities and doctors
   * 
   * @param {string} type - Search type ('facilities' or 'doctors')
   */
  const handleSearchTypeToggle = (type) => {
    setSearchType(type);
    toast.success(`Now searching for ${type === 'facilities' ? 'healthcare facilities' : 'doctors'}`);
  };

  /**
   * Manual district detection trigger
   */
  const handleManualDistrictDetection = async () => {
    const detectionToast = toast.loading("📍 Detecting your district...");
    const detected = await detectDistrict();

    if (detected) {
      toast.dismiss(detectionToast);
      toast.success(`Detected your district: ${detected.displayName}`);
    } else {
      toast.dismiss(detectionToast);
    }
  };

  // Animation Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6">
        {/* SECTION HEADER */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#003E65] mb-4">
            Find Healthcare Experts in KZN
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Connect with trusted medical specialists across KwaZulu-Natal's 10 health districts
          </p>

          {/* Location Badge with District Detection */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border ${district
              ? 'bg-green-100 text-green-700 border-green-300'
              : isDetecting
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-orange-100 text-orange-700 border-orange-300'
              }`}>
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                {district
                  ? `${district.displayName}`
                  : isDetecting
                    ? "Detecting your district..."
                    : "All KZN Districts"
                }
              </span>
            </div>

            {/* Manual Detection Button */}
            {!isDetecting && (
              <button
                onClick={handleManualDistrictDetection}
                disabled={isDetecting}
                className="inline-flex items-center gap-2 bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {district ? 'Redetect' : 'Detect District'}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* SEARCH BAR AREA */}
        <motion.div
          className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Search Type Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-300 p-1 shadow-sm">
            <button
              onClick={() => handleSearchTypeToggle('facilities')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${searchType === 'facilities'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Facilities
            </button>
            <button
              onClick={() => handleSearchTypeToggle('doctors')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${searchType === 'doctors'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Doctors
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                searchType === 'facilities'
                  ? `Search clinics, hospitals in ${district?.displayName || 'KZN'}...`
                  : `Search doctors in ${district?.displayName || 'KZN'}...`
              }
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent text-lg placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className={`px-8 py-4 rounded-xl transition-all duration-300 shadow-lg font-semibold text-lg whitespace-nowrap flex items-center gap-2 min-w-[160px] justify-center ${loading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : !searchQuery.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
              }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Stethoscope className="w-5 h-5" />
                Find {searchType === 'facilities' ? 'Facilities' : 'Doctors'}
              </>
            )}
          </button>
        </motion.div>

        {/* CATEGORIES GRID */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-center text-[#003E65] mb-6">
            Browse by Medical Specialty
          </h3>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {MEDICAL_CATEGORIES.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard
                  category={category}
                  onClick={handleCardClick}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* QUICK STATS SECTION */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-w-[120px]">
            <div className="text-2xl font-bold text-[#003E65]">280+</div>
            <div className="text-sm text-gray-600">Healthcare Facilities</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-w-[120px]">
            <div className="text-2xl font-bold text-[#003E65]">500+</div>
            <div className="text-sm text-gray-600">Qualified Doctors</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-w-[120px]">
            <div className="text-2xl font-bold text-[#003E65]">10</div>
            <div className="text-sm text-gray-600">Health Districts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-w-[120px]">
            <div className="text-2xl font-bold text-[#003E65]">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
        </motion.div>

        {/* CALL TO ACTION */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Need emergency assistance?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                toast.success("Redirecting to emergency booking...");
                router.push("/booking");
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-sm"
            >
              Emergency Appointment
            </button>
            <button
              onClick={() => {
                toast.success("Finding nearby facilities...");
                router.push(`/location/nearby?district=${district?.id || ''}`);
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-sm"
            >
              Nearby Facilities
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}