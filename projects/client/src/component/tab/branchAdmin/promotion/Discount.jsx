import React, { useState } from "react";
import CustomAccordion from "../../../CustomAccordion";
import AllDiscount from "../../../accordion/promotion/AllDiscount";
import CreateDiscount from "../../../accordion/promotion/CreateDiscount";

export default function Discount() {
  const [activeTab, setActiveTab] = useState("all");

  const handleTabClick = (name) => {
    setActiveTab((prevTab) => (prevTab === name ? '' : name));
  };

  return (
    <>
      <CustomAccordion
        activeTab={activeTab}
        tabId="create"
        title="Create New Discount"
        onClick={handleTabClick}
      >
        <CreateDiscount />
      </CustomAccordion>
      <CustomAccordion
        activeTab={activeTab}
        tabId="all"
        title="All Discount"
        onClick={handleTabClick}
      >
        <AllDiscount />
      </CustomAccordion>
    </>
  );
}
