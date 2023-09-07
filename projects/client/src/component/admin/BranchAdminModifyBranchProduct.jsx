import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

import Button from '../Button';
import ModifyBranchProduct from '../tab/branchAdmin/product/ModifyBranchProduct';

export default function BranchAdminModifyBranchProduct() {
    const [branchProductDetails, setBranchProductDetails] = useState({})
    const { id } = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const getOneBranchProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setBranchProductDetails(data)
                    console.log("ini data", data)
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
    }, [])

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto h-full'>
            <div className='flex lg:pt-10'>
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
