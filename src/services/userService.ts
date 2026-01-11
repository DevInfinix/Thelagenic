import {
  db,
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  query,
  where,
} from "./firebaseConfig";

// ============================================
// CUSTOMER INTERFACES
// ============================================

export interface Customer {
  id: string;
  phone: string;
  email: string;
  name: string;
  dietaryPreferences: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  profilePhoto: string | null;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: number;
  updatedAt: number;
}

// ============================================
// VENDOR INTERFACES
// ============================================

export interface Vendor {
  id: string;
  phone: string;
  vendorName: string;
  profilePhoto: string | null;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    landmark?: string;
  };
  foodItems: string[];
  shopPhotos: string[];
  certifications: {
    fssai?: {
      certificateUrl: string;
      verified: boolean;
      expiryDate: string;
    };
    aadhar?: {
      verified: boolean;
      verificationDate: number;
    };
  };
  aiScore: number;           // 0-10 hygiene score
  userRating: number;        // 1-5 stars
  reviewCount: number;
  badges: {
    name: string;
    awardedDate: number;
    icon: string;
  }[];
  shopRank: number;          // City-wide ranking
  userReviews: {
    reviewId: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    timestamp: number;
    verified: boolean;
  }[];
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  createdAt: number;
  updatedAt: number;
}

// ============================================
// PHONE INDEX INTERFACE
// ============================================

export interface PhoneIndex {
  phone: string;
  userId: string;
  userType: 'customer' | 'vendor';
  createdAt: number;
  updatedAt: number;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length === 10;
};

// ============================================
// CUSTOMER SERVICE
// ============================================

export const customerService = {
  /**
   * Check if phone exists in customers collection
   */
  async checkPhoneExists(phone: string): Promise<{
    exists: boolean;
    customer?: Customer;
  }> {
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("phone", "==", digitsOnly));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const customerData = querySnapshot.docs[0].data() as Customer;
        return { exists: true, customer: customerData };
      }

      return { exists: false };
    } catch (error) {
      console.error("Error checking phone existence:", error);
      throw error;
    }
  },

  /**
   * Register new customer
   */
  async registerCustomer(data: {
    phone: string;
    email: string;
    name: string;
    dietaryPreferences: string[];
    location?: { latitude: number; longitude: number; address: string };
    profilePhoto?: string;
  }): Promise<Customer> {
    try {
      // Validate inputs
      if (!validatePhone(data.phone)) {
        throw new Error("Phone number must be 10 digits");
      }

      if (!validateEmail(data.email)) {
        throw new Error("Invalid email format");
      }

      const digitsOnly = data.phone.replace(/\D/g, "");

      // Check if customer already exists
      const { exists } = await this.checkPhoneExists(digitsOnly);
      if (exists) {
        throw new Error("Customer with this phone already exists");
      }

      // Create new customer
      const customerId = `customer_${digitsOnly}_${Date.now()}`;
      const now = Date.now();

      const newCustomer: Customer = {
        id: customerId,
        phone: digitsOnly,
        email: data.email,
        name: data.name,
        dietaryPreferences: data.dietaryPreferences || [],
        location: data.location || null,
        profilePhoto: data.profilePhoto || null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firebase
      const customerRef = doc(db, "customers", customerId);
      await setDoc(customerRef, newCustomer);

      // Create phone index entry
      const phoneIndexRef = doc(db, "phoneIndex", digitsOnly);
      await setDoc(phoneIndexRef, {
        phone: digitsOnly,
        userId: customerId,
        userType: 'customer',
        createdAt: now,
        updatedAt: now,
      });

      console.log(`Customer registered: ${customerId}`);
      return newCustomer;
    } catch (error) {
      console.error("Error registering customer:", error);
      throw error;
    }
  },

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const customerDoc = await getDoc(doc(db, "customers", id));

      if (customerDoc.exists()) {
        return customerDoc.data() as Customer;
      }

      return null;
    } catch (error) {
      console.error("Error getting customer:", error);
      throw error;
    }
  },

  /**
   * Get customer by phone
   */
  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("phone", "==", digitsOnly));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Customer;
      }

      return null;
    } catch (error) {
      console.error("Error getting customer by phone:", error);
      throw error;
    }
  },

  /**
   * Update customer profile
   */
  async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    try {
      const customerRef = doc(db, "customers", id);
      const updatedData = {
        ...updates,
        updatedAt: Date.now(),
      };

      await setDoc(customerRef, updatedData, { merge: true });

      const updated = await this.getCustomerById(id);
      if (!updated) {
        throw new Error("Failed to retrieve updated customer");
      }

      return updated;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },
};

// ============================================
// VENDOR SERVICE
// ============================================

export const vendorService = {
  /**
   * Check if vendor phone exists
   */
  async checkPhoneExists(phone: string): Promise<{
    exists: boolean;
    vendor?: Vendor;
  }> {
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("phone", "==", digitsOnly));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const vendorData = querySnapshot.docs[0].data() as Vendor;
        return { exists: true, vendor: vendorData };
      }

      return { exists: false };
    } catch (error) {
      console.error("Error checking vendor phone:", error);
      throw error;
    }
  },

  /**
   * Register new vendor
   */
  async registerVendor(data: {
    phone: string;
    vendorName: string;
    location: { latitude: number; longitude: number; address: string; city: string };
    foodItems: string[];
    profilePhoto?: string;
    shopPhotos?: string[];
    certifications?: {
      fssai?: { certificateUrl: string; verified: boolean; expiryDate: string };
      aadhar?: { verified: boolean; verificationDate?: number };
    };
  }): Promise<Vendor> {
    try {
      if (!validatePhone(data.phone)) {
        throw new Error("Phone number must be 10 digits");
      }

      const digitsOnly = data.phone.replace(/\D/g, "");

      // Check if vendor already exists
      const { exists } = await this.checkPhoneExists(digitsOnly);
      if (exists) {
        throw new Error("Vendor with this phone already exists");
      }

      // Create new vendor
      const vendorId = `vendor_${digitsOnly}_${Date.now()}`;
      const now = Date.now();

      const newVendor: Vendor = {
        id: vendorId,
        phone: digitsOnly,
        vendorName: data.vendorName,
        profilePhoto: data.profilePhoto || null,
        location: data.location,
        foodItems: data.foodItems,
        shopPhotos: data.shopPhotos || [],
        certifications: {
          fssai: data.certifications?.fssai,
          aadhar: data.certifications?.aadhar ? {
            ...data.certifications.aadhar,
            verificationDate: data.certifications.aadhar.verificationDate || Date.now()
          } : undefined,
        },
        aiScore: 0,
        userRating: 0,
        reviewCount: 0,
        badges: [],
        shopRank: 0,
        userReviews: [],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firebase
      const vendorRef = doc(db, "vendors", vendorId);
      await setDoc(vendorRef, newVendor);

      // Create phone index entry
      const phoneIndexRef = doc(db, "phoneIndex", digitsOnly);
      await setDoc(phoneIndexRef, {
        phone: digitsOnly,
        userId: vendorId,
        userType: 'vendor',
        createdAt: now,
        updatedAt: now,
      });

      console.log(`Vendor registered: ${vendorId}`);
      return newVendor;
    } catch (error) {
      console.error("Error registering vendor:", error);
      throw error;
    }
  },

  /**
   * Get vendor by ID
   */
  async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const vendorDoc = await getDoc(doc(db, "vendors", id));

      if (vendorDoc.exists()) {
        return vendorDoc.data() as Vendor;
      }

      return null;
    } catch (error) {
      console.error("Error getting vendor:", error);
      throw error;
    }
  },

  /**
   * Get vendor by phone
   */
  async getVendorByPhone(phone: string): Promise<Vendor | null> {
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("phone", "==", digitsOnly));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Vendor;
      }

      return null;
    } catch (error) {
      console.error("Error getting vendor by phone:", error);
      throw error;
    }
  },

  /**
   * Update vendor profile
   */
  async updateVendor(
    id: string,
    updates: Partial<Vendor>
  ): Promise<Vendor> {
    try {
      const vendorRef = doc(db, "vendors", id);
      const updatedData = {
        ...updates,
        updatedAt: Date.now(),
      };

      await setDoc(vendorRef, updatedData, { merge: true });

      const updated = await this.getVendorById(id);
      if (!updated) {
        throw new Error("Failed to retrieve updated vendor");
      }

      return updated;
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  },
};

// ============================================
// PHONE INDEX SERVICE
// ============================================

export const phoneIndexService = {
  /**
   * Get user type and ID by phone
   */
  async getUserTypeByPhone(phone: string): Promise<PhoneIndex | null> {
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const phoneIndexDoc = await getDoc(doc(db, "phoneIndex", digitsOnly));

      if (phoneIndexDoc.exists()) {
        return phoneIndexDoc.data() as PhoneIndex;
      }

      return null;
    } catch (error) {
      console.error("Error getting user type:", error);
      throw error;
    }
  },

  /**
   * Quick check if phone exists (returns user type)
   */
  async checkPhoneExists(phone: string): Promise<{
    exists: boolean;
    userType?: 'customer' | 'vendor';
    userId?: string;
  }> {
    try {
      const phoneData = await this.getUserTypeByPhone(phone);

      if (phoneData) {
        return {
          exists: true,
          userType: phoneData.userType,
          userId: phoneData.userId,
        };
      }

      return { exists: false };
    } catch (error) {
      console.error("Error checking phone:", error);
      throw error;
    }
  },
};

// ============================================
// UNIFIED SERVICE FOR TESTING
// ============================================

export const userService = {
  /**
   * Test Firebase connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const customersRef = collection(db, "customers");
      const snapshot = await getDocs(customersRef);
      console.log(`Firebase connection successful. Found ${snapshot.size} customers.`);
      return true;
    } catch (error) {
      console.error("Firebase connection failed:", error);
      return false;
    }
  },

  // Export services
  customer: customerService,
  vendor: vendorService,
  phoneIndex: phoneIndexService,
};
