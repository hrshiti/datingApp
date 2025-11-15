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
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 sm:py-3 border-2 rounded-xl sm:rounded-2xl text-sm sm:text-base text-left flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500 focus:border-red-600'
            : isOpen
            ? 'border-[#FF1744] bg-white'
            : 'border-[#FFB3BA] hover:border-[#FF1744]'
        } bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF1744] focus:ring-opacity-20`}
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

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="dropdown-menu"
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
            className="absolute z-50 w-full mt-1 bg-white border-2 border-[#FFB3BA] rounded-xl sm:rounded-2xl shadow-lg max-h-60 overflow-hidden"
          >
            <div className="overflow-y-auto max-h-60">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: {
                      delay: index * 0.02,
                      duration: 0.15
                    }
                  }}
                  whileHover={{ backgroundColor: value === option.value ? '#D32F2F' : '#FFF0F0' }}
                  className={`w-full px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base transition-colors ${
                    value === option.value
                      ? 'bg-[#FF1744] text-white'
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
    </div>
  );
}

