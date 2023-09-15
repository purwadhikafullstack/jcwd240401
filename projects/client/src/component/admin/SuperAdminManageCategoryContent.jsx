import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LuFolderOpen, LuFolderPlus } from "react-icons/lu";

import CustomHeader from "../CustomHeader";
import AllCategory from "../tab/superAdmin/category/AllCategory";
import CreateCategory from "../tab/superAdmin/category/CreateCategory";

export default function SuperAdminManageCategoryContent() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const activeTabParam = queryParams.get("tab");

    const [content, setContent] = useState(() => {
        if (activeTabParam === "create-category") {
            return <CreateCategory />;
        } else {
            return <AllCategory />;
        }
    });
    const title = "Manage Category";
    const tabList = [
        { name: "All Category", icon: <LuFolderOpen size={25} />, isActive: false, param: "all-category", tab: <AllCategory /> },
        { name: "Create Category", icon: <LuFolderPlus size={25} />, isActive: false, param: "create-category", tab: <CreateCategory /> },
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
