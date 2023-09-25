import React, { useState } from "react";

import CustomAccordion from "../../../CustomAccordion";
import ModifyProductDetails from "../../../accordion/product/ModifyProductDetails";
import ModifyProductStocks from "../../../accordion/product/ModifyProductStocks";

export default function ModifyBranchProduct({ branchProductId }) {
    const [activeTab, setActiveTab] = useState("stock");

    const handleTabClick = (name) => {
        setActiveTab((prevTab) => (prevTab === name ? '' : name));
    };
    return (
        <>
            <CustomAccordion
                activeTab={activeTab}
                tabId="stock"
                title="Modify Product's Stock"
                onClick={handleTabClick}
            >
                <ModifyProductStocks branchProductId={branchProductId} />
            </CustomAccordion>
            <CustomAccordion
                activeTab={activeTab}
                tabId="details"
                title="Modify Product's Details"
                onClick={handleTabClick}
            >
                <ModifyProductDetails branchProductId={branchProductId} />
            </CustomAccordion>
        </>
    )
}
