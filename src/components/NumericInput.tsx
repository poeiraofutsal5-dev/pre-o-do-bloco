import React, { useState, useEffect } from 'react';
import { formatInputValue, parseInputValue } from '../utils/format';

interface NumericInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  ariaLabel?: string;
  isInteger?: boolean;
  min?: number;
  className?: string;
  inputClassName?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0',
  ariaLabel,
  isInteger = false,
  min = 0,
  className = '',
  inputClassName = '',
}) => {
  const [text, setText] = useState<string>(() => formatInputValue(value));

  // Sync internal text when external value changes
  useEffect(() => {
    const formatted = formatInputValue(value);
    setText(formatted);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty
    if (raw === '') {
      setText('');
      onChange(null);
      return;
    }

    // Accept valid numeric pattern (optional leading digits, single comma or dot, trailing decimals)
    if (isInteger) {
      if (!/^\d*$/.test(raw)) return;
    } else {
      if (!/^\d*(?:[.,]\d*)?$/.test(raw)) return;
    }

    setText(raw);
    const parsed = parseInputValue(raw);
    if (parsed !== null && parsed >= min) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // Clean up on blur
    const parsed = parseInputValue(text);
    if (parsed === null) {
      setText('');
      onChange(null);
    } else if (parsed < min) {
      setText(formatInputValue(min));
      onChange(min);
    } else {
      setText(formatInputValue(parsed));
      onChange(parsed);
    }
  };

  return (
    <div
      className={`border border-[#dfe8e1] rounded-[9px] flex items-center bg-white min-h-[40px] px-2.5 transition-all focus-within:border-[#20a67a] focus-within:ring-2 focus-within:ring-[#10b981]/20 ${className}`}
    >
      {prefix && (
        <span className="text-[11px] font-semibold text-[#88a094] pr-1.5 select-none whitespace-nowrap">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode={isInteger ? 'numeric' : 'decimal'}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        autoComplete="off"
        className={`w-full border-0 bg-transparent py-2 px-1 text-[13px] font-bold text-[#26483b] outline-none placeholder:text-[#bac8be] placeholder:font-normal min-w-0 ${inputClassName}`}
      />
      {suffix && (
        <span className="text-[11px] font-semibold text-[#88a094] pl-1.5 select-none whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  );
};
