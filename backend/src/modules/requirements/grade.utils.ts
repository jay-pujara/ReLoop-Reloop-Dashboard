import { RequirementGrade } from './requirement.model.js';

const GRADE_RANKS: Record<RequirementGrade, number> = {
  reject: 0,
  C: 1,
  B: 2,
  A: 3,
};

/**
 * Evaluates whether an available listing grade meets or exceeds a buyer's minimum acceptable grade.
 * Rank hierarchy: A (3) > B (2) > C (1) > reject (0)
 */
export const gradeMeetsMinimum = (
  listingGrade: RequirementGrade,
  minRequiredGrade: RequirementGrade
): boolean => {
  const listingRank = GRADE_RANKS[listingGrade];
  const requiredRank = GRADE_RANKS[minRequiredGrade];

  if (listingRank === undefined || requiredRank === undefined) {
    return false;
  }

  return listingRank >= requiredRank;
};
