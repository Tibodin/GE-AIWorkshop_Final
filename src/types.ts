export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  mriImage: string;
  notes: string;
  status: 'Pending' | 'Analyzed' | 'Done';
  dateAdded: string;
  analysisResult?: string; // JSON string of AnalysisResult[]
}

export interface AnalysisResult {
  label: string;
  confidence: number;
}

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SystemEvent {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  status: string;
}
