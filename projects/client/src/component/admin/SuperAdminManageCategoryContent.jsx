import React, { useState } from 'react';
import { LuFolderOpen, LuFolderPlus } from "react-icons/lu";

import CustomHeader from "../CustomHeader";
import AllCategory from "../tab/superAdmin/category/AllCategory";
import CreateCategory from "../tab/superAdmin/category/CreateCategory";

export default function SuperAdminManageCategoryContent() {
    const [content, setContent] = useState(<AllCategory />);
    const title = "Manage Category";
    const tabList = [
        { name: "My Category", icon: <LuFolderOpen size={25} />, isActive: false, tab: <AllCategory /> },
        { name: "Create Category", icon: <LuFolderPlus size={25} />, isActive: false, tab: <CreateCategory /> },
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
