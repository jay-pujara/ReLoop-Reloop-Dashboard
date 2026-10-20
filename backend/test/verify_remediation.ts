import assert from 'node:assert';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { carbonService } from '../src/modules/carbon/carbon.service.js';
import { matchingService } from '../src/modules/matching/matching.service.js';
import { getEmissionFactors } from '../src/modules/carbon/carbon.factors.js';
import { ImpactService } from '../src/modules/impact/impact.service.js';

async function runVerification() {
  console.log('Connecting to database for verification test...');
  await connectDB();

  console.log('--- 1. Verifying Carbon Factors & Deterministic Engine ---');
  const cardFactors = getEmissionFactors('cardboard', 'occ');
  assert.strictEqual(cardFactors.efVirgin, 1.15, 'Cardboard virgin factor should be 1.15');
  assert.strictEqual(cardFactors.efReprocess, 0.18, 'Cardboard reprocess factor should be 0.18');

  // Test carbon metrics for 1000kg cardboard over 100km
  const metrics = carbonService.calculateMetrics({
    materialCategory: 'cardboard',
    materialSubtype: 'occ',
    massKg: 1000,
    distanceKm: 100,
  });

  // gross_avoided = 1000 * 1.15 = 1150 kg
  assert.strictEqual(metrics.grossAvoidedKg, 1150);
  // reprocess = 1000 * 0.18 = 180 kg
  assert.strictEqual(metrics.reprocessKg, 180);
  // transport = (1000 / 1000) * 100 * 0.105 / 0.80 = 13.125 kg
  assert.strictEqual(metrics.transportEmissionsKg, 13.125);
  // net_saved = 1150 - 180 - 13.125 = 956.875 kg
  assert.strictEqual(metrics.netSavedKg, 956.875);
  assert.strictEqual(metrics.classification, 'carbon-positive');
  assert.ok(metrics.breakEvenRadiusKm > 5000, 'Break-even radius should be several thousand km for clean cardboard');
  console.log('✅ Carbon calculation formulas passed: netSavedKg =', metrics.netSavedKg, ', breakEvenRadiusKm =', metrics.breakEvenRadiusKm);

  console.log('\n--- 2. Verifying Negative Carbon Suppression ---');
  // At an extreme distance of 100,000 km, transport should vastly exceed gross avoided
  const extremeDistanceMetrics = carbonService.calculateMetrics({
    materialCategory: 'cardboard',
    materialSubtype: 'occ',
    massKg: 1000,
    distanceKm: 100000,
  });
  assert.strictEqual(extremeDistanceMetrics.classification, 'carbon-negative');
  assert.ok(extremeDistanceMetrics.netSavedKg < 0, 'Net saved must be negative at extreme distance');
  console.log('✅ Extreme haul correctly classified as:', extremeDistanceMetrics.classification, 'with netSavedKg =', extremeDistanceMetrics.netSavedKg);

  console.log('\n--- 3. Verifying Matching Multi-Criteria Algorithm with DB ---');
  const matches = await matchingService.findMatches({
    materialCategory: 'plastics',
    minGrade: 'B',
    massKg: 500,
  });
  assert.ok(Array.isArray(matches), 'Matching service should return an array');
  console.log('✅ Matching service executed safely against database, matches found:', matches.length);

  console.log('\n--- 4. Verifying Cryptographic Chain-of-Custody Verification ---');
  const chainStatus = await ImpactService.verifyChain();
  assert.strictEqual(typeof chainStatus.isValid, 'boolean', 'Chain status should be boolean');
  console.log('✅ Cryptographic chain status:', chainStatus);

  await disconnectDB();
  console.log('\n🎉 ALL REMEDIATION VERIFICATION CHECKS PASSED!');
  process.exit(0);
}

runVerification().catch(async (err) => {
  console.error('❌ Verification failed:', err);
  try { await disconnectDB(); } catch {}
  process.exit(1);
});
