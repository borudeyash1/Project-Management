# 🔐 Admin Device Security System

## Overview

The TaskFlowHQ admin portal (`/my-admin/login`) is protected by device-based authentication. Only pre-approved devices can access the admin login page.

---

## 🎯 How It Works

### 1. **Device Fingerprinting**
- Generates a unique device ID based on:
  - User Agent
  - Screen Resolution
  - Timezone
  - Language
  - Platform
  - CPU Cores
  - Canvas Fingerprint
  - WebGL Fingerprint
  - Browser Plugins

### 2. **Custom Device ID**
- You can manually set a custom device ID (like your current device: `37D98603-981B-493F-9A74-C3DD4A3AEE48`)
- This overrides the automatically generated fingerprint

### 3. **Database Verification**
- When accessing `/my-admin/login`, the system:
  1. Gets your device ID (custom or fingerprint)
  2. Sends it to the backend
  3. Checks if it exists in the `AllowedDevice` collection
  4. Grants or denies access based on the result

---

## 🚀 Setup Instructions

### **Step 1: Add Your Device to Database**

Run the seed script on the server:

```bash
cd server
npx ts-node src/scripts/seedAdminDevice.ts
```

This will add your device ID (`37D98603-981B-493F-9A74-C3DD4A3AEE48`) to the allowed devices.

### **Step 2: Set Device ID in Browser**

Open your browser console and run:

```javascript
localStorage.setItem('customDeviceId', '37D98603-981B-493F-9A74-C3DD4A3AEE48');
```

Or use the global helper function:

```javascript
setMyDeviceId();
```

### **Step 3: Access Admin Portal**

Navigate to: `http://localhost:3000/my-admin/login`

You should now see the admin login page!

---

## 📋 Managing Allowed Devices

### **View All Allowed Devices**

```bash
# Connect to MongoDB
mongo taskflowhq

# View all devices
db.alloweddevices.find().pretty()
```

### **Add New Device Manually**

```javascript
db.alloweddevices.insertOne({
  deviceId: "NEW-DEVICE-ID-HERE",
  deviceName: "Secondary Admin Device",
  deviceType: "admin",
  userAgent: "Mozilla/5.0...",
  platform: "Win32",
  isActive: true,
  addedBy: "admin@taskflowhq.com",
  notes: "Added for backup access",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### **Remove Device**

```javascript
db.alloweddevices.deleteOne({ deviceId: "DEVICE-ID-TO-REMOVE" });
```

### **Deactivate Device (Don't Delete)**

```javascript
db.alloweddevices.updateOne(
  { deviceId: "DEVICE-ID" },
  { $set: { isActive: false } }
);
```

---

## 🔧 API Endpoints

### **Check Device Access** (Public)
```
POST /api/admin/check-device
Body: { deviceId: "your-device-id" }
```

### **Get All Devices** (Protected)
```
GET /api/admin/devices
Headers: { Authorization: "Bearer <token>" }
```

### **Add Device** (Protected)
```
POST /api/admin/devices
Headers: { Authorization: "Bearer <token>" }
Body: {
  deviceId: "device-id",
  deviceName: "Device Name",
  deviceType: "admin",
  notes: "Optional notes"
}
```

### **Update Device** (Protected)
```
PUT /api/admin/devices/:id
Headers: { Authorization: "Bearer <token>" }
Body: {
  deviceName: "Updated Name",
  isActive: true
}
```

### **Delete Device** (Protected)
```
DELETE /api/admin/devices/:id
Headers: { Authorization: "Bearer <token>" }
```

---

## 🛡️ Security Features

### **1. Access Denied Page**
- Shows when device is not authorized
- Displays the device ID for reference
- Logs all access attempts

### **2. Access Logging**
- All access attempts are logged
- Includes:
  - Device ID
  - Timestamp
  - IP Address
  - User Agent
  - Device Info

### **3. Device Types**
- **admin**: Full admin access
- **trusted**: Limited admin access (future feature)

---

## 📱 Getting Your Device ID

### **Method 1: Browser Console**

```javascript
// Run in browser console
async function getMyDeviceId() {
  const components = [];
  components.push(navigator.userAgent);
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  components.push(navigator.language);
  components.push(navigator.platform);
  
  const str = components.join('|||');
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('Your Device ID:', hashHex);
  return hashHex;
}

getMyDeviceId();
```

### **Method 2: Use Custom ID**

Simply use your existing device ID:
```
37D98603-981B-493F-9A74-C3DD4A3AEE48
```

---

## 🔄 Workflow

```
User visits /my-admin/login
        ↓
Get Device ID (custom or fingerprint)
        ↓
Send to /api/admin/check-device
        ↓
Check database for allowed device
        ↓
    ┌───────┴───────┐
    ↓               ↓
  Allowed      Not Allowed
    ↓               ↓
Show Login    Show Access Denied
  Page            Page
```

---

## 🎨 User Experience

### **Allowed Device:**
1. Loading screen (1-2 seconds)
2. Admin login page appears
3. Can proceed with login

### **Denied Device:**
1. Loading screen (1-2 seconds)
2. Access denied page appears
3. Shows device ID
4. Provides instructions to contact admin

---

## 🔐 Best Practices

1. **Keep Device IDs Secure**
   - Don't share your device ID publicly
   - Store in secure password manager

2. **Regular Audits**
   - Review allowed devices monthly
   - Remove inactive devices

3. **Backup Access**
   - Add at least 2 devices for redundancy
   - Keep one device ID in secure offline storage

4. **Monitor Access Logs**
   - Check for unauthorized access attempts
   - Investigate suspicious activity

---

## 🆘 Troubleshooting

### **Problem: Access Denied on My Device**

**Solution:**
1. Check if device ID is set:
   ```javascript
   console.log(localStorage.getItem('customDeviceId'));
   ```

2. Verify device is in database:
   ```javascript
   db.alloweddevices.findOne({ deviceId: "YOUR-DEVICE-ID" });
   ```

3. Check if device is active:
   ```javascript
   db.alloweddevices.findOne({ 
     deviceId: "YOUR-DEVICE-ID",
     isActive: true 
   });
   ```

### **Problem: Lost Access to All Devices**

**Solution:**
1. Connect directly to MongoDB
2. Add a new device manually
3. Set the device ID in browser localStorage

---

## 📊 Database Schema

```typescript
interface AllowedDevice {
  deviceId: string;          // Unique device identifier
  deviceName: string;        // Human-readable name
  deviceType: 'admin' | 'trusted';
  userAgent?: string;        // Browser user agent
  platform?: string;         // Operating system
  lastAccess?: Date;         // Last time device accessed admin
  isActive: boolean;         // Active status
  addedBy: string;          // Who added this device
  notes?: string;           // Optional notes
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 Current Configuration

**Your Device:**
- **Device ID:** `37D98603-981B-493F-9A74-C3DD4A3AEE48`
- **Device Name:** Primary Admin Device
- **Device Type:** admin
- **Status:** Active

---

## 📝 Notes

- Device IDs are stored in `localStorage` with key `customDeviceId`
- Access attempts are logged but not stored permanently (add logging model if needed)
- The system uses both custom device IDs and fingerprints for flexibility
- MAC addresses are not accessible in browsers for security reasons

---

## 🔮 Future Enhancements

- [ ] Email notifications on new device access attempts
- [ ] 2FA for adding new devices
- [ ] Device access expiration dates
- [ ] IP whitelisting in addition to device ID
- [ ] Admin dashboard to manage devices
- [ ] Access logs with full history
- [ ] Device trust levels (admin, trusted, read-only)

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0
