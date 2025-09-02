# Troubleshooting Guide

## Common Issues and Solutions

### 1. 404 Error on Auth Endpoints

**Problem**: Getting 404 errors when trying to register or login
```
Request Method: POST
Status Code: 404 Not Found
URL: http://localhost:4000/auth/register
```

**Solution**: 
- Make sure the backend server is running on port 4000
- The correct endpoints are:
  - `POST http://localhost:4000/api/auth/register`
  - `POST http://localhost:4000/api/auth/login`

### 2. Backend Server Not Starting

**Problem**: Backend server fails to start

**Solutions**:
1. **Check MongoDB**: Make sure MongoDB is running
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod
   ```

2. **Check Port Availability**: Make sure port 4000 is not in use
   ```bash
   lsof -i :4000
   ```

3. **Install Dependencies**: Make sure all dependencies are installed
   ```bash
   cd backend
   npm install
   ```

4. **Check Environment File**: Make sure `.env` file exists
   ```bash
   cd backend
   cp ENV.EXAMPLE .env
   ```

### 3. Frontend Can't Connect to Backend

**Problem**: Frontend shows connection errors

**Solutions**:
1. **Check Backend URL**: Make sure the API base URL is correct
   - Default: `http://localhost:4000`
   - Check `frontend/src/lib/api.ts`

2. **CORS Issues**: Make sure CORS is enabled in backend
   - Backend should have `app.use(cors())`

3. **Network Issues**: Check if both servers are running
   ```bash
   # Check backend
   curl http://localhost:4000/health
   
   # Check frontend
   curl http://localhost:3000
   ```

### 4. Database Connection Issues

**Problem**: Backend can't connect to MongoDB

**Solutions**:
1. **Check MongoDB URI**: Make sure the connection string is correct
   ```env
   MONGO_URI=mongodb://localhost:27017/agri_export
   ```

2. **Check MongoDB Status**: Make sure MongoDB is running
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod
   ```

3. **Create Database**: The database will be created automatically when first used

### 5. Authentication Issues

**Problem**: Login/Register not working

**Solutions**:
1. **Check JWT Secret**: Make sure JWT_SECRET is set in `.env`
   ```env
   JWT_SECRET=your-secret-key-here
   ```

2. **Check Token Storage**: Make sure tokens are being stored properly
   - Check browser localStorage
   - Check browser cookies

3. **Check API Responses**: Use browser dev tools to see API responses

### 6. Frontend Build Issues

**Problem**: Frontend fails to build or run

**Solutions**:
1. **Install Dependencies**: Make sure all dependencies are installed
   ```bash
   cd frontend
   npm install
   ```

2. **Check Node Version**: Make sure you're using Node.js 18+
   ```bash
   node --version
   ```

3. **Clear Cache**: Clear Next.js cache
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

## Quick Start Commands

### Start Both Servers (Recommended)
```bash
./start-dev.sh
```

### Start Backend Only
```bash
cd backend
npm run dev
```

### Start Frontend Only
```bash
cd frontend
npm run dev
```

### Check Server Status
```bash
# Check backend health
curl http://localhost:4000/health

# Check if ports are in use
lsof -i :4000
lsof -i :3000
```

## Environment Setup

### Backend Environment (.env)
```env
PORT=4000
JWT_SECRET=your-secret-key-here
MONGO_URI=mongodb://localhost:27017/agri_export
MONGO_DB=agri_export
```

### Frontend Environment
The frontend will automatically use `http://localhost:4000` as the API base URL.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## Still Having Issues?

1. **Check Logs**: Look at the console output from both servers
2. **Browser Dev Tools**: Check Network tab for failed requests
3. **Database**: Make sure MongoDB is running and accessible
4. **Ports**: Make sure ports 3000 and 4000 are available
5. **Dependencies**: Make sure all npm packages are installed
