# Medicae - New Multi-Tier Architecture

## Overview

The system now has a **3-tier access structure**:

1. **Super Admin** (You) - Creates clinics via admin panel
2. **Clinic Admins** (1-2 per clinic) - Configure clinic using setup code
3. **Staff** (Doctors, Nurses) - Login with credentials or join with staff code

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN PANEL                        │
│  (You create clinics and generate setup codes)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Clinic Created in Database  │
         │   - Setup Code: 12 chars      │
         │   - Join Code: 8 chars        │
         └───────────┬───────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌─────────────────┐
│ CLINIC ADMIN  │          │  STAFF MEMBERS  │
│ Setup Process │          │  Login/Join     │
└───────────────┘          └─────────────────┘
```

---

## 1. Super Admin Panel

**Location**: `src/admin-panel.html`
**Access**: Open directly in browser
**API Endpoint**: `POST /api/v1/admin/clinics`

### Features:
- ✅ Create new clinics
- ✅ View all clinics
- ✅ View setup codes and join codes
- ✅ Regenerate codes if needed
- ✅ View user counts per clinic

### Usage:

1. Open `src/admin-panel.html` in browser
2. Fill in clinic details:
   - Clinic Name
   - Email
   - Phone
   - Clinic Type (General/Dental/Audiology/Mixed)
   - Optional: City, State
3. Click "Create Clinic"
4. **Copy the Setup Code** (12 characters)
5. Send setup code to clinic administrator

### API Endpoints Created:

```http
POST   /api/v1/admin/clinics                    # Create clinic
GET    /api/v1/admin/clinics                    # List all clinics
GET    /api/v1/admin/clinics/:id                # Get clinic details + codes
POST   /api/v1/admin/clinics/:id/regenerate-setup-code
POST   /api/v1/admin/clinics/:id/regenerate-join-code
```

---

## 2. Clinic Admin Setup

**What Changed**: Onboarding is now a **setup process** for clinic admins.

### Flow:

1. Clinic admin receives **Setup Code** (12 characters)
2. Goes to `/onboarding` (or `/clinic-setup`)
3. Enters setup code
4. Completes profile:
   - Personal info (name, email, password)
   - Clinic configuration (modules, working hours, etc.)
5. Becomes first admin of the clinic

### Role Restrictions:
- **Maximum 1-2 admins per clinic**
- Setup code can only be used by admins
- After setup, admin can:
  - Add doctors/nurses
  - Generate staff join codes
  - Configure clinic settings

---

## 3. Staff Access

### Two Ways to Join:

#### A. Admin Invitation (Preferred)
1. Admin creates user in admin panel
2. Staff receives login credentials
3. Staff logs in directly

#### B. Self-Registration with Join Code
1. Staff has 8-character Join Code
2. Goes to `/join` or `/staff-signup`
3. Enters join code + creates account
4. Role: Doctor or Nurse only (not admin)

### Login Page
**All staff (doctors, nurses, admins) use the same login**:
- Email
- Password
- No role selection needed

---

## Database Schema Changes

### Practice Model Updates:

```typescript
{
  // ... existing fields

  setupCode: string;          // 12 chars - for admin setup
  joinCode: string;          // 8 chars - for staff joining
  setupCompleted: boolean;   // Has admin completed setup?
  onboardingCompleted: boolean; // Is clinic fully configured?

  // Methods
  generateSetupCode(): string;
  generateJoinCode(): string;
}
```

---

## Backend Files Created

### Admin Panel:
- `server/src/services/admin/clinic.service.ts` - Clinic management logic
- `server/src/api/controllers/admin.controller.ts` - Admin API handlers
- `server/src/api/validators/admin.validator.ts` - Validation schemas
- `server/src/api/routes/admin.routes.ts` - Admin routes

### Updated:
- `server/src/models/schemas/Practice.ts` - Added setupCode, setupCompleted
- `server/src/api/routes/index.ts` - Mounted admin routes

---

## Frontend Files to Update

### Current:
- `src/app/components/OnboardingFlowConnected.tsx` - Needs update for setup codes

### To Create:
1. **Login Page** (`src/app/components/Login.tsx`)
   - Email/password login for all users
   - No role selection

2. **Clinic Setup Page** (update OnboardingFlow)
   - Step 1: Enter setup code
   - Step 2: Admin personal info
   - Step 3: Clinic configuration
   - Step 4: Module selection

3. **Staff Join Page** (`src/app/components/StaffJoin.tsx`)
   - Enter join code
   - Create account (doctor/nurse only)

4. **Admin Panel Routes** (in main app)
   - Staff management
   - Invite users
   - View join codes

---

## Migration Path

### Current State:
- Onboarding creates clinic + admin in one flow
- No separation between super admin and clinic admin

### New State:
1. **Super admin** creates clinics via admin panel
2. **Clinic admins** use setup codes to configure
3. **Staff** login or join with codes

### What to Update:

1. ✅ **Backend** (Done):
   - Admin API for clinic creation
   - Setup code generation
   - Updated Practice schema

2. 🔄 **Frontend** (Next):
   - Create simple login page
   - Update onboarding to use setup codes
   - Create staff join page
   - Add admin user management panel

---

## Security Considerations

### Code Types:

| Code Type | Length | Purpose | Can Regenerate? | Expires? |
|-----------|--------|---------|----------------|----------|
| Setup Code | 12 chars | Admin setup | Yes | No |
| Join Code | 8 chars | Staff joining | Yes | No |

### Admin Restrictions:
- Max 1-2 admins per clinic
- Only admins can invite staff
- Setup code single-use (becomes invalid after first admin)

### Future Enhancements:
- Add expiry to setup codes
- Add usage limits to join codes
- Add super admin authentication
- Add email invitations instead of codes

---

## Testing the New Flow

### 1. Create a Clinic (Super Admin)

```bash
# Start backend
cd server
npm run dev

# Open admin panel
open src/admin-panel.html
```

Fill form and get setup code.

### 2. Setup Clinic (Admin)

Use the setup code in the onboarding flow (to be updated).

### 3. Add Staff (Admin)

Admin dashboard → Invite staff → Generate join code or create account directly.

### 4. Staff Login

All users (admin, doctors, nurses) use the same login page.

---

## Next Steps

1. **Update Onboarding Component**
   - Add setup code verification step
   - Remove "create clinic" option
   - Focus on admin profile setup

2. **Create Login Page**
   - Simple email/password
   - Role determined from database
   - Redirect based on role

3. **Create Staff Management UI**
   - Admin can invite users
   - View all staff
   - Deactivate users
   - Generate join codes

4. **Add Super Admin Auth**
   - Protect admin panel routes
   - Add super admin login
   - Secure clinic creation endpoint

---

## Current Status

✅ **Complete**:
- Super admin API for clinic creation
- Setup code and join code generation
- Admin panel HTML interface
- Backend services and routes

🔄 **In Progress**:
- Frontend integration
- Login page
- Updated onboarding flow

📋 **Todo**:
- Staff management UI
- Email invitations
- Role-based redirects
- Admin authentication

---

## Quick Reference

### For You (Super Admin):
1. Open `src/admin-panel.html`
2. Create clinics
3. Send setup codes to clinic admins

### For Clinic Admins:
1. Receive setup code
2. Go to `/onboarding` or `/setup`
3. Enter code and configure clinic

### For Staff:
1. Login at `/login` with credentials, OR
2. Join with 8-char code at `/join`

---

This architecture gives you full control over clinic creation while allowing clinics to self-manage their staff! 🎉
