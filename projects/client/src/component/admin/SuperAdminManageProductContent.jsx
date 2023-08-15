import React, { useState } from 'react'
import CustomHeader from "../CustomHeader"
import { LuFolderOpen, LuFolderEdit, LuFolderPlus } from "react-icons/lu"
import AllProduct from "../tab/superAdmin/product/AllProduct"
import CreateProduct from "../tab/superAdmin/product/CreateProduct"
import ModifyProduct from "../tab/superAdmin/product/ModifyProduct"


export default function SuperAdminManageProductContent() {
    const [content, setContent] = useState(<AllProduct />);
    const title = "Manage Product";
    const tabList = [
        { name: "My Product", icon: <LuFolderOpen size={25} />, isActive: false, tab: <AllProduct /> },
        { name: "Create Product", icon: <LuFolderPlus size={25} />, isActive: false, tab: <CreateProduct /> },
        { name: "Modify Product", icon: <LuFolderEdit size={25} />, isActive: false, tab: <ModifyProduct /> },
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
