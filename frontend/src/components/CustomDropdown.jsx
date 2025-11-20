import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option',
  error = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Calculate dropdown position when opening - check if should be above or below
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 240; // max-h-60 = 240px
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // If not enough space below but enough space above, position above
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition({
            top: rect.top - dropdownHeight - 4, // 4px gap above button
            left: rect.left,
            width: rect.width
          });
        } else {
          // Default: position below the button
          setDropdownPosition({
            top: rect.bottom + 4, // 4px gap below button
            left: rect.left,
            width: rect.width
          });
        }
      }
    };

    updatePosition();

    // Update position on scroll or resize to keep it aligned
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <>
      <div className={`relative ${className}`} ref={buttonRef} style={{ zIndex: isOpen ? 99999 : 1 }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        className={`w-full px-4 md:px-3 py-2.5 sm:py-3 md:py-2 border-2 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-sm text-left flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500 focus:border-red-600'
            : isOpen
            ? 'border-[#FF91A4] bg-white'
            : 'border-[#FFB6C1] hover:border-[#FF91A4]'
        } bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20`}
      >
        <span className={value ? 'text-[#212121]' : 'text-[#757575]'}>
          {selectedLabel}
        </span>
        <div
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          className="transition-transform duration-200"
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[#757575]" />
        </div>
        </button>
      </div>

        {isOpen && (
        <div
            ref={dropdownRef}
            className="fixed bg-white border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl shadow-2xl max-h-60 overflow-hidden"
            style={{ 
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 999999
            }}
          >
            <div className="overflow-y-auto max-h-60">
            {options.map((option) => (
              <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    e.target.style.backgroundColor = '#FFF0F5';
                    }
                  }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.target.style.backgroundColor = '';
                  }
                }}
                className={`w-full px-4 md:px-3 py-2.5 sm:py-3 md:py-2 text-left text-sm sm:text-base md:text-sm transition-colors ${
                    value === option.value
                      ? 'bg-[#FF91A4] text-white'
                      : 'text-[#212121]'
                  } ${
                    option.value === options[0]?.value ? 'rounded-t-xl sm:rounded-t-2xl' : ''
                  } ${
                    option.value === options[options.length - 1]?.value ? 'rounded-b-xl sm:rounded-b-2xl' : ''
                  }`}
                >
                  {option.label}
              </button>
              ))}
            </div>
        </div>
        )}
    </>
  );
}

