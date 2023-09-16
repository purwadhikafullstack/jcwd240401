import React, { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const DashBoardAreaChart = () => {
  const options = {
    chart: {
      height: "100%",
      maxWidth: "100%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: "datetime", // Set x-axis type to datetime
      labels: {
        format: "dd/MM", // Customize date format as needed
      },
    },
    // Add your other options here...
  };

  const series = [
    {
      name: "New users",
      data: [
        [new Date("2023-09-01"), 6500],
        [new Date("2023-09-02"), 6418],
        [new Date("2023-09-03"), 6456],
        [new Date("2023-09-04"), 6526],
        [new Date("2023-09-05"), 6356],
        [new Date("2023-09-06"), 6456],
        [new Date("2023-09-07"), 6547],
      ],
      color: "#1A56DB",
    },
  ];

  useEffect(() => {
    if (
      document.getElementById("area-chart") &&
      typeof ApexCharts !== "undefined"
    ) {
      const chart = new ApexCharts(
        document.getElementById("area-chart"),
        options
      );
      chart.render();
    }
  }, []);

  return (
    <div
      className=" w-full bg-white rounded-lg shadow dark:bg-gray-800 mt-2 p-4 md:p-6"
      style={{ height: "400px" }}
    >
      <span>Judul</span>
      <div id="area-chart">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </div>
      {/* Other content */}
    </div>
  );
};

export default DashBoardAreaChart;
