/**
 * Search Page — Doctor Finder
 *
 * @file SearchPage.jsx
 * @description
 * This page handles the entire doctor search flow. It reads filters from the
 * URL (such as specialty, district, and location), calls the backend search API,
 * and displays the results in a clean card layout.
 *
 * Features:
 * - Uses Next.js Search Params to read user-selected filters
 * - Fetches matching doctors from the backend
 * - Handles loading, error, empty results, and success states
 * - Supports doctor filters like specialty, district, and GPS radius
 * - Includes placeholders for booking and viewing doctor profiles
 *
 * @version 1.0.0
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Extract search criteria from query params
    const specialty = searchParams.get('specialty');
    const district = searchParams.get('district');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Loads doctor search results whenever filters change.
     * If no specialty is provided, redirect the user back home.
     */
    useEffect(() => {
        if (!specialty) {
            router.push('/');
            return;
        }

        fetchDoctors();
    }, [specialty, district, lat, lng, radius]);

    /**
     * Fetches doctors from the backend using the filters
     * provided in the query params.
     */
    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query string
            const params = new URLSearchParams();
            params.append('specialty', specialty);
            params.append('limit', '50');

            if (district) params.append('district', district);
            if (lat && lng) {
                params.append('lat', lat);
                params.append('lng', lng);
                params.append('radius', radius || '5000');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/healthcare/doctors?${params.toString()}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }

            const data = await response.json();
            setDoctors(data.doctors || data.data || []);
        } catch (err) {
            console.error('Doctor search error:', err);
            setError('Failed to load search results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Placeholder: Book appointment flow
     * To be implemented in the main booking feature.
     */
    const handleBookAppointment = (doctorId) => {
        console.log('Book appointment for doctor:', doctorId);
        alert(`Booking flow for doctor ${doctorId} will be added soon.`);
    };

    /**
     * Placeholder: View doctor profile page
     */
    const handleViewProfile = (doctorId) => {
        console.log('View profile for doctor:', doctorId);
    };

    // ---------------------------------------------------------
    // Loading Screen
    // ---------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Searching for Doctors</h1>
                    <p className="text-gray-600">
                        Finding {specialty} specialists {district ? `in ${district}` : 'near you'}
                    </p>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Error State
    // ---------------------------------------------------------
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h1>
                    <p className="text-gray-600 mb-4">{error}</p>

                    <button
                        onClick={fetchDoctors}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Results Page
    // ---------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-gray-600">
                            {specialty} specialists {district ? `in ${district}` : 'near you'}
                        </p>

                        <p className="text-sm text-gray-500">
                            Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Results Grid */}
                {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor, index) => (
                            <div
                                key={doctor._id || doctor.id || index}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Doctor Image */}
                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    {doctor.image ? (
                                        <img
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-center">
                                            <div className="text-4xl mb-2">👨‍⚕️</div>
                                            <p>No Image</p>
                                        </div>
                                    )}
                                </div>

                                {/* Doctor Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {doctor.name || 'Doctor Name'}
                                    </h3>

                                    <p className="text-blue-600 font-medium mb-2">
                                        {doctor.specialty || specialty}
                                    </p>

                                    {doctor.qualifications && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            {doctor.qualifications}
                                        </p>
                                    )}

                                    {doctor.facility && (
                                        <div className="mb-3">
                                            <p className="font-medium text-gray-900">{doctor.facility.name}</p>
                                            {doctor.facility.address && (
                                                <p className="text-sm text-gray-600">{doctor.facility.address}</p>
                                            )}
                                        </div>
                                    )}

                                    {doctor.contact?.phone && (
                                        <p className="text-sm text-gray-600 mb-4">📞 {doctor.contact.phone}</p>
                                    )}

                                    {doctor.consultationFee && (
                                        <p className="text-green-600 font-semibold mb-4">
                                            R{doctor.consultationFee}
                                        </p>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBookAppointment(doctor._id || doctor.id)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Book Appointment
                                        </button>

                                        <button
                                            onClick={() => handleViewProfile(doctor._id || doctor.id)}
                                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <div className="text-6xl mb-4">🔍</div>

                        <h2 className="text-2xl font-bold text-gray-600 mb-4">No doctors found</h2>

                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            We couldn't find any {specialty} specialists that match your search.
                            Try adjusting your filters or searching another area.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => router.push('/')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Back to Home
                            </button>

                            <button
                                onClick={fetchDoctors}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}