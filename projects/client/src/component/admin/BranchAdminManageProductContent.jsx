import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';
import { LuFolderOpen, LuFolderPlus } from "react-icons/lu"

import CustomHeader from "../CustomHeader"
import AllBranchProduct from '../tab/branchAdmin/product/AllBranchProduct';
import CreateBranchProduct from '../tab/branchAdmin/product/CreateBranchProduct';

export default function BranchAdminManageProductContent() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const activeTabParam = queryParams.get("tab");

    const [content, setContent] = useState(() => {
        if (activeTabParam === "create-branch-product") {
            return <CreateBranchProduct />;
        } else {
            return <AllBranchProduct />;
        }
    });

    const title = "Manage Branch Product";
    const tabList = [
        { name: "My Branch Product", icon: <LuFolderOpen size={25} />, isActive: false, param: "my-branch-product", tab: <AllBranchProduct /> },
        { name: "Create Branch Product", icon: <LuFolderPlus size={25} />, isActive: false, param: "create-branch-product", tab: <CreateBranchProduct /> },
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
