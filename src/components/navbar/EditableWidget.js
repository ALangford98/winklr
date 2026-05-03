import React, { useState, useContext } from 'react';
import { AppContext } from '../appContext';
import { linkOptions, functionalOptions, renderWidget } from './widgetRegistry';

const EditableWidget = ({ slot }) => {
  const { state, setWidget, clearWidget } = useContext(AppContext);
  const saved = state.widgets[slot];

  const [isEditing, setIsEditing]       = useState(false);
  const [widgetType, setWidgetType]     = useState('none');
  const [widgetContent, setWidgetContent] = useState('');
  const [dropdownOpts, setDropdownOpts] = useState('');

  const handleOpen = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setWidgetType('none');
    setWidgetContent('');
    setDropdownOpts('');
  };

  const handleSave = () => {
    if (widgetType === 'none' || !widgetContent) return;
    const widget = { type: widgetType, content: widgetContent };
    if (widgetContent === 'Dropdown') {
      widget.options = dropdownOpts.split(',').map((s) => s.trim()).filter(Boolean);
    }
    setWidget(slot, widget);
    handleCancel();
  };

  const getOptions = (opts) =>
    opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>);

  return (
    <div className="editable-widget">
      {saved ? (
        <>
          <div className="widget-preview">{renderWidget(saved)}</div>
          <span className="widget-clear" onClick={() => clearWidget(slot)}>✕</span>
        </>
      ) : (
        <span className="widget-add" onClick={handleOpen}>+</span>
      )}

      {isEditing && (
        <div className="widget-editor">
          <select
            value={widgetType}
            onChange={(e) => { setWidgetType(e.target.value); setWidgetContent(''); setDropdownOpts(''); }}
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

          {widgetContent === 'Dropdown' && (
            <input
              className="widget-editor-opts"
              type="text"
              placeholder="Option 1, Option 2, ..."
              value={dropdownOpts}
              onChange={(e) => setDropdownOpts(e.target.value)}
            />
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
