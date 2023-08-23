import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import logo from '../assets/logo_Groceer-e.svg'
import { HiOutlineLocationMarker, HiOutlineUser, HiOutlineShoppingCart } from 'react-icons/hi'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import background from '../assets/BackgroundLeaves.jpg'

export default function NavbarTop({city, province}) {
    const token = localStorage.getItem("token")
    const profile = useSelector((state) => state.auth.profile)
    const navigate = useNavigate()

    const routes = [
        {name: "Home"},
        {name: "Orders"},
        {name: "Cart", icon: <HiOutlineShoppingCart size={25} />},
        {name: "Account", icon: <HiOutlineUser size={25} />}
    ]

    const onClickLogIn = () => {
        navigate("/login")
    }
  return (
    <>
    <div className='hidden lg:w-full lg:h-24 lg:shadow-md lg:bg-cover lg:bg-center lg:grid lg:grid-cols-2 lg:px-10' style={{backgroundImage: `url(${background})`, backgroundSize: 'cover'}}>
        <div className="w-full h-full col-span-1 grid grid-cols-2 items-center">
            <div><img src={logo} alt="logo" /></div>
            <div className='flex gap-4'>
                <HiOutlineLocationMarker className="w-6 h-6" />
                <div>{ city && province ? `${city}, ${province}` : ""}</div> 
            </div>
        </div>
        <div className="w-full h-full col-span-1 flex justify-end gap-20 items-center font-inter">
            <div className="flex justify-between gap-10">
                {routes.map(({ name, icon }, idx) => (
                    token && profile.role === "3" ? 
                    <div key={idx}>{icon ? icon : name}</div> : <div key={idx} className='h-10 flex items-center justify-center'>{name}</div>
                ))}
            </div>
            {(token && profile.role === "3") ? null : <div className="w-24"><Button condition={"positive"} label={"Log In"} onClick={onClickLogIn}/></div>}
        </div>
    </div>
    </>
  )
}
