import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../component/Sidebar'

export default function AdminHome() {
    return (
        <>
        <div className='grid grid-cols-3'>
            <Sidebar className="col-span-1"/>
            <div className='col-span-2 flex justify-center items-center'>AdminHome</div>
        </div>
        </>
        )
}
