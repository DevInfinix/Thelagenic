import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { reviewService } from '../services/reviewService';

interface RatingDisplayProps {
  vendorId: string;
  onReviewPress?: () => void;
}

interface ReviewWithUser {
  userId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  vendorId,
  onReviewPress,
}) => {
  const [rating, setRating] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatingData();
  }, [vendorId]);

  const loadRatingData = async () => {
    try {
      setLoading(true);
      const ratingData = await reviewService.getVendorRating(vendorId);
      setRating(ratingData);

      const vendorReviews = await reviewService.getVendorReviews(vendorId);
      const reviewsArray = Object.entries(vendorReviews).map(([userId, data]: [string, any]) => ({
        userId,
        ...data,
      }));
      setReviews(reviewsArray);
    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FF9800" />
      </View>
    );
  }

  if (!rating) {
    return (
      <View style={styles.container}>
        <Text style={styles.noReviews}>No reviews yet</Text>
      </View>
    );
  }

  const renderStars = (count: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <MaterialIcons
            key={i}
            name={i <= Math.round(count) ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Overall Rating */}
      <View style={styles.summarySection}>
        <View style={styles.summaryLeft}>
          <Text style={styles.ratingNumber}>
            {rating.averageRating.toFixed(1)}
          </Text>
          {renderStars(rating.averageRating)}
          <Text style={styles.reviewCount}>
            {rating.ratingCount} {rating.ratingCount === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={onReviewPress}
        >
          <MaterialIcons name="rate-review" size={20} color="#fff" />
          <Text style={styles.reviewButtonText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Recent Reviews</Text>
          <ScrollView
            nestedScrollEnabled
            style={styles.reviewsList}
            showsVerticalScrollIndicator={false}
          >
            {reviews.slice(0, 5).map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {renderStars(review.rating)}
                  <Text style={styles.reviewDate}>
                    {new Date(review.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewComment} numberOfLines={3}>
                  {review.comment}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLeft: {
    alignItems: 'flex-start',
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reviewButton: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewsSection: {
    marginTop: 16,
  },
  reviewsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reviewsList: {
    maxHeight: 300,
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  noReviews: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default RatingDisplay;
