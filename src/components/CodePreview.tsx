"use client";
import React, { useState, useEffect, useRef } from 'react';


interface CodePreviewProps {
    html: string;
    css: string;
    js: string;
  }
  
  const CodePreview: React.FC<any> = ({ html, css, js }:any) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
  
    const generatePreview = () => {
      if (iframeRef.current) {
        const document = iframeRef.current.contentDocument;
        if (document) {
          const documentContents = `
            <html>
              <head>
                <style>${css}</style>
              </head>
              <body>
                ${html}
                <script>${js}<\/script>
              </body>
            </html>
          `;
          document.open();
          document.write(documentContents);
          document.close();
        }
      }
    };
  
    useEffect(() => {
      generatePreview();
    }, [html, css, js]);
  
    return (
    
        <iframe ref={iframeRef} style={{border:"1px solid #ddd",backgroundColor:"white"}} title="Code Preview" />
     
    );
  };
  
  export default CodePreview;