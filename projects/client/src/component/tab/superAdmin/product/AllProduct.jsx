import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Pagination } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { BiSolidEditAlt } from "react-icons/bi";

import Modal from '../../../Modal';
import ModalProduct from '../../../ModalProduct';
import AlertPopUp from '../../../AlertPopUp';
import rupiah from '../../../../helpers/rupiah';
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';
import SearchInputBar from '../../../SearchInputBar';

export default function AllProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allProduct, setAllProduct] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const [allCategory, setAllCategory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const token = localStorage.getItem("token")

    const getCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    const optionOne = { label: "All Category", value: "" }
                    let options = data.map((d) => ({
                        label: d.name,
                        value: d.id,
                    }));

                    options.unshift(optionOne)
                    setAllCategory(options);
                } else {
                    setAllCategory([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }

    const handleHideAlert = () => {
        setShowAlert(false)
    }

    const getProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/products?page=${params.get("page") || 1}&search=${params.get("search") || ""}&filterCategory=${params.get("category_id") || ""}&sortName=${params.get("sortName") || ""}&sortPrice=${params.get("sortPrice") || ""}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const { data: responseData, pagination } = response.data;

                if (responseData) {
                    setAllProduct(responseData.rows);
                    setTotalPages(Math.ceil(pagination.totalData / pagination.perPage))
                } else {
                    setAllProduct([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const nameOptions = [{ label: "Sort By Name", value: "" }, { label: "Name: A-Z", value: "ASC" }, { label: "Name: Z-A", value: "DESC" }]
    const priceOptions = [{ label: "Sort By Price", value: "" }, { label: "Price: Low-High", value: "ASC" }, { label: "Price: High-Low", value: "DESC" }]

    const onPageChange = (page) => {
        setAllProduct([]);
        setCurrentPage(page);
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", page.toString());
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", page.toString());
        navigate({ search: params.toString() });
    }

    const handleSearchSubmit = (searchValue) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (searchValue === "") {
            newFilter.delete("search");
        } else {
            newFilter.set("search", searchValue);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("search", searchValue);
        params.set("page", "1");
        navigate({ search: params.toString() });
    };

    const handleDropdownChange = (e) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (e.target.value === "") {
            newFilter.delete(e.target.id);
        } else {
            newFilter.set(e.target.id, e.target.value);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", "1");
        params.set(e.target.id, e.target.value);
        navigate({ search: params.toString() });
    }

    const handleRemove = async (productId) => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/products/${productId}/remove`, null, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.status === 200) {
                setSuccessMessage(response?.data?.message)
                handleShowAlert()
            }
        } catch (error) {
            if (error?.response?.status === 404) {
                setErrorMessage("Product not found")
                console.log(error);
            }
            if (error?.response?.status === 400) {
                setErrorMessage(error?.response?.data?.message)
                console.log(error?.response?.data?.message);
            }
            handleShowAlert()
        } finally {
            getProduct();
        }
    }

    useEffect(() => {
        getCategory()
        getProduct()
    }, [filter])

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    return (
        <div className='w-full flex flex-col justify-center gap-4 font-inter'>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4 w-10/12 mx-auto my-6'>
                <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={handleSearchSubmit} placeholder="Enter here to search product by name..." />
                <CustomDropdownURLSearch id="category_id" options={allCategory} onChange={handleDropdownChange} placeholder={"Filter By Category"} />
                <CustomDropdownURLSearch id="sortName" options={nameOptions} onChange={handleDropdownChange} placeholder={"Sort by Name"} />
                <CustomDropdownURLSearch id="sortPrice" options={priceOptions} onChange={handleDropdownChange} placeholder={"Sort by Price"} />
            </div>
            <div className=''>
                <div className="grid gap-2">
                    <table className="border-collapse w-full text-xs sm:text-base">
                        <thead className="border-b-2 border-maingreen text-maingreen uppercase">
                            <tr>
                                <th className="py-2 px-4" style={{ width: '40%' }}>Product</th>
                                <th className="py-2 px-4 hidden lg:table-cell" style={{ width: '40%%' }}>Description</th>
                                <th className="py-2 px-4" style={{ width: '15%' }}>Price</th>
                                <th className="py-2 px-4" style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {allProduct.length !== 0 && allProduct.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-100 border-b-2 border-gray-200">
                                    <td className="py-2 px-4 cursor-pointer" style={{ width: '40%' }} onClick={() => setSelectedProduct(item.id)}>
                                        <div className='grid grid-cols-1 md:grid-cols-2 justify-center text-sm gap-1'>
                                            <div className='hidden md:block'>
                                                <img
                                                    className="w-28 h-28 justify-center mx-auto m-2 object-cover"
                                                    src={`${process.env.REACT_APP_BASE_URL}${item.imgProduct}`}
                                                    onError={handleImageError}
                                                    alt="/"
                                                />
                                            </div>
                                            <div className='flex flex-col justify-center w-4/5 gap-2'>
                                                <div className='text-maindarkgreen'>{item.name}</div>
                                                <div>{item.Category.name}</div>
                                                <div>{item.weight} {item.unitOfMeasurement} / pack</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 hidden lg:table-cell cursor-pointer" style={{ width: '40%' }} onClick={() => setSelectedProduct(item.id)}>
                                        {item.description.slice(0, 100)}
                                        {item.description.length > 100 && (
                                            <span className="text-sm">...</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 text-center cursor-pointer" style={{ width: '15%' }} onClick={() => setSelectedProduct(item.id)}>{rupiah(item.basePrice)}</td>
                                    <td className="py-2 px-4 text-center" style={{ width: '5%' }}><div className='px-4 text-reddanger grid justify-center gap-2'><Link to={`product/${item.id}/modify`}>  <BiSolidEditAlt className="text-maingreen text-xl sm:text-2xl mx-auto" /> </Link><Modal modalTitle="Delete Product" buttonCondition="trash" content="Deleting this product will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleRemove(item.id)} /></div></td>
                                </tr>
                            ))}
                            {allProduct.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center">No Product Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {selectedProduct && (
                    <ModalProduct
                        productId={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}
            </div>
            <div className='flex justify-center'>
                <Pagination
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    showIcons
                    layout="pagination"
                    totalPages={totalPages}
                    nextLabel="Next"
                    previousLabel="Back"
                    className="mx-auto"
                />
            </div>
        </div>
    )
}
