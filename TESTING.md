# Manual Testing Checklist for Calendar.ai

## Authentication
- [ ] Sign in with Google OAuth
- [ ] Sign in with Mock Account (Credentials provider)
- [ ] Sign out successfully
- [ ] Session persists on page reload
- [ ] User ID is present in session after sign-in

## Calendar Features
- [ ] Events display correctly on calendar grid
- [ ] Drag-and-drop event rescheduling works
- [ ] Event details popover shows on click
- [ ] Event creation works (if implemented)
- [ ] Events sync from Google Calendar

## Shield Up / Focus Blocks
- [ ] "Shield Up" button creates focus block
- [ ] Focus block appears on calendar
- [ ] Error message shown if no slots available
- [ ] Error message shown if no calendar connected

## Focus Defense (AI Recommendations)
- [ ] Focus suggestions appear on dashboard
- [ ] Top 3 slots shown with quality scores
- [ ] Energy level badges display correctly
- [ ] "Book" button creates focus session
- [ ] Calendar updates after booking

## Task Management
- [ ] Create new task in sidebar
- [ ] Task appears in task list immediately
- [ ] Task persists after page reload
- [ ] Drag task to calendar creates timeblock
- [ ] Task status updates to "scheduled"

## Analytics Dashboard
- [ ] Navigate to /analytics page
- [ ] 4 tabs visible (Overview, Focus, Insights, Ask AI)
- [ ] Overview tab shows charts or empty state
- [ ] Focus tab shows focus time trends
- [ ] Insights tab shows AI recommendations
- [ ] Ask AI tab accepts queries

## AI Chat (Context Awareness)
- [ ] Type query in Ask AI tab
- [ ] Response streams in real-time
- [ ] Suggested queries work on click
- [ ] Responses are contextually relevant
- [ ] Error shown if API key not configured

## Responsive Design
- [ ] Mobile (375px width):
  - [ ] Sidebar collapses or stacks
  - [ ] Calendar is scrollable
  - [ ] All features accessible
- [ ] Tablet (768px width):
  - [ ] Layout adapts appropriately
  - [ ] Touch interactions work
- [ ] Desktop (1920px width):
  - [ ] Optimal layout
  - [ ] All features visible

## Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Invalid inputs are validated
- [ ] Loading states appear during operations
- [ ] Error boundaries catch React errors

## Performance
- [ ] Initial page load < 3 seconds
- [ ] Calendar renders smoothly
- [ ] Drag-and-drop is responsive
- [ ] No console errors in production mode

## Data Persistence
- [ ] Tasks persist in database
- [ ] Events sync bidirectionally
- [ ] User preferences saved
- [ ] Energy zones persist

## Edge Cases
- [ ] Empty calendar (no events)
- [ ] Empty task list
- [ ] No calendar connected
- [ ] Expired OAuth token
- [ ] Network offline
- [ ] Very long event titles
- [ ] Overlapping events

## Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Notes
- Record any bugs found during testing
- Note performance issues
- Suggest UX improvements
