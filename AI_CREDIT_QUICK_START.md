# Quick Integration Guide - AI Credit System

## Step 1: Register the AI Credits Routes

Add this to your `server/src/server.ts` or main router file:

```typescript
import aiCreditsRoutes from './routes/aiCredits';

// Add this line with your other route registrations
app.use('/api/ai-credits', aiCreditsRoutes);
```

## Step 2: Update AI Routes to Use Credit Middleware

Edit `server/src/routes/ai.ts`:

```typescript
import { checkAICredits } from '../middleware/aiCredits';

// Update the meeting-notes route:
router.post(
    "/meeting-notes",
    protect,
    checkAICredits('meeting_summary'),  // ADD THIS LINE
    handleMeetingNotesProcessing
);

// For chatbot (if you want to add credits):
router.post(
    "/chat",
    protect,
    checkAICredits('chatbot'),  // ADD THIS LINE
    handleChatRequest
);
```

## Step 3: Update Frontend - Remove Automatic AI Processing

### Option A: Simple Button Approach

In `MeetingRecorder.tsx`, change from automatic to manual:

```typescript
// Remove automatic AI processing on recording stop
// Add a button instead:

<button
    onClick={async () => {
        // First, get cost estimate
        const estimate = await fetch('/api/ai-credits/estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: 'meeting_summary' })
        }).then(r => r.json());

        if (confirm(`Generate AI Summary? This will use ${estimate.data.credits} credits.`)) {
            await processWithAI();
        }
    }}
>
    Generate AI Summary (100 credits)
</button>
```

### Option B: Full Integration with Credit Display

Create a new component `AICreditBalance.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export const AICreditBalance = () => {
    const [credits, setCredits] = useState({ remaining: 0, limit: 1200 });

    useEffect(() => {
        fetch('/api/ai-credits/usage')
            .then(r => r.json())
            .then(data => {
                setCredits({
                    remaining: data.data.creditsRemaining,
                    limit: data.data.creditsLimit
                });
            });
    }, []);

    const percentage = (credits.remaining / credits.limit) * 100;
    const color = percentage > 50 ? 'green' : percentage > 20 ? 'yellow' : 'red';

    return (
        <div className="credit-balance">
            <Zap size={16} />
            <span>{credits.remaining} / {credits.limit} credits</span>
            <div className="progress-bar">
                <div 
                    className={`progress-fill ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
```

## Step 4: Handle API Responses

Update your AI request handlers to show credit info:

```typescript
const generateSummary = async (transcript: string) => {
    try {
        const response = await fetch('/api/ai/meeting-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript })
        });

        const data = await response.json();

        if (response.status === 402) {
            // Insufficient credits
            alert(`Insufficient credits! You need ${data.data.required} credits but only have ${data.data.remaining}. Resets at ${new Date(data.data.resetsAt).toLocaleString()}`);
            return;
        }

        if (response.status === 429) {
            // Cool-down active
            alert(`Please wait ${data.remainingMinutes} minutes before using this feature again`);
            return;
        }

        if (data.success) {
            // Show result
            console.log('Summary:', data.data);
            
            // Show credit info
            if (data.cached) {
                console.log('✅ Cached result - 0 credits used');
            } else {
                console.log(`💰 Used ${data.creditsUsed} credits. ${data.creditsRemaining} remaining.`);
                
                if (data.warning) {
                    alert(data.warning);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
```

## Step 5: Add Credit Warnings UI

Create a notification system for warnings:

```typescript
// In your main App or Layout component:

useEffect(() => {
    const checkCredits = async () => {
        const response = await fetch('/api/ai-credits/usage');
        const data = await response.json();
        
        const percentage = data.data.usagePercentage;
        
        if (percentage >= 80 && percentage < 100) {
            showNotification('warning', 'You are running low on AI capacity for today (80% used)');
        } else if (percentage >= 100) {
            showNotification('error', `Daily AI limit reached. Resets at ${new Date(data.data.resetsAt).toLocaleString()}`);
        }
    };

    checkCredits();
    const interval = setInterval(checkCredits, 60000); // Check every minute
    
    return () => clearInterval(interval);
}, []);
```

## Step 6: Testing

### Test the System:

1. **Test Credit Deduction**:
```bash
curl -X POST http://localhost:5000/api/ai/meeting-notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"transcript": "Test meeting transcript..."}'
```

2. **Check Usage**:
```bash
curl http://localhost:5000/api/ai-credits/usage \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Test Caching** (run same request twice):
- First request: Uses 100 credits
- Second request: Uses 0 credits (cached)

4. **Test Cool-down** (for smart_decision or report_generation):
- Run request
- Immediately run again
- Should get 429 error with remaining minutes

## Quick Checklist

- [ ] Register `/api/ai-credits` routes in server
- [ ] Add `checkAICredits()` middleware to AI endpoints
- [ ] Remove automatic AI processing from frontend
- [ ] Add "Generate AI Summary" button
- [ ] Display credit balance in UI
- [ ] Handle 402 (insufficient credits) errors
- [ ] Handle 429 (cool-down) errors
- [ ] Show warnings at 50%, 80%, 100% usage
- [ ] Test caching (same request = 0 credits)
- [ ] Test cool-down periods

## Common Issues & Solutions

### Issue: TypeScript errors about `req.user._id`
**Solution**: The User type needs to include `_id`. This is usually defined in your auth middleware types.

### Issue: `protect` middleware not found
**Solution**: Check your auth middleware export. It might be exported as `authenticate` or `requireAuth` instead.

### Issue: Credits not resetting daily
**Solution**: The system creates a new record at midnight (server time). Check your server timezone.

### Issue: Cache not working
**Solution**: Ensure MongoDB TTL index is created. Run: `db.aicaches.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })`

## Need Help?

Check these files for reference:
- `AI_CREDIT_SYSTEM_IMPLEMENTATION.md` - Full documentation
- `server/src/services/aiCreditsService.ts` - Core logic
- `server/src/middleware/aiCredits.ts` - Request handling
- `server/src/routes/aiCredits.ts` - API endpoints
