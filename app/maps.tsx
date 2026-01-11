import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { vendorService, VendorData } from '@/src/services/vendorService';
import { LocationService } from '@/src/services/locationService';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function MapsScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useUser();
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userCity, setUserCity] = useState<string>('Kharghar');
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchRadius] = useState(5); // in kilometers

  // Kharghar, Mumbai coordinates for demo
  const KHARGHAR_LOCATION = useMemo(() => ({ latitude: 19.0176, longitude: 73.0822 }), []);

  const requestLocationPermission = useCallback(async () => {
    try {
      let locationStatus = 'granted';

      // Request permission (handles both Android and iOS)
      const { status } = await Location.requestForegroundPermissionsAsync();
      locationStatus = status;

      if (locationStatus !== 'granted') {
        console.log('Location permission denied, using saved location or Kharghar');
        
        // Try to use saved location from user profile
        if (user?.location) {
          setUserLocation(user.location);
          setUserCity(user.currentCity || 'Kharghar');
        } else {
          setUserLocation(KHARGHAR_LOCATION);
          setUserCity('Kharghar');
        }
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);

      // Detect city from coordinates
      const detectedCity = await LocationService.detectCityFromCoordinates(coords);
      setUserCity(detectedCity);

      // Update user profile with location in background
      if (user) {
        updateUserProfile({
          location: coords,
          currentCity: detectedCity,
        }).catch(err => console.error('Error updating location:', err));
      }
    } catch (error) {
      console.error('Location error:', error);
      
      // Fallback to saved location or demo
      if (user?.location) {
        setUserLocation(user.location);
        setUserCity(user.currentCity || 'Kharghar');
      } else {
        setUserLocation(KHARGHAR_LOCATION);
        setUserCity('Kharghar');
      }
    } finally {
      setLocationLoading(false);
    }
  }, [KHARGHAR_LOCATION, user, updateUserProfile]);

  const initializeMap = useCallback(async () => {
    try {
      setLoading(true);
      setLocationLoading(true);

      // Request location permission
      await requestLocationPermission();

      // Load vendors
      const allVendors = await vendorService.getAllVendors();
      setVendors(allVendors);
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      setLoading(false);
    }
  }, [requestLocationPermission]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const handleVendorPress = (vendor: VendorData) => {
    setSelectedVendor(vendor);
  };

  const handleViewDetails = () => {
    if (selectedVendor) {
      router.push(`/vendor/${selectedVendor.id}`);
    }
  };
  const validVendors = useMemo(() => {
    const filtered = vendors.filter(
      v => v.shopLocation?.latitude && v.shopLocation?.longitude
    );

    if (!userLocation) return filtered;

    // Filter vendors within search radius
    const nearby = LocationService.filterVendorsByProximity(
      filtered,
      userLocation,
      searchRadius
    );

    // Sort by distance
    return LocationService.sortVendorsByDistance(nearby, userLocation);
  }, [vendors, userLocation, searchRadius]);

  const mapCenter = userLocation || KHARGHAR_LOCATION;

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
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: Colors.dark.text,
              }}
            >
              {userCity}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.dark.textTertiary,
                marginTop: 2,
              }}
            >
              {validVendors.length} vendors within {searchRadius}km
            </Text>
          </View>
          <View style={{ width: 28 }} />
        </AnimatedView>

        {/* Map */}
        {loading || locationLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Colors.dark.cardAlt,
            }}
          >
            <ActivityIndicator size="large" color={Colors.dark.accentPrimary} />
            <Text
              style={{
                marginTop: 12,
                color: Colors.dark.textSecondary,
                fontSize: 14,
              }}
            >
              {locationLoading ? 'Getting your location...' : 'Loading vendors...'}
            </Text>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              ...mapCenter,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            customMapStyle={mapStyle}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {/* User location marker */}
            {userLocation && (
              <>
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  pinColor={Colors.dark.accentPrimary}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: Colors.dark.accentPrimary,
                      borderWidth: 3,
                      borderColor: Colors.dark.bg,
                    }}
                  />
                </Marker>
                {/* Search radius circle */}
                <Circle
                  center={userLocation}
                  radius={5000} // 5km radius
                  fillColor={`rgba(47, 209, 127, 0.1)`}
                  strokeColor={Colors.dark.accentPrimary}
                  strokeWidth={1}
                />
              </>
            )}

            {/* Vendor markers */}
            {validVendors.map((vendor) => (
              <Marker
                key={vendor.id}
                coordinate={vendor.shopLocation}
                onPress={() => handleVendorPress(vendor)}
                title={vendor.shopName || 'Unknown'}
              >
                <View
                  style={{
                    backgroundColor:
                      selectedVendor?.id === vendor.id
                        ? Colors.dark.accentPrimary
                        : `rgba(47, 209, 127, 0.8)`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: selectedVendor?.id === vendor.id ? 2 : 0,
                    borderColor: Colors.dark.bg,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: Colors.dark.bg,
                    }}
                    numberOfLines={1}
                  >
          ⭐ {(vendor.averageRating ?? 0).toFixed(1)}
                  </Text>
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Vendor Info Sheet */}
        {selectedVendor && (
          <AnimatedView
            entering={SlideInUp.springify()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.dark.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: Colors.dark.textTertiary,
            }}
          >
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: Colors.dark.text,
                      marginBottom: 4,
                    }}
                  >
                    {selectedVendor.shopName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.dark.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    {selectedVendor.shopAddress}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedVendor(null)}>
                  <Ionicons name="close-circle" size={24} color={Colors.dark.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Rating and Score */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 20,
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: Colors.dark.textSecondary, marginBottom: 4 }}>
                    User Rating
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: Colors.dark.accentPrimary,
                    }}
                  >
          ⭐ {(selectedVendor.averageRating ?? 0).toFixed(1)}/5
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: Colors.dark.textSecondary, marginBottom: 4 }}>
                    Hygiene Score
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: Colors.dark.accentPrimary,
                    }}
                  >
                    🏆 {(selectedVendor.aiScore ?? 0).toFixed(1)}/10
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: Colors.dark.textSecondary, marginBottom: 4 }}>
                    Rank
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: Colors.dark.accentPrimary,
                    }}
                  >
                    #{selectedVendor.shopRank}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleViewDetails}
                style={{
                  backgroundColor: Colors.dark.accentPrimary,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: Colors.dark.bg,
                  }}
                >
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedView>
        )}

        {/* Stats Footer */}
        <AnimatedView
          entering={FadeIn}
          style={{
            position: 'absolute',
            top: 80,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.dark.text,
            }}
          >
            {validVendors.length} vendors nearby
          </Text>
        </AnimatedView>
      </View>
    </SafeAreaView>
  );
}

// Dark themed map style
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#373737' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3c3c' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];
