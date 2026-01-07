import express from 'express';
import PricingPlan from '../models/PricingPlan';

const router = express.Router();

// Get all pricing plans
router.get('/pricing-plans', async (req, res) => {
  try {
    const plans = await PricingPlan.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing plans' });
  }
});

// Get single pricing plan by key
router.get('/pricing-plans/:planKey', async (req, res) => {
  try {
    const plan = await PricingPlan.findOne({ planKey: req.params.planKey, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    return res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pricing plan' });
  }
});

// Admin: Get all pricing plans (including inactive)
router.get('/admin/subscriptions', async (req, res) => {
  try {
    const plans = await PricingPlan.find().sort({ order: 1 });
    
    // Convert prices from paise to rupees for admin display
    const plansWithRupees = plans.map(plan => {
      const planObj = plan.toObject();
      if (typeof planObj.price === 'number') {
        planObj.price = planObj.price / 100;
      }
      return planObj;
    });
    
    res.json({ success: true, data: plansWithRupees });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing plans' });
  }
});

// Admin: Update pricing plan
router.put('/admin/subscriptions/:planKey', async (req, res) => {
  try {
    const { planKey } = req.params;
    const updateData = req.body;

    // Convert price from rupees to paise if it's a number
    if (updateData.price && typeof updateData.price === 'number') {
      updateData.price = Math.round(updateData.price * 100);
    }

    const plan = await PricingPlan.findOneAndUpdate(
      { planKey },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: plan, message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({ success: false, message: 'Failed to update pricing plan' });
  }
});

// Admin: Create pricing plan
router.post('/admin/subscriptions', async (req, res) => {
  try {
    const planData = req.body;
    
    // Convert price from rupees to paise if it's a number
    if (planData.price && typeof planData.price === 'number') {
      planData.price = Math.round(planData.price * 100);
    }
    
    const plan = new PricingPlan(planData);
    await plan.save();
    res.json({ success: true, data: plan, message: 'Plan created successfully' });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    res.status(500).json({ success: false, message: 'Failed to create pricing plan' });
  }
});

// Admin: Delete pricing plan
router.delete('/admin/subscriptions/:planKey', async (req, res) => {
  try {
    const { planKey } = req.params;
    await PricingPlan.findOneAndUpdate(
      { planKey },
      { isActive: false },
      { new: true }
    );
    res.json({ success: true, message: 'Plan deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating pricing plan:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate pricing plan' });
  }
});

// Admin: Initialize default pricing plans
router.post('/admin/subscriptions/initialize', async (req, res) => {
  try {
    const existingPlans = await PricingPlan.countDocuments();
    if (existingPlans > 0) {
      return res.json({ success: true, message: 'Plans already initialized' });
    }

    const defaultPlans = [
      {
        planKey: 'free',
        displayName: 'Free',
        price: 0,
        description: 'Get started for free',
        recommended: false,
        features: [
          { text: 'Personal workspace only', included: true },
          { text: 'Notes making: all notes including sticky notes', included: true },
          { text: 'Projects: 1 project, no members', included: true },
          { text: 'Desktop application access', included: true },
          { text: 'Visualization: Board, Kanban, Timeline', included: true },
          { text: 'Reminder creation (no reminder mails)', included: true },
          { text: 'Custom reports & analytics', included: true },
          { text: 'Goals & objectives setting', included: true },
          { text: 'Multi-language support (14 languages)', included: true },
          { text: 'Appearance customization', included: true },
          { text: 'No access: calendar, vault, mail', included: false },
          { text: 'Ads included', included: false },
          { text: 'No AI assistant', included: false }
        ],
        buttonText: 'Get Started Free',
        buttonStyle: 'outline',
        order: 1,
        isActive: true
      },
      {
        planKey: 'pro',
        displayName: 'Pro',
        price: 449,
        description: 'Recommended',
        recommended: true,
        features: [
          { text: 'Workspaces: 1 personal + 2 additional', included: true },
          { text: 'Projects: 2 per workspace', included: true },
          { text: 'Members: 20 per workspace, 8 per project', included: true },
          { text: 'Notes with meeting add-ons & handling', included: true },
          { text: 'Meetings: live transcript, AI summary', included: true },
          { text: 'Desktop application access', included: true },
          { text: 'Access: calendar, vault, mail', included: true },
          { text: 'No ads', included: true },
          { text: 'AI assistant with custom inputs (limited)', included: true },
          { text: 'Visualization: Board, Kanban', included: true },
          { text: 'Reminders with reminder mails', included: true },
          { text: 'Reports & analytics with AI insights', included: true },
          { text: 'Attendance & payroll functionality', included: true },
          { text: 'Workspace & project inbox', included: true },
          { text: 'Custom URL submission', included: true },
          { text: 'Leaderboard access', included: true },
          { text: 'Role-based access control', included: true },
          { text: 'Workload & deadline management', included: true },
          { 
            text: 'Integrations', 
            included: true,
            integrations: [
              { icon: 'https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000', name: 'Google Meet' },
              { icon: 'https://img.icons8.com/?size=100&id=keRbY8PNKlan&format=png&color=000000', name: 'Microsoft Teams' },
              { icon: 'https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000', name: 'Zoom' }
            ]
          }
        ],
        buttonText: 'Get Started',
        buttonStyle: 'solid',
        order: 2,
        isActive: true
      },
      {
        planKey: 'premium',
        displayName: 'Premium',
        price: 'Contact',
        description: 'For growing teams',
        recommended: false,
        features: [
          { text: 'Workspaces: 1 personal + 10 additional', included: true },
          { text: 'Projects: 5 per workspace', included: true },
          { text: 'Members: 50 per workspace, 20 per project', included: true },
          { text: 'Notes with meeting add-ons & handling', included: true },
          { text: 'Meetings: live transcript, AI summary', included: true },
          { text: 'Desktop application access', included: true },
          { text: 'Access: calendar, vault, mail', included: true },
          { text: 'No ads', included: true },
          { text: 'AI assistant: unlimited custom inputs', included: true },
          { text: 'Visualization: Board, Kanban', included: true },
          { text: 'Reminders with reminder mails', included: true },
          { text: 'Reports & analytics with AI insights', included: true },
          { text: 'Attendance & payroll functionality', included: true },
          { text: 'Workspace & project inbox', included: true },
          { text: 'Custom URL submission', included: true },
          { text: 'Leaderboard access', included: true },
          { text: 'Role-based access control', included: true },
          { text: 'Workload & deadline management', included: true },
          { 
            text: 'Integrations', 
            included: true,
            integrations: [
              { icon: 'https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000', name: 'Google Meet' },
              { icon: 'https://img.icons8.com/?size=100&id=keRbY8PNKlan&format=png&color=000000', name: 'Microsoft Teams' },
              { icon: 'https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000', name: 'Zoom' },
              { icon: 'https://img.icons8.com/?size=100&id=19978&format=png&color=000000', name: 'Slack' },
              { icon: 'https://img.icons8.com/?size=100&id=12599&format=png&color=000000', name: 'GitHub' },
              { icon: 'https://img.icons8.com/?size=100&id=13630&format=png&color=000000', name: 'Google Drive' },
              { icon: 'https://img.icons8.com/?size=100&id=13657&format=png&color=000000', name: 'Dropbox' }
            ]
          }
        ],
        buttonText: 'Contact Sales',
        buttonStyle: 'outline',
        contactLink: true,
        order: 3,
        isActive: true
      },
      {
        planKey: 'enterprise',
        displayName: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations',
        recommended: false,
        features: [
          { text: 'Tailored plan for company requirements', included: true },
          { text: 'Custom workspaces & projects', included: true },
          { text: 'Custom members & features', included: true },
          { text: 'All Premium features included', included: true },
          { text: 'Dedicated account manager', included: true },
          { text: 'Priority support 24/7', included: true },
          { 
            text: 'Integrations', 
            included: true,
            integrations: [
              { icon: 'https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000', name: 'Google Meet' },
              { icon: 'https://img.icons8.com/?size=100&id=keRbY8PNKlan&format=png&color=000000', name: 'Microsoft Teams' },
              { icon: 'https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000', name: 'Zoom' },
              { icon: 'https://img.icons8.com/?size=100&id=19978&format=png&color=000000', name: 'Slack' },
              { icon: 'https://img.icons8.com/?size=100&id=12599&format=png&color=000000', name: 'GitHub' },
              { icon: 'https://img.icons8.com/?size=100&id=13630&format=png&color=000000', name: 'Google Drive' },
              { icon: 'https://img.icons8.com/?size=100&id=13657&format=png&color=000000', name: 'Dropbox' }
            ]
          },
          { text: 'Custom integrations available', included: true },
          { text: 'Advanced security features', included: true },
          { text: 'Custom SLA agreements', included: true },
          { text: 'On-premise deployment option', included: true }
        ],
        buttonText: 'Contact Sales',
        buttonStyle: 'outline',
        contactLink: true,
        order: 4,
        isActive: true
      }
    ];

    await PricingPlan.insertMany(defaultPlans);
    return res.json({ success: true, message: 'Default plans initialized successfully' });
  } catch (error) {
    console.error('Error initializing pricing plans:', error);
    return res.status(500).json({ success: false, message: 'Failed to initialize pricing plans' });
  }
});

export default router;
