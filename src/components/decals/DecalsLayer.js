import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../appContext";

function DecalItem({ decal, isEditMode, containerRef, onUpdate, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ dx: 0, dy: 0 });

  const toContentPoint = (clientX, clientY) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    return {
      x: clientX - rect.left + container.scrollLeft,
      y: clientY - rect.top + container.scrollTop,
    };
  };

  const handlePointerDown = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    const point = toContentPoint(e.clientX, e.clientY);
    offsetRef.current = { dx: point.x - decal.x, dy: point.y - decal.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const container = containerRef.current;
    const point = toContentPoint(e.clientX, e.clientY);
    // Clamp to non-negative, in-bounds coordinates so a decal can never be
    // dragged above/left of the page where it'd be invisible and effectively
    // stuck - the only way back would be deleting it and starting over.
    const maxX = Math.max(0, container.scrollWidth - decal.width);
    const maxY = Math.max(0, container.scrollHeight - decal.width);
    const x = Math.min(maxX, Math.max(0, Math.round(point.x - offsetRef.current.dx)));
    const y = Math.min(maxY, Math.max(0, Math.round(point.y - offsetRef.current.dy)));
    onUpdate(decal.id, { x, y });
  };

  const handlePointerUp = (e) => {
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  };

  return (
    <div
      className={`decal${isEditMode ? " decal--editable" : ""}${dragging ? " decal--dragging" : ""}`}
      style={{ left: decal.x, top: decal.y, width: decal.width, transform: `rotate(${decal.rotation || 0}deg)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img src={decal.image} alt="" className="decal-img" draggable={false} />
      {isEditMode && (
        <button
          type="button"
          className="decal-remove"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(decal.id)}
          title="Remove decal"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function DecalsLayer({ containerRef }) {
  const { state, updateDecal, removeDecal } = useContext(AppContext);

  if (!state.decals?.length) return null;

  return (
    <>
      {state.decals.map((decal) => (
        <DecalItem
          key={decal.id}
          decal={decal}
          isEditMode={state.viewMode}
          containerRef={containerRef}
          onUpdate={updateDecal}
          onRemove={removeDecal}
        />
      ))}
    </>
  );
}
