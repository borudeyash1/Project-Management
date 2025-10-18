# Database Seeding Script

This directory contains scripts for seeding the database with test data.

## Test User Credentials

After running the seed script, you can use these credentials to test the application:

### 1. Alex Johnson (Product Manager)
- **Email:** alex@example.com
- **Username:** alexjohnson
- **Password:** password123
- **Role:** Product Manager
- **Subscription:** Free

### 2. Sarah Chen (UI/UX Designer)
- **Email:** sarah@example.com
- **Username:** sarahchen
- **Password:** sarah123
- **Role:** UI/UX Designer
- **Subscription:** Pro

### 3. Mike Rodriguez (Senior Developer)
- **Email:** mike@example.com
- **Username:** mikerodriguez
- **Password:** mike123
- **Role:** Senior Developer
- **Subscription:** Free

### 4. Emily Davis (Project Manager)
- **Email:** emily@example.com
- **Username:** emilydavis
- **Password:** emily123
- **Role:** Project Manager
- **Subscription:** Enterprise

### 5. David Kim (DevOps Engineer)
- **Email:** david@example.com
- **Username:** davidkim
- **Password:** david123
- **Role:** DevOps Engineer
- **Subscription:** Free

## How to Run the Seed Script

1. Make sure your MongoDB connection is configured in `.env`
2. Navigate to the server directory
3. Run the seed script:

```bash
npm run seed
```

## What Gets Created

The seed script creates:

- **5 Test Users** with different roles and subscription levels
- **2 Test Workspaces** (NovaTech Solutions, Creative Studio)
- **2 Test Projects** (Website Redesign, Mobile App Development)
- **3 Test Tasks** with different statuses and priorities
- **2 Test Teams** (Frontend Team, Backend Team)
- **1 Test Payroll Entry** for the first user

## Password Hashing

All passwords are hashed using bcrypt with a salt of 12 rounds, which is the same method used in the authentication system. The plain text passwords are shown above for testing purposes.

## Notes

- The seed script will clear all existing data before seeding
- All test data is interconnected (users are members of workspaces, projects have team members, etc.)
- The first user (Alex Johnson) is set as the owner of the main workspace
- All users have verified email addresses for testing
