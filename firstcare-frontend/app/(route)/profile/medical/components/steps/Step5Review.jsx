// /app/(route)/profile/medical/components/steps/Step5Review.jsx

export default function Step5Review({
    medicalData
}) {
    // Helper function to get severity color
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'mild': return 'text-green-600';
            case 'moderate': return 'text-yellow-600';
            case 'severe': return 'text-orange-600';
            case 'critical': return 'text-red-600';
            case 'anaphylactic': return 'text-red-700';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Review Your KZN Medical Profile</h3>
                        <p className="text-sm text-green-700 mt-1">
                            Review your information before saving. This helps KZN healthcare providers give you better care.
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Medical Summary */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Medical Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Blood Type:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.medicalHistory.bloodType || 'Not specified'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">HIV Status:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.medicalHistory.hivStatus ?
                                        medicalData.medicalHistory.hivStatus.replace('-', ' ') : 'Not specified'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">TB History:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.medicalHistory.tbHistory ?
                                        medicalData.medicalHistory.tbHistory.replace('-', ' ') : 'Not specified'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Conditions:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.medicalHistory.conditions.length} recorded
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Allergies:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.allergies.length} recorded
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Medications:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.medicalHistory.chronicMedications.length} recorded
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Healthcare Preferences */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Healthcare Preferences</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Medical Aid:</span>
                                <span className="text-sm font-medium">
                                    {medicalData.healthcarePreferences.hasMedicalAid ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {medicalData.healthcarePreferences.hasMedicalAid && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Scheme:</span>
                                        <span className="text-sm font-medium">
                                            {medicalData.healthcarePreferences.medicalAidScheme}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Number:</span>
                                        <span className="text-sm font-medium">
                                            {medicalData.healthcarePreferences.medicalAidNumber || 'Not provided'}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Communication:</span>
                                <span className="text-sm font-medium capitalize">
                                    {medicalData.healthcarePreferences.preferredCommunication}
                                </span>
                            </div>
                            {medicalData.healthcarePreferences.primaryCareFacility && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Primary Facility:</span>
                                    <span className="text-sm font-medium">
                                        {medicalData.healthcarePreferences.primaryCareFacility}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conditions List */}
                {medicalData.medicalHistory.conditions.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Medical Conditions</h4>
                        <div className="space-y-2">
                            {medicalData.medicalHistory.conditions.map((condition, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                    <div>
                                        <span className="font-medium">{condition.name}</span>
                                        <span className={`ml-2 text-sm ${getSeverityColor(condition.severity)}`}>
                                            ({condition.severity})
                                        </span>
                                        {condition.isActive && (
                                            <span className="ml-2 text-sm text-green-600">• Active</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Allergies List */}
                {medicalData.allergies.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Allergies</h4>
                        <div className="space-y-2">
                            {medicalData.allergies.map((allergy, index) => (
                                <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded">
                                    <div>
                                        <span className="font-medium">{allergy.allergen}</span>
                                        <span className={`ml-2 text-sm ${getSeverityColor(allergy.severity)}`}>
                                            ({allergy.severity})
                                        </span>
                                        {allergy.requiresEpipen && (
                                            <span className="ml-2 text-sm text-red-600">• Epipen required</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Medications List */}
                {medicalData.medicalHistory.chronicMedications.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Medications</h4>
                        <div className="space-y-2">
                            {medicalData.medicalHistory.chronicMedications.map((med, index) => (
                                <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                                    <div>
                                        <span className="font-medium">{med.name}</span>
                                        <span className="ml-2 text-sm text-gray-600">{med.dosage}</span>
                                        <span className="ml-2 text-sm text-gray-600">• {med.frequency}</span>
                                        {med.isActive && (
                                            <span className="ml-2 text-sm text-green-600">• Currently taking</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Consents Granted */}
                <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Consents Granted</h4>
                    <div className="flex flex-wrap gap-2">
                        {medicalData.healthcarePreferences.emergencyAccessConsent && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Emergency Access
                            </span>
                        )}
                        {medicalData.healthcarePreferences.appointmentReminders && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Appointment Reminders
                            </span>
                        )}
                        {medicalData.healthcarePreferences.consentForResearch && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Research Participation
                            </span>
                        )}
                        {medicalData.healthcarePreferences.dataSharingConsent && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Data Sharing
                            </span>
                        )}
                        {medicalData.healthcarePreferences.traditionalMedicineUse && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                Traditional Medicine Use
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Important Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>This information helps KZN healthcare providers deliver safe, appropriate care</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Emergency services will have access to critical information if needed</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>You can update this information anytime in your profile</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}