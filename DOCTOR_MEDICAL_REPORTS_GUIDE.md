# 📋 Doctor Quick Guide: Accessing Patient Medical Reports

## 🎯 How Doctors Can View Patient Medical Reports

When patients book appointments, they can upload medical reports (PDFs, images, lab results, etc.). Here's how doctors can access them:

---

## 📍 Step-by-Step Guide

### **Step 1: Check Appointments Table**

In your Doctor Dashboard, look at the **Appointments** section:

```
┌─────────────────────────────────────────────────────────────┐
│ Patient Name │ Date/Time │ Type            │ Status │ Action│
├─────────────────────────────────────────────────────────────┤
│ John Doe     │ Dec 22    │ Online          │ Booked │ [👁️] │
│              │ 10:00 AM  │ 📄 2 Reports    │        │       │
│              │           │    Attached     │        │       │
└─────────────────────────────────────────────────────────────┘
```

**Look for:** Blue text showing "📄 X Reports Attached" under the appointment type

---

### **Step 2: Click "View Details" Button**

Click the **eye icon (👁️)** in the Actions column to open the appointment details.

---

### **Step 3: View Medical Reports Section**

In the modal that opens, scroll to find the **highlighted blue section**:

```
╔═══════════════════════════════════════════════════════════╗
║ 📄 Patient Medical Reports (2)                            ║
║ 📄 Files uploaded by patient during appointment booking   ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ 📄 blood_test_results.pdf                          │  ║
║ │ Size: 256.45 KB • Type: application/pdf            │  ║
║ │ Uploaded: December 22, 2025 at 9:30 AM             │  ║
║ │                                                      │  ║
║ │         [👁️ View]    [⬇️ Download]                 │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ 📄 xray_chest.jpg                                   │  ║
║ │ Size: 1.2 MB • Type: image/jpeg                     │  ║
║ │ Uploaded: December 22, 2025 at 9:30 AM             │  ║
║ │                                                      │  ║
║ │         [👁️ View]    [⬇️ Download]                 │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

---

### **Step 4: Access the Files**

For each medical report, you have **TWO OPTIONS**:

#### Option A: **View** (Blue Button)
- Opens the file in a new browser tab
- Perfect for quick review
- Works great for PDFs and images

#### Option B: **Download** (Gray Button)
- Downloads the file to your computer
- Saves with original filename
- For offline access or record keeping

---

## 📋 Information Displayed

For each uploaded file, you'll see:

| Field | Description |
|-------|-------------|
| **Filename** | Original name of the uploaded file |
| **File Size** | Size in KB or MB |
| **File Type** | MIME type (PDF, Image, etc.) |
| **Upload Time** | When patient uploaded the file |

---

## 🔍 Quick Tips

1. **Multiple Files**: Patients can upload up to 5 files per appointment
2. **File Types**: PDF, JPG, PNG, and other document formats
3. **No Reports**: If badge doesn't show, patient didn't upload any files
4. **File Security**: Files stored securely on the server

---

## 🚨 Troubleshooting

### "Can't see reports badge"
- Patient didn't upload any files during booking
- Check if appointment has `medicalReports` data

### "View/Download not working"
- Check if backend server is running (localhost:3000)
- Verify files exist in `backend/uploads/` folder
- Check browser console for errors

### "File won't open"
- Try Download instead of View
- Check if file format is supported by browser
- Corrupted file - ask patient to re-upload

---

## 💡 Best Practices

1. **Review Before Consultation**: Check reports before the appointment
2. **Download Important Files**: Keep copies for your records
3. **Ask for Clarity**: If reports unclear, request better quality
4. **Follow Up**: Create medical records based on uploaded reports

---

## 📞 Need Help?

If you encounter issues:
1. Refresh the page
2. Clear browser cache
3. Check server logs
4. Contact system administrator

---

**System Status:** ✅ Fully Operational
**Last Updated:** December 22, 2025
