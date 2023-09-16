import React from "react";
import DashBoardGrid from "../../../admin/DashBoardGrid";
import DashBoardAreaChart from "../../../admin/DashBoardAreaChart";
import DashBoardPieChart from "../../../admin/DashBoardPieChart";
import DashBoardTable from "../../../admin/DashBoardTable";
import DashBoardList from "../../../admin/DashBoardList";

export default function SalesReport() {
  return (
    <div>
      <div className="flex gap-4 w-full">
        <DashBoardGrid />
        <DashBoardGrid />
        <DashBoardGrid />
        <DashBoardGrid />
      </div>
      <div className="flex gap-2">
        <div className="w-full">
          <DashBoardAreaChart />
        </div>
        <div className="w-5/12">
          <DashBoardPieChart />
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <DashBoardTable />
        </div>
        <div className="w-5/12">
          <DashBoardList />
        </div>
      </div>
    </div>
  );
}
