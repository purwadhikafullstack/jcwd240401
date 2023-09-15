import React from "react";
import DashBoardGrid from "../../../admin/DashBoardGrid";
import DashBoardAreaChart from "../../../admin/DashBoardAreaChart";

export default function SalesReport() {
  return (
    <div>
      <div className="flex gap-4 w-full">
        <DashBoardGrid />
        <DashBoardGrid />
        <DashBoardGrid />
        <DashBoardGrid />
      </div>
      <div>
        <DashBoardAreaChart />
      </div>
    </div>
  );
}
