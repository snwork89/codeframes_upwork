"use client";
import CodePreview from "@/components/CodePreview";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";

import type { Node, Edge, NodeProps } from "@xyflow/react";
import { NodeTypes } from "@xyflow/react/dist/esm/types";
import React, { useState, useCallback } from "react";
import "@xyflow/react/dist/style.css";

const rfStyle = {
  backgroundColor: "rgb(247 247 247)",
};

const TextUpdaterNode: React.FC<NodeProps> = ({ data }) => {
  const { html, css, js } = data;
  return <CodePreview html={html} css={css} js={js} />;
};

const generateId = (() => {
  let count = 1;
  return () => `node-${++count}`;
})();

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "node-1",
      type: "textUpdater",
      draggable:true,
      selectable:true,
      position: { x: 0, y: 0 },
      data: {
        html: "<h1>Hello World</h1>",
        css: "h1 { color: red; }",
        js: 'console.log("Hello from JS!");',
      },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-1");

  const nodeTypes: NodeTypes = {
    textUpdater: TextUpdaterNode,
  };

  const selectedNode:any = nodes.find((n) => n.id === selectedNodeId);

  const updateSelectedNodeData = (field: "html" | "css" | "js", value: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      )
    );
  };

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const onNodeClick = useCallback((_:any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const addNewTemplateNode = () => {
    const id = generateId();
    const newNode: Node = {
      id,
      type: "textUpdater",
      draggable:true,
      selectable:true,
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
      data: {
        html: "",
        css: "",
        js: "",
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="col-span-1 p-4 overflow-y-auto border-r">
        <button
          onClick={addNewTemplateNode}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Template
        </button>

        {selectedNode && (
          <>
            <div className="mb-4">
              <h2 className="font-semibold">HTML</h2>
              <textarea
                className="border mt-1 w-full"
                value={selectedNode.data.html}
                onChange={(e) => updateSelectedNodeData("html", e.target.value)}
                rows={5}
              />
            </div>
            <div className="mb-4">
              <h2 className="font-semibold">CSS</h2>
              <textarea
                className="border mt-1 w-full"
                value={selectedNode.data.css}
                onChange={(e) => updateSelectedNodeData("css", e.target.value)}
                rows={5}
              />
            </div>
            <div className="mb-4">
              <h2 className="font-semibold">JS</h2>
              <textarea
                className="border mt-1 w-full"
                value={selectedNode.data.js}
                onChange={(e) => updateSelectedNodeData("js", e.target.value)}
                rows={5}
              />
            </div>
          </>
        )}
      </div>

      <div className="col-span-3">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          style={rfStyle}
        >
          <Controls />
          <MiniMap zoomable pannable />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default App;
