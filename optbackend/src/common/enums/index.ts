export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export enum GasType {
  GASOIL = 'GASOIL',
  GASOIL_SSP = 'GASOIL_SSP',
  GASOIL_SSF = 'GASOIL_SSF',
}

export enum TruckStatus {
  AVAILABLE = 'AVAILABLE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
}

export const COMBOS: Record<string, number[]> = {
  A: [7, 7, 5, 4, 6, 3],
  B: [6, 6, 6, 5, 5, 4],
  C: [7, 6, 4, 4, 3, 2, 5],
  D: [7, 7, 5, 4, 4, 3, 2],
  E: [7, 7, 6, 4, 3, 3, 2],
};
