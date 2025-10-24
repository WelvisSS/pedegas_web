/**
 * User type constants
 * Following Clean Code principles - avoid magic strings
 */

export const USER_TYPES = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company',
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [USER_TYPES.INDIVIDUAL]: 'Pessoa Física',
  [USER_TYPES.COMPANY]: 'Pessoa Jurídica',
};

export const getUserTypeLabel = (userType: UserType): string => {
  return USER_TYPE_LABELS[userType] || 'Tipo desconhecido';
};
