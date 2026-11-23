# NIRNAY — Post-Migration Integration Audit Report

**System:** NIRNAY Digital Mortgage Underwriting Platform  
**Target Organization:** Hero Housing Finance Limited (HHFL)  
**Target Environment:** Supabase Cloud (`https://[PROJECT_ID].supabase.co`)  
**Audit Scope:** Database Migrations 001–009 (`supabase/migrations/all_migrations.sql`), Frontend Integration, RLS Policies, Storage Security, Underwriting Boundaries  
**Audit Date:** 2026-11-13  
**Status:** Audit Completed — Actionable Findings Documented  

---

## 1. Executive Summary

A comprehensive post-migration integration audit was conducted following the execution of `all_migrations.sql` on the live Supabase PostgreSQL instance. The database schema encompasses 24 domain tables, Row Level Security (RLS) policies across all entities, private storage bucket configuration for mortgage dossiers, and statutory triggers enforcing immutability.

The audit verified that the security perimeter in PostgreSQL is robust: Row Level Security is universally enabled, cross-tenant reads return zero rows, unauthenticated access is rejected, and submitted mortgage dossiers are protected by database triggers.

However, the audit identified **one Critical (P0) blocker** in the auth trigger interaction that prevents new user signups, **one High (P1) bypass** in frontend demo login shortcuts, and **three Medium (P2) architectural improvements** concerning client-side non-atomic transactions and checksum calculations.

### Summary Status Matrix

| Audit Area | Total Checks | PASS | FAIL | WARNING / PARTIAL |
|---|---|---|---|---|
| **1. Supabase Connectivity** | 4 | 4 | 0 | 0 |
| **2. Authentication** | 5 | 2 | 2 | 1 |
| **3. Application Persistence** | 4 | 3 | 1 | 0 |
| **4. Document Storage** | 4 | 2 | 1 | 1 |
| **5. Underwriting Integrity** | 5 | 3 | 2 | 0 |
| **6. Database Consistency** | 2 | 1 | 0 | 1 |
| **7. Security & Penetration Testing** | 6 | 6 | 0 | 0 |
| **TOTAL** | **30** | **21** | **6** | **3** |

---

## 2. Detailed Audit Findings by Area

### 2.1. Supabase Connectivity

| Check | Status | Evidence / File Reference | Observations |
|---|---|---|---|
| Supabase Client Initialization | **PASS** | [src/services/supabaseClient.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/supabaseClient.js#L1-L24) | Client is instantiated using `@supabase/supabase-js` with `persistSession: true`, `autoRefreshToken: true`, and graceful fallback checking via `isSupabaseConfigured()`. |
| `.env.local` Variable Parity | **PASS** | [.env.local](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/.env.local#L1-L9) | Client environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` strictly match `import.meta.env.*` references in the frontend code. |
| Service Role / Secret Key Isolation | **PASS** | [.env.local](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/.env.local#L5-L9) | `SUPABASE_SECRET_KEY` and `SUPABASE_JWKS_URL` lack the `VITE_` prefix and are strictly quarantined to server-side environments. Production bundle analysis of `dist/assets/*.js` confirmed zero exposure of secret keys. |
| `.gitignore` Protection | **PASS** | [.gitignore](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/.gitignore#L13-L19) | `.env`, `.env.local`, `.env.*.local`, and `*.local` are explicitly excluded from version control. |

---

### 2.2. Authentication & Identity Management

| Check | Status | Evidence / File Reference | Observations |
|---|---|---|---|
| User Registration via GoTrue | **FAIL (P0)** | [20261113000001_create_extensions_and_auth_trigger.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000001_create_extensions_and_auth_trigger.sql#L89-L109) | **Critical Blocker:** User registration via `supabase.auth.signUp()` fails with `500 Database error saving new user`. Trigger `trg_protect_user_roles` rejects the insert from `handle_new_user()` because `auth.uid()` is `NULL` during the GoTrue user creation process. |
| Login, Logout & Session Restoration | **PASS** | [src/pages/public/AuthPage.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/public/AuthPage.jsx#L71-L100)<br>[src/context/AppContext.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/context/AppContext.jsx#L16-L50) | `signInWithPassword`, `signOut`, `getSession`, and `onAuthStateChange` correctly manage session lifecycle and profile synchronization. |
| Automatic Profile & Role Provisioning | **FAIL (P0)** | [20261113000001_create_extensions_and_auth_trigger.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000001_create_extensions_and_auth_trigger.sql#L112-L146) | Blocked by the trigger exception noted above. Once fixed, `handle_new_user()` provisions `public.profiles` and assigns the default `customer` role. |
| Privilege Escalation Prevention | **PASS** | [20261113000001_create_extensions_and_auth_trigger.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000001_create_extensions_and_auth_trigger.sql#L36-L38) | Table permissions on `public.user_roles` are revoked from `public`, `anon`, and `authenticated`. Direct API inserts return `403 permission denied for table user_roles`. |
| Route Guards vs Backend Authorization | **PARTIAL (P2)** | [src/App.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/App.jsx#L25-L43) | Frontend routes (`/admin/dashboard`, `/admin/applications/:id`) lack `<ProtectedRoute>` guards and can be rendered by unauthenticated clients. However, **backend data queries are strictly secured** by PostgreSQL RLS. |
| Prototype / Demo Login Bypass Removal | **FAIL (P1)** | [src/pages/public/AuthPage.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/public/AuthPage.jsx#L22-L29)<br>[src/context/AppContext.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/context/AppContext.jsx#L87-L94) | `AuthPage.jsx` renders quick demo buttons (`handleQuickDemoLogin('applicant')`, `handleQuickDemoLogin('bank_admin')`) that bypass Supabase Auth entirely and inject mock profiles into React state. |

---

### 2.3. Application Persistence

| Check | Status | Evidence / File Reference | Observations |
|---|---|---|---|
| Multi-Step Wizard Step Mapping | **PASS** | [src/pages/customer/LoanApplicationWizard.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/customer/LoanApplicationWizard.jsx)<br>[src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L13-L126) | All 6 intake steps (Requirements, Applicant, Employment, Collateral, Documents, Consent) map directly to database entities (`loan_applications`, `applicant_details`, `employment_details`, `financial_details`, `property_details`). |
| Draft Creation, Autosave & Recovery | **PASS** | [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L291-L322) | Applications are autosaved with `status: 'draft'`, and `getCustomerApplications(userId)` reloads applications with child relations on page refresh. |
| Transactional Atomicity (Partial-Write Risk) | **FAIL (P2)** | [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L27-L124) | `saveApplicationDraft` executes 5 separate HTTP upsert operations from the browser. A network disconnection midway leaves orphaned or incomplete records. Operations should be wrapped in an atomic PostgreSQL RPC. |
| Immutability of Submitted Applications | **PASS** | [20261113000002_create_core_application_dossier.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000002_create_core_application_dossier.sql#L295-L345) | Triggers `trg_prevent_submitted_application_modification` and `trg_lock_*_details` reject updates once `is_locked = true` or `status != 'draft'`. RLS policies also enforce `is_locked = false`. |

---

### 2.4. Document Storage & Evidence Management

| Check | Status | Evidence / File Reference | Observations |
|---|---|---|---|
| Private Bucket Enforcement | **PASS** | [20261113000008_configure_storage_bucket_and_policies.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000008_configure_storage_bucket_and_policies.sql#L8-L19) | Bucket `mortgage-documents` is configured with `public = false`, 15MB file size limit, and restricted MIME types (`application/pdf`, `image/jpeg`, `image/png`). Raw public URLs return access denied. |
| Path Hardening & Traversal Prevention | **PASS** | [20261113000008_configure_storage_bucket_and_policies.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000008_configure_storage_bucket_and_policies.sql#L26-L41) | Storage RLS policy enforces UUID folder structure `^[0-9a-f\-]{36}/` matching an application owned by `auth.uid()`. Directory traversal sequences (`..`, `//`, `\`) are strictly forbidden. |
| Cryptographic Hash Integrity (SHA-256) | **FAIL (P2)** | [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L196) | File uploads record a synthetic placeholder string (`'sha256_placeholder_' + ...`) in `document_versions` instead of computing the real cryptographic SHA-256 checksum of the file bytes. |
| Authorized Signed URL Lifecycle | **PARTIAL (P3)** | [src/pages/admin/AdminApplicationWorkspace.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/admin/AdminApplicationWorkspace.jsx#L348-L390) | Storage RLS correctly restricts document downloads to the owning borrower and bank staff. However, the frontend UI currently lacks a helper function to generate expiring signed URLs (`createSignedUrl(path, 180)`). |

---

### 2.5. Underwriting & Regulatory Integrity

| Check | Status | Evidence / File Reference | Observations |
|---|---|---|---|
| Non-Binding Assessment Demarcation | **PASS** | [20261113000005_create_policy_risk_and_assessments.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000005_create_policy_risk_and_assessments.sql#L50-L75)<br>[src/services/underwritingEngine.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/underwritingEngine.js#L1-L150) | Preliminary assessments explicitly set `is_binding = false` and include mandatory regulatory disclaimers explaining that formal loan sanction requires physical appraisal and committee approval. |
| Binding Sanction Server-Side Enforcement | **PASS** | [20261113000007_enable_rls_and_policies.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000007_enable_rls_and_policies.sql#L315-L320) | Binding underwriting decisions can only be inserted into `underwriting_decisions` by authenticated staff members (`underwriter`, `super_admin`). Applicants cannot record decisions. |
| Staff Role Verification | **PASS** | [20261113000001_create_extensions_and_auth_trigger.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000001_create_extensions_and_auth_trigger.sql#L40-L49) | Database function `public.is_bank_staff()` verifies caller role in `user_roles` with `SET search_path = public`, preventing search path spoofing. |
| Atomic Adjudication Persistence | **FAIL (P2)** | [src/pages/admin/AdminApplicationWorkspace.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/admin/AdminApplicationWorkspace.jsx#L59-L75) | Recording an underwriter decision executes two separate client calls: `underwriting_decisions.insert()` followed by `loan_applications.update()`. A network interruption between these calls creates state inconsistency. |
| Demarcation of External Bureau Data | **FAIL (P3)** | [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L224) | `submitApplication` defaults to a synthetic bureau score (`740`) without explicitly labeling it as simulated sandbox data in the customer dossier. |

---

### 2.6. Database Consistency & Migration Integrity

| Check | Status | Evidence / File Reference | Observations |
|---|---|---|---|
| Migration Parity (001–009 vs Consolidated) | **PASS** | [supabase/migrations/all_migrations.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/all_migrations.sql) | Line-by-line comparison confirmed 100% statement parity (1,157 non-empty SQL lines) between `all_migrations.sql` and the individual migration files (001 through 009). |
| Supabase CLI Migration History | **WARNING (P3)** | `supabase_migrations.schema_migrations` | Because `all_migrations.sql` was executed manually in the Supabase SQL Editor, the CLI tracking table `schema_migrations` does not contain version records. Running `supabase db push` in the future could attempt duplicate execution. |

---

### 2.7. Security & Penetration Testing Results

| Test Scenario | Attack Vector Tested | Result | Security Policy Enforced |
|---|---|---|---|
| **Cross-Tenant Data Isolation** | Anon / Cross-user SELECT on `loan_applications` and child tables | **PASS (0 rows leaked)** | RLS policies: `auth.uid() = user_id` on headers and `EXISTS` clause on child records. |
| **Role Privilege Escalation** | Direct INSERT to `user_roles` via PostgREST with `role = 'super_admin'` | **PASS (Blocked)** | `REVOKE ALL ON user_roles FROM public, anon, authenticated` returns `403 Permission Denied`. |
| **Submitted Application Modification** | Direct UPDATE to `loan_applications` after `status = 'submitted'` | **PASS (Blocked)** | PostgreSQL Trigger `trg_prevent_submitted_application_modification` and RLS `WITH CHECK (is_locked = false)`. |
| **Storage Folder Manipulation** | Attempted document upload to another user's application UUID prefix | **PASS (Blocked)** | Storage policy verifies `(storage.foldername(name))[1]` matches an application owned by `auth.uid()`. |
| **Adjudication Forgery** | Non-staff user attempting INSERT to `underwriting_decisions` | **PASS (Blocked)** | Policy `"Only underwriters can record decisions"` checks `EXISTS (SELECT 1 FROM user_roles WHERE role IN ('underwriter', 'super_admin'))`. |
| **Audit Log Tampering** | INSERT / UPDATE / DELETE on `audit_logs` | **PASS (Blocked)** | No mutation policies exist for users; only `SECURITY DEFINER` system triggers can write audit records. |

---

## 3. Vulnerability Register & Prioritized Remediation Plan

### Severity Classification

- **Critical (P0):** Application-breaking defect preventing core functionality. Must be resolved immediately.
- **High (P1):** Security vulnerability or authentication bypass that compromises operational integrity.
- **Medium (P2):** Transactional or cryptographic gap that could cause data inconsistency or compliance issues.
- **Low (P3):** Missing client-side convenience feature or administrative tracking limitation.

---

### Vulnerability Details & Minimal Fixes

```
+---------------+------------------------------------------------------------+----------+
| Priority      | Vulnerability / Defect Description                         | Area     |
+---------------+------------------------------------------------------------+----------+
| P0 (Critical) | User Registration Trigger Blocks Signups (NULL auth.uid)    | Auth     |
| P1 (High)     | Prototype Demo Login Buttons Bypass Supabase GoTrue Auth   | Auth     |
| P2 (Medium)   | Client-Side Non-Atomic Multi-Table Draft Upserts           | Dossier  |
| P2 (Medium)   | Synthetic Placeholder Checksum Instead of Real SHA-256     | Storage  |
| P2 (Medium)   | Non-Atomic Underwriter Decision & Application Status Sync  | Decision |
| P3 (Low)      | Missing Frontend Expiring Signed URL Download Helper       | Storage  |
| P3 (Low)      | Unmarked Bureau Fallback Score (740) in Submission Intake  | Bureau   |
+---------------+------------------------------------------------------------+----------+
```

---

#### 1. [P0 — Critical] User Registration Blocked by `protect_user_roles` Trigger

- **Root Cause:** In [supabase/migrations/20261113000001_create_extensions_and_auth_trigger.sql](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/supabase/migrations/20261113000001_create_extensions_and_auth_trigger.sql#L93), `protect_user_roles()` requires `NEW.user_id = auth.uid()`. However, during GoTrue user registration, the background worker has not authenticated as the user yet, so `auth.uid()` is `NULL`. The trigger aborts with `'Privilege escalation blocked'`, rolling back the signup transaction.
- **Impact:** No new users can register on NIRNAY.
- **Minimal Recommended Fix:** Update `protect_user_roles()` to permit inserts when executed internally by the `handle_new_user()` trigger or when `current_user = 'supabase_admin'`, while maintaining strict table permission revocations (`REVOKE ALL ON user_roles FROM authenticated, anon`).

```sql
-- Minimal fix for Migration 001 function
CREATE OR REPLACE FUNCTION public.protect_user_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow initial signup trigger to provision baseline 'customer' role
    IF TG_OP = 'INSERT' AND NEW.role = 'customer' THEN
        RETURN NEW;
    END IF;

    -- For any role modification or staff elevation, caller MUST be a verified super_admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Privilege escalation blocked: Only an authorized Super Admin can grant or modify user roles.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

#### 2. [P1 — High] Remove Prototype Demo Login Bypasses

- **Root Cause:** [src/pages/public/AuthPage.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/public/AuthPage.jsx#L22-L29) and [src/context/AppContext.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/context/AppContext.jsx#L87-L94) retain prototype 1-click buttons (`handleQuickDemoLogin('applicant')` and `handleQuickDemoLogin('bank_admin')`).
- **Impact:** Anyone visiting `/login` can bypass authentication and inject mock state directly into the browser.
- **Minimal Recommended Fix:**
  1. Remove `handleQuickDemoLogin` buttons from `AuthPage.jsx`.
  2. Implement an authenticated `<ProtectedRoute requireStaff={boolean}>` wrapper in [src/App.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/App.jsx).

---

#### 3. [P2 — Medium] Atomic RPC for Application Draft Saving

- **Root Cause:** [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L27-L124) issues 5 sequential HTTP requests for saving draft sections (`loan_applications`, `applicant_details`, `employment_details`, `financial_details`, `property_details`).
- **Impact:** Network failures leave partial or orphaned records.
- **Minimal Recommended Fix:** Create a PostgreSQL function `public.save_application_draft_atomic(p_application_id UUID, p_dossier JSONB)` that executes all upserts within a single transaction.

---

#### 4. [P2 — Medium] Real Cryptographic SHA-256 Generation for Uploaded Files

- **Root Cause:** [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L196) writes a placeholder string (`'sha256_placeholder_' + ...`) into `document_versions`.
- **Impact:** Tamper detection and evidence integrity cannot be verified against file bytes.
- **Minimal Recommended Fix:** Use the browser's native Web Crypto API (`crypto.subtle.digest('SHA-256', buffer)`) to compute the genuine SHA-256 hex string before writing metadata.

```javascript
// Native Web Crypto SHA-256 calculation
async function computeFileSHA256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

#### 5. [P2 — Medium] Atomic Underwriting Adjudication RPC

- **Root Cause:** [src/pages/admin/AdminApplicationWorkspace.jsx](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/pages/admin/AdminApplicationWorkspace.jsx#L59-L75) writes to `underwriting_decisions` and `loan_applications` in separate client-side calls.
- **Impact:** Risk of inconsistent application state if the second HTTP call fails.
- **Minimal Recommended Fix:** Wrap the decision recording in a PostgreSQL RPC `record_underwriting_decision(...)` that updates the application status and inserts the decision atomically.

---

#### 6. [P3 — Low] Expiring Signed URL Helper for Document Inspection

- **Root Cause:** The bucket is strictly private (which is correct), but the frontend lacks a utility to generate expiring signed URLs for underwriter inspection.
- **Minimal Recommended Fix:** Add `getDocumentSignedUrl(storagePath, expiresIn = 180)` in `applicationService.js` calling `supabase.storage.from('mortgage-documents').createSignedUrl(storagePath, expiresIn)`.

---

#### 7. [P3 — Low] Explicit Demarcation of Synthetic Sandbox Bureau Scores

- **Root Cause:** [src/services/applicationService.js](file:///Users/krishnabhadane/Documents/Mumbai%20Hackthon/src/services/applicationService.js#L224) injects a fallback score of 740 into the deterministic underwriting engine.
- **Minimal Recommended Fix:** Flag the bureau score in the assessment record as `data_source: 'SYNTHETIC_SANDBOX'` until live bureau adapters (CIBIL/Experian) are activated.

---

## 4. Conclusion & Next Steps

The post-migration database structure and RLS foundation are institutional-grade and successfully isolate tenant data, enforce statutory loan constraints, and protect mortgage records. 

To achieve production readiness:
1. Apply the P0 fix to `protect_user_roles()` in PostgreSQL so customer registration succeeds immediately.
2. Remove prototype demo buttons and add route guards in the frontend.
3. Replace the placeholder checksum with native Web Crypto SHA-256 computation.
4. Convert multi-table draft saves and adjudication into atomic PostgreSQL RPCs.

