import React, { useState, useContext } from 'react';
import { NavbarLinks, navbarLinksOptions } from './NavbarLinks';
import SearchBar from './functional-components/Searchbar';
import DropdownMenu from './functional-components/DropdownMenu';
import { AppContext } from '../../components/appContext';

const functionalComponentsOptions = [
  { value: 'Search', label: 'Search Bar', component: <SearchBar /> },
  { value: 'Dropdown', label: 'Dropdown Menu', component: <DropdownMenu /> },
  // Add more options as needed
];

const EditableWidget = ({ onSaveWidget, isViewMode }) => {
  const { saveWidget } = useContext(AppContext);

  const [isEditing, setEditing] = useState(false);
  const [widgetType, setWidgetType] = useState('none');
  const [widgetContent, setWidgetContent] = useState('');

  const handleToggleEditing = () => {
    setEditing(!isEditing);

    // Reset widget state only if the widget is not being created
    if (!isEditing) {
      setWidgetType('none');
      setWidgetContent('');
    }
  };

  const handleWidgetTypeChange = (selectedType) => {
    setWidgetType(selectedType);
    setWidgetContent('');
  };

  const handleWidgetContentChange = (selectedContent) => {
    setWidgetContent(selectedContent);
  };

  const handleSaveWidget = () => {
    if (widgetType !== 'none' && widgetContent !== '') {
      onSaveWidget(widgetType, widgetContent);

      // Reset the state
      setEditing(false);
    }
  };

  const getOptions = (optionsArray) => {
    return optionsArray.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  };

  return (
    <div className='editable-widget'>
      {isEditing && !isViewMode && (
        <>
          <select onChange={(e) => handleWidgetTypeChange(e.target.value)} value={widgetType}>
            <option value="none" disabled>Select a Widget to add</option>
            <option value="link">Link</option>
            <option value="function">Tool</option>
          </select>

          {widgetType !== 'none' && (
            <>
              <select onChange={(e) => handleWidgetContentChange(e.target.value)} value={widgetContent}>
                <option value="" disabled>Select Content</option>
                {widgetType === 'link' ? getOptions(navbarLinksOptions) : getOptions(functionalComponentsOptions)}
              </select>

              <button onClick={handleSaveWidget}>Save Widget</button>
            </>
          )}
        </>
      )}

      <span onClick={handleToggleEditing}>{isEditing ? '❌' : (widgetContent || '+')}</span>
    </div>
  );
};

export default EditableWidget;
