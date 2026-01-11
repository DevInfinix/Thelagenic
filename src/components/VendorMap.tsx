import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { VendorData } from '@/src/services/vendorService';

interface VendorMapProps {
  vendors: VendorData[];
  onVendorPress: (vendorId: string) => void;
  initialLocation?: { latitude: number; longitude: number };
  isLoading?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const VendorMap: React.FC<VendorMapProps> = ({
  vendors,
  onVendorPress,
  initialLocation = { latitude: 28.6139, longitude: 77.2023 }, // Delhi default
  isLoading = false,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Calculate center point from vendors
  const getCenterLocation = () => {
    if (vendors.length === 0) return initialLocation;
    
    // Filter vendors with valid locations
    const validVendors = vendors.filter(v => v.shopLocation?.latitude && v.shopLocation?.longitude);
    if (validVendors.length === 0) return initialLocation;
    
    const avgLat =
      validVendors.reduce((sum, v) => sum + v.shopLocation.latitude, 0) /
      validVendors.length;
    const avgLng =
      validVendors.reduce((sum, v) => sum + v.shopLocation.longitude, 0) /
      validVendors.length;

    return { latitude: avgLat, longitude: avgLng };
  };

  const center = getCenterLocation();

  return (
    <AnimatedView
      entering={FadeIn.duration(600)}
      style={{
        width: '100%',
        height: 300,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: Colors.dark.textTertiary,
      }}
    >
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.dark.bg,
          }}
        >
          <ActivityIndicator size="large" color={Colors.dark.accentPrimary} />
          <Text
            style={{
              marginTop: 12,
              color: Colors.dark.textSecondary,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            Loading map...
          </Text>
        </View>
      ) : (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              ...center,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            customMapStyle={mapStyle}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {vendors
              .filter(v => v.shopLocation?.latitude && v.shopLocation?.longitude)
              .map((vendor) => (
              <Marker
                key={vendor.id}
                coordinate={vendor.shopLocation}
                onPress={() => {
                  setSelectedVendor(vendor.id);
                  onVendorPress(vendor.id);
                }}
                title={vendor.shopName || 'Unknown Vendor'}
        description={`Rating: ${(vendor.averageRating ?? 0).toFixed(1)}/5 • Score: ${(vendor.aiScore ?? 0).toFixed(1)}/10`}
              >
                <View
                  style={{
                    backgroundColor:
                      selectedVendor === vendor.id
                        ? Colors.dark.accentPrimary
                        : `rgba(47, 209, 127, 0.7)`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: selectedVendor === vendor.id ? 2 : 0,
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

          {/* Map Legend */}
          <AnimatedView
            entering={ZoomIn.delay(400)}
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: Colors.dark.accentPrimary,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: Colors.dark.text,
                  fontWeight: '600',
                }}
              >
                {vendors.length} stalls
              </Text>
            </View>
          </AnimatedView>

          {/* Map Controls */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              gap: 8,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={24} color={Colors.dark.bg} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="remove" size={24} color={Colors.dark.bg} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </AnimatedView>
  );
};

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
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#4e4e4e' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
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
