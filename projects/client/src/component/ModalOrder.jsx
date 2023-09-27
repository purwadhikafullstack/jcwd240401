import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import rupiah from '../helpers/rupiah'
import Label from './Label'
import handleImageError from '../helpers/handleImageError'
import { orderByIdForAdmin } from '../api/transaction'

export default function ModalOrder({ orderId, onClose }) {
    const [selectedOrder, setSelectedOrder] = useState([])
    const token = localStorage.getItem("token")

    const order = async () => {
        try {
            const response = await orderByIdForAdmin(token, orderId)
            if (response.data) {
                setSelectedOrder(response.data.data)
            } else {
                setSelectedOrder([])
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.message)
            }
        }
    }

    useEffect(() => {
        order()
    }, [])

    const labelColor = (text) => {
        switch (text) {
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
    return (
        <div
            id="staticModal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-opacity-50 bg-gray-900 z-50 overflow-y-scroll"
        >
            <div className="relative w-full max-w-2xl max-h-full mx-3">
                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    {/* Modal header */}
                    <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Order Details
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="staticModal"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal body */}
                    <div className="py-6 space-y-6 px-10 font-inter max-h-[500px] overflow-y-auto">
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Invoice Code
                            <p className="text-black">{selectedOrder?.invoiceCode}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Order Date
                            <p className="text-black">{dayjs(selectedOrder?.orderDate).format("DD/MM/YYYY")}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2 flex flex-col justify-start items-start">
                            Order Status
                            <p className="text-black"><Label text={selectedOrder?.orderStatus} labelColor={labelColor(selectedOrder?.orderStatus)} /></p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Buyer
                            <p className="text-black">{selectedOrder?.User?.name}</p>
                            <p className="text-black">{selectedOrder?.User?.email}</p>
                            <p className="text-black">{selectedOrder?.User?.phone}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Receiver
                            <p className="text-black">{selectedOrder?.receiver}</p>
                            <p className="text-black">{selectedOrder?.contact}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Address
                            <p className="text-black">{selectedOrder?.addressLabel}</p>
                            <p className="text-black">{`${selectedOrder?.addressStreetName}, ${selectedOrder?.addressCity}, ${selectedOrder?.addressProvince}, ${selectedOrder?.postalCode}`}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Items
                            {selectedOrder?.Branch_Products?.map((product) => (
                                <div className='my-2 flex gap-2 font-inter'>
                                    <div className='h-24 w-24 flex items-center'>
                                        <img src={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} alt="product image" onError={handleImageError} />
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
                            <p className="text-black">Method: {selectedOrder?.shippingMethod}</p>
                            <p className="text-black">Cost: {rupiah(selectedOrder?.shippingCost)}</p>
                            <p className="text-black">Date: {dayjs(selectedOrder?.shippingDate).format("DD/MM/YYYY")}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Voucher
                            <p className="text-black">{selectedOrder?.Voucher ? selectedOrder.Voucher?.voucher_type_id === 1 ? `${selectedOrder.Voucher?.Voucher_Type?.type}` : selectedOrder.Voucher?.voucher_type_id === 2 ? `${selectedOrder.Voucher?.amount}% Discount` : `${rupiah(selectedOrder.Voucher?.amount)} Discount` : "-"}</p>
                        </div>
                        <div className="text-base text-darkgrey border-b-2 pb-2">
                            Total
                            <p className="text-black">{rupiah(selectedOrder?.totalPrice)}</p>
                        </div>
                        {selectedOrder.orderStatus === "Waiting for payment" || !selectedOrder.imgPayment ? (
                            <div className="text-base text-darkgrey border-b-2 pb-2">
                                Payment Proof
                                <p>-</p>
                            </div>
                        ) : (
                            <div className="text-base text-darkgrey border-b-2 pb-2">
                                Payment Proof
                                <div className='flex gap-4 items-end'>
                                    <div className="h-52 w-40">
                                        <img src={`${process.env.REACT_APP_BASE_URL}${selectedOrder?.imgPayment}`} alt="Payment proof" className='object-cover w-full h-full' onError={handleImageError} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedOrder.orderStatus === "Canceled" ? (
                            <div className="text-base text-darkgrey border-b-2 pb-2">
                                Cancelation Reason
                                <p className="text-black">{selectedOrder?.cancelReason}</p>
                            </div>
                        ) : null}
                        {selectedOrder.imgRefund ? (
                            <div className="text-base text-darkgrey border-b-2 pb-2">
                                Refund Image
                                <div className="h-52 w-40">
                                    <img src={`${process.env.REACT_APP_BASE_URL}${selectedOrder?.imgRefund}`} alt="Refund Image" className='object-cover w-full h-full' onError={handleImageError} />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}
