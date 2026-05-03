import React from 'react';
import EditableWidget from './EditableWidget';
import NavbarBrand from './NavbarBrand';

const SLOTS = [
  { key: 'left',        className: 'LeftWidget'        },
  { key: 'centerLeft',  className: 'CenterLeftWidget'  },
  { key: 'center',      className: 'CenterWidget'      },
  { key: 'centerRight', className: 'CenterRightWidget' },
  { key: 'right',       className: 'RightWidget'       },
];

const Navbar = () => (
  <div className="Navbar">
    <NavbarBrand />
    <div className="navbar-slots">
      {SLOTS.map(({ key, className }) => (
        <li key={key} className={className}>
          <EditableWidget slot={key} />
        </li>
      ))}
    </div>
  </div>
);

export default Navbar;
