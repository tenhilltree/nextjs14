"use client";
import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/app/chess/const";

export default function Knight() {
  const [{ isDragging }, ref] = useDrag(() => {
    return {
      type: ItemTypes.KNIGHT,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    };
  });
  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        fontSize: 80,
        fontWeight: "bold",
        width: "100%",
        height: "100%",
        textAlign: "center",
        backgroundColor: "transparent",
        // transform: "translate(0, 0)",
        zIndex: 1,
        position: "relative",
      }}
    >
      ♘
    </div>
  );
}
