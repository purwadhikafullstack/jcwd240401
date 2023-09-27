import React, { useState, useEffect } from "react";
import Label from "./Label";
import rupiah from "../helpers/rupiah";
import { getBranchProductById } from "../api/branchProduct";
import handleImageError from "../helpers/handleImageError";

export default function ModalBranchProduct({ branchProductId, onClose }) {
    const [selectedProduct, setSelectedProduct] = useState({})
    const token = localStorage.getItem("token")
    const getProductDetails = async () => {
        try {
            const response = await getBranchProductById(token, branchProductId)
            if (response.data) {
                setSelectedProduct(response.data.data)
            }
        } catch (error) {
            console.warn(error);
        }
    }

    useEffect(() => {
        getProductDetails()
    }, [])

    function getLabelColor(status) {
        switch (status) {
            case "empty":
                return "red";
            case "restock":
                return "blue";
            case "ready":
                return "green";
            default:
                return "red";
        }
    }

    return (
        <div id="staticModal" tabIndex={-1} aria-hidden="true" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-opacity-50 bg-gray-900 z-50" >
            <div className="relative w-full max-w-2xl max-h-full mx-3">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Branch Product Details
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
                    <div className="py-6 space-y-6 px-10 max-h-[500px] overflow-y-auto">
                        <div className="text-base text-darkgrey border-b-2 pb-2 md:hidden">
                            Image:
                            <img
                                className="w-28 h-28 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
                                src={`${process.env.REACT_APP_BASE_URL}${selectedProduct?.Product?.imgProduct}`}
                                onError={handleImageError}
                                alt="/"
                            />
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Stock:
                            <p className="text-black text-base">{selectedProduct?.quantity}</p>
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Status:
                            <p className="text-black w-fit text-base"> <Label labelColor={getLabelColor(selectedProduct?.status)} text={selectedProduct?.status} /></p>
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Origin:
                            <p className="text-black text-base">{selectedProduct?.origin}</p>
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Description:
                            <p className="text-black text-base">{selectedProduct?.Product?.description}</p>
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Storage Instruction:
                            <p className="text-black text-base">{selectedProduct?.Product?.storageInstruction}</p>
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Storage Period:
                            <p className="text-black text-base">{selectedProduct?.Product?.storagePeriod}</p>
                        </div>
                        <div className="text-sm text-darkgrey border-b-2 pb-2">
                            Discount:
                            <p className="text-black text-base"> {selectedProduct.discount_id &&
                                selectedProduct?.Discount?.isExpired === false ? (
                                selectedProduct.Discount.discount_type_id === 2 ? (<>{selectedProduct.Discount.amount}% off </>) : selectedProduct.Discount.discount_type_id === 3 ? (<> {rupiah(selectedProduct.Discount.amount)} off  </>) : "Buy One Get One"
                            ) : (
                                "-"
                            )}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
