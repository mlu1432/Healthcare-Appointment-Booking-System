/**
 * Toast Provider – KZN Healthcare System
 *
 * @component
 * @version 1.0.0
 * @description
 * This component configures and provides toast notifications across the
 * KZN Healthcare System application. It uses react-hot-toast to deliver
 * clear, consistent feedback messages for users.
 *
 * The provider is designed to support both success and error states with
 * custom styling, ensuring messages are readable and visually distinct.
 * It should be placed near the root of the app (e.g., in layout.tsx) so
 * that notifications can be triggered from anywhere in the application.
 *
 * Features:
 * - Global toast support for all pages
 * - Custom styling for success, error, and loading states
 * - Clean, accessible message presentation
 */

'use client';

import { Toaster } from 'react-hot-toast';

/**
 * ToastProvider Component
 *
 * Renders a globally available toast container with a custom configuration.
 * All toast notifications triggered in the app will appear here.
 *
 * @returns {JSX.Element} Configured toast notification container
 */
export function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#363636',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },

                // Styling for success messages
                success: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#ffffff',
                    },
                    style: {
                        background: '#065f46',
                        color: '#ffffff',
                        border: '1px solid #047857',
                    },
                },

                // Styling for error messages
                error: {
                    duration: 6000,
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#ffffff',
                    },
                    style: {
                        background: '#7f1d1d',
                        color: '#ffffff',
                        border: '1px solid #dc2626',
                    },
                },

                // Styling for loading messages
                loading: {
                    duration: 10000,
                    iconTheme: {
                        primary: '#3B82F6',
                        secondary: '#ffffff',
                    },
                    style: {
                        background: '#1e3a8a',
                        color: '#ffffff',
                        border: '1px solid #2563eb',
                    },
                },
            }}
        />
    );
}

export default ToastProvider;