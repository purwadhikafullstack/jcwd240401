import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";

import ModalCancelOrder from "../../ModalCancelOrder";
import Modal from "../../Modal";
import { fileMaxSize } from "../../../helpers/validationSchema/fileMaxSize";

const paymentSchema = yup.object().shape({
  file: fileMaxSize(1024 * 1024).required("payment proof is required"),
});


const PaymentForm = ({ handleSubmit, id, handleCancel }) => {
  return (
    <Formik
      enableReinitialize
      initialValues={{ file: null }}
      validationSchema={paymentSchema}
      onSubmit={handleSubmit}
    >
      {(props) => (
        <Form>
          <div className="flex flex-col gap-2 py-4 mb-4">
            <label htmlFor="file" className="font-medium">
              Payment Proof
              <span className="text-sm font-normal"> (.jpg, .jpeg, .png) max. 1MB </span>
              <span className="text-reddanger font-normal">*required</span>
            </label>
            <div className="relative">
              <input
                className="border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0"
                type="file"
                id="file"
                name="file"
                onChange={(e) => {
                  props.setFieldValue("file", e.currentTarget.files[0]);
                }}
                required
              />
              {props.errors.file && props.touched.file && (
                <div className="text-sm text-reddanger absolute top-12">
                  {props.errors.file}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row">
            <ModalCancelOrder onSubmit={(e) => handleCancel(e, id)} />
            <Modal
              isDisabled={!props.dirty || !props.values.file || !props.isValid}
              modalTitle={"Confirm Payment"}
              toggleName={"Confirm Payment"}
              content={
                "By uploading this payment proof, we will proceed your order. Are you sure?"
              }
              buttonCondition={"positive"}
              buttonLabelOne={"Cancel"}
              buttonLabelTwo={"Yes"}
              buttonTypeOne={"button"}
              buttonTypeTwo={"submit"}
              onClickButton={props.handleSubmit}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PaymentForm;
