/**
 * useDistrictDetection Hook – KZN Healthcare System
 *
 * @module hooks/useDistrictDetection
 * @version 2.0.0
 * @description
 * Provides automatic detection of the user's district within KwaZulu-Natal (KZN)
 * using the browser's geolocation API and a backend mapping endpoint.
 *
 * Core Features:
 *  • Automatic detection when the component mounts
 *  • Manual retry option through an exposed function
 *  • Toast-based feedback for success and errors
 *  • Graceful handling of denied permissions and timeouts
 *  • Fallback to default district when detection fails
 *
 * @returns {Object} Detection state and helper methods
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useDistrictDetection = () => {
    const [district, setDistrict] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [lastDetection, setLastDetection] = useState(null);

    /**
     * Default fallback district when detection fails
     */
    const getDefaultDistrict = () => ({
        id: 'ethekwini',
        name: 'eThekwini Metropolitan Municipality',
        displayName: 'eThekwini',
        coordinates: { lat: -29.8587, lng: 31.0218 }, // Durban coordinates
        fullAddress: 'eThekwini, KwaZulu-Natal, South Africa',
        detectionSource: 'default',
        timestamp: new Date().toISOString(),
        isFallback: true
    });

    /**
     * Attempts to detect the user's current district using geolocation data
     */
    const detectDistrict = async () => {
        // Prevent repeated detections within a short time frame (1 minute)
        if (lastDetection && Date.now() - lastDetection < 60000) {
            console.log("District detection skipped (recent detection)");
            return district;
        }

        setIsDetecting(true);

        try {
            // Show loading toast while detection runs
            const loadingToast = toast.loading("Detecting your KZN district...");

            // Request current location from the browser
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false, // Better reliability
                    timeout: 10000,
                    maximumAge: 300000, // Use cached position if available (max 5 minutes old)
                });
            });

            const { latitude, longitude } = position.coords;
            console.log(`User coordinates: ${latitude}, ${longitude}`);

            // Query backend for district details based on coordinates
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(
                `${API_BASE}/api/location/district?lat=${latitude}&lng=${longitude}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (data.success && data.district) {
                // Success case
                const districtInfo = {
                    id: data.district,
                    name: data.displayName,
                    displayName: data.displayName,
                    coordinates: data.coordinates,
                    fullAddress: data.fullAddress,
                    detectionSource: data.detectionSource || 'api',
                    timestamp: data.timestamp,
                    confidence: data.confidence,
                    usedFallback: data.usedFallback || false,
                    isFallback: false
                };

                setDistrict(districtInfo);
                setLastDetection(Date.now());

                toast.dismiss(loadingToast);

                if (data.usedFallback) {
                    toast.info(`Using approximate district: ${districtInfo.displayName}`);
                } else {
                    toast.success(`Detected your district: ${districtInfo.displayName}`);
                }

                console.log(`District detection successful: ${districtInfo.displayName}`);
                return districtInfo;
            } else {
                // Handle backend errors gracefully
                console.warn('District detection API returned error:', data);

                // Use fallback district
                const fallbackDistrict = getDefaultDistrict();
                fallbackDistrict.coordinates = { lat: latitude, lng: longitude };

                setDistrict(fallbackDistrict);
                setLastDetection(Date.now());

                toast.dismiss(loadingToast);
                toast.info(`Using default district: ${fallbackDistrict.displayName}`);

                return fallbackDistrict;
            }
        } catch (error) {
            console.error("District detection failed:", error);

            let errorMessage = "Could not detect your KZN district.";
            let useFallback = true;

            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = "Location access denied. Please enable location permissions to detect your district.";
                useFallback = true;
            } else if (error.code === error.TIMEOUT) {
                errorMessage = "Location detection timed out. Please check your connection and try again.";
                useFallback = true;
            } else if (error.message.includes("KZN")) {
                errorMessage = "Your location appears to be outside KwaZulu-Natal. District detection is limited to the KZN region.";
                useFallback = true;
            } else if (error.message.includes("Network")) {
                errorMessage = "Network error. Please check your internet connection.";
                useFallback = true;
            }

            // Use fallback district
            if (useFallback) {
                const fallbackDistrict = getDefaultDistrict();
                setDistrict(fallbackDistrict);
                setLastDetection(Date.now());
                toast.info(`Using default district: ${fallbackDistrict.displayName}`);
                return fallbackDistrict;
            } else {
                toast.error(errorMessage);
                return null;
            }
        } finally {
            setIsDetecting(false);
        }
    };

    /**
     * Manually sets a district (used when detection is skipped or overridden)
     */
    const setDistrictManual = (districtData) => {
        if (districtData && districtData.id && districtData.displayName) {
            const enhancedDistrict = {
                ...districtData,
                detectionSource: 'manual',
                timestamp: new Date().toISOString(),
                isFallback: false
            };
            setDistrict(enhancedDistrict);
            toast.success(`District set to: ${enhancedDistrict.displayName}`);
        }
    };

    /**
     * Reset district to null
     */
    const resetDistrict = () => {
        setDistrict(null);
        setLastDetection(null);
    };

    /**
     * Automatically attempt detection when the component mounts
     */
    useEffect(() => {
        if (typeof window !== "undefined" && "geolocation" in navigator) {
            // Only auto-detect if no district is set and user hasn't recently denied
            const hasDeniedPreviously = localStorage.getItem('location_permission_denied');

            if (!district && !hasDeniedPreviously) {
                console.log("Starting automatic district detection...");
                detectDistrict().catch(error => {
                    if (error.code === error.PERMISSION_DENIED) {
                        localStorage.setItem('location_permission_denied', 'true');
                    }
                });
            }
        }
    }, []);

    return {
        district,
        isDetecting,
        detectDistrict,
        setDistrict: setDistrictManual,
        resetDistrict
    };
};

export default useDistrictDetection;