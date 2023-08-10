import React from "react";
import { useState } from "react";

import CustomHeader from "../CustomHeader";
import CreateDiscount from "../tab/branchAdmin/promotion/CreateDiscount";
import AllDiscount from "../tab/branchAdmin/promotion/AllDiscount";
import CreateVoucher from "../tab/branchAdmin/promotion/CreateVoucher";
import AllVoucher from "../tab/branchAdmin/promotion/AllVoucher";

export default function BranchAdminManagePromotionContent() {
  const [content, setContent] = useState(<AllDiscount />);
  const title = "Manage Promotion";
  const tabList = [
    { name: "My Discount", icon: "", isActive: false, tab: <AllDiscount /> },
    {
      name: "Create Discount",
      icon: "",
      isActive: false,
      tab: <CreateDiscount />,
    },
    { name: "My Voucher", icon: "", isActive: false, tab: <AllVoucher /> },
    {
      name: "Create Voucher",
      icon: "",
      isActive: false,
      tab: <CreateVoucher />,
    },
  ];
  return (
    <div className="flex flex-col w-9/12 py-4">
      <div>
        <CustomHeader titleContent={title} tabContent={tabList} setContent={setContent}/>
      </div>
      <div className=" py-4">{content}</div>
    </div>
  );
}
