'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ChartDropdownProps {
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
}

const ChartDropdown: React.FC<ChartDropdownProps> = ({
  options,
  selectedOptions,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: string) => {
    if (option === 'All') {
      if (selectedOptions.length === options.length) {
        onChange([]);
      } else {
        onChange(options);
      }
    } else if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter(o => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const getButtonText = () => {
    if (selectedOptions.length === options.length) {
      return 'All Charts';
    } else if (selectedOptions.length === 0) {
      return 'Select Charts';
    } else {
      const joinedOptions = selectedOptions.join(', ');
      const lastComma = joinedOptions.lastIndexOf(', ');
      if (lastComma === -1) {
        return `${joinedOptions} Chart`;
      }
      return `${joinedOptions.slice(0, lastComma)} &${joinedOptions.slice(lastComma + 1)} Charts`;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{getButtonText()}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          key="All"
          checked={selectedOptions.length === options.length}
          onCheckedChange={() => handleSelect('All')}
        >
          All
        </DropdownMenuCheckboxItem>
        {options.map(option => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selectedOptions.includes(option)}
            onCheckedChange={() => handleSelect(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChartDropdown;
