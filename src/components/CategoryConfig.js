import React, { useContext } from 'react';
import { AppContext } from './appContext';

export default function CategoryConfig() {
  const { state, setGroupByCategory, updateCategoryConfig } = useContext(AppContext);

  const categories = [
    ...new Set(state.stockList.flatMap((i) => i.categories || [])),
  ].filter(Boolean);

  if (!categories.length) {
    return (
      <div className="category-config">
        <p className="category-config-empty">
          Tag your items with a category (e.g. "Kitchen", "Bedroom") in the Items panel — then come back here to split them into sections with headings and dividers.
        </p>
      </div>
    );
  }

  return (
    <div className="category-config">
      <label className="category-config-toggle">
        <input
          type="checkbox"
          checked={!!state.groupByCategory}
          onChange={(e) => setGroupByCategory(e.target.checked)}
        />
        <span>Split items into sections</span>
      </label>

      {state.groupByCategory && (
        <div className="category-config-list">
          {categories.map((cat) => {
            const cfg = state.categoryConfig?.[cat] || {};
            return (
              <div key={cat} className="category-config-item">
                <div className="category-config-name">{cat}</div>
                <input
                  className="editor-add-form-input"
                  type="text"
                  placeholder="Section heading (optional)"
                  value={cfg.label || ''}
                  onChange={(e) => updateCategoryConfig(cat, { label: e.target.value })}
                />
                <textarea
                  className="category-config-textarea"
                  placeholder="Description text (optional)"
                  value={cfg.description || ''}
                  onChange={(e) => updateCategoryConfig(cat, { description: e.target.value })}
                  rows={2}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
