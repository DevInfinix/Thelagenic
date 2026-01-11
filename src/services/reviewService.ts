import { db, collection, doc, updateDoc, getDoc, getDocs } from './firebaseConfig';

export interface ReviewData {
  rating: number;
  comment: string;
  timestamp: number;
}

/**
 * Service for managing vendor reviews and ratings
 * - One review per user per vendor
 * - Cumulative rating calculation
 * - Average rating aggregation
 */
export const reviewService = {
  /**
   * Submit or update a review for a vendor
   * @param vendorId - Vendor ID
   * @param userId - Customer user ID (can use phone number as ID)
   * @param rating - Rating 1-5
   * @param comment - Review comment
   */
  async submitReview(
    vendorId: string,
    userId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      const vendorDoc = await getDoc(vendorRef);

      if (!vendorDoc.exists()) {
        throw new Error('Vendor not found');
      }

      const vendorData = vendorDoc.data();
      const reviews = vendorData.reviews || {};

      // Update review
      reviews[userId] = {
        rating,
        comment,
        timestamp: Date.now(),
      };

      // Recalculate ratings
      const allRatings = Object.values(reviews) as ReviewData[];
      const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
      const ratingCount = allRatings.length;
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Update vendor document
      await updateDoc(vendorRef, {
        reviews,
        totalRating,
        ratingCount,
        averageRating,
        updatedAt: Date.now(),
      });

      console.log(`✅ Review submitted for vendor ${vendorId} by user ${userId}`);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Get all reviews for a vendor
   */
  async getVendorReviews(vendorId: string): Promise<{
    [userId: string]: ReviewData;
  }> {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      const vendorDoc = await getDoc(vendorRef);

      if (!vendorDoc.exists()) {
        throw new Error('Vendor not found');
      }

      return vendorDoc.data().reviews || {};
    } catch (error) {
      console.error('Error fetching vendor reviews:', error);
      throw error;
    }
  },

  /**
   * Get user's review for a specific vendor
   */
  async getUserReview(
    vendorId: string,
    userId: string
  ): Promise<ReviewData | null> {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      const vendorDoc = await getDoc(vendorRef);

      if (!vendorDoc.exists()) {
        throw new Error('Vendor not found');
      }

      const reviews = vendorDoc.data().reviews || {};
      return reviews[userId] || null;
    } catch (error) {
      console.error('Error fetching user review:', error);
      throw error;
    }
  },

  /**
   * Get vendor's average rating
   */
  async getVendorRating(vendorId: string): Promise<{
    averageRating: number;
    ratingCount: number;
    totalRating: number;
  }> {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      const vendorDoc = await getDoc(vendorRef);

      if (!vendorDoc.exists()) {
        throw new Error('Vendor not found');
      }

      const data = vendorDoc.data();
      return {
        averageRating: data.averageRating || 0,
        ratingCount: data.ratingCount || 0,
        totalRating: data.totalRating || 0,
      };
    } catch (error) {
      console.error('Error fetching vendor rating:', error);
      throw error;
    }
  },

  /**
   * Delete a user's review for a vendor
   */
  async deleteReview(vendorId: string, userId: string): Promise<void> {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      const vendorDoc = await getDoc(vendorRef);

      if (!vendorDoc.exists()) {
        throw new Error('Vendor not found');
      }

      const reviews = vendorDoc.data().reviews || {};

      if (!reviews[userId]) {
        throw new Error('Review not found');
      }

      // Remove review
      delete reviews[userId];

      // Recalculate ratings
      const allRatings = Object.values(reviews) as ReviewData[];
      const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
      const ratingCount = allRatings.length;
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Update vendor document
      await updateDoc(vendorRef, {
        reviews,
        totalRating,
        ratingCount,
        averageRating,
        updatedAt: Date.now(),
      });

      console.log(`✅ Review deleted for vendor ${vendorId} by user ${userId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  /**
   * Get top rated vendors (useful for home page)
   */
  async getTopRatedVendors(limit: number = 5): Promise<any[]> {
    try {
      // Note: This requires a composite index in Firestore
      // For now, we'll fetch all and sort on client
      const vendorsCollection = collection(db, 'vendors');
      const snapshot = await getDocs(vendorsCollection);

      const vendors = snapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, limit);

      return vendors;
    } catch (error) {
      console.error('Error fetching top rated vendors:', error);
      throw error;
    }
  },
};

