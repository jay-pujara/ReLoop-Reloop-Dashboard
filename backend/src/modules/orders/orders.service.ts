import { OrderModel, IOrder } from './orders.model.js';
import { MaterialModel } from '../materials/materials.model.js';
import { ListingModel } from '../listings/listing.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface CreateOrderDTO {
  buyerOrganizationId: string;
  materialId?: string;
  listingId?: string;
  quantity: number;
  orderType?: 'free_claim' | 'paid_purchase';
  deliveryNotes?: string;
}

export class OrdersService {
  async createOrder(data: CreateOrderDTO): Promise<IOrder> {
    const targetListingId = data.listingId || data.materialId;
    let listing = targetListingId ? await ListingModel.findOne({ _id: targetListingId, isDeleted: false }) : null;
    let material = null;

    if (!listing && data.materialId) {
      material = await MaterialModel.findOne({ _id: data.materialId, isDeleted: false });
    }

    if (!listing && !material) {
      const err: AppError = new Error('Listing or material lot not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const effectiveOrderType = data.orderType || 'paid_purchase';

    if (listing) {
      const availableQty = listing.massKg || listing.unitCount || 1000;
      if (availableQty < data.quantity) {
        const err: AppError = new Error('Insufficient quantity available in listing');
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_QUANTITY';
        throw err;
      }

      const unitPrice = listing.askingPrice?.amount || 0;
      const totalPrice = effectiveOrderType === 'free_claim' ? 0 : data.quantity * unitPrice;

      const order = await OrderModel.create({
        orderNumber,
        buyerOrganizationId: data.buyerOrganizationId,
        sellerOrganizationId: listing.organizationId,
        listingId: listing._id,
        orderType: effectiveOrderType,
        quantity: data.quantity,
        unit: 'kg',
        totalPrice,
        deliveryNotes: data.deliveryNotes,
      });

      listing.massKg = Math.max(0, listing.massKg - data.quantity);
      if (listing.massKg <= 0) {
        listing.status = 'matched';
      }
      await listing.save();

      return order;
    } else if (material) {
      if (material.availableQuantity < data.quantity) {
        const err: AppError = new Error('Insufficient material quantity available');
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_QUANTITY';
        throw err;
      }

      const totalPrice = effectiveOrderType === 'free_claim' ? 0 : data.quantity * (material.pricePerUnit || 0);

      const order = await OrderModel.create({
        orderNumber,
        buyerOrganizationId: data.buyerOrganizationId,
        sellerOrganizationId: material.sellerOrganizationId,
        materialId: material._id,
        orderType: effectiveOrderType,
        quantity: data.quantity,
        unit: material.unit,
        totalPrice,
        deliveryNotes: data.deliveryNotes,
      });

      material.availableQuantity -= data.quantity;
      if (material.availableQuantity <= 0) {
        material.status = 'reserved';
      }
      await material.save();

      return order;
    }

    throw new Error('Could not process order');
  }

  async getById(id: string): Promise<IOrder | null> {
    return OrderModel.findOne({ _id: id, isDeleted: false })
      .populate('buyerOrganizationId', 'name contactEmail address')
      .populate('sellerOrganizationId', 'name contactEmail address')
      .populate('materialId')
      .populate('listingId');
  }

  async listForOrganization(organizationId: string): Promise<IOrder[]> {
    return OrderModel.find({
      $or: [{ buyerOrganizationId: organizationId }, { sellerOrganizationId: organizationId }],
      isDeleted: false,
    })
      .populate('materialId', 'title materialType')
      .populate('listingId', 'title materialCategory materialSubtype grade askingPrice massKg')
      .populate('buyerOrganizationId', 'name')
      .populate('sellerOrganizationId', 'name')
      .sort({ createdAt: -1 });
  }
}

export const ordersService = new OrdersService();
