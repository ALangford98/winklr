import React from 'react';

const DropdownMenu = ({ options = [] }) => (
  <select className="navbar-dropdown">
    {options.length > 0
      ? options.map((opt) => <option key={opt} value={opt}>{opt}</option>)
      : <option disabled value="">No options configured</option>
    }
  </select>
);

export default DropdownMenu;
