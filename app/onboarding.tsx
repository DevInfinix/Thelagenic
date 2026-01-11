import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  BounceIn,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/use-user";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  customerService,
  validateEmail,
  validatePhone,
} from "@/src/services/userService";
import { LocationService } from "@/src/services/locationService";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function OnboardingScreen() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationData, setLocationData] = useState<{ latitude: number; longitude: number; address: string } | undefined>(undefined);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { setOnboardingComplete, updateUserProfile } = useUser();
  const router = useRouter();

  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
    { id: "vegan", label: "Vegan", icon: "🌱" },
    { id: "jain", label: "Jain", icon: "✨" },
    { id: "nonveg", label: "Non-Veg", icon: "🍗" },
    { id: "seafood", label: "Seafood", icon: "🦐" },
    { id: "glutenfree", label: "Gluten-Free", icon: "🌾" },
  ];

  // Get location when onboarding starts
  useEffect(() => {
    const getLocation = async () => {
      try {
        setGettingLocation(true);
        const location = await LocationService.requestLocationPermission();
        
        if (location) {
          // Get city from coordinates
          const city = await LocationService.detectCityFromCoordinates(location);
          setLocationData({
            latitude: location.latitude,
            longitude: location.longitude,
            address: city
          });
        } else {
          // Use default location if permission denied
          const defaultLocation = { latitude: 19.0176, longitude: 73.0822 };
          const city = await LocationService.detectCityFromCoordinates(defaultLocation);
          setLocationData({
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
            address: city
          });
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setGettingLocation(false);
      }
    };

    getLocation();
  }, []);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!nameInput.trim()) {
        newErrors.name = "Name is required";
      }
    } else if (step === 1) {
      if (!emailInput.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(emailInput)) {
        newErrors.email = "Invalid email format";
      }
    } else if (step === 2) {
      if (!phoneInput.trim()) {
        newErrors.phone = "Phone is required";
      } else if (!validatePhone(phoneInput)) {
        newErrors.phone = "Phone must be 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    if (step < 4) {
      setStep((step + 1) as 0 | 1 | 2 | 3 | 4);
      return;
    }

    // Final step - register user
    if (step === 4) {
      await handleRegister();
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting registration process...");

      // Check if customer exists by phone
      const existingCustomer = await customerService.getCustomerByPhone(phoneInput);

      if (existingCustomer) {
        // Customer already exists - load their data
        console.log("✅ Existing customer found:", existingCustomer.id);
        await updateUserProfile({
          id: existingCustomer.id,
          name: existingCustomer.name,
          email: existingCustomer.email,
          phone: existingCustomer.phone,
          dietaryPreferences: existingCustomer.dietaryPreferences,
          location: existingCustomer.location,
        });
        
        // Mark onboarding as complete - do NOT await
        setOnboardingComplete(true);
        
        setTimeout(() => {
          Alert.alert(
            "Welcome Back!",
              `We found your account with phone ${phoneInput}. Logging you in...`,
            [
              {
                text: "OK",
                onPress: () => router.replace("/(tabs)"),
              },
            ]
          );
        }, 100);
        return;
      }

      // Create new customer with location data
      console.log("➕ Creating new customer...");
      const newCustomer = await customerService.registerCustomer({
        phone: phoneInput,
        email: emailInput,
        name: nameInput,
        dietaryPreferences: preferences,
        location: locationData,
      });

      console.log("✅ Customer created:", newCustomer.id);

      // Update user context
      await updateUserProfile({
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        dietaryPreferences: newCustomer.dietaryPreferences,
        location: locationData ? { latitude: locationData.latitude, longitude: locationData.longitude } : undefined,
        currentCity: locationData?.address || "Unknown City",
      });
      console.log("✅ User profile updated");

      // Mark onboarding as complete - do NOT await
      setOnboardingComplete(true);
      
      console.log("✅ Onboarding marked as complete");
      
      setTimeout(() => {
        Alert.alert(
          "Success!",
          "Registration complete. Welcome to ThelaGenic!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      }, 100);
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      Alert.alert("Registration Failed", error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as 0 | 1 | 2 | 3 | 4);
      setErrors({});
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.dark.bg }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        style={{ padding: 24 }}
      >
        {/* Progress indicator */}
        <AnimatedView
          entering={FadeInDown.delay(100)}
          style={{
            marginBottom: 32,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <AnimatedView
                key={i}
                entering={SlideInRight.duration(300).delay(i * 100)}
                style={{
                  height: 8,
                  borderRadius: 4,
                  flex: 1,
                  backgroundColor:
                    i <= step
                      ? Colors.dark.accentPrimary
                      : Colors.dark.textTertiary,
                  opacity: i <= step ? 1 : 0.3,
                }}
              />
            ))}
          </View>
        </AnimatedView>

        {/* Step 0: Name */}
        {step === 0 && (
          <AnimatedView entering={FadeInUp.duration(600).delay(200)}>
            <View style={{ alignItems: "center", marginBottom: 48 }}>
              <Text
                style={{
                  fontSize: 42,
                  fontWeight: "700",
                  color: Colors.dark.text,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Welcome to ThelaGenic 👋
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.textSecondary,
                  textAlign: "center",
                  lineHeight: 24,
                }}
              >
                Your trusted guide to hygiene and delicious food
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.textSecondary,
                  marginBottom: 12,
                  fontWeight: "600",
                }}
              >
                Whats your name?
              </Text>
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.name
                    ? Colors.dark.error
                    : Colors.dark.accentPrimary,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: Colors.dark.cardAlt,
                }}
              >
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={nameInput}
                  onChangeText={(text) => {
                    setNameInput(text);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  style={{
                    color: Colors.dark.text,
                    fontSize: 16,
                  }}
                />
              </View>
              {errors.name && (
                <Text
                  style={{
                    color: Colors.dark.error,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {errors.name}
                </Text>
              )}
            </View>
          </AnimatedView>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <AnimatedView entering={FadeInUp.duration(600).delay(200)}>
            <View style={{ alignItems: "center", marginBottom: 48 }}>
              <AnimatedView entering={ZoomIn.duration(500)}>
                <Ionicons
                  name="mail-outline"
                  size={64}
                  color={Colors.dark.accentPrimary}
                  style={{ marginBottom: 16 }}
                />
              </AnimatedView>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: Colors.dark.text,
                  marginBottom: 12,
                }}
              >
                Email Address
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.textSecondary,
                  textAlign: "center",
                }}
              >
                We will use this for updates and notifications
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.email
                    ? Colors.dark.error
                    : Colors.dark.accentPrimary,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: Colors.dark.cardAlt,
                }}
              >
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={emailInput}
                  onChangeText={(text) => {
                    setEmailInput(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    color: Colors.dark.text,
                    fontSize: 16,
                  }}
                />
              </View>
              {errors.email && (
                <Text
                  style={{
                    color: Colors.dark.error,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {errors.email}
                </Text>
              )}
            </View>
          </AnimatedView>
        )}

        {/* Step 2: Phone */}
        {step === 2 && (
          <AnimatedView entering={FadeInUp.duration(600).delay(200)}>
            <View style={{ alignItems: "center", marginBottom: 48 }}>
              <AnimatedView entering={ZoomIn.duration(500)}>
                <Ionicons
                  name="call-outline"
                  size={64}
                  color={Colors.dark.accentPrimary}
                  style={{ marginBottom: 16 }}
                />
              </AnimatedView>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: Colors.dark.text,
                  marginBottom: 12,
                }}
              >
                Phone Number
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.textSecondary,
                  textAlign: "center",
                }}
              >
                10-digit phone number for contact
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.phone
                    ? Colors.dark.error
                    : Colors.dark.accentPrimary,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: Colors.dark.cardAlt,
                }}
              >
                <TextInput
                  placeholder="Enter 10-digit phone"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={phoneInput}
                  onChangeText={(text) => {
                    // Only allow digits
                    const digitsOnly = text.replace(/\D/g, "");
                    setPhoneInput(digitsOnly);
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={{
                    color: Colors.dark.text,
                    fontSize: 16,
                  }}
                />
              </View>
              {errors.phone && (
                <Text
                  style={{
                    color: Colors.dark.error,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {errors.phone}
                </Text>
              )}
              <Text
                style={{
                  color: Colors.dark.textSecondary,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                {phoneInput.length}/10 digits
              </Text>
            </View>
          </AnimatedView>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <AnimatedView entering={FadeInUp.duration(600).delay(200)}>
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <AnimatedView entering={ZoomIn.duration(500)}>
                <Ionicons
                  name="location-outline"
                  size={64}
                  color={Colors.dark.accentPrimary}
                  style={{ marginBottom: 16 }}
                />
              </AnimatedView>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: Colors.dark.text,
                  marginBottom: 12,
                }}
              >
                Your Location
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.textSecondary,
                  textAlign: "center",
                }}
              >
                We need your location to find nearby vendors
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              {gettingLocation ? (
                <AnimatedView entering={BounceIn.duration(800)}>
                  <View
                    style={{
                      backgroundColor: Colors.dark.cardAlt,
                      borderWidth: 1.5,
                      borderColor: Colors.dark.accentPrimary,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 24,
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="large" color={Colors.dark.accentPrimary} />
                    <Text
                      style={{
                        marginTop: 12,
                        color: Colors.dark.text,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      Getting your location...
                    </Text>
                  </View>
                </AnimatedView>
              ) : locationData ? (
                <AnimatedView entering={FadeInUp.duration(600)}>
                  <View
                    style={{
                      backgroundColor: Colors.dark.cardAlt,
                      borderWidth: 1.5,
                      borderColor: Colors.dark.accentPrimary,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.dark.textSecondary,
                        marginBottom: 12,
                      }}
                    >
                      Detected Location
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: Colors.dark.text,
                        marginBottom: 8,
                      }}
                    >
                      {locationData.address}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.dark.textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      Coordinates: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                    </Text>
                  </View>
                </AnimatedView>
              ) : (
                <AnimatedView entering={BounceIn.duration(800)}>
                  <View
                    style={{
                      backgroundColor: Colors.dark.cardAlt,
                      borderWidth: 1.5,
                      borderColor: Colors.dark.error,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 20,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={32}
                      color={Colors.dark.error}
                      style={{ marginBottom: 12 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.dark.text,
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      Could not get your location
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.dark.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      Please enable location permissions in your device settings
                    </Text>
                  </View>
                </AnimatedView>
              )}
            </View>
          </AnimatedView>
        )}

        {/* Step 4: Dietary Preferences */}
        {step === 4 && (
          <AnimatedView entering={FadeInUp.duration(600).delay(200)}>
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: Colors.dark.text,
                  marginBottom: 12,
                }}
              >
                Food Preferences
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.dark.textSecondary,
                  textAlign: "center",
                }}
              >
                Select what you prefer (optional)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {dietaryOptions.map((option, index) => (
                <AnimatedView
                  key={option.id}
                  entering={ZoomIn.duration(400).delay(index * 100)}
                >
                  <TouchableOpacity
                    onPress={() => togglePreference(option.id)}
                    style={{
                      flex: 1,
                      minWidth: "45%",
                      borderWidth: 1.5,
                      borderColor: preferences.includes(option.id)
                        ? Colors.dark.accentPrimary
                        : Colors.dark.textTertiary,
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      backgroundColor: preferences.includes(option.id)
                        ? `rgba(47, 209, 127, 0.1)`
                        : Colors.dark.cardAlt,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 8 }}>
                      {option.icon}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: Colors.dark.text,
                        textAlign: "center",
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </AnimatedView>
              ))}
            </View>
          </AnimatedView>
        )}

        {/* Navigation buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 32 }}>
          {step > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                flex: 0.3,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: Colors.dark.textTertiary,
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={step === 4 ? handleRegister : handleNext}
            disabled={loading}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: Colors.dark.accentPrimary,
              alignItems: "center",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={Colors.dark.bg} />
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: Colors.dark.bg,
                }}
              >
                {step === 4 ? "Get Started" : "Continue"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
