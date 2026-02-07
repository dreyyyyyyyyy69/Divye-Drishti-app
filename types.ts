
export type Section = 'palmistry' | 'kundali' | 'bnn' | 'mahaKundali' | 'dashboard' | 'landing';
export type Language = 'english' | 'hinglish';

export interface UserProfile {
  name: string;
  age: string;
  address: string;
}

export interface SavedChart {
  id: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  gender: string;
}

export interface CommunityPost {
  id: string;
  userName: string;
  text: string;
  timestamp: any;
}

export interface KundaliDetails {
  name: string;
  dob: string;
  tob: string;
  pob: string;
}

export interface MahaKundaliDetails extends KundaliDetails {
  gender: 'male' | 'female' | 'other' | '';
}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  image?: string;
  confidence?: number;
};

export interface UserApiKey {
  id: string;
  name: string;
  key: string;
}

export interface HistoryItem {
  id: string;
  type: Section;
  title: string;
  content: string;
  timestamp: any;
}
