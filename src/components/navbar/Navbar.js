import React, { useContext } from 'react';
import EditableWidget from './EditableWidget';
import { AppContext } from '../../components/appContext';

const Navbar = () => {
  const { state, addWidget } = useContext(AppContext);

  const handleSaveWidget = (widgetType, widgetContent) => {
    if (widgetType !== 'none' && widgetContent !== '') {
      const newWidget = {
        type: widgetType,
        content: widgetContent,
      };

      // Add the new widget to the context
      addWidget(newWidget);
    }
  };  

	return (
    <div className='Navbar'>
      <li className='LeftWidget'>
        <EditableWidget onSaveWidget={handleSaveWidget} />
		</li>
      <li className='CenterLeftWidget'>
        <EditableWidget onSaveWidget={handleSaveWidget} />
      </li>
      <li className='CenterWidget'>
        <EditableWidget onSaveWidget={handleSaveWidget} />
      </li>
      <li className='CenterRightWidget'>
        <EditableWidget onSaveWidget={handleSaveWidget} />
      </li>
      <li className='RightWidget'>
        <EditableWidget onSaveWidget={handleSaveWidget} />
      </li>
    </div>
  );
};

export default Navbar;
