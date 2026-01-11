import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState, useEffect } from "react";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useUser } from "@/hooks/use-user";
import { VendorCard } from "@/src/components/VendorCardNew";
import { VendorData, vendorService } from "@/src/services/vendorService";
import { Chip } from "@/src/components/PremiumUI";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rank" | "rating" | "score">("rank");

  const categories = [
    "All",
    "Street Food",
    "Momos",
    "Chaat",
    "Pav Bhaji",
    "Chinese",
    "Samosa",
  ];

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data);
      filterVendors(data, searchQuery, selectedCategory, sortBy);
    } catch (error) {
      console.error("Error loading vendors:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useFocusEffect(
    useCallback(() => {
      loadVendors();
    }, [loadVendors])
  );

  const filterVendors = (
    data: VendorData[],
    query: string,
    category: string | null,
    sort: "rank" | "rating" | "score"
  ) => {
    let filtered = data;

    // Search filter
    if (query.trim()) {
      filtered = filtered.filter(
        (v) =>
          v.shopName.toLowerCase().includes(query.toLowerCase()) ||
          v.vendorName.toLowerCase().includes(query.toLowerCase()) ||
          v.dietaryDetails.some((cat) => cat.toLowerCase().includes(query.toLowerCase()) )
      );
    }

    // Category filter
    if (category && category !== "All") {
      filtered = filtered.filter((v) => v.dietaryDetails.some((cat) => cat.toLowerCase().includes(category.toLowerCase()) )
      );
    }

    // Sorting
    if (sort === "rating") {
      filtered.sort((a, b) => {
        const ratingA = a.averageRating || a.userReviewScore || 0;
        const ratingB = b.averageRating || b.userReviewScore || 0;
        return ratingB - ratingA;
      });
    } else if (sort === "score") {
      filtered.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    } else {
      filtered.sort((a, b) => (a.shopRank || 0) - (b.shopRank || 0));
    }

    setFilteredVendors(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterVendors(vendors, text, selectedCategory, sortBy);
  };

  const handleCategorySelect = (cat: string) => {
    const newCategory = cat === "All" ? null : cat;
    setSelectedCategory(cat === "All" ? null : newCategory);
    filterVendors(vendors, searchQuery, newCategory, sortBy);
  };

  const handleSort = (sort: "rank" | "rating" | "score") => {
    setSortBy(sort);
    filterVendors(vendors, searchQuery, selectedCategory, sort);
  };

  const handleVendorPress = (vendorId: string) => {
    router.push(`/vendor/${vendorId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }} edges={["top"]} >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <AnimatedView entering={FadeIn} style={{ paddingHorizontal: 16, paddingVertical: 16 }} >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, }} >
            <View>
              <Text style={{ fontSize: 28, fontWeight: "700", color: Colors.dark.text, }} >
                Welcome back!
              </Text>
              <Text style={{ fontSize: 14, color: Colors.dark.textSecondary, marginTop: 4, }} >
                {user?.name || "Guest"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.7} >
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.dark.cardAlt, borderWidth: 1.5, borderColor: Colors.dark.accentPrimary, justifyContent: "center", alignItems: "center", }} >
                <Ionicons name="person-outline" size={24} color={Colors.dark.accentPrimary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: Colors.dark.cardAlt, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1.5, borderColor: Colors.dark.textTertiary, marginBottom: 16, }} >
            <Ionicons name="search" size={20} color={Colors.dark.textSecondary} />
            <TextInput
              placeholder="Search stalls, food..."
              placeholderTextColor={Colors.dark.textTertiary}
              value={searchQuery}
              onChangeText={handleSearch}
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12, color: Colors.dark.text, fontSize: 14, }}
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Options */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, }} >
            {[
              { label: "Top Ranked", value: "rank" as const },
              { label: "Best Rated", value: "rating" as const },
              { label: "Best Score", value: "score" as const },
            ].map((sort) => (
              <TouchableOpacity
                key={sort.value}
                onPress={() => handleSort(sort.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: sortBy === sort.value ? Colors.dark.accentPrimary : Colors.dark.textTertiary,
                  backgroundColor: sortBy === sort.value ? `rgba(47, 209, 127, 0.1)` : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: sortBy === sort.value ? Colors.dark.accentPrimary : Colors.dark.textSecondary,
                  }}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filter */}
          <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.textSecondary, marginBottom: 8, }} >
            FILTER BY CATEGORY
          </Text>
        </AnimatedView>

        <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16} >
          {/* Categories Horizontal Scroll */}
          <AnimatedView entering={SlideInLeft.delay(100)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 16, marginBottom: 16 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  selected={
                    (cat === "All" && selectedCategory === null) || selectedCategory === cat
                  }
                  onPress={() => handleCategorySelect(cat)}
                />
              ))}
            </ScrollView>
          </AnimatedView>

          {/* Results */}
          <View style={{ paddingBottom: 24 }}>
            {loading ? (
              <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 60, }} >
                <ActivityIndicator size="large" color={Colors.dark.accentPrimary} />
                <Text style={{ marginTop: 12, color: Colors.dark.textSecondary, fontSize: 14, }} >
                  Loading stalls...
                </Text>
              </View>
            ) : filteredVendors.length > 0 ? (
              <View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.dark.textSecondary, paddingHorizontal: 16, marginBottom: 12, }} >
                  {filteredVendors.length} STALLS FOUND
                </Text>
                {filteredVendors.map((vendor, idx) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    index={idx}
                    onPress={() => handleVendorPress(vendor.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 60, }} >
                <Ionicons name="search" size={64} color={Colors.dark.textTertiary} style={{ marginBottom: 12, opacity: 0.5 }} />
                <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.dark.textSecondary, textAlign: "center", }} >
                  No stalls found
                </Text>
                <Text style={{ fontSize: 12, color: Colors.dark.textTertiary, marginTop: 8, textAlign: "center", paddingHorizontal: 24, }} >
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
