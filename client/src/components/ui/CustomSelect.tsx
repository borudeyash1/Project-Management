import React, { useState } from 'react';
import DropdownTransition from '../animations/DropdownTransition';

interface SelectOption {
  id: string;
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Select' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className="custom-select relative w-fit cursor-pointer"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Selected Display */}
      <div className="selected flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm min-w-[150px]">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 512 512"
          className={`arrow w-4 h-4 fill-gray-700 dark:fill-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        >
          <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
        </svg>
      </div>

      {/* Options Dropdown */}
      <DropdownTransition
        isOpen={isOpen}
        className="options absolute left-0 right-0 mt-1 flex flex-col gap-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
      >
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.value)}
            className={`option text-left px-4 py-2 rounded-md text-sm transition-colors ${value === option.value
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {option.label}
          </button>
        ))}
      </DropdownTransition>
    </div>
  );
};

export default CustomSelect;
