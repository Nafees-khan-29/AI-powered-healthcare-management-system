# Doctor Dashboard Layout Structure

## New Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NAVBAR (Top - Fixed)                         │
│                     [Logo] [Home] [Services] [Contact]              │
└─────────────────────────────────────────────────────────────────────┘
│
┌──────────────┬──────────────────────────────────────────────────────┐
│              │                  TOP HEADER BAR                       │
│  SIDEBAR     │  Dashboard    [Search...]   🔔 [👤]                  │
│  (Fixed)     ├──────────────────────────────────────────────────────┤
│              │                                                       │
│ 💙 ProHealth │                MAIN CONTENT AREA                     │
│              │                                                       │
│ 🏠 Dashboard │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│              │  │  Total   │ │  Appts   │ │ Pending  │ │ Critical ││
│ 📅 Appts     │  │ Patients │ │This Month│ │  Today   │ │  Cases   ││
│              │  │   142    │ │    89    │ │    8     │ │    3     ││
│ 👥 Patients  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│              │                                                       │
│ 📋 Records   │  ┌────────────────────────────────────────────────┐ │
│              │  │         Today's Schedule                       │ │
│ 📝 Reports   │  │  [Appointment Cards with Patient Info]        │ │
│              │  └────────────────────────────────────────────────┘ │
│ 💊 Rx        │                                                       │
│              │  ┌────────────────────────────────────────────────┐ │
│ 🚨 Alerts    │  │         Recent Medical Records                 │ │
│              │  │  [Medical Record Cards with Quick Actions]    │ │
│ 💬 Messages  │  └────────────────────────────────────────────────┘ │
│              │                                                       │
│ ❓ Help      │                                                       │
│              │                                                       │
│ ─────────── │                                                       │
│              │                                                       │
│ 🚪 Logout    │                                                       │
│              │                                                       │
└──────────────┴──────────────────────────────────────────────────────┘
```

## Component Breakdown

### Left Sidebar (260px wide)

```
╔════════════════════════════╗
║                            ║
║  💙 ProHealth              ║  ← Logo Section
║  ────────────────────────  ║
║                            ║
║  🏠  Dashboard             ║  ← Active (white bg)
║  📅  Appointments          ║
║  👥  Online Patients       ║
║  📋  Medical Records       ║
║  📝  Medical Reports       ║
║  💊  Prescriptions         ║
║  🚨  Emergency Alerts      ║
║  💬  Messages              ║
║  ❓  Help                  ║
║                            ║
║  ────────────────────────  ║
║  🚪  Logout               ║  ← Bottom section
║                            ║
╚════════════════════════════╝
```

### Top Header Bar (Inside Main Content)

```
┌────────────────────────────────────────────────────────────┐
│  Dashboard          [🔍 Search anything...]    🔔(3)  [D]  │
│  ↑ Page Title       ↑ Search Bar              ↑      ↑     │
│                                             Notif  Avatar   │
└────────────────────────────────────────────────────────────┘
```

### Summary Cards Row

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 👥  142      │  │ 📅  89       │  │ ⏰  8        │  │ ⚠️  3        │
│              │  │              │  │              │  │              │
│ Total        │  │ Appointments │  │ Pending      │  │ Critical     │
│ Patients     │  │ This Month   │  │ Today        │  │ Cases        │
│              │  │              │  │              │  │              │
│ +12% ↑       │  │ +8% ↑        │  │ No change    │  │ Requires     │
│              │  │              │  │              │  │ attention    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
   Blue              Green             Yellow            Red
```

### Content Sections

```
┌────────────────────────────────────────────────────────────┐
│  Today's Schedule                          [+ Add Appt]    │
├────────────────────────────────────────────────────────────┤
│  ⏰ 09:30 AM  │  John Smith                    │  [View]  │
│               │  Cardiology Consultation       │          │
│               │  🟡 Pending  🔴 High Priority  │          │
├────────────────────────────────────────────────────────────┤
│  ⏰ 11:00 AM  │  Sarah Johnson                 │  [View]  │
│               │  Follow-up Checkup             │          │
│               │  🟢 Confirmed  🟢 Normal       │          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Recent Medical Records                                    │
├────────────────────────────────────────────────────────────┤
│  Patient: John Smith          Date: 2025-12-15            │
│  Diagnosis: Hypertension                                   │
│  🟢 Active                               [View Details]    │
├────────────────────────────────────────────────────────────┤
│  Patient: Mary Brown          Date: 2025-12-14            │
│  Diagnosis: Type 2 Diabetes                                │
│  🟢 Active                               [View Details]    │
└────────────────────────────────────────────────────────────┘
```

## Navigation States

### Normal State
```
┌─────────────────────────┐
│  🏠  Dashboard          │  ← White text, transparent bg
└─────────────────────────┘
```

### Hover State
```
┌─────────────────────────┐
│  🏠  Dashboard          │  ← White text, light bg, slight shift
└─────────────────────────┘
```

### Active State
```
┌─────────────────────────┐
│  🏠  Dashboard          │  ← Blue text, white bg, shadow
└─────────────────────────┘
```

## Color Palette

### Primary Colors
- **Sidebar Background**: `linear-gradient(180deg, #1e40af, #1e3a8a)`
- **Active Nav Item**: `#FFFFFF` (white)
- **Active Nav Text**: `#1e40af` (blue)
- **Main Background**: `#FFFFFF` (white)

### Status Colors
- **Blue (Info)**: `#3b82f6` → `#2563eb`
- **Green (Success)**: `#10b981` → `#059669`
- **Yellow (Warning)**: `#f59e0b` → `#d97706`
- **Red (Critical)**: `#ef4444` → `#dc2626`

### Text Colors
- **Primary**: `#1f2937`
- **Secondary**: `#6b7280`
- **Muted**: `#9ca3af`

## Responsive Breakpoints

### Desktop (>1024px)
- Full sidebar: 260px
- Normal layout

### Tablet (768-1024px)
- Smaller sidebar: 220px
- Compact header

### Mobile (<768px)
- Hidden sidebar (off-screen)
- Full-width content
- Hamburger menu toggle (optional)

### Mobile Portrait (<640px)
- Stacked header elements
- Full-width search
- Optimized spacing

## Key Features

✅ **Fixed Sidebar** - Always visible, easy navigation  
✅ **Sticky Header** - Stays visible when scrolling  
✅ **Search Bar** - Quick global search  
✅ **Notifications** - Badge shows critical alerts count  
✅ **Profile Avatar** - Shows doctor's initial  
✅ **Responsive** - Works on all screen sizes  
✅ **Smooth Transitions** - Professional animations  
✅ **Card Layout** - Clean, modern design  

## Accessibility

- **Keyboard Navigation**: All items are keyboard accessible
- **Focus States**: Visible focus indicators
- **Screen Readers**: Proper ARIA labels
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects user preferences

---

**Layout Type**: Dashboard with Fixed Sidebar  
**Design Style**: Modern Healthcare UI  
**Framework**: React with Tailwind CSS  
**Color Theme**: Blue-based Medical Palette
