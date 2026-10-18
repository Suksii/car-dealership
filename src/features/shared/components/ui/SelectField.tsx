"use client";

import { useState } from "react";
import { FieldWrap } from "./Field";
import Select, { type SelectOption } from "./Select";

interface SelectFieldProps {
  label: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
}

/** Custom select sa labelom; radi kontrolisano (value/onChange) ili nekontrolisano (defaultValue). */
export default function SelectField({ label, name, options, defaultValue = "", value, onChange, error, hint, required, className, ...rest }: SelectFieldProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const handle = (v: string) => { setInner(v); onChange?.(v); };
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={name} className={className} required={required}>
      <Select id={name} name={name} options={options} value={current} onChange={handle} required={required} invalid={!!error} {...rest} />
    </FieldWrap>
  );
}
