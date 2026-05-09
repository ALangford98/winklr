import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../appContext';

const EMPTY_FORM = { name: '', price: '', image: '' };

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function ImagePicker({ value, onChange }) {
  const ref = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(await readFileAsDataUrl(file));
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
    </div>
  );
}

function EditItemForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:  item.name  ?? '',
    price: item.price > 0 ? String(item.price) : '',
    image: item.image ?? '',
  });

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === 'string' ? val : val.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ name: form.name.trim(), price: Number(form.price) || 0, image: form.image.trim() });
  };

  return (
    <form className="editor-edit-form" onSubmit={handleSubmit}>
      <ImagePicker value={form.image} onChange={set('image')} />
      <input className="editor-add-form-input" placeholder="Name *" value={form.name} onChange={set('name')} autoFocus />
      <input className="editor-add-form-input" placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
      <div className="editor-form-actions">
        <button type="submit" disabled={!form.name.trim()}>Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function StockListEditor() {
  const { state, removeStockItem, updateStockItem, setStockList, addStockItem } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  if (state.stockList.length === 0 && !showAdd) {
    return (
      <div className="stock-list-editor">
        <button className="editor-add-btn" onClick={() => setShowAdd(true)}>+ Add item</button>
      </div>
    );
  }

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
    addStockItem({ name: form.name.trim(), price: Number(form.price) || 0, image: form.image.trim() });
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === 'string' ? val : val.target.value }));

  return (
    <div className="stock-list-editor">
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
                <span className="editor-item-name" title={item.name}>{item.name || 'Unnamed'}</span>
                <div className="editor-item-actions">
                  <button onClick={() => setEditingId(item.id)} title="Edit">✎</button>
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
