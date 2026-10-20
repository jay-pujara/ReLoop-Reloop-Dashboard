import { Types } from 'mongoose';
import { TransactionModel, ITransaction } from './transaction.model.js';
import { ListingModel } from '../listings/listing.model.js';
import { carbonService } from '../carbon/carbon.service.js';
import { OrganizationAuditModel } from '../organizations/audit.model.js';

export interface StartTransactionInput {
  matchId?: string;
  listingId?: string;
  quantityKg?: number;
  actorId?: string;
  organizationId?: string;
  distanceKm?: number;
}

/**
 * Service orchestrating the transaction / trade workflow (F7)
 */
export class TransactionService {
  /** Start a new transaction workflow for a given match or listing */
  async start(input: StartTransactionInput | string): Promise<ITransaction> {
    const params: StartTransactionInput = typeof input === 'string' ? { matchId: input } : input;

    let listing = null;
    if (params.listingId && Types.ObjectId.isValid(params.listingId)) {
      listing = await ListingModel.findById(params.listingId);
    }

    // Determine target quantity and material info
    const effectiveMassKg = params.quantityKg || listing?.massKg || 1000;
    const materialCategory = listing?.materialCategory || 'cardboard';
    const materialSubtype = listing?.materialSubtype;
    const distanceKm = params.distanceKm || 30;

    const validMatchId = params.matchId && Types.ObjectId.isValid(params.matchId)
      ? new Types.ObjectId(params.matchId)
      : undefined;

    const validListingId = listing?._id || (params.listingId && Types.ObjectId.isValid(params.listingId)
      ? new Types.ObjectId(params.listingId)
      : undefined);

    // Create a transaction record with initial status
    const transaction = await TransactionModel.create({
      matchId: validMatchId,
      listingId: validListingId,
      buyerOrganizationId: params.organizationId && Types.ObjectId.isValid(params.organizationId)
        ? new Types.ObjectId(params.organizationId)
        : undefined,
      sellerOrganizationId: listing?.organizationId,
      quantityKg: effectiveMassKg,
      totalPrice: listing?.askingPrice?.amount ? listing.askingPrice.amount * (effectiveMassKg / Math.max(1, listing.massKg)) : 0,
      status: 'initiated',
    });

    // Determine valid audit actor & organization IDs
    const auditActorId = params.actorId && Types.ObjectId.isValid(params.actorId)
      ? new Types.ObjectId(params.actorId)
      : transaction._id;
    const auditOrgId = params.organizationId && Types.ObjectId.isValid(params.organizationId)
      ? new Types.ObjectId(params.organizationId)
      : (listing?.organizationId || auditActorId);

    // Audit creation
    await OrganizationAuditModel.create({
      actorId: auditActorId,
      organizationId: auditOrgId,
      action: 'TRANSACTION_STARTED',
      target: transaction._id.toHexString(),
      metadata: { matchId: params.matchId, listingId: params.listingId, massKg: effectiveMassKg },
    });

    // Perform deterministic PRD carbon check (F6) using actual mass and distance
    const carbonRecord = await carbonService.calculateAndSave(
      transaction._id,
      'transaction',
      effectiveMassKg,
      {
        matchId: params.matchId,
        listingId: params.listingId,
        materialCategory,
        materialSubtype,
        distanceKm,
        actorId: auditActorId,
        organizationId: auditOrgId,
      }
    );

    // Update transaction with carbon record and status
    transaction.carbonRecordId = carbonRecord._id;
    transaction.status = 'carbon_checked';
    await transaction.save();

    await OrganizationAuditModel.create({
      actorId: auditActorId,
      organizationId: auditOrgId,
      action: 'CARBON_CHECKED',
      target: transaction._id.toHexString(),
      metadata: {
        carbonRecordId: carbonRecord._id,
        netSavedKg: carbonRecord.carbonKg,
        classification: carbonRecord.classification,
      },
    });

    return transaction;
  }

  /** Retrieve transaction status by ID */
  async getStatus(id: string): Promise<ITransaction | null> {
    return TransactionModel.findById(id).populate('listingId').populate('carbonRecordId');
  }
}

export const transactionService = new TransactionService();
