import React from 'react'
import { HiOutlineHome, HiOutlineShoppingCart, HiOutlineDocumentText, HiOutlineUser, HiHome, HiDocumentText, HiShoppingCart, HiUser } from "react-icons/hi"
import { Link, useLocation } from 'react-router-dom'

export default function BottomNavbar() {
    const location = useLocation()
    const routes = [
        { iconDefault: HiOutlineHome, iconActive: HiHome, name: "Home",  to: "/"},
        { iconDefault: HiOutlineDocumentText, iconActive: HiDocumentText, name: "Orders", to: "/user/orders" },
        { iconDefault: HiOutlineShoppingCart, iconActive: HiShoppingCart, name: "Cart", to: "/user/cart" },
        { iconDefault: HiOutlineUser, iconActive: HiUser, name: "Account", to:"/user/account"},
    ]
    return (
        <>
            <div className="fixed bottom-0 left-0 w-full h-14 flex justify-center border-t z-50 bg-maingreen border-lightgrey lg:hidden" style={{boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"}}>
                <div className="h-full w-4/5 flex justify-between items-center">
                    {routes.map(({ iconDefault: IconDefault, iconActive: IconActive, name, to }, index) => (
                        <Link to={to}>
                        <div key={index} className={`flex flex-col h-full justify-center items-center ${location.pathname === to ? `text-white font-medium` : `text-lightgrey`}`}>
                            {location.pathname === to ? <IconActive className='h-6 w-6'/> : <IconDefault className="w-6 h-6" />}
                            <div>{name}</div>
                        </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
