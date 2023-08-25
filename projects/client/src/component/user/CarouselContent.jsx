import React from 'react'

export default function CarouselContent({key, type, amount, name, image}) {
  return (
    <div className="w-full h-full bg-cover bg-center flex justify-end px-20 py-10 items-center" key={key} style={{backgroundImage: `url(${image})`, backgroundSize: 'cover'}}>
        <div className='w-1/2 rounded-md h-full flex flex-col justify-center p-4 bg-white opacity-90 text-white font-inter'>
            <div className='text-xs mb-1 text-reddanger'>PROMO</div>
            <div className='flex mb-6'>
                <div className='bg-reddanger py-1 px-2 inline-block rounded-md'>{type === "Discount by percentage" ? `DISCOUNT ${amount}%` : type === "Discount by nominal" ? `DISCOUNT Rp${amount}` : "BUY ONE GET ONE"}</div>
            </div>
            <div className='text-maingreen text-xl'>{name}</div>
        </div>
    </div>
  )
}
