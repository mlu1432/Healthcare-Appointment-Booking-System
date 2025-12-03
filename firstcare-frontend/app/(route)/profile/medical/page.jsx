




// /app/(route)/profile/medical/page.jsx

/**
 * Medical Profile Page for KwaZulu-Natal Healthcare System
 * 
 * Clean, maintainable version split into separate files
 */

"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMedicalProfile } from './useMedicalProfile';
import { StepProgress } from './components/StepProgress';
import { AlertMessage } from './components/AlertMessage';
import {
    MEDICAL_PROFILE_STEPS,
    KZN_COMMON_CONDITIONS,
    KZN_COMMON_ALLERGIES,
    KZN_COMMON_MEDICATIONS,
    KZN_MEDICAL_AID_SCHEMES,
    KZN_COMMUNICATION_OPTIONS,
    BLOOD_TYPES,
    CONDITION_CATEGORIES,
    ALLERGY_TYPES,
    MEDICATION_CATEGORIES,
    SEVERITY_LEVELS
} from './constants';

// Import step components
import Step1HealthProfile from './components/steps/Step1HealthProfile';
import Step2Allergies from './components/steps/Step2Allergies';
import Step3Medications from './components/steps/Step3Medications';
import Step4Preferences from './components/steps/Step4Preferences';
import Step5Review from './components/steps/Step5Review';

export default function MedicalProfilePage() {
    const router = useRouter();
    const {
        loading,
        saving,
        error,
        success,
        activeStep,
        medicalData,
        newCondition,
        newAllergy,
        newMedication,
        setNewCondition,
        setNewAllergy,
        setNewMedication,
        handleSave,
        handleAddCondition,
        handleRemoveCondition,
        handleAddAllergy,
        handleRemoveAllergy,
        handleAddMedication,
        handleRemoveMedication,
        handleNext,
        handleBack,
        updateMedicalData,
        updateHealthcarePreferences,
        setActiveStep
    } = useMedicalProfile();

    // Get step component
    const getStepComponent = () => {
        const props = {
            medicalData,
            newCondition,
            newAllergy,
            newMedication,
            setNewCondition,
            setNewAllergy,
            setNewMedication,
            handleAddCondition,
            handleRemoveCondition,
            handleAddAllergy,
            handleRemoveAllergy,
            handleAddMedication,
            handleRemoveMedication,
            updateMedicalData,
            updateHealthcarePreferences
        };

        const stepComponents = [
            <Step1HealthProfile key="step1" {...props} />,
            <Step2Allergies key="step2" {...props} />,
            <Step3Medications key="step3" {...props} />,
            <Step4Preferences key="step4" {...props} />,
            <Step5Review key="step5" {...props} />
        ];

        return stepComponents[activeStep] || stepComponents[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your medical profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center">
                        <Link
                            href="/profile"
                            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Medical Profile</h1>
                            <p className="text-gray-600">Manage your healthcare information for KwaZulu-Natal</p>
                        </div>
                    </div>
                </div>

                {/* Step Progress */}
                <StepProgress activeStep={activeStep} steps={MEDICAL_PROFILE_STEPS} />

                {/* Error/Success Messages */}
                {error && (
                    <AlertMessage
                        type="error"
                        message={error}
                        onClose={() => { }}
                    />
                )}

                {success && (
                    <AlertMessage
                        type="success"
                        message={success}
                        onClose={() => { }}
                    />
                )}

                {/* Main Form */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="p-6">
                        {getStepComponent()}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={activeStep === 0 ? () => router.push('/profile') : handleBack}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        disabled={saving}
                    >
                        {activeStep === 0 ? 'Cancel' : 'Back'}
                    </button>

                    <div className="flex gap-3">
                        {activeStep < MEDICAL_PROFILE_STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all font-medium shadow-sm"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Medical Profile'
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                        Your medical information is protected and used only to provide you with better healthcare services in KwaZulu-Natal.
                    </p>
                </div>
            </div>
        </div>
    );
}