"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const InlineEdit = ({ value, onSave, className, disabled }: InlineEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (currentValue.trim() === "") {
        setCurrentValue(value); // revert if empty
        return;
    }
    onSave(currentValue);
    if(value === '') {
      setCurrentValue('');
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
            "w-full border rounded-lg p-2 select-none text-sm",
            className,
        )}
      />
    );
  }

  return (
    <div onClick={handleClick} className={cn(
        "cursor-pointer p-2 border border-transparent w-full text-sm",
        className
    )}>
      {currentValue || "..."}
    </div>
  );
};
