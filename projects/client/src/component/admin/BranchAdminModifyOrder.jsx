import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as yup from "yup";
import dayjs from 'dayjs'
import Label from '../Label'
import rupiah from '../../helpers/rupiah'
import Button from '../Button'
import InputField from '../InputField'
import Modal from '../Modal';
import handleImageError from '../../helpers/handleImageError';
import AlertHelper from '../AlertHelper';
import { modifyOrderByAdmin, changeOrderStatus, cancelByAdmin } from '../../api/transaction';
import { orderStatusLabelColor } from '../../helpers/labelColor';
import { fileMaxSize } from "../../helpers/validationSchema/fileMaxSize";

export default function BranchAdminModifyOrder() {
  const [orderData, setOrderData] = useState([])
  const [cancel, setCancel] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token")

  const order = async () => {
    try {
      const response = await modifyOrderByAdmin(id, token)
      if (response.data) {
        setOrderData(response.data.data)
      } else {
        setOrderData([])
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response?.data?.message)
        console.log(error)
      }
    }
  }
  useEffect(() => {
    order()
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [successMessage, errorMessage])

  const handleChangeStatus = async (action) => {
    try {
      const response = await changeOrderStatus(id, action, token)
      if (response.status === 200) {
        setSuccessMessage(response.data.message)
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response?.data?.message)
        console.log(error)
      }
    }
  }

  const handleSubmit = async (values, { setSubmitting, resetForm, initialValues, setFieldValue }) => {
    setSubmitting(true)
    const { cancelReason, file } = values;
    const formData = new FormData();
    if (cancelReason) { formData.append('cancelReason', cancelReason); }
    if (file) { formData.append('file', file); }

    try {
      const response = await cancelByAdmin(id, formData, token)
      if (response.status === 200) {
        resetForm({ values: initialValues })
        setErrorMessage("")
        setSubmitting(false)
        setCancel(false)
        setSuccessMessage(response.data?.message)
        setFieldValue("file", null)
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response?.data?.message)
        setSubmitting(false)
        resetForm()
        console.log(error)
      }
    }
  }

  const cancelationSchema = yup.object().shape({
    cancelReason: yup.string().required("Cancelation reason is required"),
    file: fileMaxSize(1024 * 1024).required("Refund proof is required"),
  })

  function preview(event) {
    const file = event.target.files[0];
    if (file === undefined) {
      setImagePreview(null)
    } else {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }

  return (
    <div className="py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto">
      <div className='flex lg:pt-10'>
        <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
        <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify Order</div>
      </div>
      <div className='w-full'>
        <div className="py-6 space-y-6 px-10 font-inter">
          <div className='w-full flex justify-center'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Invoice Code
            <p className="text-black">{orderData?.invoiceCode}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Order Date
            <p className="text-black">{dayjs(orderData?.orderDate).format("DD/MM/YYYY")}</p>
          </div>
          <div className="text-base flex flex-col justify-start items-start text-darkgrey border-b-2 pb-2">
            Order Status
            <p className="text-black"><Label text={orderData?.orderStatus} labelColor={orderStatusLabelColor(orderData?.orderStatus)} /></p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Buyer
            <p className="text-black">{orderData?.User?.name}</p>
            <p className="text-black">{orderData?.User?.email}</p>
            <p className="text-black">{orderData?.User?.phone}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Receiver
            <p className="text-black">{orderData?.receiver}</p>
            <p className="text-black">{orderData?.contact}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Address
            <p className="text-black">{orderData?.addressLabel}</p>
            <p className="text-black">{`${orderData?.addressStreetName}, ${orderData?.addressCity}, ${orderData?.addressProvince}, ${orderData?.postalCode}`}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Items
            {orderData?.Branch_Products?.map((product) => (
              <div className='my-2 flex gap-2 font-inter'>
                <div className='h-24 w-24 flex items-center'>
                  <img className='shadow-md rounded-md' src={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} alt="product image" onError={handleImageError} />
                </div>
                <div>
                  <p className="text-black font-bold">{product.Product?.name}</p>
                  <p className="text-black">Qty: {product.Order_Item?.quantity}</p>
                  <p className="text-black">Price/Qty: {rupiah(product.Product?.basePrice)}</p>
                  <p className="text-black">Discount: {product.Discount ? product.Discount?.discount_type_id === 1 ? `${product.Discount?.Discount_Type?.type}` : product.Discount?.discount_type_id === 2 ? `${product.Discount?.amount}% Discount` : `${rupiah(product.Discount?.amount)} Discount` : "-"}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Shipping
            <p className="text-black">Method: {orderData?.shippingMethod}</p>
            <p className="text-black">Cost: {rupiah(orderData?.shippingCost)}</p>
            <p className="text-black">Date: {dayjs(orderData?.shippingDate).format("DD/MM/YYYY")}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Voucher
            <p className="text-black">{orderData?.Voucher ? orderData.Voucher?.voucher_type_id === 1 ? `${orderData.Voucher?.Voucher_Type?.type}` : orderData.Voucher?.voucher_type_id === 2 ? `${orderData.Voucher?.amount}% Discount` : `${rupiah(orderData.Voucher?.amount)} Discount` : "-"}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Total
            <p className="text-black">{rupiah(orderData?.totalPrice)}</p>
          </div>
          {orderData.orderStatus === "Waiting for payment" ? (
            <div className="text-base text-darkgrey border-b-2 pb-2">
              Payment Proof
              <p>-</p>
            </div>
          ) : orderData?.orderStatus === "Waiting for payment confirmation" ? (
            <div className="text-base text-darkgrey border-b-2 pb-2 ">
              Payment Proof
              <div className='flex gap-4 items-end'>
                <div className="h-52 w-40 my-2">
                  <img src={`${process.env.REACT_APP_BASE_URL}${orderData?.imgPayment}`} alt="Refund Image" className='object-cover w-full h-full shadow-md rounded-md' onError={handleImageError} />
                </div>
                <div className='flex gap-1 mb-2'>
                  <Modal modalTitle={"Reject Payment"} toggleName={"Reject"} content={"Are you sure you want to reject this payment?"} buttonCondition={"negative"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={() => { handleChangeStatus("Waiting for payment") }} />
                  <Modal modalTitle={"Accept Payment"} toggleName={"Accept"} content={"Are you sure you want to accept this payment?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={() => { handleChangeStatus("Processing") }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-base text-darkgrey border-b-2 pb-2">
              Payment Proof
              <div className="h-52 w-40">
                <img src={`${process.env.REACT_APP_BASE_URL}${orderData?.imgPayment}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError} />
              </div>
            </div>
          )}
          {orderData.orderStatus === "Canceled" ? (
            <div className="text-base text-darkgrey border-b-2 pb-2">
              Cancelation Reason
              <p className="text-black">{orderData?.cancelReason}</p>
            </div>
          ) : null}
          {orderData.orderStatus === "Processing" ? !cancel ? (
            <div className='flex gap-2'>
              <button className='bg-reddanger px-4 mr-2 h-10 rounded-lg text-white text-base w-40' onClick={() => { setCancel(true) }}>Cancel Order</button>
              <div className='w-40'><Modal modalTitle={"Deliver Order"} toggleName={"Deliver Order"} content={"Are you sure you want to deliver this order?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={() => { handleChangeStatus("Delivering") }} /></div>
            </div>
          ) : null : null}
          {cancel ? (
            <Formik initialValues={{ cancelReason: "", file: null, }} validationSchema={cancelationSchema} onSubmit={handleSubmit}>
              {(props) => (
                <Form>
                  <div className="text-base text-darkgrey border-b-2 pb-2">
                    Cancel Order
                    <div className='text-black'>
                      Are you sure you want to cancel the order? If so, please input your cancelation reason and refund image
                    </div>
                    <div className='w-72 text-black mt-2 flex flex-col gap-1'>
                      Cancelation Reason
                      <InputField value={props.values.cancelReason} name="cancelReason" id={"cancelReason"} type={"string"} onChange={props.handleChange} />
                    </div>
                    <div className='flex flex-col mt-2 text-black gap-1'>
                      Refund Image
                      {(imagePreview) ? (
                        <img
                          id="frame"
                          className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
                          src={imagePreview}
                          onError={handleImageError}
                          alt="Refund proof"
                        />
                      ) : (
                        <img
                          className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
                          src={""}
                          onError={handleImageError}
                          alt="/"
                        />
                      )}
                      <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} />
                    </div>
                    <div className='flex mt-4 w-3/4'>
                      <Button condition={"negative"} label={"Continue Processing"} onClick={() => { setCancel(false) }} />
                      <Button condition={"positive"} label={"Cancel Order"} onClick={props.handleSubmit} isDisabled={!props.dirty || !props.isValid} />
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          ) : null}
          {orderData.imgRefund ? (
            <div className="text-base text-darkgrey border-b-2 pb-2">
              Refund Image
              <div className="h-52 w-40">
                <img src={`${process.env.REACT_APP_BASE_URL}${orderData?.imgRefund}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
