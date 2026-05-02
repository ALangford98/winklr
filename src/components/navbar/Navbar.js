import React from 'react';
import EditableWidget from './EditableWidget';

const SLOTS = [
  { key: 'left',        className: 'LeftWidget'        },
  { key: 'centerLeft',  className: 'CenterLeftWidget'  },
  { key: 'center',      className: 'CenterWidget'      },
  { key: 'centerRight', className: 'CenterRightWidget' },
  { key: 'right',       className: 'RightWidget'       },
];

const Navbar = () => (
  <div className="Navbar">
    {SLOTS.map(({ key, className }) => (
      <li key={key} className={className}>
        <EditableWidget slot={key} />
      </li>
    ))}
  </div>
);

export default Navbar;
