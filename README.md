# Proxima - Project Management React Application

A comprehensive project management application built with React, featuring authentication, workspaces, project tracking, and task management.

## Features

- **Authentication System**: Login and registration with form validation
- **Dashboard**: Overview with KPIs, project lists, and upcoming deadlines
- **Workspace Management**: Create, join, and manage workspaces
- **Project Tracking**: Detailed project views with tasks and milestones
- **Task Management**: Task drawer with status updates and comments
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Interactive Modals**: Create workspace wizard, pricing plans, and request forms
- **Real-time Notifications**: Toast notifications for user feedback

## Technology Stack

- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Context API**: State management without external libraries

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/           # React components
│   ├── Auth.js          # Authentication forms
│   ├── Dashboard.js     # Main dashboard
│   ├── Header.js        # Top navigation
│   ├── Sidebar.js       # Side navigation
│   ├── WorkspaceDiscover.js  # Workspace discovery
│   ├── WorkspaceOwner.js     # Workspace management
│   ├── Project.js       # Project details
│   ├── CreateWorkspaceModal.js  # Workspace creation
│   ├── PricingModal.js  # Pricing plans
│   ├── TaskDrawer.js    # Task details drawer
│   ├── RequestChangeModal.js  # Request forms
│   └── ToastContainer.js # Notification system
├── context/
│   └── AppContext.js    # Global state management
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Key Features Implementation

### State Management
- Global state managed with React Context and useReducer
- Centralized state for user authentication, workspaces, projects, and UI state

### Component Architecture
- Modular component structure for maintainability
- Reusable components with proper prop handling
- Conditional rendering based on application state

### Styling
- Tailwind CSS for consistent design system
- Custom CSS variables for theming
- Responsive design with mobile-first approach

### User Experience
- Smooth transitions and animations
- Interactive modals and drawers
- Toast notifications for user feedback
- Form validation and error handling

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.