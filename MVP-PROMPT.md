# Programme Management & RFP Tracker - MVP Prompt

Use this prompt to create a programme management application for tracking RFP (Request for Proposal) selection processes, vendor evaluations, and project milestones.

---

## Prompt for AI Assistant

```
Create a single-page web application for Programme Management and RFP (Request for Proposal) tracking. This should be a complete, self-contained HTML file with embedded CSS and JavaScript - no frameworks required.

## Core Requirements

### Technology Stack
- **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (no React, Vue, or Angular)
- **Charts:** Chart.js via CDN (https://cdn.jsdelivr.net/npm/chart.js)
- **Storage:** Browser localStorage for data persistence
- **Design:** Responsive (works on desktop, tablet, mobile)
- **Theme:** Support both light and dark mode with CSS variables

### Application Structure
Create a single HTML file containing:
1. All CSS styles in a <style> block
2. All HTML structure
3. All JavaScript in a <script> block at the end

---

## Features to Implement

### 1. Dashboard (Home Tab)
Display key performance indicators:
- Task completion percentage (calculated from tasks)
- Total vendor count
- Days until target date (calculated dynamically)
- Active risk count (risks with RAG status "red" or "amber")
- Pie chart showing task status distribution (Not Started, In Progress, Done)
- List of upcoming tasks (next 7 days)
- List of high-priority risks (red status)

### 2. Work Plan / Task Management
- Table/list of all tasks with columns: Name, Owner, Due Date, Status, Phase
- Task statuses: Not Started, In Progress, Done
- Task phases: Discovery, Documentation, Evaluation, Selection (or customize)
- Filter tasks by status and phase
- Search functionality
- Add/Edit/Delete tasks via modal dialogs
- Click to toggle task completion

### 3. Calendar View
- Monthly calendar grid showing tasks on their due dates
- Navigation buttons to change months
- Color-coded dots for task status
- Click on date to see tasks for that day

### 4. Gantt Chart
- Visual timeline showing tasks as horizontal bars
- Group tasks by phase
- Show progress for in-progress tasks
- Span from project start to end date

### 5. Milestones Tracker
- List of key project milestones with target dates
- Status for each milestone (Not Started, In Progress, Complete)
- Visual timeline representation
- Add/Edit/Delete milestones

### 6. Evaluation Framework
- Define evaluation criteria with weights (must total 100%)
- Each criterion has: Name, Weight (%), Good Indicators, Red Flags
- Add/Edit/Delete criteria
- Validation to ensure weights sum to 100%

### 7. Vendor Scoring Matrix
- Table with vendors as rows and evaluation criteria as columns
- Score each vendor 0-10 on each criterion
- Calculate weighted total score automatically
- Formula: Sum of (Score/10 × Weight%)
- Rank vendors by total score
- Color-code scores (green=high, yellow=medium, red=low)

### 8. Vendor Pipeline Management
- Vendor cards showing: Name, Type, Tier, Status
- Vendor tiers: Tier 1, Tier 2, Niche (or customize)
- Pipeline statuses: Longlist → Warm → Shortlist → Finalist → Winner
- Filter by tier and status
- Add/Edit/Delete vendors
- Track strengths and relevance for each vendor

### 9. Document Repository
- Folder structure organizing documents by category
- Document statuses: Template, Draft, Final
- Expandable/collapsible folders
- Add/Edit/Delete documents
- Track document names and their status

### 10. Meeting Management
- List of scheduled meetings
- Meeting details: Title, Date, Time, Duration, Location, Attendees, Agenda
- Meeting types: Internal, Workshop, Review, Steering Committee, Vendor
- Monthly calendar view of meetings
- Meeting notes feature:
  - Add notes linked to specific meetings
  - Rich text content
  - Optional file attachment (store as base64 in localStorage)

### 11. Risk Register
- List of risks with: Description, Impact, Owner, Due Date, RAG Status, Mitigation
- RAG statuses: Red, Amber, Green (with color coding)
- Probability levels: High, Medium, Low
- Impact levels: High, Medium, Low
- 3×3 Risk Matrix visualization (Probability vs Impact)
- Filter by RAG status
- Add/Edit/Delete risks

### 12. Decision Log
- Track key programme decisions
- Fields: Title, Description, Rationale, Owner, Date, Status
- Decision statuses: Pending, Approved, Deferred, Rejected
- Add/Edit/Delete decisions
- Search functionality

### 13. Stakeholder Management
- List of stakeholders: Name, Role, Department, Email
- Influence and Interest levels (for stakeholder mapping)
- RACI Matrix:
  - Rows: Activities/deliverables
  - Columns: Stakeholders
  - Values: R (Responsible), A (Accountable), C (Consulted), I (Informed)
  - Color-coded cells
- Add/Edit/Delete stakeholders and activities

### 14. Reports Generation
- Generate status report (summary of tasks, risks, decisions)
- Generate vendor analysis report (tier breakdown, scores)
- Generate risk report (RAG summary, mitigations)
- Export options: Print, Download as text
- Report preview in modal

### 15. Settings & Data Management
- Toggle dark/light theme
- Export all data as JSON file
- Import data from JSON file
- Reset to default data with confirmation
- Display app version

---

## Data Models

### Task
```javascript
{
  id: "unique-id",
  name: "Task name",
  owner: "Owner name",
  dueDate: "YYYY-MM-DD",
  status: "notstarted" | "inprogress" | "done",
  phase: "discovery" | "documentation" | "evaluation" | "selection",
  description: "Task description"
}
```

### Vendor
```javascript
{
  id: "unique-id",
  name: "Vendor name",
  type: "System Integrator",
  tier: "Tier 1" | "Tier 2" | "Niche",
  status: "longlist" | "warm" | "shortlist" | "finalist" | "winner",
  strengths: "Key strengths",
  relevance: "Why relevant"
}
```

### Risk
```javascript
{
  id: "unique-id",
  risk: "Risk description",
  impact: "Impact description",
  owner: "Risk owner",
  dueDate: "YYYY-MM-DD",
  rag: "red" | "amber" | "green",
  mitigation: "Mitigation plan",
  probability: "High" | "Medium" | "Low",
  impactLevel: "High" | "Medium" | "Low"
}
```

### Milestone
```javascript
{
  id: "unique-id",
  title: "Milestone name",
  date: "YYYY-MM-DD",
  status: "notstarted" | "inprogress" | "complete"
}
```

### Evaluation Criterion
```javascript
{
  id: "unique-id",
  criterion: "Criterion name",
  weight: 25, // percentage
  goodLooks: "What good looks like",
  redFlags: "Warning signs"
}
```

### Meeting
```javascript
{
  id: "unique-id",
  title: "Meeting title",
  date: "YYYY-MM-DD",
  time: "HH:MM",
  duration: "1 hour",
  location: "Location or link",
  attendees: "List of attendees",
  agenda: "Meeting agenda",
  type: "internal" | "workshop" | "review" | "steering" | "vendor"
}
```

### Stakeholder
```javascript
{
  id: "unique-id",
  name: "Stakeholder name",
  role: "Job title",
  department: "Department",
  email: "email@example.com",
  influence: "High" | "Medium" | "Low",
  interest: "High" | "Medium" | "Low",
  notes: "Additional notes"
}
```

---

## UI/UX Requirements

### Navigation
- Sidebar or tab-based navigation
- Active tab highlighting
- Smooth transitions between views

### Modals
- Use modal dialogs for Add/Edit forms
- Close on clicking outside or X button
- Form validation before save

### Notifications
- Toast notifications for success/error messages
- Confirmation dialogs for delete actions

### Responsive Design
- Works on screens from 320px to 1920px
- Collapsible sidebar on mobile
- Touch-friendly buttons and inputs

### Dark Mode
- Use CSS variables for colors
- Store theme preference in localStorage
- Toggle button in header or settings

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Skip to main content link

---

## Sample Initial Data

Include sample data to demonstrate the application:

### Sample Tasks (5-10 tasks across different phases)
### Sample Vendors (3-5 vendors of different tiers)
### Sample Risks (2-3 risks with different RAG statuses)
### Sample Milestones (4-6 key milestones)
### Sample Evaluation Criteria (4-6 criteria totaling 100%)
### Sample Stakeholders (3-5 stakeholders with RACI assignments)

---

## Key Functions to Implement

### Data Persistence
```javascript
function saveState() {
  localStorage.setItem('appData', JSON.stringify(appData));
}

function loadState() {
  const saved = localStorage.getItem('appData');
  if (saved) {
    appData = JSON.parse(saved);
  }
}
```

### ID Generation
```javascript
function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
```

### Tab Switching
```javascript
function switchTab(tabName) {
  // Hide all tab contents
  // Show selected tab content
  // Update active nav item
  // Save current tab to localStorage
}
```

### Score Calculation
```javascript
function calculateVendorScore(vendorId) {
  let totalScore = 0;
  evaluationCriteria.forEach(criterion => {
    const score = vendorScores[vendorId]?.[criterion.id] || 0;
    totalScore += (score / 10) * criterion.weight;
  });
  return totalScore.toFixed(1);
}
```

### XSS Prevention
```javascript
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

---

## Styling Guidelines

### Color Scheme (Light Mode)
- Primary: #2563eb (blue)
- Success: #22c55e (green)
- Warning: #f59e0b (amber)
- Danger: #ef4444 (red)
- Background: #ffffff
- Text: #1f2937
- Border: #e5e7eb

### Color Scheme (Dark Mode)
- Primary: #3b82f6
- Background: #1f2937
- Card Background: #374151
- Text: #f9fafb
- Border: #4b5563

### Typography
- Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Base Size: 14px
- Headings: Bold, larger sizes
- Code: monospace font

---

## Deployment

The application should work by:
1. Simply opening the HTML file in a browser (file://)
2. Hosting on any static file server
3. Deploying to Vercel, Netlify, or GitHub Pages

No build process, no npm install, no server required for basic functionality.

---

## Optional Enhancements (if time permits)

1. **File Upload API** - Vercel Blob or similar for cloud file storage
2. **Export to Word/PowerPoint** - Generate downloadable documents
3. **Email Integration** - Quick links to Outlook/Teams
4. **Print Styles** - CSS @media print for clean printing
5. **Keyboard Shortcuts** - Quick navigation and actions
6. **Drag-and-Drop** - Reorder tasks, move vendors through pipeline
7. **Charts** - Additional visualizations (bar charts, line graphs)
8. **Search** - Global search across all data

---

## Project Customization

Before generating the code, ask the user for:
1. **Project Name** - What should the app be called?
2. **Timeline** - Start and end dates for the programme
3. **Phases** - What phases does the project have?
4. **Vendor Types** - What types/tiers of vendors to track?
5. **Evaluation Criteria** - What criteria to evaluate vendors on?
6. **Key Milestones** - What are the major milestones?
7. **Stakeholders** - Who are the key stakeholders and their roles?

This will allow generating customized initial data for the specific project.
```

---

## Usage Instructions

1. Copy the prompt above and paste it into an AI assistant (Claude, ChatGPT, etc.)
2. Answer the customization questions when prompted
3. The AI will generate a complete HTML file
4. Save the file with a `.html` extension
5. Open in any web browser
6. All data is saved automatically in your browser's localStorage

---

## Tips for Best Results

- **Be specific** about your project timeline and phases
- **List your vendors** if you already know them
- **Define clear evaluation criteria** with appropriate weights
- **Identify stakeholders** and their roles early
- **Start with sample data** and customize as you go

---

## Maintenance

- **Backup your data** regularly using the Export feature
- **Import data** when switching browsers or devices
- **Reset to defaults** if data becomes corrupted
- **Use dark mode** for late-night work sessions

---

*This MVP template was created based on the HexagonRFP application architecture.*
*Version: 1.0 | Last Updated: December 2024*
