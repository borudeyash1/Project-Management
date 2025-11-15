# Proxima Project Management Suite

A comprehensive project management application built with React (TypeScript) frontend and Node.js (TypeScript) backend.

## Project Structure

```
proxima-project-management/
├── client/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js TypeScript Backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── package.json
└── README.md
```

## Features

### Frontend (Client)
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management
- **Responsive design** for all screen sizes

### Backend (Server)
- **Node.js** with TypeScript
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd proxima-project-management
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/proxima
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key-here
   JWT_REFRESH_EXPIRE=30d
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the frontend client**
   ```bash
   cd client
   npm start
   ```
   Client will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/settings` - Update user settings
- `DELETE /api/users/account` - Delete user account

### Workspaces
- `GET /api/workspaces` - Get user workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Projects
- `GET /api/projects` - Get projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Development

### TypeScript Configuration
Both client and server are configured with TypeScript for type safety and better development experience.

### Code Structure
- **Components**: Reusable UI components with TypeScript interfaces
- **Context**: Global state management using React Context API
- **Services**: API communication layer with error handling
- **Types**: Shared TypeScript interfaces between client and server
- **Middleware**: Express middleware for authentication, validation, and error handling

### Database Models
- **User**: User accounts with authentication and profile information
- **Workspace**: Team workspaces with member management
- **Project**: Projects within workspaces with team assignments
- **Task**: Tasks within projects with comments, attachments, and time tracking

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- Protected routes with role-based access control

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is licensed under the ISC License.