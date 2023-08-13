import React from "react";
import { useState, useEffect } from "react";
import { getAllVoucherType } from "../../../../api/promotion";
import CustomDropdown from "../../../CustomDropdown";
import InputField from "../../../InputField";
import axios from "axios";
import Button from "../../../Button";

export default function CreateVoucher() {
  const [dataAllVoucherType, setDataAllVoucherType] = useState([]);
  const [createVoucher, setCreateVoucher] = useState({
    voucher_type_id: 0,
    branch_id: 1,
    isReferral: false,
    usedLimit: 0,
    amount: 0,
    expiredDate: "",
    minTransaction: "",
    maxDiscount: 0,
  });
  const fetchDataAllVoucherType = async () => {
    try {
      const response = await getAllVoucherType();
      let options = response.data.data.map((d) => ({
        label: d.type,
        value: d.id,
      }));
      setDataAllVoucherType(options);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllVoucherType();
  }, []);

  const handleChangeDropdown = (obj) => {
    console.log(obj);
    setCreateVoucher({ ...createVoucher, voucher_type_id: obj.value });
  };

  const handleChange = (event, fieldName) => {
    console.log(event.target.value);
    setCreateVoucher((data) => {
      let draft = { ...data };
      draft[fieldName] = event.target.value;
      return draft;
    });
  };

  const handleSubmit = () => {
    axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/admins/vouchers`,
      createVoucher
    );
  };
  return (
    <div className="flex flex-col">
      <div>
        <form onSubmit={handleSubmit}>
          <div className="w-full">
            <label htmlFor="email" className="font-inter">
              Voucher type:
            </label>
            <CustomDropdown
              options={dataAllVoucherType}
              onChange={handleChangeDropdown}
              placeholder={"--choose voucher type--"}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-inter">
              Voucher amount:
            </label>
            <InputField
              onChange={(e) => {
                handleChange(e, "amount");
              }}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-inter">
              Min. transaction:
            </label>
            <InputField
              onChange={(e) => {
                handleChange(e, "minTransaction");
              }}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-inter">
              Max Discount:
            </label>
            <InputField
              onChange={(e) => {
                handleChange(e, "maxDiscount");
              }}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-inter">
              Expired date:
            </label>
            <InputField
              onChange={(e) => {
                handleChange(e, "expiredDate");
              }}
            />
          </div>
          <div>
            <Button
              condition={"positive"}
              label={"submit"}
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
