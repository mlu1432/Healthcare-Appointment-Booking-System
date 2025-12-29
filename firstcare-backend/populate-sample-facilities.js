/**
 * Sample Healthcare Facilities Data Populator - FIXED VERSION
 * Populates the database with realistic KZN healthcare facilities for testing purposes.
 * 
 * @file populate-sample-facilities.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample healthcare facilities data with correct language values
const sampleFacilities = [
  // ==================== UNJANI CLINICS (R300) ====================
  {
    name: "Unjani Clinic Durban Central",
    facilityType: "unjani-clinic",
    district: "ethekwini",
    subLocation: "Durban Central",
    address: "123 Smith Street, Durban Central, Durban, 4001",
    location: {
      type: "Point",
      coordinates: [30.8613673, -30.078962] // Near your test coordinates
    },
    contact: {
      phone: "031 123 4567",
      email: "central@unjaniclinics.co.za"
    },
    affordabilityTier: "low-cost",
    acceptsMedicalAid: false,
    estimatedCosts: {
      consultation: 300,
      followUp: 100,
      emergency: 350
    },
    doctors: [
      {
        name: "Dr. Sarah Johnson",
        specialty: "General Practitioner",
        consultationFee: 300,
        qualifications: ["MBChB", "Dip HIV Management"],
        languages: ["english", "zulu"],
        isAvailable: true
      }
    ],
    services: ["Primary Care", "Chronic Medication", "STI Treatment", "Child Health", "Women's Health"],
    operatingHours: {
      monday: { open: "08:00", close: "17:00", closed: false },
      tuesday: { open: "08:00", close: "17:00", closed: false },
      wednesday: { open: "08:00", close: "17:00", closed: false },
      thursday: { open: "08:00", close: "17:00", closed: false },
      friday: { open: "08:00", close: "16:00", closed: false },
      saturday: { open: "09:00", close: "13:00", closed: false },
      sunday: { closed: true }
    },
    rating: 4.5,
    userRatingsTotal: 47,
    isVerified: true,
    isActive: true
  },
  {
    name: "Unjani Clinic Umlazi",
    facilityType: "unjani-clinic",
    district: "ethekwini",
    subLocation: "Umlazi",
    address: "45 Mangosuthu Highway, Umlazi, Durban, 4066",
    location: {
      type: "Point",
      coordinates: [30.891234, -30.098765]
    },
    contact: {
      phone: "031 234 5678"
    },
    affordabilityTier: "low-cost",
    estimatedCosts: {
      consultation: 300,
      followUp: 100
    },
    doctors: [
      {
        name: "Dr. Thandi Ndlovu",
        specialty: "General Practitioner",
        consultationFee: 300,
        qualifications: ["MBChB"],
        languages: ["zulu", "english", "xhosa"],
        isAvailable: true
      },
      {
        name: "Dr. James Khumalo",
        specialty: "Pediatrician",
        consultationFee: 350,
        qualifications: ["MBChB", "FCPaed"],
        languages: ["zulu", "english"],
        isAvailable: true
      }
    ],
    services: ["Primary Care", "Pediatric Care", "Chronic Medication", "STI Treatment"],
    rating: 4.3,
    userRatingsTotal: 32,
    isVerified: true,
    isActive: true
  },

  // ==================== PUBLIC CLINICS (FREE) ====================
  {
    name: "Durban Central Community Clinic",
    facilityType: "public-clinic",
    district: "ethekwini",
    subLocation: "Durban CBD",
    address: "78 Victoria Street, Durban CBD, 4001",
    location: {
      type: "Point",
      coordinates: [30.865432, -30.076543]
    },
    contact: {
      phone: "031 345 6789",
      emergencyContact: "031 345 6790"
    },
    affordabilityTier: "government",
    acceptsMedicalAid: false,
    estimatedCosts: {
      consultation: 0,
      followUp: 0
    },
    doctors: [
      {
        name: "Dr. Michael Bhengu",
        specialty: "General Practitioner",
        consultationFee: 0,
        qualifications: ["MBChB"],
        languages: ["zulu", "english"],
        isAvailable: true
      }
    ],
    services: ["Primary Care", "Immunizations", "Chronic Medication", "TB Treatment"],
    rating: 3.8,
    userRatingsTotal: 89,
    isVerified: true,
    isActive: true
  },
  {
    name: "Prince Mshiyeni Memorial Hospital",
    facilityType: "public-hospital",
    district: "ethekwini",
    subLocation: "Umlazi",
    address: "8000 Ntuzuma Road, Umlazi, Durban, 4066",
    location: {
      type: "Point",
      coordinates: [30.912345, -30.112345]
    },
    contact: {
      phone: "031 907 8000",
      emergencyContact: "031 907 8111"
    },
    affordabilityTier: "government",
    acceptsMedicalAid: false,
    doctors: [
      {
        name: "Dr. Patricia Naidoo",
        specialty: "Emergency Medicine",
        consultationFee: 0,
        qualifications: ["MBChB", "Dip PEC"],
        languages: ["english", "afrikaans"],
        isAvailable: true
      },
      {
        name: "Dr. Robert Singh",
        specialty: "Gynecologist",
        consultationFee: 0,
        qualifications: ["MBChB", "FCOG"],
        languages: ["english"],
        isAvailable: true
      }
    ],
    services: ["Emergency Care", "Surgery", "Maternity", "Specialist Care"],
    rating: 4.0,
    userRatingsTotal: 156,
    isVerified: true,
    isActive: true
  },

  // ==================== PRIVATE PRACTICES ====================
  {
    name: "Durban Medical Centre",
    facilityType: "private-practice",
    district: "ethekwini",
    subLocation: "Berea",
    address: "123 Musgrave Road, Berea, Durban, 4001",
    location: {
      type: "Point",
      coordinates: [30.845678, -30.065432]
    },
    contact: {
      phone: "031 303 5777",
      email: "info@durbanmedical.co.za",
      website: "www.durbanmedical.co.za"
    },
    affordabilityTier: "private",
    acceptsMedicalAid: true,
    medicalAidProviders: ["Discovery", "Bonitas", "Momentum", "KeyHealth"],
    estimatedCosts: {
      consultation: 650,
      followUp: 450
    },
    doctors: [
      {
        name: "Dr. David van der Merwe",
        specialty: "General Practitioner",
        consultationFee: 650,
        qualifications: ["MBChB", "Dip Pall Med"],
        languages: ["english", "afrikaans"],
        isAvailable: true
      },
      {
        name: "Dr. Aisha Patel",
        specialty: "Dermatologist",
        consultationFee: 850,
        qualifications: ["MBChB", "FCDerm"],
        languages: ["english"],
        isAvailable: true
      }
    ],
    services: ["General Practice", "Dermatology", "Minor Surgery", "Travel Clinic"],
    rating: 4.6,
    userRatingsTotal: 124,
    isVerified: true,
    isActive: true
  },
  {
    name: "Berea Dental Studio",
    facilityType: "private-practice",
    district: "ethekwini",
    subLocation: "Berea",
    address: "45 Florida Road, Berea, Durban, 4001",
    location: {
      type: "Point",
      coordinates: [30.835432, -30.055678]
    },
    contact: {
      phone: "031 309 1234",
      email: "smile@bereadental.co.za"
    },
    affordabilityTier: "private",
    acceptsMedicalAid: true,
    medicalAidProviders: ["Discovery", "Bonitas", "Fedhealth"],
    estimatedCosts: {
      consultation: 500,
      followUp: 350
    },
    doctors: [
      {
        name: "Dr. Lisa Chen",
        specialty: "Dentist",
        consultationFee: 500,
        qualifications: ["BChD", "Dip Implantology"],
        languages: ["english"],
        isAvailable: true
      }
    ],
    services: ["Dental Checkups", "Teeth Cleaning", "Fillings", "Root Canals"],
    rating: 4.7,
    userRatingsTotal: 87,
    isVerified: true,
    isActive: true
  },

  // ==================== SPECIALIST CENTERS ====================
  {
    name: "KZN Eye Institute",
    facilityType: "specialist-center",
    district: "ethekwini",
    subLocation: "Westville",
    address: "78 Jan Hofmeyr Road, Westville, Durban, 3630",
    location: {
      type: "Point",
      coordinates: [30.923456, -30.087654]
    },
    contact: {
      phone: "031 265 1845",
      email: "info@kzneye.co.za"
    },
    affordabilityTier: "medical-aid",
    acceptsMedicalAid: true,
    medicalAidProviders: ["Discovery", "Bonitas", "Momentum", "KeyHealth", "Fedhealth"],
    estimatedCosts: {
      consultation: 800,
      followUp: 600
    },
    doctors: [
      {
        name: "Dr. Ahmed Khan",
        specialty: "Ophthalmologist",
        consultationFee: 800,
        qualifications: ["MBChB", "FCOphth"],
        languages: ["english"],
        isAvailable: true
      }
    ],
    services: ["Eye Examinations", "Cataract Surgery", "Glaucoma Treatment", "Laser Surgery"],
    rating: 4.8,
    userRatingsTotal: 203,
    isVerified: true,
    isActive: true
  }
];

/**
 * Connects to the MongoDB database and populates sample healthcare facility data.
 */
async function populateSampleData() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log('Connected to MongoDB successfully.');

    const HealthcareFacility = (await import('./src/models/HealthcareFacility.js')).default;

    console.log('Clearing existing sample facilities...');
    await HealthcareFacility.deleteMany({
      name: { $in: sampleFacilities.map(f => f.name) }
    });

    console.log('Inserting new sample facilities...');
    const result = await HealthcareFacility.insertMany(sampleFacilities);

    console.log(`Successfully inserted ${result.length} sample facilities.`);

    const summary = sampleFacilities.reduce((acc, facility) => {
      acc[facility.facilityType] = (acc[facility.facilityType] || 0) + 1;
      return acc;
    }, {});

    console.log('Facility Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} facilities`);
    });

    console.log('\nSample Data Overview:');
    console.log('   - 2 Unjani Clinics (R300 consultations)');
    console.log('   - 2 Public facilities (Free)');
    console.log('   - 2 Private practices');
    console.log('   - 1 Specialist center');
    console.log('\nAll facilities are located in the eThekwini district.');
    console.log('You can now test the nearby facilities feature.');

  } catch (error) {
    console.error('Error populating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the population script
populateSampleData();