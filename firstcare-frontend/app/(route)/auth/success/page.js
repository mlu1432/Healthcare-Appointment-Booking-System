"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function AuthSuccess() {
    const router = useRouter();
    const { user, loading } = useUser();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (!loading && user) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome to FirstCare!
                </h1>

                <p className="text-gray-600 mb-6">
                    You have been successfully authenticated.
                </p>

                {user && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-blue-700">
                            Welcome, <strong>{user.firstName || user.email}</strong>!
                        </p>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-600 text-sm">
                        Redirecting to home page in {countdown} seconds...
                    </p>
                </div>

                <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    Go to Home Now
                </button>
            </div>
        </div>
    );
}