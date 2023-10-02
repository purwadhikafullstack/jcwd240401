import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

import Button from '../Button';
import AlertHelper from '../AlertHelper';
import ModifyProductForm from './SuperAdminModifyProductComponent/ModifyProductForm';
import { getProductById, modifyProduct } from '../../api/product';
import { getCategoriesNoPagination } from '../../api/category';

export default function SuperAdminModifyProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allCategory, setAllCategory] = useState([])
    const [productDetails, setProductDetails] = useState({ name: "", file: "", category_id: "", description: "", weight: "", unitOfMeasurement: "", basePrice: "", storageInstruction: "", storagePeriod: "", })
    const [imagePreview, setImagePreview] = useState(null);
    const uOMOptions = [{ label: "GR", value: "gr" }, { label: "ML", value: "ml" }]
    const token = localStorage.getItem("token")
    const { id } = useParams()
    const navigate = useNavigate()

    const getOneProduct = async () => {
        try {
            const response = await getProductById(token, id)
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setProductDetails({
                        name: data.name,
                        file: `${process.env.REACT_APP_BASE_URL}${data.imgProduct}`,
                        category_id: data.category_id,
                        description: data.description,
                        weight: data.weight,
                        unitOfMeasurement: data.unitOfMeasurement,
                        basePrice: data.basePrice,
                        storageInstruction: data.storageInstruction,
                        storagePeriod: data.storagePeriod,
                    })
                } else {
                    setProductDetails([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const getCategory = async () => {
        try {
            const response = await getCategoriesNoPagination(token);
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    let options = data.map((d) => ({
                        label: d.name,
                        value: d.id,
                    }));
                    setAllCategory(options);
                } else {
                    setAllCategory([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus, initialValues, setFieldValue }) => {
        const { file, name, category_id, description, weight, unitOfMeasurement, basePrice, storageInstruction, storagePeriod } = values;
        const formData = new FormData();
        if (file) { formData.append('file', file); }
        if (name !== productDetails.name || weight !== productDetails.weight || unitOfMeasurement !== productDetails.unitOfMeasurement) {
            formData.append('name', name);
            formData.append('weight', weight);
            formData.append('unitOfMeasurement', unitOfMeasurement);
        }
        if (category_id !== productDetails.category_id) { formData.append('category_id', category_id); }
        if (description !== productDetails.description) { formData.append('description', description); }
        if (basePrice !== productDetails.basePrice) { formData.append('basePrice', basePrice); }
        if (storageInstruction !== productDetails.storageInstruction) { formData.append('storageInstruction', storageInstruction); }
        if (storagePeriod !== productDetails.storagePeriod) { formData.append('storagePeriod', storagePeriod); }
        try {
            const response = await modifyProduct(token, id, formData)
            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                setFieldValue("file", null)
            }
        } catch (error) {
            const response = error.response;
            if (response?.data?.message === "An error occurs") {
                const { msg } = response.data?.errors[0];
                if (msg) {
                    setStatus({ success: false, msg });
                    setErrorMessage(`${msg}`)
                }
            }
            if (response?.data?.message == "Similar product already exist") {
                setStatus({ success: false, msg: "Similar product already exist" });
                setErrorMessage(`Similar product already exist`)
            }
            if (response?.data?.error) {
                const errMsg = response.data.error;
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 413) {
                setStatus({ success: false, errors: "File size exceeded the limit" });
                setErrorMessage(`File size exceeded the limit`);
            }
            if (response?.status === 404) {
                setErrorMessage("Product not found")
            }
            if (response?.status === 500) {
                setErrorMessage("Modify product failed: Server error")
            }
            resetForm()
        } finally {
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        getCategory()
        getOneProduct()
    }, [successMessage])

    function preview(event) {
        const file = event.target.files[0];
        if (file === undefined) {
            setImagePreview(null)
        } else {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    }

    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto h-full'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify My Product</div>
            </div>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <div className='grid'>
                <ModifyProductForm onSubmit={handleSubmit} preview={preview} imagePreview={imagePreview} allCategory={allCategory} uOMOptions={uOMOptions} productDetails={productDetails} />
            </div>
        </div>
    )
}
