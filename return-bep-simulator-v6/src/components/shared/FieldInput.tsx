import { useRef, useState, useEffect } from 'react';
import Tooltip from './Tooltip';

interface Props {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  tooltip?: { title: string; body: string; analogy?: string };
}

export default function FieldInput({ label, unit, value, onChange, step = 1, min, max, disabled, tooltip }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalValue(String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };

  const clamp = (v: number) => {
    let clamped = v;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  const handleBlur = () => {
    const num = parseFloat(localValue);
    if (isNaN(num)) {
      const fallback = min !== undefined ? min : 0;
      onChange(fallback);
      setLocalValue(String(fallback));
    } else {
      const clamped = clamp(num);
      onChange(clamped);
      setLocalValue(String(clamped));
    }
  };

  const labelContent = tooltip ? (
    <Tooltip title={tooltip.title} body={tooltip.body} analogy={tooltip.analogy}>
      {label}
    </Tooltip>
  ) : label;

  return (
    <div className="mb-2">
      <label className="flex justify-between items-center text-xs text-text-secondary mb-0.5">
        <span>{labelContent}</span>
        {unit && <span className="text-[11px] text-text-faint">{unit}</span>}
      </label>
      <input
        ref={inputRef}
        type="number"
        value={localValue}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full py-[7px] px-[10px] border border-border rounded-md text-[13px] outline-none bg-white transition-colors focus:border-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] disabled:bg-border-light disabled:text-text-faint disabled:cursor-not-allowed"
      />
    </div>
  );
}
