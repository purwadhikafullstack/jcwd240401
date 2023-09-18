import React, { useEffect, useState } from 'react'
import NavbarTop from '../NavbarTop'
import BottomNavbar from '../NavbarBottom'
import Footer from '../Footer'

export default function LayoutUser(props) {
  return (
    <div className='w-full min-h-screen flex flex-col'>
      <NavbarTop />
      <div className="w-full flex flex-grow justify-center mb-20 2xl:mt-10">
        <div className="w-full sm:max-w-3xl flex justify-center">
          {props.children}
        </div>
      </div>
      <BottomNavbar />
      <Footer />
    </div>
  )
}
