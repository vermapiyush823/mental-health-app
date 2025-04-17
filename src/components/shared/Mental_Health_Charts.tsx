"use client";
import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "next-themes";

interface MentalHealthChartProps {
  chartData: {
    id: string;
    color: string;
    data: { x: string; y: number }[];
  }[];
}

const MentalHealthChart = ({ chartData }: MentalHealthChartProps) => {
  const [chartHeight, setChartHeight] = useState(300); 
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setChartHeight(window.innerWidth < 768 ? 200 : 300); 
    };

    handleResize(); // Call on mount
    window.addEventListener("resize", handleResize); 

    return () => window.removeEventListener("resize", handleResize); 
  }, []);

  // Use isDarkMode only if component is mounted
  const isDarkMode = mounted && resolvedTheme === 'dark';

  // Define theme-specific colors with safe defaults for SSR
  const lineColor = mounted ? (isDarkMode ? "#a78bfa" : "#8884d8") : "#8884d8"; // Use light mode as default SSR color
  const gradientStartOpacity = mounted ? (isDarkMode ? 0.3 : 0.4) : 0.4;
  const tickColor = mounted ? (isDarkMode ? "#d1d5db" : "#4b5563") : "#4b5563"; 
  const gridColor = mounted ? (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)") : "rgba(0, 0, 0, 0.1)";
  
  // Early return for SSR
  if (!mounted) {
    // Return a container with the same dimensions to prevent layout shift
    return <div style={{ height: 300, width: "100%" }} className="bg-gray-50 rounded animate-pulse" />;
  }

  return (
    <div 
      style={{ height: chartHeight, width: "100%", overflow: "visible" }}
      className="transition-colors duration-300"
    >
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 0, bottom: 50, left: 40 }} 
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: 10, stacked: false }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
          tickRotation: -30,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          tickValues: [0, 2, 4, 6, 8, 10],
        }}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: tickColor,
              },
            },
          },
          grid: {
            line: {
              stroke: gridColor,
            },
          },
          tooltip: {
            container: {
              background: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            },
          },
        }}
        colors={[lineColor]}
        lineWidth={3}
        enablePoints={true}
        pointSize={8}
        pointColor={lineColor}
        pointBorderWidth={2}
        pointBorderColor={isDarkMode ? { from: 'color', modifiers: [['darker', 0.3]] } : { from: 'color', modifiers: [['darker', 0.5]] }}
        curve="natural"
        enableGridX={false}
        enableGridY={true}
        gridYValues={[0, 2, 4, 6, 8, 10]}
        enableArea={true}
        areaOpacity={0.5}
        useMesh={true}
        defs={[
          {
            id: "gradient",
            type: "linearGradient",
            colors: [
              { offset: 0, color: lineColor, opacity: gradientStartOpacity },
              { offset: 100, color: lineColor, opacity: 0 },
            ],
          },
        ]}
        fill={[{ match: "*", id: "gradient" }]}
      />
    </div>
  );
};

export default MentalHealthChart;
