import React, { useState } from 'react'
import CustomHeader from '../CustomHeader'
import AllBranch from '../tab/superAdmin/branch/AllBranch'
import CreateBranch from '../tab/superAdmin/branch/CreateBranch'
import { LuFolderOpen, LuFolderPlus } from "react-icons/lu"


export default function SuperAdminManageBranchContent() {
    const [content, setContent] = useState(<AllBranch />);
    const title = "Manage Branch";
    const tabList = [
        { name: "All Branch", icon: <LuFolderOpen size={25} />, isActive: false, param: "all-branch", tab: <AllBranch /> },
        { name: "Create Branch", icon: <LuFolderPlus size={25} />, isActive: false, param: "create-branch", tab: <CreateBranch /> }
    ];
    return (
        <div className="flex flex-col w-9/12 py-4">
            <div>
                <CustomHeader titleContent={title} tabContent={tabList} setContent={setContent} />
            </div>
            <div className=" py-4">{content}</div>
        </div>
    )
}
