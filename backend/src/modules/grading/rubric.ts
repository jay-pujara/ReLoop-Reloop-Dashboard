import { GradingGrade, DamageSeverity, ContaminationSeverity } from './grading.types.js';

export const CURRENT_GRADING_RUBRIC_VERSION = 'v1.0';

export interface RubricGradeCriteria {
  grade: GradingGrade;
  name: string;
  description: string;
  maxDamageSeverity: DamageSeverity | 'none';
  maxContaminationSeverity: ContaminationSeverity;
  circularFate: string;
}

export const GRADING_RUBRIC_V1: Record<GradingGrade, RubricGradeCriteria> = {
  A: {
    grade: 'A',
    name: 'Near-Mint / Direct Reuse',
    description: 'Structural integrity intact, no moisture, no heavy contamination, ready for immediate direct reuse.',
    maxDamageSeverity: 'minor',
    maxContaminationSeverity: 'none',
    circularFate: 'Direct high-value packaging reuse',
  },
  B: {
    grade: 'B',
    name: 'Good / Minor Reconditioning',
    description: 'Minor cosmetic wear, light surface markings, no severe punctures or tears, suitable for reuse after minor sorting or inspection.',
    maxDamageSeverity: 'minor',
    maxContaminationSeverity: 'low',
    circularFate: 'Direct reuse or light reconditioning',
  },
  C: {
    grade: 'C',
    name: 'Fair / Reconditioning or Secondary Use',
    description: 'Moderate structural wear, minor warping or surface fraying, low-to-moderate contamination; acceptable for lower-grade secondary reuse or reconditioning.',
    maxDamageSeverity: 'moderate',
    maxContaminationSeverity: 'moderate',
    circularFate: 'Industrial reconditioning or mechanical recycling',
  },
  reject: {
    grade: 'reject',
    name: 'Degraded / Scrap or Non-Conforming',
    description: 'Severe structural fracture, hazardous/heavy oil or biological contamination, moisture rot; cannot be safely reused.',
    maxDamageSeverity: 'severe',
    maxContaminationSeverity: 'high',
    circularFate: 'Secondary recycling or energy recovery (cannot match for reuse)',
  },
};

export const CONTROLLED_DAMAGE_TYPES = [
  'structural_puncture',
  'creasing_tear',
  'corner_fraying',
  'broken_runner',
  'missing_component',
  'surface_dent',
  'warping',
  'weathering_decay',
  'joint_separation',
  'surface_abrasion',
] as const;

export const CONTROLLED_CONTAMINATION_TYPES = [
  'grease_oil_residue',
  'moisture_water_damage',
  'adhesive_tape_labels',
  'dust_dirt_fouling',
  'mixed_foreign_materials',
  'chemical_hazmat_residue',
  'biological_organic_residue',
] as const;

export const GRADING_PROMPT_SYSTEM_INSTRUCTIONS = `You are the ReLoop Computer Vision Inspection System for circular packaging and industrial materials.
Your task is to inspect the provided multi-angle photographs of an industrial packaging lot and output an objective, standardized condition grade.

Strict Evaluation Protocol:
1. Identify the primary material and confirm if it matches the declared material.
2. Evaluate damage across all provided images: look for punctures, tears, broken members, dents, warping, or fraying. Assign severity ('minor', 'moderate', 'severe') and note the region (e.g., 'top_surface', 'corners', 'runners', 'flaps').
3. Evaluate contamination: look for moisture, grease/oil, adhesive tape/stickers, chemical stains, or mixed foreign debris. Assign severity ('none', 'low', 'moderate', 'high').
4. Assign an authoritative condition grade strictly from: 'A', 'B', 'C', 'reject' based on the Rubric:
   - Grade 'A': Direct reuse ready, clean, structurally sound. Max minor damage, zero contamination.
   - Grade 'B': Good reusable condition. Minor wear or light dust/labels.
   - Grade 'C': Moderate wear, moderate surface residue, suitable for reconditioning.
   - Grade 'reject': Severe damage, heavy oil/chemical/moisture rot, structurally broken.
5. Provide a normalized numeric confidence score between 0.00 and 1.00 representing visual clarity and diagnostic certainty.
6. Return your evaluation strictly in valid JSON matching the requested schema. Do not include markdown codeblocks or conversational text outside the JSON.`;
