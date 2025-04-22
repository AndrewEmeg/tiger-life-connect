export interface User {
  id: string;
  full_name: string;
  email: string;
  profile_image?: string;
  joined_at: string;
  is_admin: boolean;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  seller_id: string;
  created_at: string;
  is_active: boolean;
  seller?: User;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  provider_id: string;
  created_at: string;
  is_active: boolean;
  provider?: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_datetime: string;
  location: string;
  organizer_id: string;
  is_approved: boolean;
  created_at: string;
  organizer?: User;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  sender?: User;
  receiver?: User;
}

export interface Order {
  id: string;
  buyer_id: string;
  item_type: 'product' | 'service';
  item_id: string;
  seller_id: string;
  price: number;
  status: 'processing' | 'completed' | 'cancelled';
  created_at: string;
  buyer?: User;
  seller?: User;
  item?: Product | Service;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  owner?: User;
}

export interface UserOrganization {
  user_id: string;
  organization_id: string;
  role: 'member' | 'admin';
  user?: User;
  organization?: Organization;
}
