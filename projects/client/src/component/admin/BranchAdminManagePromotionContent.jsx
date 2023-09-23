import React from "react";
import { useState } from "react";
import { CiDiscount1 } from "react-icons/ci";
import { MdOutlineDiscount } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import CustomHeader from "../CustomHeader";
import Discount from "../tab/branchAdmin/promotion/Discount";
import Voucher from "../tab/branchAdmin/promotion/Voucher";

export default function BranchAdminManagePromotionContent() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTabParam = queryParams.get("tab");

  const [content, setContent] = useState(() => {
    if (activeTabParam === "my-discount") {
      return <Discount />;
    } else {
      return <Voucher />;
    }
  });
  const title = "Manage Promotion";
  const tabList = [
    {
      name: "My Discount",
      icon: <CiDiscount1 size={25} />,
      isActive: false,
      param: "my-discount",
      tab: <Discount />,
    },
    {
      name: "My Voucher",
      icon: <MdOutlineDiscount size={25} />,
      isActive: false,
      param: "my-voucher",
      tab: <Voucher />,
    },
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
