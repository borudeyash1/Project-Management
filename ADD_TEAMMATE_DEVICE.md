# 👥 Adding Teammate Devices to Admin Portal

## 🎯 Overview

The admin portal supports multiple authorized devices. Here's how to add your teammates' devices.

---

## 📋 Steps to Add a Teammate's Device

### **Step 1: Teammate Gets Their Device ID**

Your teammate should:
1. Visit `http://localhost:3000/my-admin/login` on their laptop
2. They'll see "Access Restricted" page
3. Copy the **Device ID** shown (64-character hash)
4. Send it to you

Example Device ID:
```
ee16529e29783f94017b264bdf4446d226dfc6506ba02cf0c4c8b8a73c6e9f5a
```

---

### **Step 2: Add Device to Database**

#### **Method 1: Using Script (Recommended)**

Run this command in the server directory:

```bash
cd server
npx ts-node src/scripts/addDevice.ts <device-id> "Teammate Name"
```

**Example:**
```bash
npx ts-node src/scripts/addDevice.ts abc123def456xyz789 "John's Laptop"
```

#### **Method 2: MongoDB Compass**

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017/taskflowhq`
3. Go to `alloweddevices` collection
4. Click "Add Data" → "Insert Document"
5. Paste this JSON (replace `DEVICE_ID` and `NAME`):

```json
{
  "deviceId": "PASTE_DEVICE_ID_HERE",
  "deviceName": "Teammate Name's Device",
  "deviceType": "admin",
  "isActive": true,
  "addedBy": "admin",
  "notes": "Added for team testing",
  "createdAt": { "$date": "2025-10-27T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-10-27T00:00:00.000Z" }
}
```

#### **Method 3: MongoDB Shell**

```bash
mongosh taskflowhq
```

Then run:
```javascript
db.alloweddevices.insertOne({
  deviceId: "PASTE_DEVICE_ID_HERE",
  deviceName: "Teammate Name's Device",
  deviceType: "admin",
  isActive: true,
  addedBy: "admin",
  notes: "Added for team testing",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

### **Step 3: Teammate Refreshes Page**

After adding the device:
1. Teammate refreshes `http://localhost:3000/my-admin/login`
2. They should now see the admin login form
3. They can login with the admin credentials:
   - **Email:** `yborude678@gmail.com`
   - **Password:** `Yash@1234`

---

## 📊 Managing Multiple Devices

### **View All Devices**

```bash
cd server
npx ts-node src/scripts/seedAdminDevice.ts
```

This will list all authorized devices.

### **Remove a Device**

#### **Using MongoDB Compass:**
1. Find the device in `alloweddevices` collection
2. Click the trash icon to delete

#### **Using MongoDB Shell:**
```javascript
db.alloweddevices.deleteOne({ deviceId: "DEVICE_ID_TO_REMOVE" })
```

### **Deactivate (Don't Delete)**

```javascript
db.alloweddevices.updateOne(
  { deviceId: "DEVICE_ID" },
  { $set: { isActive: false } }
)
```

---

## 🔐 Security Notes

1. **Device IDs are unique** - Each browser/device generates a unique fingerprint
2. **Share carefully** - Only add trusted team members
3. **Monitor access** - Check `lastAccess` field to see when devices were used
4. **Revoke access** - Set `isActive: false` to temporarily disable a device

---

## 🎨 Device Types

- **admin** - Full admin access (default)
- **trusted** - Limited access (future feature)

---

## 📱 Example: Adding 3 Teammates

```bash
# Add John's laptop
npx ts-node src/scripts/addDevice.ts abc123...xyz "John's Laptop"

# Add Sarah's desktop
npx ts-node src/scripts/addDevice.ts def456...uvw "Sarah's Desktop"

# Add Mike's tablet
npx ts-node src/scripts/addDevice.ts ghi789...rst "Mike's Tablet"
```

---

## ✅ Verification

After adding a device, verify it worked:

1. Check MongoDB Compass - device should appear in collection
2. Teammate refreshes the page - should see login form
3. Check server logs - should show "Device authorized!"

---

## 🚨 Troubleshooting

### **"Device Not Authorized" Still Shows**

1. Verify device ID matches exactly (case-sensitive)
2. Check `isActive` is `true`
3. Clear browser cache and refresh
4. Check server logs for errors

### **Device ID Changes**

Device IDs can change if:
- Browser is reinstalled
- Incognito/private mode is used
- Browser data is cleared
- Different browser is used

**Solution:** Add the new device ID

---

## 📝 Quick Reference

```bash
# Add device
npx ts-node src/scripts/addDevice.ts <device-id> "Name"

# View all devices
npx ts-node src/scripts/seedAdminDevice.ts

# MongoDB connection
mongodb://localhost:27017/taskflowhq

# Collection name
alloweddevices
```

---

**Last Updated:** October 27, 2025
