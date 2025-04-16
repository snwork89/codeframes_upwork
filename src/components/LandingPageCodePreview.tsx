"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"

interface LandingPageCodePreviewProps {
  delay?: number
}

export default function LandingPageCodePreview({ delay = 0 }: LandingPageCodePreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const htmlCode = `<div class="card">
  <h2>Hello World</h2>
  <p>This is a live preview</p>
  <button class="btn">Click me</button>
</div>`

  const cssCode = `.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
}

h2 {
  color: #7c3aed;
  margin-bottom: 12px;
}

.btn {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
}

.btn:hover {
  background: #6d28d9;
  transform: translateY(-2px);
}`

  const jsCode = `const button = document.querySelector('.btn');
button.addEventListener('click', () => {
  alert('Button clicked!');
});`

  const steps = [
    { html: htmlCode.slice(0, 20), css: "", js: "" },
    { html: htmlCode.slice(0, 60), css: "", js: "" },
    { html: htmlCode.slice(0, 120), css: "", js: "" },
    { html: htmlCode, css: "", js: "" },
    { html: htmlCode, css: cssCode.slice(0, 50), js: "" },
    { html: htmlCode, css: cssCode.slice(0, 150), js: "" },
    { html: htmlCode, css: cssCode.slice(0, 250), js: "" },
    { html: htmlCode, css: cssCode, js: "" },
    { html: htmlCode, css: cssCode, js: jsCode.slice(0, 40) },
    { html: htmlCode, css: cssCode, js: jsCode },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          clearInterval(interval)
          return prev
        }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible, steps.length])

  const renderPreview = () => {
    const { html, css, js } = steps[currentStep]
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `
  }

  return (
    <div
      className={`w-full max-w-3xl mx-auto transition-all duration-1000 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="bg-gray-900 rounded-xl p-4 shadow-xl border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex space-x-2">
              <div className="text-xs text-gray-400 px-2 py-1 rounded bg-gray-800">HTML</div>
              <div className="text-xs text-gray-400 px-2 py-1 rounded bg-gray-800">CSS</div>
              <div className="text-xs text-gray-400 px-2 py-1 rounded bg-gray-800">JS</div>
            </div>
          </div>
          <div className="font-mono text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap h-64 overflow-y-auto">
            {steps[currentStep].html && (
              <div className="mb-4">
                <div className="text-purple-400 mb-1">&lt;!-- HTML --&gt;</div>
                <div className="text-blue-300">{steps[currentStep].html}</div>
              </div>
            )}
            {steps[currentStep].css && (
              <div className="mb-4">
                <div className="text-purple-400 mb-1">/* CSS */</div>
                <div className="text-green-300">{steps[currentStep].css}</div>
              </div>
            )}
            {steps[currentStep].js && (
              <div>
                <div className="text-purple-400 mb-1">// JavaScript</div>
                <div className="text-yellow-300">{steps[currentStep].js}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden h-64 border border-gray-200">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">Preview</div>
            <div className="flex items-center space-x-1">
              <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                <Check className="w-3 h-3 mr-1" /> Live
              </div>
            </div>
          </div>
          <div className="h-full">
            <iframe
              srcDoc={renderPreview()}
              title="Code Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
