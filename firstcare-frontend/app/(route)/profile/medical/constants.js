// /app/(route)/profile/medical/constants.js

/**
 * KZN-specific medical constants
 * 
 * Contains all medical data specific to KwaZulu-Natal healthcare system
 */

// KZN-specific medical data based on disease burden
export const KZN_COMMON_CONDITIONS = [
    // Communicable Diseases (High Burden in KZN)
    { name: 'HIV/AIDS', category: 'communicable', priority: 'high' },
    { name: 'Tuberculosis (TB)', category: 'communicable', priority: 'high' },
    { name: 'Pneumonia/Lower Respiratory Infections', category: 'communicable', priority: 'high' },
    { name: 'Diarrhoeal Diseases', category: 'communicable', priority: 'high' },
    { name: 'Malaria', category: 'communicable', priority: 'medium' },
    { name: 'Meningitis/Encephalitis', category: 'communicable', priority: 'medium' },
    { name: 'Sexually Transmitted Infections (STIs)', category: 'communicable', priority: 'medium' },

    // Non-Communicable Diseases (NCDs)
    { name: 'Hypertension (High Blood Pressure)', category: 'ncd', priority: 'high' },
    { name: 'Diabetes Type 2', category: 'ncd', priority: 'high' },
    { name: 'Diabetes Type 1', category: 'ncd', priority: 'medium' },
    { name: 'Heart Disease (Cardiovascular)', category: 'ncd', priority: 'high' },
    { name: 'Stroke', category: 'ncd', priority: 'high' },
    { name: 'Asthma', category: 'ncd', priority: 'medium' },
    { name: 'Chronic Obstructive Pulmonary Disease (COPD)', category: 'ncd', priority: 'medium' },
    { name: 'Arthritis', category: 'ncd', priority: 'medium' },
    { name: 'Chronic Kidney Disease', category: 'ncd', priority: 'medium' },
    { name: 'Liver Disease', category: 'ncd', priority: 'medium' },
    { name: 'Cancer', category: 'ncd', priority: 'high' },

    // Mental Health (High Burden in KZN)
    { name: 'Depression', category: 'mental', priority: 'high' },
    { name: 'Anxiety Disorders', category: 'mental', priority: 'high' },
    { name: 'Post-Traumatic Stress Disorder (PTSD)', category: 'mental', priority: 'medium' },
    { name: 'Substance Use Disorders', category: 'mental', priority: 'high' },

    // Other Common Conditions in KZN
    { name: 'Chronic Pain', category: 'other', priority: 'medium' },
    { name: 'Thyroid Disorders', category: 'other', priority: 'medium' },
    { name: 'Epilepsy', category: 'other', priority: 'medium' },
    { name: 'Anaemia', category: 'other', priority: 'medium' },
    { name: 'Obesity', category: 'other', priority: 'high' },
    { name: 'Malnutrition', category: 'other', priority: 'medium' },
    { name: 'Maternal Health Conditions', category: 'other', priority: 'high' },
    { name: 'Childhood Illnesses', category: 'other', priority: 'high' }
];

// KZN-specific allergies based on coastal climate
export const KZN_COMMON_ALLERGIES = [
    // Environmental Allergies (High in coastal KZN)
    { name: 'House Dust Mites', type: 'environmental', severity: 'high' },
    { name: 'Mould/Fungal Spores', type: 'environmental', severity: 'high' },
    { name: 'Grass Pollen', type: 'environmental', severity: 'medium' },
    { name: 'Tree Pollen', type: 'environmental', severity: 'low' },
    { name: 'Weed Pollen', type: 'environmental', severity: 'low' },
    { name: 'Cockroach Allergens', type: 'environmental', severity: 'medium' },

    // Food Allergies (Common in KZN)
    { name: 'Peanuts', type: 'food', severity: 'high' },
    { name: 'Eggs', type: 'food', severity: 'high' },
    { name: 'Cow\'s Milk', type: 'food', severity: 'high' },
    { name: 'Seafood (Shellfish)', type: 'food', severity: 'high' },
    { name: 'Fish', type: 'food', severity: 'medium' },
    { name: 'Soy', type: 'food', severity: 'medium' },
    { name: 'Wheat/Gluten', type: 'food', severity: 'medium' },
    { name: 'Maize/Corn', type: 'food', severity: 'low' },

    // Drug Allergies (Important for KZN healthcare)
    { name: 'Penicillin', type: 'drug', severity: 'high' },
    { name: 'Sulfa Drugs', type: 'drug', severity: 'medium' },
    { name: 'NSAIDs (Ibuprofen, Aspirin)', type: 'drug', severity: 'medium' },
    { name: 'Codeine', type: 'drug', severity: 'medium' },
    { name: 'Antiretroviral Drugs', type: 'drug', severity: 'low' },
    { name: 'Anti-TB Drugs', type: 'drug', severity: 'medium' },

    // Other Allergies
    { name: 'Latex', type: 'other', severity: 'medium' },
    { name: 'Insect Stings (Bees, Wasps)', type: 'other', severity: 'medium' },
    { name: 'Animal Dander (Cats, Dogs)', type: 'other', severity: 'medium' },
    { name: 'Contrast Dye (Medical Imaging)', type: 'other', severity: 'low' }
];

// KZN-specific medications
export const KZN_COMMON_MEDICATIONS = [
    // HIV/AIDS Treatment (High burden in KZN)
    { name: 'Antiretroviral Therapy (ART)', category: 'hiv', common: true },
    { name: 'Tenofovir', category: 'hiv', common: true },
    { name: 'Emtricitabine', category: 'hiv', common: true },
    { name: 'Efavirenz', category: 'hiv', common: true },
    { name: 'Dolutegravir', category: 'hiv', common: true },
    { name: 'Lamivudine', category: 'hiv', common: true },

    // TB Treatment (High burden in KZN)
    { name: 'Rifampicin', category: 'tb', common: true },
    { name: 'Isoniazid', category: 'tb', common: true },
    { name: 'Pyrazinamide', category: 'tb', common: true },
    { name: 'Ethambutol', category: 'tb', common: true },

    // Hypertension Medications (High prevalence)
    { name: 'Enalapril', category: 'hypertension', common: true },
    { name: 'Amlodipine', category: 'hypertension', common: true },
    { name: 'Hydrochlorothiazide', category: 'hypertension', common: true },
    { name: 'Losartan', category: 'hypertension', common: true },
    { name: 'Atenolol', category: 'hypertension', common: true },

    // Diabetes Medications (High prevalence)
    { name: 'Metformin', category: 'diabetes', common: true },
    { name: 'Insulin', category: 'diabetes', common: true },
    { name: 'Glibenclamide', category: 'diabetes', common: true },
    { name: 'Gliclazide', category: 'diabetes', common: true },

    // Common Other Medications
    { name: 'Atorvastatin (Cholesterol)', category: 'other', common: true },
    { name: 'Aspirin (Blood thinner)', category: 'other', common: true },
    { name: 'Paracetamol (Pain relief)', category: 'other', common: true },
    { name: 'Ibuprofen (Anti-inflammatory)', category: 'other', common: true },
    { name: 'Omeprazole (Stomach)', category: 'other', common: true },
    { name: 'Ventolin (Asthma)', category: 'other', common: true },
    { name: 'Prednisone (Steroid)', category: 'other', common: true },
    { name: 'Warfarin (Blood thinner)', category: 'other', common: true },

    // Mental Health Medications
    { name: 'Sertraline', category: 'mental', common: true },
    { name: 'Fluoxetine', category: 'mental', common: true },
    { name: 'Amitriptyline', category: 'mental', common: true },

    // Traditional/Herbal Medicines (Common in KZN)
    { name: 'African Potato (Hypoxis)', category: 'traditional', common: true },
    { name: 'Sutherlandia (Cancer Bush)', category: 'traditional', common: true },
    { name: 'Umckaloabo (Pelargonium)', category: 'traditional', common: true },
    { name: 'Garlic Supplements', category: 'traditional', common: true }
];

// KZN Medical Aid Schemes (South Africa)
export const KZN_MEDICAL_AID_SCHEMES = [
    'Discovery Health',
    'Momentum Health',
    'Bonitas',
    'Bestmed',
    'Fedhealth',
    'Medihelp',
    'Profmed',
    'KeyHealth',
    'CompCare',
    'Government Employees Medical Scheme (GEMS)',
    'Bankmed',
    'Medshield',
    'No Medical Aid/Health Insurance',
    'Other'
];

// KZN-specific healthcare communication preferences
export const KZN_COMMUNICATION_OPTIONS = [
    { value: 'sms', label: 'SMS Text Message', description: 'Most common in KZN' },
    { value: 'whatsapp', label: 'WhatsApp', description: 'Popular in urban areas' },
    { value: 'phone', label: 'Phone Call', description: 'Preferred by elders' },
    { value: 'email', label: 'Email', description: 'For detailed information' },
    { value: 'in-app', label: 'In-App Notifications', description: 'For tech-savvy users' },
    { value: 'letter', label: 'Postal Letter', description: 'Rural areas without signal' }
];

// Step configuration for the multi-step form
export const MEDICAL_PROFILE_STEPS = [
    { title: 'KZN Health Profile', description: 'Conditions common in KZN' },
    { title: 'Allergies', description: 'Allergies in KZN climate' },
    { title: 'Medications', description: 'Medications and treatments' },
    { title: 'Preferences', description: 'Healthcare in KZN' },
    { title: 'Review', description: 'Review and save' }
];

// Initial form states
export const INITIAL_MEDICAL_DATA = {
    medicalHistory: {
        bloodType: '',
        conditions: [],
        surgeries: [],
        chronicMedications: [],
        hivStatus: '',
        tbHistory: ''
    },
    allergies: [],
    healthcarePreferences: {
        hasMedicalAid: false,
        medicalAidScheme: '',
        medicalAidNumber: '',
        primaryCareFacility: '',
        preferredCommunication: 'sms',
        appointmentReminders: true,
        healthTips: false,
        consentForResearch: false,
        emergencyAccessConsent: true,
        dataSharingConsent: false,
        traditionalMedicineUse: false,
        traditionalMedicineDetails: ''
    }
};

export const INITIAL_NEW_CONDITION = {
    name: '',
    category: 'other',
    severity: 'moderate',
    diagnosedDate: new Date().toISOString().split('T')[0],
    isActive: true,
    treatingFacility: '',
    notes: ''
};

export const INITIAL_NEW_ALLERGY = {
    allergen: '',
    type: 'other',
    severity: 'moderate',
    reaction: '',
    firstObserved: new Date().toISOString().split('T')[0],
    requiresEpipen: false,
    lastReaction: ''
};

export const INITIAL_NEW_MEDICATION = {
    name: '',
    category: 'other',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    prescribedBy: '',
    prescribedAt: '',
    isActive: true,
    sideEffects: ''
};

// Severity levels for conditions and allergies
export const SEVERITY_LEVELS = {
    condition: [
        { value: 'mild', label: 'Mild', color: 'green' },
        { value: 'moderate', label: 'Moderate', color: 'yellow' },
        { value: 'severe', label: 'Severe', color: 'orange' },
        { value: 'critical', label: 'Critical', color: 'red' }
    ],
    allergy: [
        { value: 'mild', label: 'Mild (Rash/Itching)', color: 'green' },
        { value: 'moderate', label: 'Moderate (Swelling/Hives)', color: 'yellow' },
        { value: 'severe', label: 'Severe (Breathing Difficulty)', color: 'orange' },
        { value: 'anaphylactic', label: 'Anaphylactic (Life-threatening)', color: 'red' }
    ]
};

// Blood types
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Condition categories
export const CONDITION_CATEGORIES = [
    { value: 'communicable', label: 'Communicable Disease' },
    { value: 'ncd', label: 'Non-Communicable Disease' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'other', label: 'Other' }
];

// Allergy types
export const ALLERGY_TYPES = [
    { value: 'environmental', label: 'Environmental (Dust, Pollen)' },
    { value: 'food', label: 'Food Allergy' },
    { value: 'drug', label: 'Drug Allergy' },
    { value: 'other', label: 'Other' }
];

// Medication categories
export const MEDICATION_CATEGORIES = [
    { value: 'hiv', label: 'HIV Treatment' },
    { value: 'tb', label: 'TB Treatment' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'traditional', label: 'Traditional/Herbal' },
    { value: 'other', label: 'Other' }
];