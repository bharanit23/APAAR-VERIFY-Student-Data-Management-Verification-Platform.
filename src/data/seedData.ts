/**
 * Seed Dataset for APAAR-Verify
 * Contains 5 real-world technical institutions, programs, intake configurations,
 * 100+ realistic synthetic students, pre-seeded demonstration compliance cases,
 * and pre-configured role profiles.
 */

import {
  Institution,
  Program,
  ApprovedIntake,
  StudentRecord,
  ComplianceCase,
  ConsentRecord,
  VerificationRequest,
  DigitalCredential,
  AuditLog,
  User,
} from '../types';
import { computeDeterministicHmac, signCredentialPayload } from '../services/cryptoService';

export const SEED_USERS: User[] = [
  {
    id: 'USR-AICTE-01',
    name: 'Dr. T. G. Sitharam',
    email: 'admin@aicte-india.org',
    role: 'aicte_admin',
    designation: 'AICTE Chairman & Super Administrator',
  },
  {
    id: 'USR-AICTE-02',
    name: 'Smt. Rekha Balasubramanian',
    email: 'reviewer@aicte-india.org',
    role: 'aicte_reviewer',
    designation: 'Senior Regulatory Reviewer & Case Officer',
  },
  {
    id: 'USR-INST-01',
    name: 'Prof. Ranganathan Swaminathan',
    email: 'admin@iitd.ac.in',
    role: 'inst_admin',
    institutionId: 'INST-IITD',
    institutionName: 'Indian Institute of Technology Delhi',
    designation: 'Dean of Academic Affairs',
  },
  {
    id: 'USR-INST-02',
    name: 'Dr. Meenakshi Sundaram',
    email: 'admissions@annauniv.edu',
    role: 'admission_officer',
    institutionId: 'INST-CEG',
    institutionName: 'CEG Anna University, Chennai',
    designation: 'Chief Admission Officer',
  },
  {
    id: 'USR-STUD-01',
    name: 'Aryan Sharma',
    email: 'aryan.sharma@student.aicte-verify.gov.in',
    role: 'student',
    institutionId: 'INST-IITD',
    institutionName: 'Indian Institute of Technology Delhi',
    designation: 'B.Tech CSE Student (2024-28 Batch)',
  },
  {
    id: 'USR-EMP-01',
    name: 'Rajesh Menon',
    email: 'rajesh.menon@tcs-talent.com',
    role: 'employer_verifier',
    designation: 'Tata Consultancy Services - Lead Talent Verifier',
  },
  {
    id: 'USR-AUDIT-01',
    name: 'S. K. Verma, IAAS',
    email: 'auditor@cag-academic.gov.in',
    role: 'auditor',
    designation: 'Comptroller & Academic Audit Officer',
  },
];

export const SEED_INSTITUTIONS: Institution[] = [
  {
    id: 'INST-IITD',
    aicteApprovalId: 'AICTE-DL-ENG-001',
    code: 'IITD-110016',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    state: 'Delhi',
    district: 'South Delhi',
    address: 'Hauz Khas, New Delhi 110016',
    contactEmail: 'registrar@admin.iitd.ac.in',
    contactPhone: '+91 11 2659 7135',
    status: 'APPROVED',
    establishedYear: 1961,
    accreditation: 'NAAC A++ / NIRF Rank 2',
    complianceScore: 98,
    riskLevel: 'LOW',
  },
  {
    id: 'INST-CEG',
    aicteApprovalId: 'AICTE-TN-ENG-002',
    code: 'CEG-600025',
    name: 'College of Engineering Guindy, Anna University',
    shortName: 'CEG Anna University',
    state: 'Tamil Nadu',
    district: 'Chennai',
    address: 'Sardar Patel Road, Guindy, Chennai 600025',
    contactEmail: 'dean@ceg.annauniv.edu',
    contactPhone: '+91 44 2235 7004',
    status: 'FLAGGED',
    establishedYear: 1794,
    accreditation: 'NAAC A+ / NIRF Rank 8',
    complianceScore: 68,
    riskLevel: 'HIGH',
  },
  {
    id: 'INST-COEP',
    aicteApprovalId: 'AICTE-MH-ENG-003',
    code: 'COEP-411005',
    name: 'COEP Technological University Pune',
    shortName: 'COEP Pune',
    state: 'Maharashtra',
    district: 'Pune',
    address: 'Wellesley Road, Shivajinagar, Pune 411005',
    contactEmail: 'registrar@coeptech.ac.in',
    contactPhone: '+91 20 2550 7000',
    status: 'UNDER_REVIEW',
    establishedYear: 1854,
    accreditation: 'NBA Tier 1 / NAAC A',
    complianceScore: 82,
    riskLevel: 'MEDIUM',
  },
  {
    id: 'INST-NITK',
    aicteApprovalId: 'AICTE-KA-ENG-004',
    code: 'NITK-575025',
    name: 'National Institute of Technology Karnataka, Surathkal',
    shortName: 'NITK Surathkal',
    state: 'Karnataka',
    district: 'Dakshina Kannada',
    address: 'NH 66, Srinivasnagar, Surathkal, Mangaluru 575025',
    contactEmail: 'dean_academic@nitk.edu.in',
    contactPhone: '+91 824 247 4000',
    status: 'APPROVED',
    establishedYear: 1960,
    accreditation: 'NAAC A / NIRF Rank 12',
    complianceScore: 95,
    riskLevel: 'LOW',
  },
  {
    id: 'INST-MIT',
    aicteApprovalId: 'AICTE-KA-ENG-005',
    code: 'MIT-576104',
    name: 'Manipal Institute of Technology',
    shortName: 'Manipal Tech',
    state: 'Karnataka',
    district: 'Udupi',
    address: 'Eshwar Nagar, Manipal, Karnataka 576104',
    contactEmail: 'director.mit@manipal.edu',
    contactPhone: '+91 820 292 4012',
    status: 'FLAGGED',
    establishedYear: 1957,
    accreditation: 'NAAC A++ / NIRF Rank 61',
    complianceScore: 62,
    riskLevel: 'CRITICAL',
  },
];

export const SEED_PROGRAMS: Program[] = [
  {
    id: 'PROG-CSE',
    code: 'BTECH-CSE',
    name: 'Computer Science and Engineering',
    degree: 'B.Tech',
    durationYears: 4,
  },
  {
    id: 'PROG-ECE',
    code: 'BTECH-ECE',
    name: 'Electronics and Communication Engineering',
    degree: 'B.Tech',
    durationYears: 4,
  },
  {
    id: 'PROG-MECH',
    code: 'BTECH-MECH',
    name: 'Mechanical Engineering',
    degree: 'B.Tech',
    durationYears: 4,
  },
  {
    id: 'PROG-AI',
    code: 'MTECH-AI',
    name: 'Artificial Intelligence and Data Science',
    degree: 'M.Tech',
    durationYears: 2,
  },
];

export const SEED_APPROVED_INTAKES: ApprovedIntake[] = [
  // IIT Delhi
  {
    id: 'INTK-IITD-CSE-24',
    institutionId: 'INST-IITD',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    approvedIntake: 120,
    supernumeraryQuota: 12,
    nriQuota: 10,
    ociQuota: 5,
    fnQuota: 5,
  },
  {
    id: 'INTK-IITD-ECE-24',
    institutionId: 'INST-IITD',
    programId: 'PROG-ECE',
    academicYear: '2024-25',
    approvedIntake: 90,
    supernumeraryQuota: 9,
    nriQuota: 8,
    ociQuota: 4,
    fnQuota: 4,
  },
  // CEG Anna University (DEMO CASE 5: Approved is 120, but actual is 130 -> Excess Intake)
  {
    id: 'INTK-CEG-CSE-24',
    institutionId: 'INST-CEG',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    approvedIntake: 120,
    supernumeraryQuota: 10,
    nriQuota: 15,
    ociQuota: 5,
    fnQuota: 5,
  },
  {
    id: 'INTK-CEG-MECH-24',
    institutionId: 'INST-CEG',
    programId: 'PROG-MECH',
    academicYear: '2024-25',
    approvedIntake: 120,
    supernumeraryQuota: 10,
    nriQuota: 10,
    ociQuota: 5,
    fnQuota: 5,
  },
  // COEP Pune
  {
    id: 'INTK-COEP-CSE-24',
    institutionId: 'INST-COEP',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    approvedIntake: 120,
    supernumeraryQuota: 12,
    nriQuota: 15,
    ociQuota: 5,
    fnQuota: 5,
  },
  // NITK Surathkal
  {
    id: 'INTK-NITK-CSE-24',
    institutionId: 'INST-NITK',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    approvedIntake: 115,
    supernumeraryQuota: 11,
    nriQuota: 10,
    ociQuota: 5,
    fnQuota: 5,
  },
  // Manipal Tech (DEMO CASE 6: Approved NRI is 30, but actual is 35 -> NRI Quota Breach)
  {
    id: 'INTK-MIT-CSE-24',
    institutionId: 'INST-MIT',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    approvedIntake: 180,
    supernumeraryQuota: 18,
    nriQuota: 30,
    ociQuota: 10,
    fnQuota: 10,
  },
];

// Helper to generate seed students with realistic Indian names
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Akash', 'Ananya', 'Aryan', 'Bhavna', 'Chetan', 'Deepak', 'Divya', 'Gaurav',
  'Ishaan', 'Kavya', 'Karan', 'Manish', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Priya', 'Rahul',
  'Rohan', 'Sakshi', 'Sameer', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi', 'Utkarsh', 'Varun', 'Vidya'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Patel', 'Deshmukh', 'Kulkarni', 'Reddy', 'Nair', 'Singh', 'Banerjee',
  'Gupta', 'Chopra', 'Rao', 'Bhat', 'Joshi', 'Mehta', 'Chatterjee', 'Pillai', 'Hegde', 'Menon'
];

function generateSeedStudents(): StudentRecord[] {
  const students: StudentRecord[] = [];

  // ==========================================
  // SPECIFIC DEMONSTRATION CASES (1 to 10)
  // ==========================================

  // Demo Case 1: Valid APAAR Student (Aryan Sharma at IIT Delhi)
  students.push({
    id: 'STU-DEMO-01',
    apaarId: '712345678901',
    apaarIdHmac: computeDeterministicHmac('712345678901'),
    institutionalStudentId: 'IITD-2024-CS101',
    rollNumber: '2024CS1001',
    name: 'Aryan Sharma',
    dob: '2004-05-14',
    gender: 'MALE',
    email: 'aryan.sharma@student.aicte-verify.gov.in',
    mobile: '+91 98112 34567',
    institutionId: 'INST-IITD',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-15',
    admissionCategory: 'General',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-IITD-089',
    apaarVerificationStatus: 'VERIFIED',
    apaarVerificationDate: '2024-07-16T10:30:00Z',
    riskLevel: 'LOW',
    createdAt: '2024-07-15T09:00:00Z',
    updatedAt: '2024-07-16T10:30:00Z',
  });

  // Demo Case 2: Invalid 12-digit Format (Vikram Singh at COEP Pune)
  students.push({
    id: 'STU-DEMO-02',
    apaarId: '9988-ABC-12', // Corrupt format
    apaarIdHmac: computeDeterministicHmac('9988-ABC-12'),
    institutionalStudentId: 'COEP-2024-CS188',
    rollNumber: '2024CS1088',
    name: 'Vikram Singh',
    dob: '2004-09-12',
    gender: 'MALE',
    email: 'vikram.singh@coep.ac.in',
    mobile: '+91 97200 44112',
    institutionId: 'INST-COEP',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-18',
    admissionCategory: 'General',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-COEP-411',
    apaarVerificationStatus: 'INVALID_FORMAT',
    verificationFailureReason: 'APAAR ID must contain exactly 12 numeric digits without alphabets or special characters',
    riskLevel: 'HIGH',
    riskNotes: ['Invalid APAAR format blocks DigiLocker academic credit sync'],
    createdAt: '2024-07-18T11:00:00Z',
    updatedAt: '2024-07-18T11:00:00Z',
  });

  // Demo Case 3: Duplicate APAAR within One Institution (Rohan Kulkarni at COEP Pune)
  students.push({
    id: 'STU-DEMO-03A',
    apaarId: '823456789012',
    apaarIdHmac: computeDeterministicHmac('823456789012'),
    institutionalStudentId: 'COEP-2024-CS142',
    rollNumber: '2024CS1042',
    name: 'Rohan Kulkarni',
    dob: '2004-02-18',
    gender: 'MALE',
    email: 'rohan.kulkarni@coep.ac.in',
    mobile: '+91 98230 11223',
    institutionId: 'INST-COEP',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-20',
    admissionCategory: 'OBC-NCL',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-COEP-442',
    apaarVerificationStatus: 'VERIFIED',
    flaggedDuplicate: true,
    duplicateConflictType: 'INTRA_INSTITUTION',
    conflictingStudentId: 'STU-DEMO-03B',
    riskLevel: 'HIGH',
    riskNotes: ['Internal duplicate: APAAR ID shared with student record STU-DEMO-03B'],
    createdAt: '2024-07-20T10:00:00Z',
    updatedAt: '2024-07-20T10:00:00Z',
  });

  students.push({
    id: 'STU-DEMO-03B',
    apaarId: '823456789012', // Exact same APAAR in same institution!
    apaarIdHmac: computeDeterministicHmac('823456789012'),
    institutionalStudentId: 'COEP-2024-CS199',
    rollNumber: '2024CS1099',
    name: 'Rohan K. (Re-entry)',
    dob: '2004-02-18',
    gender: 'MALE',
    email: 'rohan.k.temp@coep.ac.in',
    mobile: '+91 98230 11224',
    institutionId: 'INST-COEP',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-25',
    admissionCategory: 'OBC-NCL',
    seatType: 'Management',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-COEP-499',
    apaarVerificationStatus: 'VERIFIED',
    flaggedDuplicate: true,
    duplicateConflictType: 'INTRA_INSTITUTION',
    conflictingStudentId: 'STU-DEMO-03A',
    riskLevel: 'HIGH',
    riskNotes: ['Internal duplicate: Accidental double entry detected in batch upload'],
    createdAt: '2024-07-25T14:30:00Z',
    updatedAt: '2024-07-25T14:30:00Z',
  });

  // Demo Case 4: Same APAAR in Two Institutions (Neha Verma at IIT Delhi AND CEG Anna University)
  students.push({
    id: 'STU-DEMO-04A',
    apaarId: '634567890123',
    apaarIdHmac: computeDeterministicHmac('634567890123'),
    institutionalStudentId: 'IITD-2024-CS115',
    rollNumber: '2024CS1015',
    name: 'Neha Verma',
    dob: '2004-08-09',
    gender: 'FEMALE',
    email: 'neha.verma@iitd.ac.in',
    mobile: '+91 99100 88221',
    institutionId: 'INST-IITD',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-12',
    admissionCategory: 'General',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-IITD-115',
    apaarVerificationStatus: 'VERIFIED',
    flaggedDuplicate: true,
    duplicateConflictType: 'INTER_INSTITUTION',
    conflictingInstitutionId: 'INST-CEG',
    conflictingStudentId: 'STU-DEMO-04B',
    riskLevel: 'CRITICAL',
    riskNotes: ['Cross-Institution Conflict: Concurrently enrolled at CEG Anna University without transfer release'],
    createdAt: '2024-07-12T09:30:00Z',
    updatedAt: '2024-07-12T09:30:00Z',
  });

  students.push({
    id: 'STU-DEMO-04B',
    apaarId: '634567890123', // Same APAAR!
    apaarIdHmac: computeDeterministicHmac('634567890123'),
    institutionalStudentId: 'CEG-2024-CS088',
    rollNumber: '2024CS088',
    name: 'Neha Verma',
    dob: '2004-08-09',
    gender: 'FEMALE',
    email: 'neha.v@ceg.annauniv.edu',
    mobile: '+91 99100 88221',
    institutionId: 'INST-CEG',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-28',
    admissionCategory: 'General',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-CEG-088',
    apaarVerificationStatus: 'VERIFIED',
    flaggedDuplicate: true,
    duplicateConflictType: 'INTER_INSTITUTION',
    conflictingInstitutionId: 'INST-IITD',
    conflictingStudentId: 'STU-DEMO-04A',
    riskLevel: 'CRITICAL',
    riskNotes: ['Cross-Institution Conflict: Candidate already registered at IIT Delhi'],
    createdAt: '2024-07-28T16:00:00Z',
    updatedAt: '2024-07-28T16:00:00Z',
  });

  // Demo Case 7: Name Mismatch (Priya Ranganathan at CEG Anna University)
  students.push({
    id: 'STU-DEMO-07',
    apaarId: '823456789012',
    apaarIdHmac: computeDeterministicHmac('823456789012'),
    institutionalStudentId: 'CEG-2024-CS045',
    rollNumber: '2024CS045',
    name: 'Priya R.', // Triggers name mismatch against ABC registry "Priya Ranganathan"
    dob: '2003-11-20',
    gender: 'FEMALE',
    email: 'priya.r@annauniv.edu',
    mobile: '+91 94440 55112',
    institutionId: 'INST-CEG',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-16',
    admissionCategory: 'OBC-NCL',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-CEG-045',
    apaarVerificationStatus: 'NAME_MISMATCH',
    verificationFailureReason: 'Name mismatch: Registry name is "Priya Ranganathan", institution entered "Priya R."',
    riskLevel: 'MEDIUM',
    riskNotes: ['Institutional ERP abbreviation does not match National Academic Depository'],
    createdAt: '2024-07-16T10:00:00Z',
    updatedAt: '2024-07-16T10:00:00Z',
  });

  // Demo Case 8: Pending Verification (Karthik Raja at CEG)
  students.push({
    id: 'STU-DEMO-08',
    apaarId: '367890123456',
    apaarIdHmac: computeDeterministicHmac('367890123456'),
    institutionalStudentId: 'CEG-2024-CS119',
    rollNumber: '2024CS119',
    name: 'Karthik Raja',
    dob: '2003-09-18',
    gender: 'MALE',
    email: 'karthik.raja@annauniv.edu',
    mobile: '+91 94441 22334',
    institutionId: 'INST-CEG',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    admissionDate: '2024-07-29',
    admissionCategory: 'SC',
    seatType: 'Merit',
    isSupernumerary: false,
    isNri: false,
    isOci: false,
    isForeignNational: false,
    academicStatus: 'Enrolled',
    consentReference: 'CONS-2024-CEG-119',
    apaarVerificationStatus: 'PENDING',
    riskLevel: 'LOW',
    createdAt: '2024-07-29T11:00:00Z',
    updatedAt: '2024-07-29T11:00:00Z',
  });

  // ==========================================
  // BULK SEEDING TO BRING CEG TO 130 ADMISSIONS (Approved: 120 -> Excess Intake!)
  // And MANIPAL to 35 NRI Admissions (Approved: 30 -> NRI Breach!)
  // ==========================================

  // Let's add students to CEG CSE to reach exactly 130 admissions
  // We already added 4 to CEG CSE (STU-DEMO-04B, STU-DEMO-07, STU-DEMO-08 + 126 more)
  for (let i = 1; i <= 126; i++) {
    const fName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i + 3) % LAST_NAMES.length];
    const apaar = `${(100000000000 + i * 3721).toString().slice(0, 12)}`;
    students.push({
      id: `STU-CEG-${i.toString().padStart(3, '0')}`,
      apaarId: apaar,
      apaarIdHmac: computeDeterministicHmac(apaar),
      institutionalStudentId: `CEG-2024-CS${i.toString().padStart(3, '0')}`,
      rollNumber: `2024CS${i.toString().padStart(3, '0')}`,
      name: `${fName} ${lName}`,
      dob: `2004-${((i % 12) + 1).toString().padStart(2, '0')}-${((i % 27) + 1).toString().padStart(2, '0')}`,
      gender: i % 3 === 0 ? 'FEMALE' : 'MALE',
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@annauniv.edu`,
      mobile: `+91 9444${(100000 + i).toString()}`,
      institutionId: 'INST-CEG',
      programId: 'PROG-CSE',
      academicYear: '2024-25',
      admissionDate: '2024-07-20',
      admissionCategory: i % 4 === 0 ? 'OBC-NCL' : i % 5 === 0 ? 'SC' : 'General',
      seatType: i > 120 ? 'Management' : 'Merit', // Notice excess seats admitted under management
      isSupernumerary: false,
      isNri: false,
      isOci: false,
      isForeignNational: false,
      academicStatus: 'Enrolled',
      consentReference: `CONS-2024-CEG-${i}`,
      apaarVerificationStatus: 'VERIFIED',
      apaarVerificationDate: '2024-07-21T09:00:00Z',
      riskLevel: i > 120 ? 'CRITICAL' : 'LOW',
      riskNotes: i > 120 ? ['Admitted beyond AICTE sanctioned intake capacity of 120'] : undefined,
      createdAt: '2024-07-20T09:00:00Z',
      updatedAt: '2024-07-21T09:00:00Z',
    });
  }

  // Seed Manipal Tech (MIT) CSE students: total 140 students, including exactly 35 NRI admissions (Approved limit is 30 -> 5 excess NRI)
  for (let i = 1; i <= 60; i++) {
    const isNriStudent = i <= 35; // 35 NRI students admitted!
    const fName = FIRST_NAMES[(i + 7) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i + 5) % LAST_NAMES.length];
    const apaar = `${(200000000000 + i * 4913).toString().slice(0, 12)}`;
    students.push({
      id: `STU-MIT-${i.toString().padStart(3, '0')}`,
      apaarId: apaar,
      apaarIdHmac: computeDeterministicHmac(apaar),
      institutionalStudentId: `MIT-2024-CS${i.toString().padStart(3, '0')}`,
      rollNumber: `2024CS${(100 + i).toString()}`,
      name: `${fName} ${lName}`,
      dob: `2004-${((i % 12) + 1).toString().padStart(2, '0')}-${((i % 27) + 1).toString().padStart(2, '0')}`,
      gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@manipal.edu`,
      mobile: `+91 9886${(100000 + i).toString()}`,
      institutionId: 'INST-MIT',
      programId: 'PROG-CSE',
      academicYear: '2024-25',
      admissionDate: '2024-07-22',
      admissionCategory: 'General',
      seatType: isNriStudent ? 'NRI' : 'Merit',
      isSupernumerary: false,
      isNri: isNriStudent,
      isOci: false,
      isForeignNational: false,
      academicStatus: 'Enrolled',
      consentReference: `CONS-2024-MIT-${i}`,
      apaarVerificationStatus: 'VERIFIED',
      apaarVerificationDate: '2024-07-23T11:00:00Z',
      riskLevel: isNriStudent && i > 30 ? 'HIGH' : 'LOW',
      riskNotes: isNriStudent && i > 30 ? ['NRI admission quota exceeded (Permitted: 30, Admitted: 35)'] : undefined,
      createdAt: '2024-07-22T10:00:00Z',
      updatedAt: '2024-07-23T11:00:00Z',
    });
  }

  // Seed IIT Delhi (total 35 additional CSE students, compliant)
  for (let i = 1; i <= 35; i++) {
    const fName = FIRST_NAMES[(i + 12) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i + 8) % LAST_NAMES.length];
    const apaar = `${(300000000000 + i * 5183).toString().slice(0, 12)}`;
    students.push({
      id: `STU-IITD-${i.toString().padStart(3, '0')}`,
      apaarId: apaar,
      apaarIdHmac: computeDeterministicHmac(apaar),
      institutionalStudentId: `IITD-2024-CS${(120 + i).toString()}`,
      rollNumber: `2024CS${(1020 + i).toString()}`,
      name: `${fName} ${lName}`,
      dob: `2004-${((i % 12) + 1).toString().padStart(2, '0')}-${((i % 27) + 1).toString().padStart(2, '0')}`,
      gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@iitd.ac.in`,
      mobile: `+91 9811${(100000 + i).toString()}`,
      institutionId: 'INST-IITD',
      programId: 'PROG-CSE',
      academicYear: '2024-25',
      admissionDate: '2024-07-14',
      admissionCategory: 'General',
      seatType: 'Merit',
      isSupernumerary: false,
      isNri: false,
      isOci: false,
      isForeignNational: false,
      academicStatus: 'Enrolled',
      consentReference: `CONS-2024-IITD-${i}`,
      apaarVerificationStatus: 'VERIFIED',
      apaarVerificationDate: '2024-07-15T10:00:00Z',
      riskLevel: 'LOW',
      createdAt: '2024-07-14T09:00:00Z',
      updatedAt: '2024-07-15T10:00:00Z',
    });
  }

  // Seed NITK Surathkal (total 25 CSE students, compliant)
  for (let i = 1; i <= 25; i++) {
    const fName = FIRST_NAMES[(i + 15) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i + 11) % LAST_NAMES.length];
    const apaar = `${(400000000000 + i * 6271).toString().slice(0, 12)}`;
    students.push({
      id: `STU-NITK-${i.toString().padStart(3, '0')}`,
      apaarId: apaar,
      apaarIdHmac: computeDeterministicHmac(apaar),
      institutionalStudentId: `NITK-2024-CS${(100 + i).toString()}`,
      rollNumber: `2024CS${(200 + i).toString()}`,
      name: `${fName} ${lName}`,
      dob: `2004-${((i % 12) + 1).toString().padStart(2, '0')}-${((i % 27) + 1).toString().padStart(2, '0')}`,
      gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@nitk.edu.in`,
      mobile: `+91 9480${(100000 + i).toString()}`,
      institutionId: 'INST-NITK',
      programId: 'PROG-CSE',
      academicYear: '2024-25',
      admissionDate: '2024-07-17',
      admissionCategory: 'General',
      seatType: 'Merit',
      isSupernumerary: false,
      isNri: false,
      isOci: false,
      isForeignNational: false,
      academicStatus: 'Enrolled',
      consentReference: `CONS-2024-NITK-${i}`,
      apaarVerificationStatus: 'VERIFIED',
      apaarVerificationDate: '2024-07-18T10:00:00Z',
      riskLevel: 'LOW',
      createdAt: '2024-07-17T09:00:00Z',
      updatedAt: '2024-07-18T10:00:00Z',
    });
  }

  return students;
}

export const SEED_STUDENTS = generateSeedStudents();

// Pre-seeded compliance cases matching demonstration scenarios
export const SEED_CASES: ComplianceCase[] = [
  // Case 1: Cross-institution conflict for Neha Verma
  {
    id: 'CASE-2024-001',
    caseNumber: 'AICTE-CC-2024-0891',
    caseType: 'CROSS_INSTITUTION_DUPLICATE',
    institutionId: 'INST-IITD',
    secondaryInstitutionId: 'INST-CEG',
    studentId: 'STU-DEMO-04A',
    secondaryStudentId: 'STU-DEMO-04B',
    apaarId: '634567890123',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    severity: 'CRITICAL',
    status: 'OPEN',
    title: 'Cross-Institution Concurrent Enrolment Alert: Neha Verma',
    description: 'National APAAR engine flagged duplicate active enrolment for APAAR ID 6345 6789 0123 at IIT Delhi and CEG Anna University without an official migration certificate.',
    evidence: {
      apaarId: '634567890123',
      candidateName: 'Neha Verma',
      institutionA: 'Indian Institute of Technology Delhi (Roll: 2024CS1015, Enrolled: 2024-07-12)',
      institutionB: 'CEG Anna University, Chennai (Roll: 2024CS088, Enrolled: 2024-07-28)',
      conflictConfidence: 100,
    },
    requestedClarification: 'AICTE requires CEG Anna University to clarify if candidate submitted physical transfer certificate from IIT Delhi prior to seat confirmation.',
    openedBy: 'AICTE National Audit System',
    createdAt: '2024-07-29T14:00:00Z',
  },
  // Case 2: Excess Intake violation at CEG Anna University (130 admitted vs 120 approved)
  {
    id: 'CASE-2024-002',
    caseNumber: 'AICTE-CC-2024-0892',
    caseType: 'EXCESS_INTAKE_VIOLATION',
    institutionId: 'INST-CEG',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    severity: 'CRITICAL',
    status: 'CLARIFICATION_REQUESTED',
    title: 'Excess Admission Above Sanctioned Intake: CEG Anna University (B.Tech CSE)',
    description: 'CEG Anna University has admitted 130 students in B.Tech Computer Science against AICTE sanctioned capacity of 120 (108.3% intake utilization). Excess 10 seats enrolled under unauthorized category.',
    evidence: {
      sanctionedIntake: 120,
      actualAdmitted: 130,
      excessSeats: 10,
      utilizationRate: '108.3%',
      flaggedBatchId: 'BATCH-2024-CEG-01',
    },
    requestedClarification: 'Show cause notice issued: Provide justification for admitting 10 candidates over the sanctioned intake limit of 120 seats.',
    openedBy: 'Smt. Rekha Balasubramanian (AICTE Reviewer)',
    createdAt: '2024-08-01T10:30:00Z',
  },
  // Case 3: NRI Quota breach at Manipal Tech (35 NRI admitted vs limit of 30)
  {
    id: 'CASE-2024-003',
    caseNumber: 'AICTE-CC-2024-0893',
    caseType: 'NRI_QUOTA_BREACH',
    institutionId: 'INST-MIT',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    severity: 'HIGH',
    status: 'RESPONSE_RECEIVED',
    title: 'NRI Supernumerary Quota Breach: Manipal Institute of Technology',
    description: 'Manipal Institute of Technology admitted 35 students under NRI sponsorship, breaching the approved maximum limit of 30 seats by 5 candidates.',
    evidence: {
      approvedNriQuota: 30,
      actualNriAdmitted: 35,
      breachCount: 5,
    },
    requestedClarification: 'Explain basis for allocating 5 additional NRI seats without prior AICTE approval council notification.',
    institutionResponse: 'The 5 candidates in question are Gulf-quota expatriate wards under MEA repatriation scheme. Approval documentation submitted for council ratification.',
    institutionResponseDate: '2024-08-05T16:20:00Z',
    openedBy: 'AICTE National Audit System',
    createdAt: '2024-08-02T11:00:00Z',
  },
];

// Pre-seeded consent records & verification requests
export const SEED_CONSENTS: ConsentRecord[] = [
  {
    id: 'CONS-DEMO-01',
    studentId: 'STU-DEMO-01', // Aryan Sharma
    requesterId: 'USR-EMP-01',
    requesterName: 'Rajesh Menon',
    requesterOrg: 'Tata Consultancy Services (TCS)',
    requesterPurpose: 'Campus Recruitment Background Verification & National APAAR Academic Record Validation',
    scope: ['Enrolment Status', 'Academic Records', 'Degree Qualification', 'APAAR Reference'],
    status: 'PENDING',
    requestedAt: '2024-08-10T09:15:00Z',
    expiresAt: '2024-09-10T23:59:59Z',
  },
];

export const SEED_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'REQ-DEMO-01',
    requestId: 'VER-REQ-2024-0912',
    verifierId: 'USR-EMP-01',
    verifierOrg: 'Tata Consultancy Services (TCS)',
    verifierEmail: 'rajesh.menon@tcs-talent.com',
    targetApaarId: '712345678901',
    studentId: 'STU-DEMO-01',
    purpose: 'Campus Recruitment Verification for System Engineer Trainee Offer',
    requestedFields: ['Full Name', 'Roll Number', 'Institution', 'Program', 'Academic Status', 'APAAR Verification Status'],
    status: 'PENDING_CONSENT',
    createdAt: '2024-08-10T09:15:00Z',
    consentId: 'CONS-DEMO-01',
  },
];

// Verifiable digital credential for Aryan Sharma
const aryanSnapshot = {
  studentName: 'Aryan Sharma',
  maskedApaarId: '•••• •••• 8901',
  rollNumber: '2024CS1001',
  institutionName: 'Indian Institute of Technology Delhi',
  programName: 'Computer Science and Engineering (B.Tech)',
  academicYear: '2024-25',
  admissionStatus: 'Active Enrolled',
  signedBy: 'AICTE National Verifier Authority & IIT Delhi Registrar',
};

export const SEED_CREDENTIALS: DigitalCredential[] = [
  {
    id: 'CRD-DEMO-01',
    credentialId: 'CRD-2024-IITD-88419',
    studentId: 'STU-DEMO-01',
    institutionId: 'INST-IITD',
    programId: 'PROG-CSE',
    academicYear: '2024-25',
    issueDate: '2024-07-16',
    status: 'ACTIVE',
    digitalSignature: signCredentialPayload(aryanSnapshot),
    verificationUrl: `https://aicte-verify.gov.in/verify?crd=CRD-2024-IITD-88419`,
    qrPayload: JSON.stringify({
      crd: 'CRD-2024-IITD-88419',
      stu: 'Aryan Sharma',
      apaar: '•••• •••• 8901',
      inst: 'IIT Delhi',
      sig: 'VALID_ECDSA',
    }),
    payloadSnapshot: aryanSnapshot,
  },
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-08-10T09:15:00Z',
    actorId: 'USR-EMP-01',
    actorName: 'Rajesh Menon (TCS)',
    actorRole: 'employer_verifier',
    action: 'INITIATE_VERIFICATION_REQUEST',
    entityType: 'STUDENT',
    entityId: 'STU-DEMO-01',
    details: 'Submitted candidate academic verification request for Aryan Sharma (APAAR: •••• •••• 8901)',
    ipAddress: '14.143.12.89',
  },
  {
    id: 'AUD-002',
    timestamp: '2024-08-01T10:30:00Z',
    actorId: 'USR-AICTE-02',
    actorName: 'Smt. Rekha Balasubramanian',
    actorRole: 'aicte_reviewer',
    action: 'OPEN_COMPLIANCE_CASE',
    entityType: 'CASE',
    entityId: 'CASE-2024-002',
    details: 'Opened compliance case AICTE-CC-2024-0892 against CEG Anna University for 10 excess seats admitted',
    ipAddress: '10.24.18.5',
  },
  {
    id: 'AUD-003',
    timestamp: '2024-07-29T14:00:00Z',
    actorId: 'SYSTEM',
    actorName: 'National APAAR Automated Engine',
    actorRole: 'aicte_admin',
    action: 'DUPLICATE_CROSS_INSTITUTION_DETECTED',
    entityType: 'STUDENT',
    entityId: 'STU-DEMO-04A',
    details: 'Cross-institution duplicate conflict detected between IIT Delhi and CEG Anna University for APAAR 6345 6789 0123',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'AUD-004',
    timestamp: '2024-07-16T10:30:00Z',
    actorId: 'SYSTEM',
    actorName: 'DigiLocker Mock Gateway',
    actorRole: 'aicte_admin',
    action: 'APAAR_VALIDATED',
    entityType: 'STUDENT',
    entityId: 'STU-DEMO-01',
    details: 'APAAR 7123 4567 8901 matched with National Academic Bank of Credits account ABC-DL-2024-8841',
    ipAddress: '127.0.0.1',
  },
];
