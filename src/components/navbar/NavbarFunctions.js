import React from 'react';

const SearchBar = () => (
  <input type="text" placeholder="Search" />
);

const DropdownMenu = ({ selectedOption }) => (
  <select>
    <option value="Option 1" selected={selectedOption === 'Option 1'}>Option 1</option>
    <option value="Option 2" selected={selectedOption === 'Option 2'}>Option 2</option>
    <option value="Option 3" selected={selectedOption === 'Option 3'}>Option 3</option>
    {/* Add more options as needed */}
  </select>
);

const navbarFunctionsOptions = [
  { value: 'Search', label: 'Search Bar', component: <SearchBar /> },
  { value: 'Dropdown', label: 'Dropdown Menu', component: <DropdownMenu /> },
  // Add more options as needed
];

const NavbarFunctions = ({ selectedOption }) => {
  const selectedComponent = navbarFunctionsOptions.find((option) => option.value === selectedOption)?.component;

  return <>{selectedComponent}</>;
};

export { NavbarFunctions, navbarFunctionsOptions };
