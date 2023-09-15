import React, {useState, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as yup from "yup";
import axios from 'axios'
import dayjs from 'dayjs'
import Label from '../Label'
import rupiah from '../../helpers/rupiah'
import Button from '../Button'
import InputField from '../InputField'
import Modal from '../Modal';
import AlertPopUp from '../AlertPopUp';

export default function BranchAdminModifyOrder() {
  const [orderData, setOrderData] = useState([])
  const [cancel, setCancel] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [imagePreview, setImagePreview] = useState(null);
  const [showAlert, setShowAlert] = useState(false)
  const navigate = useNavigate()
  const {id} = useParams()
  const token = localStorage.getItem("token")

  const order = async() => {
    try{
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/order?orderId=${id}`, {
            headers: {'Authorization' : `Bearer ${token}`}
        })
        if(response.data){
            setOrderData(response.data.data)
        } else {
            setOrderData([])
        }
    }catch(error){
        if(error.response){
          setErrorMessage(error.response?.data?.message)
          console.log(error)
        }
    }
}
  useEffect(()=> {
    order()
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [successMessage, errorMessage])

  const handleImageError = (event) => {
    event.target.src =
        'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
};

const labelColor = (text) => {
  switch(text) {
      case "Waiting for payment":
          return "gray";
          break;
      case "Waiting for payment confirmation":
          return "purple";
          break;
      case "Processing":
          return "yellow";
          break;
      case "Delivering":
          return "blue";
          break;
      case "Order completed":
          return "green";
          break
      case "Canceled":
          return "red";
          break;
      default:
          return "";
          break;
  }
}
  const handleChangeStatus = async(action) => {
    try{
      const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/orders/${id}/${action}`, {}, {
        headers: {"Authorization" : `Bearer ${token}`}
      })
      if(response.status === 200){
        setSuccessMessage(response.data.message)
        handleShowAlert()
      }
    }catch(error){
      if(error.response){
        setErrorMessage(error.response?.data?.message)
        handleShowAlert()
        console.log(error)
      }
    }
  }

  const handleSubmit = async(values, { setSubmitting, resetForm, initialValues, setFieldValue }) => {
    setSubmitting(true)
    const { cancelReason, file } = values;
    const formData = new FormData();
    if (cancelReason) { formData.append('cancelReason', cancelReason); }
    if (file) { formData.append('file', file); }
    
    try{
      const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/orders/${id}`, formData, {
        headers: {'Authorization' : `Bearer ${token}`}
      })

      if(response.status === 200){
        resetForm({ values: initialValues })
        setErrorMessage("")
        setSubmitting(false)
        setCancel(false)
        setSuccessMessage(response.data?.message)
        setFieldValue("file", null)
        handleShowAlert()
      }
    }catch(error){
      if(error.response){
        setErrorMessage(error.response?.data?.message)
        setSubmitting(false)
        resetForm()
        handleShowAlert()
        console.log(error)
      }
    }
  }

  const cancelationSchema = yup.object().shape({
    cancelReason: yup.string().required("Cancelation reason is required")
  })

  function preview(event) {
    const file = event.target.files[0];
    if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    }
}
  const handleShowAlert = () => {
    setShowAlert(true)
    setTimeout(() => {
    setShowAlert(false)
    }, 4000)
  }

  const handleHideAlert = () => {
    setShowAlert(false)
  }

  return (
    <div className='w-full min-h-screen flex justify-center'>
      <div className="w-6/12 h-full my-8 flex flex-col gap-2">
        <div className='flex lg:pt-10'>
          <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
          <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify Order</div>
        </div>
        <div className='w-full'>
        <div className="py-6 space-y-6 px-10 font-inter">
          <div className='w-full flex justify-center'>
          {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert}/>) : (null)}
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Invoice Code
            <p className="text-black">{orderData?.invoiceCode}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Order Date
            <p className="text-black">{dayjs(orderData?.orderDate).format("DD/MM/YYYY")}</p>
          </div>
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Order Status
            <div className='flex gap-2 items-center'>
            <p className="text-black"><Label text={orderData?.orderStatus} labelColor={labelColor(orderData?.orderStatus)} /></p>
            {orderData.orderStatus === "Processing" ? (<div className='w-auto'><Modal modalTitle={"Deliver Order"} toggleName={"Deliver Order"} content={"Are you sure you want to deliver this order?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={()=>{handleChangeStatus("Delivering")}}/></div> ) : null}
            </div>
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
                  <img src={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProgduct}`} alt="product image" onError={handleImageError}/>
                </div>
                <div>
                  <p className="text-black font-bold">{product.Product?.name}</p>
                  <p className="text-black">Qty: {product.Order_Item?.quantity}</p>
                  <p className="text-black">Price/Qty: {rupiah(product.Product?.basePrice)}</p>
                  <p className="text-black">Discount: {product.Discount ? product.Discount?.discount_type_id === 1 ? `${product.Discount?.Discount_Type?.type}` : product.Discount?.discount_type_id === 2 ? `${product.Discount?.amount}% Discount` : `${rupiah(product.Discount?.amount)} Discount` : "-" }</p>
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
            <p className="text-black">{orderData?.Voucher ? orderData.Voucher?.voucher_type_id === 1 ? `${orderData.Voucher?.Voucher_Type?.type}` : orderData.Voucher?.voucher_type_id === 2 ? `${orderData.Voucher?.amount}% Discount` : `${rupiah(orderData.Voucher?.amount)} Discount` : "-" }</p>
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
          <div className="text-base text-darkgrey border-b-2 pb-2">
            Payment Proof
            <div className='flex gap-4 items-end'>
              <div className="h-52 w-40">
                <img src={`${process.env.REACT_APP_BASE_URL}${orderData?.imgRefund}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError}/>
              </div>
              <div className='flex gap-1'>
                <Modal modalTitle={"Reject Payment"} toggleName={"Reject"} content={"Are you sure you want to reject this payment?"} buttonCondition={"negative"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={()=>{handleChangeStatus("Waiting for payment")}}/>
                <Modal modalTitle={"Accept Payment"} toggleName={"Accept"} content={"Are you sure you want to accept this payment?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={()=>{handleChangeStatus("Processing")}}/>
              </div>
            </div>
          </div>
          ) : (
            <div className="text-base text-darkgrey border-b-2 pb-2">
            Payment Proof
            <div className="h-52 w-40">
              <img src={`${process.env.REACT_APP_BASE_URL}${orderData?.imgRefund}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError}/>
            </div>
          </div>
          )}
          {orderData.orderStatus === "Canceled" ? (
            <div className="text-base text-darkgrey border-b-2 pb-2">
            Cancelation Reason
            <p className="text-black">{orderData?.cancelReason}</p>
          </div>
          ) : null}
          {orderData.orderStatus === "Processing" ? !cancel ? (<button className='bg-reddanger px-4 mr-2 h-10 rounded-lg text-white text-base w-40' onClick={()=> {setCancel(true)}}>Cancel Order</button>) : null : null}
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
              <InputField value={props.values.cancelReason} name="cancelReason" id={"cancelReason"} type={"string"} onChange={props.handleChange}/>
            </div>
            <div className='flex flex-col mt-2 text-black gap-1'>
              Refund Image
                {(imagePreview) ? (
                  <img
                    id="frame"
                    className="h-52 w-40 object-cover"
                    src={imagePreview}
                    onError={handleImageError}
                    alt="/"
                  />
                ) : (null)}
              <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} />
            </div>
            <div className='flex mt-4 w-3/4'>
              <Button condition={"negative"} label={"Continue Processing"} onClick={() => {setCancel(false)}}/>
              <Button condition={"positive"} label={"Cancel Order"} onClick={props.handleSubmit}/>
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
                <img src={`${process.env.REACT_APP_BASE_URL}${orderData?.imgRefund}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError}/>
              </div>
            </div>
          ) : null}
        </div>
        </div>
      </div>
    </div>
  )
}
