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
  // Slots with nothing configured (or a stale/unrecognised widget entry that
  // renders nothing) used to still get their own bordered <li>, which is
  // what produced a row of empty dividers with no content in them.
  const activeSlots = SLOTS
    .map(({ key, desktopOnly }) => ({ key, desktopOnly, content: renderWidget(state.widgets[key]) }))
    .filter((slot) => slot.content);

  return (
    <>
      <div className="mobile-brand-bar">
        <NavbarBrand />
      </div>
      <div className="Navbar">
        <NavbarBrand />
        {activeSlots.length > 0 && (
          <div className="navbar-slots">
            {activeSlots.map(({ key, desktopOnly, content }) => (
              <li
                key={key}
                className={`navbar-slot${desktopOnly ? ' navbar-slot--desktop' : ''}`}
              >
                {content}
              </li>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NavbarView;
