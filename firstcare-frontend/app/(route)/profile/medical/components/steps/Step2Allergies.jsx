// /app/(route)/profile/medical/components/steps/Step2Allergies.jsx

import {
    KZN_COMMON_ALLERGIES,
    ALLERGY_TYPES,
    SEVERITY_LEVELS
} from '../../constants';

export default function Step2Allergies({
    medicalData,
    newAllergy,
    setNewAllergy,
    handleAddAllergy,
    handleRemoveAllergy
}) {
    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">KZN Allergy Information</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            KZN's coastal climate increases certain allergies. Accurate allergy information is crucial for your safety.
                        </p>
                    </div>
                </div>
            </div>

            {/* Allergies Form */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergen</label>
                        <input
                            type="text"
                            list="kzn-allergies"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newAllergy.allergen}
                            onChange={(e) => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                            placeholder="Type or select common KZN allergen"
                        />
                        <datalist id="kzn-allergies">
                            {KZN_COMMON_ALLERGIES.map(allergy => (
                                <option key={allergy.name} value={allergy.name} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergy Type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newAllergy.type}
                            onChange={(e) => setNewAllergy(prev => ({ ...prev, type: e.target.value }))}
                        >
                            {ALLERGY_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newAllergy.severity}
                            onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
                        >
                            {SEVERITY_LEVELS.allergy.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Observed</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newAllergy.firstObserved}
                            onChange={(e) => setNewAllergy(prev => ({ ...prev, firstObserved: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reaction Description</label>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        value={newAllergy.reaction}
                        onChange={(e) => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                        placeholder="Describe the reaction you experience"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="requiresEpipen"
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={newAllergy.requiresEpipen}
                            onChange={(e) => setNewAllergy(prev => ({ ...prev, requiresEpipen: e.target.checked }))}
                        />
                        <label htmlFor="requiresEpipen" className="ml-2 text-sm text-gray-700">
                            Requires Epipen (for severe/anaphylactic reactions)
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddAllergy}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Allergy
                    </button>
                </div>
            </div>

            {/* Current Allergies List */}
            {medicalData.allergies.length > 0 ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Your Allergies</h4>
                        <span className="text-sm text-gray-500">
                            {medicalData.allergies.length} recorded
                        </span>
                    </div>
                    {medicalData.allergies.map((allergy, index) => (
                        <div key={index} className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-2">
                                    <span className="font-medium">{allergy.allergen}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${allergy.severity === 'mild' ? 'bg-green-100 text-green-800' :
                                            allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                allergy.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {allergy.severity}
                                    </span>
                                    {allergy.requiresEpipen && (
                                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                            Epipen Required
                                        </span>
                                    )}
                                </div>
                                {allergy.reaction && (
                                    <p className="text-sm text-gray-600 mt-1">{allergy.reaction}</p>
                                )}
                                {allergy.firstObserved && (
                                    <p className="text-xs text-gray-500 mt-1">First observed: {allergy.firstObserved}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveAllergy(index)}
                                className="ml-4 text-red-600 hover:text-red-800"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No allergies recorded</h3>
                    <p className="mt-1 text-sm text-gray-500">Add your allergies to ensure safe medical treatment in KZN healthcare facilities.</p>
                </div>
            )}

            {/* Allergy Information for KZN */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">About Allergies in KZN</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>KZN's coastal humidity increases house dust mite and mould allergies</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Peanut and seafood allergies are common food allergies in the region</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Always inform KZN healthcare providers about your allergies before treatment</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}