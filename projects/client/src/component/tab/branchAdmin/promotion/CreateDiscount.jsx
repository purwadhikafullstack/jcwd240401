import React, { useEffect } from "react";
import allDiscountTypes from "../../../../api/promotion";

export default function CreateDiscount() {
  useEffect(() => {
    allDiscountTypes();
  }, []);
  return (
    <div className="flex flex-col">
      <div>hihi</div>
      <div>haha</div>
    </div>
  );
}
