import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomDatePicker({ 
  value, 
  onChange, 
  maxDate,
  error = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
  const datePickerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  // Calculate calendar position when opening - always below button
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 768; // md breakpoint
        const calendarWidth = isDesktop ? 280 : rect.width; // Fixed width on desktop, full width on mobile
        // Center calendar on desktop, align left on mobile
        let left = isDesktop 
          ? rect.left + (rect.width / 2) - (calendarWidth / 2)
          : rect.left;
        // Ensure it doesn't go off screen
        const minLeft = 8; // 8px margin from left
        const maxLeft = window.innerWidth - calendarWidth - 8; // 8px margin from right
        left = Math.max(minLeft, Math.min(maxLeft, left));
        // Always position below the button, fixed to viewport
        setCalendarPosition({
          top: rect.bottom + 4, // 4px gap below button
          left: left,
          width: calendarWidth
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
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close year picker when date picker closes
  useEffect(() => {
    if (!isOpen) {
      setShowYearPicker(false);
    }
  }, [isOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Select date of birth';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Format date string manually to avoid timezone issues
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${monthStr}-${dayStr}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (maxDate) {
      const max = new Date(maxDate);
      return date > max;
    }
    return false;
  };

  const isDateSelected = (day) => {
    if (!value) return false;
    // Parse date string manually to avoid timezone issues
    const [year, month, dateDay] = value.split('-').map(Number);
    return (
      dateDay === day &&
      month - 1 === currentMonth.getMonth() && // month is 1-indexed in date string
      year === currentMonth.getFullYear()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const handleYearSelect = (year) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  // Generate list of years (from 18 years ago to 100 years ago)
  const getYearList = () => {
    const today = new Date();
    const maxYear = maxDate ? new Date(maxDate).getFullYear() : today.getFullYear() - 18;
    const minYear = today.getFullYear() - 100;
    const years = [];
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year);
    }
    return years;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        className={`w-full px-4 py-2.5 sm:py-3 pl-10 pr-3 border-2 rounded-xl text-sm text-left flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500 focus:border-red-600'
            : isOpen
            ? 'border-[#FF91A4] bg-white'
            : 'border-[#FFB6C1] hover:border-[#FF91A4]'
        } bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-opacity-20`}
      >
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-4 h-4 pointer-events-none" />
        <span className={value ? 'text-[#212121]' : 'text-[#757575]'}>
          {formatDate(value)}
        </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={datePickerRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bg-white border-2 border-[#FFB6C1] rounded-xl shadow-2xl p-3 md:p-2 w-full md:w-auto"
            style={{ 
              position: 'fixed',
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
              width: window.innerWidth >= 768 ? '280px' : `${calendarPosition.width}px`,
              maxWidth: 'calc(100vw - 16px)', // Prevent overflow on small screens
              zIndex: 99999
            }}
          >
            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between mb-3 md:mb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth('prev');
                }}
                className="p-1 md:p-0.5 hover:bg-[#FFF0F0] rounded transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5 md:w-4 md:h-4 text-[#757575]" />
              </button>
              <div className="flex items-center gap-2">
                {/* Month Selector */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowYearPicker(false);
                  }}
                  className="px-2 py-1 md:px-1.5 md:py-0.5 text-sm md:text-xs font-semibold text-[#212121] hover:bg-[#FFF0F0] rounded transition-colors"
                >
                  {monthNames[currentMonth.getMonth()]}
                </button>
                {/* Year Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowYearPicker(!showYearPicker);
                    }}
                    className="px-2 py-1 md:px-1.5 md:py-0.5 text-sm md:text-xs font-semibold text-[#FF91A4] hover:bg-[#FFE4E1] rounded transition-colors flex items-center gap-1"
                  >
                    {currentMonth.getFullYear()}
                    <ChevronRight 
                      className={`w-3 h-3 md:w-2.5 md:h-2.5 text-[#FF91A4] transition-transform ${showYearPicker ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  
                  {/* Year Picker Dropdown */}
                  <AnimatePresence>
                    {showYearPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 bg-white border-2 border-[#FFB6C1] rounded-xl shadow-2xl p-2 md:p-1.5 max-h-48 md:max-h-40 overflow-y-auto"
                        style={{ zIndex: 100000, width: '120px' }}
                      >
                        <div className="flex items-center justify-between mb-2 md:mb-1 px-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentYear = currentMonth.getFullYear();
                              const newYear = Math.max(currentYear - 10, getYearList()[getYearList().length - 1]);
                              handleYearSelect(newYear);
                            }}
                            className="p-1 md:p-0.5 hover:bg-[#FFF0F0] rounded transition-colors"
                            title="Previous 10 years"
                          >
                            <ChevronLeft className="w-4 h-4 md:w-3 md:h-3 text-[#757575]" />
                          </button>
                          <span className="text-xs md:text-[10px] font-medium text-[#757575]">Year</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentYear = currentMonth.getFullYear();
                              const maxYear = maxDate ? new Date(maxDate).getFullYear() : new Date().getFullYear() - 18;
                              const newYear = Math.min(currentYear + 10, maxYear);
                              handleYearSelect(newYear);
                            }}
                            className="p-1 md:p-0.5 hover:bg-[#FFF0F0] rounded transition-colors"
                            title="Next 10 years"
                          >
                            <ChevronRight className="w-4 h-4 md:w-3 md:h-3 text-[#757575]" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1 md:gap-0.5 max-h-40 md:max-h-32 overflow-y-auto">
                          {getYearList().map((year) => {
                            const isSelected = year === currentMonth.getFullYear();
                            const maxYear = maxDate ? new Date(maxDate).getFullYear() : new Date().getFullYear() - 18;
                            const isDisabled = year > maxYear;
                            return (
                              <button
                                key={year}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!isDisabled) handleYearSelect(year);
                                }}
                                disabled={isDisabled}
                                className={`px-2 py-1.5 md:px-1.5 md:py-1 text-xs md:text-[10px] rounded transition-all text-left ${
                                  isDisabled
                                    ? 'text-[#E0E0E0] cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-[#FF91A4] text-white font-semibold'
                                    : 'text-[#212121] hover:bg-[#FFF0F0]'
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth('next');
                }}
                className="p-1 md:p-0.5 hover:bg-[#FFF0F0] rounded transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5 md:w-4 md:h-4 text-[#757575]" />
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 md:gap-0.5 mb-2 md:mb-1">
              {weekDays.map(day => (
                <div key={day} className="text-xs md:text-[10px] text-center text-[#757575] font-medium py-1 md:py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 md:gap-0.5">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                const disabled = isDateDisabled(day);
                const selected = isDateSelected(day);
                // Create unique key using month, year, and day
                const uniqueKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}-${index}`;
                return (
                  <button
                    key={uniqueKey}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!disabled) handleDateSelect(day);
                    }}
                    disabled={disabled}
                    className={`aspect-square text-sm md:text-xs rounded transition-all ${
                      disabled
                        ? 'text-[#E0E0E0] cursor-not-allowed'
                        : selected
                        ? 'bg-[#FF91A4] text-white'
                        : 'text-[#212121] hover:bg-[#FFF0F0]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

