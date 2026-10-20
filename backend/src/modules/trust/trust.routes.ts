import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DisputeModel } from './dispute.model.js';
import { OrganizationModel } from '../organizations/organizations.model.js';
import { ReviewModel } from '../reviews/reviews.model.js';
import { FacilityModel } from '../facilities/facilities.model.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

// Dynamic Organization Badges & Verification Status (PRD Tier 7)
router.get('/verification/:orgId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.params.orgId;
    if (!mongoose.isValidObjectId(orgId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid organization ID' } });
    }

    const org = await OrganizationModel.findById(orgId);
    if (!org) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } });
    }

    // Pull reviews and facilities to compute authentic trust metrics
    const [reviews, facilityCount, disputeCount] = await Promise.all([
      ReviewModel.find({ targetOrganizationId: orgId }),
      FacilityModel.countDocuments({ organizationId: orgId, isDeleted: false }),
      DisputeModel.countDocuments({ targetOrgId: orgId, status: { $ne: 'resolved' } }),
    ]);

    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 5.0;

    // Dynamic trust score algorithm:
    // Base 50 + Verification (30) + Rating (20 * rating/5) - Disputes penalty
    let trustScore = 50;
    if (org.verified || org.verificationStatus === 'verified') {
      trustScore += 30;
    } else if (org.verificationStatus === 'document-submitted') {
      trustScore += 15;
    }

    trustScore += Math.round((avgRating / 5) * 20);
    trustScore = Math.max(0, Math.min(100, trustScore - disputeCount * 10));

    // Dynamic Badges
    const badges: string[] = [];
    if (org.verified || org.verificationStatus === 'verified') {
      badges.push('VERIFIED_ENTERPRISE');
    }
    if (facilityCount > 0) {
      badges.push('VERIFIED_FACILITY');
    }
    if (avgRating >= 4.5 && reviewCount >= 1) {
      badges.push('TOP_RATED_CIRCULAR_PARTNER');
    }
    if (disputeCount === 0) {
      badges.push('CLEAN_COMPLIANCE_RECORD');
    }

    res.json({
      success: true,
      data: {
        organizationId: org._id,
        name: org.name,
        isVerifiedEnterprise: org.verified || org.verificationStatus === 'verified',
        verificationStatus: org.verificationStatus,
        trustScore: Number(trustScore.toFixed(1)),
        averageRating: Number(avgRating.toFixed(2)),
        totalReviews: reviewCount,
        verifiedFacilities: facilityCount,
        activeDisputes: disputeCount,
        badges,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Disputes
router.get('/disputes', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disputes = await DisputeModel.find({
      $or: [{ openedByOrgId: req.user?.organizationId }, { targetOrgId: req.user?.organizationId }],
    }).populate('orderId');
    res.json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
});

router.post('/disputes', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dispute = await DisputeModel.create({
      ...req.body,
      openedByOrgId: req.user?.organizationId,
    });
    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

export const trustRoutes = router;
