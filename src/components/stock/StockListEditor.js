import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../appContext';
import { buildDemoItems } from '../../data/demoItems';
import { readImageFileAsDataUrl } from '../../utils/readImageFile';

const EMPTY_FORM = { name: '', price: '', image: '', categories: [], quantity: '', nameRequired: true, metaRows: [] };

const metadataToRows = (metadata) =>
  Object.entries(metadata || {}).map(([key, value]) => ({ key, value: String(value) }));

const rowsToMetadata = (rows) =>
  rows.reduce((acc, { key, value }) => {
    const k = key.trim();
    if (k) acc[k] = value;
    return acc;
  }, {});

function MetadataEditor({ rows, onChange }) {
  const setRow = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <div className="metadata-editor">
      <span className="metadata-editor-label">Detail fields (shown on the tile)</span>
      {rows.map((row, i) => (
        <div className="metadata-editor-row" key={i}>
          <input
            className="editor-add-form-input metadata-editor-key"
            placeholder="Label"
            value={row.key}
            onChange={(e) => setRow(i, 'key', e.target.value)}
          />
          <input
            className="editor-add-form-input metadata-editor-value"
            placeholder="Value"
            value={row.value}
            onChange={(e) => setRow(i, 'value', e.target.value)}
          />
          <button
            type="button"
            className="metadata-editor-remove"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            title="Remove field"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="metadata-editor-add"
        onClick={() => onChange([...rows, { key: '', value: '' }])}
      >
        + Add field
      </button>
    </div>
  );
}

function ImagePicker({ value, onChange }) {
  const ref = useRef(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      onChange(await readImageFileAsDataUrl(file));
      setError('');
    } catch (err) {
      setError(err.message);
    }
    e.target.value = '';
  };

  const isDataUrl = value?.startsWith('data:');

  return (
    <div className="image-picker">
      <div
        className={`image-picker-preview${value ? ' image-picker-preview--filled' : ''}`}
        onClick={() => ref.current.click()}
        title="Click to upload a photo"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && ref.current.click()}
      >
        {value
          ? <img src={value} alt="" className="image-picker-img" />
          : <span className="image-picker-empty">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Add photo</span>
            </span>
        }
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} hidden />
      </div>
      {!isDataUrl && (
        <input
          className="editor-add-form-input"
          type="text"
          placeholder="or paste image URL"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {isDataUrl && (
        <button type="button" className="image-picker-replace" onClick={() => ref.current.click()}>
          Replace photo
        </button>
      )}
      {error && <p className="image-picker-error">{error}</p>}
    </div>
  );
}

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim();
    const alreadyExists = value.some((v) => v.toLowerCase() === tag.toLowerCase());
    if (tag && !alreadyExists) onChange([...value, tag]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="tag-input-wrap">
      {value.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" className="tag-chip-remove" onClick={() => onChange(value.filter(t => t !== tag))}>×</button>
        </span>
      ))}
      <input
        className="tag-input-field"
        type="text"
        placeholder={value.length ? '' : 'Add categories…'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
      />
    </div>
  );
}

function EditItemForm({ item, onSave, onCancel }) {
  const { state } = useContext(AppContext);
  const isRegistry = state.websiteType === 'registry';

  const [form, setForm] = useState({
    name:         item.name            ?? '',
    price:        item.price > 0       ? String(item.price) : '',
    image:        item.image           ?? '',
    categories:   item.categories      ?? [],
    quantity:     item.quantity > 0    ? String(item.quantity) : '',
    nameRequired: item.nameRequired    !== false,
    metaRows:     metadataToRows(item.metadata),
  });

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === 'string' ? val : val.target?.value ?? val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ name: form.name.trim(), price: Number(form.price) || 0, image: form.image.trim(), categories: form.categories, quantity: Number(form.quantity) || 0, nameRequired: form.nameRequired, metadata: rowsToMetadata(form.metaRows) });
  };

  return (
    <form className="editor-edit-form" onSubmit={handleSubmit}>
      <ImagePicker value={form.image} onChange={set('image')} />
      <input className="editor-add-form-input" placeholder="Name *" value={form.name} onChange={set('name')} autoFocus />
      <input className="editor-add-form-input" placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
      <input className="editor-add-form-input" placeholder={isRegistry ? 'Quantity needed (0 = unlimited)' : 'Stock quantity (0 = unlimited)'} type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} />
      <MetadataEditor rows={form.metaRows} onChange={(rows) => setForm((p) => ({ ...p, metaRows: rows }))} />
      <TagInput value={form.categories} onChange={(cats) => setForm((p) => ({ ...p, categories: cats }))} />
      {isRegistry && (
        <label className="editor-checkbox-row">
          <input
            type="checkbox"
            checked={form.nameRequired}
            onChange={(e) => setForm((p) => ({ ...p, nameRequired: e.target.checked }))}
          />
          <span>Require reserver's name</span>
        </label>
      )}
      <div className="editor-form-actions">
        <button type="submit" disabled={!form.name.trim()}>Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function StockListEditor() {
  const { state, removeStockItem, updateStockItem, toggleFeaturedItem, setStockList, addStockItem } = useContext(AppContext);
  const isRegistry = state.websiteType === 'registry';
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  if (state.stockList.length === 0 && !showAdd) {
    return (
      <div className="stock-list-editor">
        <button className="editor-add-btn" onClick={() => setShowAdd(true)}>+ Add item</button>
        <button className="editor-add-btn editor-demo-btn" onClick={() => setStockList(buildDemoItems())}>
          Load sample items
        </button>
      </div>
    );
  }

  const sampleCount = state.stockList.filter((i) => i.is_sample).length;

  const moveItem = (index, delta) => {
    const next = [...state.stockList];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setStockList(next);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addStockItem({ name: form.name.trim(), price: Number(form.price) || 0, image: form.image.trim(), categories: form.categories, quantity: Number(form.quantity) || 0, nameRequired: form.nameRequired, metadata: rowsToMetadata(form.metaRows) });
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === 'string' ? val : val.target?.value ?? val }));

  return (
    <div className="stock-list-editor">
      {sampleCount > 0 && (
        <p className="editor-sample-notice">
          {sampleCount} sample item{sampleCount !== 1 ? 's' : ''} won't be included in exports or shared links.{' '}
          <button
            type="button"
            className="editor-sample-remove-btn"
            onClick={() => setStockList(state.stockList.filter((i) => !i.is_sample))}
          >
            Remove them now
          </button>
        </p>
      )}
      <ul className="editor-list">
        {state.stockList.map((item, i) => (
          <li key={item.id}>
            {editingId === item.id ? (
              <EditItemForm
                item={item}
                onSave={(changes) => { updateStockItem(item.id, changes); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="editor-item">
                <div className="editor-item-thumb">
                  {item.image
                    ? <img src={item.image} alt="" className="editor-thumb-img" />
                    : <span className="editor-thumb-placeholder">{(item.name || '?')[0].toUpperCase()}</span>
                  }
                </div>
                <div className="editor-item-info">
                  <span className="editor-item-name" title={item.name}>
                    {item.name || 'Unnamed'}
                    {item.is_sample && <span className="editor-item-sample-badge" title="Sample item - excluded from exports and shared links">Sample</span>}
                  </span>
                  {isRegistry && (() => {
                    const byGuest = state.reservations?.[item.id];
                    if (!byGuest || !Object.keys(byGuest).length) return null;
                    const summary = Object.entries(byGuest).map(([name, qty]) => `${name} (${qty})`).join(', ');
                    return <span className="editor-item-reserved" title={summary}>Reserved by {summary}</span>;
                  })()}
                </div>
                <div className="editor-item-actions">
                  <button onClick={() => setEditingId(item.id)} title="Edit">✎</button>
                  <button
                    onClick={() => toggleFeaturedItem(item.id)}
                    className={item.featured ? 'editor-feature-btn editor-feature-btn--active' : 'editor-feature-btn'}
                    title={item.featured ? "Featured - click to unfeature" : "Feature this item (used by the Featured layout)"}
                  >
                    {item.featured ? '★' : '☆'}
                  </button>
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} title="Move up">↑</button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === state.stockList.length - 1} title="Move down">↓</button>
                  <button onClick={() => removeStockItem(item.id)} className="editor-remove" title="Remove">×</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {showAdd ? (
        <form className="editor-add-form" onSubmit={handleAdd}>
          <ImagePicker value={form.image} onChange={set('image')} />
          <input className="editor-add-form-input" placeholder="Name *" value={form.name} onChange={set('name')} autoFocus />
          <input className="editor-add-form-input" placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
          <input className="editor-add-form-input" placeholder="Quantity needed (0 = unlimited)" type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} />
          <MetadataEditor rows={form.metaRows} onChange={(rows) => setForm((p) => ({ ...p, metaRows: rows }))} />
          <TagInput value={form.categories} onChange={(cats) => setForm((p) => ({ ...p, categories: cats }))} />
          {isRegistry && (
            <label className="editor-checkbox-row">
              <input
                type="checkbox"
                checked={form.nameRequired}
                onChange={(e) => setForm((p) => ({ ...p, nameRequired: e.target.checked }))}
              />
              <span>Require reserver's name</span>
            </label>
          )}
          <div className="editor-form-actions">
            <button type="submit" disabled={!form.name.trim()}>Add</button>
            <button type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="editor-add-btn" onClick={() => setShowAdd(true)}>+ Add item</button>
      )}
    </div>
  );
}
