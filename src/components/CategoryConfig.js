import React, { useContext } from 'react';
import { AppContext } from './appContext';

export default function CategoryConfig() {
  const { state, setGroupByCategory, updateCategoryConfig, removeSection } = useContext(AppContext);

  const categories = [
    ...Object.keys(state.categoryConfig || {}),
    ...new Set(state.stockList.flatMap((i) => i.categories || [])),
  ].filter((c, i, arr) => c && arr.indexOf(c) === i);

  if (!categories.length) {
    return (
      <div className="category-config">
        <p className="category-config-empty">
          Tag your items with a category (e.g. "Kitchen", "Bedroom") in the Items panel, or add a named section from the Layout panel, then come back here to add headings and descriptions.
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
            const itemCount = state.stockList.filter((i) => (i.categories || []).includes(cat)).length;
            return (
              <div key={cat} className="category-config-item">
                <div className="category-config-name">
                  <span>{cat}{itemCount === 0 && <span className="category-config-empty-tag"> (no items yet)</span>}</span>
                  {itemCount === 0 && (
                    <button
                      type="button"
                      className="category-config-remove"
                      title="Remove this empty section"
                      onClick={() => removeSection(cat)}
                    >
                      ×
                    </button>
                  )}
                </div>
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
