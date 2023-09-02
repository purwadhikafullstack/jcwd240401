import React from 'react'
import { Carousel } from 'flowbite-react'
import shrimp from '../../assets/Seafood.jpg'
import bread from '../../assets/bread.jpg'
import { Link } from 'react-router-dom'

export default function CarouselContent() {
  const bannerContent = [
    { product_id: "1", type: "Discount by percentage", amount: "20", name: "Shrimp", img: shrimp, to:"/login" },
    { product_id: "2", type: "Buy one get one", amount: "", name: "Bread", img: bread, to:"/register" }
]
  return (
    <Carousel>
      {bannerContent ? (
        bannerContent.map((banner) => (
          <Link to={banner.to} className='w-full h-full '>
          <div className="w-full h-full bg-cover bg-center flex flex-col lg:flex-row justify-end px-20 py-10 items-center" key={banner.product_id} style={{backgroundImage: `url(${banner.img})`, backgroundSize: 'cover'}}>
            <div className='w-full lg:w-1/2 rounded-md lg:h-full flex flex-col justify-center p-4 font-inter' style={{backgroundColor: "rgb(255,255,255,0.9)"}}>
              <div className='hidden lg:text-xs lg:block lg:mb-1 lg:text-reddanger'>PROMO</div>
              <div className='lg:hidden text-xs uppercase text-maingreen mb-1 font-bold'>{banner.name}</div>
              <div className='flex lg:mb-6'>
                <div className='bg-reddanger text-white py-1 px-2 font-bold inline-block rounded-md'>{banner.type === "Discount by percentage" ? `DISCOUNT ${banner.amount}%` : banner.type === "Discount by nominal" ? `DISCOUNT Rp${banner.amount}` : "BUY ONE GET ONE"}</div>
              </div>
              <div className='hidden lg:text-maingreen lg:block lg:text-xl'>{banner.name}</div>
            </div>
          </div>
          </Link>))
      ) : (<div className='font-inter'>No Promotion available</div>)}
    </Carousel>
  )
}
