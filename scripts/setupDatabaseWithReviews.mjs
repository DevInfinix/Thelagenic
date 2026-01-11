#!/usr/bin/env node

/**
 * Database Setup Script with Reviews
 * Initializes Firebase with mock data for Navi Mumbai vendors and customer reviews
 * Run: node scripts/setupDatabaseWithReviews.mjs
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account key
const serviceAccountPath = path.join(__dirname, '../credentials/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

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
    totalRating: 0,
    ratingCount: 0,
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
    totalRating: 0,
    ratingCount: 0,
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
    totalRating: 0,
    ratingCount: 0,
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
    totalRating: 0,
    ratingCount: 0,
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
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 4.4,
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 345600000,
    isActive: true,
  },
];

// Mock customer data with increased number of users
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
  {
    phone: '9123456784',
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    dietaryPreferences: ['vegetarian', 'vegan'],
    location: { latitude: 19.0416, longitude: 73.0243 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456783',
    name: 'Rajesh Mehta',
    email: 'rajesh.m@example.com',
    dietaryPreferences: ['non-vegetarian'],
    location: { latitude: 19.0151, longitude: 73.0789 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456782',
    name: 'Pooja Gupta',
    email: 'pooja@example.com',
    dietaryPreferences: ['vegetarian', 'glutenfree'],
    location: { latitude: 19.0327, longitude: 73.0547 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456781',
    name: 'Kunal Verma',
    email: 'kunal@example.com',
    dietaryPreferences: ['non-vegetarian', 'vegan'],
    location: { latitude: 19.0553, longitude: 73.0442 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456780',
    name: 'Sneha Reddy',
    email: 'sneha.r@example.com',
    dietaryPreferences: ['vegetarian'],
    location: { latitude: 19.0689, longitude: 73.0261 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456779',
    name: 'Rohan Desai',
    email: 'rohan@example.com',
    dietaryPreferences: ['non-vegetarian', 'glutenfree'],
    location: { latitude: 19.0223, longitude: 73.0123 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
  {
    phone: '9123456778',
    name: 'Isha Patel',
    email: 'isha@example.com',
    dietaryPreferences: ['vegetarian', 'vegan'],
    location: { latitude: 19.0776, longitude: 73.0567 },
    currentCity: 'Navi Mumbai',
    createdAt: Date.now(),
  },
];

// Mock reviews for each vendor
const MOCK_REVIEWS = {
  '9876543210': [
    { userId: '9123456789', rating: 5, comment: 'Amazing food quality and super hygienic! Highly recommended.', timestamp: Date.now() - 86400000 },
    { userId: '9123456788', rating: 4, comment: 'Good taste and clean preparation. Will visit again.', timestamp: Date.now() - 172800000 },
    { userId: '9123456787', rating: 5, comment: 'Best chaat in Kharghar! Fresh ingredients and amazing flavors.', timestamp: Date.now() - 259200000 },
    { userId: '9123456786', rating: 4.5, comment: 'Great variety and reasonable prices. The pani puri is exceptional!', timestamp: Date.now() - 345600000 },
    { userId: '9123456785', rating: 4, comment: 'Decent food but can improve on service speed. Quality is good though.', timestamp: Date.now() - 432000000 },
  ],
  '9876543211': [
    { userId: '9123456784', rating: 5, comment: 'Healthy options with great taste! Love their salads and smoothies.', timestamp: Date.now() - 86400000 },
    { userId: '9123456783', rating: 4.5, comment: 'Excellent healthy food choices. Fresh ingredients and good portions.', timestamp: Date.now() - 172800000 },
    { userId: '9123456782', rating: 5, comment: 'Perfect place for health-conscious people. Their quinoa bowl is amazing!', timestamp: Date.now() - 259200000 },
    { userId: '9123456781', rating: 4, comment: 'Good food but a bit pricey. Quality is definitely worth it though.', timestamp: Date.now() - 345600000 },
  ],
  '9876543212': [
    { userId: '9123456780', rating: 5, comment: 'Authentic Hyderabadi biryani with perfect spice levels. Must try!', timestamp: Date.now() - 86400000 },
    { userId: '9123456779', rating: 4.5, comment: 'Great taste and generous portions. The kebabs are also excellent.', timestamp: Date.now() - 172800000 },
    { userId: '9123456778', rating: 5, comment: 'Best biryani in Seawoods area. Authentic flavors and good quality.', timestamp: Date.now() - 259200000 },
    { userId: '9123456789', rating: 4, comment: 'Good food but service can be slow during peak hours.', timestamp: Date.now() - 345600000 },
  ],
  '9876543213': [
    { userId: '9123456787', rating: 4, comment: 'Decent fast food with good burgers and fries. Average prices.', timestamp: Date.now() - 86400000 },
    { userId: '9123456786', rating: 3.5, comment: 'Food is okay but not exceptional. Good for quick bites.', timestamp: Date.now() - 172800000 },
    { userId: '9123456785', rating: 4, comment: 'Good variety of fast food options. Pizza is decent for the price.', timestamp: Date.now() - 259200000 },
    { userId: '9123456784', rating: 4.5, comment: 'Consistent quality and good service. Their pasta dishes are nice.', timestamp: Date.now() - 345600000 },
  ],
  '9876543214': [
    { userId: '9123456782', rating: 5, comment: 'Amazing sweets and desserts! Everything is fresh and delicious.', timestamp: Date.now() - 86400000 },
    { userId: '9123456781', rating: 5, comment: 'Best sweet shop in Sanpada. Their gulab jamun is to die for!', timestamp: Date.now() - 172800000 },
    { userId: '9123456780', rating: 4.5, comment: 'Good quality sweets at reasonable prices. Packaging is excellent.', timestamp: Date.now() - 259200000 },
    { userId: '9123456779', rating: 5, comment: 'Authentic traditional sweets with perfect sweetness levels.', timestamp: Date.now() - 345600000 },
    { userId: '9123456778', rating: 4, comment: 'Good variety but some items could be fresher. Overall good experience.', timestamp: Date.now() - 432000000 },
  ],
};

// Function to calculate average rating
function calculateAverageRating(reviews) {
  if (!reviews || Object.keys(reviews).length === 0) {
    return 0;
  }
  
  const allRatings = Object.values(reviews).map(review => review.rating);
  const totalRating = allRatings.reduce((sum, rating) => sum + rating, 0);
  return totalRating / allRatings.length;
}

// Function to calculate total rating
function calculateTotalRating(reviews) {
  if (!reviews || Object.keys(reviews).length === 0) {
    return 0;
  }
  
  const allRatings = Object.values(reviews).map(review => review.rating);
  return allRatings.reduce((sum, rating) => sum + rating, 0);
}

// Function to get rating count
function getRatingCount(reviews) {
  return reviews ? Object.keys(reviews).length : 0;
}

// Process vendors with reviews
const processedVendors = MOCK_VENDORS.map(vendor => {
  const vendorReviews = {};
  
  if (MOCK_REVIEWS[vendor.phone]) {
    MOCK_REVIEWS[vendor.phone].forEach(review => {
      vendorReviews[review.userId] = {
        rating: review.rating,
        comment: review.comment,
        timestamp: review.timestamp,
      };
    });
  }
  
  const averageRating = calculateAverageRating(vendorReviews);
  const totalRating = calculateTotalRating(vendorReviews);
  const ratingCount = getRatingCount(vendorReviews);
  
  return {
    ...vendor,
    reviews: vendorReviews,
    totalRating,
    ratingCount,
    averageRating,
  };
});

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
    console.log(`   Adding ${processedVendors.length} vendors with reviews...`);
    const vendorBatch = db.batch();

    processedVendors.forEach((vendor) => {
      const vendorRef = db.collection('vendors').doc(vendor.phone);
      vendorBatch.set(vendorRef, vendor);
    });

    await vendorBatch.commit();
    console.log(`   ✓ Added ${processedVendors.length} vendors`);

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

    // Validate vendor structure and ratings
    vendorsSnapshot.forEach((doc) => {
      const vendor = doc.data();
      if (!vendor.phone || !vendor.shopName || !vendor.shopLocation) {
        console.warn(`   ⚠ Vendor ${doc.id} missing required fields`);
      }
      
      if (vendor.averageRating === 0 && vendor.ratingCount > 0) {
        console.warn(`   ⚠ Vendor ${doc.id} has reviews but zero average rating`);
      }
    });

    // Show vendor ratings summary
    console.log('\n📊 Vendor Ratings Summary:');
    vendorsSnapshot.forEach((doc) => {
      const vendor = doc.data();
      console.log(`   • ${vendor.shopName}: ${vendor.averageRating.toFixed(1)}★ (${vendor.ratingCount} reviews)`);
    });

    console.log('\n✅ Database validation complete!');
  } catch (error) {
    console.error('❌ Error validating database:', error.message);
    throw error;
  }
}

async function main() {
  console.log('═'.repeat(50));
  console.log('🚀 ThelaGenic Database Setup with Reviews');
  console.log('═'.repeat(50));

  try {
    await cleanupDatabase();
    await loadMockData();
    await validateDatabase();

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Database setup completed successfully!');
    console.log('═'.repeat(50));
    console.log('\n📍 Vendors created with ratings:');
    processedVendors.forEach((v) => {
      console.log(`   • ${v.shopName} - ${v.averageRating.toFixed(1)}★ (${v.ratingCount} reviews)`);
    });

    console.log('\n👥 Customers created:');
    MOCK_CUSTOMERS.forEach((c) => {
      console.log(`   • ${c.name} (${c.phone})`);
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
