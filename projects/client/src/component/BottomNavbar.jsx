import React from 'react'
import { HiOutlineHome, HiOutlineShoppingCart, HiOutlineDocumentText, HiOutlineUser } from "react-icons/hi"

const routes = [
    { icon: HiOutlineHome, name: "Home" },
    { icon: HiOutlineDocumentText, name: "Orders" },
    { icon: HiOutlineShoppingCart, name: "Cart" },
    { icon: HiOutlineUser, name: "Account" },
]

export default function BottomNavbar() {
    return (
        <>
            <div className="fixed bottom-0 left-0 w-full h-14 flex justify-center border-t border-lightgrey lg:hidden">
                <div className="h-full w-4/5 flex justify-between items-center">
                    {routes.map(({ icon: Icon, name }, index) => (
                        <div key={index} className="flex flex-col h-full justify-center items-center">
                            <Icon className="w-6 h-6" />
                            <div>{name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
