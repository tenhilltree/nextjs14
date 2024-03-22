"use client";
import React from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./page.module.scss";

let items = ["Glass", "Banana", "Paper"];

function DragItem({ name }) {
  const [{ active }, drag] = useDrag(() => ({
    type: "a",
    item: { name },
    collect: (monitor, props) => {
      console.log(props);
      return {
        active: monitor.isDragging(),
      };
    },
  }));

  return (
    <div
      ref={drag}
      className={styles.dragItem}
      style={{ opacity: active ? 0.5 : 1 }}
    >
      {name}
    </div>
  );
}

function DropArea({}) {
  const [{ active, isOver }, drop] = useDrop(() => {
    return {
      accept: "a",
      collect: (monitor, props) => {
        console.log(props);
        return {
          active: monitor.canDrop(),
          isOver: monitor.isOver(),
        };
      },
      drop: (item, monitor) => {
        console.log(item);
      },
    };
  });

  let bg = isOver ? "yellow" : active ? "red" : "black";

  return (
    <div className={styles.dropArea} style={{ background: bg }} ref={drop}>
      Drag a box here
    </div>
  );
}

export default function SingleTarget() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DropArea />
      <div className={styles.dragArea}>
        {items.map((item) => {
          return <DragItem key={item} name={item} />;
        })}
      </div>
    </DndProvider>
  );
}
