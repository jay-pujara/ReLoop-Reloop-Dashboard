import { AppError } from '../middleware/errorHandler.js';

export interface OwnershipContext {
  userId: string;
  organizationId?: string;
  role?: string;
}

export interface ResourceWithOwner {
  sellerOrganizationId?: string | { toString(): string };
  buyerOrganizationId?: string | { toString(): string };
  organizationId?: string | { toString(): string };
  userId?: string | { toString(): string };
}

/**
 * Validates whether the authenticated user context possesses access rights to the resource.
 * Throws a generic 404 rather than 403 to prevent leaking the existence of resources to unauthorized parties.
 */
export const assertOwnership = (
  resource: ResourceWithOwner | null | undefined,
  context: OwnershipContext,
  resourceName: string = 'Resource'
): void => {
  if (!resource) {
    const error: AppError = new Error(`${resourceName} not found`);
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const contextOrgId = context.organizationId?.toString();
  const contextUserId = context.userId?.toString();

  const resourceOrgId = (
    resource.organizationId ||
    resource.sellerOrganizationId ||
    resource.buyerOrganizationId
  )?.toString();

  const resourceUserId = resource.userId?.toString();

  // Match either by organization membership or explicit user identity
  const hasOrgAccess = contextOrgId && resourceOrgId && contextOrgId === resourceOrgId;
  const hasUserAccess = contextUserId && resourceUserId && contextUserId === resourceUserId;

  if (!hasOrgAccess && !hasUserAccess) {
    const error: AppError = new Error(`${resourceName} not found`);
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
};
