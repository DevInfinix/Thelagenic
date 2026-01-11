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
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system/legacy'; 
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// CONFIGURATION
const CLOUDINARY_CLOUD_NAME = "dgesmp2st"; 
const CLOUDINARY_UPLOAD_PRESET = "hygieat_preset"; 

// --- TRANSLATIONS ---
const translations = {
  en: {
    grade: "GRADE",
    trustRating: "TRUST RATING",
    location: "LOCATION",
    verificationTasks: "Verification Tasks",
    verificationSub: "One-time setup for verified badge.",
    fssaiCert: "FSSAI Certificate",
    fssaiSub: "Upload document to verify",
    fssaiVerified: "Verification Complete",
    upload: "Upload",
    dailyTasks: "Daily Tasks",
    dailySub: "Required to maintain daily hygiene score.",
    dailyVideo: "Daily Kitchen Live",
    dailyVideoSub: "Record 30s video of kitchen",
    dailyVideoUploaded: "Uploaded for today",
    record: "Record",
    stallMenu: "Stall Menu",
    noMenu: "No menu items available.",
    syncing: "Syncing Dashboard...",
    uploadFailed: "Upload failed.",
    success: "Success",
    fssaiSuccess: "FSSAI Certificate Uploaded!",
    dailySuccess: "Daily Video Uploaded!",
    recordFailed: "Recording failed",
    recording: "Recording...",
    tapToRecord: "Tap to Record (30s)",
    todoTab: "To-Do",
    dashboardTab: "Dashboard",
    markComplete: "Mark as Complete",
    allDone: "All Set!",
    allDoneSub: "You are ready to serve safely today.",
    todoTitle: "Daily Hygiene Checklist"
  },
  hi: {
    grade: "ग्रेड",
    trustRating: "विश्वास रेटिंग",
    location: "स्थान",
    verificationTasks: "सत्यापन कार्य",
    verificationSub: "सत्यापित बैज के लिए एक बार का सेटअप।",
    fssaiCert: "FSSAI प्रमाण पत्र",
    fssaiSub: "सत्यापन के लिए दस्तावेज़ अपलोड करें",
    fssaiVerified: "सत्यापन पूरा हुआ",
    upload: "अपलोड करें",
    dailyTasks: "दैनिक कार्य",
    dailySub: "दैनिक स्वच्छता स्कोर बनाए रखने के लिए आवश्यक।",
    dailyVideo: "दैनिक रसोई लाइव",
    dailyVideoSub: "रसोई का 30 सेकंड का वीडियो रिकॉर्ड करें",
    dailyVideoUploaded: "आज के लिए अपलोड किया गया",
    record: "रिकॉर्ड करें",
    stallMenu: "स्टॉल मेनू",
    noMenu: "कोई मेनू आइटम उपलब्ध नहीं है।",
    syncing: "डैशबोर्ड सिंक हो रहा है...",
    uploadFailed: "अपलोड विफल रहा।",
    success: "सफल",
    fssaiSuccess: "FSSAI प्रमाणपत्र अपलोड किया गया!",
    dailySuccess: "दैनिक वीडियो अपलोड किया गया!",
    recordFailed: "रिकॉर्डिंग विफल रही",
    recording: "रिकॉर्डिंग...",
    tapToRecord: "रिकॉर्ड करने के लिए टैप करें (30s)",
    todoTab: "करने के लिए",
    dashboardTab: "डैशबोर्ड",
    markComplete: "पूर्ण के रूप में चिह्नित करें",
    allDone: "सब हो गया!",
    allDoneSub: "आप आज सुरक्षित रूप से सेवा करने के लिए तैयार हैं।",
    todoTitle: "दैनिक स्वच्छता चेकलिस्ट"
  }
};

// TYPES
interface VendorData {
  shopName: string; // Changed from name to match Firestore
  ownerName: string;
  description: string;
  shopBannerUrl: string; // Changed from image to match Firestore
  stallPhoto: string;
  rating: number; 
  hygieneRating: string; // Changed from hygieneGrade to match Firestore
  address: string; // Added address
  city: string; // Added city
  location: {
    latitude: number;
    longitude: number;
  };
  menu: Record<string, { // Changed to Object Map to match Firestore
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    isVegetarian: boolean;
  }>; 
  fssaiCertificateUrl?: string; // Changed from fssaiUrl
  stallVideo?: string; // Changed from dailyVideoUrl
}

// --- TODO DATA ---
const TODO_TASKS = [
  { id: 1, title: 'Washing Hands & Wearing Gloves', icon: 'hand-left-outline', color: '#3B82F6' },
  { id: 2, title: 'Wearing Apron & Hair Mask', icon: 'body-outline', color: '#F59E0B' },
  { id: 3, title: 'Clean Water Availability', icon: 'water-outline', color: '#06B6D4' },
  { id: 4, title: 'Clean Utensils & Workspace', icon: 'restaurant-outline', color: '#10B981' },
];

// --- SPEEDOMETER COMPONENT ---
const ModernSpeedometer = ({ rating, max = 5 }: { rating: number; max?: number }) => {
  const size = 160; 
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
        <Path d={createArc(Math.PI, 2 * Math.PI)} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        <Path d={createArc(Math.PI, Math.PI + (percentage * Math.PI))} stroke="url(#grad)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </Svg>
      <View style={styles.gaugeTextContainer}>
        <Text style={styles.gaugeScore}>{rating !== undefined && rating !== null ? rating.toFixed(1) : "0.0"}</Text>
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
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'todo'>('dashboard');
  const [menuOpen, setMenuOpen] = useState(true); 
  const [uploadingTask, setUploadingTask] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = translations[lang];

  // To-Do State
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [todoCompleted, setTodoCompleted] = useState(false);

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

  const handleTaskComplete = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentTaskIndex < TODO_TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      setTodoCompleted(true);
    }
  };

  const resetTodo = () => {
    setCurrentTaskIndex(0);
    setTodoCompleted(false);
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

  // --- TASKS UPLOAD LOGIC ---
  const handleUploadFSSAI = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.5,
    });

    if (!result.canceled) {
      setUploadingTask('fssai');
      try {
        const url = await uploadToCloudinary(result.assets[0].uri, 'image');
        // Update correct field: fssaiCertificateUrl
        await updateDoc(doc(db, 'vendors', vendorId), { fssaiCertificateUrl: url });
        setVendor(prev => prev ? { ...prev, fssaiCertificateUrl: url } : null);
        Alert.alert(t.success, t.fssaiSuccess);
      } catch (e) {
        Alert.alert("Error", t.uploadFailed);
      } finally {
        setUploadingTask(null);
      }
    }
  };

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
      Alert.alert("Error", t.recordFailed);
    } finally {
      setIsRecording(false);
      setShowCamera(false);
    }
  };

  const handleUploadVideo = async (uri: string) => {
    setUploadingTask('video');
    try {
      const url = await uploadToCloudinary(uri, 'video');
      // Update correct field: stallVideo
      await updateDoc(doc(db, 'vendors', vendorId), { stallVideo: url });
      setVendor(prev => prev ? { ...prev, stallVideo: url } : null);
      Alert.alert(t.success, t.dailySuccess);
    } catch (e) {
      Alert.alert("Error", t.uploadFailed);
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
              <Text style={styles.recordText}>{isRecording ? t.recording : t.tapToRecord}</Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (loading || !vendor) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>{t.syncing}</Text>
    </View>
  );

  // Helper to get menu as array from Object Map
  const menuItems = vendor.menu ? Object.values(vendor.menu) : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* -------------------- MAIN CONTENT AREA -------------------- */}
      <View style={styles.contentArea}>
        
        {/* === DASHBOARD TAB === */}
        {currentTab === 'dashboard' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* HERO */}
            <View style={styles.heroContainer}>
              <Image source={{ uri: vendor.shopBannerUrl }} style={styles.heroImage} />
              <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.heroGradient} />
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.langButton} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}>
                <Text style={styles.langText}>{lang === 'en' ? 'हिन्दी' : 'English'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
              {/* INFO CARD */}
              <View style={styles.infoCard}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.stallName}>{vendor.shopName}</Text>
                    <Text style={styles.stallDesc}>{vendor.address}, {vendor.city}</Text>
                  </View>
                  <View style={styles.hygieneBadge}>
                    <Text style={styles.gradeLabel}>{t.grade}</Text>
                    <Text style={styles.gradeValue}>{vendor.hygieneRating || "A"}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>{t.trustRating}</Text>
                    <ModernSpeedometer rating={vendor.rating} />
                  </View>
                  <View style={styles.locationCol}>
                     <Text style={styles.statLabel}>{t.location}</Text>
                     <View style={styles.locBox}>
                       <Ionicons name="location" size={16} color="#10B981" />
                       <Text style={styles.locText}>
                         {/* Fix for undefined check */}
                         {vendor.location?.latitude?.toFixed(4) || "0.0000"}
                       </Text>
                     </View>
                     <View style={styles.locBox}>
                       <Ionicons name="location" size={16} color="#10B981" />
                       <Text style={styles.locText}>
                         {/* Fix for undefined check */}
                         {vendor.location?.longitude?.toFixed(4) || "0.0000"}
                       </Text>
                     </View>
                  </View>
                </View>
              </View>

              {/* TASKS SECTIONS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.verificationTasks}</Text>
                <Text style={styles.sectionSub}>{t.verificationSub}</Text>
                 <View style={[styles.taskCard, vendor.fssaiCertificateUrl && styles.taskComplete]}>
                  <View style={[styles.taskIcon, vendor.fssaiCertificateUrl && styles.taskIconComplete]}>
                    <Ionicons name={vendor.fssaiCertificateUrl ? "shield-checkmark" : "document-text-outline"} size={24} color={vendor.fssaiCertificateUrl ? "#059669" : "#64748b"} />
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, vendor.fssaiCertificateUrl && styles.textComplete]}>{t.fssaiCert}</Text>
                    <Text style={[styles.taskDesc, vendor.fssaiCertificateUrl && styles.textCompleteSub]}>{vendor.fssaiCertificateUrl ? t.fssaiVerified : t.fssaiSub}</Text>
                  </View>
                  {!vendor.fssaiCertificateUrl && (
                    <TouchableOpacity onPress={handleUploadFSSAI} disabled={!!uploadingTask}>
                      <LinearGradient colors={['#10B981', '#059669']} style={styles.actionBtn}>
                         {uploadingTask === 'fssai' ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.actionBtnText}>{t.upload}</Text>}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.dailyTasks}</Text>
                <Text style={styles.sectionSub}>{t.dailySub}</Text>
                <View style={[styles.taskCard, vendor.stallVideo && styles.taskComplete]}>
                  <View style={[styles.taskIcon, vendor.stallVideo && styles.taskIconComplete]}>
                    <Ionicons name={vendor.stallVideo ? "videocam" : "videocam-outline"} size={24} color={vendor.stallVideo ? "#059669" : "#64748b"} />
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, vendor.stallVideo && styles.textComplete]}>{t.dailyVideo}</Text>
                    <Text style={[styles.taskDesc, vendor.stallVideo && styles.textCompleteSub]}>{vendor.stallVideo ? t.dailyVideoUploaded : t.dailyVideoSub}</Text>
                  </View>
                  {!vendor.stallVideo && (
                    <TouchableOpacity onPress={() => setShowCamera(true)} disabled={!!uploadingTask}>
                      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionBtn}>
                        {uploadingTask === 'video' ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.actionBtnText}>{t.record}</Text>}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* MENU SECTION */}
              <View style={styles.section}>
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => setMenuOpen(!menuOpen)} activeOpacity={0.7}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={styles.menuIconBadge}>
                        <Ionicons name="fast-food-outline" size={20} color="#10B981" />
                    </View>
                    <Text style={styles.dropdownTitle}>{t.stallMenu} ({menuItems.length})</Text>
                  </View>
                  <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={24} color="#64748b" />
                </TouchableOpacity>
                {menuOpen && (
                  <View style={styles.menuGrid}>
                    {menuItems.length > 0 ? (
                      menuItems.map((item, index) => (
                        <View key={index} style={styles.menuItemCard}>
                          <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
                          <View style={styles.menuInfo}>
                            <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.menuPrice}>₹{item.price}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>{t.noMenu}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        )}

        {/* === TO-DO TAB (Full Screen Cards) === */}
        {currentTab === 'todo' && (
          <View style={styles.todoContainer}>
            <View style={styles.todoHeader}>
              <Text style={styles.todoHeaderTitle}>{t.todoTitle}</Text>
              <Text style={styles.todoProgress}>{!todoCompleted ? `${currentTaskIndex + 1} / ${TODO_TASKS.length}` : ''}</Text>
            </View>

            {!todoCompleted ? (
              <View style={styles.cardContainer}>
                {/* Active Task Card */}
                <View style={[styles.todoCard, { borderColor: TODO_TASKS[currentTaskIndex].color }]}>
                  <View style={[styles.todoIconCircle, { backgroundColor: TODO_TASKS[currentTaskIndex].color + '20' }]}>
                    <Ionicons 
                      name={TODO_TASKS[currentTaskIndex].icon as any} 
                      size={80} 
                      color={TODO_TASKS[currentTaskIndex].color} 
                    />
                  </View>
                  <Text style={styles.todoCardTitle}>{TODO_TASKS[currentTaskIndex].title}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.completeBtn, { backgroundColor: TODO_TASKS[currentTaskIndex].color }]} 
                    onPress={handleTaskComplete}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeBtnText}>{t.markComplete}</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{marginLeft: 8}}/>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.completionContainer}>
                <Ionicons name="ribbon" size={100} color="#10B981" />
                <Text style={styles.completionTitle}>{t.allDone}</Text>
                <Text style={styles.completionSub}>{t.allDoneSub}</Text>
                <TouchableOpacity onPress={resetTodo} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>Review Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </View>

      {/* -------------------- BOTTOM NAVIGATION -------------------- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setCurrentTab('dashboard')}
        >
          <Ionicons 
            name={currentTab === 'dashboard' ? "grid" : "grid-outline"} 
            size={24} 
            color={currentTab === 'dashboard' ? "#10B981" : "#64748b"} 
          />
          <Text style={[styles.navText, currentTab === 'dashboard' && styles.navTextActive]}>
            {t.dashboardTab}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setCurrentTab('todo')}
        >
          <View>
            <Ionicons 
              name={currentTab === 'todo' ? "list-circle" : "list-circle-outline"} 
              size={28} 
              color={currentTab === 'todo' ? "#10B981" : "#64748b"} 
            />
            {/* Notification Dot */}
            {!todoCompleted && (
              <View style={styles.navDot} />
            )}
          </View>
          <Text style={[styles.navText, currentTab === 'todo' && styles.navTextActive]}>
            {t.todoTab}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { color: '#10B981', marginTop: 12, fontWeight: '600' },
  
  // Navigation
  contentArea: { flex: 1, marginBottom: 70 }, // Leave space for bottom nav
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: '500' },
  navTextActive: { color: '#10B981', fontWeight: '700' },
  navDot: { position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FFF' },

  // --- TODO STYLES ---
  todoContainer: { flex: 1, padding: 24, paddingTop: 60, justifyContent: 'flex-start' },
  todoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  todoHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  todoProgress: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  todoCard: {
    width: '100%', height: '75%',
    backgroundColor: '#FFFFFF', borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    padding: 24,
    borderWidth: 2, // Dynamic color
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
  },
  todoIconCircle: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 32
  },
  todoCardTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 40 },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30,
    width: '100%',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  completeBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  completionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completionTitle: { fontSize: 28, fontWeight: '800', color: '#10B981', marginTop: 24 },
  completionSub: { fontSize: 16, color: '#64748b', marginTop: 8, textAlign: 'center', marginBottom: 32 },
  resetBtn: { padding: 12 },
  resetBtnText: { color: '#64748b', textDecorationLine: 'underline' },

  // --- DASHBOARD STYLES (Existing) ---
  heroContainer: { height: 280, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  langButton: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  langText: { color: '#334155', fontWeight: '700', fontSize: 12 },

  mainContent: { marginTop: -60, paddingHorizontal: 20 },
  
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

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 2 },
  
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