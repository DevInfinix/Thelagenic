/**
 * Firebase Mock Vendor Data Upload Script
 * Run with: node scripts/uploadVendorData.js
 * 
 * This script uploads comprehensive mock vendor data to Firebase
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

const MOCK_VENDORS = [
  {
    id: 'vendor_001',
    vendorName: 'Rajesh Kumar',
    vendorAge: 38,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Com',
    shopName: 'Raju\'s Cyber Chaat',
    shopLocation: { latitude: 28.7041, longitude: 77.1025 },
    shopAddress: 'Cyber City, Delhi, India',
    foodCategory: ['Street Food', 'Chaat', 'Indian'],
    stallPhoto: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video1.mp4',
    fssaiCertificate: 'FSSAI/2023/12345',
    aadharCard: 'XXXX-XXXX-XXXX-1234',
    aiScore: 8.9,
    userReviewScore: 4.8,
    userComments: [
      {
        id: 'review_1',
        userId: 'user_123',
        userName: 'Priya Singh',
        rating: 5,
        comment: 'Amazing food quality and super hygienic! Highly recommended.',
        timestamp: Date.now() - 86400000,
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Hygiene Champion',
        icon: '🏆',
        description: 'Achieved 100+ happy customers',
        unlockedAt: Date.now() - 2592000000,
      },
    ],
    shopRank: 1,
    createdAt: Date.now() - 5184000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_002',
    vendorName: 'Priya Sharma',
    vendorAge: 32,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    vendorQualification: 'B.Sc',
    shopName: 'Neon Momos Point',
    shopLocation: { latitude: 28.6139, longitude: 77.2023 },
    shopAddress: 'Gurgaon, Haryana, India',
    foodCategory: ['Momos', 'Dumplings', 'Asian'],
    stallPhoto: 'https://images.unsplash.com/photo-1626804475297-411dbe15478d?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video2.mp4',
    fssaiCertificate: 'FSSAI/2023/12346',
    aadharCard: 'XXXX-XXXX-XXXX-5678',
    aiScore: 7.5,
    userReviewScore: 4.2,
    userComments: [],
    badges: [],
    shopRank: 5,
    createdAt: Date.now() - 3888000000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'vendor_003',
    vendorName: 'Vikram Singh',
    vendorAge: 45,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    vendorQualification: 'Diploma in Hospitality',
    shopName: 'Future Pav Bhaji',
    shopLocation: { latitude: 28.5355, longitude: 77.391 },
    shopAddress: 'Mumbai, Maharashtra, India',
    foodCategory: ['Pav Bhaji', 'Street Food', 'Indian'],
    stallPhoto: 'https://images.unsplash.com/photo-1606491956689-2ea28c674675?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video3.mp4',
    fssaiCertificate: 'FSSAI/2023/12347',
    aadharCard: 'XXXX-XXXX-XXXX-9012',
    aiScore: 9.2,
    userReviewScore: 4.9,
    userComments: [],
    badges: [],
    shopRank: 2,
    createdAt: Date.now() - 5184000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_004',
    vendorName: 'Anita Verma',
    vendorAge: 28,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1507537362392-86a1f3f8a02e?w=400&h=400&fit=crop',
    vendorQualification: 'B.A',
    shopName: 'Samosa Queen',
    shopLocation: { latitude: 28.6505, longitude: 77.2303 },
    shopAddress: 'Noida, Uttar Pradesh, India',
    foodCategory: ['Samosa', 'Street Food', 'Snacks'],
    stallPhoto: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd57e5b?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video4.mp4',
    fssaiCertificate: 'FSSAI/2023/12348',
    aadharCard: 'XXXX-XXXX-XXXX-3456',
    aiScore: 8.1,
    userReviewScore: 4.5,
    userComments: [],
    badges: [],
    shopRank: 3,
    createdAt: Date.now() - 4320000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_005',
    vendorName: 'Mohammad Hassan',
    vendorAge: 40,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'Diploma',
    shopName: 'Hassan\'s Chinese Corner',
    shopLocation: { latitude: 28.5244, longitude: 77.1855 },
    shopAddress: 'Greater Noida, Uttar Pradesh, India',
    foodCategory: ['Chinese', 'Noodles', 'Asian'],
    stallPhoto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video5.mp4',
    fssaiCertificate: 'FSSAI/2023/12349',
    aadharCard: 'XXXX-XXXX-XXXX-7890',
    aiScore: 7.8,
    userReviewScore: 4.4,
    userComments: [],
    badges: [],
    shopRank: 4,
    createdAt: Date.now() - 2592000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_006',
    vendorName: 'Sanjana Desai',
    vendorAge: 35,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1517765552473-30f1b8efde6c?w=400&h=400&fit=crop',
    vendorQualification: 'M.Sc',
    shopName: 'Healthy Bites Cafe',
    shopLocation: { latitude: 28.6162, longitude: 77.2297 },
    shopAddress: 'DLF Cyber City, Gurgaon, India',
    foodCategory: ['Healthy', 'Salads', 'Organic'],
    stallPhoto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video6.mp4',
    fssaiCertificate: 'FSSAI/2023/12350',
    aadharCard: 'XXXX-XXXX-XXXX-2468',
    aiScore: 8.6,
    userReviewScore: 4.7,
    userComments: [],
    badges: [],
    shopRank: 6,
    createdAt: Date.now() - 1728000000,
    updatedAt: Date.now(),
  },
  {
    id: 'vendor_007',
    vendorName: 'Suresh Patel',
    vendorAge: 50,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507539803526-c550543ae5a0?w=400&h=400&fit=crop',
    vendorQualification: 'B.Tech',
    shopName: 'Dosa King Express',
    shopLocation: { latitude: 28.7090, longitude: 77.1270 },
    shopAddress: 'Connaught Place, Delhi, India',
    foodCategory: ['Dosa', 'South Indian', 'Breakfast'],
    stallPhoto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    stallVideo: 'https://example.com/video7.mp4',
    fssaiCertificate: 'FSSAI/2023/12351',
    aadharCard: 'XXXX-XXXX-XXXX-1357',
    aiScore: 9.0,
    userReviewScore: 4.8,
    userComments: [],
    badges: [],
    shopRank: 7,
    createdAt: Date.now() - 5184000000,
    updatedAt: Date.now(),
  },
];

async function uploadVendorData() {
  try {
    console.log('📤 Uploading mock vendor data to Firebase...\n');

    let uploaded = 0;
    let failed = 0;

    for (const vendor of MOCK_VENDORS) {
      try {
        await db.collection('vendors').doc(vendor.id).set(vendor);
        console.log(`✅ Uploaded: ${vendor.shopName} (${vendor.id})`);
        uploaded++;
      } catch (error) {
        console.error(`❌ Failed to upload ${vendor.shopName}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   ✅ Uploaded: ${uploaded} vendors`);
    console.log(`   ❌ Failed: ${failed} vendors`);
    console.log(`\n🎉 Mock vendor data upload complete!`);
    
    return uploaded > 0;
  } catch (error) {
    console.error('❌ Error uploading vendor data:', error.message);
    return false;
  }
}

async function main() {
  const initialized = await initializeFirebase();
  if (!initialized) {
    process.exit(1);
  }

  const success = await uploadVendorData();
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
