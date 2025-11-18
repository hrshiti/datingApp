import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Calculate dropdown position when opening - always below button
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        // Always position below the button, fixed to viewport
        setDropdownPosition({
          top: rect.bottom + 4, // 4px gap below button
          left: rect.left,
          width: rect.width
        });
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
        className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-xl sm:rounded-2xl text-sm sm:text-base text-left flex items-center justify-between transition-colors ${
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
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#757575]" />
        </motion.div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="dropdown-menu"
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -10, 
              scale: 0.95,
              transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            className="fixed bg-white border-2 border-[#FFB6C1] rounded-xl sm:rounded-2xl shadow-2xl max-h-60 overflow-hidden"
            style={{ 
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 99999
            }}
          >
            <div className="overflow-y-auto max-h-60">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: {
                      delay: index * 0.02,
                      duration: 0.15
                    }
                  }}
                  whileHover={{ backgroundColor: value === option.value ? '#FF69B4' : '#FFF0F5' }}
                  className={`w-full px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base transition-colors ${
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
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

