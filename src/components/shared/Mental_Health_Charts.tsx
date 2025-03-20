import { ResponsiveLine } from '@nivo/line';

const data = [
  {
    id: "Spending",
    color: "hsl(200, 70%, 50%)",
    data: [
      { x: "Mon", y: 7 },
      { x: "Tue", y: 8 },
      { x: "Wed", y: 6 },
      { x: "Thu", y: 9 },
      { x: "Fri", y: 7 },
      { x: "Sat", y: 7.5 },
      { x: "Sun", y: 8 },
    ],
  },
];

const MentalHealthChart = () => {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 20, bottom: 50, left: 40 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: 10, stacked: false }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
        }}
        axisLeft={{
          tickSize: 0, // ✅ Removes the side Y-axis line
          tickPadding: 10,
          tickValues: [0, 2, 4, 6, 8, 10], // ✅ Show only 0, 2, 4, 6, 8, 10
        }}
        colors={["#8884d8"]}
        lineWidth={3}
        enablePoints={true}
        pointSize={8}
        pointColor="#8884d8"
        pointBorderWidth={2}
        curve='natural'
        legends={
          [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 40,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]
        }
        enableGridX={false}
        enableGridY={true}
        enableArea={true} // ✅ Enables the gradient area
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
        fill={[{ match: "*", id: "gradient" }]} // ✅ Applies gradient
      />
    </div>
  );
};

export default MentalHealthChart;
