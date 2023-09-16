import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BsCart3, BsFillCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { FaUserAlt } from "react-icons/fa";
import DashBoardGrid from "../../../admin/DashBoardGrid";
import DashBoardAreaChart from "../../../admin/DashBoardAreaChart";
import DashBoardPieChart from "../../../admin/DashBoardPieChart";
import DashBoardTable from "../../../admin/DashBoardTable";
import DashBoardList from "../../../admin/DashBoardList";

export default function SalesReport() {
  const token = localStorage.getItem("token");
  const [salesReportData, setSalesReportData] = useState({});
  const fetchSalesData = async () => {
    try {
      const salesData = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/sales-report`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (salesData.status === 200) {
        setSalesReportData(salesData.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);
  return (
    <div>
      <div className="flex gap-4 w-full">
        <DashBoardGrid
          data={salesReportData.totalTransaction}
          title="Total Sales"
          logo={<BsCart3 size={25} />}
        />
        <DashBoardGrid
          data={salesReportData.totalCompletedOrders}
          title="Total Completed Orders"
          logo={<BsFillCheckCircleFill size={25} />}
        />
        <DashBoardGrid
          data={salesReportData.totalCancelledOrders}
          title="Total Canceled Orders"
          logo={<BsXCircleFill size={25} />}
        />
        <DashBoardGrid
          data={salesReportData.totalUsers}
          title="Total Customers"
          logo={<FaUserAlt size={25} />}
        />
      </div>
      <div className="flex gap-2">
        <div className="w-full">
          <DashBoardAreaChart areaChartData={salesReportData.areaChart} />
        </div>
        <div className="w-5/12">
          <DashBoardPieChart pieChartData={salesReportData.pieChart} />
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <DashBoardTable tableData={salesReportData.lastTransactions}/>
        </div>
        <div className="w-5/12">
          <DashBoardList listData={salesReportData.topProducts}/>
        </div>
      </div>
    </div>
  );
}
