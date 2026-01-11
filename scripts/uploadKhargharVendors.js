/**
 * Firebase Kharghar Vendor Data Upload Script
 * Run with: node scripts/uploadKhargharVendors.js
 * 
 * This script uploads mock vendor data for Kharghar, Mumbai area
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

async function initializeFirebase() {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...\n');
    
    const credentialsPath = path.join(__dirname, '../credentials/serviceAccountKey.json');
    
    try {
      const serviceAccountJSON = fs.readFileSync(credentialsPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJSON);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'hygieatvendor',
      });
      console.log('✅ Firebase Admin SDK initialized\n');
    } catch (err) {
      console.error('❌ Failed to initialize Firebase:', err.message);
      process.exit(1);
    }
    
    db = admin.firestore();
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    return false;
  }
}

// Kharghar, Mumbai center: 19.0176, 73.0822
// Create vendors distributed around this area with ±0.01 variation
const KHARGHAR_VENDORS = [
  {
    id: 'vendor_kharghar_001',
    vendorName: 'Amit Patel',
    vendorAge: 35,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Com',
    shopName: 'Kharghar Chaat House',
    shopLocation: { latitude: 19.0176, longitude: 73.0822 },
    shopAddress: 'Sector 7, Kharghar, Mumbai, 410210',
    foodCategory: ['Chaat', 'Street Food', 'Indian'],
    stallPhoto: 'https://images.unsplash.com/photo-1631292784640-e2b9ad66bda4?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/kharghar1.mp4',
    fssaiCertificate: 'FSSAI/2024/KH001',
    aadharCard: 'XXXX-XXXX-XXXX-0001',
    aiScore: 8.7,
    userReviewScore: 4.7,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_123',
        userName: 'Rahul Desai',
        rating: 5,
        comment: 'Best pani puri in Kharghar! Super hygienic and fresh.',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'review_2',
        userId: 'user_124',
        userName: 'Neha Sharma',
        rating: 4,
        comment: 'Great taste, slightly long wait during peak hours.',
        timestamp: Date.now() - 172800000,
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Hygiene Champion',
        icon: '🏆',
        description: 'Consistently high hygiene scores',
        unlockedAt: Date.now() - 2592000000,
      },
    ],
    shopRank: 1,
    createdAt: Date.now() - 5184000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_kharghar_002',
    vendorName: 'Priya Nair',
    vendorAge: 30,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    vendorQualification: 'B.Sc',
    shopName: 'Momos Magic Kharghar',
    shopLocation: { latitude: 19.0156, longitude: 73.0842 },
    shopAddress: 'Sector 8, Kharghar, Mumbai, 410210',
    foodCategory: ['Momos', 'Asian', 'Dumplings'],
    stallPhoto: 'https://images.unsplash.com/photo-1626804475297-411dbe15478d?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/kharghar2.mp4',
    fssaiCertificate: 'FSSAI/2024/KH002',
    aadharCard: 'XXXX-XXXX-XXXX-0002',
    aiScore: 8.4,
    userReviewScore: 4.6,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_125',
        userName: 'Vikram Kumar',
        rating: 5,
        comment: 'Delicious momos with amazing sauces!',
        timestamp: Date.now() - 259200000,
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Popular Choice',
        icon: '⭐',
        description: '100+ satisfied customers',
        unlockedAt: Date.now() - 1728000000,
      },
    ],
    shopRank: 2,
    createdAt: Date.now() - 3888000000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'vendor_kharghar_003',
    vendorName: 'Suresh Reddy',
    vendorAge: 42,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    vendorQualification: 'Diploma in Hospitality',
    shopName: 'Pav Bhaji Express',
    shopLocation: { latitude: 19.0196, longitude: 73.0802 },
    shopAddress: 'Sector 9, Kharghar, Mumbai, 410210',
    foodCategory: ['Pav Bhaji', 'Street Food', 'Butter Dishes'],
    stallPhoto: 'https://images.unsplash.com/photo-1606491956689-2ea28c674675?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/kharghar3.mp4',
    fssaiCertificate: 'FSSAI/2024/KH003',
    aadharCard: 'XXXX-XXXX-XXXX-0003',
    aiScore: 9.1,
    userReviewScore: 4.8,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_126',
        userName: 'Anjali Verma',
        rating: 5,
        comment: 'Best pav bhaji in Mumbai! Fresh butter every time.',
        timestamp: Date.now() - 345600000,
      },
      {
        id: 'review_2',
        userId: 'user_127',
        userName: 'Rohan Singh',
        rating: 5,
        comment: 'Consistently good quality and taste. 5 stars!',
        timestamp: Date.now() - 432000000,
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Quality Leader',
        icon: '👑',
        description: 'Top rated in category',
        unlockedAt: Date.now() - 2592000000,
      },
      {
        id: 'badge_2',
        name: 'Hygiene Expert',
        icon: '✨',
        description: 'Highest hygiene standards',
        unlockedAt: Date.now() - 1728000000,
      },
    ],
    shopRank: 1,
    createdAt: Date.now() - 5184000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_kharghar_004',
    vendorName: 'Divya Gupta',
    vendorAge: 28,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1507537362392-86a1f3f8a02e?w=400&h=400&fit=crop',
    vendorQualification: 'B.A',
    shopName: 'Samosa Corner',
    shopLocation: { latitude: 19.0186, longitude: 73.0832 },
    shopAddress: 'Sector 7A, Kharghar, Mumbai, 410210',
    foodCategory: ['Samosa', 'Snacks', 'Street Food'],
    stallPhoto: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd57e5b?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/kharghar4.mp4',
    fssaiCertificate: 'FSSAI/2024/KH004',
    aadharCard: 'XXXX-XXXX-XXXX-0004',
    aiScore: 8.2,
    userReviewScore: 4.5,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_128',
        userName: 'Pooja Rao',
        rating: 4,
        comment: 'Crispy samosas with good flavors. Recommended!',
        timestamp: Date.now() - 518400000,
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Rising Star',
        icon: '🌟',
        description: 'New but trending vendor',
        unlockedAt: Date.now() - 864000000,
      },
    ],
    shopRank: 4,
    createdAt: Date.now() - 2592000000,
    updatedAt: Date.now() - 172800000,
  },
  {
    id: 'vendor_kharghar_005',
    vendorName: 'Arun Kumar',
    vendorAge: 40,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Tech',
    shopName: 'Chinese Wok Kharghar',
    shopLocation: { latitude: 19.0166, longitude: 73.0862 },
    shopAddress: 'Sector 10, Kharghar, Mumbai, 410210',
    foodCategory: ['Chinese', 'Asian', 'Noodles'],
    stallPhoto: 'https://images.unsplash.com/photo-1565958011504-98d00b2b3d4a?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/kharghar5.mp4',
    fssaiCertificate: 'FSSAI/2024/KH005',
    aadharCard: 'XXXX-XXXX-XXXX-0005',
    aiScore: 7.9,
    userReviewScore: 4.4,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_129',
        userName: 'Arjun Verma',
        rating: 4,
        comment: 'Good taste and generous portions. Worth it!',
        timestamp: Date.now() - 604800000,
      },
    ],
    badges: [],
    shopRank: 5,
    createdAt: Date.now() - 3456000000,
    updatedAt: Date.now() - 259200000,
  },
  {
    id: 'vendor_kharghar_006',
    vendorName: 'Meera Singh',
    vendorAge: 33,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    vendorQualification: 'Degree in Culinary Arts',
    shopName: 'Dosa Paradise',
    shopLocation: { latitude: 19.0206, longitude: 73.0812 },
    shopAddress: 'Sector 6, Kharghar, Mumbai, 410210',
    foodCategory: ['South Indian', 'Dosa', 'Idli'],
    stallPhoto: 'https://images.unsplash.com/photo-1585238341710-4434b3a11db7?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/kharghar6.mp4',
    fssaiCertificate: 'FSSAI/2024/KH006',
    aadharCard: 'XXXX-XXXX-XXXX-0006',
    aiScore: 8.6,
    userReviewScore: 4.7,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_130',
        userName: 'Deepak Nair',
        rating: 5,
        comment: 'Authentic South Indian food with perfect taste!',
        timestamp: Date.now() - 691200000,
      },
      {
        id: 'review_2',
        userId: 'user_131',
        userName: 'Kavya Sharma',
        rating: 5,
        comment: 'Best dosas in the area. Highly recommended!',
        timestamp: Date.now() - 777600000,
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Specialty Expert',
        icon: '🎖️',
        description: 'Master of South Indian cuisine',
        unlockedAt: Date.now() - 2592000000,
      },
    ],
    shopRank: 3,
    createdAt: Date.now() - 4320000000,
    updatedAt: Date.now() - 86400000,
  },
];

async function uploadVendors() {
  if (!(await initializeFirebase())) return;

  try {
    console.log(`📤 Uploading ${KHARGHAR_VENDORS.length} Kharghar vendors to Firebase...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const vendor of KHARGHAR_VENDORS) {
      try {
        const vendorRef = db.collection('vendors').doc(vendor.id);
        await vendorRef.set(vendor);
        console.log(`✅ Uploaded: ${vendor.shopName} (${vendor.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to upload ${vendor.shopName}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Upload Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📍 All vendors uploaded for Kharghar, Mumbai area`);
    console.log(`${'='.repeat(50)}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading vendors:', error);
    process.exit(1);
  }
}

uploadVendors();
