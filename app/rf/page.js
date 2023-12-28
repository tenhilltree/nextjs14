"use client";

import React, { useCallback } from "react";
import { ConfigProvider, Button } from "antd";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
} from "reactflow";
import TextUpdaterNode from "@/components/TextUpdaterNode";
import CustomEdge from "@/components/CustomEdge";

import "reactflow/dist/style.css";
import styles from "./page.module.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Input Node" },
    position: { x: 250, y: 25 },
  },

  {
    id: "2",
    // you can also pass a React component as a label
    data: { label: <div>Default Node</div> },
    position: { x: 100, y: 125 },
  },
  {
    id: "3",
    type: "output",
    data: { label: "Output Node" },
    position: { x: 250, y: 250 },
  },
  {
    id: "4",
    type: "textUpdater",
    position: { x: 300, y: 100 },
    data: { value: 123 },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", type: "custom-edge" },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "a", source: "4", target: "3", sourceHandle: "a", animated: true },
  { id: "b", source: "4", target: "2", sourceHandle: "b", animated: true },
];

const defaultEdgeOptions = { animated: true };

const nodeTypes = { textUpdater: TextUpdaterNode };

const edgeTypes = {
  "custom-edge": CustomEdge,
};

const panOnDrag = [1, 2];

export default function RF() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token，影响范围大
          colorPrimary: "#00b96b",
          borderRadius: 4,

          // 派生变量，影响范围小
          colorBgContainer: "#f6ffed",
        },
      }}
    >
      <main className={styles.main}>
        {/* <Button type="primary">Button</Button> */}
        <input type="tel" className="nodrag" />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnScroll
          selectionOnDrag
          panOnDrag={panOnDrag}
          selectionMode={SelectionMode.Partial}
          edgeUpdaterRadius={100}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </main>
    </ConfigProvider>
  );
}
