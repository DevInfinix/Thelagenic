import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { vendorService, VendorData } from '@/src/services/vendorService';
import { LocationService } from '@/src/services/locationService';
import { VendorCard } from '@/src/components/VendorCardNew';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ExploreScreen() {
  const { user } = useUser();
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(user?.location || null);
  const [userCity, setUserCity] = useState<string>(user?.currentCity || 'Kharghar');
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchRadius, setSearchRadius] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  const KHARGHAR_LOCATION = useMemo(() => ({ latitude: 19.0176, longitude: 73.0822 }), []);

  useEffect(() => {
    const loadExplore = async () => {
      try {
        setLoading(true);
        setLocationLoading(true);

        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const coords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(coords);
            const detectedCity = await LocationService.detectCityFromCoordinates(coords);
            setUserCity(detectedCity);
            } catch {
              console.log('Could not get current location, using default');
              setUserLocation(KHARGHAR_LOCATION);
              setUserCity('Kharghar');
            }
        } else {
          setUserLocation(KHARGHAR_LOCATION);
          setUserCity('Kharghar');
        }

        const allVendors = await vendorService.getAllVendors();
        setVendors(allVendors);
      } catch (error) {
        console.error('Error loading explore:', error);
      } finally {
        setLoading(false);
        setLocationLoading(false);
      }
    };

    loadExplore();
  }, [KHARGHAR_LOCATION]);

  // Get all unique categories from vendors
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    vendors.forEach(vendor => {
      vendor.dietaryDetails.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, [vendors]);

  const nearbyVendors = useMemo(() => {
    if (!userLocation) return [];

    return vendors
      .filter(vendor => vendor.shopLocation && vendor.shopLocation.latitude && vendor.shopLocation.longitude)
      .map(vendor => ({
        ...vendor,
        distance: LocationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          vendor.shopLocation.latitude,
          vendor.shopLocation.longitude
        ),
      }))
      .filter(vendor => vendor.distance <= searchRadius)
      .filter(vendor => {
        if (selectedCategory && !vendor.dietaryDetails.includes(selectedCategory)) {
          return false;
        }
        if (minRating > 0 && ((vendor.averageRating || vendor.aiScore || 0) < minRating)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [vendors, userLocation, searchRadius, selectedCategory, minRating]);

  const mapDarkStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9080' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3751ff' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ];

  if (loading || locationLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.dark.accentPrimary} />
          <Text style={{ marginTop: 12, color: Colors.dark.text }}>Loading explore...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.dark.text }}>
              Explore
            </Text>
            <Text style={{ color: Colors.dark.textSecondary, marginTop: 4 }}>
              {userCity} • {nearbyVendors.length} vendor{nearbyVendors.length !== 1 ? 's' : ''} within {searchRadius}km
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            style={{
              backgroundColor: Colors.dark.card,
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.dark.accentPrimary,
            }}
          >
            <Ionicons
              name={viewMode === 'map' ? 'list' : 'map'}
              size={20}
              color={Colors.dark.accentPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {/* Search radius */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setSearchRadius(2)}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: searchRadius === 2 ? Colors.dark.accentPrimary : Colors.dark.card,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: searchRadius === 2 ? Colors.dark.bg : Colors.dark.text }}>
              2km
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSearchRadius(5)}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: searchRadius === 5 ? Colors.dark.accentPrimary : Colors.dark.card,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: searchRadius === 5 ? Colors.dark.bg : Colors.dark.text }}>
              5km
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSearchRadius(10)}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: searchRadius === 10 ? Colors.dark.accentPrimary : Colors.dark.card,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: searchRadius === 10 ? Colors.dark.bg : Colors.dark.text }}>
              10km
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category filter */}
        <FlatList
          data={['All', ...allCategories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          style={{ marginBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item === 'All' ? '' : item)}
              style={{
                marginRight: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: selectedCategory === (item === 'All' ? '' : item) 
                  ? Colors.dark.accentPrimary 
                  : Colors.dark.card,
              }}
            >
              <Text style={{ fontSize: 12, color: selectedCategory === (item === 'All' ? '' : item) ? Colors.dark.bg : Colors.dark.text }}>
                {item === 'All' ? 'All Categories' : item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Rating filter */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 3, 4].map(rating => (
            <TouchableOpacity
              key={rating}
              onPress={() => setMinRating(rating)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 8,
                backgroundColor: minRating === rating ? Colors.dark.accentPrimary : Colors.dark.card,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              {rating > 0 && (
                <>
                  <Ionicons name="star" size={14} color={minRating === rating ? Colors.dark.bg : '#FFD700'} />
                  <Text style={{ fontSize: 12, color: minRating === rating ? Colors.dark.bg : Colors.dark.text }}>
                    {rating}+
                  </Text>
                </>
              )}
              {rating === 0 && (
                <Text style={{ fontSize: 12, color: minRating === rating ? Colors.dark.bg : Colors.dark.text }}>
                  Any Rating
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map View */}
      {viewMode === 'map' ? (
        <AnimatedView entering={FadeIn} style={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            customMapStyle={mapDarkStyle}
            initialRegion={{
              latitude: userLocation?.latitude || KHARGHAR_LOCATION.latitude,
              longitude: userLocation?.longitude || KHARGHAR_LOCATION.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Search radius circle */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={searchRadius * 1000}
                strokeColor={Colors.dark.accentPrimary}
                strokeWidth={2}
                fillColor="rgba(47, 209, 127, 0.1)"
              />
            )}

            {/* User location marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor={Colors.dark.accentPrimary}
              />
            )}

            {/* Vendor markers */}
            {nearbyVendors.map((vendor) => (
              <Marker
                key={vendor.id}
                coordinate={vendor.shopLocation}
                title={vendor.shopName}
                description={`${vendor.vendorName} • ${vendor.distance?.toFixed(1) || '?'}km`}
                pinColor={selectedVendor?.id === vendor.id ? '#FF6B6B' : Colors.dark.accentPrimary}
                onPress={() => setSelectedVendor(vendor)}
              />
            ))}
          </MapView>

          {/* Selected vendor card */}
          {selectedVendor && (
            <View
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: Colors.dark.card,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: Colors.dark.accentPrimary,
              }}
            >
              <TouchableOpacity onPress={() => setSelectedVendor(null)} style={{ marginBottom: 8 }}>
                <Ionicons name="close" size={20} color={Colors.dark.text} />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.dark.text }}>
                {selectedVendor.shopName}
              </Text>
              <Text style={{ color: Colors.dark.textSecondary, marginTop: 4 }}>
                by {selectedVendor.vendorName}
              </Text>
              <Text style={{ color: Colors.dark.textSecondary, marginTop: 2 }}>
                {selectedVendor.distance?.toFixed(1) || '?'}km away
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={{ color: Colors.dark.text, fontSize: 12 }}>
                    {(selectedVendor.averageRating || selectedVendor.aiScore || 0).toFixed(1)}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.dark.accentPrimary} />
                  <Text style={{ color: Colors.dark.text, fontSize: 12 }}>
                    AI: {(selectedVendor.aiScore || 0).toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </AnimatedView>
      ) : (
        /* List View */
        <AnimatedView entering={FadeIn} style={{ flex: 1 }}>
          {nearbyVendors.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={48} color={Colors.dark.textSecondary} />
              <Text style={{ marginTop: 12, color: Colors.dark.textSecondary, textAlign: 'center' }}>
                No vendors found within {searchRadius}km
              </Text>
              <Text style={{ marginTop: 4, color: Colors.dark.textSecondary, fontSize: 12 }}>
                Try enabling location or moving to a different area
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            >
              {nearbyVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                />
              ))}
            </ScrollView>
          )}
        </AnimatedView>
      )}
    </SafeAreaView>
  );
}
