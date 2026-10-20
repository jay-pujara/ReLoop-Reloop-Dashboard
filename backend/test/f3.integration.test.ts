import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { RequirementModel } from '../src/modules/requirements/requirement.model.js';
import { OrganizationAuditModel } from '../src/modules/organizations/audit.model.js';
import { gradeMeetsMinimum } from '../src/modules/requirements/grade.utils.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required for F3 integration tests');

const app = createApp();

interface Account {
  token: string;
  organizationId: string;
  facilityId: string;
}

const registerAndPrepare = async (suffix: string, organizationName: string): Promise<Account> => {
  const email = `f3-${suffix}-${crypto.randomUUID()}@example.test`;
  const password = 'integration-password-123';
  const register = await request(app).post('/api/v1/auth/register').send({
    email,
    password,
    name: `${suffix.toUpperCase()} Buyer`,
    organizationName,
    organizationType: 'manufacturer',
    city: 'Chicago',
    country: 'USA',
  }).expect(201);

  const login = await request(app).post('/api/v1/auth/login').send({ email, password }).expect(200);
  const token = login.body.data.accessToken as string;
  const organizationId = register.body.data.user.organizationId as string;

  const facility = await request(app)
    .post('/api/v1/organizations/me/facilities')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `${suffix.toUpperCase()} Intake Depot`,
      facilityType: 'recycling_yard',
      address: { street: '100 Packaging Way', city: 'Chicago', country: 'USA' },
      location: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      operatingHours: { monday: { closed: false, opens: '08:00', closes: '16:00' } },
      hasForklift: true,
    })
    .expect(201);

  return { token, organizationId, facilityId: facility.body.data._id as string };
};

const validRequirementPayload = (facilityId: string) => ({
  facilityId,
  materialCategory: 'cardboard',
  materialSubtype: 'corrugated_cardboard',
  description: 'Need recurring clean corrugated cardboard for packaging box conversion.',
  minGrade: 'B',
  massKgPerPeriod: 3000,
  period: 'weekly',
  maxPricePerKg: 0.25,
  useCarbonLimit: false,
  maxDistanceKm: 150,
});

let accountA: Account;
let accountB: Account;
let requirementIdA: string;

after(async () => {
  try {
    await mongoose.connection.dropDatabase();
  } catch (_dropErr) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      try {
        await collections[key].deleteMany({});
      } catch {
        // Ignore collection cleanup error
      }
    }
  } finally {
    await disconnectDB();
  }
});

describe('F3 Requirement Posting Integration & Hardening Suite', () => {
  before(async () => {
    await connectDB();
    accountA = await registerAndPrepare('a', 'F3 Test Buyer Org A');
    accountB = await registerAndPrepare('b', 'F3 Test Buyer Org B');
  });

  describe('Domain Utility: gradeMeetsMinimum', () => {
    it('evaluates grade hierarchy correctly (A > B > C > reject)', () => {
      assert.equal(gradeMeetsMinimum('A', 'B'), true, 'Grade A should satisfy minimum Grade B');
      assert.equal(gradeMeetsMinimum('B', 'B'), true, 'Grade B should satisfy minimum Grade B');
      assert.equal(gradeMeetsMinimum('C', 'B'), false, 'Grade C should not satisfy minimum Grade B');
      assert.equal(gradeMeetsMinimum('reject', 'C'), false, 'Reject should not satisfy minimum Grade C');
      assert.equal(gradeMeetsMinimum('A', 'reject'), true, 'Grade A satisfies minimum reject');
    });
  });

  describe('Authentication & Creation', () => {
    it('rejects unauthenticated requirement creation with 401', async () => {
      await request(app)
        .post('/api/v1/requirements')
        .send(validRequirementPayload(accountA.facilityId))
        .expect(401);
    });

    it('creates and persists a valid requirement in MongoDB', async () => {
      const res = await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send(validRequirementPayload(accountA.facilityId))
        .expect(201);

      assert.equal(res.body.success, true);
      requirementIdA = res.body.data._id;
      assert.ok(requirementIdA, 'Expected requirement ID to be returned');
      assert.equal(res.body.data.status, 'active');
      assert.equal(res.body.data.massKgPerPeriod, 3000);
      assert.equal(res.body.data.period, 'weekly');
      assert.equal(res.body.data.minGrade, 'B');

      // Verify directly in MongoDB
      const persisted = await RequirementModel.findById(requirementIdA).lean();
      assert.ok(persisted, 'Requirement must be found in MongoDB');
      assert.equal(persisted.organizationId.toString(), accountA.organizationId);
      assert.equal(persisted.facilityId.toString(), accountA.facilityId);
      assert.equal(persisted.materialCategory, 'cardboard');
      assert.equal(persisted.materialSubtype, 'corrugated_cardboard');
      assert.equal(persisted.minGrade, 'B');
      assert.equal(persisted.massKgPerPeriod, 3000);
      assert.equal(persisted.period, 'weekly');
      assert.equal(persisted.maxPricePerKg, 0.25);
      assert.equal(persisted.maxDistanceKm, 150);
      assert.equal(persisted.useCarbonLimit, false);
      assert.equal(persisted.status, 'active');
      assert.ok(persisted.createdAt);
      assert.ok(persisted.updatedAt);
    });

    it('blocks cross-organisation facility assignment', async () => {
      // Org A attempts to use Org B's facility
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send(validRequirementPayload(accountB.facilityId))
        .expect(404);

      // Verify no requirement created in MongoDB
      const count = await RequirementModel.countDocuments({
        facilityId: accountB.facilityId,
        organizationId: accountA.organizationId,
      });
      assert.equal(count, 0, 'No requirement should be created with cross-org facility');
    });
  });

  describe('Validation & Carbon vs Haul Distance Rules', () => {
    it('accepts useCarbonLimit=true without maxDistanceKm', async () => {
      const payload = {
        ...validRequirementPayload(accountA.facilityId),
        title: 'Carbon feasibility requirement',
        useCarbonLimit: true,
        maxDistanceKm: undefined,
      };

      const res = await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send(payload)
        .expect(201);

      assert.equal(res.body.data.useCarbonLimit, true);
      assert.equal(res.body.data.maxDistanceKm, undefined);

      const dbDoc = await RequirementModel.findById(res.body.data._id).lean();
      assert.equal(dbDoc?.useCarbonLimit, true);
    });

    it('rejects useCarbonLimit=false when maxDistanceKm is omitted', async () => {
      const payload = {
        ...validRequirementPayload(accountA.facilityId),
        useCarbonLimit: false,
        maxDistanceKm: undefined,
      };

      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send(payload)
        .expect(400);
    });

    it('rejects invalid material category and unknown subtype', async () => {
      // Invalid category
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), materialCategory: 'electronics' })
        .expect(400);

      // Unknown subtype for cardboard
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), materialSubtype: 'titanium_foil' })
        .expect(422);
    });

    it('rejects invalid grade, zero mass, negative mass, and invalid period', async () => {
      // Invalid grade
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), minGrade: 'Z' })
        .expect(400);

      // Zero mass
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), massKgPerPeriod: 0 })
        .expect(400);

      // Negative mass
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), massKgPerPeriod: -500 })
        .expect(400);

      // Invalid period
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), period: 'biweekly' })
        .expect(400);

      // Negative price
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ ...validRequirementPayload(accountA.facilityId), maxPricePerKg: -1 })
        .expect(400);
    });
  });

  describe('IDOR & Cross-Organisation Protection', () => {
    it('blocks Org B from reading Org A requirement detail', async () => {
      await request(app)
        .get(`/api/v1/requirements/${requirementIdA}`)
        .set('Authorization', `Bearer ${accountB.token}`)
        .expect(404);
    });

    it('blocks Org B from modifying Org A requirement', async () => {
      await request(app)
        .patch(`/api/v1/requirements/${requirementIdA}`)
        .set('Authorization', `Bearer ${accountB.token}`)
        .send({ description: 'Tampered by Org B' })
        .expect(404);

      // Verify MongoDB untouched
      const persisted = await RequirementModel.findById(requirementIdA).lean();
      assert.notEqual(persisted?.description, 'Tampered by Org B');
    });

    it('blocks Org B from pausing, resuming, or closing Org A requirement', async () => {
      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/pause`)
        .set('Authorization', `Bearer ${accountB.token}`)
        .expect(404);

      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/resume`)
        .set('Authorization', `Bearer ${accountB.token}`)
        .expect(404);

      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/close`)
        .set('Authorization', `Bearer ${accountB.token}`)
        .expect(404);

      const persisted = await RequirementModel.findById(requirementIdA).lean();
      assert.equal(persisted?.status, 'active');
    });
  });

  describe('Updates & Lifecycle Management', () => {
    it('allows permitted updates by owner and prevents organizationId reassignment', async () => {
      const updateRes = await request(app)
        .patch(`/api/v1/requirements/${requirementIdA}`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({
          description: 'Updated requirement description for conversion.',
          massKgPerPeriod: 4500,
          organizationId: accountB.organizationId, // Attempted mass-assignment
        })
        .expect(200);

      assert.equal(updateRes.body.data.description, 'Updated requirement description for conversion.');
      assert.equal(updateRes.body.data.massKgPerPeriod, 4500);

      // Verify in MongoDB that organizationId was NOT modified
      const persisted = await RequirementModel.findById(requirementIdA).lean();
      assert.equal(persisted?.organizationId.toString(), accountA.organizationId);
      assert.equal(persisted?.massKgPerPeriod, 4500);
    });

    it('pauses, resumes, and closes requirement through dedicated endpoints', async () => {
      // 1. Pause active requirement
      const pauseRes = await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/pause`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(pauseRes.body.data.status, 'paused');
      assert.equal((await RequirementModel.findById(requirementIdA).lean())?.status, 'paused');

      // 2. Cannot pause already paused requirement
      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/pause`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(409);

      // 3. Resume paused requirement
      const resumeRes = await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/resume`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(resumeRes.body.data.status, 'active');
      assert.equal((await RequirementModel.findById(requirementIdA).lean())?.status, 'active');

      // 4. Cannot resume active requirement
      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/resume`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(409);

      // 5. Close active requirement
      const closeRes = await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/close`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(closeRes.body.data.status, 'closed');
      assert.equal((await RequirementModel.findById(requirementIdA).lean())?.status, 'closed');

      // 6. Closed requirement cannot be paused or resumed
      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/pause`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(409);

      await request(app)
        .post(`/api/v1/requirements/${requirementIdA}/resume`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(409);

      // 7. Closed requirement cannot be edited via PATCH
      await request(app)
        .patch(`/api/v1/requirements/${requirementIdA}`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({ description: 'Attempt edit on closed' })
        .expect(409);
    });
  });

  describe('Organisation-Scoped Listing & Cursor Pagination', () => {
    let secondReqId: string;

    before(async () => {
      // Create a second requirement for Org A
      const res = await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .send({
          ...validRequirementPayload(accountA.facilityId),
          materialCategory: 'pallets',
          materialSubtype: 'euro_pallet',
          minGrade: 'A',
          massKgPerPeriod: 1200,
        })
        .expect(201);
      secondReqId = res.body.data._id;

      // Create a requirement for Org B
      await request(app)
        .post('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountB.token}`)
        .send({
          ...validRequirementPayload(accountB.facilityId),
          materialCategory: 'plastics',
          materialSubtype: 'stretch_film',
        })
        .expect(201);
    });

    it('returns only requirements belonging to authenticated organization', async () => {
      const resA = await request(app)
        .get('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(resA.body.success, true);
      assert.ok(resA.body.data.items.length >= 2);
      for (const item of resA.body.data.items) {
        assert.equal(item.organizationId.toString(), accountA.organizationId);
      }

      const resB = await request(app)
        .get('/api/v1/requirements')
        .set('Authorization', `Bearer ${accountB.token}`)
        .expect(200);

      assert.equal(resB.body.data.items.length, 1);
      assert.equal(resB.body.data.items[0].organizationId.toString(), accountB.organizationId);
    });

    it('paginates correctly using opaque cursors and stable sort', async () => {
      // Request limit=1
      const page1 = await request(app)
        .get('/api/v1/requirements?limit=1')
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(page1.body.data.items.length, 1);
      assert.equal(page1.body.data.hasMore, true);
      const nextCursor = page1.body.data.nextCursor;
      assert.ok(nextCursor, 'Expected nextCursor for page 1');

      // Request page 2 with nextCursor
      const page2 = await request(app)
        .get(`/api/v1/requirements?limit=1&cursor=${nextCursor}`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(page2.body.data.items.length, 1);
      assert.notEqual(page1.body.data.items[0]._id, page2.body.data.items[0]._id, 'Page 2 should contain different items');

      // Invalid cursor returns 400
      await request(app)
        .get('/api/v1/requirements?cursor=invalid_base64_cursor')
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(400);
    });

    it('filters requirements by material category and status', async () => {
      const filtered = await request(app)
        .get('/api/v1/requirements?materialCategory=pallets')
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.ok(filtered.body.data.items.length >= 1);
      for (const item of filtered.body.data.items) {
        assert.equal(item.materialCategory, 'pallets');
      }
    });
  });

  describe('Audit Logging & DB Persistence Across Reconnect', () => {
    it('verifies audit logs recorded in MongoDB for requirement lifecycle events', async () => {
      const audits = await OrganizationAuditModel.find({
        organizationId: accountA.organizationId,
        action: { $in: ['requirement.created', 'requirement.updated', 'requirement.paused', 'requirement.resumed', 'requirement.closed'] },
      }).lean();

      assert.ok(audits.find((a) => a.action === 'requirement.created'), 'Expected audit for requirement.created');
      assert.ok(audits.find((a) => a.action === 'requirement.updated'), 'Expected audit for requirement.updated');
      assert.ok(audits.find((a) => a.action === 'requirement.paused'), 'Expected audit for requirement.paused');
      assert.ok(audits.find((a) => a.action === 'requirement.resumed'), 'Expected audit for requirement.resumed');
      assert.ok(audits.find((a) => a.action === 'requirement.closed'), 'Expected audit for requirement.closed');
    });

    it('persists requirements across database disconnect and reconnect', async () => {
      await disconnectDB();
      await connectDB();

      const res = await request(app)
        .get(`/api/v1/requirements/${requirementIdA}`)
        .set('Authorization', `Bearer ${accountA.token}`)
        .expect(200);

      assert.equal(res.body.data._id, requirementIdA);
      assert.equal(res.body.data.status, 'closed');
      assert.equal(res.body.data.massKgPerPeriod, 4500);
    });
  });
});
