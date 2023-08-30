import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import logo from '../assets/logo_Groceer-e.svg'
import { HiOutlineLocationMarker, HiOutlineShoppingCart } from 'react-icons/hi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from './Button'
import background from '../assets/BackgroundLeaves.jpg'
import DropdownForNavbar from './user/DropdownForNavbar'

export default function NavbarTop({city, province}) {
    const token = localStorage.getItem("token")
    const profile = useSelector((state) => state.auth.profile)
    const navigate = useNavigate()
    const location = useLocation()

    const routes = [
        {name: "Home", to: "/"},
        {name: "Orders", to: "/user/orders"},
        {name: "Cart", icon: <HiOutlineShoppingCart size={25}/>, to: "/user/cart"},
        {name: "Account", icon: <DropdownForNavbar />}
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
            <div className="flex items-center justify-between gap-10">
                {routes.map(({ name, icon, to }, idx) => (
                    <Link to={to}>
                    {token && profile.role === "3" ? 
                    <div key={idx}>{icon ? icon : name}</div> : <div key={idx} className={`h-10 flex items-center justify-center ${location.pathname === to ? `text-maingreen font-bold border-b-2 border-maingreen` : `text-darkgrey`}`}>{name === "Account" ? <Link to="/user/account">{name}</Link> : name}</div>}
                    </Link>
                ))}
            </div>
            {(token && profile.role === "3") ? null : <div className="w-24"><Button condition={"positive"} label={"Log In"} onClick={onClickLogIn}/></div>}
        </div>
    </div>
    </>
  )
}
