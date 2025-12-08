/**
 * Environment Check Utility
 * 
 * @file lib/env-check.js
 * @description Utility to verify environment configuration at runtime
 * 
 * @version 1.0.0
 * @module env-check
 */

/**
 * Check and validate environment configuration
 * 
 * @returns {Object} Environment validation results
 */
export function checkEnvironment() {
  // Only run in browser
  if (typeof window === 'undefined') {
    return { isValid: true, message: 'Running on server' };
  }

  const config = {
    // API Configuration
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    isProduction: process.env.NEXT_PUBLIC_DEV_MODE === 'false',
    isDevelopment: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
    
    // Required variables for production
    requiredVars: [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
    ],
    
    // Optional variables
    optionalVars: [
      'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
      'NEXT_PUBLIC_GCP_PROJECT_ID',
      'NEXT_PUBLIC_GCP_PROJECT_NUMBER'
    ]
  };

  // Check for localhost in production (common mistake)
  const hasLocalhostInProd = config.isProduction && 
    config.apiBaseUrl && 
    config.apiBaseUrl.includes('localhost');

  // Check required variables
  const missingVars = config.requiredVars.filter(
    varName => !process.env[varName] || process.env[varName].trim() === ''
  );

  // Determine if configuration is valid
  const isValid = missingVars.length === 0 && !hasLocalhostInProd;

  // Log environment info for debugging
  console.group('🚀 FirstCare Environment Configuration');
  console.log('Mode:', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('API Base URL:', config.apiBaseUrl || 'Not set');
  console.log('Is Production:', config.isProduction);
  console.log('Is Development:', config.isDevelopment);
  
  if (hasLocalhostInProd) {
    console.error('❌ CRITICAL: Production mode with localhost API URL!');
    console.error('   API URL:', config.apiBaseUrl);
    console.error('   Fix: Set NEXT_PUBLIC_API_BASE_URL to your Render backend URL');
  }
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    if (config.isProduction) {
      console.error('❌ Production mode with missing configuration!');
    }
  } else {
    console.log('✅ Environment variables OK');
  }
  
  // Show all environment variables (masked for security)
  console.log('📋 All env variables:', Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC_'))
    .map(key => `${key}: ${process.env[key] ? '***SET***' : 'MISSING'}`)
  );
  
  console.groupEnd();

  return {
    isValid,
    missingVars,
    hasLocalhostInProd,
    config,
    message: !isValid ? 
      'Environment configuration needs attention' : 
      'Environment configuration is valid'
  };
}

/**
 * Test backend connection
 * 
 * @returns {Promise<Object>} Connection test results
 */
export async function testBackendConnection() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBaseUrl) {
      return { success: false, error: 'API base URL not set' };
    }

    console.log(`🔌 Testing backend connection to: ${apiBaseUrl}`);
    
    const response = await fetch(`${apiBaseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();
    
    const result = {
      success: response.ok,
      status: response.status,
      data: data,
      url: apiBaseUrl
    };

    console.log('Backend connection test:', result.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!result.success) {
      console.error('Backend error details:', data);
    }

    return result;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      error: error.message,
      url: process.env.NEXT_PUBLIC_API_BASE_URL
    };
  }
}

/**
 * Get environment summary for debugging
 * 
 * @returns {Object} Environment summary
 */
export function getEnvironmentSummary() {
  return {
    frontend: {
      url: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      environment: process.env.NODE_ENV || 'unknown',
      devMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
      timestamp: new Date().toISOString()
    },
    backend: {
      url: process.env.NEXT_PUBLIC_API_BASE_URL,
      isLocalhost: process.env.NEXT_PUBLIC_API_BASE_URL?.includes('localhost') || false,
      isProductionBackend: process.env.NEXT_PUBLIC_API_BASE_URL?.includes('onrender.com') || false
    },
    features: {
      googleAuth: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      googleMaps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      recaptcha: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    }
  };
}

// Auto-run in browser
if (typeof window !== 'undefined') {
  // Initial check
  checkEnvironment();
  
  // Optional: Test backend connection on page load
  // testBackendConnection().then(result => {
  //   if (!result.success) {
  //     console.warn('Backend connection test failed on page load');
  //   }
  // });
}
