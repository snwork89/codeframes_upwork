"use client";
import CodePreview from "@/components/CodePreview";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  ReactFlow,
} from "@xyflow/react";

import type { Node, NodeProps } from "@xyflow/react";
import { NodeTypes } from "@xyflow/react/dist/esm/types";
import React, { useState, useEffect, useRef, useCallback } from "react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "node-1",
    type: "textUpdater",
    position: { x: 0, y: 0 },
    data: { value: 123 },
  },
];
const rfStyle = {
  backgroundColor:"rgb(247 247 247)"
};

const TextUpdaterNode: React.FC<NodeProps> = ({ data }) => {
  const { html, css, js } = data;

  return <CodePreview html={html} css={css} js={js} />;
};
const App: React.FC = () => {
  const [html, setHtml] = useState<string>("<h1>Hello World</h1>");
  const [css, setCss] = useState<string>("h1 { color: red; }");
  const [js, setJs] = useState<string>('console.log("Hello from JS!");');
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const nodeTypes: NodeTypes = {
    textUpdater: TextUpdaterNode, // Pass the functional component here
  };

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback((connection: any) => {}, [setEdges]);

  {
    /* <CodePreview html={html} css={css} js={js} /> */
  }

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="col-span-1">
        <div>
          <h2>HTML</h2>
          <textarea
            className="border"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={5}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <h2>CSS</h2>
          <textarea
            className="border"
            value={css}
            onChange={(e) => setCss(e.target.value)}
            rows={5}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <h2>JS</h2>
          <textarea
            className="border"
            value={js}
            onChange={(e) => setJs(e.target.value)}
            rows={5}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div className="col-span-3">
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: { html, css, js }, // Pass the updated html, css, js to each node
          }))}
          
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={rfStyle}
        >
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default App;
