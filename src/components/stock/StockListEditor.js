import React, { useState, useContext } from 'react';
import { AppContext } from '../appContext';

const EMPTY_FORM = { name: '', price: '', image: '' };

export default function StockListEditor() {
  const { state, removeStockItem, setStockList, addStockItem } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  if (state.stockList.length === 0) return null;

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
    setShowForm(false);
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="stock-list-editor">
      <p className="loader-label">Items ({state.stockList.length})</p>

      <ul className="editor-list">
        {state.stockList.map((item, i) => (
          <li key={item.id} className="editor-item">
            <span className="editor-item-name" title={item.name}>{item.name || 'Unnamed'}</span>
            <div className="editor-item-actions">
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button onClick={() => moveItem(i, 1)} disabled={i === state.stockList.length - 1} title="Move down">↓</button>
              <button onClick={() => removeStockItem(item.id)} className="editor-remove" title="Remove">×</button>
            </div>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form className="editor-add-form" onSubmit={handleAdd}>
          <input placeholder="Name *" value={form.name} onChange={set('name')} autoFocus />
          <input placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
          <input placeholder="Image URL" value={form.image} onChange={set('image')} />
          <div className="editor-form-actions">
            <button type="submit" disabled={!form.name.trim()}>Add</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="editor-add-btn" onClick={() => setShowForm(true)}>+ Add item</button>
      )}
    </div>
  );
}
