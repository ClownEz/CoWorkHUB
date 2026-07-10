export type Role = 'guest' | 'resident' | 'manager' | 'admin'

export type SpaceType = 'meeting_room' | 'hot_desk' | 'office'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface User {
  id: number
  email: string
  full_name: string
  role: Role
  phone: string | null
  avatar: string | null
  is_active: boolean
  created_at: string
}

export interface Space {
  id: number
  name: string
  type: SpaceType
  capacity: number
  price_per_hour: number
  description: string | null
  address: string | null
  is_active: boolean
  owner_id: number | null
  owner_name: string | null
  amenities: Amenity[]
  images: SpaceImage[]
  created_at: string
  updated_at: string
}

export interface Amenity {
  id: number
  name: string
  icon: string | null
}

export interface SpaceImage {
  id: number
  url: string
  position: number
}

export interface Booking {
  id: number
  user_id: number
  space_id: number
  space?: Space
  start_time: string
  end_time: string
  status: BookingStatus
  total_price: number
  promo_code: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  booking_id: number
  amount: number
  status: PaymentStatus
  provider: string | null
  client_secret: string | null
  created_at: string
}

export interface Review {
  id: number
  booking_id: number
  user_id: number
  space_id: number
  rating: number
  comment: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateBookingRequest {
  space_id: number
  start_time: string
  end_time: string
  promo_code?: string
}

export interface ApiError {
  detail: string
}
