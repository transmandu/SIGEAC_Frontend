'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export const MultiInputField = ({
  values,
  onChange,
  placeholder = "",
  label = ""
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
}) => {
  const [inputValue, setInputValue] = useState('');

  const addValue = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className='flex gap-2 w-full'>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())} className='w-[300px]'
        />
        <Button type="button" onClick={addValue}>
          Agregar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            <span>{value}</span>
            <button
              type="button"
              onClick={() => removeValue(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
