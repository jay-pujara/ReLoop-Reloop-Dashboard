import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import request from 'supertest';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { FacilityModel } from '../src/modules/facilities/facilities.model.js';
import { ListingMediaModel } from '../src/modules/listings/listingMedia.model.js';
import { ListingModel } from '../src/modules/listings/listing.model.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required for F2 integration tests');

const app = createApp();

// Valid 1x1 PNG image buffer for real media tests
const validPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

interface Account {
  token: string;
  organizationId: string;
  facilityId: string;
}

const registerAndPrepare = async (suffix: string, organizationName: string): Promise<Account> => {
  const email = `f2-${suffix}-${crypto.randomUUID()}@example.test`;
  const password = 'integration-password-123';
  const register = await request(app).post('/api/v1/auth/register').send({
    email,
    password,
    name: `${suffix.toUpperCase()} Owner`,
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
      name: `${suffix.toUpperCase()} Facility`,
      facilityType: 'warehouse',
      address: { street: '1 Test Street', city: 'Chicago', country: 'USA' },
      location: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      operatingHours: { monday: { closed: false, opens: '09:00', closes: '17:00' } },
      hasForklift: true,
    })
    .expect(201);

  return { token, organizationId, facilityId: facility.body.data._id as string };
};

const listingPayload = (facilityId: string) => ({
  facilityId,
  materialCategory: 'cardboard',
  materialSubtype: 'corrugated_cardboard',
  title: 'Integration test cardboard lot',
  description: 'Real persisted listing',
  grade: 'B',
  massKg: 250,
  unitCount: 100,
  dimensionsMm: { length: 1200, width: 800, height: 150 },
  packagingState: 'reusable',
  availableFrom: '2026-09-12T09:00:00.000Z',
  availableUntil: '2026-10-12T17:00:00.000Z',
  askingPrice: { amount: 20, currency: 'USD' },
  openToOffers: true,
  pickupConstraints: { dockHours: { opens: '09:00', closes: '17:00' }, hasForklift: true, packagingMode: 'palletised' },
});

const uploadPhoto = async (token: string, listingId: string, filename: string) => request(app)
  .post(`/api/v1/listings/${listingId}/media`)
  .set('Authorization', `Bearer ${token}`)
  .attach('file', validPngBuffer, { filename, contentType: 'image/png' });

let accountA: Account;
let accountB: Account;
let listingId: string;
let uploadedMediaId: string;

after(async () => {
  try {
    const testStorageRoot = process.env.MEDIA_STORAGE_ROOT;
    if (testStorageRoot && testStorageRoot.includes('test_listings')) {
      await fs.rm(testStorageRoot, { recursive: true, force: true });
    }
  } catch {
    // Ignore storage cleanup error
  }

  try {
    await mongoose.connection.dropDatabase();
  } catch (_dropErr) {
    // Graceful fallback for MongoDB Atlas where dropDatabase is privilege-restricted
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

describe('F2 authenticated listing integration and hardening suite', () => {
  before(async () => {
    await connectDB();
    accountA = await registerAndPrepare('a', 'F2 Test Organisation A');
    accountB = await registerAndPrepare('b', 'F2 Test Organisation B');
  });

  it('requires authentication for listing creation', async () => {
    await request(app).post('/api/v1/listings').send(listingPayload(accountA.facilityId)).expect(401);
  });

  it('creates and persists a listing for Organisation A in MongoDB', async () => {
    const response = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${accountA.token}`)
      .send(listingPayload(accountA.facilityId))
      .expect(201);

    listingId = response.body.data._id as string;
    assert.ok(listingId, 'Expected listing ID to be returned');

    // Verify persistence directly in MongoDB
    const persisted = await ListingModel.findById(listingId).lean();
    assert.ok(persisted, 'Listing must exist in MongoDB');
    assert.equal(persisted.organizationId.toString(), accountA.organizationId);
    assert.equal(persisted.facilityId.toString(), accountA.facilityId);
    assert.equal(persisted.status, 'draft');
    assert.equal(persisted.massKg, 250);
    assert.equal(persisted.title, 'Integration test cardboard lot');
    assert.ok(persisted.createdAt, 'Expected createdAt timestamp');
    assert.ok(persisted.updatedAt, 'Expected updatedAt timestamp');
  });

  it('blocks cross-organisation facility assignment', async () => {
    // Org A attempts to use Org B's facility
    await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${accountA.token}`)
      .send(listingPayload(accountB.facilityId))
      .expect(404);

    // Verify nothing was created in MongoDB
    const count = await ListingModel.countDocuments({
      facilityId: accountB.facilityId,
      organizationId: accountA.organizationId,
    });
    assert.equal(count, 0, 'No listing should be created with cross-org facility');
  });

  it('authenticated GET retrieves persisted data matching MongoDB', async () => {
    const response = await request(app)
      .get(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(200);

    assert.equal(response.body.data._id, listingId);
    assert.equal(response.body.data.title, 'Integration test cardboard lot');

    // Update via API and verify GET reflects real updated state
    await request(app)
      .patch(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ description: 'Updated via authenticated integration test' })
      .expect(200);

    const check = await request(app)
      .get(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(200);

    assert.equal(check.body.data.description, 'Updated via authenticated integration test');
  });

  it('blocks private draft access across organisations (IDOR protection)', async () => {
    // Org B attempts to view Org A's draft listing
    await request(app)
      .get(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountB.token}`)
      .expect(404);
  });

  it('blocks listing modification across organisations', async () => {
    // Org B attempts to PATCH Org A's listing
    await request(app)
      .patch(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountB.token}`)
      .send({ title: 'Tampered by Org B' })
      .expect(404);

    // Verify database record was unaffected
    const record = await ListingModel.findById(listingId).lean();
    assert.equal(record?.title, 'Integration test cardboard lot');
  });

  it('blocks publishing across organisations', async () => {
    // Org B attempts to publish Org A's listing
    await request(app)
      .post(`/api/v1/listings/${listingId}/publish`)
      .set('Authorization', `Bearer ${accountB.token}`)
      .expect(404);

    // Verify status is still draft
    const record = await ListingModel.findById(listingId).lean();
    assert.equal(record?.status, 'draft');
  });

  it('enforces the three-photo publish rule and persists media', async () => {
    // 0 photos -> must fail
    await request(app)
      .post(`/api/v1/listings/${listingId}/publish`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(422);

    // Photo 1 -> must fail
    const p1 = await uploadPhoto(accountA.token, listingId, 'photo_1.png');
    assert.equal(p1.status, 201);
    uploadedMediaId = p1.body.data._id as string;

    await request(app)
      .post(`/api/v1/listings/${listingId}/publish`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(422);

    // Photo 2 -> must fail
    const p2 = await uploadPhoto(accountA.token, listingId, 'photo_2.png');
    assert.equal(p2.status, 201);

    await request(app)
      .post(`/api/v1/listings/${listingId}/publish`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(422);

    // Photo 3 -> must succeed!
    const p3 = await uploadPhoto(accountA.token, listingId, 'photo_3.png');
    assert.equal(p3.status, 201);

    const publishRes = await request(app)
      .post(`/api/v1/listings/${listingId}/publish`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(200);

    assert.equal(publishRes.body.data.status, 'published');

    // Verify status in MongoDB
    const persisted = await ListingModel.findById(listingId).lean();
    assert.equal(persisted?.status, 'published');

    // Verify exactly 3 media records exist in MongoDB
    const mediaCount = await ListingMediaModel.countDocuments({ listingId });
    assert.equal(mediaCount, 3, 'Expected exactly 3 media records in MongoDB');
  });

  it('downloads media safely through the storage abstraction', async () => {
    const downloadRes = await request(app)
      .get(`/api/v1/listings/${listingId}/media/${uploadedMediaId}`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(200);

    assert.equal(downloadRes.header['content-type'], 'image/png');
    assert.ok(downloadRes.body instanceof Buffer || Buffer.isBuffer(downloadRes.body) || downloadRes.body.length > 0);
  });

  it('rejects malicious and invalid media uploads', async () => {
    // 1. Unsupported MIME type (text/plain)
    await request(app)
      .post(`/api/v1/listings/${listingId}/media`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .attach('file', Buffer.from('console.log("bad");'), { filename: 'exploit.js', contentType: 'text/plain' })
      .expect(422);

    // 2. Missing file
    await request(app)
      .post(`/api/v1/listings/${listingId}/media`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(422);

    // 3. Media upload by unauthorized organisation (Org B)
    await request(app)
      .post(`/api/v1/listings/${listingId}/media`)
      .set('Authorization', `Bearer ${accountB.token}`)
      .attach('file', validPngBuffer, { filename: 'unauthorized.png', contentType: 'image/png' })
      .expect(404);

    // 4. Verify no extra media records were created
    const mediaCount = await ListingMediaModel.countDocuments({ listingId });
    assert.equal(mediaCount, 3, 'Media count must remain 3 after rejected uploads');
  });

  it('enforces status transitions and blocks arbitrary PATCH status changes', async () => {
    // Attempt arbitrary status bypass via PATCH
    await request(app)
      .patch(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ status: 'completed' })
      .expect(400);

    // Invalid transition: published -> completed directly
    await request(app)
      .post(`/api/v1/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ status: 'completed' })
      .expect(409);

    // Cross-organisation transition attempt
    await request(app)
      .post(`/api/v1/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${accountB.token}`)
      .send({ status: 'matched' })
      .expect(404);

    // Valid state transitions: published -> matched -> reserved -> in-transit -> completed
    const t1 = await request(app)
      .post(`/api/v1/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ status: 'matched' })
      .expect(200);
    assert.equal(t1.body.data.status, 'matched');

    const t2 = await request(app)
      .post(`/api/v1/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ status: 'reserved' })
      .expect(200);
    assert.equal(t2.body.data.status, 'reserved');

    const t3 = await request(app)
      .post(`/api/v1/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ status: 'in-transit' })
      .expect(200);
    assert.equal(t3.body.data.status, 'in-transit');

    const t4 = await request(app)
      .post(`/api/v1/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .send({ status: 'completed' })
      .expect(200);
    assert.equal(t4.body.data.status, 'completed');

    // Confirm final status in MongoDB
    const persisted = await ListingModel.findById(listingId).lean();
    assert.equal(persisted?.status, 'completed');
  });

  it('retrieves persisted data after a database reconnect', async () => {
    await disconnectDB();
    await connectDB();

    const response = await request(app)
      .get(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${accountA.token}`)
      .expect(200);

    assert.equal(response.body.data._id, listingId);
    assert.equal(response.body.data.status, 'completed');
  });

  it('imports valid listings from a flat CSV file into MongoDB', async () => {
    const csvContent = [
      'title,description,material_type,material_subtype,grade,mass_kg,unit_count,length_mm,width_mm,height_mm,packaging_state,available_from,available_until,price_per_kg,open_to_offers,facility_id,has_forklift,packaging_mode,dock_opens,dock_closes',
      `CSV Baled OCC Corrugated,High quality baled OCC,cardboard,occ,A,3500,10,1200,800,1000,reusable,2026-10-01T09:00:00.000Z,2026-11-01T17:00:00.000Z,0.20,true,${accountA.facilityId},true,palletised,08:00,17:00`,
      `CSV Wooden Pallets Lot,Clean heat-treated europallets,pallets,euro_pallet,B,1800,90,1200,800,144,reusable,2026-10-05T08:00:00.000Z,2026-11-05T17:00:00.000Z,3.50,false,${accountA.facilityId},true,palletised,09:00,17:00`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/listings/bulk')
      .set('Authorization', `Bearer ${accountA.token}`)
      .attach('file', Buffer.from(csvContent, 'utf8'), { filename: 'valid_import.csv', contentType: 'text/csv' })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.created, 2, 'Expected 2 listings created');
    assert.equal(res.body.data.failed, 0, 'Expected 0 failures');
    assert.equal(res.body.data.errors.length, 0);
    assert.equal(res.body.data.listingIds.length, 2);

    // Verify in MongoDB
    const id1 = res.body.data.listingIds[0];
    const id2 = res.body.data.listingIds[1];
    const listing1 = await ListingModel.findById(id1).lean();
    const listing2 = await ListingModel.findById(id2).lean();

    assert.ok(listing1);
    assert.equal(listing1.title, 'CSV Baled OCC Corrugated');
    assert.equal(listing1.massKg, 3500);
    assert.equal(listing1.organizationId.toString(), accountA.organizationId);
    assert.equal(listing1.facilityId.toString(), accountA.facilityId);
    assert.equal(listing1.status, 'draft');

    assert.ok(listing2);
    assert.equal(listing2.title, 'CSV Wooden Pallets Lot');
    assert.equal(listing2.massKg, 1800);
  });

  it('rejects invalid rows and cross-organisation facilities in CSV with structured errors', async () => {
    const badCsv = [
      'title,description,material_type,material_subtype,grade,mass_kg,unit_count,length_mm,width_mm,height_mm,packaging_state,available_from,available_until,price_per_kg,open_to_offers,facility_id,has_forklift,packaging_mode,dock_opens,dock_closes',
      // Row 2: Invalid grade 'X'
      `Bad Grade Lot,Desc,cardboard,occ,X,1000,,,,,reusable,2026-10-01,2026-11-01,0.1,true,${accountA.facilityId},true,palletised,09:00,17:00`,
      // Row 3: Invalid mass -100
      `Negative Mass Lot,Desc,cardboard,occ,A,-100,,,,,reusable,2026-10-01,2026-11-01,0.1,true,${accountA.facilityId},true,palletised,09:00,17:00`,
      // Row 4: Available until before available from
      `Bad Dates Lot,Desc,cardboard,occ,A,500,,,,,reusable,2026-11-01,2026-10-01,0.1,true,${accountA.facilityId},true,palletised,09:00,17:00`,
      // Row 5: Cross-organisation facility (Org A attempts to import into Org B's facility)
      `Cross Org Facility,Desc,cardboard,occ,A,500,,,,,reusable,2026-10-01,2026-11-01,0.1,true,${accountB.facilityId},true,palletised,09:00,17:00`,
      // Row 6: Invalid boolean
      `Bad Boolean Lot,Desc,cardboard,occ,A,500,,,,,reusable,2026-10-01,2026-11-01,0.1,maybe,${accountA.facilityId},true,palletised,09:00,17:00`,
      // Row 7: Valid row in same file (partial failure verification)
      `Partially Valid Lot,Valid Desc,cardboard,occ,A,750,,,,,reusable,2026-10-01,2026-11-01,0.1,true,${accountA.facilityId},true,palletised,09:00,17:00`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/listings/bulk')
      .set('Authorization', `Bearer ${accountA.token}`)
      .attach('file', Buffer.from(badCsv, 'utf8'), { filename: 'bad_import.csv', contentType: 'text/csv' })
      .expect(200);

    assert.equal(res.body.data.created, 1, 'Exactly 1 valid row should be created');
    assert.equal(res.body.data.failed, 5, 'Exactly 5 invalid rows should fail');

    const errors = res.body.data.errors as Array<{ row: number; field: string; message: string }>;
    assert.ok(errors.find((e) => e.row === 2 && e.field === 'grade'), 'Expected error for row 2 grade');
    assert.ok(errors.find((e) => e.row === 3 && e.field === 'mass_kg'), 'Expected error for row 3 mass_kg');
    assert.ok(errors.find((e) => e.row === 4 && e.field === 'available_until'), 'Expected error for row 4 available_until');
    assert.ok(errors.find((e) => e.row === 5 && e.field === 'facility_id'), 'Expected error for row 5 facility_id (cross-org)');
    assert.ok(errors.find((e) => e.row === 6 && e.field === 'open_to_offers'), 'Expected error for row 6 open_to_offers');

    // Confirm in MongoDB: no listing was created with Org B's facility under Org A
    const crossCheck = await ListingModel.countDocuments({
      facilityId: accountB.facilityId,
      organizationId: accountA.organizationId,
    });
    assert.equal(crossCheck, 0, 'No listing should ever be created with cross-organisation facility');
  });
});
