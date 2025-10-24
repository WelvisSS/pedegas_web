import { USER_TYPES, USER_TYPE_LABELS } from '../../../constants/userTypes';
import type { UserType } from '../../../constants/userTypes';

/**
 * User Type Toggle Component
 * Following Single Responsibility Principle
 */
interface UserTypeToggleProps {
  value: UserType;
  onChange: (userType: UserType) => void;
  className?: string;
}

const UserTypeToggle = ({ value, onChange, className = '' }: UserTypeToggleProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-secondary-700">Tipo de Conta</label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(USER_TYPES.INDIVIDUAL)}
          className={`
            px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200
            ${
              value === USER_TYPES.INDIVIDUAL
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
            }
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{USER_TYPE_LABELS[USER_TYPES.INDIVIDUAL]}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange(USER_TYPES.COMPANY)}
          className={`
            px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200
            ${
              value === USER_TYPES.COMPANY
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
            }
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{USER_TYPE_LABELS[USER_TYPES.COMPANY]}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserTypeToggle;
