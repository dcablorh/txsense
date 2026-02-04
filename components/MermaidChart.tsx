import React, { useEffect, useRef } from "react";

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && chart) {
      chartRef.current.removeAttribute("data-processed");
      try {
        // @ts-ignore
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            fontFamily: "Fredoka, sans-serif",
            primaryColor: "#ffffff",
            primaryTextColor: "#1a1a1a",
            primaryBorderColor: "#1a1a1a",
            lineColor: "#1a1a1a",
            secondaryColor: "#9B6DFF",
            tertiaryColor: "#FFD43B",
            edgeLabelBackground: "#ffffff",
            nodeBorder: "#1a1a1a",
            clusterBkg: "#f0faff",
          },
          flowchart: {
            curve: "basis",
            nodeSpacing: 50,
            rankSpacing: 50,
            padding: 20,
          },
        });
        // @ts-ignore
        window.mermaid.contentLoaded();
        // @ts-ignore
        window.mermaid.init(undefined, chartRef.current);
      } catch (err) {
        console.error("Mermaid error:", err);
      }
    }
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="overflow-x-auto w-full flex justify-center">
      <div className="mermaid flex justify-center py-4" ref={chartRef}>
        {chart}
      </div>
    </div>
  );
};

export default MermaidChart;
