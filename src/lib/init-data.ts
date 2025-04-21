import type { Node } from "@xyflow/react"

export const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "textUpdater",
    position: { x: 100, y: 100 },
    data: {
      html: "<div class='container'><h1>Hello World</h1><p>This is a sample snippet</p></div>",
      css: ".container { padding: 20px; } h1 { color: #7c3aed; } p { color: #4b5563; }",
      js: "console.log('Hello from snippet!')",
      title: "Hello World Snippet",
    },
    draggable: true,
    selectable: true,
  },
]
