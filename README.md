# HexagonRFP

A programme management platform for tracking the Hexagon SAP AMS RFP process - from vendor evaluation to final selection.

## Features

- **Dashboard** - Real-time KPIs including task completion, vendor pipeline, and countdown to go-live
- **Work Plan** - Phase-based task management with filtering, search, and status tracking
- **Milestones** - Timeline tracking from kickoff through September 2026 go-live
- **Evaluation Framework** - Weighted scoring criteria with inline editing
- **Vendor Management** - Track 13 system integrators through the selection pipeline
- **Risk Register** - RAG-status risk tracking and mitigation planning
- **Reports** - Generate status reports, vendor analysis, and data exports

## Technology

- Pure HTML5, CSS3, and JavaScript (no frameworks)
- Chart.js for data visualization
- localStorage for browser-based data persistence
- Fully responsive design

## Quick Start

Simply open `Index.html` in any modern browser. No build process, installation, or server required.

## Deployment

### GitHub Pages (Recommended)

1. Go to your repository Settings
2. Navigate to **Pages** in the sidebar
3. Under "Source", select your branch (e.g., `main`)
4. Select folder: `/ (root)`
5. Click **Save**
6. Your site will be live at: `https://damaka72.github.io/HexagonRFP/`

### Other Static Hosting Options

- **Netlify**: Drag and drop the folder or connect your repo
- **Vercel**: Import from GitHub for automatic deploys
- **AWS S3**: Upload `Index.html` to a public S3 bucket
- **Any web server**: Simply serve the HTML file

## Data Storage

All data is stored in your browser's localStorage:
- Data persists across sessions but is browser-specific
- Use the **Export All Data** feature in Reports to backup your data
- Data is not synced across devices or browsers

## Programme Timeline

- **Start Date**: 8 December 2025
- **US Go-Live**: 1 September 2026

## License

Proprietary - Internal use only.
