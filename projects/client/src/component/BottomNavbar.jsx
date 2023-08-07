import React from 'react'
import { HiOutlineHome, HiOutlineShoppingCart, HiOutlineDocumentText, HiOutlineUser, HiOutlinePresentationChartLine, HiOutlineUserAdd, HiOutlinePlusCircle } from "react-icons/hi"
import { HiOutlineBuildingStorefront } from 'react-icons/hi2'

const superAdminRoutes = [
    { icon: HiOutlinePresentationChartLine, name: "Sales Report" },
    { icon: HiOutlineUserAdd, name: "Add Admin" },
    { icon: HiOutlinePlusCircle, name: "Create" },
    { icon: HiOutlineUser, name: "Account" },
]

const adminRoutes = [
    { icon: HiOutlinePresentationChartLine, name: "Sales Report" },
    { icon: HiOutlinePlusCircle, name: "Add Products" },
    { icon: HiOutlineDocumentText, name: "Orders" },
    { icon: HiOutlineBuildingStorefront, name: "My Store" },
]

const userRoutes = [
    { icon: HiOutlineHome, name: "Home" },
    { icon: HiOutlineShoppingCart, name: "Cart" },
    { icon: HiOutlineDocumentText, name: "Orders" },
    { icon: HiOutlineUser, name: "Account" },
]


export default function BottomNavbar() {
    const roleId = 2
    const routes = roleId === 1 ? superAdminRoutes : roleId === 2 ? adminRoutes : userRoutes

    return (
        <>
            <div className="w-full h-14 flex justify-center lg:hidden">
                <div className="h-full w-4/5 flex justify-between items-center">
                    {routes.map(({ icon: Icon, name }) => (
                        <div className="flex flex-col h-full justify-center items-center">
                            <Icon className="w-6 h-6" />
                            <div>{name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
