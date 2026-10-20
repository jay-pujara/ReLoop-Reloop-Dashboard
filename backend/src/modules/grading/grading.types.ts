import mongoose from 'mongoose';

export type GradingGrade = 'A' | 'B' | 'C' | 'reject';
export type GradeSource = 'seller' | 'ai' | 'manual';
export type GradingStatus =
  | 'not_started'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'manual_review_required'
  | 'failed';

export type DamageSeverity = 'minor' | 'moderate' | 'severe';
export type ContaminationSeverity = 'none' | 'low' | 'moderate' | 'high';

export interface DamageItem {
  type: string;
  severity: DamageSeverity;
  region?: string;
}

export interface ContaminationItem {
  type: string;
  severity: ContaminationSeverity;
}

export interface StructuredGradingOutput {
  materialDetected: string;
  grade: GradingGrade;
  confidence: number;
  damage: DamageItem[];
  contamination: ContaminationItem[];
  reusableUnitsEstimate?: number;
  notes: string;
}

export interface VisionGradingInput {
  listingId: string;
  materialCategory: string;
  materialSubtype: string;
  title: string;
  description: string;
  photos: Array<{
    id: string;
    mimeType: string;
    buffer: Buffer;
    originalFilename: string;
  }>;
  rubricVersion: string;
}

export interface GradeOverrideEntry {
  previousGrade: GradingGrade;
  newGrade: GradingGrade;
  userId: mongoose.Types.ObjectId;
  reason: string;
  timestamp: Date;
}
