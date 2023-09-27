import React, { useState } from 'react'
import CustomHeader from '../CustomHeader'
import OrderList from '../tab/branchAdmin/order/OrderList'
import { LuFolderOpen } from 'react-icons/lu';

export default function BranchAdminManageOrderContent() {
    const [content, setContent] = useState(<OrderList />);
    const title = "Manage Orders";
    const tabList = [
        { name: "Order List", icon: <LuFolderOpen size={25} />, isActive: false, tab: <OrderList /> },
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
