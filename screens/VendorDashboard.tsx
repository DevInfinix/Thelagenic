import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
// Rename SVG LinearGradient to avoid conflict with Expo LinearGradient
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system/legacy'; 
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

// CONFIGURATION
const CLOUDINARY_CLOUD_NAME = "dgesmp2st"; 
const CLOUDINARY_UPLOAD_PRESET = "hygieat_preset"; 

// TYPES
interface VendorData {
  name: string;
  description: string;
  image: string;
  rating: number; // This comes from Firebase
  hygieneGrade: string;
  lat: number;
  lng: number;
  menu: Array<{ name: string; price: string; image: string; }>;
  fssaiUrl?: string; // FSSAI Certificate
  dailyVideoUrl?: string; // Today's Video
}

// --- SPEEDOMETER COMPONENT ---
const ModernSpeedometer = ({ rating, max = 5 }: { rating: number; max?: number }) => {
  const size = 160; // Slightly smaller to fit better
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const percentage = Math.min(Math.max(rating / max, 0), 1);
  
  const getCoordinates = (angle: number) => {
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  const createArc = (start: number, end: number) => {
    const startPos = getCoordinates(start);
    const endPos = getCoordinates(end);
    return `M ${startPos.x} ${startPos.y} A ${radius} ${radius} 0 0 1 ${endPos.x} ${endPos.y}`;
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#EF4444" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#F59E0B" stopOpacity="1" />
            <Stop offset="1" stopColor="#10B981" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {/* Track Color changed for Light Mode */}
        <Path d={createArc(Math.PI, 2 * Math.PI)} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        <Path d={createArc(Math.PI, Math.PI + (percentage * Math.PI))} stroke="url(#grad)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </Svg>
      <View style={styles.gaugeTextContainer}>
        <Text style={styles.gaugeScore}>{rating ? rating.toFixed(1) : "0.0"}</Text>
        <Text style={styles.gaugeMax}>/ {max}</Text>
      </View>
    </View>
  );
};

export default function VendorDashboard({ route, navigation }: any) {
  const { vendorId } = route.params;
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [menuOpen, setMenuOpen] = useState(true); // Open by default for better UX
  const [uploadingTask, setUploadingTask] = useState<string | null>(null);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const snap = await getDoc(doc(db, 'vendors', vendorId));
      if (snap.exists()) {
        const data = snap.data() as VendorData;
        setVendor(data);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // --- UPLOAD HELPER ---
  const uploadToCloudinary = async (uri: string, type: 'image' | 'video') => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const data = new FormData();
      data.append('file', `data:${type === 'video' ? 'video/mp4' : 'image/jpeg'};base64,${base64}`);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      data.append('cloud_name', CLOUDINARY_CLOUD_NAME);
      data.append('folder', type === 'video' ? 'hygieat/vendors/videos' : 'hygieat/vendors/docs'); 
      if (type === 'video') data.append('resource_type', 'video');

      const urlType = type === 'video' ? 'video' : 'image';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${urlType}/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.secure_url) return result.secure_url;
      throw new Error("Cloudinary upload failed");
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  };

  // --- TASK 1: FSSAI UPLOAD ---
  const handleUploadFSSAI = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.5,
    });

    if (!result.canceled) {
      setUploadingTask('fssai');
      try {
        const url = await uploadToCloudinary(result.assets[0].uri, 'image');
        // Update Firestore
        await updateDoc(doc(db, 'vendors', vendorId), { fssaiUrl: url });
        // Update Local State
        setVendor(prev => prev ? { ...prev, fssaiUrl: url } : null);
        Alert.alert("Success", "FSSAI Certificate Uploaded!");
      } catch (e) {
        Alert.alert("Error", "Upload failed.");
      } finally {
        setUploadingTask(null);
      }
    }
  };

  // --- TASK 2: VIDEO RECORDING ---
  const startRecording = async () => {
    if (!cameraRef.current || !cameraReady) return;
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    
    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 30 });
      if (video) {
        handleUploadVideo(video.uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Recording failed");
    } finally {
      setIsRecording(false);
      setShowCamera(false);
    }
  };

  const handleUploadVideo = async (uri: string) => {
    setUploadingTask('video');
    try {
      const url = await uploadToCloudinary(uri, 'video');
      await updateDoc(doc(db, 'vendors', vendorId), { dailyVideoUrl: url });
      setVendor(prev => prev ? { ...prev, dailyVideoUrl: url } : null);
      Alert.alert("Success", "Daily Video Uploaded!");
    } catch (e) {
      Alert.alert("Error", "Video upload failed.");
    } finally {
      setUploadingTask(null);
    }
  };

  // --- CAMERA MODAL ---
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <StatusBar hidden />
        <CameraView 
          ref={cameraRef} 
          style={styles.camera} 
          facing="back" 
          mode="video" 
          onCameraReady={() => setCameraReady(true)}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCamBtn} onPress={() => setShowCamera(false)}>
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.recordContainer}>
              <TouchableOpacity
                style={[styles.recordBtnOuter, isRecording && styles.recordingActive]}
                onPress={isRecording ? () => cameraRef.current?.stopRecording() : startRecording}
              >
                <View style={[styles.recordBtnInner, isRecording ? styles.stopSquare : styles.recordCircle]} />
              </TouchableOpacity>
              <Text style={styles.recordText}>{isRecording ? "Recording..." : "Tap to Record (30s)"}</Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (loading || !vendor) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>Syncing Dashboard...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Light Theme Status Bar */}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: vendor.image }} style={styles.heroImage} />
          {/* Subtle gradient overlay for back button visibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.heroGradient}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.stallName}>{vendor.name}</Text>
                <Text style={styles.stallDesc} numberOfLines={2}>{vendor.description}</Text>
              </View>
              <View style={styles.hygieneBadge}>
                <Text style={styles.gradeLabel}>GRADE</Text>
                <Text style={styles.gradeValue}>{vendor.hygieneGrade}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>TRUST RATING</Text>
                <ModernSpeedometer rating={vendor.rating} />
              </View>
              <View style={styles.locationCol}>
                 <Text style={styles.statLabel}>LOCATION</Text>
                 <View style={styles.locBox}>
                   <Ionicons name="location" size={16} color="#10B981" />
                   <Text style={styles.locText}>{vendor.lat.toFixed(4)}</Text>
                 </View>
                 <View style={styles.locBox}>
                   <Ionicons name="location" size={16} color="#10B981" />
                   <Text style={styles.locText}>{vendor.lng.toFixed(4)}</Text>
                 </View>
              </View>
            </View>
          </View>

          {/* --- SECTION: GENERAL TASKS --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Tasks</Text>
            <Text style={styles.sectionSub}>One-time setup for verified badge.</Text>

             {/* FSSAI Card */}
             <View style={[styles.taskCard, vendor.fssaiUrl && styles.taskComplete]}>
              <View style={[styles.taskIcon, vendor.fssaiUrl && styles.taskIconComplete]}>
                <Ionicons name={vendor.fssaiUrl ? "shield-checkmark" : "document-text-outline"} size={24} color={vendor.fssaiUrl ? "#059669" : "#64748b"} />
              </View>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, vendor.fssaiUrl && styles.textComplete]}>FSSAI Certificate</Text>
                <Text style={[styles.taskDesc, vendor.fssaiUrl && styles.textCompleteSub]}>{vendor.fssaiUrl ? "Verification Complete" : "Upload document to verify"}</Text>
              </View>
              {!vendor.fssaiUrl && (
                <TouchableOpacity onPress={handleUploadFSSAI} disabled={!!uploadingTask}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.actionBtn}
                  >
                     {uploadingTask === 'fssai' ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.actionBtnText}>Upload</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* --- SECTION: DAILY TASKS --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Tasks</Text>
            <Text style={styles.sectionSub}>Required to maintain daily hygiene score.</Text>
            
            {/* Daily Video Card */}
            <View style={[styles.taskCard, vendor.dailyVideoUrl && styles.taskComplete]}>
              <View style={[styles.taskIcon, vendor.dailyVideoUrl && styles.taskIconComplete]}>
                <Ionicons name={vendor.dailyVideoUrl ? "videocam" : "videocam-outline"} size={24} color={vendor.dailyVideoUrl ? "#059669" : "#64748b"} />
              </View>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, vendor.dailyVideoUrl && styles.textComplete]}>Daily Kitchen Live</Text>
                <Text style={[styles.taskDesc, vendor.dailyVideoUrl && styles.textCompleteSub]}>{vendor.dailyVideoUrl ? "Uploaded for today" : "Record 30s video of kitchen"}</Text>
              </View>
              {!vendor.dailyVideoUrl && (
                <TouchableOpacity onPress={() => setShowCamera(true)} disabled={!!uploadingTask}>
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']} // Red gradient for recording
                    style={styles.actionBtn}
                  >
                    {uploadingTask === 'video' ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.actionBtnText}>Record</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* --- SECTION: MENU --- */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              onPress={() => setMenuOpen(!menuOpen)} 
              activeOpacity={0.7}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.menuIconBadge}>
                    <Ionicons name="fast-food-outline" size={20} color="#10B981" />
                </View>
                <Text style={styles.dropdownTitle}>Stall Menu ({vendor.menu?.length || 0})</Text>
              </View>
              <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={24} color="#64748b" />
            </TouchableOpacity>
            
            {menuOpen && (
              <View style={styles.menuGrid}>
                {vendor.menu?.length > 0 ? (
                  vendor.menu.map((item, index) => (
                    <View key={index} style={styles.menuItemCard}>
                      <Image source={{ uri: item.image }} style={styles.menuImage} />
                      <View style={styles.menuInfo}>
                        <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.menuPrice}>₹{item.price}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No menu items available.</Text>
                )}
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // --- THEME: Clean Light Modern ---
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { color: '#10B981', marginTop: 12, fontWeight: '600' },
  
  // Hero
  heroContainer: { height: 280, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },

  // Main Content
  mainContent: { marginTop: -60, paddingHorizontal: 20 },
  
  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
    marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9'
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stallName: { fontSize: 26, fontWeight: '800', color: '#1e293b', marginBottom: 6, letterSpacing: -0.5 },
  stallDesc: { color: '#64748b', fontSize: 14, lineHeight: 20 },
  hygieneBadge: { 
    backgroundColor: '#ecfdf5', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, 
    alignItems: 'center', minWidth: 60, borderWidth: 1, borderColor: '#d1fae5'
  },
  gradeLabel: { fontSize: 9, fontWeight: '700', color: '#047857', letterSpacing: 0.5 },
  gradeValue: { fontSize: 24, fontWeight: '900', color: '#10B981', lineHeight: 28 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 24 },
  
  // Stats
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  locationCol: { flex: 1, paddingLeft: 24, justifyContent: 'center' },
  statLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  locBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  locText: { color: '#475569', marginLeft: 8, fontSize: 13, fontWeight: '600' },

  gaugeContainer: { alignItems: 'center', justifyContent: 'center', height: 90 },
  gaugeTextContainer: { position: 'absolute', bottom: -5, alignItems: 'center' },
  gaugeScore: { fontSize: 36, fontWeight: '800', color: '#1e293b' },
  gaugeMax: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },

  // Sections
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 2 },
  
  // Task Cards
  taskCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  taskComplete: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  taskIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  taskIconComplete: { backgroundColor: '#dcfce7' },
  taskContent: { flex: 1 },
  taskTitle: { color: '#1e293b', fontWeight: '700', fontSize: 15 },
  taskDesc: { color: '#64748b', fontSize: 12, marginTop: 4 },
  textComplete: { color: '#15803d' },
  textCompleteSub: { color: '#166534' },
  
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  // Menu
  dropdownHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2
  },
  menuIconBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  menuItemCard: {
    width: (width - 56) / 2, backgroundColor: '#FFFFFF', borderRadius: 16,
    marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  menuImage: { width: '100%', height: 130, resizeMode: 'cover' },
  menuInfo: { padding: 12 },
  menuName: { color: '#1e293b', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  menuPrice: { color: '#10B981', fontWeight: '800', fontSize: 16 },
  emptyText: { color: '#94a3b8', width: '100%', textAlign: 'center', marginTop: 10, fontStyle: 'italic' },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 30, paddingTop: 60, paddingBottom: 50 },
  closeCamBtn: { alignSelf: 'flex-end', padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25 },
  recordContainer: { alignItems: 'center' },
  recordBtnOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  recordingActive: { borderColor: '#EF4444' },
  recordBtnInner: { backgroundColor: '#EF4444' },
  recordCircle: { width: 66, height: 66, borderRadius: 33 },
  stopSquare: { width: 40, height: 40, borderRadius: 6 },
  recordText: { color: '#FFF', marginTop: 12, fontWeight: '600' }
});