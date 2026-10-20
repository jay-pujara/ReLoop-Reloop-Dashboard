import mongoose, { Document, Schema } from 'mongoose';

export const MATERIAL_TAXONOMY = {
  cardboard: ['corrugated_cardboard', 'occ', 'die_cut_box'],
  plastics: ['stretch_film', 'strapping', 'rigid_container'],
  pallets: ['wooden_pallet', 'plastic_pallet', 'euro_pallet'],
  drums: ['steel_drum', 'plastic_drum'],
  gaylords: ['fiber_gaylord', 'plastic_gaylord'],
} as const;

export type MaterialCategory = keyof typeof MATERIAL_TAXONOMY;

export interface IMaterialType extends Document {
  slug: string;
  category: MaterialCategory;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialTypeSchema = new Schema<IMaterialType>(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, required: true, enum: Object.keys(MATERIAL_TAXONOMY) },
    name: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const MaterialTypeModel = mongoose.model<IMaterialType>('MaterialType', MaterialTypeSchema);

export const isKnownMaterial = (category: string, subtype: string): boolean => {
  const subtypes = MATERIAL_TAXONOMY[category as MaterialCategory];
  return Boolean(subtypes?.includes(subtype as never));
};
