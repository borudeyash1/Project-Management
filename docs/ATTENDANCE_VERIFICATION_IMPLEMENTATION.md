# Attendance Marking with Location & Face Verification - Implementation Plan

## 🎯 **OBJECTIVE**

Implement a proper 2-step attendance marking process:
1. **Location Verification** - Match user's GPS with workspace office location
2. **Face Verification** - Match user's face with stored face data
3. **Work From Home Option** - Alternative flow for WFH

---

## 📋 **REQUIREMENTS**

### **For Office Attendance:**
1. ✅ User clicks "Mark Attendance"
2. 📍 **Step 1: Location Check**
   - Request GPS permission
   - Get current location (latitude, longitude)
   - Compare with workspace office location
   - Calculate distance
   - If within radius → Proceed to Step 2
   - If outside radius → Show error

3. 📸 **Step 2: Face Verification**
   - Open camera
   - Capture face image
   - Compare with stored face data
   - If match → Mark attendance
   - If no match → Show error

### **For Work From Home:**
1. ✅ User selects "Work from home"
2. 📍 **Step 1: Share Location** (optional, for tracking)
3. 📸 **Step 2: Face Verification** (required)
4. ✅ Mark attendance with WFH status

---

## 🗂️ **DATABASE SCHEMA**

### **User Model - Add Face Data:**
```typescript
// server/src/models/User.ts
interface IUser {
  // ... existing fields
  faceData?: {
    encodings: number[][]; // Face encoding vectors
    images: string[]; // URLs to face images
    lastUpdated: Date;
    verified: boolean;
  };
}
```

### **Attendance Record - Enhanced:**
```typescript
// Already exists in WorkspaceAttendanceRecord
{
  location: {
    latitude: number,
    longitude: number,
    accuracy: number
  },
  faceVerified: boolean,
  faceMatchScore?: number, // Confidence score
  status: 'present' | 'late' | 'work-from-home'
}
```

---

## 🔧 **IMPLEMENTATION STEPS**

### **Phase 1: Face Data Storage**

#### **1.1 Update User Model**
```typescript
// server/src/models/User.ts
faceData: {
  encodings: {
    type: [[Number]],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  lastUpdated: Date,
  verified: {
    type: Boolean,
    default: false
  }
}
```

#### **1.2 Create Face Upload API**
```typescript
// server/src/routes/user.ts
router.post('/profile/face-data', authMiddleware, upload.single('face'), uploadFaceData);

// server/src/controllers/userController.ts
export const uploadFaceData = async (req, res) => {
  // 1. Receive face image
  // 2. Process with face-api.js or similar
  // 3. Extract face encodings
  // 4. Store in user.faceData
  // 5. Return success
};
```

#### **1.3 Frontend - Face Upload Component**
```typescript
// client/src/components/profile/FaceDataUpload.tsx
- Camera access
- Capture multiple angles
- Upload to backend
- Show verification status
```

---

### **Phase 2: Location Verification**

#### **2.1 Calculate Distance Function**
```typescript
// server/src/utils/geoUtils.ts
export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  // Haversine formula
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};
```

#### **2.2 Update Mark Attendance Controller**
```typescript
// server/src/controllers/workspaceAttendanceController.ts
export const markWorkspaceAttendance = async (req, res) => {
  const { location, isWorkFromHome } = req.body;
  
  // Get workspace config
  const config = await WorkspaceAttendanceConfig.findOne({ workspace });
  
  if (!isWorkFromHome && config.requireLocation) {
    // Verify location
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      config.location.lat,
      config.location.lng
    );
    
    if (distance > config.location.radiusMeters) {
      return res.status(400).json({
        success: false,
        message: `You are ${Math.round(distance)}m away from office. Required: within ${config.location.radiusMeters}m`,
        distance
      });
    }
  }
  
  // Proceed to face verification...
};
```

---

### **Phase 3: Face Verification**

#### **3.1 Install Face Recognition Library**
```bash
npm install face-api.js
npm install @tensorflow/tfjs
```

#### **3.2 Backend - Face Comparison**
```typescript
// server/src/utils/faceUtils.ts
import * as faceapi from 'face-api.js';

export const compareFaces = async (
  capturedImage: Buffer,
  storedEncodings: number[][]
): Promise<{ match: boolean; score: number }> => {
  // 1. Load models
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
  
  // 2. Detect face in captured image
  const detection = await faceapi
    .detectSingleFace(capturedImage)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (!detection) {
    return { match: false, score: 0 };
  }
  
  // 3. Compare with stored encodings
  const capturedDescriptor = detection.descriptor;
  let bestMatch = 0;
  
  for (const stored of storedEncodings) {
    const distance = faceapi.euclideanDistance(capturedDescriptor, stored);
    const similarity = 1 - distance;
    if (similarity > bestMatch) {
      bestMatch = similarity;
    }
  }
  
  // 4. Return result (threshold: 0.6)
  return {
    match: bestMatch > 0.6,
    score: bestMatch
  };
};
```

#### **3.3 Update Mark Attendance API**
```typescript
export const markWorkspaceAttendance = async (req, res) => {
  const { location, faceImage, isWorkFromHome } = req.body;
  
  // ... location verification ...
  
  // Face verification
  if (config.requireFaceVerification) {
    const user = await User.findById(userId);
    
    if (!user.faceData || user.faceData.encodings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your face data in profile settings first'
      });
    }
    
    const faceResult = await compareFaces(
      Buffer.from(faceImage, 'base64'),
      user.faceData.encodings
    );
    
    if (!faceResult.match) {
      return res.status(400).json({
        success: false,
        message: 'Face verification failed. Please try again.'
      });
    }
    
    // Store face match score
    faceMatchScore = faceResult.score;
  }
  
  // Mark attendance...
};
```

---

### **Phase 4: Frontend - Multi-Step Attendance Flow**

#### **4.1 Create Attendance Modal Component**
```typescript
// client/src/components/workspace-detail/AttendanceMarkingModal.tsx

interface AttendanceMarkingModalProps {
  slot: AttendanceSlot;
  workspaceId: string;
  config: AttendanceConfig;
  onClose: () => void;
  onSuccess: () => void;
}

const AttendanceMarkingModal = ({ slot, workspaceId, config, onClose, onSuccess }) => {
  const [step, setStep] = useState<'location' | 'face' | 'processing'>('location');
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isWFH, setIsWFH] = useState(false);
  
  // Step 1: Location
  const captureLocation = async () => {
    const pos = await getCurrentPosition();
    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    
    if (!isWFH && config.requireLocation) {
      // Verify distance
      const distance = calculateDistance(
        pos.coords.latitude,
        pos.coords.longitude,
        config.location.lat,
        config.location.lng
      );
      
      if (distance > config.location.radiusMeters) {
        showError(`You are ${distance}m away. Must be within ${config.location.radiusMeters}m`);
        return;
      }
    }
    
    setStep('face');
  };
  
  // Step 2: Face
  const captureFace = async () => {
    // Open camera
    // Capture image
    // Convert to base64
    setFaceImage(base64Image);
    setStep('processing');
    await submitAttendance();
  };
  
  // Submit
  const submitAttendance = async () => {
    await apiService.post(`/workspace-attendance/workspace/${workspaceId}/mark`, {
      slotName: slot.name,
      location,
      faceImage,
      isWorkFromHome: isWFH
    });
    onSuccess();
  };
  
  return (
    <Modal>
      {step === 'location' && <LocationStep onNext={captureLocation} />}
      {step === 'face' && <FaceStep onNext={captureFace} />}
      {step === 'processing' && <ProcessingStep />}
    </Modal>
  );
};
```

#### **4.2 Location Step Component**
```typescript
const LocationStep = ({ onNext, isWFH, config }) => {
  return (
    <div className="p-6">
      <h3>Step 1: Location Verification</h3>
      
      {!isWFH && (
        <div className="mb-4">
          <p>Office Location: {config.location.address}</p>
          <p>Radius: {config.location.radiusMeters}m</p>
        </div>
      )}
      
      <button onClick={onNext}>
        📍 Share Current Location
      </button>
      
      <label>
        <input type="checkbox" onChange={(e) => setIsWFH(e.target.checked)} />
        Work from home today
      </label>
    </div>
  );
};
```

#### **4.3 Face Step Component**
```typescript
const FaceStep = ({ onNext }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  useEffect(() => {
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);
  
  const capture = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    onNext(imageData);
  };
  
  return (
    <div className="p-6">
      <h3>Step 2: Face Verification</h3>
      <video ref={videoRef} autoPlay className="w-full rounded-lg" />
      <button onClick={capture}>📸 Capture Face</button>
    </div>
  );
};
```

---

## 📁 **FILES TO CREATE/MODIFY**

### **Backend:**
1. ✅ `server/src/models/User.ts` - Add faceData field
2. ✅ `server/src/utils/geoUtils.ts` - Distance calculation
3. ✅ `server/src/utils/faceUtils.ts` - Face comparison
4. ✅ `server/src/controllers/userController.ts` - Face upload endpoint
5. ✅ `server/src/controllers/workspaceAttendanceController.ts` - Enhanced verification
6. ✅ `server/src/routes/user.ts` - Face upload route

### **Frontend:**
1. ✅ `client/src/components/workspace-detail/AttendanceMarkingModal.tsx` - Main modal
2. ✅ `client/src/components/workspace-detail/LocationStep.tsx` - Location verification
3. ✅ `client/src/components/workspace-detail/FaceStep.tsx` - Face capture
4. ✅ `client/src/components/profile/FaceDataUpload.tsx` - Face data management
5. ✅ `client/src/utils/geoUtils.ts` - Frontend distance calc
6. ✅ Update `WorkspaceAttendanceTab.tsx` - Use modal

---

## 🧪 **TESTING CHECKLIST**

### **Face Data Upload:**
- [ ] User can access face upload in profile
- [ ] Camera permission requested
- [ ] Multiple face angles captured
- [ ] Face data stored in database
- [ ] Verification status shown

### **Location Verification:**
- [ ] GPS permission requested
- [ ] Current location captured
- [ ] Distance calculated correctly
- [ ] Error shown if outside radius
- [ ] Success if within radius

### **Face Verification:**
- [ ] Camera opens for capture
- [ ] Face detected in image
- [ ] Comparison with stored data
- [ ] Match threshold works (0.6)
- [ ] Error shown if no match

### **Work From Home:**
- [ ] WFH checkbox works
- [ ] Location still captured (optional)
- [ ] Face verification still required
- [ ] Status saved as "work-from-home"

### **Complete Flow:**
- [ ] Office: Location → Face → Mark
- [ ] WFH: Location (optional) → Face → Mark
- [ ] Attendance record created
- [ ] All data saved to database

---

## 🚀 **DEPLOYMENT STEPS**

1. **Install Dependencies:**
   ```bash
   cd server && npm install face-api.js @tensorflow/tfjs
   cd client && npm install face-api.js
   ```

2. **Download Face Recognition Models:**
   ```bash
   mkdir server/models
   # Download from: https://github.com/justadudewhohacks/face-api.js-models
   ```

3. **Update Environment Variables:**
   ```
   FACE_MATCH_THRESHOLD=0.6
   MAX_FACE_IMAGES=5
   ```

4. **Database Migration:**
   - Add faceData field to existing users
   - Set default values

5. **Deploy:**
   - Backend first
   - Frontend second
   - Test thoroughly

---

## ⚠️ **IMPORTANT NOTES**

1. **Privacy:** Face data is sensitive - ensure GDPR compliance
2. **Security:** Encrypt face encodings in database
3. **Performance:** Face comparison can be slow - optimize
4. **Accuracy:** Test with different lighting conditions
5. **Fallback:** Provide manual verification option for failures

---

## 📊 **ESTIMATED EFFORT**

- **Backend Development:** 2-3 days
- **Frontend Development:** 2-3 days
- **Testing:** 1-2 days
- **Total:** 5-8 days

---

**Status:** 📋 Planning Complete - Ready for Implementation
**Priority:** 🔴 High - Core Feature
**Complexity:** 🟡 Medium-High
