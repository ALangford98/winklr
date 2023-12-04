import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLink = ({ to, label }) => (
  <Link to={to} className='lnk'>
    {label}
  </Link>
);

const navbarLinksOptions = [
  { value: 'Home', label: 'Home', component: <NavbarLink to="/" label="Home" /> },
  { value: 'Help', label: 'Help', component: <NavbarLink to="/Help" label="Help" /> },
  { value: 'Cart', label: 'Cart', component: <NavbarLink to="/Cart" label="Cart" /> },
];

const NavbarLinks = ({ selectedOption }) => {
  const selectedComponent = navbarLinksOptions.find((option) => option.value === selectedOption)?.component;

  return <>{selectedComponent}</>;
};

export { NavbarLinks, navbarLinksOptions };
