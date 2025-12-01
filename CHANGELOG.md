# Changelog

All notable changes to Calendar.ai will be documented in this file.

## Version History

### Version 0.003 - Current Working Version (2025-11-30)
**Status:** ✅ Stable and Fully Functional

#### All Features (Cumulative)
- ✅ Multi-level calendar navigation (Decade → Year → Month → Day views)
- ✅ Event management with subject and agenda
- ✅ Minute-level time scheduling
- ✅ Event duration tracking with visual time blocks
- ✅ Multiple theme support (Light, Dark, Gradient, Minimal)
- ✅ Event persistence using localStorage
- ✅ Responsive design (95% width, 90vh height)
- ✅ Modern UI with Google Fonts (Outfit)
- ✅ Event indicators on calendar dates
- ✅ Hourly timeline in day view
- ✅ Dynamic event block heights based on duration
- ✅ Side-by-side display for simultaneous events

#### New in Version 0.003
- 🎨 **Design Themes:** Four beautiful themes to choose from
  - Light theme (default)
  - Dark theme
  - Gradient theme
  - Minimal theme
- ⏱️ **Minute-Level Scheduling:** Precise event timing with start time and duration
- ✅ Responsive design
- ✅ Modern UI with Google Fonts
- ✅ Event indicators on calendar dates
- ✅ Hourly timeline in day view

#### New in Version 0.002
- 📝 **Event Subject & Agenda:** Added detailed event information
  - Subject field for event title
  - Agenda field for event description
- 💾 **Data Persistence:** Events saved to localStorage
- 🗑️ **Event Deletion:** Ability to delete events
- ✏️ **Event Editing:** Click on existing events to edit

---

### Version 0.001 (2025-11-30)
**Status:** ✅ Stable

#### Features
- 📅 **Multi-Level Calendar Views:**
  - Decade View: 12-year grid selection
  - Year View: Month selection for chosen year
  - Month View: Traditional calendar grid with dates
  - Day View: Hourly timeline (00:00 - 23:00)
- 🎯 **Navigation:**
  - Click on year to navigate to year view
  - Click on month to navigate to month view
  - Click on day to navigate to day view
  - Back button to return to previous view
  - Previous/Next navigation arrows
- 🎨 **Design:**
  - Responsive layout
  - Modern gradient background
  - Google Material Icons
  - Clean and intuitive interface
- ⚡ **Basic Event Creation:**
  - Click on time slots to create events
  - Simple event modal

---

### Version 0.000 - Initial Commit (2025-03-29)
**Status:** Initial Setup

#### Features
- 📦 Project initialization
- 📄 Basic file structure
- 📜 MIT License
- 📖 Initial README

---

## Testing Checklist

For each version, verify the following:

### Core Functionality
- [ ] Calendar loads in month view
- [ ] Can navigate to year view (via back button)
- [ ] Can navigate to decade view (via back button from year)
- [ ] Can navigate to day view (click on any day)
- [ ] Previous/Next buttons work in all views
- [ ] Back button returns to previous view

### Event Management (v0.002+)
- [ ] Can create events by clicking time slots
- [ ] Event modal opens with correct time
- [ ] Can enter subject and agenda
- [ ] Can save events
- [ ] Events persist after page reload
- [ ] Can edit existing events
- [ ] Can delete events

### Themes (v0.003+)
- [ ] Can switch to Light theme
- [ ] Can switch to Dark theme
- [ ] Can switch to Gradient theme
- [ ] Can switch to Minimal theme
- [ ] Theme preference persists after page reload

### Time Features (v0.003+)
- [ ] Can set event start time
- [ ] Can set event duration
- [ ] End time calculated correctly
- [ ] Event blocks display with correct height
- [ ] Multiple events at same time show side-by-side

### Browser Compatibility
- [ ] Works in Chrome/Edge (Chromium)
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works via localhost
- [ ] Works via file:// protocol

---

## How to Run

### Option 1: Python HTTP Server (Recommended)
```bash
cd Calendar.ai
python -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Direct File Open
Simply open `index.html` in your browser

### Option 3: Node.js HTTP Server
```bash
npx http-server -p 8000
```
Then open: http://localhost:8000

### Option 4: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## Notes

- All versions use vanilla JavaScript, HTML5, and CSS3
- No external dependencies or frameworks
- Data stored in browser's localStorage
- Responsive design works on desktop and tablet
