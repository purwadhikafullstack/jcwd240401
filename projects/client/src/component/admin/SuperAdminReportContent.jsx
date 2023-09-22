import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import CustomHeader from "../CustomHeader";
import SalesReport from "../tab/superAdmin/report/SalesReport";
import StockReport from "../tab/superAdmin/report/StockReport";

export default function SuperAdminReportContent() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTabParam = queryParams.get("tab");

  const [content, setContent] = useState(() => {
    if (activeTabParam === "sales-report") {
        return <SalesReport />;
    } else {
        return <StockReport />;
    }
});

  const title = "Reports";
  const tabList = [
    {
      name: "Sales report",
      icon: "",
      isActive: false,
      param: "sales-report",
      tab: <SalesReport />,
    },
    {
      name: "Stock history",
      icon: "",
      isActive: false,
      param: "stock-report",
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
