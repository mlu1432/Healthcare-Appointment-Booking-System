'use client';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { KZN_DISTRICTS, FACILITY_TYPES } from '@/lib/constants';

export default function ProfileCompletion() {
    const { user, completeProfile } = useUser();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        preferredLanguage: user?.preferredLanguage || 'english',
        locationData: {
            healthDistrict: user?.locationData?.healthDistrict || '',
            subLocation: user?.locationData?.subLocation || '',
            preferredFacilityType: user?.locationData?.preferredFacilityType || '',
            districtType: user?.locationData?.districtType || 'urban'
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await completeProfile(formData);
            if (result.user) {
                router.push('/');
            } else {
                setError(result.message || 'Failed to complete profile');
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Step {step} of 2</span>
                        <span className="text-sm font-medium text-gray-700">{Math.round((step / 2) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Complete Your KZN Health Profile</h2>
                    <p className="text-center text-gray-600 mb-6">Help us provide you with better healthcare services in KwaZulu-Natal</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Personal Information */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input type="tel" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+27821234567" value={formData.phoneNumber} onChange={(e) => updateFormData('phoneNumber', e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                    <input type="date" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.dateOfBirth} onChange={(e) => updateFormData('dateOfBirth', e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                    <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.gender} onChange={(e) => updateFormData('gender', e.target.value)}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.preferredLanguage} onChange={(e) => updateFormData('preferredLanguage', e.target.value)}>
                                        <option value="english">English</option>
                                        <option value="zulu">Zulu</option>
                                        <option value="afrikaans">Afrikaans</option>
                                        <option value="xhosa">Xhosa</option>
                                        <option value="sotho">Sotho</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location Information */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">KZN Location Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Health District *</label>
                                    <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.locationData.healthDistrict} onChange={(e) => updateFormData('locationData.healthDistrict', e.target.value)}>
                                        <option value="">Select Your District</option>
                                        {KZN_DISTRICTS.map(district => (
                                            <option key={district} value={district}>{district.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-location (Town/Area) *</label>
                                    <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Durban Central, Pietermaritzburg CBD" value={formData.locationData.subLocation} onChange={(e) => updateFormData('locationData.subLocation', e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Facility Type *</label>
                                    <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.locationData.preferredFacilityType} onChange={(e) => updateFormData('locationData.preferredFacilityType', e.target.value)}>
                                        <option value="">Select Preferred Facility Type</option>
                                        {FACILITY_TYPES.map(type => (
                                            <option key={type} value={type}>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Area Type</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.locationData.districtType} onChange={(e) => updateFormData('locationData.districtType', e.target.value)}>
                                        <option value="urban">Urban</option>
                                        <option value="rural">Rural</option>
                                        <option value="metro">Metro</option>
                                        <option value="coastal">Coastal</option>
                                        <option value="inland">Inland</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-4">
                            {step > 1 ? (
                                <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" disabled={loading}>Previous</button>
                            ) : <div></div>}

                            {step < 2 ? (
                                <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Next</button>
                            ) : (
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
                                    {loading ? 'Completing Profile...' : 'Complete Profile'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}