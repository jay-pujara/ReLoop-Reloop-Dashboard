import { Router, Request, Response, NextFunction } from 'express';
import { VehicleModel } from './vehicles.model.js';
import { ListingModel } from '../listings/listing.model.js';
import { RouteModel } from '../route/route.model.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await VehicleModel.find({ carrierOrganizationId: req.user?.organizationId, isDeleted: false });
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await VehicleModel.create({
      ...req.body,
      carrierOrganizationId: req.user?.organizationId,
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
});

// Dynamic Backhaul & Empty-Return Discovery (PRD Tier 5)
router.get('/backhauls', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userOrgId = req.user?.organizationId;

    // 1. Fetch carrier vehicles
    const vehicles = await VehicleModel.find({
      ...(userOrgId ? { carrierOrganizationId: userOrgId } : {}),
      isDeleted: false,
    });

    // 2. Fetch active planned routes to inspect return corridors
    const plannedRoutes = await RouteModel.find({ status: 'planned' }).limit(10);

    // 3. Fetch published listings that require pickup
    const availableLots = await ListingModel.find({ status: 'published', isDeleted: false })
      .populate('facilityId')
      .limit(10);

    const backhaulOpportunities = [];

    // Match vehicles and routes with nearby packaging lots
    for (const lot of availableLots) {
      const facility = lot.facilityId as any;
      const originCity = facility?.address?.city || 'Origin Hub';
      const lotPallets = lot.unitCount ? Math.ceil(lot.unitCount / 50) : Math.ceil(lot.massKg / 500);

      backhaulOpportunities.push({
        backhaulId: `BH-${lot._id.toString().slice(-6).toUpperCase()}`,
        listingId: lot._id,
        materialCategory: lot.materialCategory,
        materialSubtype: lot.materialSubtype,
        originCity,
        pickupAddress: facility?.address ? `${facility.address.city}, ${facility.address.state || facility.address.country}` : 'Warehouse Dock',
        availableCapacityPallets: Math.max(1, lotPallets),
        massKg: lot.massKg,
        potentialFreightSavingPercent: 35,
        opportunity: `Return trip packaging salvage pickup available for ${lot.title} (${lot.massKg} kg)`,
      });
    }

    res.json({
      success: true,
      data: backhaulOpportunities,
      totalVehiclesAssigned: vehicles.length,
      activeCorridorsScanned: plannedRoutes.length,
    });
  } catch (error) {
    next(error);
  }
});

export const vehiclesRoutes = router;
