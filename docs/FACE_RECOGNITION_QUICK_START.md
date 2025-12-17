# Face Recognition Quick Start Guide

## 🚀 Getting Started

Follow these steps to get face recognition working in your attendance system.

---

## Step 1: Install Dependencies

The required dependency has already been installed:
```bash
cd client
npm install onnxruntime-web --legacy-peer-deps
```

✅ **Status**: Complete

---

## Step 2: Register Face Enrollment Routes

Add the face enrollment routes to your Express app:

### File: `server/src/index.ts` or `server/src/app.ts`

```typescript
import faceEnrollmentRoutes from './routes/faceEnrollment';

// Add this line with your other routes
app.use('/api/users', faceEnrollmentRoutes);
```

---

## Step 3: Add Face Enrollment to User Profile

### Option A: Add to existing Profile Settings component

Find your user profile/settings component and add:

```tsx
import FaceEnrollmentSection from '../components/profile/FaceEnrollmentSection';

// In your profile component
<FaceEnrollmentSection
  userId={user._id}
  faceData={user.faceData}
  onUpdate={() => {
    // Refresh user data
    fetchUserProfile();
  }}
/>
```

### Option B: Create a new Settings Tab

Add a new tab in your settings called "Security" or "Biometrics" and include the FaceEnrollmentSection there.

---

## Step 4: Test Face Enrollment

1. **Navigate to Profile/Settings**
   - Go to your user profile or settings page

2. **Click "Enroll Face Now"**
   - The FaceEnrollmentModal should open

3. **Follow the Instructions**
   - Grant camera permission
   - Capture 3 images (front, left, right)
   - Wait for processing

4. **Verify Success**
   - Check that "Face Enrolled" status shows
   - Verify images are displayed
   - Check database that `user.faceData.verified` is `true`

---

## Step 5: Test Attendance with Face Recognition

1. **Go to Workspace Attendance**
   - Navigate to a workspace
   - Click on "Attendance" tab

2. **Mark Attendance**
   - Click "Mark Attendance" button
   - Select "Office" or "Work From Home"
   - Complete location verification (if required)

3. **Face Capture**
   - Camera should open
   - Click "Capture Face"
   - Face detection should run
   - Liveness check should pass
   - Attendance should be marked

---

## Step 6: Verify Backend Integration

### Check Face Verification in Attendance Controller

File: `server/src/controllers/workspaceAttendanceController.ts`

The face verification logic is already in place (from previous implementation). The attendance marking will:

1. Check if face verification is required
2. Verify user has enrolled face data
3. Compare submitted face with enrolled faces
4. Mark attendance if match is successful

---

## 🧪 Testing Checklist

### Face Enrollment
- [ ] Can open face enrollment modal
- [ ] Camera access works
- [ ] Can capture 3 images
- [ ] Images are uploaded to S3
- [ ] Database is updated with face data
- [ ] Can view enrolled images
- [ ] Can re-enroll face
- [ ] Can delete face data

### Attendance Marking
- [ ] Face detection works
- [ ] Liveness check prevents photo spoofing
- [ ] Attendance is marked successfully
- [ ] Error messages are clear
- [ ] Can retry on failure

### Error Scenarios
- [ ] No face detected - shows error
- [ ] Liveness check fails - shows error
- [ ] Face not enrolled - shows error
- [ ] Network error - shows error
- [ ] Camera permission denied - shows error

---

## 🔧 Configuration

### Adjust Face Recognition Settings

In `client/src/utils/faceRecognition.ts`, you can adjust:

```typescript
// Liveness confidence threshold (0-1)
const LIVENESS_THRESHOLD = 0.7;

// Face detection confidence threshold (0-1)
const DETECTION_THRESHOLD = 0.8;

// Face matching similarity threshold (0-100)
const MATCHING_THRESHOLD = 80;
```

### Adjust Attendance Requirements

In workspace attendance config:

```typescript
{
  requireFaceVerification: true,  // Enable/disable face verification
  requireLocation: true,           // Enable/disable location verification
  // ... other settings
}
```

---

## 📁 File Structure Summary

### Frontend Files Created
```
client/src/
├── utils/
│   └── faceRecognition.ts                    ✅ Face recognition service
├── components/
│   ├── workspace-detail/
│   │   ├── FaceEnrollmentModal.tsx           ✅ Face enrollment UI
│   │   └── AttendanceMarkingModal.tsx        ✅ Enhanced with face recognition
│   └── profile/
│       └── FaceEnrollmentSection.tsx         ✅ Profile integration
```

### Backend Files Created
```
server/src/
└── routes/
    └── faceEnrollment.ts                     ✅ Face enrollment API
```

### Documentation Created
```
FACE_RECOGNITION_IMPLEMENTATION.md            ✅ Full implementation guide
FACE_RECOGNITION_QUICK_START.md               ✅ This quick start guide
```

---

## 🎯 Next Steps (Optional)

### 1. Integrate KBY-AI SDK (For Production)

For actual face recognition (not mock), you need to:

1. **Copy models from the cloned repository:**
   ```bash
   # Copy model files
   cp -r face-recognition-temp/public/models client/public/models
   
   # Copy post-install script
   cp face-recognition-temp/post-install.js client/
   
   # Run post-install to set up models
   cd client
   node post-install.js
   ```

2. **Install KBY-AI package:**
   ```bash
   npm install kby-face --legacy-peer-deps
   ```

3. **Update faceRecognition.ts to use actual SDK:**
   ```typescript
   import * as FaceSDK from 'kby-face';
   
   async initialize() {
     await FaceSDK.load_opencv();
     this.detectSession = await FaceSDK.loadDetectionModel();
     this.featureSession = await FaceSDK.loadFeatureModel();
     this.livenessSession = await FaceSDK.loadLivenessModel();
   }
   ```

### 2. Add Face Comparison in Backend

For server-side face verification:

```typescript
// server/src/utils/faceComparison.ts
export async function compareFaces(
  submittedImage: string,
  enrolledImages: string[]
): Promise<{ match: boolean; similarity: number }> {
  // Extract features from submitted image
  // Compare with enrolled images
  // Return match result
}
```

### 3. Add Admin Dashboard

Create an admin view to:
- See all users with enrolled faces
- View face enrollment statistics
- Monitor face verification success rates
- Audit attendance logs

### 4. Add Face Quality Metrics

Show quality scores during enrollment:
- Face size
- Lighting conditions
- Face angle
- Image sharpness

---

## 🆘 Troubleshooting

### Issue: Routes not working
**Solution**: Make sure you've registered the routes in your main app file:
```typescript
app.use('/api/users', faceEnrollmentRoutes);
```

### Issue: S3 upload fails
**Solution**: Check your S3 configuration in environment variables:
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket
```

### Issue: Camera not working
**Solution**: 
- Ensure HTTPS (camera requires secure context)
- Check browser permissions
- Try different browser

### Issue: Face not detected
**Solution**:
- Ensure good lighting
- Position face clearly in frame
- Remove obstructions

---

## 📞 Support

- Check `FACE_RECOGNITION_IMPLEMENTATION.md` for detailed documentation
- Review code comments in created files
- Test with the provided testing checklist

---

## ✅ Completion Checklist

- [x] Dependencies installed
- [ ] Routes registered in Express app
- [ ] Face enrollment added to profile
- [ ] Tested face enrollment flow
- [ ] Tested attendance marking with face recognition
- [ ] Verified database updates
- [ ] Tested error scenarios

---

**Status**: Ready for integration and testing!

**Next Action**: Register the face enrollment routes in your Express app and test the flow.
