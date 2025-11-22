// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  country: string;
  beneficiaries_count: number;
  budget: number;
  status: 'active' | 'completed' | 'deleted';
  image_url: string;
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

// Donation types
export interface Donation {
  id: number;
  donor_name: string;
  email: string;
  amount: number;
  project_id: number;
  country: string;
  status: string;
  donation_date: string;
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
// Countries list (8 countries Y4C operates in)
export const COUNTRIES = [
  'Ghana',
  'Kenya',
  'Nigeria',
  'South Africa',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Cameroon',
] as const;

export type Country = typeof COUNTRIES[number];