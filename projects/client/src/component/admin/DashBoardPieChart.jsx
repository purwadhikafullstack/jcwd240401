import React, { useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const DashBoardPieChart = () => {
  // Define your series data
  const seriesData = [52.8, 26.8, 20.4];

  // Define the chart options outside the useEffect
  const getChartOptions = () => {
    return {
      series: seriesData,
      colors: ["#1C64F2", "#16BDCA", "#9061F9"],
      chart: {
        height: 300, // Adjust the height to make the chart smaller
        type: "pie",
      },
      legend: {
        position: "bottom", // Move legend to the bottom
        fontFamily: "Inter, sans-serif",
      },
      plotOptions: {
        pie: {
          labels: {
            show: true,
            position: "bottom", // Position the labels at the bottom
          },
          size: "80%", // Adjust the size of the pie chart
          dataLabels: {
            offset: -25,
          },
        },
      },
      labels: ["Direct", "Organic search", "Referrals"],
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return value + "%";
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value) {
            return value + "%";
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    };
  };

  return (
    <div className="w-full bg-white rounded-lg shadow dark-bg-gray-800 mt-2 p-2 md:p-4" style={{ height: "400px" }}>
        <span>Judul</span>
      <div id="pie-chart">
        <ReactApexChart
          options={getChartOptions()}
          series={seriesData}
          type="pie"
          height={300} // Match the chart height
        />
      </div>
    </div>
  );
};

export default DashBoardPieChart;
