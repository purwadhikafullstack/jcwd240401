import React from 'react'
import Button from './Button'

export default function ProductCard({productName, productBasePrice, productDiscountPrice, productImg}) {
  return (
        <div className="grid grid-rows-13 h-65 w-40 shadow-lg relative">
            <div className="row-span-8 flex justify-center bg-inherit relative rounded-t-md">
                {productDiscountPrice ? (<div className="absolute bottom-0 left-0 w-1/2 h-8 bg-reddanger z-10 rounded-tr-md flex justify-center text-sm items-center text-white font-inter">discount</div>) : null }
                <img
                src={productImg}
                alt="product"
                className="h-40 bg-inherit relative"
                />
            </div>
            <div className="row-span-2 w-40 bg-inherit">
                <p className="font-xl font-inter px-2 whitespace-nowrap overflow-hidden text-ellipsis py-auto bg-inherit">
                    {productName}
                </p>
            </div>
            <div className="row-span-1 font-inter w-40 bg-inherit">
                <p className="px-2 whitespace-nowrap text-reddanger overflow-hidden text-ellipsis py-auto bg-inherit">
                    {productDiscountPrice ? productDiscountPrice : productBasePrice}
                </p>
            </div>
            <div className="row-span-2 font-inter w-40 p-2 bg-inherit rounded-b-md relative">
                <div className="text-sm relative line-through">{productDiscountPrice ? productBasePrice : null}</div>
                <div className="absolute z-20 right-0 bottom-0 p-1">
                    <Button condition={"plus"}/>
                </div>
            </div>
        </div>
  )
}
