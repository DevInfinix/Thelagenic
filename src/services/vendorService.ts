import {
  db,
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy,
} from "./firebaseConfig";

export interface VendorData {
  id: string;
  phone: string;
  vendorName: string;
  vendorAge: number;
  vendorGender: string;
  vendorSelfie: string;
  vendorQualification: string;
  vendorEmail?: string;
  shopName: string;
  shopLocation: {
    latitude: number;
    longitude: number;
  };
  shopAddress: string;
  parentCity: string;
  dietaryDetails: string[];
  foodCategory?: string[]; // Added for compatibility
  stallPhoto: string;
  stallVideo?: string;
  fssaiCertificateUrl?: string;
  aadharCardUrl?: string;
  shopBannerUrl?: string;
  reviews?: {
    [userId: string]: {
      rating: number;
      comment: string;
      timestamp: number;
    };
  };
  userComments?: any[]; // Added for compatibility
  totalRating?: number;
  ratingCount?: number;
  averageRating?: number;
  userReviewScore?: number; // Added for compatibility
  aiScore: number;
  badges: Badge[];
  shopRank: number;
  createdAt: number;
  updatedAt: number;
  isActive?: boolean;
  distance?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: number;
}

// Mock data to push to Firebase if empty
const MOCK_VENDORS: VendorData[] = [
  {
    id: "vendor_001",
    phone: "9876543210",
    vendorName: "Rajesh Kumar",
    vendorAge: 38,
    vendorGender: "Male",
    vendorSelfie:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    vendorQualification: "B.Com",
    shopName: "Raju's Cyber Chaat",
    shopLocation: { latitude: 19.0176, longitude: 73.0822 },
    shopAddress: "Kharghar",
    parentCity: "Navi Mumbai",
    dietaryDetails: ["vegetarian", "vegan"],
    stallPhoto:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop",
    stallVideo: "",
    fssaiCertificateUrl: "",
    aadharCardUrl: "",
    shopBannerUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 4.5,
    badges: [],
    shopRank: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  },
  {
    id: "vendor_002",
    phone: "9876543211",
    vendorName: "Priya Sharma",
    vendorAge: 32,
    vendorGender: "Female",
    vendorSelfie:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    vendorQualification: "Diploma",
    shopName: "Priya's Healthy Bites",
    shopLocation: { latitude: 19.0273, longitude: 73.0954 },
    shopAddress: "Nerul",
    parentCity: "Navi Mumbai",
    dietaryDetails: ["vegetarian", "glutenfree", "vegan"],
    stallPhoto:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
    stallVideo: "",
    fssaiCertificateUrl: "",
    aadharCardUrl: "",
    shopBannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop",
    reviews: {},
    totalRating: 0,
    ratingCount: 0,
    averageRating: 0,
    aiScore: 4.6,
    badges: [],
    shopRank: 2,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    isActive: true,
  },
];

export const vendorService = {
  async initializeMockData() {
    try {
      const vendorsRef = collection(db, "vendors");
      const snapshot = await getDocs(vendorsRef);

      if (snapshot.empty) {
        console.log("Database empty. Pushing mock data...");
        for (const vendor of MOCK_VENDORS) {
          await setDoc(doc(db, "vendors", vendor.id), vendor);
        }
        console.log("Mock data pushed successfully!");
      }
    } catch (error) {
      console.error("Error initializing mock data:", error);
    }
  },

  async getAllVendors(): Promise<VendorData[]> {
    try {
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, orderBy("shopRank", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as VendorData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return MOCK_VENDORS;
    }
  },

  async getVendorById(vendorId: string): Promise<VendorData | null> {
    try {
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("id", "==", vendorId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;
      return snapshot.docs[0].data() as VendorData;
    } catch (error) {
      console.error("Error fetching vendor:", error);
      return (
        MOCK_VENDORS.find((v) => v.id === vendorId) || null
      );
    }
  },

  async searchVendors(
    searchQuery: string,
    filters?: { category?: string; minRating?: number; maxDistance?: number }
  ): Promise<VendorData[]> {
    try {
      const vendorsRef = collection(db, "vendors");

      // For full-text search, we'll filter in memory (in production, consider Algolia)
      const snapshot = await getDocs(vendorsRef);
      let vendors = snapshot.docs.map((doc) => doc.data() as VendorData);

      // Filter by search query
      if (searchQuery) {
        vendors = vendors.filter(
          (v) =>
            v.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.dietaryDetails.some((cat) =>
              cat.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
      }

      // Apply additional filters
      if (filters?.category) {
        vendors = vendors.filter((v) =>
          v.dietaryDetails.some((cat) =>
            cat.toLowerCase().includes(filters.category!.toLowerCase())
          )
        );
      }

      if (filters?.minRating) {
        vendors = vendors.filter((v) => (v.averageRating || v.aiScore || 0) >= filters.minRating!);
      }

      return vendors;
    } catch (error) {
      console.error("Error searching vendors:", error);
      return MOCK_VENDORS;
    }
  },

  async addReview(
    vendorId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<boolean> {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      const vendor = await this.getVendorById(vendorId);

      if (!vendor) return false;

      // Use new review structure if available, fallback to old structure
      if (vendor.reviews) {
        vendor.reviews[userId] = {
          rating,
          comment,
          timestamp: Date.now(),
        };

        // Recalculate ratings
        const allRatings = Object.values(vendor.reviews) as any[];
        const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
        vendor.totalRating = totalRating;
        vendor.ratingCount = allRatings.length;
        vendor.averageRating = totalRating / allRatings.length;
      }

      vendor.updatedAt = Date.now();
      await setDoc(vendorRef, vendor);
      return true;
    } catch (error) {
      console.error("Error adding review:", error);
      return false;
    }
  },

  async updateAIScore(vendorId: string, newScore: number): Promise<boolean> {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      const vendor = await this.getVendorById(vendorId);

      if (!vendor) return false;

      vendor.aiScore = Math.min(newScore, 10);
      vendor.updatedAt = Date.now();

      // Award badges based on score
      if (vendor.aiScore >= 8.5 && !vendor.badges.find(b => b.id === 'badge_premium')) {
        vendor.badges.push({
          id: 'badge_premium',
          name: 'Premium Quality',
          icon: '⭐',
          description: 'AI score above 8.5',
          unlockedAt: Date.now(),
        });
      }

      await setDoc(vendorRef, vendor);
      return true;
    } catch (error) {
      console.error("Error updating AI score:", error);
      return false;
    }
  },
};
