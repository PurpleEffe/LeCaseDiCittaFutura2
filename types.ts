
export enum Role {
  GUEST = 'guest',
  MANAGER = 'manager',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // For auth handling
  role: Role;
}

export type Amenity = "cucina" | "wi-fi" | "accessibile" | "aria-condizionata" | "parcheggio" | "vista-mare";

export interface House {
  id: string;
  title: string;
  summary: string;
  description: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  amenities: Amenity[];
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  active: boolean;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
}

export interface Booking {
  id: string;
  houseId: string;
  houseTitle: string;
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  guests: number;
  requester: {
    name: string;
    email: string;
    userId: string | null;
  };
  notes: string;
  status: BookingStatus;
}

export interface Holiday {
  id: string;
  houseId: string;
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
}
