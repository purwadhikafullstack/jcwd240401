import React from 'react'
import { Carousel } from 'flowbite-react'
import shrimp from '../../assets/Seafood.jpg'
import bread from '../../assets/bread.jpg'

export default function CarouselContent() {
  const bannerContent = [
    { product_id: "1", type: "Discount by percentage", amount: "20", name: "Shrimp", img: shrimp },
    { product_id: "2", type: "Buy one get one", amount: "", name: "Bread", img: bread }
]
  return (
    <Carousel>
      {bannerContent ? (
        bannerContent.map((banner) => (
          <div className="w-full h-full bg-cover bg-center flex justify-end px-20 py-10 items-center" key={banner.product_id} style={{backgroundImage: `url(${banner.img})`, backgroundSize: 'cover'}}>
        <div className='w-1/2 rounded-md h-full flex flex-col justify-center p-4 bg-white opacity-90 text-white font-inter'>
            <div className='text-xs mb-1 text-reddanger'>PROMO</div>
            <div className='flex mb-6'>
                <div className='bg-reddanger py-1 px-2 inline-block rounded-md'>{banner.type === "Discount by percentage" ? `DISCOUNT ${banner.amount}%` : banner.type === "Discount by nominal" ? `DISCOUNT Rp${banner.amount}` : "BUY ONE GET ONE"}</div>
            </div>
            <div className='text-maingreen text-xl'>{banner.name}</div>
        </div>
      </div>))
      ) : (<div className='font-inter'>No Promotion available</div>)}
    </Carousel>
  )
}
