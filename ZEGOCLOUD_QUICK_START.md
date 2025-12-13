# ZegoCloud Quick Start Guide 🎥

## 🎯 Quick Test Steps

### 1. Verify Setup ✅
```bash
# Check environment variables exist
cat frontend/.env | grep VITE_ZEGO
```

### 2. Start Development Server 🚀
```bash
cd frontend
npm run dev
```

### 3. Test Video Call 🎬
1. Open browser → http://localhost:5173
2. Login as doctor
3. Go to **"Patients"** tab
4. Click **"Start Video Call"** on any patient
5. Allow camera/microphone permissions
6. See yourself in bottom-right corner

### 4. Test Two-Way Call 👥
**Option A - Two Browser Windows:**
- Window 1: Doctor view
- Window 2: Patient view (incognito mode)
- Both join same room ID

**Option B - Two Devices:**
- Device 1: Your computer (doctor)
- Device 2: Your phone (patient)
- Share room ID between devices

## 🎨 What You'll See

```
┌─────────────────────────────────────┐
│  [×] Dr. Smith → Patient John       │  ← Header
│      Duration: 00:45                 │
├─────────────────────────────────────┤
│                                      │
│     REMOTE VIDEO (Full Screen)      │
│                                      │
│           ┌──────────┐               │
│           │ Local    │               │  ← Your video
│           │ Video    │               │     (bottom-right)
│           └──────────┘               │
├─────────────────────────────────────┤
│   [🎤] [📹] [📞] [🔊] [⛶]          │  ← Controls
└─────────────────────────────────────┘
```

## 🎮 Controls

| Button | Function | Shortcut |
|--------|----------|----------|
| 🎤 | Mute/Unmute Microphone | - |
| 📹 | Camera On/Off | - |
| 📞 | End Call | - |
| 🔊 | Speaker On/Off | - |
| ⛶ | Full Screen | F11 |

## 🔧 Troubleshooting Quick Fixes

### Camera/Mic Not Working?
```javascript
// Check browser permissions
chrome://settings/content/camera
chrome://settings/content/microphone
```

### Token Error?
```bash
# Restart dev server after .env changes
cd frontend
npm run dev
```

### No Video Showing?
1. Check console for errors (F12)
2. Verify both users in same room ID
3. Allow browser permissions
4. Check network/firewall

## 📂 Files Created

```
frontend/
├── src/
│   ├── config/
│   │   ├── zegoConfig.js      ← ZegoCloud setup
│   │   └── zegoToken.js       ← Token generator
│   └── components/
│       └── VideoCall/
│           ├── VideoCallRoom.jsx   ← Video call UI
│           └── VideoCallRoom.css   ← Styles
```

## 🔐 Environment Variables

```env
# frontend/.env
VITE_ZEGO_APP_ID=1234567890
VITE_ZEGO_SERVER_SECRET=your_secret_key_here
```

## 📱 Test Checklist

- [ ] Video call button visible in Patients tab
- [ ] Clicking button opens video call room
- [ ] Camera permission requested
- [ ] Microphone permission requested
- [ ] Local video shows (mirrored)
- [ ] Mute audio works
- [ ] Turn off camera works
- [ ] End call works
- [ ] Duration timer counts up
- [ ] Responsive on mobile
- [ ] Full screen works

## 🎊 Success!

If you see:
- ✅ Your video in bottom-right corner
- ✅ Controls at the bottom
- ✅ "Waiting for participant..." message
- ✅ Duration timer at top

**YOU'RE ALL SET!** 🎉

## 🆘 Need Help?

Check the complete guide:
📄 `ZEGOCLOUD_INTEGRATION_COMPLETE.md`

Common issues:
1. **HTTPS required** in production
2. **Restart server** after .env changes
3. **Allow permissions** in browser
4. **Same room ID** for both users

---

**Made with ❤️ for Healthcare Management System**
