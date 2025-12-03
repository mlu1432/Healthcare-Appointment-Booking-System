'use client';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, loading, isAuthenticated } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth/signIn');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

                    {/* Profile completion alert */}
                    {!user.isProfileComplete && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-yellow-800 font-medium">Complete your profile to access all features</span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1">Your profile is {user.profileCompletionPercentage || 0}% complete</p>
                            <button
                                onClick={() => router.push('/profile/complete')}
                                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            >
                                Complete Profile
                            </button>
                        </div>
                    )}

                    {/* User information display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                            <div className="space-y-3">
                                <div><label className="text-sm font-medium text-gray-500">Full Name</label><p className="text-gray-900">{user.firstName} {user.lastName}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Email</label><p className="text-gray-900">{user.email}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Phone</label><p className="text-gray-900">{user.phoneNumber || 'Not provided'}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Date of Birth</label><p className="text-gray-900">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p></div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">KZN Location</h2>
                            <div className="space-y-3">
                                <div><label className="text-sm font-medium text-gray-500">Health District</label><p className="text-gray-900 capitalize">{user.locationData?.healthDistrict?.replace('-', ' ') || 'Not set'}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Sub-location</label><p className="text-gray-900">{user.locationData?.subLocation || 'Not set'}</p></div>
                                <div><label className="text-sm font-medium text-gray-500">Preferred Facility</label><p className="text-gray-900 capitalize">{user.locationData?.preferredFacilityType?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Not set'}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-8 flex gap-4">
                        <button onClick={() => router.push('/profile/complete')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Edit Profile</button>
                        <button onClick={() => router.push('/profile/medical')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Medical Profile</button>
                    </div>
                </div>
            </div>
        </div>
    );
}