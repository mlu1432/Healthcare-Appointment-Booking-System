// /app/(route)/profile/medical/components/steps/Step3Medications.jsx

import {
    KZN_COMMON_MEDICATIONS,
    MEDICATION_CATEGORIES
} from '../../constants';

export default function Step3Medications({
    medicalData,
    newMedication,
    setNewMedication,
    handleAddMedication,
    handleRemoveMedication
}) {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Medication Safety in KZN</h3>
                        <p className="text-sm text-green-700 mt-1">
                            Accurate medication records help avoid dangerous drug interactions, especially important with KZN's high disease burden.
                        </p>
                    </div>
                </div>
            </div>

            {/* Medications Form */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                        <input
                            type="text"
                            list="kzn-medications"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newMedication.name}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Type or select medication"
                        />
                        <datalist id="kzn-medications">
                            {KZN_COMMON_MEDICATIONS.map(med => (
                                <option key={med.name} value={med.name} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newMedication.category}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, category: e.target.value }))}
                        >
                            {MEDICATION_CATEGORIES.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newMedication.dosage}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                            placeholder="e.g., 500mg, 10mg, 1 tablet"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newMedication.frequency}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                            placeholder="e.g., Twice daily, Once a week"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newMedication.startDate}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed By (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newMedication.prescribedBy}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, prescribedBy: e.target.value }))}
                            placeholder="Dr. Name"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed at KZN Facility (Optional)</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newMedication.prescribedAt}
                        onChange={(e) => setNewMedication(prev => ({ ...prev, prescribedAt: e.target.value }))}
                        placeholder="e.g., Local clinic, hospital"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={newMedication.isActive}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <span className="ml-2 text-sm text-gray-700">Currently Taking</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddMedication}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Medication
                    </button>
                </div>
            </div>

            {/* Current Medications List */}
            {medicalData.medicalHistory.chronicMedications.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Your Medications</h4>
                        <span className="text-sm text-gray-500">
                            {medicalData.medicalHistory.chronicMedications.length} recorded
                        </span>
                    </div>
                    {medicalData.medicalHistory.chronicMedications.map((med, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border">
                            <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-2">
                                    <span className="font-medium">{med.name}</span>
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        {med.category}
                                    </span>
                                    {med.isActive && (
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {med.dosage} • {med.frequency}
                                </p>
                                {med.prescribedBy && (
                                    <p className="text-sm text-gray-500 mt-1">Prescribed by: {med.prescribedBy}</p>
                                )}
                                {med.prescribedAt && (
                                    <p className="text-xs text-gray-500 mt-1">At: {med.prescribedAt}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveMedication(index)}
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

            {/* Medication Safety Note */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Medication Safety in KZN</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Always inform KZN healthcare providers about ALL medications you're taking</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Include traditional/herbal medicines as they can interact with prescribed drugs</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Never share medications with others, even if they have similar symptoms</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}