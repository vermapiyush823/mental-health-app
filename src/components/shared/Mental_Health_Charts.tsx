"use client";
import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";


interface MentalHealthChartProps {
  chartData: {
    id: string;
    color: string;
    data: { x: string; y: number }[];
  }[];
}
const MentalHealthChart = ({chartData}: MentalHealthChartProps) => {
  const [chartHeight, setChartHeight] = useState(300); // Default height
  
  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 768 ? 200 : 300); // Smaller chart for mobile
    };

    handleResize(); // Call on mount
    window.addEventListener("resize", handleResize); // Listen to resize events

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return (
    <div style={{ height: chartHeight, width: "100%" }}>
      <ResponsiveLine
        data={chartData} // Use the prop directly instead of local state
        margin={{ top: 20, right: 20, bottom: 50, left: 40 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: 10, stacked: false }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          tickValues: [0, 2, 4, 6, 8, 10],
        }}
        colors={["#8884d8"]}
        lineWidth={3}
        enablePoints={true}
        pointSize={8}
        pointColor="#8884d8"
        pointBorderWidth={2}
        curve="natural"
        enableGridX={false}
        enableGridY={true}
        enableArea={true}
        areaOpacity={0.5}
        useMesh={true}
        defs={[
          {
            id: "gradient",
            type: "linearGradient",
            colors: [
              { offset: 0, color: "#8884d8", opacity: 0.4 },
              { offset: 100, color: "#8884d8", opacity: 0 },
            ],
          },
        ]}
        fill={[{ match: "*", id: "gradient" }]}
      />
    </div>
  );
};

export default MentalHealthChart;
