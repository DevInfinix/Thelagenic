import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  StatusBar
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker'; 
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy'; 
import { db, auth } from '../config/firebase'; 
import { Ionicons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';

// CONFIGURATION
const CLOUDINARY_CLOUD_NAME = "dgesmp2st"; 
const CLOUDINARY_UPLOAD_PRESET = "hygieat_preset"; 

interface MenuItem {
  name: string;
  price: string;
  image: string; 
}

const INITIAL_REGION = {
  latitude: 19.0760,
  longitude: 72.8777,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function VendorRegistration() {
  const navigation = useNavigation();

  // Auth State
  const [initializing, setInitializing] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between Login & Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Stall Form State
  const [loading, setLoading] = useState(false);
  const [stallName, setStallName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null); 
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null); // New Aadhaar State
  
  const [coordinates, setCoordinates] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: '', price: '', image: '' }
  ]);

  // --- 1. AUTH CHECK ON MOUNT ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, check if they have a vendor profile
        try {
          const q = query(collection(db, 'vendors'), where('email', '==', user.email));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            // Vendor found, redirect to dashboard
            const vendorId = snapshot.docs[0].id;
            
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'VendorDashboard', params: { vendorId } }],
              })
            );
            return;
          }
        } catch (error) {
          console.error("Error fetching vendor profile:", error);
        }
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // --- IMAGE LOGIC ---
  const pickImage = async (type: 'banner' | 'menu' | 'aadhaar', index?: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to photos is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: type === 'banner' ? [16, 9] : type === 'aadhaar' ? [4, 3] : [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === 'banner') {
        setBannerImage(uri);
      } else if (type === 'aadhaar') {
        setAadhaarImage(uri);
      } else if (type === 'menu' && index !== undefined) {
        const updatedMenu = [...menuItems];
        updatedMenu[index].image = uri;
        setMenuItems(updatedMenu);
      }
    }
  };

  const uploadToCloudinary = async (uri: string, publicId: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const data = new FormData();
      data.append('file', `data:image/jpeg;base64,${base64}`);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      data.append('cloud_name', CLOUDINARY_CLOUD_NAME);
      data.append('folder', 'hygieat/vendors'); 
      data.append('public_id', publicId);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
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

  // --- LOGIN LOGIC ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password.");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect listener will handle the redirect if login succeeds
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Login Failed", error.message);
    }
  };

  // --- REGISTER LOGIC ---
  const handleRegister = async () => {
    // 1. Validation
    if (!email || !password) {
      Alert.alert('Missing Auth Details', 'Please enter email and password.');
      return;
    }
    if (!stallName || !description || !bannerImage || !aadhaarImage) {
      Alert.alert('Missing Fields', 'Please fill in name, description, banner, and Aadhaar card.');
      return;
    }
    const validMenu = menuItems.filter(item => item.name && item.price);
    if (validMenu.length === 0) {
      Alert.alert('Menu Empty', 'Please add at least one valid menu item.');
      return;
    }

    try {
      setLoading(true);

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Upload Assets
      const cleanStallName = stallName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      
      // Upload Banner
      let bannerUrl = bannerImage;
      if (bannerImage && !bannerImage.startsWith('http')) {
         bannerUrl = await uploadToCloudinary(bannerImage, `${cleanStallName}_banner_${Date.now()}`);
      }

      // Upload Aadhaar
      let aadhaarUrl = aadhaarImage;
      if (aadhaarImage && !aadhaarImage.startsWith('http')) {
         aadhaarUrl = await uploadToCloudinary(aadhaarImage, `${cleanStallName}_aadhaar_${Date.now()}`);
      }

      // Upload Menu
      const menuWithCloudUrls = await Promise.all(
        validMenu.map(async (item) => {
          let imageUrl = item.image;
          if (imageUrl && !imageUrl.startsWith('http')) {
            const uniqueId = `${cleanStallName}_menu_${Date.now()}_${Math.random()}`;
            imageUrl = await uploadToCloudinary(item.image, uniqueId);
          }
          return { ...item, image: imageUrl || "https://via.placeholder.com/150" };
        })
      );

      // 4. Save to Firestore (Including Auth Info)
      const vendorData = {
        name: stallName,
        description: description,
        image: bannerUrl,
        aadhaarUrl: aadhaarUrl, // New Field
        rating: 5.0,
        hygieneGrade: "A",
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        menu: menuWithCloudUrls,
        createdAt: new Date().toISOString(),
        fssaiUrl: null,
        dailyVideoUrl: null,
        // Link to Auth User
        email: user.email,
        ownerId: user.uid 
      };

      const docRef = await addDoc(collection(db, 'vendors'), vendorData);
      
      // Navigate to Dashboard
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'VendorDashboard', params: { vendorId: docRef.id } }],
        })
      );
      
    } catch (error: any) {
      console.error("Registration Error: ", error);
      Alert.alert('Registration Failed', error.message || 'Could not register stall.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isLoginMode ? "Welcome Back" : "Vendor Registration"}</Text>
          <Text style={styles.headerSubtitle}>
            {isLoginMode ? "Log in to manage your stall" : "Join Hygieat and grow your business"}
          </Text>
        </View>

        {/* --- AUTH SECTION --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Account Details</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                style={styles.textInput}
                placeholder="vendor@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                />
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
             <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                />
            </View>
          </View>
        </View>

        {/* --- LOGIN BUTTON (If Login Mode) --- */}
        {isLoginMode && (
          <View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
             <LinearGradient
                colors={['#10B981', '#059669']}
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
             >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Log In</Text>}
             </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* --- REGISTRATION FORM (Only if NOT Login Mode) --- */}
        {!isLoginMode && (
          <>
            {/* 1. STALL INFO */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Stall Details</Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>STALL NAME</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="storefront-outline" size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Cyber Chaat Wala"
                    placeholderTextColor="#94a3b8"
                    value={stallName}
                    onChangeText={setStallName}
                    />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>DESCRIPTION</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                    <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Tell us what makes your food special..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                    />
                </View>
              </View>

              <Text style={styles.inputLabel}>COVER IMAGE</Text>
              <TouchableOpacity onPress={() => pickImage('banner')} activeOpacity={0.8}>
                {bannerImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: bannerImage }} style={styles.bannerPreview} />
                    <View style={styles.editIconBadge}>
                        <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.uploadIconCircle}>
                        <Ionicons name="image-outline" size={28} color="#10B981" />
                    </View>
                    <Text style={styles.uploadText}>Upload Cover Image</Text>
                    <Text style={styles.uploadSubtext}>JPG, PNG (Max 5MB)</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* NEW AADHAAR UPLOAD */}
              <View style={{ marginTop: 20 }}>
                <Text style={styles.inputLabel}>AADHAAR CARD</Text>
                <TouchableOpacity onPress={() => pickImage('aadhaar')} activeOpacity={0.8}>
                  {aadhaarImage ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: aadhaarImage }} style={styles.bannerPreview} />
                        <View style={styles.editIconBadge}>
                            <Ionicons name="create-outline" size={16} color="#fff" />
                        </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                       <View style={styles.uploadIconCircle}>
                         <Ionicons name="card-outline" size={28} color="#10B981" />
                       </View>
                      <Text style={styles.uploadText}>Upload Aadhaar Card</Text>
                       <Text style={styles.uploadSubtext}>Government ID Proof</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

            </View>

            {/* 2. LOCATION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Location</Text>
              <View style={styles.mapFrame}>
                <MapView
                  style={styles.map}
                  initialRegion={INITIAL_REGION}
                >
                  <Marker
                    draggable
                    coordinate={coordinates}
                    onDragEnd={(e) => setCoordinates(e.nativeEvent.coordinate)}
                    pinColor="#10B981"
                  />
                </MapView>
                <View style={styles.coordsOverlay}>
                  <Ionicons name="location" size={12} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.coordText}>{coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}</Text>
                </View>
              </View>
              <Text style={styles.helperText}>Long press and drag the marker to pinpoint location.</Text>
            </View>

            {/* 3. MENU */}
            <View style={styles.sectionContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionHeader}>Menu</Text>
                <TouchableOpacity onPress={() => setMenuItems([...menuItems, { name: '', price: '', image: '' }])}>
                  <View style={styles.addMenuBtn}>
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text style={styles.addMenuText}>Add Item</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {menuItems.map((item, index) => (
                <View key={index} style={styles.menuCard}>
                  <TouchableOpacity onPress={() => pickImage('menu', index)} style={styles.menuImgPicker}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.menuImg} />
                    ) : (
                      <Ionicons name="camera-outline" size={24} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.menuInputs}>
                    <View style={styles.inputContainerSmall}>
                        <TextInput
                        placeholder="Item Name"
                        placeholderTextColor="#94a3b8"
                        style={styles.menuInput}
                        value={item.name}
                        onChangeText={(t) => {
                            const n = [...menuItems]; n[index].name = t; setMenuItems(n);
                        }}
                        />
                    </View>
                    <View style={styles.inputContainerSmall}>
                         <Text style={styles.currencyPrefix}>₹</Text>
                        <TextInput
                        placeholder="Price"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        style={styles.menuInput}
                        value={item.price}
                        onChangeText={(t) => {
                            const n = [...menuItems]; n[index].price = t; setMenuItems(n);
                        }}
                        />
                    </View>
                  </View>
                  
                  {index > 0 && (
                    <TouchableOpacity onPress={() => setMenuItems(menuItems.filter((_, i) => i !== index))} style={styles.removeMenuBtn}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* REGISTER BUTTON */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
               {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Create Account & Stall</Text>
              )}
             </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* --- MODE TOGGLE --- */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isLoginMode ? "Don't have a stall yet?" : "Already have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={styles.toggleBtn}>
              {isLoginMode ? "Register New Stall" : "Log In"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // THEME: Clean Light Modern
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  centerContainer: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#10B981', marginTop: 12, fontWeight: '600' },
  
  header: { marginTop: 48, marginBottom: 32 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1e293b', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: '#64748b', marginTop: 6, fontWeight: '500' },

  sectionContainer: { marginBottom: 36 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16, letterSpacing: 0.5 },
  helperText: { color: '#64748b', fontSize: 13, marginTop: 10, fontStyle: 'italic' },

  inputWrapper: { marginBottom: 20 },
  inputLabel: { color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: { marginRight: 8 },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500',
  },
  textAreaContainer: { alignItems: 'flex-start', paddingVertical: 8 },
  textArea: { height: 100, textAlignVertical: 'top' },

  // Upload Styles
  uploadPlaceholder: {
    height: 180,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: { color: '#10B981', fontWeight: '700', fontSize: 15 },
  uploadSubtext: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerPreview: { width: '100%', height: 180, resizeMode: 'cover' },
  editIconBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },

  // Map
  mapFrame: { 
    height: 220, 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 3 
  },
  map: { flex: 1 },
  coordsOverlay: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
  },
  coordText: { color: '#334155', fontSize: 11, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // Menu
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addMenuBtn: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', 
      paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
      shadowColor: "#10B981", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3
  },
  addMenuText: { color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 4 },
  
  menuCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2
  },
  menuImgPicker: {
    width: 70, height: 70, borderRadius: 12,
    backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0'
  },
  menuImg: { width: '100%', height: '100%', borderRadius: 12 },
  menuInputs: { flex: 1, gap: 10 },
  inputContainerSmall: {
     flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', 
     borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 10 
  },
  currencyPrefix: { color: '#64748b', fontWeight: '600', marginRight: 4 },
  menuInput: {
    flex: 1, color: '#1e293b', paddingVertical: 8, fontSize: 14, fontWeight: '500'
  },
  removeMenuBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 },

  // Submit
  submitBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },

  // Toggle
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 36, marginBottom: 24 },
  toggleText: { color: '#64748b', marginRight: 6, fontSize: 15 },
  toggleBtn: { color: '#10B981', fontWeight: '700', fontSize: 15 }
});