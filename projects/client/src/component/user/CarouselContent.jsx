import React, { useState, useEffect } from 'react'
import { Carousel } from 'flowbite-react'
import { Link } from 'react-router-dom'
import rupiah from '../../helpers/rupiah'
import marketPic from '../../assets/marketPic.png'
import handleImageError from '../../helpers/handleImageError'
import { getPromotedProducts } from '../../api/product'

export default function CarouselContent({ branchId }) {
  const [promotedProducts, setPromotedProducts] = useState([])

  const promotions = async () => {
    try {
      const response = await getPromotedProducts(branchId)
      if (response.data) {
        setPromotedProducts(response.data?.data)
      } else (
        setPromotedProducts([])
      )
      if (response.data?.data.length === 0) {
        setPromotedProducts([])
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.message)
      }
    }
  }

  useEffect(() => {
    promotions()
  }, [branchId])

  return (
    <Carousel>
      {promotedProducts && promotedProducts.length !== 0 ? (
        promotedProducts.map((product, index) => (
          <Link to={`/product/${branchId}/${product.Product?.name}/${product.Product?.weight}/${product.Product?.unitOfMeasurement}`} className='w-full h-full relative overflow-y-hidden' key={index}>
            <div className="w-full h-full flex flex-col lg:flex-row justify-center px-20 py-10 items-center relative overflow-y-hidden">
              <div className='min-w-full h-full absolute flex justify-center items-center overflow-y-hidden'>
                <img src={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} alt="Product Image" className='min-w-full min-h-full absolute object-cover' onError={handleImageError} />
              </div>
              <div className='w-full h-full flex flex-col lg:flex-row justify-end'>
                <div className='w-full lg:w-1/2 rounded-md lg:h-full flex flex-col justify-center p-4 font-inter relative z-10' style={{ backgroundColor: "rgb(255,255,255,0.9)" }}>
                  <div className='hidden lg:text-xs lg:block lg:mb-1 lg:text-reddanger'>PROMO</div>
                  <div className='lg:hidden text-xs uppercase text-maingreen mb-1 font-bold'>{product.Product?.name}</div>
                  <div className='flex lg:mb-6'>
                    <div className='bg-reddanger text-white py-1 px-2 font-bold inline-block rounded-md'>{product.Discount?.Discount_Type?.type === "Discount by percentage" ? `DISCOUNT ${product.Discount?.amount}%` : product.Discount?.Discount_Type?.type === "Discount by nominal" ? `DISCOUNT ${rupiah(product.Discount?.amount)}` : "BUY ONE GET ONE"}</div>
                  </div>
                  <div className='hidden lg:text-maingreen lg:block lg:text-xl'>{product.Product?.name}</div>
                </div>
              </div>
            </div>
          </Link>))
      ) : (
        <div className='w-full h-full flex flex-col lg:flex-row gap-2 justify-center items-center'>
          <div className='w-72 lg:w-1/2 overflow-y-hidden'><img src={marketPic} alt="Market Illustration" className='w-full object-cover' /></div>
          <div className='font-inter font-bold text-maingreen'>Sorry, no promotion available</div>
        </div>)}
    </Carousel>
  )
}
