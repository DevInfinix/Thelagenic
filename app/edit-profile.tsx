import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { LocationService } from '@/src/services/locationService';

const AnimatedView = Animated.createAnimatedComponent(View);

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "jain", label: "Jain", icon: "✨" },
  { id: "nonveg", label: "Non-Veg", icon: "🍗" },
  { id: "seafood", label: "Seafood", icon: "🦐" },
  { id: "glutenfree", label: "Gluten-Free", icon: "🌾" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone] = useState(user?.phone || '');
  const [coordinates, setCoordinates] = useState(user?.location || null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(user?.dietaryPreferences || []);

  const handleGetCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const location = await LocationService.requestLocationPermission();
      
      if (location) {
        setCoordinates(location);
      } else {
        Alert.alert('Location', 'Could not get your location. Please check permissions.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        location: coordinates,
        dietaryPreferences: dietaryPreferences,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <AnimatedView
          entering={FadeIn}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 0.5,
            borderBottomColor: Colors.dark.textTertiary,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={Colors.dark.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: Colors.dark.text,
            }}
          >
            Edit Profile
          </Text>
          <View style={{ width: 28 }} />
        </AnimatedView>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        >
          {/* Name */}
          <AnimatedView entering={SlideInUp.delay(100)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.dark.textSecondary,
                marginBottom: 8,
              }}
            >
              Full Name
            </Text>
            <TextInput
              style={{
                backgroundColor: Colors.dark.cardAlt,
                borderWidth: 1,
                borderColor: Colors.dark.textTertiary,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: Colors.dark.text,
                marginBottom: 16,
                fontSize: 14,
              }}
              placeholderTextColor={Colors.dark.textTertiary}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </AnimatedView>

          {/* Email */}
          <AnimatedView entering={SlideInUp.delay(150)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.dark.textSecondary,
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: Colors.dark.cardAlt,
                borderWidth: 1,
                borderColor: Colors.dark.textTertiary,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: Colors.dark.text,
                marginBottom: 16,
                fontSize: 14,
              }}
              placeholderTextColor={Colors.dark.textTertiary}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </AnimatedView>

          {/* Phone (Read-only) */}
          <AnimatedView entering={SlideInUp.delay(200)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.dark.textSecondary,
                marginBottom: 8,
              }}
            >
              Phone Number
            </Text>
            <View
              style={{
                backgroundColor: Colors.dark.cardAlt,
                borderWidth: 1,
                borderColor: Colors.dark.textTertiary,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: Colors.dark.text,
                  fontSize: 14,
                }}
              >
                {phone}
              </Text>
            </View>
          </AnimatedView>

          {/* Current City */}
          <AnimatedView entering={SlideInUp.delay(250)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.dark.textSecondary,
                marginBottom: 8,
              }}
            >
              Current City (Auto-Detected)
            </Text>
            <View
              style={{
                backgroundColor: Colors.dark.cardAlt,
                borderWidth: 1,
                borderColor: Colors.dark.textTertiary,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: Colors.dark.text, fontSize: 14 }}>
                {user?.currentCity || 'Location not detected yet'}
              </Text>
            </View>
          </AnimatedView>

          {/* Location Section */}
          <AnimatedView entering={SlideInUp.delay(300)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.dark.textSecondary,
                marginBottom: 8,
              }}
            >
              Location Coordinates
            </Text>
            {coordinates ? (
              <View
                style={{
                  backgroundColor: Colors.dark.cardAlt,
                  borderWidth: 1,
                  borderColor: Colors.dark.accentPrimary,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: Colors.dark.text,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    lineHeight: 20,
                  }}
                >
                  Lat: {coordinates.latitude.toFixed(6)}{'\n'}
                  Lng: {coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: Colors.dark.cardAlt,
                  borderWidth: 1,
                  borderColor: Colors.dark.textTertiary,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors.dark.textTertiary,
                    fontSize: 13,
                  }}
                >
                  Location not set
                </Text>
              </View>
            )}

            {/* Get Location Button */}
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              disabled={gettingLocation || loading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: Colors.dark.cardAlt,
                borderWidth: 1.5,
                borderColor: Colors.dark.accentPrimary,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 24,
                opacity: gettingLocation || loading ? 0.6 : 1,
              }}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color={Colors.dark.accentPrimary} />
              ) : (
                <Ionicons name="locate" size={18} color={Colors.dark.accentPrimary} />
              )}
              <Text
                style={{
                  color: Colors.dark.accentPrimary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </AnimatedView>

          {/* Dietary Preferences */}
          <AnimatedView entering={SlideInUp.delay(300)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.dark.textSecondary,
                marginBottom: 12,
              }}
            >
              Food Preferences
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {DIETARY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setDietaryPreferences((prev) =>
                      prev.includes(option.id)
                        ? prev.filter((p) => p !== option.id)
                        : [...prev, option.id]
                    );
                  }}
                  style={{
                    backgroundColor: dietaryPreferences.includes(option.id)
                      ? Colors.dark.accentPrimary
                      : Colors.dark.cardAlt,
                    borderWidth: 1.5,
                    borderColor: dietaryPreferences.includes(option.id)
                      ? Colors.dark.accentPrimary
                      : Colors.dark.textTertiary,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{option.icon}</Text>
                  <Text
                    style={{
                      color: dietaryPreferences.includes(option.id)
                        ? Colors.dark.bg
                        : Colors.dark.text,
                      fontSize: 12,
                      fontWeight: '500',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedView>

          {/* Save Button */}
          <AnimatedView entering={SlideInUp.delay(350)}>
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={loading}
              style={{
                backgroundColor: Colors.dark.accentPrimary,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.dark.bg} />
              ) : (
                <Text
                  style={{
                    color: Colors.dark.bg,
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </AnimatedView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
