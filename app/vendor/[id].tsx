import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { VendorData, vendorService } from "@/src/services/vendorService";
import { RatingDisplay, Badge, Chip, PremiumCard } from "@/src/components/PremiumUI";
import { ReviewInput } from "@/src/components/ReviewInput";
import { useUser } from "@/hooks/use-user";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function VendorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const loadVendor = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendorById(id as string);
      if (data) {
        setVendor(data);
      }
    } catch (error) {
      console.error("Error loading vendor:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  const handleReviewSuccess = () => {
    loadVendor();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }} edges={["top"]} >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", }} >
          <ActivityIndicator size="large" color={Colors.dark.accentGold} />
          <Text style={{ marginTop: 12, color: Colors.dark.textSecondary, fontSize: 14, }} >
            Loading stall details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }} edges={["top"]} >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.dark.textTertiary} />
          <Text style={{ marginTop: 12, color: Colors.dark.textSecondary, fontSize: 14, }} >
            Stall not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }} edges={["top"]} >
      {/* Header with back button */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, }} >
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.dark.cardAlt, justifyContent: "center", alignItems: "center", }} >
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.dark.text, }} >
          Stall Details
        </Text>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.dark.cardAlt, justifyContent: "center", alignItems: "center", }} >
          <Ionicons name="heart-outline" size={22} color={Colors.dark.accentPrimary} />
        </TouchableOpacity>
      </View>

      <AnimatedScrollView showsVerticalScrollIndicator={false} entering={FadeInUp} >
        {/* Hero Image */}
        <AnimatedView entering={FadeInUp}>
          <View style={{ position: "relative", height: 280 }}>
            <Image source={{ uri: vendor.stallPhoto }} style={{ width: "100%", height: "100%", }} />
            {/* Gradient overlay */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, backgroundColor: "rgba(15,12,10,0.9)", }} />
            {/* Rank badge */}
            <View style={{ position: "absolute", top: 16, left: 16, backgroundColor: Colors.dark.accentPrimary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6, }} >
              <Ionicons name="trophy" size={14} color={Colors.dark.bg} />
              <Text style={{ fontWeight: "700", color: Colors.dark.bg, fontSize: 12, }} >
                Rank #{vendor.shopRank}
              </Text>
            </View>
            {/* Badges */}
            {vendor.badges.length > 0 && (
              <View style={{ position: "absolute", top: 16, right: 16, flexDirection: "row", gap: 6, }} >
                {vendor.badges.slice(0, 2).map((badge) => (
                  <View key={badge.id} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `rgba(78, 203, 155, 0.9)`, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: Colors.dark.accentPrimary, }} >
                    <Text style={{ fontSize: 20 }}>{badge.icon}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </AnimatedView>

        {/* Vendor Info */}
        <AnimatedView entering={FadeInUp.delay(100)} style={{ paddingHorizontal: 16, paddingVertical: 20, }} >
          {/* Name and vendor */}
          <Text style={{ fontSize: 24, fontWeight: "700", color: Colors.dark.text, marginBottom: 8, }} >
            {vendor.shopName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark.cardAlt, justifyContent: "center", alignItems: "center", }} >
              <Ionicons name="person-circle" size={20} color={Colors.dark.accentGold} />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.dark.text, }} >
                {vendor.vendorName}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.dark.textSecondary, }} >
                {vendor.vendorAge} years old • {vendor.vendorGender}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 16, }} >
            <Ionicons name="location" size={18} color={Colors.dark.accentGold} style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 13, color: Colors.dark.textSecondary, flex: 1, lineHeight: 20, }} >
              {vendor.shopAddress}
            </Text>
          </View>

          {/* Ratings */}
          <View style={{ flexDirection: "row", gap: 24, marginTop: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: `rgba(212, 175, 55, 0.15)`, }} >
            <View>
              <Text style={{ fontSize: 11, color: Colors.dark.textSecondary, marginBottom: 8, fontWeight: "600", }} >
                USER RATING
              </Text>
              <RatingDisplay rating={vendor.averageRating || vendor.userReviewScore || 0} />
            </View>
            <View style={{ width: 1, backgroundColor: `rgba(212, 175, 55, 0.2)` }} />
            <View>
              <Text style={{ fontSize: 11, color: Colors.dark.textSecondary, marginBottom: 8, fontWeight: "600", }} >
                AI QUALITY SCORE
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, }} >
                <Ionicons name="sparkles" size={16} color={Colors.dark.accentGold} />
                <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.dark.accentGold, }} >
                  {vendor.aiScore.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.dark.textSecondary, }} >
                  / 10
                </Text>
              </View>
            </View>
          </View>

          {/* Food Categories */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.textSecondary, marginBottom: 10, }} >
              FOOD CATEGORIES
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {vendor.dietaryDetails.map((cat: string, idx: number) => (
                <Chip key={idx} label={cat} />
              ))}
            </View>
          </View>
        </AnimatedView>

        {/* Vendor Badges Section */}
        {vendor.badges.length > 0 && (
          <AnimatedView entering={FadeInUp.delay(200)} style={{ paddingHorizontal: 16, marginVertical: 16, }} >
            <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.textSecondary, marginBottom: 12, }} >
              ACHIEVEMENTS
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, }} >
              {vendor.badges.map((badge) => (
                <Badge key={badge.id} icon={badge.icon} label={badge.name} description={badge.description} />
              ))}
            </View>
          </AnimatedView>
        )}

        {/* Certifications */}
        <AnimatedView entering={FadeInUp.delay(300)} style={{ paddingHorizontal: 16, marginVertical: 16, }} >
          <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.textSecondary, marginBottom: 12, }} >
            CERTIFICATIONS
          </Text>
          <View style={{ gap: 10 }}>
            <PremiumCard>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }} >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, }} >
                  <Ionicons name="document-text" size={20} color={Colors.dark.accentPrimary} />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.dark.text, }} >
                      FSSAI Certificate
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2, }} >
                      ✓ Verified & Valid
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.dark.accentGold} />
              </View>
            </PremiumCard>
            <PremiumCard>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }} >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, }} >
                  <Ionicons name="id-card" size={20} color={Colors.dark.accentPrimary} />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.dark.text, }} >
                      Aadhar Card
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2, }} >
                      ✓ Verified & Valid
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.dark.accentGold} />
              </View>
            </PremiumCard>
          </View>
        </AnimatedView>

        {/* Reviews Section */}
        <AnimatedView entering={FadeInUp.delay(400)} style={{ paddingHorizontal: 16, marginVertical: 16, }} >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, }} >
            <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.textSecondary, }} >
              REVIEWS ({(vendor.userComments?.length || 0)})
            </Text>
            <TouchableOpacity onPress={() => setShowReviewModal(true)}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.accentPrimary, }} >
                Add Review
              </Text>
            </TouchableOpacity>
          </View>

          {/* Review Modal */}
          {vendor && user && (
            <ReviewInput
              vendorId={vendor.id}
              vendorName={vendor.shopName}
              userId={user.phone || user.id}
              visible={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              onSubmitSuccess={handleReviewSuccess}
            />
          )}

          {/* Reviews List */}
          {(vendor.userComments?.length || 0) > 0 ? (
            vendor.userComments?.map((review) => (
              <PremiumCard key={review.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, }} >
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.dark.text, }} >
                      {review.userName}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2, }} >
                      {new Date(review.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, }} >
                    <Text style={{ fontSize: 12 }}>⭐</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.accentPrimary, }} >
                      {review.rating}.0
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: Colors.dark.textSecondary, lineHeight: 18, }} >
                  {review.comment}
                </Text>
              </PremiumCard>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ fontSize: 12, color: Colors.dark.textSecondary, }} >
                No reviews yet. Be the first to review!
              </Text>
            </View>
          )}
        </AnimatedView>

        <View style={{ height: 40 }} />
      </AnimatedScrollView>
    </SafeAreaView>
  );
}
