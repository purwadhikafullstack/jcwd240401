import React, { useState, useEffect, useRef } from 'react';

import AlertHelper from '../../../AlertHelper';
import CreateProductForm from '../../../admin/SuperAdminCreateProductComponent/CreateProductForm';
import { getCategoriesNoPagination } from '../../../../api/category';
import { createProduct } from '../../../../api/product';

export default function CreateProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allCategory, setAllCategory] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const uOMOptions = [{ label: "GR", value: "gr" }, { label: "ML", value: "ml" }]
    const token = localStorage.getItem("token")

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

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
        const { file, name, category_id, description, weight, unitOfMeasurement, basePrice, storageInstruction, storagePeriod } = values;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('category_id', category_id);
        formData.append('description', description);
        formData.append('weight', weight);
        formData.append('unitOfMeasurement', unitOfMeasurement);
        formData.append('basePrice', basePrice);
        formData.append('storageInstruction', storageInstruction);
        formData.append('storagePeriod', storagePeriod);
        try {
            const response = await createProduct(token, formData)
            if (response.status === 201) {
                resetForm()
                resetFileInput();
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
            }
        } catch (error) {
            const response = error.response;
            if (response.data.message === "An error occurs") {
                const { msg } = response.data?.errors[0];
                if (msg) {
                    setStatus({ success: false, msg });
                    setErrorMessage(`${msg}`)
                }
            }
            if (response.data.message == "Similar product already exist") {
                setStatus({ success: false, msg: "Similar product already exist" });
                setErrorMessage(`Similar product already exist`)
            }
            if (response.data.error) {
                const errMsg = response.data.error;
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 413) {
                setStatus({ success: false, errors: "File size exceeded the limit" });
                setErrorMessage(`File size exceeded the limit`);
            }
            if (response.status === 500) {
                setErrorMessage("Create product failed: Server error")
            }
            resetForm()
        } finally {
            getCategory();
            resetFileInput();
            setImagePreview(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
        }
    };

    useEffect(() => {
        getCategory()
    }, [])

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
        <div className='w-full sm:w-8/12 mx-auto flex flex-col justify-center font-inter'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <CreateProductForm onSubmit={handleSubmit} preview={preview} imagePreview={imagePreview} allCategory={allCategory} uOMOptions={uOMOptions} fileInputRef={fileInputRef} />
        </div >
    )
}
