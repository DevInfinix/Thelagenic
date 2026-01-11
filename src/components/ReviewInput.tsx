import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { reviewService } from '../services/reviewService';

interface ReviewInputProps {
  vendorId: string;
  vendorName: string;
  userId: string;
  onSubmitSuccess?: () => void;
  visible: boolean;
  onClose: () => void;
}

export const ReviewInput: React.FC<ReviewInputProps> = ({
  vendorId,
  vendorName,
  userId,
  onSubmitSuccess,
  visible,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Load existing review when modal opens
  useEffect(() => {
    if (visible) {
      loadExistingReview();
    }
  }, [visible]);

  const loadExistingReview = async () => {
    try {
      const review = await reviewService.getUserReview(vendorId, userId);
      if (review) {
        setRating(review.rating);
        setComment(review.comment);
        setExistingReview(review);
      } else {
        setRating(5);
        setComment('');
        setExistingReview(null);
      }
    } catch (error) {
      console.error('Error loading existing review:', error);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await reviewService.submitReview(vendorId, userId, rating, comment);
      Alert.alert('Success', 'Review submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            onSubmitSuccess?.();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await reviewService.deleteReview(vendorId, userId);
            Alert.alert('Success', 'Review deleted successfully!', [
              {
                text: 'OK',
                onPress: () => {
                  onSubmitSuccess?.();
                  onClose();
                },
              },
            ]);
          } catch (error) {
            console.error('Error deleting review:', error);
            Alert.alert('Error', 'Failed to delete review. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Review {vendorName}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Rating Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <MaterialIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#FFD700' : '#CCCCCC'}
                  style={{ marginHorizontal: 8 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>{rating} out of 5 stars</Text>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your experience with this vendor..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            editable={!loading}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {existingReview ? 'Update Review' : 'Submit Review'}
              </Text>
            )}
          </TouchableOpacity>

          {existingReview && (
            <TouchableOpacity
              style={[styles.deleteButton, loading && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>Delete Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    backgroundColor: '#F8F8F8',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ReviewInput;