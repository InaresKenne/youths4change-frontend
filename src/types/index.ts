// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  country: string;
  beneficiaries_count: number;
  budget: number;
  status: 'active' | 'completed' | 'deleted';
  cloudinary_public_id: string | null;
  created_at: string;
  updated_at: string;
}

// Application types
export interface Application {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  reviewed_at?: string;
}

// Donation types with manual payment verification support
export interface Donation {
  id: number;
  donor_name: string;
  email: string;
  amount: number;
  project_id: number;
  country: string;
  status: string;
  donation_date: string;
  // Manual payment fields (Mobile Money & Bank Transfer)
  currency?: string;
  payment_method?: 'mobile_money' | 'bank_transfer';
  transaction_id?: string;
  payment_proof_url?: string;
  payment_status?: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  verified_by?: number;
  verified_by_username?: string;
  verification_notes?: string;
}

// Admin types
export interface Admin {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

// API Response types (THIS WAS MISSING!)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}
// Contact types
export interface ContactInfo {
  id: number;
  contact_type: string;
  label: string;
  value: string;
  link: string | null;
  icon: string;
  order_position: number;
}

export interface SocialMedia {
  id: number;
  platform: string;
  platform_name: string;
  url: string;
  icon: string;
  color_class: string;
  is_active: boolean;
  order_position: number;
}

export interface RegionalOffice {
  id: number;
  country: string;
  email: string;
  phone: string;
  address: string | null;
  is_active: boolean;
  order_position: number;
}
// Settings types
export interface SiteSettings {
  site_name: string;
  hero_heading: string;
  hero_description: string;
  hero_video_url: string;
  mission_statement: string;
  vision_statement: string;
  office_hours: string;
  response_time: string;
}

export interface PageContent {
  [key: string]: string;
}

export interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon: string;
  order_position: number;
}

export interface TeamRole {
  id: number;
  role_title: string;
  responsibilities: string;
  order_position: number;
}

// Team Member types
export interface Founder {
  id: number;
  name: string;
  title: string;
  bio: string;
  image_url: string | null;
  image_public_id: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  role_type: 'executive' | 'board' | 'volunteer' | 'advisor';
  bio: string | null;
  image_url: string | null;
  image_public_id: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  country: string | null;
  order_position: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}