import type { Node, Edge, NodeProps } from "@xyflow/react";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "textUpdater",
    position: { x: 100, y: 100 },
    data: {
      html: `
  <div class="container">
    <button class="glow-button" onclick="sayHello()">Click Me</button>
  </div>
        `.trim(),
      css: `
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 50px;
    background: linear-gradient(135deg, #e0eafc, #cfdef3);
  }
  
  .glow-button {
    padding: 12px 24px;
    font-size: 18px;
    color: white;
    background: #6366f1;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 10px #6366f1, 0 0 20px #6366f1;
    transition: all 0.3s ease-in-out;
  }
  
  .glow-button:hover {
    background: #4f46e5;
    box-shadow: 0 0 20px #4f46e5, 0 0 40px #4f46e5;
  }
        `.trim(),
      js: `
  function sayHello() {
    alert("Hello ! 🎉");
    console.log("This is a beautiful button interaction!");
  }
        `.trim(),
    },
  },
  {
    id: "node-2",
    type: "textUpdater",
    position: { x: 500, y: 100 },
    data: {
      html: `
  <div class="loader"></div>
        `.trim(),
      css: `
  .loader {
    border: 8px solid #f3f3f3;
    border-top: 8px solid #6366f1;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
    margin: 100px auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
        `.trim(),
      js: `// Pure CSS loader, no JS needed here`,
    },
  },
  {
    id: "node-3",
    type: "textUpdater",
    position: { x: 100, y: 400 },
    data: {
      html: `
  <div class="card">
    <h2>Profile Card</h2>
    <p>Beautiful UI with hover effect</p>
  </div>
        `.trim(),
      css: `
  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    padding: 20px;
    text-align: center;
    width: 200px;
    transition: transform 0.3s ease;
    margin: 100px auto;
  }
  
  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 30px rgba(0,0,0,0.15);
  }
        `.trim(),
      js: `// No interactivity here, just hover effects`,
    },
  },
  {
    id: "node-4",
    type: "textUpdater",
    position: { x: 500, y: 400 },
    data: {
      html: `
  <div class="toggle-switch" onclick="toggleTheme()">
    <div class="switch"></div>
  </div>
        `.trim(),
      css: `
  .toggle-switch {
    width: 60px;
    height: 30px;
    background: #ccc;
    border-radius: 30px;
    position: relative;
    cursor: pointer;
    margin: 100px auto;
  }
  .switch {
    width: 26px;
    height: 26px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s ease;
  }
  .dark .toggle-switch {
    background: #333;
  }
  .dark .switch {
    left: 32px;
  }
  body.dark {
    background: #111;
    color: #eee;
  }
        `.trim(),
      js: `
  function toggleTheme() {
    document.body.classList.toggle('dark');
  }
        `.trim(),
    },
  },
];


export {initialNodes}