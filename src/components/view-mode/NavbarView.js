import React, { useContext } from 'react';
import { AppContext } from '../../components/appContext';

const NavbarView = () => {
  const { state } = useContext(AppContext);

  return (
    <div className='Navbar'>
      {state.widgets.map((widget, index) => (
        <div key={index} className={`Widget ${widget.type}`}>
          {/* Render widget content based on type */}
          <li className='SavedWidget'>{widget.content}</li>
        </div>
      ))}
    </div>
  );
};

export default NavbarView;
