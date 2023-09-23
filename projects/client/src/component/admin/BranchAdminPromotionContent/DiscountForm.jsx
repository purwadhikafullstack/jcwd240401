import React from "react";
import { Field, Formik } from "formik";
import InputField from "../../InputField";
import { Pagination } from "flowbite-react";
import Modal from "../../Modal";

export default function DiscountForm({
  initialValues,
  validationSchema,
  onSubmit,
  dataAllDiscountType,
  dataBranchProduct,
  currentPage,
  totalPage,
  onPageChange,
  handleShowAlert,
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(props) => (
        <form id="myDiscountForm">
          <div>
            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
              <div>
                <span className="text-xs text-reddanger">* required</span>
              </div>
              <label htmlFor="discount_type_id" className="">
                Select discount type:
                <span className="text-xs text-reddanger">*</span>
              </label>
              <div className="relative">
                <Field
                  as="select"
                  className="w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0"
                  name="discount_type_id"
                >
                  <option key="empty" value="">
                    --choose a discount type--
                  </option>
                  {dataAllDiscountType.map((data) => (
                    <option key={data.value} value={data.value}>
                      {data.label}
                    </option>
                  ))}
                </Field>
                {props.errors.discount_type_id &&
                  props.touched.discount_type_id && (
                    <div className="text-sm text-reddanger absolute top-12">
                      {props.errors.discount_type_id}
                    </div>
                  )}
              </div>
            </div>
          </div>
          {props.values.discount_type_id == 2 ||
          props.values.discount_type_id == 3 ? (
            <div>
              <label htmlFor="amount" className="font-inter">
                Discount amount:
                <span className="text-xs text-reddanger">*</span>
              </label>
              <InputField
                value={props.values.amount}
                id={"amount"}
                name="amount"
                onChange={props.handleChange}
              />
              {props.errors.amount && props.touched.amount && (
                <div className="text-reddanger top-12">
                  {props.errors.amount}
                </div>
              )}
            </div>
          ) : (
            ""
          )}

          <div>
            <label htmlFor="expiredDate" className="font-inter">
              Expired date
              <span className="text-xs text-reddanger">*</span>
            </label>
            <Field
              type="date"
              id="expiredDate"
              name="expiredDate"
              className="w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0"
            />
            {props.errors.expiredDate && (
              <div className="text-reddanger top-12">
                {props.errors.expiredDate}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="products" className="font-inter">
              choose products
              <span className="text-xs text-reddanger">*</span>
            </label>
            <br />
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {dataBranchProduct.map((data) => (
                <div role="group" aria-labelledby="checkbox-group">
                  <label>
                    <Field
                      type="checkbox"
                      name="products"
                      value={data.product_id}
                      className=" form-checkbox text-maindarkgreen rounded-sm mr-1 "
                      checked={props.values.products.includes(data.product_id)}
                      onChange={() => {
                        const updatedProducts = props.values.products.includes(
                          data.product_id
                        )
                          ? props.values.products.filter(
                              (id) => id !== data.product_id
                            )
                          : [...props.values.products, data.product_id];
                        props.setFieldValue("products", updatedProducts);
                      }}
                    />
                    {data.Product.name} [ {data.Product.weight}
                    {data.Product.unitOfMeasurement} / pack ]
                  </label>
                </div>
              ))}
              {props.errors.products && (
                <div className="text-reddanger top-12">
                  {props.errors.products}
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                onPageChange={onPageChange}
                showIcons
                layout="pagination"
                totalPages={totalPage}
                nextLabel="Next"
                previousLabel="Back"
                className="mx-auto"
              />
            </div>
          </div>
          <Modal
            modalTitle={"Create Discount"}
            toggleName={"Create Discount"}
            content={`Are you sure to create this voucher?`}
            buttonCondition={"positive"}
            buttonLabelOne={"Cancel"}
            buttonLabelTwo={"Yes"}
            buttonTypeOne={"button"}
            buttonTypeTwo={"submit"}
            onClickButton={props.handleSubmit}
          />
        </form>
      )}
    </Formik>
  );
}