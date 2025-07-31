/** @format */

// NestedDndList.tsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";

interface Item {
  id: string;
  content: string;
  children?: Item[];
}

const initialData: Item[] = [
  {
    id: "1",
    content: "Item 1",
    children: [
      {
        id: "1-1",
        content: "Item 1.1",
        children: [],
      },
      {
        id: "1-2",
        content: "Item 1.2",
        children: [],
      },
    ],
  },
  {
    id: "2",
    content: "Item 2",
    children: [
      {
        id: "2-1",
        content: "Item 2.1",
      },
      {
        id: "2-2",
        content: "Item 2.2",
        children: [],
      },
    ],
  },
  {
    id: "3",
    content: "Item 3",
    children: [],
  },
];

const NestedDndList: React.FC = () => {
  const [data, setData] = useState<Item[]>(initialData);

  const isDescendant = (parent: Item, childId: string): boolean => {
    if (!parent.children) return false;
    for (const child of parent.children) {
      if (child.id === childId) return true;
      if (isDescendant(child, childId)) return true;
    }
    return false;
  };

  const removeItem = (items: Item[], itemId: string): [Item | null, Item[]] => {
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      if (node.id === itemId) {
        const newItems = [...items];
        newItems.splice(i, 1);
        return [node, newItems];
      }

      if (node.children) {
        const [removed, newChildren] = removeItem(node.children, itemId);
        if (removed) {
          return [
            removed,
            items.map((n, idx) =>
              idx === i ? { ...n, children: newChildren } : n
            ),
          ];
        }
      }
    }

    return [null, items];
  };

  const insertItem = (
    items: Item[],
    parentId: string | null,
    index: number,
    item: Item
  ): Item[] => {
    if (parentId === null) {
      const newItems = [...items];
      newItems.splice(index, 0, item);
      return newItems;
    }

    return items.map((node) => {
      if (node.id === parentId) {
        const children = node.children ? [...node.children] : [];
        children.splice(index, 0, item);
        return { ...node, children };
      }

      if (node.children) {
        return {
          ...node,
          children: insertItem(node.children, parentId, index, item),
        };
      }

      return node;
    });
  };

  const findItemById = (items: Item[], id: string): Item | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const [draggedItem, treeWithoutItem] = removeItem(data, draggableId);
    if (!draggedItem) return;

    const destParentId =
      destination.droppableId === "root" ? null : destination.droppableId;
    const destIndex = destination.index;

    // Prevent drop into own descendant
    if (draggedItem && destParentId) {
      const destParent = findItemById(data, destParentId);
      if (destParent && isDescendant(draggedItem, destParentId)) {
        console.warn("❌ Can't drop into own descendant");
        return;
      }
    }

    const newTree = insertItem(
      treeWithoutItem,
      destParentId,
      destIndex,
      draggedItem
    );
    setData(newTree);
  };

  const renderItems = (items: Item[], parentId = "") => {
    return (
      <Droppable
        droppableId={parentId || "root"}
        type="ITEM"
        direction="vertical"
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: parentId ? 20 : 0,
              marginTop: 4,
              borderLeft: parentId ? "2px dashed #ccc" : undefined,
            }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    style={{
                      padding: 10,
                      margin: "4px 0",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      background: "#fff",
                      ...dragProvided.draggableProps.style,
                    }}
                  >
                    {item.content}
                    {/* Recursive call for children */}
                    {item.children && renderItems(item.children, item.id)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {renderItems(data)}
      </DragDropContext>
    </div>
  );
};

export default NestedDndList;
