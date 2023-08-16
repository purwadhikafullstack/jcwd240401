import React from 'react'
import logo from '../assets/logo_Groceer-e.svg'
import { HiOutlineLocationMarker } from 'react-icons/hi'

export default function NavbarTop({city, province}) {
  return (
    <>
    <div className='hidden lg:w-full lg:h-24 lg:shadow-md lg:bg-white lg:grid lg:grid-cols-2 lg:px-10'>
        <div className="w-full h-full col-span-1 grid grid-cols-2 items-center">
            <div><img src={logo} alt="logo" /></div>
            <div className='flex gap-4'>
                <HiOutlineLocationMarker className="w-6 h-6" />
                <div>{city && province ? `${city}, ${province}` : ""}</div> 
            </div>
        </div>
        <div className="w-full h-full col-span-1 flex justify-end gap-20 items-center font-inter">
            <div className="flex justify-between gap-10">
                <div className='font-bold text-maingreen'>Home</div>
                <div className='text-darkgrey'>Orders</div>
                <div className='text-darkgrey'>Cart</div>
                <div className='text-darkgrey'>Account</div>
            </div>
            <div>Log In</div>
        </div>
    </div>
    </>
  )
}
