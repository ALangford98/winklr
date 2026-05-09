import React, { useState, useContext } from 'react';
import { AppContext } from '../appContext';
import { linkOptions, functionalOptions, renderWidget } from './widgetRegistry';

const EditableWidget = ({ slot, desktopOnly = false }) => {
  const { state, setWidget, clearWidget } = useContext(AppContext);
  const saved = state.widgets[slot];

  const [isEditing, setIsEditing]         = useState(false);
  const [widgetType, setWidgetType]       = useState('none');
  const [widgetContent, setWidgetContent] = useState('');
  const [dropdownOpts, setDropdownOpts]   = useState([]);

  const handleOpen = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setWidgetType('none');
    setWidgetContent('');
    setDropdownOpts([]);
  };

  const handleSave = () => {
    if (widgetType === 'none' || !widgetContent) return;
    const widget = { type: widgetType, content: widgetContent };
    if (widgetContent === 'Dropdown') {
      widget.options = dropdownOpts;
    }
    setWidget(slot, widget);
    handleCancel();
  };

  const toggleOpt = (opt) =>
    setDropdownOpts((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );

  const getOptions = (opts) =>
    opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>);

  const uniqueCategories = [
    ...new Set(
      state.stockList.flatMap((item) => item.categories || [])
    ),
  ].filter(Boolean);

  const dropdownChoices = [
    ...linkOptions.map((o) => ({ value: o.value, label: o.label, group: 'Links' })),
    ...uniqueCategories.map((c) => ({ value: c, label: c, group: 'Categories' })),
  ];

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

      {desktopOnly && (
        <span className="widget-desktop-badge">Desktop only</span>
      )}

      {isEditing && (
        <div className="widget-editor">
          {desktopOnly && (
            <p className="widget-editor-notice">
              This slot is hidden on screens narrower than 600 px.
            </p>
          )}

          <select
            value={widgetType}
            onChange={(e) => { setWidgetType(e.target.value); setWidgetContent(''); setDropdownOpts([]); }}
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
            <div className="widget-dropdown-opts">
              {dropdownChoices.length === 0 ? (
                <p className="widget-editor-notice">Add categories to items to enable category filters.</p>
              ) : (
                dropdownChoices.map((choice) => (
                  <label key={choice.value} className="widget-dropdown-opt-label">
                    <input
                      type="checkbox"
                      checked={dropdownOpts.includes(choice.value)}
                      onChange={() => toggleOpt(choice.value)}
                    />
                    <span>{choice.label}</span>
                    <span className="widget-dropdown-opt-group">{choice.group}</span>
                  </label>
                ))
              )}
            </div>
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
