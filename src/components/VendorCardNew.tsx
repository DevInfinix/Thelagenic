import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { RatingDisplay, Chip } from "./PremiumUI";
import { VendorData } from "@/src/services/vendorService";
import Animated, { SlideInRight } from "react-native-reanimated";
import { useState } from "react";

const AnimatedView = Animated.createAnimatedComponent(View);

interface VendorCardProps {
  vendor: VendorData;
  onPress?: () => void;
  index?: number;
}

export function VendorCard({ vendor, onPress, index = 0 }: VendorCardProps) {
  const delay = index * 100;
  const [imageLoadError, setImageLoadError] = useState(false);

  return (
    <AnimatedView
      entering={SlideInRight.delay(delay).springify()}
      style={{ marginHorizontal: 16, marginBottom: 16 }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          backgroundColor: Colors.dark.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: `rgba(212, 175, 55, 0.15)`,
          overflow: "hidden",
        }}
      >
        {/* Image Section */}
        <View style={{ position: "relative", height: 200, width: "100%", backgroundColor: Colors.dark.cardAlt }}>
          {!imageLoadError && vendor.stallPhoto ? (
            <Image
              source={{ uri: vendor.stallPhoto }}
              style={{
                width: "100%",
                height: "100%",
              }}
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: Colors.dark.cardAlt,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="image-outline" size={40} color={Colors.dark.textSecondary} />
              <Text
                style={{
                  color: Colors.dark.textSecondary,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Image not available
              </Text>
            </View>
          )}

          {/* Overlay gradient */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />

          {/* Top badges */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: Colors.dark.accentPrimary,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: Colors.dark.bg,
                }}
              >
                🏆 Rank #{vendor.shopRank}
              </Text>
            </View>

            {(vendor.badges || []).length > 0 && (
              <View
                style={{
                  backgroundColor: `rgba(78, 203, 155, 0.9)`,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 12 }}>
                  {vendor.badges[0].icon}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: Colors.dark.bg,
                  }}
                >
                  {(vendor.badges || []).length}
                </Text>
              </View>
            )}
          </View>

          {/* AI Score */}
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              backgroundColor: `rgba(212, 175, 55, 0.95)`,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: Colors.dark.bg,
              }}
            >
              AI Score: {vendor.aiScore.toFixed(1)}/10
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={{ padding: 16 }}>
          {/* Shop Name and Vendor */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: Colors.dark.text,
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {vendor.shopName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons
                name="person-circle"
                size={16}
                color={Colors.dark.textSecondary}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.dark.textSecondary,
                }}
              >
                {vendor.vendorName}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name="location"
              size={14}
              color={Colors.dark.accentPrimary}
            />
            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.textSecondary,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {vendor.shopAddress}
            </Text>
          </View>

          {/* Food Categories */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
            }}
          >
          {(vendor.dietaryDetails || []).slice(0, 3).map((cat: string, idx: number) => (
            <Chip key={idx} label={cat} />
          ))}
          {(vendor.dietaryDetails || []).length > 3 && (
            <Chip label={`+${(vendor.dietaryDetails || []).length - 3}`} />
          )}
          </View>

          {/* Ratings Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: `rgba(212, 175, 55, 0.15)`,
              borderBottomWidth: 1,
              borderBottomColor: `rgba(212, 175, 55, 0.15)`,
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.dark.textSecondary,
                  marginBottom: 4,
                }}
              >
                User Rating
              </Text>
              <RatingDisplay rating={vendor.averageRating || vendor.userReviewScore || 0} size="medium" />
            </View>

            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: `rgba(212, 175, 55, 0.2)`,
                marginHorizontal: 16,
              }}
            />

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.dark.textSecondary,
                  marginBottom: 4,
                }}
              >
                AI Quality
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons
                  name="sparkles"
                  size={14}
                  color={Colors.dark.accentPrimary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: Colors.dark.accentPrimary,
                  }}
                >
                  {vendor.aiScore.toFixed(1)}/10
                </Text>
              </View>
            </View>
          </View>

          {/* Reviews Count */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={Colors.dark.textSecondary}
            />
            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.textSecondary,
              }}
            >
              {(vendor.userComments || []).length} reviews
            </Text>
            <View style={{ flex: 1 }} />
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.dark.accentPrimary}
            />
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedView>
  );
}
