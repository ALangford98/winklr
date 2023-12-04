import React, { useContext, useState } from 'react';
import EditableWidget from './EditableWidget';
import { AppContext } from '../../components/appContext';

const Navbar = () => {
  const { state, updateState } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  return (
    <div className='Navbar'>
      <button className='Editing' onClick={toggleEditing}>
        {isEditing ? 'Switch to View' : 'Switch to Edit'}
      </button>

      {isEditing ? (
  <>
    <li className='LeftWidget'>
      <EditableWidget />
    </li>
    <li className='CenterLeftWidget'>
      <EditableWidget />
    </li>
    <li className='CenterWidget'>
      <EditableWidget />
    </li>
    <li className='CenterRightWidget'>
      <EditableWidget />
    </li>
    <li className='RightWidget'>
      <EditableWidget />
    </li>
  </>
) : (
	<div className='ViewMode'>

	</div>
)}    </div>
  );
};

export default Navbar;
