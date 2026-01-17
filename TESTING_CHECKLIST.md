# Calendar.ai - Comprehensive Testing Checklist

## 📋 Quick Reference Checklist

Use this checklist to track your testing progress. Mark items as you complete them.

---

## ✅ Pre-Testing Setup

- [ ] Dev server running (`npm run dev`)
- [ ] Database connected and accessible
- [ ] Google OAuth credentials configured
- [ ] OpenRouter API key configured
- [ ] Test Google account ready for calendar sync
- [ ] Browser DevTools open (for debugging)

---

## 🔐 1. Authentication & Onboarding

### Sign In Flow
- [ ] Landing page loads correctly
- [ ] "Sign in with Google" button visible
- [ ] Google OAuth flow works
- [ ] Successfully redirected to dashboard after sign in
- [ ] User session persists on page refresh
- [ ] Sign out button works
- [ ] Redirected to landing page after sign out

### Mock Account
- [ ] "Use Mock Account" button visible
- [ ] Mock account creates session
- [ ] Can access all features with mock account

**Expected Result**: Smooth authentication flow with no errors

---

## 📅 2. Calendar Integration

### Google Calendar Sync
- [ ] Connect Google Calendar button visible
- [ ] OAuth flow completes successfully
- [ ] Events sync from Google Calendar
- [ ] Events display on calendar grid
- [ ] Event times are correct
- [ ] Event titles display properly
- [ ] Multi-day events render correctly

### Calendar Display
- [ ] Day view shows hourly grid
- [ ] Events positioned correctly by time
- [ ] Overlapping events handled properly
- [ ] Event colors are distinct
- [ ] Event details visible on hover
- [ ] Time labels (8am, 9am, etc.) visible

**Expected Result**: All Google Calendar events visible and correctly positioned

---

## 🖱️ 3. Drag & Drop (Write-back Sync)

### Event Rescheduling
- [ ] Can grab and drag events
- [ ] Ghost preview shows while dragging
- [ ] Drop zones highlight appropriately
- [ ] Event updates to new time on drop
- [ ] Changes sync to Google Calendar
- [ ] Optimistic UI update (immediate feedback)
- [ ] Toast notification on successful update
- [ ] Error handling if sync fails

### Edge Cases
- [ ] Drag to same position (no change)
- [ ] Drag across day boundaries
- [ ] Drag very short events
- [ ] Drag all-day events

**Expected Result**: Smooth drag & drop with Google Calendar sync

---

## ✅ 4. Task Management

### Task Creation
- [ ] Task sidebar visible on calendar page
- [ ] "Add Task" input field works
- [ ] Enter key creates task
- [ ] Task appears in sidebar immediately
- [ ] Task persists after page refresh
- [ ] Can create multiple tasks

### Task Timeblocking
- [ ] Can drag task from sidebar to calendar
- [ ] Task creates calendar event on drop
- [ ] Event linked to task
- [ ] Task status updates to "scheduled"
- [ ] Event syncs to Google Calendar
- [ ] Can reschedule task event

### Task Status
- [ ] Can mark tasks as complete
- [ ] Completed tasks show checkmark
- [ ] Can delete tasks
- [ ] Task counts update correctly

**Expected Result**: Full task lifecycle working with calendar integration

---

## 🛡️ 5. Shield Up (Focus Blocks)

### Focus Block Creation
- [ ] "Shield Up" button visible in calendar header
- [ ] Click shows loading state
- [ ] AI finds optimal time slots
- [ ] Creates "🛡️ Deep Work" events
- [ ] Events appear on calendar
- [ ] Events sync to Google Calendar
- [ ] Toast notification on success
- [ ] Error handling if no slots available

### Requirements
- [ ] Requires connected Google Calendar
- [ ] Works with existing events
- [ ] Respects working hours
- [ ] Considers energy zones (if configured)

**Expected Result**: AI creates focus blocks in optimal time slots

---

## 🎯 6. Focus Defense (AI Recommendations)

### Focus Session Suggestions
- [ ] Focus suggestions widget visible on dashboard
- [ ] Shows top 3 recommended slots
- [ ] Displays quality score for each
- [ ] Shows energy level indicator
- [ ] Shows duration
- [ ] "Book" button on each suggestion

### Booking Focus Sessions
- [ ] Click "Book" creates event
- [ ] Event appears on calendar
- [ ] Event syncs to Google Calendar
- [ ] Toast notification on success
- [ ] Suggestions refresh after booking

**Expected Result**: AI recommends optimal focus times with one-click booking

---

## 💬 7. Smart Input (Natural Language)

### Event Parsing
- [ ] Smart input field visible on calendar page
- [ ] Can type natural language
- [ ] "Parse" button works
- [ ] Shows preview of parsed event
- [ ] Displays confidence score
- [ ] Shows date, time, duration

### Test Cases
- [ ] "Lunch tomorrow at noon" → Creates lunch event
- [ ] "Team meeting next Monday 2pm" → Correct date/time
- [ ] "Coffee Friday morning" → Infers 9am
- [ ] "Dentist on Jan 25 at 3:30pm" → Specific date
- [ ] Invalid input → Shows error message

### Event Creation
- [ ] "Create Event" button works
- [ ] Event appears on calendar
- [ ] Event syncs to Google Calendar
- [ ] Can cancel before creating

**Expected Result**: Natural language converts to calendar events accurately

---

## 📊 8. Analytics Dashboard

### Page Load
- [ ] Analytics page accessible from sidebar
- [ ] Page loads without errors
- [ ] No infinite loading spinner
- [ ] All tabs visible (Overview, Focus, Insights)

### Overview Tab
- [ ] Weekly metrics display
- [ ] Shows meeting hours
- [ ] Shows focus time
- [ ] Shows free time
- [ ] Stacked bar chart renders
- [ ] Data is accurate

### Focus Tab
- [ ] Focus trends chart displays
- [ ] Area chart renders correctly
- [ ] Shows trend over time
- [ ] Data points are accurate

### Insights Tab
- [ ] AI-generated insights display
- [ ] Insights are relevant
- [ ] Recommendations make sense
- [ ] No generic/placeholder text

**Expected Result**: Comprehensive analytics with charts and insights

---

## 🤖 9. AI Chat

### Chat Interface
- [ ] Chat widget visible on dashboard
- [ ] Can type messages
- [ ] Send button works
- [ ] Enter key sends message
- [ ] Messages display correctly
- [ ] Loading indicator while AI responds

### Context Awareness
- [ ] AI knows about upcoming events
- [ ] AI can answer calendar questions
- [ ] AI provides relevant suggestions
- [ ] Responses are helpful
- [ ] No hallucinations or errors

### Test Queries
- [ ] "What's on my calendar today?"
- [ ] "When is my next meeting?"
- [ ] "Do I have time for a 1-hour meeting tomorrow?"
- [ ] "Summarize my week"

**Expected Result**: AI chat provides context-aware calendar assistance

---

## 📝 10. Meeting Intelligence

### Adding Meeting Notes
- [ ] Click on calendar event
- [ ] "Add Notes" button visible
- [ ] Modal opens correctly
- [ ] Can paste/type notes
- [ ] "Extract Action Items" button works

### AI Extraction
- [ ] AI analyzes notes
- [ ] Extracts action items
- [ ] Shows summary
- [ ] Shows key points
- [ ] Shows decisions made
- [ ] Confidence scores displayed

### Test Input
```
Team discussed Q1 roadmap. Sarah will prepare design mockups 
by Friday. John to review API documentation by Wednesday. 
Decided to proceed with Option B for database migration.
```

**Expected Extraction**:
- [ ] Action 1: Sarah - Prepare design mockups (Due: Friday)
- [ ] Action 2: John - Review API documentation (Due: Wednesday)
- [ ] Decision: Proceed with Option B

### Task Creation
- [ ] Can select/deselect action items
- [ ] "Save & Create Tasks" button works
- [ ] Tasks created automatically
- [ ] Tasks appear in task sidebar
- [ ] Tasks linked to meeting
- [ ] Toast notification on success

**Expected Result**: AI extracts action items and creates tasks automatically

---

## ⚙️ 11. Settings Page

### Page Access
- [ ] Settings link visible in sidebar
- [ ] Settings page loads
- [ ] Tabbed interface works
- [ ] Calendar tab visible
- [ ] Energy Zones tab visible

### Calendar Preferences
- [ ] Default view dropdown works
- [ ] Working hours selectors work
- [ ] Show weekends toggle works
- [ ] First day of week selector works
- [ ] "Save Settings" button works
- [ ] Toast notification on save
- [ ] Settings persist after refresh

### Energy Zones
- [ ] Visual timeline displays
- [ ] Template buttons work (Morning Person, Night Owl, Balanced)
- [ ] Zone list shows correctly
- [ ] Color-coded visualization
- [ ] "Save Energy Zones" button works
- [ ] Zones persist after refresh

**Expected Result**: User can configure preferences and energy zones

---

## 📧 12. Smart Negotiation (Reschedule)

### Reschedule Request
- [ ] Click on event with attendees
- [ ] "Request Reschedule" button visible
- [ ] AI generates email draft
- [ ] Shows alternative time slots
- [ ] Email is professional and polite
- [ ] Can copy email text
- [ ] Modal closes properly

**Expected Result**: AI generates professional reschedule emails

---

## 🎨 13. UI/UX Quality

### Visual Polish
- [ ] Consistent styling throughout
- [ ] Proper spacing and alignment
- [ ] Readable fonts and sizes
- [ ] Good color contrast
- [ ] Icons render correctly
- [ ] No visual glitches

### Hover States
- [ ] Buttons show hover effects
- [ ] Cards lift on hover
- [ ] Events highlight on hover
- [ ] Cursor changes appropriately

### Loading States
- [ ] Skeleton loaders display
- [ ] Spinners show during operations
- [ ] No blank screens
- [ ] Loading text is informative

### Error States
- [ ] Error messages are clear
- [ ] Toast notifications work
- [ ] Errors don't crash app
- [ ] Can recover from errors

**Expected Result**: Polished, professional UI throughout

---

## 📱 14. Responsive Design

### Desktop (1920x1080)
- [ ] Layout looks good
- [ ] All features accessible
- [ ] No horizontal scroll
- [ ] Sidebar visible

### Laptop (1366x768)
- [ ] Layout adapts properly
- [ ] Content fits screen
- [ ] No overlapping elements

### Tablet (768x1024)
- [ ] Mobile-friendly layout
- [ ] Sidebar collapses or adapts
- [ ] Touch-friendly controls
- [ ] Calendar remains usable

### Mobile (375x667)
- [ ] Fully responsive
- [ ] Navigation accessible
- [ ] Calendar scrollable
- [ ] All features work

**Expected Result**: App works on all screen sizes

---

## ⚡ 15. Performance

### Page Load Speed
- [ ] Landing page loads < 2s
- [ ] Dashboard loads < 3s
- [ ] Calendar page loads < 3s
- [ ] Analytics page loads < 4s

### Interaction Speed
- [ ] Drag & drop is smooth
- [ ] Buttons respond instantly
- [ ] Modals open quickly
- [ ] No lag when typing

### Data Handling
- [ ] Handles 50+ events smoothly
- [ ] Handles 20+ tasks smoothly
- [ ] No memory leaks
- [ ] No console errors

**Expected Result**: Fast, responsive application

---

## 🌐 16. Browser Compatibility

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

**Expected Result**: Works across major browsers

---

## 🔒 17. Security & Privacy

### Authentication
- [ ] Sessions expire appropriately
- [ ] Can't access dashboard when logged out
- [ ] OAuth tokens stored securely
- [ ] No sensitive data in URLs

### Data Protection
- [ ] User data isolated by account
- [ ] Can't see other users' data
- [ ] API keys not exposed
- [ ] HTTPS in production

**Expected Result**: Secure and private

---

## 🐛 18. Error Handling

### Network Errors
- [ ] Handles offline gracefully
- [ ] Shows error message
- [ ] Can retry failed operations
- [ ] No app crashes

### API Errors
- [ ] Google Calendar API errors handled
- [ ] OpenRouter API errors handled
- [ ] Database errors handled
- [ ] User-friendly error messages

### Edge Cases
- [ ] Empty calendar (no events)
- [ ] No tasks created
- [ ] No calendar connected
- [ ] Invalid input handling

**Expected Result**: Graceful error handling throughout

---

## ✅ Final Checks

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No TypeScript errors
- [ ] No linting errors

### Documentation
- [ ] README.md complete
- [ ] Environment variables documented
- [ ] Setup instructions clear
- [ ] Features documented

### Production Readiness
- [ ] `npm run build` succeeds
- [ ] Production build tested locally
- [ ] Environment variables set
- [ ] Ready for deployment

**Expected Result**: Production-ready application

---

## 📊 Testing Summary

**Total Tests**: ~200 checkpoints
**Estimated Time**: 3-4 hours for comprehensive testing
**Priority**: Focus on critical features first (Auth, Calendar, Tasks, AI)

---

## 🎯 Critical Path (30 min quick test)

1. ✅ Sign in with Google
2. ✅ Connect Google Calendar
3. ✅ Verify events sync
4. ✅ Drag & drop event
5. ✅ Create task
6. ✅ Drag task to calendar
7. ✅ Use Smart Input
8. ✅ Add meeting notes
9. ✅ Check analytics
10. ✅ Configure settings

---

## 📝 Bug Report Template

When you find a bug, document it:

```
**Bug**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Screenshot**: [If applicable]
**Console Errors**: [If any]
**Priority**: [Critical/High/Medium/Low]
```

---

## ✅ Sign-off

- [ ] All critical features tested
- [ ] All bugs documented
- [ ] Ready for production deployment

**Tester**: _______________
**Date**: _______________
**Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Work
