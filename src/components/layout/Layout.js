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

const JUSTIFY_CSS = { left: "flex-start", center: "center", right: "flex-end" };
const STACKED_MARGIN_CSS = { left: "0", center: "0 auto", right: "0 0 0 auto" };

function renderItem(item, tileConfig, sortable) {
  if (sortable) return <SortableTile key={item.id} item={item} config={tileConfig} />;
  return <Tile key={item.id} item={item} config={tileConfig} />;
}

function GridLayout({ items, tileConfig, sortable, align }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
      <div className="layout layout--grid" style={{ justifyContent: JUSTIFY_CSS[align] }}>
        {items.map((item) => renderItem(item, tileConfig, sortable))}
      </div>
    </SortableContext>
  );
}

function StripLayout({ items, tileConfig, sortable, align }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
      <div className="layout layout--strip" style={{ justifyContent: JUSTIFY_CSS[align] }}>
        {items.map((item) => renderItem(item, tileConfig, sortable))}
      </div>
    </SortableContext>
  );
}

function StackedLayout({ items, tileConfig, sortable, align }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div className="layout layout--stacked" style={{ margin: STACKED_MARGIN_CSS[align] }}>
        {items.map((item) => renderItem(item, tileConfig, sortable))}
      </div>
    </SortableContext>
  );
}

function FeaturedLayout({ items, tileConfig, sortable, align }) {
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
        <div className="layout-featured-grid" style={{ justifyContent: JUSTIFY_CSS[align] }}>
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
  align = "center",
  isEditMode = false,
  onReorder,
}) {
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const Component = LAYOUTS[config] ?? GridLayout;

  if (!isEditMode || !onReorder) {
    return <Component items={items} tileConfig={tileConfig} sortable={false} align={align} />;
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
      <Component items={items} tileConfig={tileConfig} sortable align={align} />
      <DragOverlay>
        {activeItem && <Tile item={activeItem} config={tileConfig} />}
      </DragOverlay>
    </DndContext>
  );
}
