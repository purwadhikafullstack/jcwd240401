import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate, Link, useParams } from "react-router-dom";

import Modal from '../Modal';
import InputField from '../InputField';
import AlertPopUp from '../AlertPopUp';
import Button from '../Button';

export default function SingleProductContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [branchProductData, setBranchProductData] = useState({})
    const { name } = useParams()
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const goBack = () => {
        navigate(-1);
    };

    const getOneBranchProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branch-products/${encodeURIComponent(name)}`);
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setBranchProductData(data)
                } else {
                    setBranchProductData([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    useEffect(() => {
        getOneBranchProduct()
    }, [successMessage])

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    return (
        <>

            {branchProductData.length !== 0 ? (
                <div className='sm:py-4 sm:px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto'>
                    <div className=''>
                        <div className='hidden sm:flex justify-between'>
                            <div className="grid justify-center content-center"><Button condition={"back"} onClick={goBack} /></div>
                            <div className='flex mx-auto'>
                                <div className='text-xl font-bold px-2'>{branchProductData?.Product?.name}</div>
                                <div className='text-sm text-darkgrey px-2 flex items-center'>{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
                            </div>
                        </div>
                    </div>
                    <div className='sm:grid sm:grid-cols-2 sm:gap-4 sm:mt-9'>
                        <div>
                            <div>
                                <div className='relative'>
                                    <div className="absolute top-3 left-1 grid justify-center content-center sm:hidden"><Button condition={"back"} onClick={goBack} /></div>
                                    {branchProductData.discount_id && branchProductData.Discount?.isExpired === false ? (<div className="absolute bottom-0 left-0 h-8 w-full bg-reddanger flex justify-start text-sm items-center text-white font-inter px-4 sm:rounded-b-lg">{branchProductData.Discount.discount_type_id === 1 ? "Buy 1 Get 1" : "Discount"}</div>) : null}
                                    <img
                                        className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                                        src={`${process.env.REACT_APP_BASE_URL}${branchProductData?.Product?.imgProduct}`}
                                        onError={handleImageError}
                                        alt="/"
                                    />
                                </div>
                            </div>
                            <div className='sm:hidden grid p-4'>
                                <div>{branchProductData?.Product?.name}</div>
                                <div className='text-sm text-darkgrey flex items-center'>{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
                                <div className='text-reddanger font-bold'>Rp 18.900</div>
                            </div>
                        </div>
                        <div>
                            <div className='p-4 bg-lightgrey w-full h-fit text-darkgrey text-sm'>{branchProductData?.Product?.description}</div>
                            <div className='p-4'>
                                <table className='w-full'>
                                    <thead>
                                        <tr><th className='py-2 text-left' colSpan={2}>Product Details</th></tr>
                                    </thead>
                                    <tbody className='text-sm'>
                                        <tr>
                                            <td className="py-2 text-maindarkgreen align-top" style={{ width: '40%' }}>Origin</td>
                                            <td className="p-2" style={{ width: '60%' }}>{branchProductData?.origin}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-maindarkgreen align-top" style={{ width: '40%' }}>Storage Instruction</td>
                                            <td className="p-2" style={{ width: '60%' }}>{branchProductData?.Product?.storageInstruction}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-maindarkgreen align-top" style={{ width: '40%' }}>Storage Period</td>
                                            <td className="p-2" style={{ width: '60%' }}>{branchProductData?.Product?.storagePeriod}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='p-4 hidden sm:block'>
                                <div className='text-reddanger font-bold'>Rp 18.900</div>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <div className='basis-1/2 flex justify-around content-center items-center'>
                            <Button condition={"minus"} size={"3xl"} />
                            <div className='h-fit'>10</div>
                            <Button condition={"plus"} size={"3xl"} />
                        </div>
                        <div className='basis-1/2 p-4'>
                            <Button condition={"positive"} label={"Add to Cart"} />
                        </div>
                    </div>
                </div>

            ) : (
                <div className='text-maingreen text-center mx-auto px-5'>Loading...</div>
            )}
        </>
    )
}
