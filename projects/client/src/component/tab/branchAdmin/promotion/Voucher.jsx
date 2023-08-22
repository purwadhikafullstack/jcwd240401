import React, { useState } from "react";
import CustomAccordion from "../../../CustomAccordion";
import AllVoucher from "../../../accordion/promotion/AllVoucher";
import CreateVoucher from "../../../accordion/promotion/CreateVoucher";

export default function Voucher() {
  const [activeTab, setActiveTab] = useState("all");

  const handleTabClick = (name) => {
    setActiveTab((prevTab) => (prevTab === name ? "" : name));
  };

  return (
    <>
      <CustomAccordion
        activeTab={activeTab}
        tabId="create"
        title="Create New Voucher"
        onClick={handleTabClick}
      >
        <CreateVoucher />
      </CustomAccordion>
      <CustomAccordion
        activeTab={activeTab}
        tabId="all"
        title="All Voucher"
        onClick={handleTabClick}
      >
        <AllVoucher />
      </CustomAccordion>
    </>
  );
}
