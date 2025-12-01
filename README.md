# Calendar.ai 📅

A modern, responsive calendar application with multi-level navigation, event management, and beautiful themes. Built with vanilla JavaScript, HTML5, and CSS3.

![Version](https://img.shields.io/badge/version-0.003-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-stable-success)

---

## ✨ Features

### 📅 Multi-Level Calendar Navigation
- **Decade View:** Browse 12-year periods
- **Year View:** Select any month in a year
- **Month View:** Traditional calendar grid with event indicators
- **Day View:** Hourly timeline (00:00 - 23:00) with minute-level precision

### 📝 Event Management
- Create events with subject and agenda
- Minute-level time scheduling with duration tracking
- Visual time blocks with dynamic heights
- Edit and delete existing events
- Side-by-side display for simultaneous events
- Persistent storage using localStorage

### 🎨 Beautiful Themes
Choose from 4 stunning themes:
- **Light** - Clean and bright
- **Dark** - Easy on the eyes
- **Gradient** - Vibrant and modern
- **Minimal** - Simple and elegant

### 🎯 User Experience
- Responsive design (works on desktop and tablet)
- Smooth navigation between views
- Event indicators on calendar dates
- Modern UI with Google Fonts (Outfit)
- Intuitive back button navigation

---

## 🚀 Quick Start

### Option 1: Python HTTP Server (Recommended)
```bash
cd Calendar.ai
python -m http.server 8000
```
Then open in your browser: **http://localhost:8000**

### Option 2: Direct File Open
Simply double-click `index.html` or open it in your browser

### Option 3: Node.js HTTP Server
```bash
npx http-server -p 8000
```
Then open in your browser: **http://localhost:8000**

### Option 4: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

---

## 📖 How to Use

### Navigation
1. **Month View** (Default)
   - Click on any day to view hourly schedule
   - Click the back button to go to Year View
   - Use ← → arrows to navigate months

2. **Year View**
   - Click on any month to view that month
   - Click the back button to go to Decade View
   - Use ← → arrows to navigate years

3. **Decade View**
   - Click on any year to view that year
   - Use ← → arrows to navigate decades

4. **Day View**
   - Click on any time slot to create an event
   - Click on existing events to edit or delete
   - Use ← → arrows to navigate days
   - Click the back button to return to Month View

### Creating Events
1. Navigate to Day View by clicking on a date
2. Click on any time slot (e.g., 10:00)
3. Fill in the event details:
   - **Subject:** Event title
   - **Agenda:** Event description (optional)
   - **Start Time:** When the event begins
   - **Duration:** How long the event lasts (in minutes)
4. Click "Save"

### Managing Events
- **Edit:** Click on an existing event to modify it
- **Delete:** Click on an event, then click the "Delete" button
- **View:** Events are displayed with their time range and details

### Changing Themes
Use the theme selector dropdown in the top-left corner to switch between:
- Light
- Dark
- Gradient
- Minimal

Your theme preference is automatically saved!

---

## 💻 Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (Vanilla)** - No frameworks or dependencies
- **LocalStorage** - Client-side data persistence
- **Google Fonts** - Outfit font family
- **Material Icons** - Google Material Symbols

---

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (latest)
- ✅ Mozilla Firefox (latest)
- ✅ Safari (latest)

**Requirements:**
- Modern browser with ES6 support
- LocalStorage enabled
- JavaScript enabled

---

## 📂 Project Structure

```
Calendar.ai/
├── index.html          # Main HTML file
├── script.js           # Application logic (308 lines)
├── style.css           # Styles and themes (15.7 KB)
├── CHANGELOG.md        # Version history and features
├── README.md           # This file
├── LICENSE             # MIT License
└── .gitignore          # Git ignore rules
## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Roadmap

Future enhancements being considered:
- Week view
- Event categories and colors
- Recurring events
- Event reminders
- Export/import functionality
- Mobile responsive improvements
- Keyboard shortcuts

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ using Vanilla JavaScript**