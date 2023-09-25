import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../../Button'
import handleImageError from '../../../helpers/handleImageError';

export default function SingleProductContentImage({ imgUrl, branchDiscount, branchDiscountExpired, branchDiscountId, branchProductStock }) {
    const navigate = useNavigate();

    return (
        <div className="grid h-full content-center">
            <div className="relative h-fit">
                <div className="fixed z-50 top-3 left-1 grid justify-center content-center sm:hidden">
                    <Button condition={"back"} onClick={() => navigate(-1)} backColor={"text-greensuccess"} />
                </div>
                {branchDiscount &&
                    branchDiscountExpired === false ? (
                    <div className="absolute bottom-0 left-0 h-8 w-full bg-reddanger flex justify-start text-sm items-center text-white font-inter px-4 sm:rounded-b-lg">
                        {branchDiscountId === 1
                            ? "Buy 1 Get 1"
                            : "Discount"}
                    </div>
                ) : null}
                {branchProductStock !== 0 ? (
                    <img
                        className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                        src={imgUrl}
                        onError={handleImageError}
                        alt="/"
                    />
                ) : (
                    <div className='relative'>
                        <img
                            className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                            src={imgUrl}
                            onError={handleImageError}
                            alt="/"
                        />
                        <div className="absolute top-0 bg-black opacity-75 w-full h-full flex justify-center items-center">
                            <p className="text-greensuccesssurface font-inter text-xl sm:text-2xl text-center">Sold Out</p>
                        </div>
                    </div>

                )}
            </div>
        </div>
    )
}
