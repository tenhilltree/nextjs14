"use client";
import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import BoardSquare from "@/app/chess/square";
import Knight from "@/app/chess/knight";
import styles from "./page.module.scss";
import { canMoveKnight } from "./const";

export default function Board() {
  const [knightPosition, setKnightPosition] = useState([0, 0]);
  const renderSquare = (i, [knightX, knightY]) => {
    const x = i % 8;
    const y = Math.floor(i / 8);
    const black = (x + y) % 2 === 1;
    const isKnightHere = knightX === x && knightY === y;
    const piece = isKnightHere ? <Knight /> : null;

    return (
      <div
        key={i}
        style={{ width: "12.5%", height: "12.5%" }}
        onClick={() => {
          if (canMoveKnight(knightPosition, x, y)) {
            setKnightPosition([x, y]);
          }
        }}
      >
        <BoardSquare
          x={x}
          y={y}
          knightPosition={knightPosition}
          setKnightPosition={setKnightPosition}
        >
          {piece}
        </BoardSquare>
      </div>
    );
  };

  useEffect(() => {
    const randPos = () => Math.floor(Math.random() * 8);
    setInterval(() => {
      //   setKnightPosition([randPos(), randPos()]);
    }, 1000);
  }, []);
  return (
    <div className={styles.page}>
      <DndProvider backend={HTML5Backend}>
        {new Array(64)
          .fill(null)
          .map((_, i) => renderSquare(i, knightPosition))}
      </DndProvider>
    </div>
  );
}
