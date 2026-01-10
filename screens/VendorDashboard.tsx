import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Make sure to install expo-blur if available, else standard View works

// TYPES
interface VendorData {
  name: string;
  description: string;
  image: string;
  video?: string;
  rating: number;
  hygieneGrade: string;
  lat: number;
  lng: number;
  menu: Array<{ name: string; price: string; image: string; }>;
}

// --- NEW SPEEDOMETER COMPONENT ---
// Uses a clean semi-circle arc calculation
const ModernSpeedometer = ({ rating, max = 5 }: { rating: number; max?: number }) => {
  const size = 180;
  const strokeWidth = 15;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  
  // Calculate angle: 0 = -90deg, max = 90deg
  const percentage = Math.min(Math.max(rating / max, 0), 1);
  const startAngle = -Math.PI; // -180 deg (far left)
  const endAngle = 0; // 0 deg (far right) for full semi-circle
  
  // The colored arc angle
  const activeEndAngle = startAngle + (percentage * Math.PI);

  // Helper to get XY coordinates from angle
  const getCoordinates = (angle: number) => {
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Helper to create SVG Arc Path
  const createArc = (start: number, end: number) => {
    const startPos = getCoordinates(start);
    const endPos = getCoordinates(end);
    // largeArcFlag is 0 because we are only doing semicircles (<= 180)
    return `M ${startPos.x} ${startPos.y} A ${radius} ${radius} 0 0 1 ${endPos.x} ${endPos.y}`;
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FF4B4B" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#FFD336" stopOpacity="1" />
            <Stop offset="1" stopColor="#00E096" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Background Track (Gray) */}
        <Path
          d={createArc(Math.PI, 2 * Math.PI)} // Full top semi-circle
          stroke="#1F2937"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Active Rating Arc (Gradient) */}
        <Path
          d={createArc(Math.PI, Math.PI + (percentage * Math.PI))}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Centered Rating Text */}
      <View style={styles.gaugeTextContainer}>
        <Text style={styles.gaugeScore}>{rating.toFixed(1)}</Text>
        <Text style={styles.gaugeMax}>/ {max}</Text>
      </View>
    </View>
  );
};

export default function VendorDashboard({ route, navigation }: any) {
  const { vendorId } = route.params;
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const snap = await getDoc(doc(db, 'vendors', vendorId));
        if (snap.exists()) setVendor(snap.data() as VendorData);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    if (vendorId) fetchVendor();
  }, [vendorId]);

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#00E096" />
      <Text style={styles.loadingText}>Syncing Dashboard...</Text>
    </View>
  );

  if (!vendor) return <View style={styles.centerContainer}><Text style={styles.errorText}>Vendor not found</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* --- HERO SECTION --- */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: vendor.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* --- FLOATING INFO CARD --- */}
        <View style={styles.mainContent}>
          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stallName}>{vendor.name}</Text>
                <Text style={styles.stallDesc} numberOfLines={2}>{vendor.description}</Text>
              </View>
              <View style={styles.hygieneBadge}>
                <Text style={styles.gradeLabel}>GRADE</Text>
                <Text style={styles.gradeValue}>{vendor.hygieneGrade}</Text>
              </View>
            </View>

            {/* Separator */}
            <View style={styles.divider} />

            {/* Speedometer & Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>TRUST RATING</Text>
                <ModernSpeedometer rating={vendor.rating} />
              </View>
              <View style={styles.locationCol}>
                 <Text style={styles.statLabel}>LOCATION</Text>
                 <View style={styles.locBox}>
                   <Ionicons name="location" size={16} color="#00E096" />
                   <Text style={styles.locText}>Lat: {vendor.lat.toFixed(2)}</Text>
                 </View>
                 <View style={styles.locBox}>
                   <Ionicons name="location" size={16} color="#00E096" />
                   <Text style={styles.locText}>Lng: {vendor.lng.toFixed(2)}</Text>
                 </View>
              </View>
            </View>
          </View>

          {/* --- VIDEO SECTION --- */}
          {vendor.video && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Live Kitchen Feed</Text>
              <View style={styles.videoWrapper}>
                {!showVideo ? (
                  <TouchableOpacity onPress={() => setShowVideo(true)} style={styles.videoPlaceholder}>
                    <Image source={{ uri: vendor.image }} style={styles.videoThumb} blurRadius={5} />
                    <View style={styles.playBtn}>
                      <Ionicons name="play" size={30} color="#000" />
                    </View>
                    <Text style={styles.playText}>Watch Verification Video</Text>
                  </TouchableOpacity>
                ) : (
                  <Video
                    source={{ uri: vendor.video }}
                    style={styles.videoPlayer}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                  />
                )}
              </View>
            </View>
          )}

          {/* --- MENU GRID --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu Items ({vendor.menu?.length || 0})</Text>
            
            <View style={styles.menuGrid}>
              {vendor.menu?.map((item, index) => (
                <View key={index} style={styles.menuItemCard}>
                  <Image source={{ uri: item.image }} style={styles.menuImage} />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.menuPrice}>₹{item.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' },
  loadingText: { color: '#00E096', marginTop: 10, letterSpacing: 1 },
  errorText: { color: '#EF4444', fontSize: 18 },

  // Hero
  heroContainer: { height: 280, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 15, 25, 0.4)' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },

  // Content
  mainContent: { marginTop: -60, paddingHorizontal: 20 },
  infoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  
  // Header Row
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stallName: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  stallDesc: { color: '#9CA3AF', fontSize: 13, paddingRight: 10 },
  hygieneBadge: { backgroundColor: '#00E096', borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 60 },
  gradeLabel: { fontSize: 8, fontWeight: 'bold', color: '#0B0F19' },
  gradeValue: { fontSize: 22, fontWeight: '900', color: '#0B0F19' },

  divider: { height: 1, backgroundColor: '#374151', marginVertical: 20 },

  // Stats & Gauge
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center' },
  locationCol: { flex: 1, paddingLeft: 20 },
  statLabel: { color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  
  gaugeContainer: { alignItems: 'center', justifyContent: 'center', height: 100 },
  gaugeTextContainer: { position: 'absolute', bottom: 0, alignItems: 'center' },
  gaugeScore: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  gaugeMax: { fontSize: 12, color: '#9CA3AF' },

  locBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#111827', padding: 8, borderRadius: 8 },
  locText: { color: '#D1D5DB', marginLeft: 6, fontSize: 12, fontWeight: '600' },

  // Sections
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 16 },

  // Video
  videoWrapper: { borderRadius: 16, overflow: 'hidden', height: 200, backgroundColor: '#000' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoThumb: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00E096', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  playText: { color: '#FFF', fontWeight: 'bold', zIndex: 10 },
  videoPlayer: { width: '100%', height: '100%' },

  // Menu Grid
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItemCard: {
    width: (width - 60) / 2, // 2 column layout
    backgroundColor: '#1F2937',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151'
  },
  menuImage: { width: '100%', height: 120, resizeMode: 'cover' },
  menuInfo: { padding: 12 },
  menuName: { color: '#FFF', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  menuPrice: { color: '#00E096', fontWeight: 'bold', fontSize: 16 },
});