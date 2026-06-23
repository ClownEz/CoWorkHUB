export type Role = 'guest' | 'resident' | 'manager' | 'admin'

export type SpaceType = 'meeting_room' | 'hot_desk' | 'office'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface User {
  id: number
  email: string
  role: Role
  is_active: boolean
  created_at: string
}

export interface Space {
  id: number
  name: string
  type: SpaceType
  capacity: number
  price_per_hour: number
  description: string
  is_active: boolean
  amenities: Amenity[]
  images: SpaceImage[]
}

export interface Amenity {
  id: number
  name: string
}

export interface SpaceImage {
  id: number
  space_id: number
  url: string
  order: number
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
  created_at: string
}

export interface Payment {
  id: number
  booking_id: number
  amount: number
  status: PaymentStatus
  provider_payment_id: string
  created_at: string
}

export interface Review {
  id: number
  booking_id: number
  user_id: number
  space_id: number
  rating: number
  comment: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateBookingRequest {
  space_id: number
  start_time: string
  end_time: string
}

export interface ApiError {
  detail: string
}
