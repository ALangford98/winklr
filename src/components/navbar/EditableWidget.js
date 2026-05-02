import React, { useState, useContext } from 'react';
import { AppContext } from '../appContext';
import { linkOptions, functionalOptions } from './widgetRegistry';

const EditableWidget = ({ slot }) => {
  const { state, setWidget, clearWidget } = useContext(AppContext);
  const saved = state.widgets[slot];

  const [isEditing, setIsEditing] = useState(false);
  const [widgetType, setWidgetType] = useState('none');
  const [widgetContent, setWidgetContent] = useState('');

  const handleOpen = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setWidgetType('none');
    setWidgetContent('');
  };

  const handleSave = () => {
    if (widgetType !== 'none' && widgetContent !== '') {
      setWidget(slot, { type: widgetType, content: widgetContent });
      handleCancel();
    }
  };

  const getOptions = (opts) =>
    opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>);

  return (
    <div className="editable-widget">
      {saved ? (
        <>
          <span className="widget-label">{saved.content}</span>
          <span className="widget-clear" onClick={() => clearWidget(slot)}>✕</span>
        </>
      ) : (
        <span className="widget-add" onClick={handleOpen}>+</span>
      )}

      {isEditing && (
        <div className="widget-editor">
          <select
            value={widgetType}
            onChange={(e) => { setWidgetType(e.target.value); setWidgetContent(''); }}
          >
            <option value="none" disabled>Type</option>
            <option value="link">Link</option>
            <option value="function">Tool</option>
          </select>

          {widgetType !== 'none' && (
            <select value={widgetContent} onChange={(e) => setWidgetContent(e.target.value)}>
              <option value="" disabled>Select</option>
              {widgetType === 'link' ? getOptions(linkOptions) : getOptions(functionalOptions)}
            </select>
          )}

          <div className="widget-editor-actions">
            <button onClick={handleSave} disabled={widgetType === 'none' || !widgetContent}>
              Save
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableWidget;
