import React, { useContext } from 'react';
import { AppContext } from '../appContext';
import { renderWidget } from '../navbar/widgetRegistry';
import NavbarBrand from '../navbar/NavbarBrand';

const SLOTS = [
  { key: 'left',        className: 'LeftWidget'        },
  { key: 'centerLeft',  className: 'CenterLeftWidget'  },
  { key: 'center',      className: 'CenterWidget'      },
  { key: 'centerRight', className: 'CenterRightWidget' },
  { key: 'right',       className: 'RightWidget'       },
];

const NavbarView = () => {
  const { state } = useContext(AppContext);

  return (
    <div className="Navbar">
      <NavbarBrand />
      <div className="navbar-slots">
        {SLOTS.map(({ key, className }) => {
          const content = renderWidget(state.widgets[key]);
          if (!content) return null;
          return (
            <li key={key} className={className}>
              {content}
            </li>
          );
        })}
      </div>
    </div>
  );
};

export default NavbarView;
