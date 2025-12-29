// /app/(route)/profile/medical/useMedicalProfile.js

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import {
    INITIAL_MEDICAL_DATA,
    INITIAL_NEW_CONDITION,
    INITIAL_NEW_ALLERGY,
    INITIAL_NEW_MEDICATION
} from './constants';

export const useMedicalProfile = () => {
    const router = useRouter();
    const { user, updateMedicalProfile } = useUser();

    // State management
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    // Medical data state
    const [medicalData, setMedicalData] = useState(INITIAL_MEDICAL_DATA);

    // Form states for adding new items
    const [newCondition, setNewCondition] = useState(INITIAL_NEW_CONDITION);
    const [newAllergy, setNewAllergy] = useState(INITIAL_NEW_ALLERGY);
    const [newMedication, setNewMedication] = useState(INITIAL_NEW_MEDICATION);

    // Load existing medical data
    useEffect(() => {
        if (user) {
            loadMedicalData();
        }
    }, [user]);

    const loadMedicalData = () => {
        try {
            setLoading(true);

            if (user.medicalHistory || user.allergies || user.healthcarePreferences) {
                setMedicalData({
                    medicalHistory: user.medicalHistory || INITIAL_MEDICAL_DATA.medicalHistory,
                    allergies: user.allergies || INITIAL_MEDICAL_DATA.allergies,
                    healthcarePreferences: user.healthcarePreferences || INITIAL_MEDICAL_DATA.healthcarePreferences
                });
            }
        } catch (err) {
            console.error('Error loading medical data:', err);
            setError('Failed to load medical profile. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    // Save medical profile
    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Validate required fields
            if (!medicalData.medicalHistory.bloodType) {
                setError('Please select your blood type for emergency care');
                setSaving(false);
                return;
            }

            const result = await updateMedicalProfile(medicalData);

            if (result.message || result.user) {
                setSuccess('Medical profile updated successfully! This helps KZN healthcare providers give you better care.');

                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);
            } else {
                setError(result.error || 'Failed to save medical profile');
            }
        } catch (err) {
            console.error('Error saving medical profile:', err);
            setError(err.message || 'Failed to save medical profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Condition handlers
    const handleAddCondition = () => {
        if (!newCondition.name.trim()) {
            setError('Please enter a condition name');
            return;
        }

        setMedicalData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                conditions: [
                    ...prev.medicalHistory.conditions,
                    newCondition
                ]
            }
        }));

        setNewCondition(INITIAL_NEW_CONDITION);
    };

    const handleRemoveCondition = (index) => {
        setMedicalData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                conditions: prev.medicalHistory.conditions.filter((_, i) => i !== index)
            }
        }));
    };

    // Allergy handlers
    const handleAddAllergy = () => {
        if (!newAllergy.allergen.trim()) {
            setError('Please enter an allergen');
            return;
        }

        setMedicalData(prev => ({
            ...prev,
            allergies: [
                ...prev.allergies,
                newAllergy
            ]
        }));

        setNewAllergy(INITIAL_NEW_ALLERGY);
    };

    const handleRemoveAllergy = (index) => {
        setMedicalData(prev => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index)
        }));
    };

    // Medication handlers
    const handleAddMedication = () => {
        if (!newMedication.name.trim() || !newMedication.dosage.trim() || !newMedication.frequency.trim()) {
            setError('Please fill all medication fields');
            return;
        }

        setMedicalData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                chronicMedications: [
                    ...prev.medicalHistory.chronicMedications,
                    newMedication
                ]
            }
        }));

        setNewMedication(INITIAL_NEW_MEDICATION);
    };

    const handleRemoveMedication = (index) => {
        setMedicalData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                chronicMedications: prev.medicalHistory.chronicMedications.filter((_, i) => i !== index)
            }
        }));
    };

    // Step navigation
    const handleNext = () => {
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // Update form data
    const updateMedicalData = (updates) => {
        setMedicalData(prev => ({ ...prev, ...updates }));
    };

    const updateHealthcarePreferences = (updates) => {
        setMedicalData(prev => ({
            ...prev,
            healthcarePreferences: { ...prev.healthcarePreferences, ...updates }
        }));
    };

    return {
        // State
        loading,
        saving,
        error,
        success,
        activeStep,
        medicalData,
        newCondition,
        newAllergy,
        newMedication,

        // Setters
        setNewCondition,
        setNewAllergy,
        setNewMedication,

        // Actions
        handleSave,
        handleAddCondition,
        handleRemoveCondition,
        handleAddAllergy,
        handleRemoveAllergy,
        handleAddMedication,
        handleRemoveMedication,
        handleNext,
        handleBack,

        // Update functions
        updateMedicalData,
        updateHealthcarePreferences,

        // Navigation
        setActiveStep
    };
};