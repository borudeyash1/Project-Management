import { Request, Response } from 'express';
import SubscriptionPlan from '../models/SubscriptionPlan';
import User from '../models/User';
import { ApiResponse, AuthenticatedRequest } from '../types';

const normalizeCode = (code?: string): string => (code || '').trim().toUpperCase();

const parseDate = (value?: string | Date): Date | undefined => {
  if (!value) {
    return undefined;
  }
  return value instanceof Date ? value : new Date(value);
};

export const getPublicSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find().sort({ order: 1 });
    const response: ApiResponse = {
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: plans
    };
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription plans'
    });
  }
};

export const addSubscriptionCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey } = req.params;
    const { code, type = 'percentage', amount, maxRedemptions, expiresAt, isActive = true, notes } = req.body;

    if (!code || typeof amount !== 'number') {
      res.status(400).json({ success: false, message: 'Code and amount are required' });
      return;
    }

    if (!['percentage', 'flat'].includes(type)) {
      res.status(400).json({ success: false, message: 'Coupon type must be percentage or flat' });
      return;
    }

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) {
      res.status(400).json({ success: false, message: 'Coupon code cannot be empty' });
      return;
    }

    if (plan.couponCodes?.some((coupon: any) => coupon.code === normalizedCode)) {
      res.status(409).json({ success: false, message: 'Coupon code already exists for this plan' });
      return;
    }

    plan.couponCodes = plan.couponCodes || [];
    plan.couponCodes.push({
      code: normalizedCode,
      type,
      amount,
      maxRedemptions,
      redeemedCount: 0,
      expiresAt: parseDate(expiresAt),
      isActive,
      notes
    } as any);

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Coupon added successfully',
      data: plan.couponCodes
    });
  } catch (error: any) {
    console.error('Add subscription coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to add coupon' });
  }
};

export const updateSubscriptionCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey, code } = req.params;
    const updates = req.body;
    const normalizedCode = normalizeCode(code);

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const coupon = plan.couponCodes?.find((item: any) => item.code === normalizedCode);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    if (updates.type && !['percentage', 'flat'].includes(updates.type)) {
      res.status(400).json({ success: false, message: 'Coupon type must be percentage or flat' });
      return;
    }

    if (updates.code) {
      const newCode = normalizeCode(updates.code);
      if (!newCode) {
        res.status(400).json({ success: false, message: 'Coupon code cannot be empty' });
        return;
      }
      if (newCode !== coupon.code && plan.couponCodes?.some((item: any) => item.code === newCode)) {
        res.status(409).json({ success: false, message: 'Coupon code already exists for this plan' });
        return;
      }
      coupon.code = newCode;
    }

    if (updates.type) coupon.type = updates.type;
    if (typeof updates.amount === 'number') coupon.amount = updates.amount;
    if (typeof updates.maxRedemptions !== 'undefined') coupon.maxRedemptions = updates.maxRedemptions;
    if (typeof updates.redeemedCount === 'number') coupon.redeemedCount = updates.redeemedCount;
    if (typeof updates.isActive === 'boolean') coupon.isActive = updates.isActive;
    if (typeof updates.notes !== 'undefined') coupon.notes = updates.notes;
    if (Object.prototype.hasOwnProperty.call(updates, 'expiresAt')) {
      coupon.expiresAt = parseDate(updates.expiresAt);
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error: any) {
    console.error('Update subscription coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to update coupon' });
  }
};

export const deleteSubscriptionCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey, code } = req.params;
    const normalizedCode = normalizeCode(code);

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const initialLength = plan.couponCodes?.length || 0;
    plan.couponCodes = (plan.couponCodes || []).filter((coupon: any) => coupon.code !== normalizedCode);

    if (plan.couponCodes.length === initialLength) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete subscription coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

export const addSubscriptionAffiliate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey } = req.params;
    const {
      code,
      referralUrl,
      commissionRate = 10,
      discountPercentage = 0,
      isActive = true,
      notes
    } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Affiliate code is required' });
      return;
    }

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) {
      res.status(400).json({ success: false, message: 'Affiliate code cannot be empty' });
      return;
    }

    if (plan.affiliateLinks?.some((link: any) => link.code === normalizedCode)) {
      res.status(409).json({ success: false, message: 'Affiliate code already exists for this plan' });
      return;
    }

    plan.affiliateLinks = plan.affiliateLinks || [];
    plan.affiliateLinks.push({
      code: normalizedCode,
      referralUrl,
      commissionRate,
      discountPercentage,
      totalReferrals: 0,
      isActive,
      notes
    } as any);

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Affiliate link added successfully',
      data: plan.affiliateLinks
    });
  } catch (error: any) {
    console.error('Add subscription affiliate error:', error);
    res.status(500).json({ success: false, message: 'Failed to add affiliate link' });
  }
};

export const updateSubscriptionAffiliate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey, code } = req.params;
    const updates = req.body;
    const normalizedCode = normalizeCode(code);

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const affiliate = plan.affiliateLinks?.find((item: any) => item.code === normalizedCode);
    if (!affiliate) {
      res.status(404).json({ success: false, message: 'Affiliate link not found' });
      return;
    }

    if (updates.code) {
      const newCode = normalizeCode(updates.code);
      if (!newCode) {
        res.status(400).json({ success: false, message: 'Affiliate code cannot be empty' });
        return;
      }
      if (newCode !== affiliate.code && plan.affiliateLinks?.some((item: any) => item.code === newCode)) {
        res.status(409).json({ success: false, message: 'Affiliate code already exists for this plan' });
        return;
      }
      affiliate.code = newCode;
    }

    if (typeof updates.referralUrl !== 'undefined') affiliate.referralUrl = updates.referralUrl;
    if (typeof updates.commissionRate === 'number') affiliate.commissionRate = updates.commissionRate;
    if (typeof updates.discountPercentage === 'number') affiliate.discountPercentage = updates.discountPercentage;
    if (typeof updates.totalReferrals === 'number') affiliate.totalReferrals = updates.totalReferrals;
    if (typeof updates.isActive === 'boolean') affiliate.isActive = updates.isActive;
    if (typeof updates.notes !== 'undefined') affiliate.notes = updates.notes;

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Affiliate link updated successfully',
      data: affiliate
    });
  } catch (error: any) {
    console.error('Update subscription affiliate error:', error);
    res.status(500).json({ success: false, message: 'Failed to update affiliate link' });
  }
};

export const deleteSubscriptionAffiliate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey, code } = req.params;
    const normalizedCode = normalizeCode(code);

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const initialLength = plan.affiliateLinks?.length || 0;
    plan.affiliateLinks = (plan.affiliateLinks || []).filter((affiliate: any) => affiliate.code !== normalizedCode);

    if ((plan.affiliateLinks?.length || 0) === initialLength) {
      res.status(404).json({ success: false, message: 'Affiliate link not found' });
      return;
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Affiliate link deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete subscription affiliate error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete affiliate link' });
  }
};

export const validateSubscriptionCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey, code } = req.body as { planKey?: 'free' | 'pro' | 'ultra'; code?: string };

    if (!planKey || !code) {
      res.status(400).json({ success: false, message: 'planKey and code are required' });
      return;
    }

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const normalizedCode = normalizeCode(code);
    const now = new Date();

    const coupon = plan.couponCodes?.find((item: any) => item.code === normalizedCode);
    if (coupon) {
      if (!coupon.isActive) {
        res.status(400).json({ success: false, message: 'Coupon is inactive' });
        return;
      }
      if (coupon.expiresAt && coupon.expiresAt < now) {
        res.status(400).json({ success: false, message: 'Coupon has expired' });
        return;
      }
      if (typeof coupon.maxRedemptions === 'number' && coupon.redeemedCount >= coupon.maxRedemptions) {
        res.status(400).json({ success: false, message: 'Coupon redemption limit reached' });
        return;
      }

      const remainingRedemptions =
        typeof coupon.maxRedemptions === 'number'
          ? Math.max(coupon.maxRedemptions - coupon.redeemedCount, 0)
          : null;

      res.status(200).json({
        success: true,
        message: 'Coupon applied',
        data: {
          planKey,
          code: coupon.code,
          kind: 'coupon',
          discountType: coupon.type,
          discountValue: coupon.amount,
          expiresAt: coupon.expiresAt,
          remainingRedemptions
        }
      });
      return;
    }

    const affiliate = plan.affiliateLinks?.find((item: any) => item.code === normalizedCode);
    if (affiliate) {
      if (!affiliate.isActive) {
        res.status(400).json({ success: false, message: 'Affiliate code is inactive' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Affiliate code applied',
        data: {
          planKey,
          code: affiliate.code,
          kind: 'affiliate',
          discountType: 'percentage',
          discountValue: affiliate.discountPercentage,
          commissionRate: affiliate.commissionRate,
          referralUrl: affiliate.referralUrl
        }
      });
      return;
    }

    res.status(404).json({ success: false, message: 'Code not found for this plan' });
  } catch (error: any) {
    console.error('Validate subscription code error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate code' });
  }
};

export const upgradeSelfSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { planKey, billingCycle = 'monthly' } = req.body as { planKey?: 'free' | 'pro' | 'ultra'; billingCycle?: 'monthly' | 'yearly' };

    if (!planKey) {
      res.status(400).json({ success: false, message: 'Plan key is required' });
      return;
    }

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.subscription.plan = plan.planKey;
    user.subscription.status = 'active';
    user.subscription.startDate = new Date();
    user.subscription.billingCycle = billingCycle;
    user.subscription.autoRenew = true;
    user.subscription.endDate = undefined;
    user.subscription.isPro = plan.planKey !== 'free';

    const unlimitedSentinel = 9999;
    user.subscription.features.maxWorkspaces = plan.limits.maxWorkspaces === -1 ? unlimitedSentinel : plan.limits.maxWorkspaces;
    user.subscription.features.maxProjects = plan.limits.maxProjects === -1 ? unlimitedSentinel : plan.limits.maxProjects;
    user.subscription.features.maxTeamMembers = plan.limits.maxTeamMembers === -1 ? unlimitedSentinel : plan.limits.maxTeamMembers;
    user.subscription.features.aiAssistance = plan.features.aiAccess;
    user.subscription.features.advancedAnalytics = !plan.features.adsEnabled;
    user.subscription.features.customIntegrations = plan.features.customStorageIntegration;
    user.subscription.features.prioritySupport = plan.planKey !== 'free';
    user.subscription.features.whiteLabeling = plan.planKey === 'ultra';
    user.subscription.features.apiAccess = plan.planKey !== 'free';

    await user.save();

    const sanitizedUser = user.toJSON();
    delete (sanitizedUser as any).password;
    delete (sanitizedUser as any).refreshTokens;

    res.status(200).json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: sanitizedUser
    });
  } catch (error: any) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to upgrade subscription' });
  }
};

export const getAdminSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      message: 'Admin subscription plans retrieved',
      data: plans
    });
  } catch (error: any) {
    console.error('Get admin subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin plans'
    });
  }
};

export const updateSubscriptionPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planKey } = req.params;
    const updates = req.body;

    const plan = await SubscriptionPlan.findOne({ planKey });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    Object.assign(plan, updates);
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (error: any) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan'
    });
  }
};
