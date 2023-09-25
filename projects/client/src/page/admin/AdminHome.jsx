import React from 'react'
import AdminHomeContent from '../../component/admin/AdminHomeContent'
import LayoutAdmin from '../../component/admin/LayoutAdmin'

export default function AdminHome() {
    
    return (
        <div className=" grid grid-rows-7 min-h-screen">
            <LayoutAdmin>
                <AdminHomeContent />
            </LayoutAdmin>
        </div>
        )
}
