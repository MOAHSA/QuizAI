import React, { useEffect, useRef, useMemo } from 'react';

// Declare globals loaded from CDNs in index.html
declare global {
    var marked: any;
    var markedKatex: any;
    var hljs: any;
}

// A flag to ensure we only configure marked once
let markedConfigured = false;

interface ContentRendererProps {
  content: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedHtml = useMemo(() => {
    // Check if the external libraries are loaded
    if (typeof marked === 'undefined' || typeof markedKatex === 'undefined') {
        // Fallback to simple text rendering if scripts haven't loaded yet
        return `<p>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
    }

    // Configure marked once using v4 API
    if (!markedConfigured) {
        marked.setOptions({
            gfm: true,
            breaks: true,
        });
        const katexExtension = markedKatex({ throwOnError: false });
        marked.use(katexExtension);
        markedConfigured = true;
    }
    
    // Parse the content
    return marked.parse(content);
  }, [content]);

  useEffect(() => {
    // After the component renders the HTML, apply syntax highlighting
    if (containerRef.current && typeof hljs !== 'undefined') {
        containerRef.current.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }
  }, [parsedHtml]); // Re-run this effect whenever the HTML content changes

  return (
    <div
      ref={containerRef}
      className={`prose-styles ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
};

export default ContentRenderer;