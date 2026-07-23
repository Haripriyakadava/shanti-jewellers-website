export interface User {
  id: string;
  userCode?: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image?: string;
  dob?: string;
  anniversary?: string;
  spouse_name?: string;
  spouse_dob?: string;
  pan_number?: string;
  marital_status?: 'Single' | 'Married';
  created_at: string;
  role?: string;
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  date: string;
  amount: number;
  payment_status: 'Paid' | 'Pending' | 'Failed';
  order_status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
}

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  wishlist_items: number;
  saved_addresses: number;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'created_at'> & { password: string }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}
