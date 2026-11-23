import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { calculateEMI, calculateFOIR, calculateLTV, formatINR } from '../../data/mockData';
import { saveApplicationDraft, uploadApplicationDocument, submitApplication } from '../../services/applicationService';
import { Check, ArrowRight, ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Shield, Trash2, Eye } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Product' },
  { id: 2, name: 'Personal' },
  { id: 3, name: 'Employment' },
  { id: 4, name: 'Financials' },
  { id: 5, name: 'Collateral' },
  { id: 6, name: 'Liabilities' },
  { id: 7, name: 'Documents' },
  { id: 8, name: 'Consent & Submit' },
];

export default function LoanApplicationWizard() {
  const navigate = useNavigate();
  const { addApplication, currentUser, isLiveConnected } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [draftAppId, setDraftAppId] = useState(null);
  const fileInputRef = useRef(null);
  const [targetUploadCategory, setTargetUploadCategory] = useState({ id: 'doc-pan', category: 'pan_card', subtype: 'pan_primary' });

  // Form State
  const [formData, setFormData] = useState({
    loanType: 'home_loan', // 'home_loan' | 'lap'
    loanAmountRequested: 3500000,
    tenureMonthsRequested: 240,
    
    // Personal
    applicantName: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@healthplus.org',
    phone: '+91 99302 78104',
    dob: '1991-09-05',
    panNumber: 'SNEHK5512B',
    gender: 'Female',
    maritalStatus: 'Married',
    currentAddress: 'Flat 203, Sahakar Nagar, Pune, MH - 411009',

    // Employment
    employmentType: 'salaried',
    employerName: 'Apollo Hospitals Enterprise Ltd.',
    designation: 'Senior Clinical Pharmacist',
    yearsInJob: 4,

    // Financials
    grossMonthlyIncome: 95000,
    netMonthlyIncome: 82000,
    liquidAssets: 550000,
    primaryBank: 'Bank of Baroda',

    // Property
    propertyType: 'Ready Built Apartment',
    propertyAddress: 'A-602, Vistara Heights, Baner-Balewadi Link Road, Pune, MH - 411045',
    carpetAreaSqft: 820,
    estimatedMarketValue: 5100000,
    propertyTitleStatus: 'Freehold (Direct Builder Sale)',

    // Liabilities
    existingMonthlyObligations: 6500,
    activeLoansCount: 1,

    // Consent
    consentGiven: false,
  });

  // Uploaded Documents Dossier
  const [uploadedDocs, setUploadedDocs] = useState([
    { id: 'doc-pan', type: 'PAN / Identity Document', category: 'pan_card', subtype: 'pan_primary', fileName: 'pan_card_sneha.pdf', size: '1.2 MB', status: 'uploaded' },
    { id: 'doc-salary', type: 'Salary Slips (Last 3 Months)', category: 'salary_slips', subtype: 'salary_slip_m1', fileName: 'salary_slips_aug_oct.pdf', size: '2.8 MB', status: 'uploaded' },
    { id: 'doc-bank', type: 'Bank Statement (Last 6 Months)', category: 'bank_statements', subtype: 'bank_stmt_6m', fileName: 'bob_bank_statement_6m.pdf', size: '4.5 MB', status: 'uploaded' },
    { id: 'doc-property', type: 'Property Title / Agreement to Sell', category: 'property_title', subtype: 'title_deed', fileName: 'baner_sale_agreement.pdf', size: '6.1 MB', status: 'uploaded' }
  ]);

  const [uploadingDocId, setUploadingDocId] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  // Step Validation Logic
  const validateStep = (step) => {
    setValidationError('');
    if (step === 1) {
      if (!formData.loanAmountRequested || formData.loanAmountRequested <= 0) {
        setValidationError('Please enter a valid requested loan amount.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.applicantName || !formData.panNumber || !formData.dob) {
        setValidationError('Full Name, Date of Birth, and PAN Number are mandatory.');
        return false;
      }
      if (formData.panNumber.length !== 10) {
        setValidationError('PAN number must be exactly 10 alphanumeric characters.');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.employerName || !formData.designation) {
        setValidationError('Please specify employer/business name and designation.');
        return false;
      }
    }
    if (step === 4) {
      if (!formData.netMonthlyIncome || formData.netMonthlyIncome <= 0) {
        setValidationError('Please state your net monthly in-hand income.');
        return false;
      }
    }
    if (step === 5) {
      if (!formData.estimatedMarketValue || formData.estimatedMarketValue <= 0) {
        setValidationError('Please enter the estimated property market value.');
        return false;
      }
    }
    if (step === 7) {
      if (uploadedDocs.length < 3) {
        setValidationError('Please upload at least PAN, Salary Slips, and Bank Statement.');
        return false;
      }
    }
    if (step === 8) {
      if (!formData.consentGiven) {
        setValidationError('You must provide mandatory digital consent to process credit bureau & KYC verifications.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Advance step immediately for zero latency (instant UI transition)
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Persist draft in the background asynchronously without blocking the user
      if (currentUser?.id && isLiveConnected) {
        saveApplicationDraft(currentUser.id, formData, draftAppId)
          .then(saved => {
            if (saved?.id) setDraftAppId(saved.id);
          })
          .catch(err => {
            console.warn('Draft auto-save note:', err.message);
          });
      }
    }
  };

  const handlePrev = () => {
    setValidationError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerFileSelect = (docId, category = 'pan_card', subtype = 'pan_primary') => {
    setTargetUploadCategory({ id: docId, category, subtype });
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocId(targetUploadCategory.id);
    try {
      let currentAppId = draftAppId;
      if (!currentAppId && currentUser?.id && isLiveConnected) {
        const draft = await saveApplicationDraft(currentUser.id, formData, null);
        currentAppId = draft.id;
        setDraftAppId(draft.id);
      }

      const uploaded = await uploadApplicationDocument(
        currentAppId || 'APP-DRAFT',
        currentUser?.id || 'demo-user',
        targetUploadCategory.category,
        targetUploadCategory.subtype,
        file
      );

      setUploadedDocs(prev => prev.map(d => d.id === targetUploadCategory.id ? {
        ...d,
        status: 'uploaded',
        fileName: uploaded.fileName,
        size: uploaded.fileSize
      } : d));
    } catch (err) {
      console.error('File upload error:', err);
      setValidationError(err.message);
    } finally {
      setUploadingDocId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const simulateDocUpload = (docId) => {
    setUploadingDocId(docId);
    setTimeout(() => {
      setUploadedDocs(prev => prev.map(d => d.id === docId ? { ...d, status: 'uploaded', fileName: 'sample_uploaded_doc.pdf' } : d));
      setUploadingDocId(null);
    }, 600);
  };

  const handleRemoveDoc = (docId) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== docId));
  };

  // Calculations for review
  const interestRate = formData.loanType === 'home_loan' ? 8.50 : 10.25;
  const estimatedEMI = calculateEMI(formData.loanAmountRequested, interestRate, formData.tenureMonthsRequested);
  const calculatedFOIR = calculateFOIR(formData.existingMonthlyObligations, estimatedEMI, formData.netMonthlyIncome);
  const calculatedLTV = calculateLTV(formData.loanAmountRequested, formData.estimatedMarketValue);
  const maxEligible = Math.round(Number(formData.netMonthlyIncome) * 0.55 * 105);

  const handleSubmitApplication = async () => {
    if (!validateStep(8)) return;

    const newAppId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Live Supabase submission
    if (currentUser?.id && isLiveConnected) {
      try {
        let currentAppId = draftAppId;
        if (!currentAppId) {
          const draft = await saveApplicationDraft(currentUser.id, formData, null);
          currentAppId = draft.id;
          setDraftAppId(draft.id);
        }
        await submitApplication(currentAppId, currentUser.id, formData, { ip: '127.0.0.1' });
      } catch (err) {
        console.warn('Live submission note:', err.message);
      }
    }

    const newApplication = {
      id: newAppId,
      loanType: formData.loanType,
      loanTypeLabel: formData.loanType === 'home_loan' ? 'Home Loan (Purchase)' : 'Loan Against Property (LAP)',
      applicantName: formData.applicantName,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      panNumber: formData.panNumber.toUpperCase(),
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      currentAddress: formData.currentAddress,
      
      employmentType: formData.employmentType,
      employmentTypeLabel: formData.employmentType === 'salaried' ? 'Salaried Professional' : 'Self-Employed Professional',
      employerName: formData.employerName,
      designation: formData.designation,
      yearsInJob: Number(formData.yearsInJob),
      grossMonthlyIncome: Number(formData.grossMonthlyIncome),
      netMonthlyIncome: Number(formData.netMonthlyIncome),
      existingMonthlyObligations: Number(formData.existingMonthlyObligations),
      liquidAssets: Number(formData.liquidAssets),
      primaryBank: formData.primaryBank,

      propertyType: formData.propertyType,
      propertyAddress: formData.propertyAddress,
      carpetAreaSqft: Number(formData.carpetAreaSqft),
      estimatedMarketValue: Number(formData.estimatedMarketValue),
      propertyTitleStatus: formData.propertyTitleStatus,

      loanAmountRequested: Number(formData.loanAmountRequested),
      tenureMonthsRequested: Number(formData.tenureMonthsRequested),
      benchmarkRate: interestRate,

      calculatedFOIR,
      calculatedLTV,
      calculatedDTI: Number(((formData.loanAmountRequested) / (formData.netMonthlyIncome * 12)).toFixed(1)),
      maxEligibleLoanAmount: maxEligible,
      estimatedMonthlyEMI: estimatedEMI,

      creditBureauScore: 745,
      probabilityOfDefault: 0.055,
      numericalRiskScore: 82,
      riskCategory: 'low',
      riskDrivers: [
        { factor: 'Good Credit Score 745', impact: 'positive', value: '+14 pts' },
        { factor: `Controlled FOIR (${calculatedFOIR}%)`, impact: 'positive', value: '+10 pts' },
        { factor: `Safe LTV Buffer (${calculatedLTV}%)`, impact: 'positive', value: '+8 pts' }
      ],

      externalData: {
        digilocker: { status: 'Verified', timestamp: now.toISOString(), reference: `DL-${Math.floor(10000 + Math.random() * 90000)}-MH` },
        panVerification: { status: 'Verified', nsdlMatch: '100% Name Match', active: true },
        creditBureau: { provider: 'CIBIL', score: 745, activeTradelines: 2, overdueDays: 0, checkedAt: now.toISOString() },
        bankStatement: { provider: 'Account Aggregator (Mock)', verifiedAvgBalance: 68000, salaryCreditsDetected: 6, inwardBounces: 0 },
        landRegistry: { status: 'Clean Title Recorded', subRegistrar: 'Haveli District' },
        amlScreening: { status: 'Cleared', pepMatch: false, sanctionsListHit: false }
      },

      documents: uploadedDocs.map((d, idx) => ({
        id: `doc-${idx + 1}`,
        type: d.type,
        fileName: d.fileName,
        status: 'verified',
        extracted: { verificationStatus: 'OCR Validated' },
        remarks: 'Matches stated application profile.'
      })),

      complianceChecks: [
        { code: 'NHB-LTV-01', rule: 'NHB Maximum LTV Cap (≤ 80%)', status: calculatedLTV <= 80 ? 'PASS' : 'FAIL', details: `LTV is ${calculatedLTV}%.` },
        { code: 'POL-FOIR-MAX', rule: 'Internal FOIR Limit (≤ 55%)', status: calculatedFOIR <= 55 ? 'PASS' : 'FAIL', details: `FOIR is ${calculatedFOIR}%.` },
        { code: 'KYC-AML-03', rule: 'AML Watchlist Clearance', status: 'PASS', details: 'No adverse findings.' }
      ],

      fraudAlerts: [],
      status: 'under_review',
      submissionDate: now.toISOString(),
      finalDecision: {
        outcome: 'REFER',
        decisionType: 'Underwriting Review Queue',
        sanctionedAmount: null,
        sanctionedRate: null,
        sanctionedTenureMonths: null,
        sanctionedEMI: null,
        decidedAt: null,
        reviewerName: 'Pending Underwriter Verification',
        remarks: 'Application submitted successfully. Automated pre-assessment completed.'
      },
      timeline: [
        { date: formattedDate, title: 'Application Submitted', desc: `Customer submitted ${formData.loanType === 'home_loan' ? 'Home Loan' : 'LAP'} request for ${formatINR(formData.loanAmountRequested)}.` },
        { date: formattedDate, title: 'Simulated External Verifications', desc: 'DigiLocker KYC, CIBIL pull (745), and Bank Statement parsed.' },
        { date: formattedDate, title: 'Pre-Assessment Generated', desc: `FOIR ${calculatedFOIR}%, LTV ${calculatedLTV}%, Risk Score 82/100 (Low Risk).` }
      ]
    };

    addApplication(newApplication);
    navigate(`/customer/applications/${newAppId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
          New Loan Origination
        </span>
        <h1 className="font-display font-bold text-2xl text-white mt-0.5">
          Digital Mortgage Application
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Complete the guided intake to generate your preliminary eligibility and document underwriting dossier.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="glass-card rounded-2xl border border-white/[0.08] p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-3">
          <span>Step {currentStep} of {STEPS.length}: <strong className="text-white">{STEPS[currentStep - 1].name}</strong></span>
          <span>{Math.round((currentStep / STEPS.length) * 100)}% Completed</span>
        </div>
        <div className="w-full glass-input bg-white/[0.04] text-white border-white/[0.12]/[0.08] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 h-full shadow-[0_0_12px_rgba(249,115,22,0.5)] transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className="glass-card rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {/* Step 1: Loan Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Select Loan Product</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Choose the mortgage type best matched to your requirement.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded border text-left cursor-pointer transition-all ${
                  formData.loanType === 'home_loan'
                    ? 'border-orange-500 bg-orange-500/15 ring-1 ring-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'border-white/[0.1] glass-input bg-white/[0.04] text-white border-white/[0.12]/[0.03] hover:glass-input bg-white/[0.04] text-white border-white/[0.12]/[0.06] text-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="loanType"
                  value="home_loan"
                  checked={formData.loanType === 'home_loan'}
                  onChange={() => handleInputChange('loanType', 'home_loan')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-white">Home Loan</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-medium">LTV ≤ 80%</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  For purchasing a ready-built apartment, independent house, or constructing on a residential plot.
                </p>
                <div className="mt-3 text-[11px] text-white font-semibold">
                  Benchmark Rate: 8.50% p.a. • Tenure up to 30 Yrs
                </div>
              </label>

              <label
                className={`p-4 rounded border text-left cursor-pointer transition-all ${
                  formData.loanType === 'lap'
                    ? 'border-orange-500 bg-orange-500/15 ring-1 ring-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'border-white/[0.1] glass-input bg-white/[0.04] text-white border-white/[0.12]/[0.03] hover:glass-input bg-white/[0.04] text-white border-white/[0.12]/[0.06] text-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="loanType"
                  value="lap"
                  checked={formData.loanType === 'lap'}
                  onChange={() => handleInputChange('loanType', 'lap')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-white">Loan Against Property (LAP)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-medium">LTV ≤ 60%</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Mortgage an existing self-owned residential or commercial property to fund business or personal needs.
                </p>
                <div className="mt-3 text-[11px] text-white font-semibold">
                  Benchmark Rate: 10.25% p.a. • Tenure up to 15 Yrs
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Requested Loan Amount (₹) *
                </label>
                <input
                  type="number"
                  step="50000"
                  value={formData.loanAmountRequested}
                  onChange={(e) => handleInputChange('loanAmountRequested', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded focus:outline-hidden focus:ring-1 focus:ring-brand-blue"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Amount in words: {formatINR(formData.loanAmountRequested)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Requested Tenure (Months) *
                </label>
                <select
                  value={formData.tenureMonthsRequested}
                  onChange={(e) => handleInputChange('tenureMonthsRequested', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded focus:outline-hidden focus:ring-1 focus:ring-brand-blue glass-input bg-white/[0.04] text-white border-white/[0.12]"
                >
                  <option value={120}>10 Years (120 Months)</option>
                  <option value={180}>15 Years (180 Months)</option>
                  <option value={240}>20 Years (240 Months)</option>
                  <option value={300}>25 Years (300 Months)</option>
                  <option value={360}>30 Years (360 Months)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Personal & Demographic Details</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Statutory identity parameters used for KYC and bureau checks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Full Legal Name (as per PAN) *</label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Permanent Account Number (PAN) *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded focus:ring-1 focus:ring-brand-blue uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded glass-input bg-white/[0.04] text-white border-white/[0.12]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-white mb-1">Current Residential Address *</label>
                <textarea
                  rows={2}
                  value={formData.currentAddress}
                  onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Employment Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Employment & Professional Profile</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Captures career vintage and professional stability.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Employment Type *</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded glass-input bg-white/[0.04] text-white border-white/[0.12]"
                >
                  <option value="salaried">Salaried Employee</option>
                  <option value="self_employed">Self-Employed Professional / Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Employer / Business Entity Name *</label>
                <input
                  type="text"
                  value={formData.employerName}
                  onChange={(e) => handleInputChange('employerName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Current Designation *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Years in Current Job / Practice *</label>
                <input
                  type="number"
                  value={formData.yearsInJob}
                  onChange={(e) => handleInputChange('yearsInJob', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Financial Information */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Monthly Income & Cashflow</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Stated cashflow figures will be reconciled against bank statement salary credits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Gross Monthly Income (₹) *</label>
                <input
                  type="number"
                  value={formData.grossMonthlyIncome}
                  onChange={(e) => handleInputChange('grossMonthlyIncome', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Net In-Hand Monthly Income (₹) *</label>
                <input
                  type="number"
                  value={formData.netMonthlyIncome}
                  onChange={(e) => handleInputChange('netMonthlyIncome', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Amount: {formatINR(formData.netMonthlyIncome)} / month
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Declared Liquid Assets / Savings (₹)</label>
                <input
                  type="number"
                  value={formData.liquidAssets}
                  onChange={(e) => handleInputChange('liquidAssets', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Primary Salary / Inflows Bank *</label>
                <input
                  type="text"
                  value={formData.primaryBank}
                  onChange={(e) => handleInputChange('primaryBank', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Property Collateral */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Property Collateral Specifications</h2>
              <p className="text-xs text-zinc-400 mt-0.5">The primary real-estate security pledged for mortgage underwriting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Estimated Fair Market Value (₹) *</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.estimatedMarketValue}
                  onChange={(e) => handleInputChange('estimatedMarketValue', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Valuation: {formatINR(formData.estimatedMarketValue)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Carpet Area (Square Feet) *</label>
                <input
                  type="number"
                  value={formData.carpetAreaSqft}
                  onChange={(e) => handleInputChange('carpetAreaSqft', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Property Category *</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded glass-input bg-white/[0.04] text-white border-white/[0.12]"
                >
                  <option value="Ready Built Apartment">Ready Built Apartment</option>
                  <option value="Independent Villa / Row House">Independent Villa / Row House</option>
                  <option value="Under-Construction High Rise">Under-Construction High Rise</option>
                  <option value="Commercial Shop / Office (LAP)">Commercial Shop / Office (LAP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Title Type *</label>
                <input
                  type="text"
                  value={formData.propertyTitleStatus}
                  onChange={(e) => handleInputChange('propertyTitleStatus', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-white mb-1">Property Location & Address *</label>
                <textarea
                  rows={2}
                  value={formData.propertyAddress}
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Existing Liabilities */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Existing Liabilities & EMIs</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Used to calculate Fixed Obligation to Income Ratio (FOIR).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Total Existing Monthly Obligations (₹) *
                </label>
                <input
                  type="number"
                  value={formData.existingMonthlyObligations}
                  onChange={(e) => handleInputChange('existingMonthlyObligations', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Sum of running auto, personal, or educational loans.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Number of Active Tradelines / Loans
                </label>
                <input
                  type="number"
                  value={formData.activeLoansCount}
                  onChange={(e) => handleInputChange('activeLoansCount', Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-white/[0.08] rounded"
                />
              </div>
            </div>

            {/* Live FOIR preview */}
            <div className="p-3 bg-brand-bg rounded border border-white/[0.08] text-xs flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block">Projected Total Monthly Debt Commitment:</span>
                <strong className="text-white">{formatINR(formData.existingMonthlyObligations + estimatedEMI)} / month</strong>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block">Projected FOIR:</span>
                <strong className={calculatedFOIR <= 55 ? 'text-emerald-700' : 'text-amber-700'}>
                  {calculatedFOIR}% (Limit: 55%)
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Document Upload Hub */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Document Submission Hub</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload authentic, readable digital copies. Accepted formats: PDF, PNG, JPG (Max 10 MB per file).
              </p>
            </div>

            {/* Hidden File Input for Real Supabase Storage Uploads */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChosen}
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
            />

            <div className="space-y-3">
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded border border-white/[0.08] glass-input bg-white/[0.04] text-white border-white/[0.12] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 text-orange-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">{doc.type}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{doc.fileName}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">Stored in Private Vault</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => triggerFileSelect(doc.id, doc.category || 'pan_card', doc.subtype || 'pan_primary')}
                      disabled={uploadingDocId === doc.id}
                      className="text-xs px-2.5 py-1 text-zinc-400 hover:text-white border border-white/[0.08] rounded hover:bg-slate-50 transition-colors"
                    >
                      {uploadingDocId === doc.id ? 'Uploading...' : 'Upload File'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Dropzone */}
            <div
              onClick={() => triggerFileSelect('doc-additional', 'property_title', 'additional_doc')}
              className="border-2 border-dashed border-white/[0.08] rounded p-6 text-center hover:border-brand-blue transition-colors cursor-pointer glass-panel p-6 border-white/[0.08]"
            >
              <Upload className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-white">
                Click to attach additional supporting documents to private vault
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Property title, municipal approvals, or ITR financials (PDF, PNG, JPG up to 15MB)
              </p>
            </div>
          </div>
        )}

        {/* Step 8: Review & Consent */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Review & Digital Consent</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Inspect your application summary before launching the automated underwriting engine.
              </p>
            </div>

            {/* Summary Review Grid */}
            <div className="glass-panel p-4 border-white/[0.08] border border-white/[0.08] rounded p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-zinc-400 block">Loan Product</span>
                  <span className="font-semibold text-white">{formData.loanType === 'home_loan' ? 'Home Loan' : 'LAP'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Requested Loan</span>
                  <span className="font-semibold text-white">{formatINR(formData.loanAmountRequested)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Property Valuation</span>
                  <span className="font-semibold text-white">{formatINR(formData.estimatedMarketValue)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Estimated LTV</span>
                  <span className="font-semibold text-orange-400">{calculatedLTV}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-zinc-400 block">Applicant Legal Name</span>
                  <span className="font-semibold text-white">{formData.applicantName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">PAN Number</span>
                  <span className="font-mono font-semibold text-white">{formData.panNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Net Monthly In-Hand</span>
                  <span className="font-semibold text-white">{formatINR(formData.netMonthlyIncome)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Projected FOIR</span>
                  <span className="font-semibold text-white">{calculatedFOIR}%</span>
                </div>
              </div>
            </div>

            {/* Statutory Consent Box */}
            <div className="p-4 rounded border border-orange-500/30 bg-orange-500/10 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentCheckbox"
                  checked={formData.consentGiven}
                  onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
                  className="mt-1 w-4 h-4 text-orange-400 rounded border-slate-300 focus:ring-brand-blue"
                />
                <label htmlFor="consentCheckbox" className="text-xs text-white leading-relaxed">
                  <strong>Statutory Applicant Declaration & Data Processing Consent:</strong> I hereby grant explicit, revocable consent to Hero Housing Finance and its digital underwriting engine NIRNAY to fetch and verify my demographic records via DigiLocker, query credit bureau registries (CIBIL/Experian), reconcile bank statement cashflows, and run anti-money laundering (AML) screenings strictly for the purpose of credit underwriting.
                </label>
              </div>

              <div className="text-[10px] text-zinc-400 flex items-center gap-2 pl-7">
                <Shield className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>Recorded with IP address, browser signature, and cryptographic timestamp for compliance auditability.</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-medium text-zinc-400 hover:text-white glass-pill text-zinc-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded text-xs font-semibold btn-orange font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.45)]"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApplication}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-xs font-semibold btn-orange font-bold text-white shadow-[0_0_25px_rgba(249,115,22,0.5)]"
            >
              <Check className="w-4 h-4" />
              <span>Submit Application for Underwriting</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

