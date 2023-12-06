import React from 'react';

const DropdownMenu = ({ selectedOption }) => (
  <select>
    <option value="Option 1" selected={selectedOption === 'Option 1'}>Option 1</option>
    <option value="Option 2" selected={selectedOption === 'Option 2'}>Option 2</option>
    <option value="Option 3" selected={selectedOption === 'Option 3'}>Option 3</option>
    {/* Add more options as needed */}
  </select>
);

export default DropdownMenu;
