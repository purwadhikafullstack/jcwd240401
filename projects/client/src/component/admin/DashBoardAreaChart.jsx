import React, { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const DashBoardAreaChart = ({areaChartData}) => {
  const options = {
    chart: {
      height: "100%",
      maxWidth: "100%",
      type: "bar",
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
      name: "Total Sales",
      data: areaChartData?.map((dataPoint) => [
        new Date(dataPoint.date).getTime(),
        dataPoint.totalPrice,
      ]),
      color: "#2E6930",
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
      <span>Transaction</span>
      <div id="area-chart">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
      {/* Other content */}
    </div>
  );
};

export default DashBoardAreaChart;
