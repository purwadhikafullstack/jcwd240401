import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LuFolderOpen, LuFolderPlus } from "react-icons/lu";

import CustomHeader from "../CustomHeader";
import AllProduct from "../tab/superAdmin/product/AllProduct";
import CreateProduct from "../tab/superAdmin/product/CreateProduct";


export default function SuperAdminManageProductContent() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const activeTabParam = queryParams.get("tab");

    const [content, setContent] = useState(() => {
        if (activeTabParam === "create-product") {
            return <CreateProduct />;
        } else {
            return <AllProduct />;
        }
    });
    const title = "Manage Product";
    const tabList = [
        { name: "All Product", icon: <LuFolderOpen size={25} />, isActive: false, param: "all-product", tab: <AllProduct /> },
        { name: "Create Product", icon: <LuFolderPlus size={25} />, isActive: false, param: "create-product", tab: <CreateProduct /> },
    ];
    return (
        <div className="flex flex-col w-9/12 py-4">
            <div>
                <CustomHeader titleContent={title} tabContent={tabList} setContent={setContent} />
            </div>
            <div className=" py-4">{content}</div>
        </div>
    );
}
