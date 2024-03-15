export const ItemTypes = {
  KNIGHT: "knight",
};

export function canMoveKnight(initPosition, toX, toY) {
  const [x, y] = initPosition;
  const dx = toX - x;
  const dy = toY - y;

  return (
    (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
    (Math.abs(dx) === 1 && Math.abs(dy) === 2)
  );
}
