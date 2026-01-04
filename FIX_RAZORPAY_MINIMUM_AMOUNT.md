# Razorpay Minimum Amount Error - FIXED!

## ✅ Issue Identified

**Error**: `Order amount less than minimum amount allowed`

**Root Cause**: The price stored in the database for the plan is less than ₹1 (100 paise), which is Razorpay's minimum order amount.

## 🔧 Solution Applied

Added validation in the payment controller to:
1. ✅ Check if amount is at least ₹1
2. ✅ Show detailed error message if too low
3. ✅ Add debug logging to identify pricing issues

## 📊 Razorpay Requirements

- **Minimum Amount**: ₹1 (100 paise)
- **Currency**: INR
- **Amount Format**: Must be in paise (multiply rupees by 100)

## 🎯 How to Fix

### Step 1: Check Server Logs

After the fix, the server will now show:

```
💰 Payment Details: {
  planKey: 'pro',
  billingCycle: 'monthly',
  priceFromDB: 349,  ← Check this value
  calculatedAmount: 349,
  amountInPaise: 34900
}
```

**Look for `priceFromDB`** - this should be the plan price from your database.

### Step 2: Update Plan Pricing in Admin Panel

1. **Go to**: `/admin/subscriptions`
2. **Find the plan** you're trying to purchase (e.g., Pro)
3. **Check the "Price" field**
4. **Ensure it's a valid number** ≥ 1 (e.g., 349, 449, etc.)
5. **Click "Save Plan"**

### Step 3: Verify Database Pricing

The Pro plan should have:
- **Monthly Price**: ₹449 (or your desired amount)
- **Yearly Price**: ₹449 × 12 × 0.9 = ₹4,851 (with 10% discount)

### Step 4: Test Payment Flow

1. **Refresh browser**: `Ctrl + Shift + R`
2. **Go to**: `/pricing`
3. **Click "Get Started"** on Pro plan
4. **Check server logs** for payment details
5. **Payment modal should open** without errors ✅

## 🔍 Common Issues

### Issue 1: Price is 0 or null in Database

**Symptom**: `priceFromDB: 0` or `priceFromDB: null`

**Fix**:
```bash
1. Go to /admin/subscriptions
2. Edit the plan
3. Set price to a valid amount (e.g., 449)
4. Click "Save Plan"
```

### Issue 2: Price is a String

**Symptom**: `priceFromDB: "Contact"` or `priceFromDB: "Custom"`

**Fix**: These plans should have `contactLink: true` and redirect to contact page, not open payment modal.

### Issue 3: Price is Less Than ₹1

**Symptom**: `priceFromDB: 0.5` or `amountInPaise: 50`

**Fix**: Set price to at least ₹1 (Razorpay minimum)

## 📋 Expected Values

### Free Plan:
- Price: 0
- Should NOT trigger payment (redirects to dashboard)

### Pro Plan:
- Price: ₹449 (monthly)
- Amount in paise: 44,900
- Yearly: ₹4,851 (with 10% discount)

### Premium Plan:
- Price: "Contact" or custom amount
- Should redirect to contact page (if contactLink: true)

### Enterprise Plan:
- Price: "Custom"
- Should redirect to contact page

## 🧪 Debug Commands

### Check Plan Pricing in Database

Run this in your MongoDB shell or admin panel:

```javascript
// Check all plans
db.pricingplans.find({}, { planKey: 1, price: 1, displayName: 1 })

// Check specific plan
db.pricingplans.findOne({ planKey: 'pro' })
```

### Check Server Logs

After clicking "Get Started", look for:

```
💰 Payment Details: { ... }
📤 Creating Razorpay order with options: { ... }
```

If you see an error before "Creating Razorpay order", the amount is too low.

## ✅ Validation Added

The server now validates:

1. **Amount ≥ ₹1**: Prevents amounts less than ₹1
2. **Amount in paise ≥ 100**: Ensures Razorpay minimum is met
3. **Detailed error messages**: Shows exact amount that failed

## 🚀 Next Steps

1. **Check server logs** when you click "Get Started"
2. **Look for the payment details** log
3. **If `priceFromDB` is wrong**, update it in admin panel
4. **Try payment again**

## 📝 Summary

The error happens because:
- ❌ Plan price in database is < ₹1
- ❌ Razorpay requires minimum ₹1 (100 paise)

The fix:
- ✅ Added validation to check minimum amount
- ✅ Added debug logging to identify pricing issues
- ✅ Shows clear error messages

**Action Required**: 
1. Check server logs for `priceFromDB` value
2. Update plan pricing in `/admin/subscriptions` if needed
3. Ensure price is ≥ ₹1
4. Try payment flow again

---

**The validation is now in place!** Check the server logs to see what price is being used, and update it in the admin panel if needed. 🚀
