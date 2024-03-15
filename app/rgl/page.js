"use client";
import React, { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const GRID_ROWS = 6;
const GRID_COLUMNS = 12;

const Card = ({ id, row, col, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: { id, row, col },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      Card {id}
    </div>
  );
};

const Grid = () => {
  const [occupiedCells, setOccupiedCells] = useState([]);

  const handleDrop = (row, col) => {
    // Logic to update occupiedCells when a card is dropped
    // You may need to update your state to reflect the change in occupiedCells
  };

  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item, monitor) => {
      const { row, col } = item;
      handleDrop(row, col);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const isCellOccupied = (row, col) => {
    return occupiedCells.some((cell) => cell.row === row && cell.col === col);
  };

  return (
    <div
      ref={drop}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        gap: "5px",
      }}
    >
      {Array.from({ length: GRID_ROWS }).map((_, row) =>
        Array.from({ length: GRID_COLUMNS }).map((_, col) => {
          const cellKey = `${row}-${col}`;
          const isCellEmpty = !isCellOccupied(row, col);

          return (
            <div
              key={cellKey}
              style={{
                border: "1px solid black",
                backgroundColor:
                  isCellEmpty && isOver ? "lightblue" : "transparent",
              }}
            >
              {isCellEmpty && isOver ? "Drop Here" : ""}
            </div>
          );
        })
      )}

      {/* Place your cards on the grid */}
      <Card id={1} row={1} col={1} />
      <Card id={2} row={2} col={3} />
      {/* Add more cards as needed */}
    </div>
  );
};

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Grid />
    </DndProvider>
  );
};

export default App;
