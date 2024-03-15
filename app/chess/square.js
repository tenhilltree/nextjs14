import React from "react";
import { useDrop } from "react-dnd";
import { ItemTypes, canMoveKnight } from "@/app/chess/const";

export function Square({ black, children }) {
  const fill = black ? "black" : "white";
  const stroke = black ? "white" : "black";
  return (
    <div
      style={{
        backgroundColor: fill,
        color: stroke,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}

function Overlay({ color }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        zIndex: 1,
        opacity: 0.5,
        backgroundColor: color,
      }}
    />
  );
}

export default function BoardSquare({
  x,
  y,
  children,
  knightPosition,
  setKnightPosition,
}) {
  const black = (x + y) % 2 === 1;
  const [{ isOver, canDrop }, drop] = useDrop(() => {
    return {
      accept: ItemTypes.KNIGHT,
      canDrop: () => canMoveKnight(knightPosition, x, y),
      drop: () => {
        setKnightPosition([x, y]);
      },
      collect: (monitor) => {
        return {
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop(),
        };
      },
    };
  }, [knightPosition, x, y]);
  return (
    <div
      ref={drop}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Square black={black}>{children}</Square>
      {isOver && !canDrop && <Overlay color="red" />}
      {!isOver && canDrop && <Overlay color="yellow" />}
      {isOver && canDrop && <Overlay color="green" />}
    </div>
  );
}
