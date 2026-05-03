import React, { useContext } from 'react';
import { AppContext } from '../appContext';
import { renderWidget } from '../navbar/widgetRegistry';
import NavbarBrand from '../navbar/NavbarBrand';

const SLOTS = [
  { key: 'left',        desktopOnly: false },
  { key: 'centerLeft',  desktopOnly: true  },
  { key: 'center',      desktopOnly: false },
  { key: 'centerRight', desktopOnly: true  },
  { key: 'right',       desktopOnly: false },
];

const NavbarView = () => {
  const { state } = useContext(AppContext);

  return (
    <div className="Navbar">
      <NavbarBrand />
      <div className="navbar-slots">
        {SLOTS.map(({ key, desktopOnly }) => (
          <li
            key={key}
            className={`navbar-slot${desktopOnly ? ' navbar-slot--desktop' : ''}`}
          >
            {renderWidget(state.widgets[key])}
          </li>
        ))}
      </div>
    </div>
  );
};

export default NavbarView;
