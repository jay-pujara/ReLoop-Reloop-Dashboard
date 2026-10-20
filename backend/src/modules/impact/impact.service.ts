import { ImpactEntryModel, IImpactEntry, computeImpactHash } from './impact.model.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { env } from '../../config/env.js';

/**
 * Service handling Impact Ledger operations with cryptographic hash chaining
 */
export class ImpactService {
  /**
   * Create a new immutable ledger entry for a given entity.
   * The entry includes hash‑chaining and a digital signature.
   */
  static async createEntry(
    entityId: mongoose.Types.ObjectId,
    entityType: string,
    _metadata?: Record<string, unknown>
  ): Promise<IImpactEntry> {
    // Find the most recent entry to obtain its dataHash for chaining.
    const latest = await ImpactEntryModel.findOne().sort({ createdAt: -1 }).exec();
    const previousHash = latest ? latest.dataHash : 'GENESIS_BLOCK_HASH_000000000000000000000000000000000000000000000000';
    const timestamp = new Date();
    const dataHash = computeImpactHash(entityId, entityType, previousHash, timestamp);

    // Sign the hash: prefer platform RSA private key if configured; otherwise use HMAC-SHA256 fallback
    let signature: string;
    const privateKey = process.env.IMPACT_PRIVATE_KEY;
    if (privateKey && privateKey.includes('PRIVATE KEY')) {
      try {
        const signer = crypto.createSign('sha256');
        signer.update(dataHash);
        signer.end();
        signature = signer.sign(privateKey, 'base64');
      } catch {
        const hmac = crypto.createHmac('sha256', env.JWT_ACCESS_SECRET);
        hmac.update(dataHash);
        signature = hmac.digest('base64');
      }
    } else {
      const hmac = crypto.createHmac('sha256', env.JWT_ACCESS_SECRET);
      hmac.update(dataHash);
      signature = hmac.digest('base64');
    }

    const entry = new ImpactEntryModel({
      entityId,
      entityType,
      previousHash,
      dataHash,
      signature,
      createdAt: timestamp,
    });
    return await entry.save();
  }

  /** Retrieve a ledger entry by its id. */
  static async getEntry(id: string): Promise<IImpactEntry | null> {
    return ImpactEntryModel.findById(id).exec();
  }

  /** Verify the entire chain integrity. */
  static async verifyChain(): Promise<{ isValid: boolean; verifiedBlocks: number; brokenAtBlock?: number }> {
    const entries = await ImpactEntryModel.find().sort({ createdAt: 1 }).exec();
    let previousHash = entries.length > 0 && entries[0].previousHash === 'GENESIS_BLOCK_HASH_000000000000000000000000000000000000000000000000'
      ? 'GENESIS_BLOCK_HASH_000000000000000000000000000000000000000000000000'
      : '';

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const recomputed = computeImpactHash(entry.entityId, entry.entityType, previousHash, entry.createdAt);
      if (recomputed !== entry.dataHash) {
        return { isValid: false, verifiedBlocks: i, brokenAtBlock: i + 1 };
      }
      previousHash = entry.dataHash;
    }
    return { isValid: true, verifiedBlocks: entries.length };
  }
}
