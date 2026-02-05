
import React, { useEffect, useState } from 'react';

interface MermaidChartProps { chart: string; }

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const renderChart = async () => {
      // @ts-ignore
      const mermaid = window.mermaid;
      if (!chart || !mermaid) return;

      try {
        setError(false);
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          themeVariables: {
            fontFamily: 'Fredoka, sans-serif',
            primaryColor: '#ffffff',
            primaryTextColor: '#1a1a1a',
            primaryBorderColor: '#1a1a1a',
            lineColor: '#1a1a1a',
            secondaryColor: '#9B6DFF',
            tertiaryColor: '#FFD43B',
            edgeLabelBackground: '#ffffff',
            nodeBorder: '#1a1a1a',
          },
          flowchart: {
            curve: 'basis',
            nodeSpacing: 50,
            rankSpacing: 50,
            padding: 20,
            htmlLabels: true
          }
        });

        // Clean up the input string - remove markdown code blocks if present
        const cleanChart = chart.replace(/```mermaid\n?|```/g, '').trim();
        
        // Generate a unique ID for each render to avoid collisions
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`;
        
        // Use the async render function (recommended for Mermaid v10+)
        const { svg: svgContent } = await mermaid.render(id, cleanChart);
        setSvg(svgContent);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(true);
      }
    };

    renderChart();
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="overflow-x-auto w-full flex justify-center min-h-[100px]">
      {error ? (
        <div className="p-4 bg-red-50 text-red-500 font-bold rounded-xl border-2 border-red-200 text-xs">
          Chart syntax error 🧩
        </div>
      ) : (
        <div 
          className="flex justify-center py-4 w-full" 
          dangerouslySetInnerHTML={{ __html: svg }} 
        />
      )}
    </div>
  );
};

export default MermaidChart;
