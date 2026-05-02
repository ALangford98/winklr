import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Tile from "../tiles/Tile";
import SortableTile from "../tiles/SortableTile";

function renderItem(item, tileConfig, sortable) {
  if (sortable) return <SortableTile key={item.id} item={item} config={tileConfig} />;
  return <Tile key={item.id} item={item} config={tileConfig} />;
}

function GridLayout({ items, tileConfig, sortable }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
      <div className="layout layout--grid">
        {items.map((item) => renderItem(item, tileConfig, sortable))}
      </div>
    </SortableContext>
  );
}

function StripLayout({ items, tileConfig, sortable }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
      <div className="layout layout--strip">
        {items.map((item) => renderItem(item, tileConfig, sortable))}
      </div>
    </SortableContext>
  );
}

function StackedLayout({ items, tileConfig, sortable }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div className="layout layout--stacked">
        {items.map((item) => renderItem(item, tileConfig, sortable))}
      </div>
    </SortableContext>
  );
}

function FeaturedLayout({ items, tileConfig, sortable }) {
  const [featured, ...rest] = items;
  const allIds = items.map((i) => i.id);
  return (
    <SortableContext items={allIds} strategy={rectSortingStrategy}>
      <div className="layout layout--featured">
        {featured && (
          <div className="layout-featured-slot">
            {renderItem(featured, tileConfig, sortable)}
          </div>
        )}
        <div className="layout-featured-grid">
          {rest.map((item) => renderItem(item, tileConfig, sortable))}
        </div>
      </div>
    </SortableContext>
  );
}

const LAYOUTS = {
  grid:     GridLayout,
  strip:    StripLayout,
  stacked:  StackedLayout,
  featured: FeaturedLayout,
};

export default function Layout({
  config = "grid",
  items = [],
  tileConfig = "standard",
  isEditMode = false,
  onReorder,
}) {
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const Component = LAYOUTS[config] ?? GridLayout;

  if (!isEditMode || !onReorder) {
    return <Component items={items} tileConfig={tileConfig} sortable={false} />;
  }

  const handleDragStart = ({ active }) => {
    setActiveItem(items.find((i) => i.id === active.id) ?? null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null);
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  const handleDragCancel = () => setActiveItem(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Component items={items} tileConfig={tileConfig} sortable />
      <DragOverlay>
        {activeItem && <Tile item={activeItem} config={tileConfig} />}
      </DragOverlay>
    </DndContext>
  );
}
