import React, { useState } from 'react'
import Button from './Button'
import { useSelector } from 'react-redux'
import AlertPopUp from './AlertPopUp'
import Label from './Label'
import rupiah from '../helpers/rupiah'

export default function ProductCard({ product, productName, productBasePrice, productDiscountPrice, productImg, latitude, outOfReach }) {
    const profile = useSelector((state) => state.auth.profile)
    const token = localStorage.getItem("token")
    const [showAlert, setShowAlert] = useState(false)
    const [content, setContent] = useState("")

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }

    const handleHideAlert = () => {
        setShowAlert(false)
    }

    const addToCartCondition = () => {
        if (!latitude || !token) {
            setContent("You need to log in first to add to cart")
            handleShowAlert()
        } else if (token && profile.status === false) {
            setContent("You need to verify your account first to add to cart")
            handleShowAlert()
        } else if (token && outOfReach) {
            setContent("Your location is out of reach, cannot add to cart")
            handleShowAlert()
        }
    }
    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };
    return (
        <>
            {showAlert ? (<div className="w-full fixed top-0 bottom-0 flex justify-center items-center bg-opacity-50 bg-gray-900 z-50"><AlertPopUp condition={"warn"} content={content} setter={handleHideAlert} className="w-72" /></div>) : (null)}
            <div className="sm:w-[250px] h-[350px] m-2 rounded-lg shadow-lg font-inter">
                <div className="relative">
                    {product.discount_id && product.Discount?.isExpired === false ? (<div className="absolute bottom-0 left-0 w-1/2 h-8 bg-reddanger z-10 rounded-tr-md flex justify-center text-sm items-center text-white font-inter">{product.Discount.discount_type_id === 1 ? "Buy 1 Get 1" : "Discount"}</div>) : null}
                    <img
                        className="sm:w-[250px] h-[200px] object-cover rounded-t-lg"
                        src={productImg}
                        alt="img"
                        onError={handleImageError}
                    />
                </div>
                <div className="grid grid-rows-2 items-start w-full h-[150px]">
                    <div className="flex flex-col font-semibold text-sm sm:text-base my-1 mx-2 justify-center content-center h-full">
                        {product.Product.name}
                        <div className='text-sm font-normal'>
                            {product.Product.weight}{product.Product.unitOfMeasurement} / pack
                        </div>
                    </div>
                    <div className="flex my-1 mx-auto justify-between w-full relative content-center h-full">
                        <div className='flex flex-col px-2 justify-center'>
                            {product.discount_id && product?.Discount?.isExpired === false ? (
                                <>
                                    {product.Discount.discount_type_id === 1 ? (
                                        <div className="text-reddanger font-bold">{rupiah(product.Product.basePrice)}</div>
                                    ) : product.Discount.discount_type_id === 2 ? (
                                        <><div className="text-reddanger font-bold">{rupiah(product.Product.basePrice - (product.Product.basePrice * product.Discount.amount / 100))}</div>
                                            <div className="text-xs flex items-center gap-3">
                                                <div><Label labelColor={"red"} text={`${product.Discount.amount} %`} /></div>
                                                <del>{rupiah(product.Product.basePrice)}</del>
                                            </div></>
                                    ) : product.Discount.discount_type_id === 3 ? (
                                        <><div className="text-reddanger font-bold">{rupiah(product.Product.basePrice - product.Discount.amount)}</div>
                                            <div className="text-xs flex items-center gap-3">
                                                <del>{rupiah(product.Product.basePrice)}</del>
                                            </div></>
                                    ) : null}
                                </>
                            ) : (
                                <div className="text-reddanger font-bold">{rupiah(product.Product.basePrice)}</div>
                            )}
                        </div>
                        <div className="flex absolute bottom-3 right-0 px-2">
                            <Button condition={"toAdd"} onClick={addToCartCondition} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
