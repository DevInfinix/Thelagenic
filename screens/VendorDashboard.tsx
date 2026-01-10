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
  Modal
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
// Using the legacy import as requested for compatibility
import * as FileSystem from 'expo-file-system/legacy'; 
import { CameraView, useCameraPermissions } from 'expo-camera';

// CONFIGURATION
const CLOUDINARY_CLOUD_NAME = "dgesmp2st"; 
const CLOUDINARY_UPLOAD_PRESET = "hygieat_preset"; 

// TYPES
interface VendorData {
  name: string;
  description: string;
  image: string;
  rating: number;
  hygieneGrade: string;
  lat: number;
  lng: number;
  menu: Array<{ name: string; price: string; image: string; }>;
  fssaiUrl?: string; // New field for FSSAI Certificate
  dailyVideoUrl?: string; // New field for Today's Video
}

// --- SPEEDOMETER COMPONENT ---
const ModernSpeedometer = ({ rating, max = 5 }: { rating: number; max?: number }) => {
  const size = 180;
  const strokeWidth = 15;
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
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FF4B4B" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#FFD336" stopOpacity="1" />
            <Stop offset="1" stopColor="#00E096" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path d={createArc(Math.PI, 2 * Math.PI)} stroke="#1F2937" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        <Path d={createArc(Math.PI, Math.PI + (percentage * Math.PI))} stroke="url(#grad)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </Svg>
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
  
  // UI State
  const [menuOpen, setMenuOpen] = useState(false); // Dropdown closed by default
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
      if (snap.exists()) setVendor(snap.data() as VendorData);
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
      <ActivityIndicator size="large" color="#00E096" />
      <Text style={styles.loadingText}>Syncing Dashboard...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: vendor.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* INFO CARD */}
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
            <View style={styles.divider} />
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>TRUST RATING</Text>
                <ModernSpeedometer rating={vendor.rating} />
              </View>
              <View style={styles.locationCol}>
                 <Text style={styles.statLabel}>LOCATION</Text>
                 <View style={styles.locBox}><Ionicons name="location" size={16} color="#00E096" /><Text style={styles.locText}>{vendor.lat.toFixed(2)}, {vendor.lng.toFixed(2)}</Text></View>
              </View>
            </View>
          </View>

          {/* --- SECTION: PENDING TASKS --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Tasks</Text>
            <Text style={styles.sectionSub}>Complete these to verify your stall today.</Text>
            
            {/* Task 1: FSSAI */}
            <View style={[styles.taskCard, vendor.fssaiUrl && styles.taskComplete]}>
              <View style={styles.taskIcon}>
                <Ionicons name={vendor.fssaiUrl ? "checkmark-done" : "document-text"} size={24} color={vendor.fssaiUrl ? "#0B0F19" : "#00E096"} />
              </View>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, vendor.fssaiUrl && styles.textComplete]}>Upload FSSAI Certificate</Text>
                <Text style={[styles.taskDesc, vendor.fssaiUrl && styles.textCompleteSub]}>{vendor.fssaiUrl ? "Verified" : "Required for license badge"}</Text>
              </View>
              {!vendor.fssaiUrl && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleUploadFSSAI} disabled={!!uploadingTask}>
                  {uploadingTask === 'fssai' ? <ActivityIndicator size="small" color="#0B0F19" /> : <Text style={styles.actionBtnText}>Upload</Text>}
                </TouchableOpacity>
              )}
            </View>

            {/* Task 2: Daily Video */}
            <View style={[styles.taskCard, vendor.dailyVideoUrl && styles.taskComplete]}>
              <View style={styles.taskIcon}>
                <Ionicons name={vendor.dailyVideoUrl ? "checkmark-done" : "videocam"} size={24} color={vendor.dailyVideoUrl ? "#0B0F19" : "#00E096"} />
              </View>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, vendor.dailyVideoUrl && styles.textComplete]}>Record Live Video</Text>
                <Text style={[styles.taskDesc, vendor.dailyVideoUrl && styles.textCompleteSub]}>{vendor.dailyVideoUrl ? "Uploaded for today" : "Show kitchen hygiene (30s)"}</Text>
              </View>
              {!vendor.dailyVideoUrl && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCamera(true)} disabled={!!uploadingTask}>
                  {uploadingTask === 'video' ? <ActivityIndicator size="small" color="#0B0F19" /> : <Text style={styles.actionBtnText}>Record</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* --- SECTION: COLLAPSIBLE MENU --- */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              onPress={() => setMenuOpen(!menuOpen)} 
              activeOpacity={0.7}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="restaurant" size={20} color="#00E096" style={{marginRight: 10}}/>
                <Text style={styles.dropdownTitle}>Menu Items ({vendor.menu?.length || 0})</Text>
              </View>
              <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={24} color="#9CA3AF" />
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
  container: { flex: 1, backgroundColor: '#0B0F19' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' },
  loadingText: { color: '#00E096', marginTop: 10 },
  
  heroContainer: { height: 280, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 15, 25, 0.4)' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },

  mainContent: { marginTop: -60, paddingHorizontal: 20 },
  infoCard: {
    backgroundColor: '#1F2937', borderRadius: 20, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    borderWidth: 1, borderColor: '#374151', marginBottom: 20
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stallName: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  stallDesc: { color: '#9CA3AF', fontSize: 13, paddingRight: 10 },
  hygieneBadge: { backgroundColor: '#00E096', borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 60 },
  gradeLabel: { fontSize: 8, fontWeight: 'bold', color: '#0B0F19' },
  gradeValue: { fontSize: 22, fontWeight: '900', color: '#0B0F19' },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 20 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center' },
  locationCol: { flex: 1, paddingLeft: 20 },
  statLabel: { color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  locBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#111827', padding: 8, borderRadius: 8 },
  locText: { color: '#D1D5DB', marginLeft: 6, fontSize: 12, fontWeight: '600' },

  gaugeContainer: { alignItems: 'center', justifyContent: 'center', height: 100 },
  gaugeTextContainer: { position: 'absolute', bottom: 0, alignItems: 'center' },
  gaugeScore: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  gaugeMax: { fontSize: 12, color: '#9CA3AF' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  sectionSub: { fontSize: 12, color: '#9CA3AF', marginBottom: 16 },
  
  // Tasks
  taskCard: {
    backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#374151'
  },
  taskComplete: { backgroundColor: '#00E096', borderColor: '#00E096' },
  taskIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  taskContent: { flex: 1 },
  taskTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  taskDesc: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  textComplete: { color: '#0B0F19' },
  textCompleteSub: { color: '#1F2937' },
  
  actionBtn: { backgroundColor: '#00E096', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  actionBtnText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 12 },

  // Menu Dropdown
  dropdownHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#1F2937', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#374151'
  },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  menuItemCard: {
    width: (width - 60) / 2, backgroundColor: '#1F2937', borderRadius: 16,
    marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#374151'
  },
  menuImage: { width: '100%', height: 120, resizeMode: 'cover' },
  menuInfo: { padding: 12 },
  menuName: { color: '#FFF', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  menuPrice: { color: '#00E096', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#6B7280', width: '100%', textAlign: 'center', marginTop: 10 },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 30, paddingTop: 60, paddingBottom: 50 },
  closeCamBtn: { alignSelf: 'flex-end', padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 25 },
  recordContainer: { alignItems: 'center' },
  recordBtnOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  recordingActive: { borderColor: '#EF4444' },
  recordBtnInner: { backgroundColor: '#EF4444' },
  recordCircle: { width: 66, height: 66, borderRadius: 33 },
  stopSquare: { width: 40, height: 40, borderRadius: 6 },
  recordText: { color: '#FFF', marginTop: 12, fontWeight: '600' }
});