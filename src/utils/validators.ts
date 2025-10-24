/**
 * Validation utilities
 * Following Clean Code principles
 */

export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'E-mail é obrigatório';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Formato de e-mail inválido';
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Senha é obrigatória';
  }

  if (password.length < 6) {
    return 'Senha deve ter pelo menos 6 caracteres';
  }

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Confirmação de senha é obrigatória';
  }

  if (password !== confirmPassword) {
    return 'Senhas não coincidem';
  }

  return null;
};

export const validateName = (name: string, fieldName = 'Nome'): string | null => {
  if (!name || !name.trim()) {
    return `${fieldName} é obrigatório`;
  }

  if (name.trim().length < 2) {
    return `${fieldName} deve ter pelo menos 2 caracteres`;
  }

  return null;
};

export const validateCnpj = (cnpj: string): string | null => {
  if (!cnpj || !cnpj.trim()) {
    return 'CNPJ é obrigatório';
  }

  const cnpjNumbers = cnpj.replace(/\D/g, '');

  if (cnpjNumbers.length !== 14) {
    return 'CNPJ deve ter 14 dígitos';
  }

  // Basic CNPJ validation algorithm
  if (isInvalidCnpjSequence(cnpjNumbers)) {
    return 'CNPJ inválido';
  }

  if (!isValidCnpjChecksum(cnpjNumbers)) {
    return 'CNPJ inválido';
  }

  return null;
};

export const formatCnpj = (cnpj: string): string => {
  const numbers = cnpj.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Phone is optional

  const phoneNumbers = phone.replace(/\D/g, '');

  if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
    return 'Telefone deve ter 10 ou 11 dígitos';
  }

  return null;
};

export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

// Helper functions for CNPJ validation
const isInvalidCnpjSequence = (cnpj: string): boolean => {
  const invalidSequences = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999',
  ];

  return invalidSequences.includes(cnpj);
};

const isValidCnpjChecksum = (cnpj: string): boolean => {
  // First check digit
  let sum = 0;
  let weight = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  let checkDigit1 = sum % 11;
  checkDigit1 = checkDigit1 < 2 ? 0 : 11 - checkDigit1;

  if (parseInt(cnpj[12]) !== checkDigit1) {
    return false;
  }

  // Second check digit
  sum = 0;
  weight = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  let checkDigit2 = sum % 11;
  checkDigit2 = checkDigit2 < 2 ? 0 : 11 - checkDigit2;

  return parseInt(cnpj[13]) === checkDigit2;
};
