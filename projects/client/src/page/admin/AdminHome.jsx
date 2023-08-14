import React from 'react'
import Sidebar from '../../component/Sidebar'
import AdminHomeContent from '../../component/admin/AdminHomeContent'
import Footer from '../../component/Footer'
import { useSelector } from 'react-redux'

export default function AdminHome() {
    const token = localStorage.getItem("token")
    const profile = useSelector((state) => state.auth.profile)
    const role = Number(profile.role)
    return (
        <div className=" grid grid-rows-7 min-h-screen">
            <div className=" row-span-2 col-span-1 min-h-screen"><Sidebar roleId={role}/></div>
            <div className=" row-span-2 col-span-2 flex justify-center w-full  min-h-screen">
                <AdminHomeContent />
            </div>
            <div className=" row-span-1 col-span-3">
                <Footer />
            </div>
        </div>
        )
}
