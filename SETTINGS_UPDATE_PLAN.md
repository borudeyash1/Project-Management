# Settings Page Updates - Implementation Plan

## ✅ Completed:
1. **Dock Expansion Fix** - Both User and Admin docks
   - Reduced margin from 16px to 8px
   - Prevents excessive length increase on hover

## 🔄 In Progress:

### 1. Remove "Data & Export" Tab from Settings
**Location:** `client/src/components/Settings.tsx`
**Changes:**
- Remove from tabs array (line 458)
- Remove renderData function
- Remove export data modal
- Remove related state variables

### 2. Fix Billing Section
**Current Issue:** Shows dummy/mock data
**Solution:** Create proper API endpoint

**Backend Changes Needed:**
- Create `/api/users/subscription` endpoint
- Return actual user subscription data from database
- Include: plan (free/pro/ultra), status, features, billing cycle

**Frontend Changes:**
- Update Settings.tsx to call real API
- Display actual subscription plan
- Show upgrade options based on current plan
- Use same plan data structure as HomePage

**API Endpoint Structure:**
```typescript
GET /api/users/subscription
Response: {
  success: true,
  data: {
    plan: 'free' | 'pro' | 'ultra',
    status: 'active' | 'inactive' | 'cancelled',
    startDate: Date,
    endDate: Date,
    features: {
      maxWorkspaces: number,
      maxProjects: number,
      maxTeamMembers: number,
      maxStorage: number,
      aiAssistance: boolean,
      advancedAnalytics: boolean,
      ...
    }
  }
}
```

### 3. Integrate with HomePage Plans
- Use same subscription plans from HomePage
- Show current plan badge
- Display upgrade button for free/pro users
- Link to upgrade modal/page

## 📝 Next Steps:
1. Remove Data & Export tab
2. Create subscription API endpoint
3. Update Billing section UI
4. Test with real data
