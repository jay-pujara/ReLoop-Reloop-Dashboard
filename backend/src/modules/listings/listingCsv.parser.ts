import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import { FacilityModel } from '../facilities/facilities.model.js';
import { isKnownMaterial, MATERIAL_TAXONOMY } from './materialType.model.js';
import { ListingInput } from './listing.service.js';

export interface CsvRowError {
  row: number;
  field: string;
  message: string;
}

export interface CsvParseResult {
  validRows: Array<{ rowNumber: number; input: ListingInput }>;
  errors: CsvRowError[];
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_GRADES = ['A', 'B', 'C', 'reject'] as const;
const VALID_PACKAGING_STATES = ['new', 'reusable', 'damaged_recyclable', 'clean_scrap'] as const;
const VALID_PACKAGING_MODES = ['loose', 'palletised'] as const;

function parseBoolean(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return null;
}

export class ListingCsvParser {
  static async parseAndValidate(
    csvBuffer: Buffer,
    organizationId: mongoose.Types.ObjectId
  ): Promise<CsvParseResult> {
    let records: Record<string, string>[];
    try {
      records = parse(csvBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch (parseErr) {
      return {
        validRows: [],
        errors: [{ row: 1, field: 'csv', message: parseErr instanceof Error ? parseErr.message : 'Invalid CSV format' }],
      };
    }

    const validRows: Array<{ rowNumber: number; input: ListingInput }> = [];
    const errors: CsvRowError[] = [];

    // Pre-cache known facilities for this organization to avoid N+1 queries
    const orgFacilities = await FacilityModel.find({
      organizationId,
      isDeleted: false,
    }).select('_id').lean();
    const validFacilityIds = new Set(orgFacilities.map((f) => f._id.toString()));

    for (const [index, row] of records.entries()) {
      const rowNum = index + 2; // Row 1 is the header
      const rowErrors: CsvRowError[] = [];

      // 1. Title
      const title = row.title?.trim();
      if (!title || title.length < 3 || title.length > 160) {
        rowErrors.push({ row: rowNum, field: 'title', message: 'Title is required and must be between 3 and 160 characters' });
      }

      // 2. Material Category
      const materialCategory = (row.material_category || row.material_type)?.trim().toLowerCase();
      const validCategories = Object.keys(MATERIAL_TAXONOMY);
      if (!materialCategory || !validCategories.includes(materialCategory)) {
        rowErrors.push({ row: rowNum, field: 'material_category', message: `Material category must be one of: ${validCategories.join(', ')}` });
      }

      // 3. Material Subtype
      const materialSubtype = row.material_subtype?.trim();
      if (!materialSubtype) {
        rowErrors.push({ row: rowNum, field: 'material_subtype', message: 'Material subtype is required' });
      } else if (materialCategory && !isKnownMaterial(materialCategory, materialSubtype)) {
        rowErrors.push({ row: rowNum, field: 'material_subtype', message: `Unknown subtype '${materialSubtype}' for category '${materialCategory}'` });
      }

      // 4. Grade
      const grade = row.grade?.trim();
      if (!grade || !VALID_GRADES.includes(grade as never)) {
        rowErrors.push({ row: rowNum, field: 'grade', message: `Grade must be one of: ${VALID_GRADES.join(', ')}` });
      }

      // 5. Mass (kg)
      const massKgRaw = row.mass_kg?.trim();
      const massKg = Number(massKgRaw);
      if (!massKgRaw || isNaN(massKg) || massKg <= 0 || massKg > 100000000) {
        rowErrors.push({ row: rowNum, field: 'mass_kg', message: 'Mass in kg must be a positive number up to 100,000,000' });
      }

      // 6. Unit count (optional)
      let unitCount: number | undefined;
      if (row.unit_count?.trim()) {
        const parsedUnits = Number(row.unit_count.trim());
        if (!Number.isInteger(parsedUnits) || parsedUnits <= 0) {
          rowErrors.push({ row: rowNum, field: 'unit_count', message: 'Unit count must be a positive integer' });
        } else {
          unitCount = parsedUnits;
        }
      }

      // 7. Dimensions (optional, but length, width, and height must all be provided if any are present)
      let dimensionsMm: { length: number; width: number; height: number } | undefined;
      const lRaw = row.length_mm?.trim();
      const wRaw = row.width_mm?.trim();
      const hRaw = row.height_mm?.trim();
      if (lRaw || wRaw || hRaw) {
        const l = Number(lRaw);
        const w = Number(wRaw);
        const h = Number(hRaw);
        if (!lRaw || !wRaw || !hRaw || isNaN(l) || isNaN(w) || isNaN(h) || l <= 0 || w <= 0 || h <= 0) {
          rowErrors.push({ row: rowNum, field: 'dimensions_mm', message: 'length_mm, width_mm, and height_mm must all be positive numbers when dimensions are specified' });
        } else {
          dimensionsMm = { length: l, width: w, height: h };
        }
      }

      // 8. Packaging State
      const packagingState = row.packaging_state?.trim().toLowerCase();
      if (!packagingState || !VALID_PACKAGING_STATES.includes(packagingState as never)) {
        rowErrors.push({ row: rowNum, field: 'packaging_state', message: `Packaging state must be one of: ${VALID_PACKAGING_STATES.join(', ')}` });
      }

      // 9. Availability Dates
      const fromRaw = row.available_from?.trim();
      const untilRaw = row.available_until?.trim();
      const availableFrom = fromRaw ? new Date(fromRaw) : null;
      const availableUntil = untilRaw ? new Date(untilRaw) : null;

      if (!availableFrom || isNaN(availableFrom.getTime())) {
        rowErrors.push({ row: rowNum, field: 'available_from', message: 'available_from must be a valid date' });
      }
      if (!availableUntil || isNaN(availableUntil.getTime())) {
        rowErrors.push({ row: rowNum, field: 'available_until', message: 'available_until must be a valid date' });
      }
      if (availableFrom && availableUntil && !isNaN(availableFrom.getTime()) && !isNaN(availableUntil.getTime())) {
        if (availableFrom > availableUntil) {
          rowErrors.push({ row: rowNum, field: 'available_until', message: 'available_until must be on or after available_from' });
        }
      }

      // 10. Price
      let askingPrice: { amount: number; currency: string } | undefined;
      const priceRaw = (row.price_per_kg || row.price_amount)?.trim();
      if (priceRaw !== undefined && priceRaw !== '') {
        const priceAmount = Number(priceRaw);
        if (isNaN(priceAmount) || priceAmount < 0) {
          rowErrors.push({ row: rowNum, field: 'price_per_kg', message: 'Price must be a non-negative number' });
        } else {
          askingPrice = { amount: priceAmount, currency: 'USD' };
        }
      }

      // 11. Open to offers (boolean)
      let openToOffers = false;
      if (row.open_to_offers?.trim() !== undefined && row.open_to_offers?.trim() !== '') {
        const parsedBool = parseBoolean(row.open_to_offers);
        if (parsedBool === null) {
          rowErrors.push({ row: rowNum, field: 'open_to_offers', message: 'open_to_offers must be true/false or 1/0' });
        } else {
          openToOffers = parsedBool;
        }
      }

      // 12. Facility ID & Cross-organisation isolation
      const facilityId = row.facility_id?.trim();
      if (!facilityId || !mongoose.isValidObjectId(facilityId)) {
        rowErrors.push({ row: rowNum, field: 'facility_id', message: 'facility_id must be a valid 24-character identifier' });
      } else if (!validFacilityIds.has(facilityId)) {
        rowErrors.push({ row: rowNum, field: 'facility_id', message: 'Facility not found or does not belong to your organisation' });
      }

      // 13. Pickup constraints
      let hasForklift = false;
      if (row.has_forklift?.trim() !== undefined && row.has_forklift?.trim() !== '') {
        const parsedBool = parseBoolean(row.has_forklift);
        if (parsedBool === null) {
          rowErrors.push({ row: rowNum, field: 'has_forklift', message: 'has_forklift must be true/false or 1/0' });
        } else {
          hasForklift = parsedBool;
        }
      }

      let packagingMode: 'loose' | 'palletised' = 'palletised';
      if (row.packaging_mode?.trim()) {
        const pMode = row.packaging_mode.trim().toLowerCase();
        if (!VALID_PACKAGING_MODES.includes(pMode as never)) {
          rowErrors.push({ row: rowNum, field: 'packaging_mode', message: `packaging_mode must be one of: ${VALID_PACKAGING_MODES.join(', ')}` });
        } else {
          packagingMode = pMode as 'loose' | 'palletised';
        }
      }

      const dockOpens = row.dock_opens?.trim() || '09:00';
      const dockCloses = row.dock_closes?.trim() || '17:00';
      if (!TIME_REGEX.test(dockOpens)) {
        rowErrors.push({ row: rowNum, field: 'dock_opens', message: 'dock_opens must use HH:MM format' });
      }
      if (!TIME_REGEX.test(dockCloses)) {
        rowErrors.push({ row: rowNum, field: 'dock_closes', message: 'dock_closes must use HH:MM format' });
      }
      if (TIME_REGEX.test(dockOpens) && TIME_REGEX.test(dockCloses) && dockOpens >= dockCloses) {
        rowErrors.push({ row: rowNum, field: 'dock_closes', message: 'dock_closes must be after dock_opens' });
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validRows.push({
          rowNumber: rowNum,
          input: {
            facilityId: facilityId!,
            materialCategory: materialCategory!,
            materialSubtype: materialSubtype!,
            title: title!,
            description: row.description?.trim() || '',
            grade: grade as 'A' | 'B' | 'C' | 'reject',
            gradeSource: 'seller',
            massKg,
            unitCount,
            dimensionsMm,
            packagingState: packagingState as 'new' | 'reusable' | 'damaged_recyclable' | 'clean_scrap',
            availableFrom: availableFrom!,
            availableUntil: availableUntil!,
            askingPrice,
            openToOffers,
            pickupConstraints: {
              dockHours: { opens: dockOpens, closes: dockCloses },
              hasForklift,
              packagingMode,
            },
          },
        });
      }
    }

    return { validRows, errors };
  }
}
