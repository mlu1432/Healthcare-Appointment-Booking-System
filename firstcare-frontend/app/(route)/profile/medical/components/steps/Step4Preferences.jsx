// /app/(route)/profile/medical/components/steps/Step4Preferences.jsx

import {
    KZN_MEDICAL_AID_SCHEMES,
    KZN_COMMUNICATION_OPTIONS
} from '../../constants';

export default function Step4Preferences({
    medicalData,
    updateHealthcarePreferences
}) {
    return (
        <div className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-purple-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                            <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-purple-800">KZN Healthcare Preferences</h3>
                        <p className="text-sm text-purple-700 mt-1">
                            Customize your healthcare experience in KwaZulu-Natal's healthcare system.
                        </p>
                    </div>
                </div>
            </div>

            {/* Medical Aid Information */}
            <div className="space-y-4">
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={medicalData.healthcarePreferences.hasMedicalAid}
                            onChange={(e) => updateHealthcarePreferences({
                                hasMedicalAid: e.target.checked
                            })}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                            I have Medical Aid/Health Insurance
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                        Only about 15% of South Africans have medical aid. Most use public healthcare facilities.
                    </p>
                </div>

                {medicalData.healthcarePreferences.hasMedicalAid && (
                    <div className="ml-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medical Aid Scheme
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={medicalData.healthcarePreferences.medicalAidScheme}
                                onChange={(e) => updateHealthcarePreferences({
                                    medicalAidScheme: e.target.value
                                })}
                            >
                                <option value="">Select Medical Aid Scheme</option>
                                {KZN_MEDICAL_AID_SCHEMES.map(scheme => (
                                    <option key={scheme} value={scheme}>{scheme}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medical Aid Number
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={medicalData.healthcarePreferences.medicalAidNumber}
                                onChange={(e) => updateHealthcarePreferences({
                                    medicalAidNumber: e.target.value
                                })}
                                placeholder="Your medical aid membership number"
                            />
                        </div>
                    </div>
                )}

                {/* Primary Healthcare Facility */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary KZN Healthcare Facility (Optional)
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={medicalData.healthcarePreferences.primaryCareFacility}
                        onChange={(e) => updateHealthcarePreferences({
                            primaryCareFacility: e.target.value
                        })}
                        placeholder="e.g., Local clinic, community health center"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Which clinic or hospital do you usually visit in your KZN district?
                    </p>
                </div>

                {/* Communication Preferences */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Communication Method *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {KZN_COMMUNICATION_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => updateHealthcarePreferences({
                                    preferredCommunication: option.value
                                })}
                                className={`p-3 rounded-lg border ${medicalData.healthcarePreferences.preferredCommunication === option.value
                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium">{option.label}</span>
                                    <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Traditional Medicine Use (KZN-specific) */}
                <div className="pt-4 border-t">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={medicalData.healthcarePreferences.traditionalMedicineUse}
                            onChange={(e) => updateHealthcarePreferences({
                                traditionalMedicineUse: e.target.checked
                            })}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                            I use traditional/herbal medicines
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                        Many people in KZN use traditional medicines. It's important for healthcare providers to know.
                    </p>

                    {medicalData.healthcarePreferences.traditionalMedicineUse && (
                        <div className="mt-3 ml-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Traditional Medicines Used (Optional)
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="2"
                                value={medicalData.healthcarePreferences.traditionalMedicineDetails}
                                onChange={(e) => updateHealthcarePreferences({
                                    traditionalMedicineDetails: e.target.value
                                })}
                                placeholder="e.g., African potato, cancer bush, umuthi"
                            />
                        </div>
                    )}
                </div>

                {/* Consent Preferences */}
                <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700">Healthcare Consents</h4>

                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={medicalData.healthcarePreferences.appointmentReminders}
                                onChange={(e) => updateHealthcarePreferences({
                                    appointmentReminders: e.target.checked
                                })}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Receive appointment reminders
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={medicalData.healthcarePreferences.healthTips}
                                onChange={(e) => updateHealthcarePreferences({
                                    healthTips: e.target.checked
                                })}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Receive health tips and information
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={medicalData.healthcarePreferences.emergencyAccessConsent}
                                onChange={(e) => updateHealthcarePreferences({
                                    emergencyAccessConsent: e.target.checked
                                })}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Emergency medical access consent (recommended)
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={medicalData.healthcarePreferences.consentForResearch}
                                onChange={(e) => updateHealthcarePreferences({
                                    consentForResearch: e.target.checked
                                })}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Consent to participate in healthcare research (optional)
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={medicalData.healthcarePreferences.dataSharingConsent}
                                onChange={(e) => updateHealthcarePreferences({
                                    dataSharingConsent: e.target.checked
                                })}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Share data with KZN healthcare providers (recommended)
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}