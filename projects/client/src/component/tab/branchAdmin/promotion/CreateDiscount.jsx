import React from "react";
import { useState, useEffect } from "react";
import getAllDiscountType from "../../../../api/promotion";
import InputField from "../../../InputField";

export default function CreateDiscount() {
  const [dataAllDiscountType, setDataAllDiscountType] = useState([]);
  const fetchDataAllDiscountType = async () => {
    try {
      const response = await getAllDiscountType();
      setDataAllDiscountType(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllDiscountType();
  }, []);
  return (
    <div className="flex flex-col">
      <div>haha</div>
      <div>
        <InputField />
      </div>
    </div>
  );
}
