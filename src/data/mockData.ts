import type { Vendor, InspectionRecord, AnalyticsData } from '../types/index';

export const mockVendors: Vendor[] = [
  {
    id: 'V001',
    name: 'Sharma\'s Chaat Corner',
    foodType: 'Chaat & Snacks',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      area: 'Connaught Place'
    },
    currentScore: 35,
    previousScore: 42,
    registrationStatus: 'approved',
    trainingStatus: 'completed',
    lastInspectionDate: '2025-12-15',
    scoreHistory: [
      { date: '2025-10-01', score: 65 },
      { date: '2025-11-01', score: 55 },
      { date: '2025-11-15', score: 42 },
      { date: '2025-12-01', score: 38 },
      { date: '2025-12-15', score: 35 }
    ],
    alerts: [
      {
        id: 'A001',
        type: 'score_drop',
        severity: 'high',
        message: 'Critical: Score dropped below 40',
        createdAt: '2025-12-15',
        resolved: false
      },
      {
        id: 'A002',
        type: 'repeat_violation',
        severity: 'high',
        message: 'Repeat hygiene violation detected',
        createdAt: '2025-12-10',
        resolved: false
      }
    ],
    isRepeatOffender: true,
    contactPerson: 'Rajesh Sharma',
    phone: '+91-98765-43210',
    registrationNumber: 'FSSAI/DL/2024/001',
    documents: {
      fssaiRegistration: 'doc_001.pdf',
      trainingCertificate: 'cert_001.pdf'
    }
  },
  {
    id: 'V002',
    name: 'Priya\'s Juice Bar',
    foodType: 'Beverages',
    location: {
      lat: 28.5355,
      lng: 77.3910,
      area: 'Nehru Place'
    },
    currentScore: 72,
    previousScore: 70,
    registrationStatus: 'approved',
    trainingStatus: 'completed',
    lastInspectionDate: '2025-12-10',
    scoreHistory: [
      { date: '2025-10-01', score: 68 },
      { date: '2025-11-01', score: 70 },
      { date: '2025-11-15', score: 71 },
      { date: '2025-12-01', score: 71 },
      { date: '2025-12-10', score: 72 }
    ],
    alerts: [],
    isRepeatOffender: false,
    contactPerson: 'Priya Singh',
    phone: '+91-98765-43211',
    registrationNumber: 'FSSAI/DL/2024/002',
    documents: {
      fssaiRegistration: 'doc_002.pdf',
      trainingCertificate: 'cert_002.pdf'
    }
  },
  {
    id: 'V003',
    name: 'Mohan\'s Dosa House',
    foodType: 'South Indian',
    location: {
      lat: 28.6300,
      lng: 77.2200,
      area: 'Karol Bagh'
    },
    currentScore: 48,
    previousScore: 52,
    registrationStatus: 'pending',
    trainingStatus: 'pending',
    lastInspectionDate: '2025-12-08',
    scoreHistory: [
      { date: '2025-10-01', score: 58 },
      { date: '2025-11-01', score: 55 },
      { date: '2025-11-15', score: 52 },
      { date: '2025-12-01', score: 50 },
      { date: '2025-12-08', score: 48 }
    ],
    alerts: [
      {
        id: 'A003',
        type: 'inspection_overdue',
        severity: 'medium',
        message: 'Inspection overdue - last inspection 7 days ago',
        createdAt: '2025-12-15',
        resolved: false
      }
    ],
    isRepeatOffender: false,
    contactPerson: 'Mohan Kumar',
    phone: '+91-98765-43212',
    registrationNumber: 'FSSAI/DL/2024/003',
    documents: {}
  },
  {
    id: 'V004',
    name: 'Samosa Paradise',
    foodType: 'Fried Snacks',
    location: {
      lat: 28.6500,
      lng: 77.2500,
      area: 'New Delhi'
    },
    currentScore: 82,
    previousScore: 80,
    registrationStatus: 'approved',
    trainingStatus: 'completed',
    lastInspectionDate: '2025-12-12',
    scoreHistory: [
      { date: '2025-10-01', score: 78 },
      { date: '2025-11-01', score: 79 },
      { date: '2025-11-15', score: 80 },
      { date: '2025-12-01', score: 81 },
      { date: '2025-12-12', score: 82 }
    ],
    alerts: [],
    isRepeatOffender: false,
    contactPerson: 'Deepak Verma',
    phone: '+91-98765-43213',
    registrationNumber: 'FSSAI/DL/2024/004',
    documents: {
      fssaiRegistration: 'doc_004.pdf',
      trainingCertificate: 'cert_004.pdf'
    }
  },
  {
    id: 'V005',
    name: 'Street Sweets Co.',
    foodType: 'Sweets & Desserts',
    location: {
      lat: 28.5700,
      lng: 77.3000,
      area: 'South Delhi'
    },
    currentScore: 45,
    previousScore: 48,
    registrationStatus: 'approved',
    trainingStatus: 'completed',
    lastInspectionDate: '2025-12-05',
    scoreHistory: [
      { date: '2025-10-01', score: 60 },
      { date: '2025-11-01', score: 55 },
      { date: '2025-11-15', score: 50 },
      { date: '2025-12-01', score: 47 },
      { date: '2025-12-05', score: 45 }
    ],
    alerts: [
      {
        id: 'A005',
        type: 'score_drop',
        severity: 'high',
        message: 'Declining hygiene score trend detected',
        createdAt: '2025-12-15',
        resolved: false
      }
    ],
    isRepeatOffender: true,
    contactPerson: 'Anjali Gupta',
    phone: '+91-98765-43214',
    registrationNumber: 'FSSAI/DL/2024/005',
    documents: {
      fssaiRegistration: 'doc_005.pdf'
    }
  }
];

export const mockInspections: InspectionRecord[] = [
  {
    id: 'I001',
    vendorId: 'V001',
    vendorName: 'Sharma\'s Chaat Corner',
    date: '2025-12-15',
    score: 35,
    outcome: 'warning',
    notes: 'Critical hygiene issues found. Immediate remediation required. Waste management inadequate, improper food storage.',
    photos: [],
    checklist: [
      { id: 'C1', category: 'Sanitation', item: 'Handwashing facilities', status: 'fail' },
      { id: 'C2', category: 'Sanitation', item: 'Food storage conditions', status: 'fail' },
      { id: 'C3', category: 'Utensil', item: 'Clean utensils', status: 'pass' },
      { id: 'C4', category: 'Pest Control', item: 'No pest infestation', status: 'fail' }
    ],
    inspectorName: 'Officer Patel'
  },
  {
    id: 'I002',
    vendorId: 'V002',
    vendorName: 'Priya\'s Juice Bar',
    date: '2025-12-10',
    score: 72,
    outcome: 'passed',
    notes: 'Satisfactory. Minor issues to address in next inspection.',
    photos: [],
    checklist: [
      { id: 'C5', category: 'Sanitation', item: 'Handwashing facilities', status: 'pass' },
      { id: 'C6', category: 'Sanitation', item: 'Food storage conditions', status: 'pass' },
      { id: 'C7', category: 'Utensil', item: 'Clean utensils', status: 'pass' },
      { id: 'C8', category: 'Pest Control', item: 'No pest infestation', status: 'pass' }
    ],
    inspectorName: 'Officer Singh'
  },
  {
    id: 'I003',
    vendorId: 'V003',
    vendorName: 'Mohan\'s Dosa House',
    date: '2025-12-08',
    score: 48,
    outcome: 'guidance',
    notes: 'Several compliance gaps. Vendor provided guidance on registration process.',
    photos: [],
    checklist: [
      { id: 'C9', category: 'Sanitation', item: 'Handwashing facilities', status: 'pass' },
      { id: 'C10', category: 'Sanitation', item: 'Food storage conditions', status: 'fail' },
      { id: 'C11', category: 'Utensil', item: 'Clean utensils', status: 'pass' },
      { id: 'C12', category: 'Documentation', item: 'FSSAI registration', status: 'fail' }
    ],
    inspectorName: 'Officer Kumar'
  }
];

export const mockAnalytics: AnalyticsData[] = [
  { date: '2025-11-01', totalVendors: 3200, averageScore: 65, highRiskCount: 280, inspectionsCompleted: 45, issuesIdentified: 23 },
  { date: '2025-11-08', totalVendors: 3215, averageScore: 64, highRiskCount: 295, inspectionsCompleted: 38, issuesIdentified: 28 },
  { date: '2025-11-15', totalVendors: 3220, averageScore: 63, highRiskCount: 310, inspectionsCompleted: 42, issuesIdentified: 31 },
  { date: '2025-11-22', totalVendors: 3225, averageScore: 62, highRiskCount: 328, inspectionsCompleted: 35, issuesIdentified: 25 },
  { date: '2025-11-29', totalVendors: 3230, averageScore: 61, highRiskCount: 345, inspectionsCompleted: 48, issuesIdentified: 36 },
  { date: '2025-12-06', totalVendors: 3240, averageScore: 60, highRiskCount: 365, inspectionsCompleted: 52, issuesIdentified: 42 },
  { date: '2025-12-13', totalVendors: 3250, averageScore: 59, highRiskCount: 380, inspectionsCompleted: 45, issuesIdentified: 38 }
];

export const getVendorRiskStatus = (score: number) => {
  if (score >= 70) return { status: 'green', label: 'Low Risk' };
  if (score >= 50) return { status: 'amber', label: 'Medium Risk' };
  return { status: 'red', label: 'High Risk' };
};

export const generateDummyVendors = (count: number): Vendor[] => {
  const foodTypes = ['Chaat', 'North Indian', 'South Indian', 'Chinese', 'Beverages', 'Sweets', 'Samosas', 'Paratha', 'Vada Pav', 'Momos'];
  const areas = ['Connaught Place', 'Karol Bagh', 'South Delhi', 'East Delhi', 'North Delhi', 'West Delhi', 'Nehru Place', 'Greater Kailash'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `V${String(i + 1).padStart(4, '0')}`,
    name: `Vendor ${i + 1}`,
    foodType: foodTypes[Math.floor(Math.random() * foodTypes.length)],
    location: {
      lat: 28.6 + Math.random() * 0.1,
      lng: 77.2 + Math.random() * 0.2,
      area: areas[Math.floor(Math.random() * areas.length)]
    },
    currentScore: Math.floor(Math.random() * 100),
    registrationStatus: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)] as any,
    trainingStatus: Math.random() > 0.5 ? 'completed' : 'pending',
    scoreHistory: [],
    alerts: [],
    isRepeatOffender: Math.random() > 0.8,
    contactPerson: `Contact ${i + 1}`,
    phone: '+91-98765-00000',
    registrationNumber: `FSSAI/DL/2024/${String(i).padStart(3, '0')}`,
    documents: {}
  }));
};
