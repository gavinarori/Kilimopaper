# Agri-Export Organizer

A comprehensive document organizer and reminder system for Kenyan agricultural exports, featuring a modern calendar interface and authentication system.

## Features

### 🔐 Authentication System
- **User Registration**: Create new accounts with email and password
- **User Login**: Secure authentication with JWT tokens
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Logout Functionality**: Secure session termination

### 📅 Event Calendar
- **Multiple Views**: Month, Week, Day, and Agenda views
- **Drag & Drop**: Intuitive event management
- **Real-time Updates**: Instant synchronization with backend
- **Responsive Design**: Works on desktop and mobile devices

### 🔔 Reminder System
- **Integrated Calendar**: Reminders appear as calendar events
- **Multiple Channels**: Email and SMS notification support
- **CRUD Operations**: Create, read, update, and delete reminders
- **Visual Indicators**: Color-coded reminders by notification type

### 🎨 Modern UI
- **Beautiful Design**: Clean, modern interface with dark mode support
- **Responsive Layout**: Optimized for all screen sizes
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Smooth user experience with loading indicators

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons
- **Date-fns**: Date manipulation utilities
- **Sonner**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **Zod**: Schema validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp ENV.EXAMPLE .env
```

4. Update `.env` with your configuration:
```env
PORT=4000
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://localhost:27017/agri_export
MONGO_DB=agri_export
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Authentication
1. Visit the homepage and click "Create Account" to register
2. Or click "Sign In" if you already have an account
3. After successful authentication, you'll be redirected to the dashboard

### Creating Reminders
1. Navigate to the Calendar view in the dashboard
2. Click "New Event" or double-click on a time slot
3. Fill in the reminder details and save
4. The reminder will appear as a calendar event

### Managing Reminders
- **View All**: Visit the Reminders page to see all your reminders
- **Edit**: Click on any calendar event to edit details
- **Delete**: Use the delete button in the event dialog or reminders list
- **Drag & Drop**: Move events by dragging them to new times/dates

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Reminders
- `GET /reminders` - Get all reminders
- `POST /reminders` - Create new reminder
- `PUT /reminders/:id` - Update reminder
- `DELETE /reminders/:id` - Delete reminder
- `GET /reminders/due` - Get due reminders

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── config/          # Configuration files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── hooks/           # Custom React hooks
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
