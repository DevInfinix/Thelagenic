import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useUser } from "@/hooks/use-user";
import { PremiumCard } from "@/src/components/PremiumUI";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          setLoading(true);
          await logout();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.dark.bg }}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AnimatedView
          entering={FadeIn}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: Colors.dark.text,
              marginBottom: 4,
            }}
          >
            Profile
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.dark.textSecondary,
            }}
          >
            Manage your account & preferences
          </Text>
        </AnimatedView>

        {/* Profile Summary */}
        <AnimatedView
          entering={SlideInUp.delay(100)}
          style={{
            paddingHorizontal: 16,
            marginVertical: 16,
          }}
        >
          <PremiumCard>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: Colors.dark.cardAlt,
                  borderWidth: 2,
                  borderColor: Colors.dark.accentPrimary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="person"
                  size={28}
                  color={Colors.dark.accentPrimary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: Colors.dark.text,
                    marginBottom: 4,
                  }}
                >
                  {user?.name || "Guest User"}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.dark.textSecondary,
                  }}
                >
                  {user?.email || "No email"}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.dark.textTertiary,
                    marginTop: 4,
                  }}
                >
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/edit-profile')}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: `rgba(47, 209, 127, 0.1)`,
                }}
              >
                <Ionicons name="pencil" size={20} color={Colors.dark.accentPrimary} />
              </TouchableOpacity>
            </View>
          </PremiumCard>
        </AnimatedView>

        {/* Account Information */}
        <AnimatedView
          entering={SlideInUp.delay(200)}
          style={{
            paddingHorizontal: 16,
            marginVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: Colors.dark.textSecondary,
              marginBottom: 10,
            }}
          >
            ACCOUNT INFORMATION
          </Text>

          <PremiumCard style={{ marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="mail"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.dark.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    Email
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: Colors.dark.text,
                    }}
                  >
                    {user?.email || "No email"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.dark.accentPrimary}
              />
            </View>
          </PremiumCard>

          <PremiumCard style={{ marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="call"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.dark.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    Phone
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: Colors.dark.text,
                    }}
                  >
                    {user?.phone || "No phone"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.dark.textTertiary}
              />
            </View>
          </PremiumCard>

          <PremiumCard>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="location"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.dark.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    Location
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: Colors.dark.text,
                    }}
                  >
                    {user?.currentCity || user?.location ? `${user.currentCity}, India` : "Location not set"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.dark.textTertiary}
              />
            </View>
          </PremiumCard>
        </AnimatedView>

        {/* Preferences */}
        <AnimatedView
          entering={SlideInUp.delay(300)}
          style={{
            paddingHorizontal: 16,
            marginVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: Colors.dark.textSecondary,
              marginBottom: 10,
            }}
          >
            FOOD PREFERENCES
          </Text>

          <PremiumCard>
            <View style={{ gap: 10 }}>
              {(user?.dietaryPreferences || []).length > 0 ? (
                (user?.dietaryPreferences || []).map((pref) => (
                  <View
                    key={pref}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 8,
                      borderBottomWidth: 0.5,
                      borderBottomColor: `rgba(212, 175, 55, 0.2)`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: Colors.dark.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {pref}
                    </Text>
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.dark.accentPrimary}
                    />
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.dark.textSecondary,
                    fontStyle: "italic",
                  }}
                >
                  No preferences set
                </Text>
              )}</View>
          </PremiumCard>
        </AnimatedView>

        {/* Help & Support */}
        <AnimatedView
          entering={SlideInUp.delay(400)}
          style={{
            paddingHorizontal: 16,
            marginVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: Colors.dark.textSecondary,
              marginBottom: 10,
            }}
          >
            SUPPORT & FEEDBACK
          </Text>

          <PremiumCard style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="help-circle"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.dark.text,
                  }}
                >
                  Help & Support
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.dark.textTertiary}
              />
            </TouchableOpacity>
          </PremiumCard>

          <PremiumCard style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.dark.text,
                  }}
                >
                  Privacy Policy
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.dark.textTertiary}
              />
            </TouchableOpacity>
          </PremiumCard>

          <PremiumCard style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="document-text"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.dark.text,
                  }}
                >
                  Terms & Conditions
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.dark.textTertiary}
              />
            </TouchableOpacity>
          </PremiumCard>

          <PremiumCard>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons
                  name="star"
                  size={20}
                  color={Colors.dark.accentPrimary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.dark.text,
                  }}
                >
                  Rate App
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.dark.textTertiary}
              />
            </TouchableOpacity>
          </PremiumCard>
        </AnimatedView>

        {/* Logout Button */}
        <AnimatedView
          entering={SlideInUp.delay(500)}
          style={{
            paddingHorizontal: 16,
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            style={{
              backgroundColor: Colors.dark.error,
              paddingVertical: 14,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={Colors.dark.bg} />
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons
                  name="log-out"
                  size={18}
                  color={Colors.dark.bg}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: Colors.dark.bg,
                  }}
                >
                  Logout
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </AnimatedView>

        {/* App Version */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: Colors.dark.textTertiary,
            }}
          >
            ThelaGenic v1.0.0
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: Colors.dark.textTertiary,
              marginTop: 4,
            }}
          >
            © 2026 All rights reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
