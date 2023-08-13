import React from 'react'
import adminHomePic from '../../assets/marketPic.png'

export default function AdminHomeContent() {
    return (
        <div className="w-full h-full flex justify-center">
            <div className='w-1/2 flex flex-col items-center'>
                <img src={adminHomePic} alt="illustration" className='w-96'/>
                <div className="text-3xl font-inter font-bold">Welcome,</div>
            </div>
        </div>
    )
}
