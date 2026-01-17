# Calendar.ai - Detailed Testing Guide

## 📖 Complete Testing Documentation

This document provides detailed testing procedures, expected results, and troubleshooting guidance for Calendar.ai.

---

## Table of Contents

1. [Testing Environment Setup](#1-testing-environment-setup)
2. [Authentication Testing](#2-authentication-testing)
3. [Calendar Integration Testing](#3-calendar-integration-testing)
4. [Task Management Testing](#4-task-management-testing)
5. [AI Features Testing](#5-ai-features-testing)
6. [Analytics Testing](#6-analytics-testing)
7. [Settings Testing](#7-settings-testing)
8. [Performance Testing](#8-performance-testing)
9. [Security Testing](#9-security-testing)
10. [Bug Reporting](#10-bug-reporting)

---

## 1. Testing Environment Setup

### Prerequisites

**Required**:
- Node.js 18+ installed
- PostgreSQL database running
- Google OAuth credentials
- OpenRouter API key
- Modern web browser (Chrome/Firefox/Safari/Edge)

**Optional**:
- Test Google account with calendar data
- Multiple browsers for compatibility testing
- Mobile device for responsive testing

### Environment Variables

Create `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/calendar_ai
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### Starting the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application runs at http://localhost:3000
```

### Verification

- [ ] Server starts without errors
- [ ] No compilation errors in terminal
- [ ] Can access http://localhost:3000
- [ ] Landing page loads correctly

---

## 2. Authentication Testing

### 2.1 Google OAuth Sign In

**Test Case**: User signs in with Google account

**Steps**:
1. Navigate to http://localhost:3000
2. Click "Sign in with Google" button
3. Complete Google OAuth flow
4. Grant calendar permissions

**Expected Results**:
- Redirected to Google sign-in page
- Can select Google account
- Permission screen shows calendar access request
- Successfully redirected to `/dashboard`
- User session created
- User name displayed in header

**Verification**:
```javascript
// Check in browser console
console.log(document.cookie); // Should contain session cookie
```

**Common Issues**:
- **Issue**: OAuth error "redirect_uri_mismatch"
  - **Fix**: Verify `NEXTAUTH_URL` matches Google Console settings
- **Issue**: "Invalid client" error
  - **Fix**: Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

### 2.2 Mock Account Sign In

**Test Case**: User signs in with mock account

**Steps**:
1. Navigate to http://localhost:3000
2. Click "Use Mock Account" button

**Expected Results**:
- Immediately redirected to `/dashboard`
- Mock user session created
- Can access all features (except Google Calendar sync)

**Use Case**: Testing without Google account

---

### 2.3 Session Persistence

**Test Case**: Session persists across page refreshes

**Steps**:
1. Sign in successfully
2. Refresh the page (F5)
3. Navigate to different pages
4. Close and reopen browser tab

**Expected Results**:
- Remain signed in after refresh
- No redirect to landing page
- Session data intact

---

### 2.4 Sign Out

**Test Case**: User signs out successfully

**Steps**:
1. While signed in, click user menu
2. Click "Sign Out" button

**Expected Results**:
- Redirected to landing page
- Session cleared
- Cannot access protected routes
- Attempting to visit `/dashboard` redirects to home

---

## 3. Calendar Integration Testing

### 3.1 Google Calendar Connection

**Test Case**: Connect Google Calendar account

**Steps**:
1. Sign in to application
2. Navigate to Dashboard
3. Click "Connect Google Calendar" (if not connected)
4. Complete OAuth flow
5. Grant calendar permissions

**Expected Results**:
- OAuth flow completes
- Account connected successfully
- Toast notification: "Calendar connected"
- Events begin syncing

**Verification**:
```sql
-- Check database
SELECT * FROM connected_accounts WHERE user_id = 'your-user-id';
```

---

### 3.2 Event Synchronization

**Test Case**: Events sync from Google Calendar

**Prerequisites**: Google Calendar with existing events

**Steps**:
1. Connect Google Calendar
2. Navigate to `/calendar` page
3. Wait for sync to complete

**Expected Results**:
- All Google Calendar events visible
- Events positioned correctly by time
- Event titles match Google Calendar
- Event colors applied
- Multi-day events span correctly

**Verification Checklist**:
- [ ] Past events visible (if in view range)
- [ ] Today's events visible
- [ ] Future events visible
- [ ] All-day events at top
- [ ] Recurring events show correctly

**Test Data**: Create test events in Google Calendar:
```
- "Morning Standup" - 9:00 AM - 9:30 AM (recurring daily)
- "Lunch Break" - 12:00 PM - 1:00 PM
- "Team Meeting" - 2:00 PM - 3:00 PM
- "All Day Event" - All day
```

---

### 3.3 Event Display

**Test Case**: Events display correctly on calendar grid

**Steps**:
1. View calendar with multiple events
2. Check different time slots
3. Verify overlapping events

**Expected Results**:
- Events positioned at correct times
- Event height reflects duration
- Overlapping events side-by-side
- Event text readable
- Hover shows full details

**Edge Cases to Test**:
- [ ] Very short events (15 min)
- [ ] Very long events (4+ hours)
- [ ] Events starting/ending at odd times (9:17 AM)
- [ ] Overlapping events (3+ at same time)
- [ ] Events spanning midnight

---

### 3.4 Drag & Drop Rescheduling

**Test Case**: Drag event to new time slot

**Steps**:
1. Navigate to calendar page
2. Click and hold on an event
3. Drag to different time slot
4. Release mouse

**Expected Results**:
- Event shows drag preview
- Drop zones highlight
- Event moves to new position
- Toast notification: "Event updated"
- Change syncs to Google Calendar
- Google Calendar reflects new time

**Verification**:
1. Check Google Calendar web interface
2. Verify event time changed
3. Refresh Calendar.ai page
4. Verify change persists

**Performance**:
- Drag should be smooth (60fps)
- No lag or stuttering
- Immediate visual feedback

---

### 3.5 Event Details Popover

**Test Case**: View event details

**Steps**:
1. Click on any calendar event
2. View popover

**Expected Results**:
- Popover opens
- Shows event title
- Shows date and time
- Shows location (if any)
- Shows attendees (if any)
- "Add Notes" button visible
- "Reschedule" button visible (if attendees)

---

## 4. Task Management Testing

### 4.1 Task Creation

**Test Case**: Create a new task

**Steps**:
1. Navigate to `/calendar` page
2. Locate task sidebar on right
3. Type task title in input field
4. Press Enter or click Add button

**Expected Results**:
- Task appears in sidebar immediately
- Task has "todo" status
- Task persists after page refresh
- No duplicate tasks created

**Test Cases**:
```
- "Review pull requests"
- "Write documentation"
- "Call client about project"
- "Prepare presentation slides"
```

**Verification**:
```sql
-- Check database
SELECT * FROM tasks WHERE user_id = 'your-user-id';
```

---

### 4.2 Task Timeblocking

**Test Case**: Drag task onto calendar

**Steps**:
1. Create a task in sidebar
2. Click and drag task
3. Drop onto calendar time slot
4. Release

**Expected Results**:
- Task creates calendar event
- Event appears on calendar
- Event syncs to Google Calendar
- Task status changes to "scheduled"
- Task shows allocated time
- Event linked to task

**Verification**:
- Check Google Calendar for new event
- Event title matches task title
- Event duration reasonable (30-60 min default)

---

### 4.3 Task Completion

**Test Case**: Mark task as complete

**Steps**:
1. Click checkbox next to task
2. Observe changes

**Expected Results**:
- Checkbox fills
- Task marked complete
- Visual indication (strikethrough or fade)
- Status persists after refresh

---

### 4.4 Task Deletion

**Test Case**: Delete a task

**Steps**:
1. Hover over task
2. Click delete/trash icon
3. Confirm deletion (if prompted)

**Expected Results**:
- Task removed from sidebar
- Deletion persists after refresh
- Associated calendar event handled appropriately

---

## 5. AI Features Testing

### 5.1 Shield Up (Focus Blocks)

**Test Case**: Create AI-powered focus blocks

**Prerequisites**: 
- Google Calendar connected
- Some existing events on calendar

**Steps**:
1. Navigate to `/calendar` page
2. Click "Shield Up" button in header
3. Wait for AI processing

**Expected Results**:
- Loading indicator shows
- AI analyzes calendar
- Creates "🛡️ Deep Work" events
- Events placed in optimal time slots
- Events sync to Google Calendar
- Toast notification: "Focus blocks created"

**Verification**:
- Check created events are 2-4 hours long
- Events don't overlap existing meetings
- Events respect working hours
- Events consider energy zones (if configured)

**Edge Cases**:
- [ ] No available slots → Shows error message
- [ ] Calendar full → Suggests next available day
- [ ] Weekend → Respects weekend preferences

---

### 5.2 Focus Defense (Recommendations)

**Test Case**: View AI focus session recommendations

**Steps**:
1. Navigate to `/dashboard` page
2. Locate "Focus Suggestions" widget
3. View recommendations

**Expected Results**:
- Shows top 3 recommended slots
- Each shows:
  - Date and time
  - Duration
  - Quality score (0-100)
  - Energy level indicator
  - "Book" button

**Test Booking**:
1. Click "Book" on a recommendation
2. Verify event created
3. Check Google Calendar sync

**Quality Score Factors**:
- High energy time = higher score
- Longer duration = higher score
- Morning slots = bonus points
- No conflicts = required

---

### 5.3 Smart Input (Natural Language)

**Test Case**: Create event from natural language

**Steps**:
1. Navigate to `/calendar` page
2. Locate Smart Input field at top
3. Type natural language phrase
4. Click "Parse" button
5. Review preview
6. Click "Create Event"

**Test Cases**:

| Input | Expected Output |
|-------|----------------|
| "Lunch tomorrow at noon" | Event on next day, 12:00 PM - 1:00 PM |
| "Team meeting next Monday 2pm" | Event on next Monday, 2:00 PM - 3:00 PM |
| "Coffee Friday morning" | Event on Friday, 9:00 AM - 9:30 AM |
| "Dentist on Jan 25 at 3:30pm" | Event on Jan 25, 3:30 PM - 4:30 PM |
| "Workout tomorrow 6am for 1 hour" | Event tomorrow, 6:00 AM - 7:00 AM |

**Verification**:
- [ ] Date parsed correctly
- [ ] Time parsed correctly
- [ ] Duration inferred reasonably
- [ ] Confidence score shown
- [ ] Preview accurate
- [ ] Event created successfully
- [ ] Syncs to Google Calendar

**Error Handling**:
- Invalid input → Shows error message
- Ambiguous input → Lower confidence score
- Past dates → Warning or error

---

### 5.4 Meeting Intelligence

**Test Case**: Extract action items from meeting notes

**Prerequisites**: Calendar event exists

**Steps**:
1. Click on calendar event
2. Click "Add Notes" button
3. Paste or type meeting notes
4. Click "Extract Action Items with AI"
5. Wait for processing
6. Review extracted items
7. Select items to convert to tasks
8. Click "Save Notes & Create Tasks"

**Test Input**:
```
Team discussed Q1 roadmap priorities. Sarah will prepare 
design mockups by Friday. John agreed to review the API 
documentation and send feedback by Wednesday. We decided 
to move forward with Option B for the database migration. 
Next meeting scheduled for Jan 25 to review progress.
```

**Expected Extraction**:

**Summary**: "Team aligned on Q1 roadmap priorities and assigned initial tasks for design and documentation review."

**Action Items**:
1. **Sarah**: Prepare design mockups
   - Due: Friday
   - Priority: High
   - Confidence: 95%

2. **John**: Review API documentation and send feedback
   - Due: Wednesday
   - Priority: Medium
   - Confidence: 90%

**Decisions**:
- Move forward with Option B for database migration

**Key Points**:
- Q1 roadmap discussion
- Design mockups needed
- API documentation review

**Verification**:
- [ ] Summary is accurate
- [ ] Action items extracted correctly
- [ ] Assignees identified
- [ ] Deadlines parsed
- [ ] Priorities assigned
- [ ] Confidence scores reasonable

**Task Creation**:
- [ ] Tasks created in sidebar
- [ ] Task titles match action items
- [ ] Due dates set correctly
- [ ] Linked to source meeting

---

### 5.5 AI Chat

**Test Case**: Chat with AI about calendar

**Steps**:
1. Navigate to `/dashboard` page
2. Locate chat widget
3. Type question
4. Send message
5. Wait for AI response

**Test Questions**:

| Question | Expected Response Type |
|----------|----------------------|
| "What's on my calendar today?" | List of today's events |
| "When is my next meeting?" | Next upcoming event |
| "Do I have time for a 1-hour meeting tomorrow?" | Available time slots |
| "Summarize my week" | Weekly overview |
| "When am I most productive?" | Energy zone insights |

**Verification**:
- [ ] Responses are relevant
- [ ] Calendar context included
- [ ] Suggestions are helpful
- [ ] No hallucinations
- [ ] Proper formatting

---

## 6. Analytics Testing

### 6.1 Analytics Page Load

**Test Case**: Access analytics dashboard

**Steps**:
1. Click "Analytics" in sidebar
2. Wait for page load

**Expected Results**:
- Page loads without errors
- No infinite loading spinner
- All tabs visible
- Default tab shows content

**Common Issues**:
- **Issue**: Stuck on loading
  - **Check**: `session.user.id` is defined
  - **Fix**: Sign out and sign back in

---

### 6.2 Weekly Overview

**Test Case**: View weekly metrics

**Prerequisites**: At least 7 days of calendar data

**Steps**:
1. Navigate to Analytics page
2. Click "Overview" tab
3. View metrics

**Expected Results**:
- Stacked bar chart displays
- Shows last 7 days
- Metrics include:
  - Meeting hours
  - Focus time
  - Free time
- Colors distinct
- Hover shows details
- Total hours add up correctly

**Verification**:
- Manual calculation matches displayed metrics
- Chart renders without errors
- Data updates when calendar changes

---

### 6.3 Focus Trends

**Test Case**: View focus time trends

**Steps**:
1. Navigate to Analytics page
2. Click "Focus" tab
3. View trend chart

**Expected Results**:
- Area chart displays
- Shows trend over time
- Y-axis shows hours
- X-axis shows dates
- Smooth curve
- Tooltip on hover

---

### 6.4 AI Insights

**Test Case**: View AI-generated insights

**Steps**:
1. Navigate to Analytics page
2. Click "Insights" tab
3. Read insights

**Expected Results**:
- Multiple insights displayed
- Insights are relevant
- Based on actual calendar data
- Actionable recommendations
- No generic placeholders

**Example Insights**:
- "You have 40% more meetings on Mondays"
- "Your most productive time is 9-11 AM"
- "Consider blocking focus time on Tuesday afternoons"

---

## 7. Settings Testing

### 7.1 Calendar Preferences

**Test Case**: Configure calendar settings

**Steps**:
1. Navigate to `/settings` page
2. Click "Calendar" tab
3. Modify settings:
   - Default view: Week
   - Working hours: 9 AM - 5 PM
   - Show weekends: Yes
   - First day of week: Sunday
4. Click "Save Settings"

**Expected Results**:
- Toast notification: "Settings saved"
- Settings persist after refresh
- Calendar view reflects changes
- Working hours affect Shield Up

---

### 7.2 Energy Zones

**Test Case**: Configure energy zones

**Steps**:
1. Navigate to `/settings` page
2. Click "Energy Zones" tab
3. Click "Morning Person" template
4. View visual timeline
5. Click "Save Energy Zones"

**Expected Results**:
- Timeline updates immediately
- Zones color-coded:
  - High energy: Green
  - Medium energy: Yellow
  - Low energy: Gray
- Zone list shows details
- Settings persist after refresh
- Focus Defense uses new zones

**Custom Zones**:
Test creating custom energy zones (future feature)

---

## 8. Performance Testing

### 8.1 Page Load Times

**Test Case**: Measure page load performance

**Tools**: Chrome DevTools Performance tab

**Metrics to Measure**:
- Landing page: < 2s
- Dashboard: < 3s
- Calendar: < 3s
- Analytics: < 4s

**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Disable cache
4. Reload page
5. Check "DOMContentLoaded" time

**Expected Results**:
- All pages load within target times
- No render-blocking resources
- Images load progressively

---

### 8.2 Interaction Performance

**Test Case**: Measure interaction responsiveness

**Interactions to Test**:
- Button clicks: < 100ms response
- Drag & drop: 60fps smooth
- Modal open/close: < 200ms
- Form input: No lag

**Tools**: Chrome DevTools Performance profiler

**Steps**:
1. Start recording
2. Perform interaction
3. Stop recording
4. Analyze flame graph

**Expected Results**:
- No long tasks (> 50ms)
- Smooth 60fps animations
- No layout thrashing

---

### 8.3 Data Handling

**Test Case**: Handle large datasets

**Test Scenarios**:
- 50+ calendar events
- 20+ tasks
- 30 days of analytics data

**Steps**:
1. Create test data (or use real account)
2. Load calendar page
3. Scroll through events
4. Interact with tasks

**Expected Results**:
- No lag or stuttering
- Smooth scrolling
- Fast filtering/searching
- No memory leaks

**Monitoring**:
```javascript
// Check memory usage in console
console.log(performance.memory);
```

---

## 9. Security Testing

### 9.1 Authentication Security

**Test Case**: Verify authentication is secure

**Tests**:
- [ ] Cannot access `/dashboard` when logged out
- [ ] Session expires after reasonable time
- [ ] OAuth tokens not exposed in client
- [ ] No sensitive data in localStorage
- [ ] CSRF protection enabled

**Verification**:
```javascript
// Check localStorage
console.log(localStorage);
// Should not contain tokens or secrets
```

---

### 9.2 Data Isolation

**Test Case**: Users can only see their own data

**Steps**:
1. Sign in as User A
2. Note user ID
3. Sign out
4. Sign in as User B
5. Verify cannot see User A's data

**Expected Results**:
- Each user sees only their events
- Each user sees only their tasks
- No data leakage between accounts

---

## 10. Bug Reporting

### Bug Report Template

When you find a bug, document it thoroughly:

```markdown
## Bug Report

**Title**: [Brief, descriptive title]

**Severity**: 
- [ ] Critical (App crashes, data loss)
- [ ] High (Feature broken, major UX issue)
- [ ] Medium (Feature partially works)
- [ ] Low (Minor visual issue)

**Environment**:
- Browser: [Chrome 120, Firefox 121, etc.]
- OS: [Windows 11, macOS 14, etc.]
- Screen Size: [1920x1080, etc.]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[Attach screenshots if applicable]

**Console Errors**:
```
[Paste any console errors]
```

**Additional Context**:
[Any other relevant information]

**Possible Fix** (optional):
[If you have ideas]
```

### Common Issues & Solutions

**Issue**: Tasks don't persist after refresh
- **Cause**: `session.user.id` undefined
- **Solution**: Sign out and sign back in

**Issue**: Google Calendar events don't sync
- **Cause**: OAuth token expired
- **Solution**: Reconnect Google Calendar

**Issue**: Analytics stuck loading
- **Cause**: Missing session data
- **Solution**: Clear cookies, sign in again

**Issue**: Drag & drop not working
- **Cause**: Browser compatibility
- **Solution**: Try different browser, check for errors

---

## Testing Completion

### Sign-off Checklist

- [ ] All critical features tested
- [ ] All bugs documented
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production

**Tester Name**: _______________
**Date**: _______________
**Overall Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Work

**Notes**:
_______________________________________
_______________________________________
_______________________________________

---

## Appendix: Test Data

### Sample Events
```
Morning Standup - 9:00 AM - 9:30 AM (Daily)
Team Sync - 10:00 AM - 11:00 AM (Weekly)
Lunch Break - 12:00 PM - 1:00 PM (Daily)
Client Call - 2:00 PM - 3:00 PM
Code Review - 3:30 PM - 4:30 PM
```

### Sample Tasks
```
Review pull requests
Update documentation
Prepare presentation
Call client
Write tests
Refactor authentication
```

### Sample Meeting Notes
```
Discussed project timeline. Alice will complete the frontend 
by Thursday. Bob to finish API integration by Friday. 
Decided to use PostgreSQL for the database. Next review 
meeting on Monday at 10 AM.
```

---

**End of Testing Guide**
