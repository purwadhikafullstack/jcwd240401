import React from "react";
import { useState } from "react";

import CustomHeader from "../CustomHeader";
import Discount from "../tab/branchAdmin/promotion/Discount";
import Voucher from "../tab/branchAdmin/promotion/Voucher";

export default function BranchAdminManagePromotionContent() {
  const [content, setContent] = useState(<Discount />);
  const title = "Manage Promotion";
  const tabList = [
    {
      name: "My Discount",
      icon: "",
      isActive: false,
      tab: <Discount />,
    },
    { name: "My Voucher", icon: "", isActive: false, tab: <Voucher /> },
  ];
  return (
    <div className="flex flex-col w-9/12 py-4">
      <div>
        <CustomHeader
          titleContent={title}
          tabContent={tabList}
          setContent={setContent}
        />
      </div>
      <div className=" py-4">{content}</div>
    </div>
  );
}
