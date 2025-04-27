"use client";
import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { motion } from "framer-motion";
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
  
  // Add state to track clicked point for mobile/touch support
  const [clickedPoint, setClickedPoint] = useState<null | {
    x: number;
    y: number;
    data: { x: string; y: number };
    serieId: string;
  }>(null);
  
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setChartHeight(window.innerWidth < 768 ? 200 : 300);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  const lineColor = mounted ? (isDarkMode ? "#a78bfa" : "#8b5cf6") : "#8b5cf6";
  const gradientStartOpacity = mounted ? (isDarkMode ? 0.4 : 0.5) : 0.5;
  const tickColor = mounted ? (isDarkMode ? "#d1d5db" : "#4b5563") : "#4b5563";
  const gridColor = mounted ? (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)") : "rgba(0, 0, 0, 0.08)";
  const crosshairColor = mounted ? (isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)") : "rgba(0, 0, 0, 0.5)";

  // For SSR
  if (!mounted) {
    return <div style={{ height: 300, width: "100%" }} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />;
  }
  
  // Handle click on a point
  const handlePointClick = (point: any) => {
    // Toggle clicked point with proper null checking
    setClickedPoint(prevPoint => 
      prevPoint && prevPoint.data && point.data && prevPoint.data.x === point.data.x ? null : point
    );
  };
  
  // Create a custom slice tooltip component
  const CustomSliceTooltip = ({ slice }: any) => {
    return (
      <div
        style={{
          background: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          color: isDarkMode ? '#f3f4f6' : '#111827',
          fontSize: '14px',
          fontWeight: 500,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 92, 246, 0.2)',
          backdropFilter: 'blur(4px)',
          maxWidth: '200px',
          transform: 'translateY(-5px)',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {slice.points.map((point: any) => (
          <div
            key={point.id}
            style={{
              padding: '3px 0',
            }}
          >
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              marginBottom: '4px',
              color: isDarkMode ? '#d1d5db' : '#4b5563' 
            }}>
              {point.data.xFormatted || point.data.x}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: lineColor,
                borderRadius: '50%'
              }}></div>
              <div>
                <strong style={{ 
                  color: lineColor,
                  fontWeight: 600
                }}>
                  Mood:
                </strong>{" "}
                <span style={{ fontWeight: 500 }}>
                  {point.data.yFormatted || point.data.y}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height: chartHeight, position: 'relative' }} // Add position relative
      className={`transition-colors duration-300 rounded-xl ${isDarkMode ? 'bg-gray-800/90 shadow-lg border border-gray-700/50' : 'bg-white/90 shadow-xl border border-gray-100'} p-4`}
      onClick={() => clickedPoint && setClickedPoint(null)} // Hide tooltip when clicking outside
    >
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 10, bottom: 50, left: 40 }}
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
          // ...existing code...
          axis: {
            ticks: {
              text: {
                fill: tickColor,
                fontSize: 12,
                fontWeight: 500,
              },
            },
          },
          grid: {
            line: {
              stroke: gridColor,
            },
          },
          crosshair: {
            line: {
              stroke: crosshairColor,
              strokeWidth: 1,
              strokeDasharray: '5 5',
            },
          },
        }}
        colors={[lineColor]}
        lineWidth={3}
        enablePoints={true}
        pointSize={8}
        pointBorderColor={isDarkMode ? "#f3f4f6" : "#111827"}
        pointColor={isDarkMode ? "#a78bfa" : "#8b5cf6"}
        pointBorderWidth={1}
        curve="monotoneX"
        enableGridX={false}
        enableGridY={true}
        gridYValues={[0, 2, 4, 6, 8, 10]}
        enableArea={true}
        areaOpacity={0.5}
        
        /* Enhanced tooltip settings */
        useMesh={true}
        enableSlices="x"
        sliceTooltip={CustomSliceTooltip}
        onClick={(point, event) => {
          // Stop propagation to prevent the outer div's onClick from firing
          event.stopPropagation();
          handlePointClick(point);
        }}
        onMouseLeave={() => {
          // Optional: Hide clicked point when mouse leaves the chart
          // setClickedPoint(null);
        }}
        
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
        animate={true}
        motionConfig="stiff"
      />
      
    </motion.div>
  );
};

export default MentalHealthChart;
