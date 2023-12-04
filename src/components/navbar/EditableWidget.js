import React, { useState } from 'react';
import { NavbarLinks, navbarLinksOptions } from './NavbarLinks';
import { NavbarFunctions, navbarFunctionsOptions } from './NavbarFunctions';

const EditableWidget = () => {
  const [isEditing, setEditing] = useState(false);
  const [widgetType, setWidgetType] = useState('none');
  const [widgetContent, setWidgetContent] = useState('');

  const handleToggleEditing = () => {
    setEditing(!isEditing);

    // Reset widget state when toggling editing
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
    // Automatically close the editing mode after selecting content
    setEditing(false);
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
      <span onClick={handleToggleEditing}>{isEditing ? '❌' : (widgetContent || '+')}</span>
      {isEditing && (
        <>
          <select onChange={(e) => handleWidgetTypeChange(e.target.value)} value={widgetType}>
            <option value="none" disabled>Select a Widget to add</option>
            <option value="link">Link</option>
            <option value="function">Function</option>
          </select>

          {widgetType === 'link' && (
            <select onChange={(e) => handleWidgetContentChange(e.target.value)} value={widgetContent}>
              <option value="" disabled>Select Content</option>
              {getOptions(navbarLinksOptions)}
            </select>
          )}

          {widgetType === 'function' && (
            <select onChange={(e) => handleWidgetContentChange(e.target.value)} value={widgetContent}>
              <option value="" disabled>Select Content</option>
              {getOptions(navbarFunctionsOptions)}
            </select>
          )}

          {widgetType === 'link' && <NavbarLinks selectedOption={widgetContent} />}
          {widgetType === 'function' && <NavbarFunctions selectedOption={widgetContent} />}
        </>
      )}
    </div>
  );
};

export default EditableWidget;
