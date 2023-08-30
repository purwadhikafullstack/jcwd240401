import React from 'react'
import { HiOutlineHome, HiOutlineShoppingCart, HiOutlineDocumentText, HiOutlineUser } from "react-icons/hi"
import { Link, useLocation } from 'react-router-dom'

const routes = [
    { icon: HiOutlineHome, name: "Home",  to: "/"},
    { icon: HiOutlineDocumentText, name: "Orders", to: "/user/orders" },
    { icon: HiOutlineShoppingCart, name: "Cart", to: "/user/cart" },
    { icon: HiOutlineUser, name: "Account", to:"/user/account"},
]

export default function BottomNavbar() {
    const location = useLocation()
    return (
        <>
            <div className="fixed bottom-0 left-0 w-full h-14 flex justify-center border-t bg-white border-lightgrey lg:hidden" style={{boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"}}>
                <div className="h-full w-4/5 flex justify-between items-center">
                    {routes.map(({ icon: Icon, name, to }, index) => (
                        <Link to={to}>
                        <div key={index} className={`flex flex-col h-full justify-center items-center ${location.pathname === to ? `text-maingreen font-bold` : `text-darkgrey`}`}>
                            <Icon className="w-6 h-6" />
                            <div>{name}</div>
                        </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
