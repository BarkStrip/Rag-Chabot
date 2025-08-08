import React, { useState, useEffect } from 'react';

type Option = {
    label: string;
    value: string;
};

type DropdownProps = {
    options: Option[];
    value: string; // <- comes from parent
    onSelect: (value: string) => void;
};

const Dropdown: React.FC<DropdownProps> = ({ options, value, onSelect }) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        onSelect(event.target.value);
    };

    return (
        <select
            value={value}
            onChange={handleChange}
            className="text-xl text-gray-400 dark:text-gray-400 bg-gray-800 hover:text-gray-500 focus:outline-none focus:ring-0 px-0"
        >
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                    className="text-xl font-bold text-gray-400 dark:text-gray-400"
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default Dropdown;
