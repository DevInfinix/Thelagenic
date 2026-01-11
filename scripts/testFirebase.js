/**
 * Firebase Connectivity Test Script
 * Run with: node --input-type=module scripts/testFirebase.js
 * 
 * This script checks:
 * 1. Firebase connection status
 * 2. Database structure and collections
 * 3. Existing data in each collection
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Note: You need to download your service account key from Firebase Console
// Place it at: credentials/serviceAccountKey.json
let db;

async function initializeFirebase() {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...\n');
    
    // Try to load service account key
    const credentialsPath = path.join(__dirname, '../credentials/serviceAccountKey.json');
    
    try {
      // Read and parse JSON file for ES modules compatibility
      const serviceAccountJSON = fs.readFileSync(credentialsPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJSON);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'hygieatvendor',
      });
      console.log('✅ Firebase Admin SDK initialized with credentials\n');
    } catch (err) {
      console.log('⚠️  Service account key not found at:', credentialsPath);
      console.log('    Trying to use GOOGLE_APPLICATION_CREDENTIALS env variable...\n');
      
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error('❌ ERROR: No Firebase credentials found!');
        console.error('   Please download your service account key from:');
        console.error('   Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
        console.error('   Then place it at: credentials/serviceAccountKey.json');
        process.exit(1);
      }
      
      admin.initializeApp({
        projectId: 'hygieatvendor',
      });
    }
    
    db = admin.firestore();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return false;
  }
}

async function testConnection() {
  try {
    console.log('🌐 Testing Firebase Connection...\n');
    
    // Try a simple query
    const testDoc = await db.collection('_connection_test').doc('ping').get();
    console.log('✅ Firebase connection successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return false;
  }
}

async function checkDatabaseStructure() {
  try {
    console.log('📊 Checking Database Structure...\n');
    
    const collections = ['customers', 'vendors', 'phoneIndex'];
    const results = {};
    
    for (const collectionName of collections) {
      try {
        const countSnapshot = await db.collection(collectionName).count().get();
        const count = countSnapshot.data().count;
        const docs = [];
        
        // Get sample documents
        const allDocs = await db.collection(collectionName).limit(3).get();
        allDocs.forEach(doc => {
          docs.push({
            id: doc.id,
            data: doc.data()
          });
        });
        
        results[collectionName] = {
          exists: true,
          docCount: count,
          sampleDocs: docs
        };
        
        console.log(`\n✅ Collection: "${collectionName}"`);
        console.log(`   📈 Document count: ${count}`);
        if (docs.length > 0) {
          console.log(`   📋 Sample documents:`);
          docs.forEach((doc, idx) => {
            console.log(`      [${idx + 1}] ID: ${doc.id}`);
            const dataStr = JSON.stringify(doc.data);
            console.log(`          Data: ${dataStr.substring(0, 150)}${dataStr.length > 150 ? '...' : ''}`);
          });
        }
      } catch (error) {
        results[collectionName] = {
          exists: false,
          error: error.message
        };
        console.log(`\n⚠️  Collection: "${collectionName}" - Does not exist or error: ${error.message}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error checking database structure:', error.message);
    return null;
  }
}

async function createTestData() {
  try {
    console.log('\n\n🧪 Creating Test Data Structure...\n');
    
    const now = Date.now();
    
    // ========== TEST CUSTOMER ==========
    const testCustomerId = `customer_9876543210_${now}`;
    const testCustomerPhone = '9876543210';
    
    console.log('📝 Creating test customer...');
    await db.collection('customers').doc(testCustomerId).set({
      id: testCustomerId,
      phone: testCustomerPhone,
      email: 'testcustomer@example.com',
      name: 'Test Customer',
      dietaryPreferences: ['Vegetarian', 'Gluten-Free'],
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: '123 Test Street, Delhi'
      },
      profilePhoto: null,
      status: 'active',
      createdAt: now,
      updatedAt: now
    });
    console.log(`✅ Customer created: ${testCustomerId}`);
    
    // ========== TEST VENDOR ==========
    const testVendorId = `vendor_9876543211_${now}`;
    const testVendorPhone = '9876543211';
    
    console.log('📝 Creating test vendor...');
    await db.collection('vendors').doc(testVendorId).set({
      id: testVendorId,
      phone: testVendorPhone,
      vendorName: 'ThelaGenic Test Stall',
      profilePhoto: null,
      location: {
        latitude: 28.7050,
        longitude: 77.1030,
        address: '456 Vendor Street, Delhi',
        city: 'Delhi',
        landmark: 'Near Central Park'
      },
      foodItems: ['Samosas', 'Dosa', 'Idli'],
      shopPhotos: [],
      certifications: {
        fssai: {
          verified: true,
          certificateUrl: 'gs://bucket/certs/fssai_test.pdf',
          expiryDate: '2025-12-31'
        },
        aadhar: {
          verified: true,
          verificationDate: now
        }
      },
      aiScore: 8.5,
      userRating: 4.7,
      reviewCount: 0,
      badges: [],
      shopRank: 0,
      userReviews: [],
      status: 'active',
      createdAt: now,
      updatedAt: now
    });
    console.log(`✅ Vendor created: ${testVendorId}`);
    
    // ========== PHONE INDEX FOR CUSTOMER ==========
    console.log('📝 Creating phone index for customer...');
    await db.collection('phoneIndex').doc(testCustomerPhone).set({
      phone: testCustomerPhone,
      userId: testCustomerId,
      userType: 'customer',
      createdAt: now,
      updatedAt: now
    });
    console.log(`✅ Phone index created: ${testCustomerPhone} → ${testCustomerId} (customer)`);
    
    // ========== PHONE INDEX FOR VENDOR ==========
    console.log('📝 Creating phone index for vendor...');
    await db.collection('phoneIndex').doc(testVendorPhone).set({
      phone: testVendorPhone,
      userId: testVendorId,
      userType: 'vendor',
      createdAt: now,
      updatedAt: now
    });
    console.log(`✅ Phone index created: ${testVendorPhone} → ${testVendorId} (vendor)`);
    
    console.log('\n📝 Test data structure created successfully!');
    console.log('   ✅ customers collection ready');
    console.log('   ✅ vendors collection ready');
    console.log('   ✅ phoneIndex mapping created');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       FIREBASE CONNECTIVITY & DATABASE STRUCTURE TEST');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Step 1: Initialize
  const initialized = await initializeFirebase();
  if (!initialized) process.exit(1);
  
  // Step 2: Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Cannot proceed without Firebase connection.');
    process.exit(1);
  }
  
  // Step 3: Check structure
  const structure = await checkDatabaseStructure();
  
  if (structure) {
    // Step 4: Create test collections if needed
    const hasCustomers = structure.customers && structure.customers.exists && structure.customers.docCount > 0;
    const hasVendors = structure.vendors && structure.vendors.exists && structure.vendors.docCount > 0;
    
    if (!hasCustomers || !hasVendors) {
      console.log('\n⚠️  Missing test data.');
      console.log('   Creating test customers and vendors...\n');
      await createTestData();
    } else {
      console.log('\n✅ All collections exist with test data!');
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📚 Database Structure:');
  console.log('   • customers - Customer profiles (phone, email, dietary preferences)');
  console.log('   • vendors - Vendor stalls (certifications, ratings, badges)');
  console.log('   • phoneIndex - Phone → ID mapping with user type');
  console.log('\n🚀 Ready to test registration in the app!\n');
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
