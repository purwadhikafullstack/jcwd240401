import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

import getAllDiscountType from "../../../../api/promotion";
import InputField from "../../../InputField";
import Button from "../../../Button";
import CustomDropdown from "../../../CustomDropdown";

export default function CreateDiscount() {
  const [dataAllDiscountType, setDataAllDiscountType] = useState([]);
  const [createDiscount, setCreateDiscount] = useState({
    discount_type_id: "",
    amount: 0,
    expiredDate: "",
    branch_id: 1,
  });
  const fetchDataAllDiscountType = async () => {
    try {
      const response = await getAllDiscountType();
      let options = response.data.data.map((d) => ({
        label: d.type,
        value: d.id,
      }));
      setDataAllDiscountType(options);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllDiscountType();
  }, []);
  const handleChangeDropdown = (obj) => {
    console.log(obj);
    setCreateDiscount({ ...createDiscount, discount_type_id: obj.value });
  };

  const handleChangeAmount = (event) => {
    console.log(event.target.value);
    setCreateDiscount({ ...createDiscount, amount: event.target.value });
  };

  const handleChangeExpiredDate = (event) => {
    console.log(event.target.value);
    setCreateDiscount({ ...createDiscount, expiredDate: event.target.value });
  };

  const handleSubmit = () => {
    axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/admins/discounts`,
      createDiscount
    );
  };
  return (
    <div className="flex flex-col">
      <div>
        <form onSubmit={handleSubmit}>
          <div className="w-full">
            <label htmlFor="email" className="font-inter">
              Discount type:
            </label>
            <CustomDropdown
              options={dataAllDiscountType}
              onChange={handleChangeDropdown}
              placeholder={"--choose discount type--"}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-inter">
              Discount amount:
            </label>
            <InputField onChange={handleChangeAmount} />
          </div>
          <div>
            <label htmlFor="email" className="font-inter">
              Expired date
            </label>
            <InputField onChange={handleChangeExpiredDate} />
          </div>
          <Button
            condition={"positive"}
            label={"submit"}
            onClick={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
}
