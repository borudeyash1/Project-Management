import React from 'react';
import './CustomSelect.css';

// Custom dropdown component with theme support

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  isDarkMode?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'All',
  isDarkMode = false
}) => {
  // Create data attributes for each option
  const dataAttributes: Record<string, string> = {
    'data-default': placeholder
  };
  
  options.forEach((opt, index) => {
    dataAttributes[`data-option-${index}`] = opt.label;
  });

  return (
    <div className={`custom-select ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="selected" {...dataAttributes}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 512 512"
          className="arrow"
        >
          <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
        </svg>
      </div>
      <div className="options">
        {options.map((option, index) => (
          <div key={option.value} title={option.label}>
            <input
              id={`option-${index}-${option.value}`}
              name={`select-${Math.random()}`}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <label
              className="option"
              htmlFor={`option-${index}-${option.value}`}
              data-txt={option.label}
            ></label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
