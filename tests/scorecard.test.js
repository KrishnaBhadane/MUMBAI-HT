import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAdditiveRiskScore,
  getRiskBand,
  SCORECARD_CONFIG,
  calculateEMI,
  calculateFOIR,
  calculateLTV,
  calculateMaxEligibleLoanAmount,
  runPreliminaryUnderwritingEngine,
} from '../src/services/underwritingEngine.js';

test('NIRNAY Phase 2.1 — Risk Scorecard Test Suite', async (t) => {
  await t.test('1. Baseline Starting Score and Default State', () => {
    const result = calculateAdditiveRiskScore({});
    assert.equal(result.startingScore, 50, 'Starting score must be 50');
    assert.equal(result.finalScore, 50, 'Empty input should result in baseline score of 50');
    assert.equal(result.riskBand, 'Borderline', 'Score 50 falls in Borderline band (50-64)');
    assert.equal(result.missingDataIndicators.hasMissingData, true);
    assert.deepEqual(result.missingDataIndicators.missingFields.sort(), [
      'bureauScore',
      'employmentVintage',
      'foir',
      'ltv',
    ].sort());
    assert.equal(typeof result.disclaimer, 'string');
    assert.ok(result.disclaimer.includes('Illustrative internal risk scorecard'));
  });

  await t.test('2. Bureau Score Boundaries', () => {
    // Prime: >= 750 -> +20 (RC_BUR_PRIME)
    const prime750 = calculateAdditiveRiskScore({ creditBureauScore: 750, calculatedFOIR: 52, calculatedLTV: 78, yearsInJob: 2 });
    const burPrime = prime750.factorAdjustments.find(f => f.factorKey === 'bureau');
    assert.equal(burPrime.points, 20);
    assert.equal(burPrime.reasonCode, 'RC_BUR_PRIME');

    // Good: 700 - 749 -> +10 (RC_BUR_GOOD)
    const good749 = calculateAdditiveRiskScore({ creditBureauScore: 749 });
    assert.equal(good749.factorAdjustments.find(f => f.factorKey === 'bureau').points, 10);
    assert.equal(good749.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_GOOD');

    const good700 = calculateAdditiveRiskScore({ creditBureauScore: 700 });
    assert.equal(good700.factorAdjustments.find(f => f.factorKey === 'bureau').points, 10);
    assert.equal(good700.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_GOOD');

    // Moderate: 650 - 699 -> 0 (RC_BUR_MODERATE)
    const mod699 = calculateAdditiveRiskScore({ creditBureauScore: 699 });
    assert.equal(mod699.factorAdjustments.find(f => f.factorKey === 'bureau').points, 0);
    assert.equal(mod699.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_MODERATE');

    const mod650 = calculateAdditiveRiskScore({ creditBureauScore: 650 });
    assert.equal(mod650.factorAdjustments.find(f => f.factorKey === 'bureau').points, 0);
    assert.equal(mod650.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_MODERATE');

    // Subprime: < 650 -> -20 (RC_BUR_SUBPRIME)
    const sub649 = calculateAdditiveRiskScore({ creditBureauScore: 649 });
    assert.equal(sub649.factorAdjustments.find(f => f.factorKey === 'bureau').points, -20);
    assert.equal(sub649.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_SUBPRIME');

    const sub580 = calculateAdditiveRiskScore({ creditBureauScore: 580 });
    assert.equal(sub580.factorAdjustments.find(f => f.factorKey === 'bureau').points, -20);
    assert.equal(sub580.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_SUBPRIME');
  });

  await t.test('3. Bureau Overdue Delinquencies (DPD > 30 Days Trigger)', () => {
    // Score is 800 (Prime), but DPD is 31 (> 30) -> Overrides to Subprime (-20)
    const delinquent = calculateAdditiveRiskScore({ creditBureauScore: 800, overdueDays: 31 });
    const burFactor = delinquent.factorAdjustments.find(f => f.factorKey === 'bureau');
    assert.equal(burFactor.points, -20);
    assert.equal(burFactor.reasonCode, 'RC_BUR_SUBPRIME');
    assert.ok(burFactor.explanation.includes('> 30 DPD'));

    // Score is 800, DPD is exactly 30 (not > 30) -> Retains Prime (+20)
    const onTime = calculateAdditiveRiskScore({ creditBureauScore: 800, overdueDays: 30 });
    assert.equal(onTime.factorAdjustments.find(f => f.factorKey === 'bureau').points, 20);
    assert.equal(onTime.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_PRIME');
  });

  await t.test('4. FOIR Scoring Boundaries', () => {
    // <= 40% -> +15 (RC_FOIR_COMFORT)
    const foir40 = calculateAdditiveRiskScore({ calculatedFOIR: 40.0 });
    assert.equal(foir40.factorAdjustments.find(f => f.factorKey === 'foir').points, 15);
    assert.equal(foir40.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_COMFORT');

    // > 40% to 50% -> +5 (RC_FOIR_ACCEPTABLE)
    const foir401 = calculateAdditiveRiskScore({ calculatedFOIR: 40.1 });
    assert.equal(foir401.factorAdjustments.find(f => f.factorKey === 'foir').points, 5);
    assert.equal(foir401.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_ACCEPTABLE');

    const foir50 = calculateAdditiveRiskScore({ calculatedFOIR: 50.0 });
    assert.equal(foir50.factorAdjustments.find(f => f.factorKey === 'foir').points, 5);
    assert.equal(foir50.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_ACCEPTABLE');

    // > 50% to 55% -> 0 (RC_FOIR_THRESHOLD)
    const foir501 = calculateAdditiveRiskScore({ calculatedFOIR: 50.1 });
    assert.equal(foir501.factorAdjustments.find(f => f.factorKey === 'foir').points, 0);
    assert.equal(foir501.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_THRESHOLD');

    const foir55 = calculateAdditiveRiskScore({ calculatedFOIR: 55.0 });
    assert.equal(foir55.factorAdjustments.find(f => f.factorKey === 'foir').points, 0);
    assert.equal(foir55.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_THRESHOLD');

    // > 55% -> -15 (RC_FOIR_STRETCH)
    const foir551 = calculateAdditiveRiskScore({ calculatedFOIR: 55.1 });
    assert.equal(foir551.factorAdjustments.find(f => f.factorKey === 'foir').points, -15);
    assert.equal(foir551.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_STRETCH');
  });

  await t.test('5. LTV Scoring Boundaries', () => {
    // <= 65% -> +10 (RC_LTV_CONSERVATIVE)
    const ltv65 = calculateAdditiveRiskScore({ calculatedLTV: 65.0 });
    assert.equal(ltv65.factorAdjustments.find(f => f.factorKey === 'ltv').points, 10);
    assert.equal(ltv65.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_CONSERVATIVE');

    // > 65% to 75% -> +5 (RC_LTV_MODERATE)
    const ltv651 = calculateAdditiveRiskScore({ calculatedLTV: 65.1 });
    assert.equal(ltv651.factorAdjustments.find(f => f.factorKey === 'ltv').points, 5);
    assert.equal(ltv651.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_MODERATE');

    const ltv75 = calculateAdditiveRiskScore({ calculatedLTV: 75.0 });
    assert.equal(ltv75.factorAdjustments.find(f => f.factorKey === 'ltv').points, 5);
    assert.equal(ltv75.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_MODERATE');

    // > 75% to 80% -> 0 (RC_LTV_HIGH)
    const ltv751 = calculateAdditiveRiskScore({ calculatedLTV: 75.1 });
    assert.equal(ltv751.factorAdjustments.find(f => f.factorKey === 'ltv').points, 0);
    assert.equal(ltv751.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_HIGH');

    const ltv80 = calculateAdditiveRiskScore({ calculatedLTV: 80.0 });
    assert.equal(ltv80.factorAdjustments.find(f => f.factorKey === 'ltv').points, 0);
    assert.equal(ltv80.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_HIGH');

    // > 80% -> -10 (RC_LTV_MAXED)
    const ltv801 = calculateAdditiveRiskScore({ calculatedLTV: 80.1 });
    assert.equal(ltv801.factorAdjustments.find(f => f.factorKey === 'ltv').points, -10);
    assert.equal(ltv801.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_MAXED');
  });

  await t.test('6. Employment Vintage Boundaries', () => {
    // > 3 years -> +5 (RC_VINTAGE_STABLE)
    const vin31 = calculateAdditiveRiskScore({ yearsInJob: 3.1 });
    assert.equal(vin31.factorAdjustments.find(f => f.factorKey === 'vintage').points, 5);
    assert.equal(vin31.factorAdjustments.find(f => f.factorKey === 'vintage').reasonCode, 'RC_VINTAGE_STABLE');

    // 1 - 3 years -> +2 (RC_VINTAGE_ADEQUATE)
    const vin30 = calculateAdditiveRiskScore({ yearsInJob: 3.0 });
    assert.equal(vin30.factorAdjustments.find(f => f.factorKey === 'vintage').points, 2);
    assert.equal(vin30.factorAdjustments.find(f => f.factorKey === 'vintage').reasonCode, 'RC_VINTAGE_ADEQUATE');

    const vin10 = calculateAdditiveRiskScore({ yearsInJob: 1.0 });
    assert.equal(vin10.factorAdjustments.find(f => f.factorKey === 'vintage').points, 2);
    assert.equal(vin10.factorAdjustments.find(f => f.factorKey === 'vintage').reasonCode, 'RC_VINTAGE_ADEQUATE');

    // < 1 year -> -5 (RC_VINTAGE_PROBATION)
    const vin09 = calculateAdditiveRiskScore({ yearsInJob: 0.9 });
    assert.equal(vin09.factorAdjustments.find(f => f.factorKey === 'vintage').points, -5);
    assert.equal(vin09.factorAdjustments.find(f => f.factorKey === 'vintage').reasonCode, 'RC_VINTAGE_PROBATION');

    const vin00 = calculateAdditiveRiskScore({ yearsInJob: 0 });
    assert.equal(vin00.factorAdjustments.find(f => f.factorKey === 'vintage').points, -5);
    assert.equal(vin00.factorAdjustments.find(f => f.factorKey === 'vintage').reasonCode, 'RC_VINTAGE_PROBATION');
  });

  await t.test('7. Maximum Score, Minimum Score, and Clamping', () => {
    // Maximum Possible: 50 + 20 + 15 + 10 + 5 = 100
    const maxProfile = calculateAdditiveRiskScore({
      creditBureauScore: 780, // +20
      calculatedFOIR: 35.0,   // +15
      calculatedLTV: 60.0,    // +10
      yearsInJob: 5,          // +5
    });
    assert.equal(maxProfile.rawScore, 100);
    assert.equal(maxProfile.finalScore, 100);
    assert.equal(maxProfile.isClamped, false);
    assert.equal(maxProfile.riskBand, 'Prime');

    // Minimum Possible: 50 - 20 - 15 - 10 - 5 = 0
    const minProfile = calculateAdditiveRiskScore({
      creditBureauScore: 590, // -20
      calculatedFOIR: 75.0,   // -15
      calculatedLTV: 88.0,    // -10
      yearsInJob: 0.5,        // -5
    });
    assert.equal(minProfile.rawScore, 0);
    assert.equal(minProfile.finalScore, 0);
    assert.equal(minProfile.isClamped, false);
    assert.equal(minProfile.riskBand, 'High Risk');
  });

  await t.test('8. Risk Band Thresholds', () => {
    assert.equal(getRiskBand(100), 'Prime');
    assert.equal(getRiskBand(80), 'Prime');
    assert.equal(getRiskBand(79), 'Standard');
    assert.equal(getRiskBand(65), 'Standard');
    assert.equal(getRiskBand(64), 'Borderline');
    assert.equal(getRiskBand(50), 'Borderline');
    assert.equal(getRiskBand(49), 'High Risk');
    assert.equal(getRiskBand(0), 'High Risk');

    // Fractional boundary rounding behavior
    assert.equal(getRiskBand(79.6), 'Prime', '79.6 rounds to 80 -> Prime');
    assert.equal(getRiskBand(79.4), 'Standard', '79.4 rounds to 79 -> Standard');
    assert.equal(getRiskBand(64.6), 'Standard', '64.6 rounds to 65 -> Standard');
    assert.equal(getRiskBand(64.4), 'Borderline', '64.4 rounds to 64 -> Borderline');
    assert.equal(getRiskBand(49.6), 'Borderline', '49.6 rounds to 50 -> Borderline');
    assert.equal(getRiskBand(49.4), 'High Risk', '49.4 rounds to 49 -> High Risk');
  });

  await t.test('8b. Exact Specification Reason Codes Verification', () => {
    // Verify all 15 specification reason codes
    const expectedReasonCodes = [
      'RC_BUR_PRIME',
      'RC_BUR_GOOD',
      'RC_BUR_MODERATE',
      'RC_BUR_SUBPRIME',
      'RC_FOIR_COMFORT',
      'RC_FOIR_ACCEPTABLE',
      'RC_FOIR_THRESHOLD',
      'RC_FOIR_STRETCH',
      'RC_LTV_CONSERVATIVE',
      'RC_LTV_MODERATE',
      'RC_LTV_HIGH',
      'RC_LTV_MAXED',
      'RC_VINTAGE_STABLE',
      'RC_VINTAGE_ADEQUATE',
      'RC_VINTAGE_PROBATION',
      'RC_BUR_DATA_UNAVAILABLE',
      'RC_FOIR_DATA_UNAVAILABLE',
      'RC_LTV_DATA_UNAVAILABLE',
      'RC_VINTAGE_DATA_UNAVAILABLE',
    ];

    const definedCodes = [
      SCORECARD_CONFIG.BUREAU.REASON_PRIME,
      SCORECARD_CONFIG.BUREAU.REASON_GOOD,
      SCORECARD_CONFIG.BUREAU.REASON_MODERATE,
      SCORECARD_CONFIG.BUREAU.REASON_SUBPRIME,
      SCORECARD_CONFIG.BUREAU.REASON_UNAVAILABLE,
      SCORECARD_CONFIG.FOIR.REASON_COMFORT,
      SCORECARD_CONFIG.FOIR.REASON_ACCEPTABLE,
      SCORECARD_CONFIG.FOIR.REASON_THRESHOLD,
      SCORECARD_CONFIG.FOIR.REASON_STRETCH,
      SCORECARD_CONFIG.FOIR.REASON_UNAVAILABLE,
      SCORECARD_CONFIG.LTV.REASON_CONSERVATIVE,
      SCORECARD_CONFIG.LTV.REASON_MODERATE,
      SCORECARD_CONFIG.LTV.REASON_HIGH,
      SCORECARD_CONFIG.LTV.REASON_MAXED,
      SCORECARD_CONFIG.LTV.REASON_UNAVAILABLE,
      SCORECARD_CONFIG.VINTAGE.REASON_STABLE,
      SCORECARD_CONFIG.VINTAGE.REASON_ADEQUATE,
      SCORECARD_CONFIG.VINTAGE.REASON_PROBATION,
      SCORECARD_CONFIG.VINTAGE.REASON_UNAVAILABLE,
    ];

    for (const code of expectedReasonCodes) {
      assert.ok(definedCodes.includes(code), `Code ${code} must be defined in SCORECARD_CONFIG`);
    }
  });

  await t.test('9. Missing Bureau Data Handling', () => {
    const missingBureau = calculateAdditiveRiskScore({
      creditBureauScore: null,
      calculatedFOIR: 38.0,
      calculatedLTV: 70.0,
      yearsInJob: 4,
    });
    const bur = missingBureau.factorAdjustments.find(f => f.factorKey === 'bureau');
    assert.equal(bur.points, 0, 'No points awarded or deducted for missing bureau data');
    assert.equal(bur.reasonCode, 'RC_BUR_DATA_UNAVAILABLE');
    assert.equal(bur.isMissing, true);
    assert.equal(bur.provenance, 'UNAVAILABLE');
    assert.ok(missingBureau.missingDataIndicators.missingFields.includes('bureauScore'));
    // Score should be 50 + 0 + 15 + 5 + 5 = 75 (Standard band)
    assert.equal(missingBureau.finalScore, 75);
    assert.equal(missingBureau.riskBand, 'Standard');
  });

  await t.test('10. Synthetic Bureau Data Demarcation', () => {
    const synthetic = calculateAdditiveRiskScore({
      creditBureauScore: 780,
      bureauProvenance: 'SYNTHETIC_SANDBOX',
    });
    const bur = synthetic.factorAdjustments.find(f => f.factorKey === 'bureau');
    assert.equal(bur.points, 20);
    assert.equal(bur.isSynthetic, true);
    assert.equal(bur.provenance, 'SYNTHETIC_SANDBOX');
    assert.ok(bur.explanation.includes('[SYNTHETIC SANDBOX]'));
    assert.equal(synthetic.dataProvenance.bureau, 'SYNTHETIC_SANDBOX');
  });

  await t.test('11. Missing FOIR, LTV, and Vintage Handling', () => {
    const partial = calculateAdditiveRiskScore({
      creditBureauScore: 720, // +10
      calculatedFOIR: null,    // 0
      calculatedLTV: undefined,// 0
      yearsInJob: null,        // 0
    });
    assert.equal(partial.finalScore, 60); // 50 + 10 = 60 (Borderline)
    assert.equal(partial.riskBand, 'Borderline');
    assert.equal(partial.missingDataIndicators.hasMissingData, true);
    assert.ok(partial.missingDataIndicators.missingFields.includes('foir'));
    assert.ok(partial.missingDataIndicators.missingFields.includes('ltv'));
    assert.ok(partial.missingDataIndicators.missingFields.includes('employmentVintage'));
  });

  await t.test('12. Malformed and Invalid Inputs', () => {
    const malformed = calculateAdditiveRiskScore({
      creditBureauScore: 'not_a_number',
      calculatedFOIR: -25,
      calculatedLTV: 'invalid_text',
      yearsInJob: -3,
    });
    assert.equal(malformed.finalScore, 50);
    assert.equal(malformed.missingDataIndicators.hasMissingData, true);
    assert.equal(malformed.factorAdjustments.find(f => f.factorKey === 'bureau').reasonCode, 'RC_BUR_DATA_UNAVAILABLE');
    assert.equal(malformed.factorAdjustments.find(f => f.factorKey === 'foir').reasonCode, 'RC_FOIR_DATA_UNAVAILABLE');
    assert.equal(malformed.factorAdjustments.find(f => f.factorKey === 'ltv').reasonCode, 'RC_LTV_DATA_UNAVAILABLE');
    assert.equal(malformed.factorAdjustments.find(f => f.factorKey === 'vintage').reasonCode, 'RC_VINTAGE_DATA_UNAVAILABLE');
  });

  await t.test('13. Integrity of Existing Underwriting Calculations', () => {
    // calculateEMI
    const emi = calculateEMI(4500000, 8.5, 240);
    assert.equal(emi, 39052, 'Standard mortgage EMI calculation must be unchanged');

    // calculateFOIR
    const foir = calculateFOIR(12000, 39053, 125000);
    assert.equal(foir, 40.8, 'FOIR calculation must be unchanged');

    // calculateLTV
    const ltv = calculateLTV(4500000, 6250000);
    assert.equal(ltv, 72.0, 'LTV calculation must be unchanged');

    // calculateMaxEligibleLoanAmount
    const maxLoan = calculateMaxEligibleLoanAmount(125000, 12000, 8.5, 240);
    assert.ok(maxLoan > 0, 'Max eligible loan amount calculation must be unchanged');

    // runPreliminaryUnderwritingEngine integration
    const engineRun = runPreliminaryUnderwritingEngine({
      loanType: 'home_loan',
      loanAmountRequested: 4500000,
      tenureMonthsRequested: 240,
      netMonthlyIncome: 125000,
      existingMonthlyObligations: 12000,
      estimatedMarketValue: 6250000,
      creditBureauScore: 782,
      yearsInJob: 6,
    });

    assert.equal(engineRun.isBinding, false);
    assert.equal(engineRun.assessmentStatus, 'passed');
    assert.ok(engineRun.calculatedMetrics);
    assert.ok(engineRun.policyEvaluations.length >= 4);
    assert.ok(engineRun.riskScorecard, 'riskScorecard must be returned by preliminary engine');
    assert.equal(engineRun.riskScorecard.startingScore, 50);
    assert.equal(engineRun.riskScorecard.riskBand, 'Prime');
    assert.ok(engineRun.riskScorecard.finalScore >= 80);
  });
});
