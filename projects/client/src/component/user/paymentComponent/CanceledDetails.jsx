import React from 'react'
import handleImageError from '../../../helpers/handleImageError'

export default function CanceledDetails({orderStatus, orderData}) {
  return (
    <>
    {orderStatus === "Canceled" ? (
        <div className="flex flex-row items-center">
          <span className="text-maingreen font-semibold">Cancelation Reason:</span>
          <span className="mx-2">
            {orderData.data?.cancelReason}
          </span>
        </div>) : null}
    {orderData.data?.imgRefund ? (
        <div className=" text-maingreen font-semibold">
          Refund Proof:
          <div className="h-52 w-40">
            <img src={`${process.env.REACT_APP_BASE_URL}${orderData.data?.imgRefund}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError} />
          </div>
        </div>) : null}
    </>
  )
}
