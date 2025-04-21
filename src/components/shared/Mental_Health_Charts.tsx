"use client";
import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

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

  // Animation variants
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6 
      }
    }
  };

  // Define theme-specific colors with safe defaults for SSR
  const lineColor = mounted ? (isDarkMode ? "#a78bfa" : "#8b5cf6") : "#8b5cf6"; // More vibrant purple
  const gradientStartOpacity = mounted ? (isDarkMode ? 0.4 : 0.5) : 0.5;
  const tickColor = mounted ? (isDarkMode ? "#d1d5db" : "#4b5563") : "#4b5563"; 
  const gridColor = mounted ? (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)") : "rgba(0, 0, 0, 0.08)";
  const backgroundColor = mounted ? (isDarkMode ? "rgba(31, 41, 55, 0.4)" : "rgba(255, 255, 255, 0.8)") : "rgba(255, 255, 255, 0.8)";
  const crosshairColor = mounted ? (isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)") : "rgba(0, 0, 0, 0.5)";
  
  // Early return for SSR
  if (!mounted) {
    // Return a container with the same dimensions to prevent layout shift
    return <div style={{ height: 300, width: "100%" }} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={chartVariants}
      style={{ height: chartHeight, width: "100%", overflow: "visible" }}
      className={`transition-colors duration-300 rounded-xl ${isDarkMode ? 'bg-gray-800/90 shadow-lg border border-gray-700/50' : 'bg-white/90 shadow-xl border border-gray-100'} p-4`}
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
          tooltip: {
            container: {
              background: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 500,
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
        useMesh={true}
        enableCrosshair={true}
        crosshairType="bottom-left"
        // Removed duplicate theme attribute
        animate={true}
        motionConfig="stiff"
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
        layers={[
          'grid', 'axes', 'areas', 'lines', 'points', 'slices', 'mesh', 'legends',
        ]}
      />
    </motion.div>
  );
};

export default MentalHealthChart;
