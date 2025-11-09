import React, { useState } from 'react';
import { Stage, Layer, Line, Text, Rect } from 'react-konva';

const gridSize = 20;
const snapAngle = 45;

function snapToGrid(value) {
  return Math.round(value / gridSize) * gridSize;
}

function snapToAngle(dx, dy) {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const snappedAngle = Math.round(angle / snapAngle) * snapAngle;
  const rad = snappedAngle * (Math.PI / 180);
  const length = Math.sqrt(dx * dx + dy * dy);
  return { dx: Math.cos(rad) * length, dy: Math.sin(rad) * length };
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function App() {
  const [lines, setLines] = useState([]);
  const [newLine, setNewLine] = useState(null);
  const [objects, setObjects] = useState([]);

  const handleMouseDown = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewLine({ x1: snapToGrid(x), y1: snapToGrid(y), x2: snapToGrid(x), y2: snapToGrid(y) });
  };

  const handleMouseMove = (e) => {
    if (!newLine) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    const dx = x - newLine.x1;
    const dy = y - newLine.y1;
    const snapped = snapToAngle(dx, dy);
    setNewLine({
      ...newLine,
      x2: snapToGrid(newLine.x1 + snapped.dx),
      y2: snapToGrid(newLine.y1 + snapped.dy),
    });
  };

  const handleMouseUp = () => {
    if (newLine) {
      setLines([...lines, newLine]);
      setNewLine(null);
    }
  };

  const handleAddObject = () => {
    setObjects([...objects, { x: 100, y: 100, width: 40, height: 20 }]);
  };

  const handleDragEnd = (e, index) => {
    const { x, y } = e.target.position();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    const updated = [...objects];
    updated[index] = { ...updated[index], x: snappedX, y: snappedY };
    setObjects(updated);
  };

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i < 800; i += gridSize) {
      lines.push(<Line key={`v-${i}`} points={[i, 0, i, 600]} stroke="#eee" />);
      lines.push(<Line key={`h-${i}`} points={[0, i, 800, i]} stroke="#eee" />);
    }
    return lines;
  };

  return (
    <div>
    <h1>Measurement Tool</h1>
      <button onClick={handleAddObject}>Add Object</button>
      <Stage width={800} height={600} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <Layer>
          {renderGrid()}
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              <Line
                points={[line.x1, line.y1, line.x2, line.y2]}
                stroke="black"
                strokeWidth={2}
              />
              <Text
                x={(line.x1 + line.x2) / 2}
                y={(line.y1 + line.y2) / 2 - 20}
                text={`${(distance(line.x1, line.y1, line.x2, line.y2) / 10).toFixed(2)} cm`}
                fontSize={14}
                fill="blue"
              />
            </React.Fragment>
          ))}
          {newLine && (
            <>
              <Line
                points={[newLine.x1, newLine.y1, newLine.x2, newLine.y2]}
                stroke="red"
                strokeWidth={2}
              />
              <Text
                x={(newLine.x1 + newLine.x2) / 2}
                y={(newLine.y1 + newLine.y2) / 2 - 20}
                text={`${(distance(newLine.x1, newLine.y1, newLine.x2, newLine.y2) / 10).toFixed(2)} cm`}
                fontSize={14}
                fill="red"
              />
            </>
          )}
          {objects.map((obj, i) => (
            <Rect
              key={i}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill="green"
              draggable
              onDragEnd={(e) => handleDragEnd(e, i)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
