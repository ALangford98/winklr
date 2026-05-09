import React, { useContext, useState } from 'react';
import { AppContext } from '../../appContext';

const DropdownMenu = ({ options = [] }) => {
  const { setHelpOpen, setCartOpen, setSearchQuery } = useContext(AppContext);
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    const selected = e.target.value;
    setValue('');
    if (selected === 'Help') { setHelpOpen(true); return; }
    if (selected === 'Cart') { setCartOpen(true); return; }
    setSearchQuery(selected);
  };

  if (!options.length) return null;

  return (
    <select className="navbar-dropdown" value={value} onChange={handleChange}>
      <option value="" disabled>Menu</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
};

export default DropdownMenu;
