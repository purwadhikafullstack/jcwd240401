import React from "react";
import { useState } from "react";

import CustomHeader from "../CustomHeader";
import SalesReport from "../tab/branchAdmin/report/SalesReport";
import StockReport from "../tab/branchAdmin/report/StockReport";

export default function BranchAdminReportContent() {
  const [content, setContent] = useState(<SalesReport />);
  const title = "Reports";
  const tabList = [
    {
      name: "Sale report",
      icon: "",
      isActive: false,
      tab: <SalesReport />,
    },
    {
      name: "Stock history",
      icon: "",
      isActive: false,
      tab: <StockReport />,
    },
  ];
  return (
    <div className="flex flex-col w-9/12 py-4">
      <div>
        <CustomHeader
          titleContent={title}
          tabContent={tabList}
          setContent={setContent}
        />
      </div>
      <div className=" py-4">{content}</div>
    </div>
  );
}
