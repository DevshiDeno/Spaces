export type ID = string;

export type UserRole = 'guest' | 'user' | 'space_owner' | 'admin';

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isSpaceOwner?: boolean;
  createdAt: string;
}

export type VenueType = string;
export type Mood = 'Intimate' | 'Energetic' | 'Relaxed' | 'Creative';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';
export type NoiseLevel = 'Quiet' | 'Moderate' | 'Loud';

export interface Venue {
  id: ID;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  type: VenueType;
  city: string;
  address: string;
  capacity: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  images: string[];
  coverImage: string;
  amenities: string[];
  moods: Mood[];
  bestFor: string[];
  noiseLevel: NoiseLevel;
  timeOfDay: TimeOfDay[];
  isVerified: boolean;
  bookingFee: number;
  ownerId: ID;
  createdAt: string;
}

export interface VenueFilters {
  query?: string;
  city?: string;
  type?: VenueType;
  mood?: Mood;
  timeOfDay?: TimeOfDay;
  capacityMin?: number;
  capacityMax?: number;
  priceMin?: number;
  priceMax?: number;
}

export type EventCategory =
  | 'Community & Safe Space Events'
  | 'Creative & Culture Events'
  | 'Performance & Entertainment'
  | 'Food & Drink Experiences'
  | 'Life & Milestone Events'
  | 'Social & Private Celebrations'
  | 'Work, Learning & Professional'
  | 'Intimate & Experiential Gatherings'
  | 'Content & Media Creation';

export interface AppEvent {
  id: ID;
  slug: string;
  title: string;
  category: EventCategory;
  description: string;
  startDate: string;
  endDate: string;
  city: string;
  venueId?: ID;
  venueName?: string;
  pricePerTicket: number;
  ticketsAvailable: number;
  ticketsSold: number;
  coverImage: string;
  isFeatured?: boolean;
  organizer: string;
}

export type PaymentMethod = 'mpesa' | 'card';

export interface Booking {
  id: ID;
  venueId: ID;
  venueName: string;
  userId: ID;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: PaymentMethod;
  specialRequests?: string;
  createdAt: string;
}

export interface AllyApplication {
  id: ID;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  venueType: string;
  description: string;
  motivation: string;
  inclusivityPlan: string;
  experience?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ContactMessage {
  id: ID;
  name: string;
  email: string;
  subject: string;
  message: string;
  isVenueInquiry: boolean;
  submittedAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalFiles: number;
  pendingApplications: number;
  pendingSpaces: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
