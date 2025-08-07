import React, { useState } from 'react';

type Option = {
    label: string;
    value: string;
};

type DropdownProps = {
    options: Option[];
    onSelect: (value: string) => void;
    placeholder?: string;
};

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, placeholder }) => {
    const [selected, setSelected] = useState<string | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelected(value);
        onSelect(value);
    };

    return (
        <select value={selected || ''} onChange={handleChange}>
            <option value="" disabled>
                {placeholder || 'Select an option'}
            </option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default Dropdown;
