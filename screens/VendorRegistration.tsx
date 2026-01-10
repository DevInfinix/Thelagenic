import React, { useState } from 'react';
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
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker'; 
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy'; 
import { db } from '../config/firebase'; 
import { Ionicons } from '@expo/vector-icons'; 

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
  const [loading, setLoading] = useState(false);
  
  // Stall Details
  const [stallName, setStallName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null); 

  const [coordinates, setCoordinates] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
  });
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: '', price: '', image: '' }
  ]);

  // --- IMAGE LOGIC ---
  const pickImage = async (type: 'banner' | 'menu', index?: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to photos is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: type === 'banner' ? [16, 9] : [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === 'banner') {
        setBannerImage(uri);
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

  // --- SUBMIT LOGIC ---
  const handleRegister = async () => {
    if (!stallName || !description || !bannerImage) {
      Alert.alert('Missing Fields', 'Please fill in name, description, and upload a banner.');
      return;
    }
    const validMenu = menuItems.filter(item => item.name && item.price);
    if (validMenu.length === 0) {
      Alert.alert('Menu Empty', 'Please add at least one valid menu item.');
      return;
    }

    try {
      setLoading(true);
      const cleanStallName = stallName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

      // Upload Banner
      let bannerUrl = bannerImage;
      if (bannerImage && !bannerImage.startsWith('http')) {
         bannerUrl = await uploadToCloudinary(bannerImage, `${cleanStallName}_banner`);
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

      const vendorData = {
        name: stallName,
        description: description,
        image: bannerUrl,
        rating: 5.0, // Default start rating
        hygieneGrade: "A",
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        menu: menuWithCloudUrls,
        createdAt: new Date().toISOString(),
        // New fields for dashboard tasks
        fssaiUrl: null,
        dailyVideoUrl: null 
      };

      const docRef = await addDoc(collection(db, 'vendors'), vendorData);
      
      // Navigate to Dashboard
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'VendorDashboard', params: { vendorId: docRef.id } }],
      });
      
    } catch (error) {
      console.error("Registration Error: ", error);
      Alert.alert('Error', 'Could not register stall. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Stall</Text>
          <Text style={styles.headerSubtitle}>Start your digital journey with Hygieat</Text>
        </View>

        {/* 1. BASIC INFO */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Basic Details</Text>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>STALL NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Cyber Chaat Wala"
              placeholderTextColor="#4B5563"
              value={stallName}
              onChangeText={setStallName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Tell us what makes your food special..."
              placeholderTextColor="#4B5563"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* BANNER UPLOAD */}
          <Text style={styles.inputLabel}>COVER IMAGE</Text>
          <TouchableOpacity onPress={() => pickImage('banner')} activeOpacity={0.8}>
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} style={styles.bannerPreview} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="image-outline" size={32} color="#00E096" />
                <Text style={styles.uploadText}>Upload Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. LOCATION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Location</Text>
          <View style={styles.mapFrame}>
            <MapView
              style={styles.map}
              initialRegion={INITIAL_REGION}
              customMapStyle={darkMapStyle} 
            >
              <Marker
                draggable
                coordinate={coordinates}
                onDragEnd={(e) => setCoordinates(e.nativeEvent.coordinate)}
                pinColor="#00E096"
              />
            </MapView>
            <View style={styles.coordsOverlay}>
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
              <Text style={styles.addMenuText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {menuItems.map((item, index) => (
            <View key={index} style={styles.menuCard}>
              <TouchableOpacity onPress={() => pickImage('menu', index)} style={styles.menuImgPicker}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.menuImg} />
                ) : (
                  <Ionicons name="camera" size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              
              <View style={styles.menuInputs}>
                <TextInput
                  placeholder="Item Name"
                  placeholderTextColor="#4B5563"
                  style={styles.menuInput}
                  value={item.name}
                  onChangeText={(t) => {
                    const n = [...menuItems]; n[index].name = t; setMenuItems(n);
                  }}
                />
                <TextInput
                  placeholder="Price (₹)"
                  placeholderTextColor="#4B5563"
                  keyboardType="numeric"
                  style={styles.menuInput}
                  value={item.price}
                  onChangeText={(t) => {
                    const n = [...menuItems]; n[index].price = t; setMenuItems(n);
                  }}
                />
              </View>
              
              {index > 0 && (
                <TouchableOpacity onPress={() => setMenuItems(menuItems.filter((_, i) => i !== index))}>
                   <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.disabledBtn]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>Launch Stall 🚀</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Minimal Dark Map Style
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  header: { marginTop: 40, marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 16, color: '#9CA3AF', marginTop: 5 },

  sectionContainer: { marginBottom: 32 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#00E096', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  helperText: { color: '#6B7280', fontSize: 12, marginTop: 8 },

  inputWrapper: { marginBottom: 16 },
  inputLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  textInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  // Upload Styles
  uploadPlaceholder: {
    height: 160,
    backgroundColor: 'rgba(0, 224, 150, 0.1)',
    borderWidth: 2,
    borderColor: '#00E096',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: { color: '#00E096', fontWeight: '600', marginTop: 8 },
  bannerPreview: { width: '100%', height: 160, borderRadius: 16 },

  // Map
  mapFrame: { height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#374151' },
  map: { flex: 1 },
  coordsOverlay: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 6, borderRadius: 6
  },
  coordText: { color: '#00E096', fontSize: 10, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // Menu
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addMenuText: { color: '#00E096', fontWeight: 'bold' },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12
  },
  menuImgPicker: {
    width: 60, height: 60, borderRadius: 8,
    backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#374151'
  },
  menuImg: { width: '100%', height: '100%', borderRadius: 8 },
  menuInputs: { flex: 1, gap: 8 },
  menuInput: {
    backgroundColor: '#111827', color: '#FFF',
    padding: 8, borderRadius: 6, fontSize: 14,
    borderWidth: 1, borderColor: '#374151'
  },

  // Submit
  submitBtn: {
    backgroundColor: '#00E096',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#00E096",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledBtn: { backgroundColor: '#4B5563', shadowOpacity: 0 },
  submitBtnText: { color: '#0B0F19', fontWeight: '800', fontSize: 18, textTransform: 'uppercase' },
});