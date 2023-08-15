import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Formik } from "formik";
import * as yup from "yup";

import getAllDiscountType from "../../../../api/promotion";
import InputField from "../../../InputField";
import CustomDropdown from "../../../CustomDropdown";
import Modal from "../../../Modal";

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

  const handleChange = (event, inputField) => {
    setCreateDiscount({ ...createDiscount, [inputField]: event.target.value });
  };

  const handleSubmit = () => {
    axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/admins/discounts`,
      createDiscount
    );
  };

  const createDiscountSchema = yup
    .object()
    .shape({
      amount: yup
        .number()
        .typeError("age must be a number")
        .positive("age must be greater than zero")
        .required("age is required"),
    });
  return (
    <div className="flex flex-col">
      <div>
        <Formik
          initialValues={{
            discount_type_id: "",
            amount: 0,
            expiredDate: "",
            branch_id: 1,
          }}
          validationSchema={createDiscountSchema}
          onSubmit={handleSubmit}
        >
          {(props) => (
            <form onSubmit={handleSubmit}>
              <div className="w-full">
                <label htmlFor="type" className="font-inter">
                  Discount type:
                </label>
                <CustomDropdown
                  options={dataAllDiscountType}
                  onChange={handleChangeDropdown}
                  placeholder={"--choose discount type--"}
                />
              </div>
              {createDiscount.discount_type_id == 2 ||
              createDiscount.discount_type_id == 3 ? (
                <div>
                  <label htmlFor="amount" className="font-inter">
                    Discount amount:
                  </label>
                  <InputField onChange={(e) => handleChange(e, "amount")} />
                  {props.errors.amount && props.touched.amount && (
                    <div className="text-reddanger absolute top-12">
                      {props.errors.amount}
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              <div>
                <label htmlFor="date" className="font-inter">
                  Expired date
                </label>
                <InputField onChange={(e) => handleChange(e, "expiredDate")} />
              </div>
              <Modal
                modalTitle={"Create Discount"}
                toggleName={"Create Discount"}
                content={`Are you sure to create this category?`}
                buttonCondition={"positive"}
                buttonLabelOne={"Cancel"}
                buttonLabelTwo={"Yes"}
                buttonTypeOne={"button"}
                buttonTypeTwo={"submit"}
                onClickButton={handleSubmit}
              />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
