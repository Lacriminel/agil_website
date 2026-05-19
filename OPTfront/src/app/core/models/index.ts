export type UserRole = 'ADMIN' | 'CUSTOMER';
export type GasType = 'GASOIL' | 'GASOIL_SSP' | 'GASOIL_SSF';
export type TruckStatus = 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface GovernorateGroup {
  id: number;
  name: string;
  governorates?: Governorate[];
}

export interface Governorate {
  id: number;
  name: string;
  governorateGroupId: number;
  governorateGroup?: GovernorateGroup;
}

export interface Place {
  id: number;
  name: string;
  governorateId: number;
  customerId: number | null;
  governorate?: Governorate;
}

export interface Customer {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  placeId: number;
  user?: AuthUser;
  place?: Place;
}

export interface Compartment {
  id: number;
  truckId: number;
  position: number;
  capacity: number;
  gasType: GasType | null;
  isAvailable: boolean;
  truck?: Truck;
}

export interface Truck {
  id: number;
  name: string;
  governorateGroupId: number;
  status: TruckStatus;
  totalCapacity: number;
  createdAt: string;
  governorateGroup?: GovernorateGroup;
  compartments?: Compartment[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  compartmentId: number;
  gasType: GasType;
  quantity: number;
  compartment?: Compartment;
}

export interface Order {
  id: number;
  customerId: number;
  status: OrderStatus;
  totalQuantity: number;
  createdAt: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface CartItem {
  compartment: Compartment;
  truck: Truck;
  gasType: GasType;
}


