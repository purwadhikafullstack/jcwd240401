import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { Carousel } from 'flowbite-react'
import { Link } from 'react-router-dom'
import rupiah from '../../helpers/rupiah'
import marketPic from '../../assets/marketPic.png'

export default function CarouselContent({branchId}) {
  const [promotedProducts, setPromotedProducts] = useState([])

  const promotions = async() => {
    try{
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/promoted-products?branchId=${branchId}`)
      if(response.data){
        setPromotedProducts(response.data?.data)
      }
      if(response.data?.data.length === 0){
        setPromotedProducts([])
      }
    } catch(error){
      if(error.response){
        console.log(error.response.message)
      }
    }
  }

  useEffect(() => {
    promotions()
  }, [branchId])

  const handleImageError = (event) => {
    event.target.src =
        'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
  };

  return (
    <Carousel>
      {promotedProducts.length !== 0 ? (
        promotedProducts.map((product) => (
          <Link to={`/product/${product.Product?.name}`} className='w-full h-full relative'>
            <div className="w-full h-full flex flex-col lg:flex-row justify-center px-20 py-10 items-center relative">
              <div className='min-w-full h-full absolute flex justify-center items-center'>
                <img src={product.Product?.imgProduct} alt="Product Image" className='min-w-full min-h-full absolute object-cover' onError={handleImageError}/>
              </div>
              <div className='w-full h-full flex flex-col lg:flex-row justify-end'>
                <div className='w-full lg:w-1/2 rounded-md lg:h-full flex flex-col justify-center p-4 font-inter relative z-10' style={{backgroundColor: "rgb(255,255,255,0.9)"}}>
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
          <div className='w-1/2'><img src={marketPic} alt="Market Illustration" className='w-full object-cover'/></div>
          <div className='font-inter font-bold text-maingreen'>Sorry, no promotion available</div>
        </div>)}
    </Carousel>
  )
}
