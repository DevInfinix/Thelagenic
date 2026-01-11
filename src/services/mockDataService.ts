/**
 * Client-side Mock Data Loader
 * Loads fresh Navi Mumbai vendor mock data directly via Firebase client SDK
 * Run from the app after logging in as admin
 */

import { 
  collection, 
  writeBatch, 
  query, 
  getDocs, 
  deleteDoc,
  doc,
  db 
} from '@/src/services/firebaseConfig';

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
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop',
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 8.9,
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
    shopBannerUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
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
    stallPhoto: 'https://images.unsplash.com/photo-1565958011504-98d6efaceaf1?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1565958011504-98d6efaceaf1?w=800&h=400&fit=crop',
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
    vendorSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    vendorQualification: 'B.Tech',
    vendorPhone: '9876543213',
    vendorEmail: 'anil@example.com',
    shopName: 'Anil\'s Fast Food Junction',
    shopLocation: { latitude: 19.0820, longitude: 73.0313 },
    shopAddress: 'Vashi, Navi Mumbai',
    foodCategory: ['Fast Food', 'Burger', 'Pizza'],
    stallPhoto: 'https://images.unsplash.com/photo-1561758033-d89a0ad1c3a0?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1561758033-d89a0ad1c3a0?w=800&h=400&fit=crop',
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
    vendorName: 'Sneha Joshi',
    vendorAge: 29,
    vendorGender: 'Female',
    vendorSelfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    vendorQualification: 'B.Sc',
    vendorPhone: '9876543214',
    vendorEmail: 'sneha@example.com',
    shopName: 'Sneha\'s Sweet Corner',
    shopLocation: { latitude: 19.0663, longitude: 73.0312 },
    shopAddress: 'Sanpada, Navi Mumbai',
    foodCategory: ['Sweets', 'Desserts', 'Bakery'],
    stallPhoto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    stallVideo: '',
    fssaiCertificateUrl: '',
    aadharCardUrl: '',
    shopBannerUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=400&fit=crop',
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 8.7,
    badges: [],
    shopRank: 5,
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 345600000,
    isActive: true,
  },
];

const MOCK_CUSTOMERS = [
  {
    id: 'customer_001',
    phone: '9123456789',
    name: 'Amit Patel',
    email: 'amit@example.com',
    dietaryPreferences: ['vegetarian', 'glutenfree'],
    location: { latitude: 19.0176, longitude: 73.0822 },
    currentCity: 'Navi Mumbai',
    profilePhoto: null,
    createdAt: Date.now(),
  },
  {
    id: 'customer_002',
    phone: '9123456788',
    name: 'Neha Verma',
    email: 'neha@example.com',
    dietaryPreferences: ['vegan'],
    location: { latitude: 19.0273, longitude: 73.0954 },
    currentCity: 'Navi Mumbai',
    profilePhoto: null,
    createdAt: Date.now(),
  },
];

export const mockDataService = {
  async loadMockData() {
    try {
      console.log('🔄 Loading fresh mock data...');

      const batch = writeBatch(db);

      // Load vendors
      console.log('📦 Adding 5 vendors...');
      for (const vendor of MOCK_VENDORS) {
        const vendorRef = doc(collection(db, 'vendors'), vendor.id);
        batch.set(vendorRef, vendor);
      }

      // Load customers
      console.log('👥 Adding 2 customers...');
      for (const customer of MOCK_CUSTOMERS) {
        const customerRef = doc(collection(db, 'customers'), customer.id);
        batch.set(customerRef, customer);
      }

      await batch.commit();
      console.log('✅ Mock data loaded successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error loading mock data:', error);
      throw error;
    }
  },

  async cleanupDatabase() {
    try {
      console.log('🧹 Cleaning up existing data...');

      // Delete all vendors
      const vendorQuery = query(collection(db, 'vendors'));
      const vendorDocs = await getDocs(vendorQuery);
      let vendorCount = 0;
      for (const doc of vendorDocs.docs) {
        await deleteDoc(doc.ref);
        vendorCount++;
      }
      console.log(`   Deleted ${vendorCount} vendors`);

      // Delete all customers
      const customerQuery = query(collection(db, 'customers'));
      const customerDocs = await getDocs(customerQuery);
      let customerCount = 0;
      for (const doc of customerDocs.docs) {
        await deleteDoc(doc.ref);
        customerCount++;
      }
      console.log(`   Deleted ${customerCount} customers`);

      return { vendorCount, customerCount };
    } catch (error) {
      console.error('❌ Error cleaning up database:', error);
      throw error;
    }
  },

  async resetAndLoadData() {
    try {
      await this.cleanupDatabase();
      await this.loadMockData();
      console.log('✅ Database reset and fresh data loaded!');
      return true;
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  },
};
