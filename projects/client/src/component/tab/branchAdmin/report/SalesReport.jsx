import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BsCart3, BsFillCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { FaUserAlt } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import DashBoardGrid from "../../../admin/DashBoardGrid";
import DashBoardAreaChart from "../../../admin/DashBoardAreaChart";
import DashBoardPieChart from "../../../admin/DashBoardPieChart";
import DashBoardTable from "../../../admin/DashBoardTable";
import DashBoardList from "../../../admin/DashBoardList";

export default function SalesReport() {
  const token = localStorage.getItem("token");
  const [salesReportData, setSalesReportData] = useState({});
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  const fetchSalesData = async () => {
    try {
      const salesData = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/sales-report?startDate=${params.get("startDate") || ""}&endDate=${params.get("endDate") || ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (salesData.status === 200) {
        setSalesReportData(salesData.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilterChange = (paramName, paramValue) => {
    const newFilter = new URLSearchParams(filter.toString());
    if (paramValue === "") {
      newFilter.delete(paramName);
    } else {
      newFilter.set(paramName, paramValue);
    }
    setFilter(newFilter);
    const params = new URLSearchParams(window.location.search);
    params.set(paramName, paramValue);
    navigate({ search: params.toString() });
  };

  useEffect(() => {
    fetchSalesData();
  }, [filter]);

  return (
    <div>
      <div className="mx-auto py-2 w-full lg:w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0"
            value={params.get("startDate") || ""}
            onChange={(e) => handleFilterChange(e.target.id, e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0"
            value={params.get("endDate") || ""}
            onChange={(e) => handleFilterChange(e.target.id, e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 w-full">
        <DashBoardGrid
          data={salesReportData.totalTransaction}
          title="Total Sales"
          logo={<AiFillDollarCircle size={30} className="text-[#ebd934]" />}
        />
        <DashBoardGrid
          data={salesReportData.totalCompletedOrders}
          title="Total Completed Orders"
          logo={<BsFillCheckCircleFill size={25} className="text-[#2E6930]" />}
        />
        <DashBoardGrid
          data={salesReportData.totalCancelledOrders}
          title="Total Canceled Orders"
          logo={<BsXCircleFill size={25} className="text-[#eb4034]" />}
        />
        <DashBoardGrid
          data={salesReportData.totalUsers}
          title="Total Customers"
          logo={<FaUserAlt size={25} className="text-[#3468eb]" />}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="w-full">
          <DashBoardAreaChart areaChartData={salesReportData.areaChart} />
        </div>
        <div className="w-full lg:w-5/12">
          <DashBoardPieChart pieChartData={salesReportData.pieChart} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 mt-2">
        <div className="w-full">
          <DashBoardTable tableData={salesReportData.lastTransactions} />
        </div>
        <div className="w-full lg:w-5/12">
          <DashBoardList listData={salesReportData.topProducts} />
        </div>
      </div>
    </div>
  );
}
