import React, { useEffect, useRef } from 'react';

interface LatexProps {
  children: string;
  block?: boolean;
}

const Latex: React.FC<LatexProps> = ({ children, block = false }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).katex) {
      try {
        (window as any).katex.render(children, containerRef.current, {
          throwOnError: false,
          displayMode: block,
        });
      } catch (e) {
        console.error("KaTeX error:", e);
        containerRef.current.innerText = children;
      }
    }
  }, [children, block]);

  return <span ref={containerRef} className={`${block ? 'block my-2' : ''}`} />;
};

export default Latex;
