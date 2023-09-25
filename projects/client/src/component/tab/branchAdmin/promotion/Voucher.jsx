import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomAccordion from "../../../CustomAccordion";
import AllVoucher from "../../../accordion/promotion/AllVoucher";
import CreateVoucher from "../../../accordion/promotion/CreateVoucher";

export default function Voucher() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTabParam = queryParams.get("accordian");

  const [activeTab, setActiveTab] = useState(activeTabParam || "all-voucher");

  const handleTabClick = (name) => {
    setActiveTab((prevTab) => (prevTab === name ? "" : name));
  };

  useEffect(() => {
    queryParams.set("accordian", activeTab);
    const newSearch = queryParams.toString();
    window.history.replaceState(null, "", `?${newSearch}`);
  }, [activeTab]);

  return (
    <>
      <CustomAccordion
        activeTab={activeTab}
        tabId="create-voucher"
        title="Create New Voucher"
        onClick={handleTabClick}
      >
        <CreateVoucher />
      </CustomAccordion>
      <CustomAccordion
        activeTab={activeTab}
        tabId="all-voucher"
        title="All Voucher"
        onClick={handleTabClick}
      >
        <AllVoucher />
      </CustomAccordion>
    </>
  );
}
