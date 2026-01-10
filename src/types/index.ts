export interface Vendor {
  id: string;
  name: string;
  foodType: string;
  location: {
    lat: number;
    lng: number;
    area: string;
  };
  currentScore: number;
  previousScore?: number;
  registrationStatus: 'approved' | 'pending' | 'rejected';
  trainingStatus: 'completed' | 'pending';
  lastInspectionDate?: string;
  scoreHistory: ScoreEntry[];
  alerts: Alert[];
  isRepeatOffender: boolean;
  contactPerson: string;
  phone: string;
  registrationNumber: string;
  documents: {
    fssaiRegistration?: string;
    trainingCertificate?: string;
  };
}

export interface ScoreEntry {
  date: string;
  score: number;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'score_drop' | 'repeat_violation' | 'inspection_overdue';
  severity: 'high' | 'medium' | 'low';
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface InspectionRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  score: number;
  outcome: 'warning' | 'guidance' | 'passed' | 'follow-up';
  notes: string;
  photos: string[];
  checklist: ChecklistItem[];
  inspectorName: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na';
}

export interface AnalyticsData {
  date: string;
  totalVendors: number;
  averageScore: number;
  highRiskCount: number;
  inspectionsCompleted: number;
  issuesIdentified: number;
}
