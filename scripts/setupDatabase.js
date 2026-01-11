#!/usr/bin/env node

/**
 * Database Setup Script
 * Initializes Firebase with mock data for Navi Mumbai vendors
 * Run: node scripts/setupDatabase.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load service account key
const serviceAccountPath = path.join(__dirname, '../credentials/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Mock vendor data - Navi Mumbai locations
const MOCK_VENDORS = [
  {
    phone: '9876543210',
    vendorName: 'Rajesh Kumar',
    vendorAge: 38,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Com',
    vendorEmail: 'rajesh@example.com',
    shopName: 'Raju\'s Cyber Chaat',
    shopLocation: { latitude: 19.0176, longitude: 73.0822 },
    shopAddress: 'Kharghar',
    parentCity: 'Navi Mumbai',
    dietaryDetails: ['vegetarian', 'vegan'],
    stallPhoto: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop',
    reviews: {},
    averageRating: 0,
    aiScore: 4.5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  },
  {
    phone: '9876543211',
    vendorName: 'Priya Sharma',
    vendorAge: 32,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    vendorQualification: 'Diploma',
    vendorEmail: 'priya@example.com',
    shopName: 'Priya\'s Healthy Bites',
    shopLocation: { latitude: 19.0273, longitude: 73.0954 },
    shopAddress: 'Nerul',
    parentCity: 'Navi Mumbai',
    dietaryDetails: ['vegetarian', 'glutenfree', 'vegan'],
    stallPhoto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
    reviews: {},
    averageRating: 0,
    aiScore: 4.6,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    isActive: true,
  },
  {
    phone: '9876543212',
    vendorName: 'Mohammed Ahmed',
    vendorAge: 45,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    vendorQualification: 'B.A',
    vendorEmail: 'mohammed@example.com',
    shopName: 'Ahmed\'s Biryani Corner',
    shopLocation: { latitude: 19.0385, longitude: 73.1053 },
    shopAddress: 'Seawoods',
    parentCity: 'Navi Mumbai',
    dietaryDetails: ['non-vegetarian'],
    stallPhoto: 'https://images.unsplash.com/photo-1565958011504-98d6efaceaf1?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1565958011504-98d6efaceaf1?w=800&h=400&fit=crop',
    reviews: {},
    averageRating: 0,
    aiScore: 4.3,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    isActive: true,
  },
  {
    phone: '9876543213',
    vendorName: 'Anil Desai',
    vendorAge: 41,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Tech',
    vendorEmail: 'anil@example.com',
    shopName: 'Anil\'s Fast Food Junction',
    shopLocation: { latitude: 19.0820, longitude: 73.0313 },
    shopAddress: 'Vashi',
    parentCity: 'Navi Mumbai',
    dietaryDetails: ['non-vegetarian', 'vegetarian'],
    stallPhoto: 'https://images.unsplash.com/photo-1561758033-d89a0ad1c3a0?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1561758033-d89a0ad1c3a0?w=800&h=400&fit=crop',
    reviews: {},
    averageRating: 0,
    aiScore: 3.9,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
    isActive: true,
  },
  {
    phone: '9876543214',
    vendorName: 'Sneha Joshi',
    vendorAge: 29,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    vendorQualification: 'B.Sc',
    vendorEmail: 'sneha@example.com',
    shopName: 'Sneha\'s Sweet Corner',
    shopLocation: { latitude: 19.0663, longitude: 73.0312 },
    shopAddress: 'Sanpada',
    parentCity: 'Navi Mumbai',
    dietaryDetails: ['vegetarian', 'glutenfree', 'vegan'],
    stallPhoto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=400&fit=crop',
    reviews: {},
    averageRating: 0,
    aiScore: 4.4,
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 345600000,
    isActive: true,
  },
];

// Mock customer data
const MOCK_CUSTOMERS = [
  {
    phone: '9123456789',
    name: 'Amit Patel',
    email: 'amit@example.com',
    dietaryPreferences: ['vegetarian', 'glutenfree'],
    location: { latitude: 19.0176, longitude: 73.0822 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456788',
    name: 'Neha Verma',
    email: 'neha@example.com',
    dietaryPreferences: ['vegan'],
    location: { latitude: 19.0273, longitude: 73.0954 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456787',
    name: 'Rahul Singh',
    email: 'rahul@example.com',
    dietaryPreferences: ['non-vegetarian'],
    location: { latitude: 19.0385, longitude: 73.1053 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456786',
    name: 'Priya Desai',
    email: 'priya.d@example.com',
    dietaryPreferences: ['vegetarian'],
    location: { latitude: 19.0820, longitude: 73.0313 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456785',
    name: 'Vikram Joshi',
    email: 'vikram@example.com',
    dietaryPreferences: ['non-vegetarian', 'glutenfree'],
    location: { latitude: 19.0663, longitude: 73.0312 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
];

async function cleanupDatabase() {
  console.log('\n🧹 Cleaning up existing data...');

  try {
    // Delete all vendors
    const vendorsSnapshot = await db.collection('vendors').get();
    let vendorCount = 0;
    const vendorBatch = db.batch();

    vendorsSnapshot.forEach((doc) => {
      vendorBatch.delete(doc.ref);
      vendorCount++;
    });

    if (vendorCount > 0) {
      await vendorBatch.commit();
      console.log(`   ✓ Deleted ${vendorCount} vendors`);
    } else {
      console.log(`   ✓ No vendors to delete`);
    }

    // Delete all customers
    const customersSnapshot = await db.collection('customers').get();
    let customerCount = 0;
    const customerBatch = db.batch();

    customersSnapshot.forEach((doc) => {
      customerBatch.delete(doc.ref);
      customerCount++;
    });

    if (customerCount > 0) {
      await customerBatch.commit();
      console.log(`   ✓ Deleted ${customerCount} customers`);
    } else {
      console.log(`   ✓ No customers to delete`);
    }

    return { vendorCount, customerCount };
  } catch (error) {
    console.error('❌ Error cleaning up database:', error.message);
    throw error;
  }
}

async function loadMockData() {
  console.log('\n📦 Loading fresh mock data...');

  try {
    // Load vendors in batches
    console.log(`   Adding ${MOCK_VENDORS.length} vendors...`);
    const vendorBatch = db.batch();

    MOCK_VENDORS.forEach((vendor) => {
      const vendorRef = db.collection('vendors').doc(vendor.phone);
      vendorBatch.set(vendorRef, vendor);
    });

    await vendorBatch.commit();
    console.log(`   ✓ Added ${MOCK_VENDORS.length} vendors`);

    // Load customers in batches
    console.log(`   Adding ${MOCK_CUSTOMERS.length} customers...`);
    const customerBatch = db.batch();

    MOCK_CUSTOMERS.forEach((customer) => {
      const customerRef = db.collection('customers').doc(customer.phone);
      customerBatch.set(customerRef, customer);
    });

    await customerBatch.commit();
    console.log(`   ✓ Added ${MOCK_CUSTOMERS.length} customers`);
  } catch (error) {
    console.error('❌ Error loading mock data:', error.message);
    throw error;
  }
}

async function validateDatabase() {
  console.log('\n✅ Validating database...');

  try {
    const vendorsSnapshot = await db.collection('vendors').get();
    const customersSnapshot = await db.collection('customers').get();

    console.log(`   ✓ Vendors in database: ${vendorsSnapshot.size}`);
    console.log(`   ✓ Customers in database: ${customersSnapshot.size}`);

    // Validate vendor structure
    vendorsSnapshot.forEach((doc) => {
      const vendor = doc.data();
      if (!vendor.id || !vendor.shopName || !vendor.shopLocation) {
        console.warn(`   ⚠ Vendor ${doc.id} missing required fields`);
      }
    });

    console.log('\n✅ Database validation complete!');
  } catch (error) {
    console.error('❌ Error validating database:', error.message);
    throw error;
  }
}

async function main() {
  console.log('═'.repeat(50));
  console.log('🚀 ThelaGenic Database Setup');
  console.log('═'.repeat(50));

  try {
    await cleanupDatabase();
    await loadMockData();
    await validateDatabase();

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Database setup completed successfully!');
    console.log('═'.repeat(50));
    console.log('\n📍 Vendors created:');
    MOCK_VENDORS.forEach((v) => {
      console.log(`   • ${v.shopName} (${v.shopAddress})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n' + '═'.repeat(50));
    console.error('❌ Setup failed!');
    console.error('═'.repeat(50));
    console.error(error);
    process.exit(1);
  }
}

main();
