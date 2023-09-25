import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomAccordion from "../../../CustomAccordion";
import AllDiscount from "../../../accordion/promotion/AllDiscount";
import CreateDiscount from "../../../accordion/promotion/CreateDiscount";

export default function Discount() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTabParam = queryParams.get("accordian");

  const [activeTab, setActiveTab] = useState(activeTabParam || "all-discount");

  const handleTabClick = (name) => {
    setActiveTab((prevTab) => (prevTab === name ? '' : name));
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
        tabId="create-discount"
        title="Create New Discount"
        onClick={handleTabClick}
      >
        <CreateDiscount />
      </CustomAccordion>
      <CustomAccordion
        activeTab={activeTab}
        tabId="all-discount"
        title="All Discount"
        onClick={handleTabClick}
      >
        <AllDiscount />
      </CustomAccordion>
    </>
  );
}
