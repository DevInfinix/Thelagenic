/**
 * Database Setup Script
 * - Cleans up all vendor and customer data
 * - Validates database structure
 * - Loads fresh mock data with Navi Mumbai locations
 * - Sets up proper schema with reviews and ratings
 */

const admin = require('firebase-admin');
const path = require('path');

// For CommonJS, __dirname and __filename are already available
// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../thelagenic-fb4a4-firebase-adminsdk-q6aw5-d5c6b90a49.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://thelagenic-fb4a4.firebaseio.com'
});

const db = admin.firestore();

// Mock vendor data (Navi Mumbai locations)
const MOCK_VENDORS = [
  {
    id: 'vendor_001',
    vendorName: 'Rajesh Kumar',
    vendorAge: 38,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Com',
    vendorPhone: '9876543210',
    vendorEmail: 'rajesh@example.com',
    shopName: 'Raju\'s Cyber Chaat',
    shopLocation: { latitude: 19.0176, longitude: 73.0822 },
    shopAddress: 'Kharghar, Navi Mumbai',
    foodCategory: ['Street Food', 'Chaat', 'Indian'],
    stallPhoto: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop',
    stallVideo: '',
    // Upload fields (for vendor app)
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: '',
    // Reviews and ratings
    reviews: {}, // { userId: { rating: 5, comment: 'Great!', timestamp: 123456 } }
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    // AI score
    aiScore: 8.9,
    // Metadata
    badges: [],
    shopRank: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  },
  {
    id: 'vendor_002',
    vendorName: 'Priya Sharma',
    vendorAge: 32,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    vendorQualification: 'Diploma',
    vendorPhone: '9876543211',
    vendorEmail: 'priya@example.com',
    shopName: 'Priya\'s Healthy Bites',
    shopLocation: { latitude: 19.0273, longitude: 73.0954 },
    shopAddress: 'Nerul, Navi Mumbai',
    foodCategory: ['Healthy', 'Vegetarian', 'Organic'],
    stallPhoto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: '',
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 9.2,
    badges: [],
    shopRank: 2,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    isActive: true,
  },
  {
    id: 'vendor_003',
    vendorName: 'Mohammed Ahmed',
    vendorAge: 45,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    vendorQualification: 'B.A',
    vendorPhone: '9876543212',
    vendorEmail: 'mohammed@example.com',
    shopName: 'Ahmed\'s Biryani Corner',
    shopLocation: { latitude: 19.0385, longitude: 73.1053 },
    shopAddress: 'Seawoods, Navi Mumbai',
    foodCategory: ['Biryani', 'Hyderabadi', 'Indian'],
    stallPhoto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: '',
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 8.5,
    badges: [],
    shopRank: 3,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    isActive: true,
  },
  {
    id: 'vendor_004',
    vendorName: 'Anil Desai',
    vendorAge: 41,
    vendorGender: 'Male',
    vendorSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    vendorQualification: 'B.Tech',
    vendorPhone: '9876543213',
    vendorEmail: 'anil@example.com',
    shopName: 'Anil\'s Fast Food Junction',
    shopLocation: { latitude: 19.0820, longitude: 73.0313 },
    shopAddress: 'Vashi, Navi Mumbai',
    foodCategory: ['Fast Food', 'Burger', 'Pizz'],
    stallPhoto: 'https://images.unsplash.com/photo-1561758033-d89a0ad1c3a0?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: '',
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 7.8,
    badges: [],
    shopRank: 4,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
    isActive: true,
  },
  {
    id: 'vendor_005',
    vendorName: 'Sneha Gupta',
    vendorAge: 28,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    vendorQualification: 'B.Sc',
    vendorPhone: '9876543214',
    vendorEmail: 'sneha@example.com',
    shopName: 'Sneha\'s Sweet Corner',
    shopLocation: { latitude: 19.0663, longitude: 73.0312 },
    shopAddress: 'Sanpada, Navi Mumbai',
    foodCategory: ['Desserts', 'Sweets', 'Indian'],
    stallPhoto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: '',
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 9.0,
    badges: [],
    shopRank: 5,
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 345600000,
    isActive: true,
  },
];

// Mock customer data
const MOCK_CUSTOMERS = [
  {
    id: 'customer_001',
    phone: '9988776655',
    name: 'Arjun Singh',
    email: 'arjun@example.com',
    dietaryPreferences: ['vegetarian'],
    location: { latitude: 19.0176, longitude: 73.0822 },
    currentCity: 'Kharghar',
    reviews: {
      vendor_001: { rating: 5, comment: 'Excellent food!', timestamp: Date.now() },
      vendor_002: { rating: 4, comment: 'Good quality', timestamp: Date.now() - 86400000 },
    },
    createdAt: Date.now() - 432000000,
    updatedAt: Date.now(),
  },
  {
    id: 'customer_002',
    phone: '8877665544',
    name: 'Neha Patel',
    email: 'neha@example.com',
    dietaryPreferences: ['vegan', 'glutenfree'],
    location: { latitude: 19.0273, longitude: 73.0954 },
    currentCity: 'Nerul',
    reviews: {
      vendor_003: { rating: 5, comment: 'Amazing biryani!', timestamp: Date.now() },
    },
    createdAt: Date.now() - 518400000,
    updatedAt: Date.now(),
  },
];

async function cleanupDatabase() {
  console.log('🧹 Cleaning up database...');
  try {
    // Delete all vendors
    const vendorsSnapshot = await db.collection('vendors').get();
    for (const doc of vendorsSnapshot.docs) {
      await doc.ref.delete();
      console.log(`  ✓ Deleted vendor: ${doc.id}`);
    }

    // Delete all customers
    const customersSnapshot = await db.collection('customers').get();
    for (const doc of customersSnapshot.docs) {
      await doc.ref.delete();
      console.log(`  ✓ Deleted customer: ${doc.id}`);
    }

    console.log('✅ Database cleaned successfully\n');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  }
}

async function loadMockData() {
  console.log('📦 Loading fresh mock data...');
  try {
    // Load vendors
    for (const vendor of MOCK_VENDORS) {
      await db.collection('vendors').doc(vendor.id).set(vendor);
      console.log(`  ✓ Added vendor: ${vendor.shopName}`);
    }

    // Load customers
    for (const customer of MOCK_CUSTOMERS) {
      await db.collection('customers').doc(customer.id).set(customer);
      console.log(`  ✓ Added customer: ${customer.name}`);
    }

    console.log('✅ Mock data loaded successfully\n');
  } catch (error) {
    console.error('❌ Error loading mock data:', error);
    throw error;
  }
}

async function validateDatabase() {
  console.log('🔍 Validating database structure...');
  try {
    // Check vendors
    const vendorsSnapshot = await db.collection('vendors').get();
    console.log(`  ✓ Vendors collection: ${vendorsSnapshot.size} documents`);

    // Validate vendor structure
    for (const doc of vendorsSnapshot.docs) {
      const vendor = doc.data();
      const requiredFields = [
        'vendorName', 'shopName', 'shopLocation', 'reviews',
        'totalRating', 'ratingCount', 'averageRating'
      ];

      const missingFields = requiredFields.filter(field => !(field in vendor));
      if (missingFields.length > 0) {
        console.warn(`    ⚠️  Vendor ${doc.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`    ✓ Vendor ${doc.id}: Valid`);
      }
    }

    // Check customers
    const customersSnapshot = await db.collection('customers').get();
    console.log(`  ✓ Customers collection: ${customersSnapshot.size} documents`);

    // Validate customer structure
    for (const doc of customersSnapshot.docs) {
      const customer = doc.data();
      const requiredFields = ['phone', 'name', 'reviews', 'dietaryPreferences'];

      const missingFields = requiredFields.filter(field => !(field in customer));
      if (missingFields.length > 0) {
        console.warn(`    ⚠️  Customer ${doc.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`    ✓ Customer ${doc.id}: Valid`);
      }
    }

    console.log('✅ Database validation complete\n');
  } catch (error) {
    console.error('❌ Error validating database:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Step 1: Cleanup
    await cleanupDatabase();

    // Step 2: Load fresh data
    await loadMockData();

    // Step 3: Validate
    await validateDatabase();

    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
