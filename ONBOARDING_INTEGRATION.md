# Medicae Onboarding Integration - Complete Guide

## Overview

The onboarding system allows new clinics to register and set up their practice, or staff members to join existing clinics using a join code.

## Backend Implementation

### 1. Database Schema Updates

**Practice Schema** (`server/src/models/schemas/Practice.ts`)
- Added `clinicType`: 'general' | 'dental' | 'audiology' | 'mixed'
- Added `modules`: Array of enabled modules
- Added `joinCode`: Unique 8-character code for staff to join
- Added `onboardingCompleted`: Boolean flag
- Added `generateJoinCode()` method

### 2. API Endpoints

**Base URL**: `http://localhost:3000/api/v1/onboarding`

#### Complete Onboarding (Create New Clinic)
```http
POST /onboarding/complete
Content-Type: application/json

{
  "role": "admin",
  "clinicName": "Central Medical Clinic",
  "clinicType": "general",
  "modules": ["appointments", "billing", "lab_results"],
  "firstName": "John",
  "lastName": "Doe",
  "userEmail": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "practiceId": "...",
      "isActive": true
    },
    "practice": {
      "id": "...",
      "name": "Central Medical Clinic",
      "clinicType": "general",
      "modules": ["appointments", "billing", "lab_results"],
      "joinCode": "ABC123XY",
      "onboardingCompleted": true
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### Join Existing Clinic
```http
POST /onboarding/join
Content-Type: application/json

{
  "joinCode": "ABC123XY",
  "role": "doctor",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePass123"
}
```

#### Verify Join Code
```http
GET /onboarding/verify/:joinCode
```

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "practiceName": "Central Medical Clinic",
    "practiceType": "general"
  }
}
```

### 3. Backend Files Created

- `server/src/api/validators/onboarding.validator.ts` - Request validation
- `server/src/services/onboarding/onboarding.service.ts` - Business logic
- `server/src/api/controllers/onboarding.controller.ts` - Request handlers
- `server/src/api/routes/onboarding.routes.ts` - Route definitions

## Frontend Implementation

### 1. API Client

**API Configuration** (`src/lib/api.ts`)
- Axios instance with base URL
- Request interceptor for auth tokens
- Response interceptor for token refresh
- Automatic logout on auth failure

**Onboarding API Client** (`src/lib/api/onboarding.ts`)
- `completeOnboarding(data)` - Create new clinic
- `joinClinic(data)` - Join existing clinic
- `verifyJoinCode(code)` - Verify join code

### 2. React Hook

**useOnboarding Hook** (`src/hooks/useOnboarding.ts`)
- `completeOnboarding()` - Handles full onboarding flow
- `joinClinic()` - Handles joining existing clinic
- `verifyJoinCode()` - Validates join codes
- Stores tokens and user data in localStorage
- Shows toast notifications
- Automatic navigation on success
- Error handling

### 3. Updated Component

**OnboardingFlowConnected** (`src/app/components/OnboardingFlowConnected.tsx`)
- 5-step onboarding process:
  1. Choose Role (Clinic Admin, Doctor, Nurse)
  2. Personal Info (Name, Email, Password)
  3. Clinic Setup (Create or Join)
  4. Clinic Type (General, Dental, Audiology, Mixed)
  5. Enable Modules (Appointments, Billing, Inventory, Lab Results)
- Real-time validation
- Loading states
- Error display
- Progress indicator
- Backend integration

### 4. Frontend Files Created

- `src/lib/api.ts` - API client configuration
- `src/lib/api/onboarding.ts` - Onboarding API methods
- `src/hooks/useOnboarding.ts` - React hook
- `src/app/components/OnboardingFlowConnected.tsx` - Updated component
- `.env.example` - Environment variables template

## Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/medicae

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_ENV=development
```

## Testing the Integration

### 1. Start Backend Server
```bash
cd server
npm run dev
```

### 2. Start Frontend Server
```bash
npm run dev
```

### 3. Test Onboarding Flow

1. Navigate to `http://localhost:5173/onboarding`
2. Choose "Clinic Admin" role
3. Enter personal information
4. Create clinic name
5. Select clinic type
6. Enable desired modules
7. Submit

**Expected Behavior**:
- Success toast notification
- Tokens stored in localStorage
- Automatic redirect to `/clinic`
- User and practice data available

### 4. Test Join Flow

1. Get join code from created practice
2. Navigate to `/onboarding`
3. Choose "Doctor" or "Nurse" role
4. Enter join code
5. Complete registration

## Data Flow

```
User Input → OnboardingFlowConnected
    ↓
useOnboarding Hook
    ↓
Onboarding API Client (axios)
    ↓
Backend API (/api/v1/onboarding/complete)
    ↓
Onboarding Controller
    ↓
Onboarding Service
    ↓
Database (MongoDB)
    - Create Practice
    - Create User
    ↓
Response with tokens
    ↓
Frontend stores tokens
    ↓
Navigate to /clinic
```

## Security Features

1. **Password Validation**: Min 8 chars, uppercase, lowercase, number
2. **JWT Tokens**:
   - Access token: 15 minutes
   - Refresh token: 7 days
3. **Rate Limiting**: Prevents abuse
4. **Input Validation**: Joi schemas on backend
5. **CORS Protection**: Only allowed origins
6. **Token Refresh**: Automatic with axios interceptor

## Module Mappings

Frontend → Backend:
- "Appointments" → "appointments"
- "Billing" → "billing"
- "Inventory" → "inventory"
- "Lab Results" → "lab_results"

Role Mappings:
- "Clinic Admin" → "admin"
- "Doctor" → "doctor"
- "Nurse" → "nurse"

Clinic Type Mappings:
- "General Practice" → "general"
- "Dental" → "dental"
- "Audiology" → "audiology"
- "Mixed Practice" → "mixed"

## Next Steps

1. **Database Setup**: Configure MongoDB and Redis
2. **Testing**: End-to-end testing of onboarding flow
3. **Error Handling**: Add more specific error messages
4. **Join Code UI**: Add UI for entering join code in step 3
5. **Email Verification**: Optional email verification
6. **Practice Settings**: Allow editing after onboarding

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in backend .env matches frontend URL
- Check backend server is running

### Token Not Stored
- Check browser console for errors
- Verify API response format
- Check localStorage permissions

### Database Connection Failed
- Ensure MongoDB is running
- Check `MONGODB_URI` in .env
- Verify network access

### API 404 Errors
- Verify `VITE_API_URL` in frontend .env
- Check backend routes are mounted
- Confirm backend server is running on correct port
