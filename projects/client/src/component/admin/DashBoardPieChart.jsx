import React from "react";
import ReactApexChart from "react-apexcharts";

const DashBoardPieChart = ({ pieChartData }) => {
  if (pieChartData) {
    // Extract courier names and percentages from pieChartData
    const courierData = pieChartData.map((data) => ({
      name: data.courier,
      percentage: data.percentage,
    }));

    // Extract labels and values for the chart
    const labels = courierData.map((data) => data.name);
    const values = courierData.map((data) => data.percentage);

    // Define the chart options outside the component
    const chartOptions = {
      colors: ["#1C64F2", "#16BDCA", "#9061F9"], // Customize colors as needed
      chart: {
        height: 300,
        type: "pie",
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      labels,
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
    };

    return (
      <div
        className="w-full bg-white rounded-lg shadow dark-bg-gray-800 mt-2 p-2 md:p-4"
        style={{ height: "400px" }}
      >
        <span>Courier Distribution</span>
        <div id="pie-chart">
          <ReactApexChart
            options={chartOptions}
            series={values}
            type="pie"
            height={300}
          />
        </div>
      </div>
    );
  }
};

export default DashBoardPieChart;
