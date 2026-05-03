import React from 'react';
import EditableWidget from './EditableWidget';
import NavbarBrand from './NavbarBrand';

const SLOTS = [
  { key: 'left',        desktopOnly: false },
  { key: 'centerLeft',  desktopOnly: true  },
  { key: 'center',      desktopOnly: false },
  { key: 'centerRight', desktopOnly: true  },
  { key: 'right',       desktopOnly: false },
];

const Navbar = () => (
  <div className="Navbar">
    <NavbarBrand />
    <div className="navbar-slots">
      {SLOTS.map(({ key, desktopOnly }) => (
        <li
          key={key}
          className={`navbar-slot${desktopOnly ? ' navbar-slot--desktop' : ''}`}
        >
          <EditableWidget slot={key} desktopOnly={desktopOnly} />
        </li>
      ))}
    </div>
  </div>
);

export default Navbar;
