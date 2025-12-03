// /app/(route)/profile/medical/components/steps/Step1HealthProfile.jsx

import {
    KZN_COMMON_CONDITIONS,
    BLOOD_TYPES,
    CONDITION_CATEGORIES,
    SEVERITY_LEVELS
} from '../../constants';

export default function Step1HealthProfile({
    medicalData,
    newCondition,
    setNewCondition,
    handleAddCondition,
    handleRemoveCondition,
    updateMedicalData
}) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">KZN Healthcare Context</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            KwaZulu-Natal has specific health challenges. Accurate information helps healthcare providers in your district give you better care.
                        </p>
                    </div>
                </div>
            </div>

            {/* Blood Type & KZN-specific health status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Type *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {BLOOD_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => updateMedicalData({
                                    medicalHistory: { ...medicalData.medicalHistory, bloodType: type }
                                })}
                                className={`py-2 px-3 rounded-lg border text-sm ${medicalData.medicalHistory.bloodType === type
                                    ? 'bg-red-100 border-red-500 text-red-700 font-medium'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => updateMedicalData({
                            medicalHistory: { ...medicalData.medicalHistory, bloodType: 'unknown' }
                        })}
                        className={`mt-2 py-2 px-4 rounded-lg border text-sm w-full ${medicalData.medicalHistory.bloodType === 'unknown'
                            ? 'bg-gray-100 border-gray-500 text-gray-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        I don't know my blood type
                    </button>
                </div>

                {/* KZN-specific health status */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            HIV Status (Important for KZN healthcare)
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={medicalData.medicalHistory.hivStatus}
                            onChange={(e) => updateMedicalData({
                                medicalHistory: { ...medicalData.medicalHistory, hivStatus: e.target.value }
                            })}
                        >
                            <option value="">Select HIV Status</option>
                            <option value="negative">HIV Negative</option>
                            <option value="positive">HIV Positive (on treatment)</option>
                            <option value="positive-untreated">HIV Positive (not on treatment)</option>
                            <option value="unknown">Don't know/Prefer not to say</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            TB History
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={medicalData.medicalHistory.tbHistory}
                            onChange={(e) => updateMedicalData({
                                medicalHistory: { ...medicalData.medicalHistory, tbHistory: e.target.value }
                            })}
                        >
                            <option value="">Select TB History</option>
                            <option value="never">Never had TB</option>
                            <option value="past">Had TB in the past (completed treatment)</option>
                            <option value="current">Currently being treated for TB</option>
                            <option value="exposed">Exposed to TB but not diagnosed</option>
                            <option value="unknown">Don't know</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KZN Common Conditions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Medical Conditions Common in KZN</h3>
                    <span className="text-sm text-gray-500">
                        {medicalData.medicalHistory.conditions.length} recorded
                    </span>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <input
                                type="text"
                                list="kzn-conditions"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newCondition.name}
                                onChange={(e) => setNewCondition(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Type or select a KZN-common condition"
                            />
                            <datalist id="kzn-conditions">
                                {KZN_COMMON_CONDITIONS.map(condition => (
                                    <option key={condition.name} value={condition.name} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newCondition.category}
                                onChange={(e) => setNewCondition(prev => ({ ...prev, category: e.target.value }))}
                            >
                                {CONDITION_CATEGORIES.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
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
                                value={newCondition.severity}
                                onChange={(e) => setNewCondition(prev => ({ ...prev, severity: e.target.value }))}
                            >
                                {SEVERITY_LEVELS.condition.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosed Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newCondition.diagnosedDate}
                                onChange={(e) => setNewCondition(prev => ({ ...prev, diagnosedDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Treating KZN Facility (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newCondition.treatingFacility}
                            onChange={(e) => setNewCondition(prev => ({ ...prev, treatingFacility: e.target.value }))}
                            placeholder="e.g., Addington Hospital, King Edward VIII Hospital"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={newCondition.isActive}
                                onChange={(e) => setNewCondition(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <span className="ml-2 text-sm text-gray-700">Currently Active</span>
                        </label>

                        <button
                            type="button"
                            onClick={handleAddCondition}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Condition
                        </button>
                    </div>
                </div>

                {/* Current Conditions List */}
                {medicalData.medicalHistory.conditions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Your Medical Conditions</h4>
                        {medicalData.medicalHistory.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <span className="font-medium">{condition.name}</span>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${condition.severity === 'mild' ? 'bg-green-100 text-green-800' :
                                                condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                    condition.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {condition.severity}
                                        </span>
                                        {condition.isActive && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    {condition.treatingFacility && (
                                        <p className="text-sm text-gray-600 mt-1">Treatment: {condition.treatingFacility}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCondition(index)}
                                    className="ml-4 text-red-600 hover:text-red-800"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}