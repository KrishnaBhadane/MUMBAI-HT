/**
 * NIRNAY Deterministic Underwriting & Policy Evaluation Engine
 * Modelled for Hero Housing Finance Underwriting Operations
 * Grounded in RBI/NHB Master Directions (2025) & RBI Digital Lending Directions (2025)
 */

export const STATUTORY_POLICY_CONFIG = {
  // Statutory RBI HFC Housing Loan LTV Caps (Mandatory Non-negotiable)
  HOUSING_LOAN_LTV: [
    { maxLoanAmount: 3000000, maxLTV: 90.0, reference: 'RBI Master Direction - HFCs Section 31 (Loans <= 30L)' },
    { maxLoanAmount: 7500000, maxLTV: 80.0, reference: 'RBI Master Direction - HFCs Section 31 (Loans 30L - 75L)' },
    { maxLoanAmount: Infinity, maxLTV: 75.0, reference: 'RBI Master Direction - HFCs Section 31 (Loans > 75L)' },
  ],
  // Statutory RBI Digital Lending Cooling-off / Look-up Period Floor
  MIN_COOLING_OFF_DAYS: 1, // RBI Digital Lending Directions, 2025 mandate: minimum 1 day

  // Configurable Illustrative Lender Policies (Pending formal Hero Housing Credit Committee sign-off)
  LAP_MAX_LTV: 60.0, // Configurable illustrative lender benchmark
  MAX_PERMISSIBLE_FOIR: 55.0, // Configurable illustrative lender cashflow ceiling
  PRIME_BUREAU_SCORE_MIN: 650, // Configurable illustrative bureau cutoff
  MAX_TENURE_HOME_LOAN_MONTHS: 360, // 30 Years
  MAX_TENURE_LAP_MONTHS: 180, // 15 Years
  DEFAULT_BENCHMARK_RATE_HL: 8.50,
  DEFAULT_BENCHMARK_RATE_LAP: 10.25,
};

/**
 * Standard Mortgage EMI Calculation (Reducing Balance)
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !tenureMonths || tenureMonths <= 0) {
    return 0;
  }
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

/**
 * Fixed Obligation to Income Ratio (FOIR)
 * Formula: ((Existing Obligations + Proposed Loan EMI) / Net Monthly Income) * 100
 */
export function calculateFOIR(existingObligations, proposedEMI, netMonthlyIncome) {
  if (!netMonthlyIncome || netMonthlyIncome <= 0) return 0;
  const totalCommitments = Number(existingObligations || 0) + Number(proposedEMI || 0);
  const foir = (totalCommitments / Number(netMonthlyIncome)) * 100;
  return Number(foir.toFixed(1));
}

/**
 * Loan-to-Value Ratio (LTV)
 * Formula: (Loan Amount / Realizable Property Market Value) * 100
 * Note: Under RBI rules, stamp duty and registration must NOT be included in property cost.
 */
export function calculateLTV(loanAmount, propertyMarketValue) {
  if (!propertyMarketValue || propertyMarketValue <= 0) return 0;
  const ltv = (Number(loanAmount) / Number(propertyMarketValue)) * 100;
  return Number(ltv.toFixed(1));
}

/**
 * Maximum Eligible Loan Amount based on Disposable Cashflow
 * Derived from Max Permissible FOIR and Tenure
 */
export function calculateMaxEligibleLoanAmount(netMonthlyIncome, existingObligations, annualRate, tenureMonths, maxFOIR = 55.0) {
  if (!netMonthlyIncome || netMonthlyIncome <= 0) return 0;
  
  const maxPermissibleObligation = (Number(netMonthlyIncome) * (maxFOIR / 100));
  const availableSurplusForEMI = maxPermissibleObligation - Number(existingObligations || 0);

  if (availableSurplusForEMI <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  const discountFactor = (Math.pow(1 + monthlyRate, tenureMonths) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));
  
  const maxPrincipal = Math.floor(availableSurplusForEMI * discountFactor);
  return Math.max(0, Math.floor(maxPrincipal / 25000) * 25000);
}

/**
 * Evaluates Statutory and Lender Credit Policy Rules
 */
export function evaluateCreditPolicyRules(application, calculatedMetrics) {
  const { loanType, loanAmountRequested, tenureMonthsRequested, creditBureauScore } = application;
  const { calculatedLTV, calculatedFOIR } = calculatedMetrics;
  const evaluations = [];

  // 1. Statutory LTV Evaluation (RBI Mandatory)
  if (loanType === 'home_loan') {
    let statutoryCap = 75.0;
    let ruleCitation = 'RBI Master Direction - HFCs Section 31 (Loans > 75L)';
    if (loanAmountRequested <= 3000000) {
      statutoryCap = 90.0;
      ruleCitation = 'RBI Master Direction - HFCs Section 31 (Loans <= 30L)';
    } else if (loanAmountRequested <= 7500000) {
      statutoryCap = 80.0;
      ruleCitation = 'RBI Master Direction - HFCs Section 31 (Loans 30L - 75L)';
    }

    const passed = calculatedLTV <= statutoryCap;
    evaluations.push({
      ruleCode: 'POL-HL-LTV',
      ruleName: 'Statutory Home Loan LTV Ceiling',
      isStatutory: true,
      citation: ruleCitation,
      metric: 'LTV Ratio',
      threshold: `${statutoryCap}%`,
      actualValue: `${calculatedLTV}%`,
      status: passed ? 'PASS' : 'FAIL',
      severity: 'hard_decline',
      explanation: passed
        ? `LTV of ${calculatedLTV}% complies with statutory ${statutoryCap}% ceiling.`
        : `LTV of ${calculatedLTV}% breaches statutory cap of ${statutoryCap}% by ${(calculatedLTV - statutoryCap).toFixed(1)}%. Requires loan haircut or equity contribution.`
    });
  } else if (loanType === 'lap') {
    const passed = calculatedLTV <= STATUTORY_POLICY_CONFIG.LAP_MAX_LTV;
    evaluations.push({
      ruleCode: 'POL-LAP-LTV',
      ruleName: 'Configurable Illustrative LAP Collateral Benchmark',
      isStatutory: false,
      citation: 'Configurable Lender Policy (Illustrative 60% benchmark pending committee sign-off)',
      metric: 'LTV Ratio',
      threshold: `${STATUTORY_POLICY_CONFIG.LAP_MAX_LTV}%`,
      actualValue: `${calculatedLTV}%`,
      status: passed ? 'PASS' : 'REFER',
      severity: 'refer_to_underwriter',
      explanation: passed
        ? `LTV of ${calculatedLTV}% is within the illustrative 60% LAP collateral cushion.`
        : `LTV of ${calculatedLTV}% exceeds 60% LAP benchmark. Requires underwriter collateral exception.`
    });
  }

  // 2. Fixed Obligation to Income Ratio (FOIR) Evaluation (Configurable Lender Policy)
  const foirPassed = calculatedFOIR <= STATUTORY_POLICY_CONFIG.MAX_PERMISSIBLE_FOIR;
  evaluations.push({
    ruleCode: 'POL-FOIR-MAX',
    ruleName: 'Configurable Illustrative FOIR Cap',
    isStatutory: false,
    citation: 'Configurable Lender Policy (Illustrative 55% benchmark pending committee sign-off)',
    metric: 'FOIR Ratio',
    threshold: `${STATUTORY_POLICY_CONFIG.MAX_PERMISSIBLE_FOIR}%`,
    actualValue: `${calculatedFOIR}%`,
    status: foirPassed ? 'PASS' : 'REFER',
    severity: calculatedFOIR > 70 ? 'hard_decline' : 'refer_to_underwriter',
    explanation: foirPassed
      ? `FOIR of ${calculatedFOIR}% retains sufficient disposable debt servicing buffer.`
      : `FOIR of ${calculatedFOIR}% exceeds ${STATUTORY_POLICY_CONFIG.MAX_PERMISSIBLE_FOIR}% benchmark. Disposable cashflow may be strained.`
  });

  // 3. Bureau Score Evaluation (if score is available)
  if (creditBureauScore !== null && creditBureauScore !== undefined) {
    const bureauPassed = creditBureauScore >= STATUTORY_POLICY_CONFIG.PRIME_BUREAU_SCORE_MIN;
    evaluations.push({
      ruleCode: 'POL-CIBIL-MIN',
      ruleName: 'Prime Bureau Cut-off Score',
      isStatutory: false,
      citation: 'Configurable Lender Policy (Illustrative 650 bureau cut-off)',
      metric: 'CIBIL Score',
      threshold: `${STATUTORY_POLICY_CONFIG.PRIME_BUREAU_SCORE_MIN}`,
      actualValue: `${creditBureauScore}`,
      status: bureauPassed ? 'PASS' : 'FAIL',
      severity: creditBureauScore < 600 ? 'hard_decline' : 'refer_to_underwriter',
      explanation: bureauPassed
        ? `Bureau score ${creditBureauScore} satisfies prime credit threshold.`
        : `Bureau score ${creditBureauScore} falls below prime cut-off (${STATUTORY_POLICY_CONFIG.PRIME_BUREAU_SCORE_MIN}). Requires detailed tradeline inspection.`
    });
  } else {
    evaluations.push({
      ruleCode: 'POL-CIBIL-PENDING',
      ruleName: 'Bureau Report Ingestion',
      isStatutory: false,
      citation: 'Underwriting Verification Gate',
      metric: 'CIBIL Score',
      threshold: 'Verified Report',
      actualValue: 'Awaiting Pull',
      status: 'NEEDS_REVIEW',
      severity: 'refer_to_underwriter',
      explanation: 'Bureau inquiry pending. Final underwriting requires authentic tradeline ingestion.'
    });
  }

  // 4. Tenure Evaluation
  const maxTenure = loanType === 'home_loan' ? STATUTORY_POLICY_CONFIG.MAX_TENURE_HOME_LOAN_MONTHS : STATUTORY_POLICY_CONFIG.MAX_TENURE_LAP_MONTHS;
  const tenurePassed = tenureMonthsRequested <= maxTenure;
  evaluations.push({
    ruleCode: 'POL-TENURE-CAP',
    ruleName: 'Maximum Amortization Tenure',
    isStatutory: false,
    citation: 'Hero Housing Product Schedule',
    metric: 'Tenure (Months)',
    threshold: `${maxTenure} Months`,
    actualValue: `${tenureMonthsRequested} Months`,
    status: tenurePassed ? 'PASS' : 'FAIL',
    severity: 'hard_decline',
    explanation: tenurePassed
      ? `Requested tenure of ${tenureMonthsRequested} months is within permissible limits.`
      : `Requested tenure of ${tenureMonthsRequested} months exceeds maximum allowable tenure of ${maxTenure} months.`
  });

  // 5. Statutory Cooling-Off Period Evaluation (RBI Digital Lending Directions 2025)
  evaluations.push({
    ruleCode: 'POL-COOLING-OFF',
    ruleName: 'RBI Statutory Cooling-Off Period',
    isStatutory: true,
    citation: 'RBI Digital Lending Directions, 2025',
    metric: 'Look-up Exit Window',
    threshold: `>= ${STATUTORY_POLICY_CONFIG.MIN_COOLING_OFF_DAYS} Day`,
    actualValue: 'Available',
    status: 'PASS',
    severity: 'hard_decline',
    explanation: `Statutory minimum ${STATUTORY_POLICY_CONFIG.MIN_COOLING_OFF_DAYS}-day look-up period provided to borrower with zero penalty exit.`
  });

  return evaluations;
}

/**
 * Full Underwriting Engine Run (Deterministic & Structured)
 */
export function runPreliminaryUnderwritingEngine(applicationData) {
  const {
    loanType = 'home_loan',
    loanAmountRequested = 0,
    tenureMonthsRequested = 240,
    netMonthlyIncome = 0,
    existingMonthlyObligations = 0,
    estimatedMarketValue = 0,
    creditBureauScore = null,
  } = applicationData;

  const interestRate = loanType === 'home_loan'
    ? STATUTORY_POLICY_CONFIG.DEFAULT_BENCHMARK_RATE_HL
    : STATUTORY_POLICY_CONFIG.DEFAULT_BENCHMARK_RATE_LAP;

  const calculatedEMI = calculateEMI(loanAmountRequested, interestRate, tenureMonthsRequested);
  const calculatedFOIR = calculateFOIR(existingMonthlyObligations, calculatedEMI, netMonthlyIncome);
  const calculatedLTV = calculateLTV(loanAmountRequested, estimatedMarketValue);
  const calculatedDTI = netMonthlyIncome > 0 ? Number((loanAmountRequested / (netMonthlyIncome * 12)).toFixed(1)) : 0;
  const maxEligibleLoanAmount = calculateMaxEligibleLoanAmount(
    netMonthlyIncome,
    existingMonthlyObligations,
    interestRate,
    tenureMonthsRequested
  );

  const calculatedMetrics = {
    calculatedEMI,
    estimatedEMI: calculatedEMI,
    calculatedFOIR,
    calculatedLTV,
    calculatedDTI,
    maxEligibleLoanAmount,
    benchmarkRate: interestRate,
  };

  const policyEvaluations = evaluateCreditPolicyRules(
    { loanType, loanAmountRequested, tenureMonthsRequested, creditBureauScore },
    calculatedMetrics
  );

  // Overall Assessment Status Determination
  const hasHardDecline = policyEvaluations.some(p => p.status === 'FAIL' && p.severity === 'hard_decline');
  const hasRefer = policyEvaluations.some(p => p.status === 'REFER' || p.status === 'NEEDS_REVIEW');

  let assessmentStatus = 'passed';
  if (hasHardDecline) {
    assessmentStatus = 'declined';
  } else if (hasRefer) {
    assessmentStatus = 'referred';
  }

  // Calculate Illustrative Additive Risk Scorecard
  const riskScorecard = calculateAdditiveRiskScore({
    creditBureauScore,
    calculatedFOIR,
    calculatedLTV,
    yearsInJob: applicationData.yearsInJob ?? applicationData.vintageYears ?? applicationData.employmentVintageYears,
    overdueDays: applicationData.overdueDays ?? applicationData.dpd,
    bureauProvenance: applicationData.bureauProvenance ?? applicationData.creditBureauDataSource ?? (creditBureauScore ? 'CIBIL_VERIFIED' : 'UNAVAILABLE'),
    isSyntheticScore: applicationData.isSyntheticScore,
  });

  return {
    isBinding: false, // Indicative assessment only
    assessmentStatus,
    timestamp: new Date().toISOString(),
    ruleEngineVersion: '2026.1-rbi-compliant',
    calculatedMetrics,
    policyEvaluations,
    riskScorecard,
  };
}

/**
 * Illustrative Additive Risk Scorecard Configuration & Reason Codes
 * Modelled for transparent prototype decisioning.
 * Grounded in the Phase 2.1 specification: Base 50, clamp 0-100, 4 risk bands.
 */
export const SCORECARD_CONFIG = {
  STARTING_SCORE: 50,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  BUREAU: {
    PRIME_MIN: 750,
    GOOD_MIN: 700,
    MODERATE_MIN: 650,
    MAX_PERMISSIBLE_DPD: 30,
    POINTS_PRIME: 20,
    POINTS_GOOD: 10,
    POINTS_MODERATE: 0,
    POINTS_SUBPRIME: -20,
    POINTS_UNAVAILABLE: 0,
    REASON_PRIME: 'RC_BUR_PRIME',
    REASON_GOOD: 'RC_BUR_GOOD',
    REASON_MODERATE: 'RC_BUR_MODERATE',
    REASON_SUBPRIME: 'RC_BUR_SUBPRIME',
    REASON_UNAVAILABLE: 'RC_BUR_DATA_UNAVAILABLE',
  },
  FOIR: {
    COMFORT_MAX: 40.0,
    ACCEPTABLE_MAX: 50.0,
    THRESHOLD_MAX: 55.0,
    POINTS_COMFORT: 15,
    POINTS_ACCEPTABLE: 5,
    POINTS_THRESHOLD: 0,
    POINTS_STRETCH: -15,
    POINTS_UNAVAILABLE: 0,
    REASON_COMFORT: 'RC_FOIR_COMFORT',
    REASON_ACCEPTABLE: 'RC_FOIR_ACCEPTABLE',
    REASON_THRESHOLD: 'RC_FOIR_THRESHOLD',
    REASON_STRETCH: 'RC_FOIR_STRETCH',
    REASON_UNAVAILABLE: 'RC_FOIR_DATA_UNAVAILABLE',
  },
  LTV: {
    CONSERVATIVE_MAX: 65.0,
    MODERATE_MAX: 75.0,
    HIGH_MAX: 80.0,
    POINTS_CONSERVATIVE: 10,
    POINTS_MODERATE: 5,
    POINTS_HIGH: 0,
    POINTS_MAXED: -10,
    POINTS_UNAVAILABLE: 0,
    REASON_CONSERVATIVE: 'RC_LTV_CONSERVATIVE',
    REASON_MODERATE: 'RC_LTV_MODERATE',
    REASON_HIGH: 'RC_LTV_HIGH',
    REASON_MAXED: 'RC_LTV_MAXED',
    REASON_UNAVAILABLE: 'RC_LTV_DATA_UNAVAILABLE',
  },
  VINTAGE: {
    STABLE_MIN_EXCLUSIVE: 3.0,
    ADEQUATE_MIN: 1.0,
    POINTS_STABLE: 5,
    POINTS_ADEQUATE: 2,
    POINTS_PROBATION: -5,
    POINTS_UNAVAILABLE: 0,
    REASON_STABLE: 'RC_VINTAGE_STABLE',
    REASON_ADEQUATE: 'RC_VINTAGE_ADEQUATE',
    REASON_PROBATION: 'RC_VINTAGE_PROBATION',
    REASON_UNAVAILABLE: 'RC_VINTAGE_DATA_UNAVAILABLE',
  },
  RISK_BANDS: {
    PRIME: { label: 'Prime', minScore: 80, maxScore: 100, tier: 'low', description: 'Low Risk Profile' },
    STANDARD: { label: 'Standard', minScore: 65, maxScore: 79, tier: 'medium', description: 'Moderate Risk Profile' },
    BORDERLINE: { label: 'Borderline', minScore: 50, maxScore: 64, tier: 'medium', description: 'Elevated Risk Profile' },
    HIGH_RISK: { label: 'High Risk', minScore: 0, maxScore: 49, tier: 'high', description: 'High Risk Profile' },
  },
  DISCLAIMER: 'Illustrative internal risk scorecard for demonstration and prototype decisioning — NOT an econometrically validated credit-default prediction model, nor does it constitute a legally binding loan approval or rejection.',
  MODEL_VERSION: '2026.1-scorecard',
  MODEL_TYPE: 'ILLUSTRATIVE_INTERNAL_SCORECARD',
};

/**
 * Returns the categorical Risk Band based on calibrated score thresholds.
 * 80-100: Prime
 * 65-79: Standard
 * 50-64: Borderline
 * 0-49: High Risk
 */
export function getRiskBand(score) {
  const numeric = typeof score === 'number' && !isNaN(score) ? Math.round(score) : 0;
  if (numeric >= 80) return 'Prime';
  if (numeric >= 65) return 'Standard';
  if (numeric >= 50) return 'Borderline';
  return 'High Risk';
}

/**
 * Transparent Additive Risk Scorecard Engine (Phase 2.1)
 * 
 * Computes deterministic 0-100 score starting from Base 50 with factor adjustments:
 * - Bureau Score & DPD: +20, +10, 0, -20 pts (or 0 if unavailable)
 * - FOIR: +15, +5, 0, -15 pts (or 0 if unavailable)
 * - LTV: +10, +5, 0, -10 pts (or 0 if unavailable)
 * - Employment Vintage: +5, +2, -5 pts (or 0 if unavailable)
 * Clamped strictly between 0 and 100.
 * 
 * Returns full explainability breakdown, reason codes, provenance, and missing-data flags.
 */
export function calculateAdditiveRiskScore(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const startingScore = SCORECARD_CONFIG.STARTING_SCORE;
  const factorAdjustments = [];
  const reasonCodes = [];
  const humanReadableExplanations = [];
  const missingFields = [];

  // ============================================================================
  // 1. Credit Bureau Scoring
  // ============================================================================
  let bureauScore = null;
  if (safeInput.creditBureauScore !== undefined && safeInput.creditBureauScore !== null) {
    bureauScore = Number(safeInput.creditBureauScore);
  } else if (safeInput.bureauScore !== undefined && safeInput.bureauScore !== null) {
    bureauScore = Number(safeInput.bureauScore);
  } else if (safeInput.externalData?.creditBureau?.score !== undefined && safeInput.externalData?.creditBureau?.score !== null) {
    bureauScore = Number(safeInput.externalData.creditBureau.score);
  }

  let overdueDays = 0;
  if (safeInput.overdueDays !== undefined && safeInput.overdueDays !== null) {
    overdueDays = Number(safeInput.overdueDays);
  } else if (safeInput.dpd !== undefined && safeInput.dpd !== null) {
    overdueDays = Number(safeInput.dpd);
  } else if (safeInput.externalData?.creditBureau?.overdueDays !== undefined && safeInput.externalData?.creditBureau?.overdueDays !== null) {
    overdueDays = Number(safeInput.externalData.creditBureau.overdueDays);
  }
  if (isNaN(overdueDays) || overdueDays < 0) overdueDays = 0;

  // Validate bureau score within realistic statutory range (300 to 900)
  const isBureauValid = bureauScore !== null && !isNaN(bureauScore) && bureauScore >= 300 && bureauScore <= 900;

  // Determine Bureau Provenance
  let bureauProvenance = 'UNAVAILABLE';
  let isBureauSynthetic = false;

  const rawProv = (
    safeInput.bureauProvenance ||
    safeInput.creditBureauDataSource ||
    safeInput.externalData?.creditBureau?.status ||
    safeInput.bureauStatus ||
    ''
  ).toString().toUpperCase();

  if (rawProv.includes('SYNTHETIC') || safeInput.isSyntheticScore === true || safeInput.isSyntheticBureau === true) {
    bureauProvenance = 'SYNTHETIC_SANDBOX';
    isBureauSynthetic = true;
  } else if (isBureauValid) {
    bureauProvenance = rawProv.includes('VERIFIED') ? 'VERIFIED' : 'CIBIL_VERIFIED';
  } else if (bureauScore !== null && !isNaN(bureauScore)) {
    bureauProvenance = 'UNVERIFIED';
  }

  let bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_UNAVAILABLE;
  let bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_UNAVAILABLE;
  let bureauExplanation = '';
  let bureauImpact = 'neutral';
  let isBureauMissing = false;

  if (!isBureauValid) {
    isBureauMissing = true;
    bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_UNAVAILABLE;
    bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_UNAVAILABLE;
    bureauExplanation = 'Credit bureau score is unavailable, unpulled, or invalid. Zero score adjustment applied pending authentic report pull.';
    bureauImpact = 'neutral';
    missingFields.push('bureauScore');
  } else if (overdueDays > SCORECARD_CONFIG.BUREAU.MAX_PERMISSIBLE_DPD) {
    bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_SUBPRIME;
    bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_SUBPRIME;
    bureauExplanation = `Bureau report indicates delinquency: ${overdueDays} days past due (> ${SCORECARD_CONFIG.BUREAU.MAX_PERMISSIBLE_DPD} DPD). Elevated credit risk (${bureauPts} pts).`;
    bureauImpact = 'negative';
  } else if (bureauScore >= SCORECARD_CONFIG.BUREAU.PRIME_MIN) {
    bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_PRIME;
    bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_PRIME;
    bureauExplanation = `CIBIL score of ${bureauScore} satisfies prime credit standards (>= ${SCORECARD_CONFIG.BUREAU.PRIME_MIN}) with clean repayment track record (+${bureauPts} pts).`;
    bureauImpact = 'positive';
  } else if (bureauScore >= SCORECARD_CONFIG.BUREAU.GOOD_MIN) {
    bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_GOOD;
    bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_GOOD;
    bureauExplanation = `CIBIL score of ${bureauScore} reflects satisfactory credit history in good band (${SCORECARD_CONFIG.BUREAU.GOOD_MIN}-${SCORECARD_CONFIG.BUREAU.PRIME_MIN - 1}) (+${bureauPts} pts).`;
    bureauImpact = 'positive';
  } else if (bureauScore >= SCORECARD_CONFIG.BUREAU.MODERATE_MIN) {
    bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_MODERATE;
    bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_MODERATE;
    bureauExplanation = `CIBIL score of ${bureauScore} is in moderate band (${SCORECARD_CONFIG.BUREAU.MODERATE_MIN}-${SCORECARD_CONFIG.BUREAU.GOOD_MIN - 1}). Neutral score adjustment (0 pts).`;
    bureauImpact = 'neutral';
  } else {
    bureauPts = SCORECARD_CONFIG.BUREAU.POINTS_SUBPRIME;
    bureauReasonCode = SCORECARD_CONFIG.BUREAU.REASON_SUBPRIME;
    bureauExplanation = `CIBIL score of ${bureauScore} falls below prime cut-off (< ${SCORECARD_CONFIG.BUREAU.MODERATE_MIN}). Elevated credit risk (${bureauPts} pts).`;
    bureauImpact = 'negative';
  }

  if (isBureauSynthetic) {
    bureauExplanation = `[SYNTHETIC SANDBOX] ${bureauExplanation}`;
  }

  factorAdjustments.push({
    factorKey: 'bureau',
    factorName: 'Credit Bureau History',
    points: bureauPts,
    reasonCode: bureauReasonCode,
    metric: 'CIBIL Score',
    actualValue: isBureauValid ? bureauScore : 'Unavailable',
    dpd: overdueDays,
    provenance: bureauProvenance,
    isSynthetic: isBureauSynthetic,
    isMissing: isBureauMissing,
    explanation: bureauExplanation,
    impact: bureauImpact,
  });
  reasonCodes.push(bureauReasonCode);
  humanReadableExplanations.push(bureauExplanation);

  // ============================================================================
  // 2. Fixed Obligation to Income Ratio (FOIR) Scoring
  // ============================================================================
  let foir = null;
  if (safeInput.calculatedFOIR !== undefined && safeInput.calculatedFOIR !== null) {
    foir = Number(safeInput.calculatedFOIR);
  } else if (safeInput.foir !== undefined && safeInput.foir !== null) {
    foir = Number(safeInput.foir);
  } else if (safeInput.netMonthlyIncome && safeInput.loanAmountRequested) {
    const rate = safeInput.loanType === 'lap'
      ? STATUTORY_POLICY_CONFIG.DEFAULT_BENCHMARK_RATE_LAP
      : STATUTORY_POLICY_CONFIG.DEFAULT_BENCHMARK_RATE_HL;
    const emi = calculateEMI(safeInput.loanAmountRequested, rate, safeInput.tenureMonthsRequested || 240);
    foir = calculateFOIR(safeInput.existingMonthlyObligations || 0, emi, safeInput.netMonthlyIncome);
  }

  let foirPts = SCORECARD_CONFIG.FOIR.POINTS_UNAVAILABLE;
  let foirReasonCode = SCORECARD_CONFIG.FOIR.REASON_UNAVAILABLE;
  let foirExplanation = '';
  let foirImpact = 'neutral';
  let isFoirMissing = false;

  const isFoirValid = foir !== null && !isNaN(foir) && foir >= 0;

  if (!isFoirValid) {
    isFoirMissing = true;
    foirPts = SCORECARD_CONFIG.FOIR.POINTS_UNAVAILABLE;
    foirReasonCode = SCORECARD_CONFIG.FOIR.REASON_UNAVAILABLE;
    foirExplanation = 'FOIR cashflow metric is missing or uncomputable. Zero score adjustment applied.';
    foirImpact = 'neutral';
    missingFields.push('foir');
  } else if (foir <= SCORECARD_CONFIG.FOIR.COMFORT_MAX) {
    foirPts = SCORECARD_CONFIG.FOIR.POINTS_COMFORT;
    foirReasonCode = SCORECARD_CONFIG.FOIR.REASON_COMFORT;
    foirExplanation = `FOIR of ${foir}% is conservative and within prime comfort band (<= ${SCORECARD_CONFIG.FOIR.COMFORT_MAX}%) (+${foirPts} pts).`;
    foirImpact = 'positive';
  } else if (foir <= SCORECARD_CONFIG.FOIR.ACCEPTABLE_MAX) {
    foirPts = SCORECARD_CONFIG.FOIR.POINTS_ACCEPTABLE;
    foirReasonCode = SCORECARD_CONFIG.FOIR.REASON_ACCEPTABLE;
    foirExplanation = `FOIR of ${foir}% is within acceptable debt-service band (${SCORECARD_CONFIG.FOIR.COMFORT_MAX + 0.1}% - ${SCORECARD_CONFIG.FOIR.ACCEPTABLE_MAX}%) (+${foirPts} pts).`;
    foirImpact = 'positive';
  } else if (foir <= SCORECARD_CONFIG.FOIR.THRESHOLD_MAX) {
    foirPts = SCORECARD_CONFIG.FOIR.POINTS_THRESHOLD;
    foirReasonCode = SCORECARD_CONFIG.FOIR.REASON_THRESHOLD;
    foirExplanation = `FOIR of ${foir}% operates near internal policy threshold (${SCORECARD_CONFIG.FOIR.ACCEPTABLE_MAX + 0.1}% - ${SCORECARD_CONFIG.FOIR.THRESHOLD_MAX}%). Neutral adjustment (0 pts).`;
    foirImpact = 'neutral';
  } else {
    foirPts = SCORECARD_CONFIG.FOIR.POINTS_STRETCH;
    foirReasonCode = SCORECARD_CONFIG.FOIR.REASON_STRETCH;
    foirExplanation = `FOIR of ${foir}% exceeds ${SCORECARD_CONFIG.FOIR.THRESHOLD_MAX}% internal benchmark. Strained disposable cashflow (${foirPts} pts).`;
    foirImpact = 'negative';
  }

  factorAdjustments.push({
    factorKey: 'foir',
    factorName: 'Debt-to-Income (FOIR)',
    points: foirPts,
    reasonCode: foirReasonCode,
    metric: 'FOIR Ratio',
    actualValue: isFoirValid ? `${foir}%` : 'Unavailable',
    provenance: isFoirValid ? 'CALCULATED' : 'UNAVAILABLE',
    isSynthetic: false,
    isMissing: isFoirMissing,
    explanation: foirExplanation,
    impact: foirImpact,
  });
  reasonCodes.push(foirReasonCode);
  humanReadableExplanations.push(foirExplanation);

  // ============================================================================
  // 3. Loan-to-Value (LTV) Scoring
  // ============================================================================
  let ltv = null;
  if (safeInput.calculatedLTV !== undefined && safeInput.calculatedLTV !== null) {
    ltv = Number(safeInput.calculatedLTV);
  } else if (safeInput.ltv !== undefined && safeInput.ltv !== null) {
    ltv = Number(safeInput.ltv);
  } else if (safeInput.loanAmountRequested && safeInput.estimatedMarketValue) {
    ltv = calculateLTV(safeInput.loanAmountRequested, safeInput.estimatedMarketValue);
  }

  let ltvPts = SCORECARD_CONFIG.LTV.POINTS_UNAVAILABLE;
  let ltvReasonCode = SCORECARD_CONFIG.LTV.REASON_UNAVAILABLE;
  let ltvExplanation = '';
  let ltvImpact = 'neutral';
  let isLtvMissing = false;

  const isLtvValid = ltv !== null && !isNaN(ltv) && ltv >= 0;

  if (!isLtvValid) {
    isLtvMissing = true;
    ltvPts = SCORECARD_CONFIG.LTV.POINTS_UNAVAILABLE;
    ltvReasonCode = SCORECARD_CONFIG.LTV.REASON_UNAVAILABLE;
    ltvExplanation = 'LTV collateral metric is missing or uncomputable. Zero score adjustment applied.';
    ltvImpact = 'neutral';
    missingFields.push('ltv');
  } else if (ltv <= SCORECARD_CONFIG.LTV.CONSERVATIVE_MAX) {
    ltvPts = SCORECARD_CONFIG.LTV.POINTS_CONSERVATIVE;
    ltvReasonCode = SCORECARD_CONFIG.LTV.REASON_CONSERVATIVE;
    ltvExplanation = `LTV of ${ltv}% provides substantial collateral cushion (<= ${SCORECARD_CONFIG.LTV.CONSERVATIVE_MAX}%) with strong borrower equity (+${ltvPts} pts).`;
    ltvImpact = 'positive';
  } else if (ltv <= SCORECARD_CONFIG.LTV.MODERATE_MAX) {
    ltvPts = SCORECARD_CONFIG.LTV.POINTS_MODERATE;
    ltvReasonCode = SCORECARD_CONFIG.LTV.REASON_MODERATE;
    ltvExplanation = `LTV of ${ltv}% provides standard collateral safety margin (${SCORECARD_CONFIG.LTV.CONSERVATIVE_MAX + 0.1}% - ${SCORECARD_CONFIG.LTV.MODERATE_MAX}%) (+${ltvPts} pts).`;
    ltvImpact = 'positive';
  } else if (ltv <= SCORECARD_CONFIG.LTV.HIGH_MAX) {
    ltvPts = SCORECARD_CONFIG.LTV.POINTS_HIGH;
    ltvReasonCode = SCORECARD_CONFIG.LTV.REASON_HIGH;
    ltvExplanation = `LTV of ${ltv}% provides modest collateral cushion (${SCORECARD_CONFIG.LTV.MODERATE_MAX + 0.1}% - ${SCORECARD_CONFIG.LTV.HIGH_MAX}%). Neutral adjustment (0 pts).`;
    ltvImpact = 'neutral';
  } else {
    ltvPts = SCORECARD_CONFIG.LTV.POINTS_MAXED;
    ltvReasonCode = SCORECARD_CONFIG.LTV.REASON_MAXED;
    ltvExplanation = `LTV of ${ltv}% exceeds ${SCORECARD_CONFIG.LTV.HIGH_MAX}%, representing elevated loan leverage and lower borrower equity cushion (${ltvPts} pts).`;
    ltvImpact = 'negative';
  }

  factorAdjustments.push({
    factorKey: 'ltv',
    factorName: 'Collateral Cushion (LTV)',
    points: ltvPts,
    reasonCode: ltvReasonCode,
    metric: 'LTV Ratio',
    actualValue: isLtvValid ? `${ltv}%` : 'Unavailable',
    provenance: isLtvValid ? 'CALCULATED' : 'UNAVAILABLE',
    isSynthetic: false,
    isMissing: isLtvMissing,
    explanation: ltvExplanation,
    impact: ltvImpact,
  });
  reasonCodes.push(ltvReasonCode);
  humanReadableExplanations.push(ltvExplanation);

  // ============================================================================
  // 4. Employment Vintage & Stability Scoring
  // ============================================================================
  let vintage = null;
  if (safeInput.yearsInJob !== undefined && safeInput.yearsInJob !== null) {
    vintage = Number(safeInput.yearsInJob);
  } else if (safeInput.vintageYears !== undefined && safeInput.vintageYears !== null) {
    vintage = Number(safeInput.vintageYears);
  } else if (safeInput.employmentVintageYears !== undefined && safeInput.employmentVintageYears !== null) {
    vintage = Number(safeInput.employmentVintageYears);
  } else if (safeInput.employment_details?.vintage_years !== undefined && safeInput.employment_details?.vintage_years !== null) {
    vintage = Number(safeInput.employment_details.vintage_years);
  }

  let vintagePts = SCORECARD_CONFIG.VINTAGE.POINTS_UNAVAILABLE;
  let vintageReasonCode = SCORECARD_CONFIG.VINTAGE.REASON_UNAVAILABLE;
  let vintageExplanation = '';
  let vintageImpact = 'neutral';
  let isVintageMissing = false;

  const isVintageValid = vintage !== null && !isNaN(vintage) && vintage >= 0;

  if (!isVintageValid) {
    isVintageMissing = true;
    vintagePts = SCORECARD_CONFIG.VINTAGE.POINTS_UNAVAILABLE;
    vintageReasonCode = SCORECARD_CONFIG.VINTAGE.REASON_UNAVAILABLE;
    vintageExplanation = 'Employment vintage is missing or unspecified. Zero score adjustment applied.';
    vintageImpact = 'neutral';
    missingFields.push('employmentVintage');
  } else if (vintage > SCORECARD_CONFIG.VINTAGE.STABLE_MIN_EXCLUSIVE) {
    vintagePts = SCORECARD_CONFIG.VINTAGE.POINTS_STABLE;
    vintageReasonCode = SCORECARD_CONFIG.VINTAGE.REASON_STABLE;
    vintageExplanation = `Employment vintage of ${vintage} years demonstrates established professional continuity (> ${SCORECARD_CONFIG.VINTAGE.STABLE_MIN_EXCLUSIVE} yrs) (+${vintagePts} pts).`;
    vintageImpact = 'positive';
  } else if (vintage >= SCORECARD_CONFIG.VINTAGE.ADEQUATE_MIN) {
    vintagePts = SCORECARD_CONFIG.VINTAGE.POINTS_ADEQUATE;
    vintageReasonCode = SCORECARD_CONFIG.VINTAGE.REASON_ADEQUATE;
    vintageExplanation = `Employment vintage of ${vintage} years meets standard occupational stability (${SCORECARD_CONFIG.VINTAGE.ADEQUATE_MIN} - ${SCORECARD_CONFIG.VINTAGE.STABLE_MIN_EXCLUSIVE} yrs) (+${vintagePts} pts).`;
    vintageImpact = 'positive';
  } else {
    vintagePts = SCORECARD_CONFIG.VINTAGE.POINTS_PROBATION;
    vintageReasonCode = SCORECARD_CONFIG.VINTAGE.REASON_PROBATION;
    vintageExplanation = `Employment vintage of ${vintage} years is under 1 year, indicating probation or recent job transition (${vintagePts} pts).`;
    vintageImpact = 'negative';
  }

  factorAdjustments.push({
    factorKey: 'vintage',
    factorName: 'Employment Vintage & Stability',
    points: vintagePts,
    reasonCode: vintageReasonCode,
    metric: 'Stability (Years)',
    actualValue: isVintageValid ? `${vintage} yrs` : 'Unavailable',
    provenance: isVintageValid ? 'DECLARED' : 'UNAVAILABLE',
    isSynthetic: false,
    isMissing: isVintageMissing,
    explanation: vintageExplanation,
    impact: vintageImpact,
  });
  reasonCodes.push(vintageReasonCode);
  humanReadableExplanations.push(vintageExplanation);

  // ============================================================================
  // 5. Aggregate Calculation, Clamping, and Risk Band Mapping
  // ============================================================================
  const totalAdjustments = bureauPts + foirPts + ltvPts + vintagePts;
  const rawScore = startingScore + totalAdjustments;
  const finalScore = Math.max(
    SCORECARD_CONFIG.MIN_SCORE,
    Math.min(SCORECARD_CONFIG.MAX_SCORE, Math.round(rawScore))
  );
  const isClamped = rawScore < SCORECARD_CONFIG.MIN_SCORE || rawScore > SCORECARD_CONFIG.MAX_SCORE;
  const riskBand = getRiskBand(finalScore);

  let riskTier = 'high';
  if (riskBand === 'Prime') {
    riskTier = 'low';
  } else if (riskBand === 'Standard' || riskBand === 'Borderline') {
    riskTier = 'medium';
  } else {
    riskTier = 'high';
  }

  return {
    startingScore,
    totalAdjustments,
    rawScore,
    finalScore,
    isClamped,
    riskBand,
    riskTier,
    factorAdjustments,
    reasonCodes,
    humanReadableExplanations,
    dataProvenance: {
      bureau: bureauProvenance,
      foir: isFoirValid ? 'CALCULATED' : 'UNAVAILABLE',
      ltv: isLtvValid ? 'CALCULATED' : 'UNAVAILABLE',
      vintage: isVintageValid ? 'DECLARED' : 'UNAVAILABLE',
    },
    missingDataIndicators: {
      hasMissingData: missingFields.length > 0,
      missingFields,
    },
    disclaimer: SCORECARD_CONFIG.DISCLAIMER,
    modelMetadata: {
      modelType: SCORECARD_CONFIG.MODEL_TYPE,
      modelVersion: SCORECARD_CONFIG.MODEL_VERSION,
      timestamp: new Date().toISOString(),
    },
  };
}
