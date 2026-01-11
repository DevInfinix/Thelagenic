import * as Location from 'expo-location';
import { PermissionsAndroid, Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Reverse geocoding API - Free alternative to Google Maps
 * Using Open-Meteo (free, no API key required)
 */

// Known cities in Mumbai area for quick matching
const MUMBAI_CITIES: Record<string, { lat: number; lng: number; range: number }> = {
  'kharghar': { lat: 19.0176, lng: 73.0822, range: 2 }, // 2km radius
  'nerul': { lat: 19.0208, lng: 73.0262, range: 2 },
  'panvel': { lat: 19.0176, lng: 73.1197, range: 2 },
  'vashi': { lat: 19.0708, lng: 73.0010, range: 2 },
  'thane': { lat: 19.2183, lng: 72.9781, range: 3 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, range: 3 },
  'mahape': { lat: 19.0391, lng: 73.1384, range: 2 },
  'seawoods': { lat: 19.0391, lng: 73.1384, range: 2 },
  'belapur': { lat: 19.0262, lng: 73.1419, range: 2 },
  'dombivali': { lat: 19.1164, lng: 73.0824, range: 2 },
  'turbhe': { lat: 19.1869, lng: 73.0073, range: 2 },
  'airoli': { lat: 19.1534, lng: 72.9940, range: 2 },
  'ghansoli': { lat: 19.1816, lng: 73.0011, range: 2 },
  'koparkhairane': { lat: 19.0868, lng: 73.0074, range: 2 },
  'sanpada': { lat: 19.0549, lng: 73.0190, range: 2 },
};

class LocationService {
  /**
   * Request location permission and get user's current coordinates
   */
  static async requestLocationPermission(): Promise<Coordinates | null> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'ThelaGenic needs access to your location to show nearby vendors',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied on Android');
          return null;
        }
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Detect city from coordinates using local knowledge base
   * Falls back to reverse geocoding if needed
   */
  static async detectCityFromCoordinates(coords: Coordinates): Promise<string> {
    try {
      // First, check against known cities
      for (const [cityName, cityData] of Object.entries(MUMBAI_CITIES)) {
        const distance = this.calculateDistance(
          coords.latitude,
          coords.longitude,
          cityData.lat,
          cityData.lng
        );

        if (distance <= cityData.range) {
          return this.normalizeCityName(cityName);
        }
      }

      // If no exact match, try reverse geocoding
      const results = await Location.reverseGeocodeAsync(coords);
      
      if (results && results.length > 0) {
        const result = results[0];
        // Try to extract city from various fields
        const city =
          result.city ||
          result.district ||
          result.region ||
          result.name ||
          'Unknown City';
        return this.normalizeCityName(city);
      }

      return 'Unknown City';
    } catch (error) {
      console.error('Error detecting city:', error);
      return 'Unknown City';
    }
  }

  /**
   * Normalize city name for consistent display
   */
  private static normalizeCityName(city: string): string {
    return city
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get vendors near user location within specified radius (in km)
   */
  static filterVendorsByProximity(
    vendors: any[],
    userLocation: Coordinates,
    radiusKm: number = 5
  ): any[] {
    return vendors.filter(vendor => {
      if (!vendor.shopLocation?.latitude || !vendor.shopLocation?.longitude) {
        return false;
      }

      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vendor.shopLocation.latitude,
        vendor.shopLocation.longitude
      );

      return distance <= radiusKm;
    });
  }

  /**
   * Sort vendors by distance from user location
   */
  static sortVendorsByDistance(
    vendors: any[],
    userLocation: Coordinates
  ): any[] {
    return [...vendors].sort((a, b) => {
      if (!a.shopLocation?.latitude || !b.shopLocation?.latitude) return 0;

      const distA = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.shopLocation.latitude,
        a.shopLocation.longitude
      );

      const distB = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.shopLocation.latitude,
        b.shopLocation.longitude
      );

      return distA - distB;
    });
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(coords: Coordinates): string {
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  }
}

export { LocationService };
