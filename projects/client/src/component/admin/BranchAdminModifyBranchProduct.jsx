import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

import Button from '../Button';
import ModifyBranchProduct from '../tab/branchAdmin/product/ModifyBranchProduct';
import handleImageError from '../../helpers/handleImageError'
import { getBranchProductById } from '../../api/branchProduct';

export default function BranchAdminModifyBranchProduct() {
    const [branchProductDetails, setBranchProductDetails] = useState({})
    const { id } = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const getOneBranchProduct = async () => {
        try {
            const response = await getBranchProductById(token, id)
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setBranchProductDetails(data)
                } else {
                    setBranchProductDetails([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    useEffect(() => {
        getOneBranchProduct()
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [])

    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify My Branch Product</div>
            </div>
            <div className='grid grid-cols-1 py-10 sm:py-0 lg:grid-cols-2 h-full justify-center content-center gap-4'>
                <div className='grid content-center justify-center p-4'>
                    <img
                        className="w-40 h-40 md:w-56 md:h-56 justify-center mx-auto m-2 object-cover"
                        src={`${process.env.REACT_APP_BASE_URL}${branchProductDetails?.Product?.imgProduct}`}
                        onError={handleImageError}
                        alt="/"
                    />
                    <div className='font-bold text-sm md:text-base text-center'>{branchProductDetails?.Product?.name} <span> [ {branchProductDetails?.Product?.weight}{branchProductDetails?.Product?.unitOfMeasurement} / pack ]</span></div>
                </div>
                <div className='lg:p-4 grid content-start h-[500px] md:h-[450px]'>
                    <ModifyBranchProduct branchProductId={id} />
                </div>
            </div>
        </div >
    )
}
