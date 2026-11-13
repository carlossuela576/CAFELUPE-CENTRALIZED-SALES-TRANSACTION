/**
 * Cafe Lupe Centralized Sales Report and Transaction Gateway System
 * Data Models & Schemas
 */

export type UserRole = 'staff' | 'admin' | 'accountant' | 'owner';
export type UserApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  outletId: string | null; // null for admin/accountant/owner or multi-outlet
  outletName?: string;
  approvalStatus: UserApprovalStatus;
  createdAt: string;
}

export type TransactionStatus = 'pending' | 'paid' | 'void';
export type PaymentArrangement = 'Full Payment' | 'Down Payment' | 'Contract Payment';
export type PaymentChannel = 'Cash' | 'QRPh';

export type OutletSlug =
  | 'pickleball'
  | 'hostel'
  | 'gym'
  | 'pool'
  | 'ktv'
  | 'fnb'
  | 'billiards'
  | 'tabletennis'
  | 'parking'
  | 'events'
  | 'custom';

export interface Outlet {
  id: string;
  slug: OutletSlug;
  name: string;
  description: string;
  template?: string | null;
  isActive: boolean;
  category: 'sports' | 'hospitality' | 'entertainment' | 'dining' | 'general';
}

export interface ServicePreset {
  id: string;
  outletId: string;
  name: string;
  defaultPrice: number;
  category?: string; // e.g. for F&B menu categorization
  presetFields: Record<string, any>;
  isActive: boolean;
}

// Master Unified Transaction Record (R1, NFR7-NFR9)
export interface MasterTransaction {
  transactionID: string;
  outletName: string;
  outletSlug: OutletSlug;
  outletService: string;
  customerName: string;
  employeeHandler: string;
  employeeId: string;
  transactionAmount: number;
  discount: number;
  totalAmount: number;
  transactionStatus: TransactionStatus;
  transactionDateTime: string;
  paymentArrangement: PaymentArrangement;
  paymentChannel: PaymentChannel;
  
  // Relational pointers
  outletRefTable: string;
  outletRefId: string;
  
  // QR Ph & Payment validation
  qrToken?: string | null;
  paidAt?: string | null;
  
  // Concurrency & Lockout (NFR4-NFR6)
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
  version: number;
}

// 1. Pickleball
export interface PickleballTransaction {
  pickleballID: string;
  transactionId: string;
  court: 'Al Fresco (Ground Floor)' | 'Indoor (2nd Floor)';
  pax: number;
  hours: number;
  paddleRent: number; // count
  ballRent: number;   // count
}

// 2. Hostel
export interface HostelTransaction {
  hostelID: string;
  transactionId: string;
  roomType: 'Small Room' | 'Suite Room';
  bookingSource: 'Walk-in' | 'Agoda' | 'Traveloka';
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
}

// 3. Gym
export interface GymTransaction {
  gymID: string;
  transactionId: string;
  age: number;
  membershipStart: string;
  membershipType: 'Member' | 'Non-member' | 'Self Training' | 'Student' | 'Regular Routine Muay Thai' | 'Other';
  plan: 'Monthly' | 'Walk-in' | 'Student Discount' | '1-Month Unlimited' | '12-to-15-Day Bundle' | 'Free First Trial';
  trainerProgram: 'Professional Boxing' | 'Martial Arts' | 'Muay Thai' | 'General Fitness' | 'None';
}

// 4. Swimming Pool
export interface PoolTransaction {
  poolID: string;
  transactionId: string;
  adults: number;
  children: number;
  isHostelGuest: boolean;
  visitDay: string;
}

// 5. KTV Video Rooms
export interface KtvTransaction {
  ktvID: string;
  transactionId: string;
  room: 'Small Room A (up to 10 pax)' | 'Small Room B (up to 10 pax)' | 'Large Room (20 to 25+ pax)';
  pax: number;
  package: string;
}

// 6. Food & Beverage / POS
export interface PosOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface FnbTransaction {
  fnbID: string;
  transactionId: string;
  auditedTo: 'Walk-in Client' | 'Function Guest' | 'KTV Room User';
  orderItems: PosOrderItem[];
  receiptPrintedAt?: string | null;
  tableOrRoomNo?: string;
}

// 7. Billiards
export interface BilliardsTransaction {
  billiardsID: string;
  transactionId: string;
  tableNo: 'Table 1' | 'Table 2';
  hours: number;
}

// 8. Table Tennis
export interface TableTennisTransaction {
  tabletennisID: string;
  transactionId: string;
  tableNo: 'Table 1' | 'Table 2' | 'Table 3';
  hours: number;
}

// 9. Parking Lot
export interface ParkingTransaction {
  parkingID: string;
  transactionId: string;
  plateNumber: string;
  vehicleType: 'Car / SUV' | 'Motorcycle' | 'Van' | 'Bicycle / Free';
  parkingType: 'Day' | 'Night' | 'Overnight';
  isCheckedInGuest: boolean;
}

// 10. Events & Location Rentals
export interface EventsTransaction {
  eventsID: string;
  transactionId: string;
  eventType: 'Pre-Christmas Party' | 'Corporate Event' | 'Concert' | 'TV Show Location' | 'Indie Film Shoot' | 'Commercial Shoot' | 'Private Birthday/Celebration';
  eventDate: string;
  headcount: number;
  spaceReserved: string;
}

// Generic Template for Dynamic Outlets (FR88)
export interface GenericTransaction {
  genericID: string;
  transactionId: string;
  notes: string;
  customDetails: Record<string, any>;
}

// Workflows & Audit
export interface VoidRequest {
  id: string;
  transactionId: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  outletName: string;
  amount: number;
  reason: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface EditRequest {
  id: string;
  transactionId: string;
  requestedBy: string;
  requestedByName: string;
  changes: {
    transactionStatus?: TransactionStatus;
    transactionAmount?: number;
    discount?: number;
    totalAmount?: number;
    notes?: string;
  };
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface CashConfirmation {
  id: string;
  transactionId: string;
  outletName: string;
  customerName: string;
  amount: number;
  status: 'pending_audit' | 'confirmed';
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}
