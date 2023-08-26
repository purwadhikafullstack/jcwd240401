import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Pagination } from "flowbite-react";

import SearchBar from '../../../SearchBar';
import Modal from '../../../Modal';
import CustomDropDowm from '../../../CustomDropdown';
import ModalBranchProduct from '../../../ModalBranchProduct';
import AlertPopUp from '../../../AlertPopUp';
import rupiah from '../../../../helpers/rupiah';

export default function AllBranchProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allBranchProduct, setAllBranchProduct] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        search: "",
        sortName: "",
        category: "",
        status: "",
    })
    const [allCategory, setAllCategory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const nameOptions = [{ label: "Sort By Name", value: "" }, { label: "Name: A-Z", value: "ASC" }, { label: "Name: Z-A", value: "DESC" }]
    const statusOptions = [{ label: "All Status", value: "" }, { label: "Ready", value: "ready" }, { label: "Restock", value: "restock" }, { label: "Empty", value: "empty" }]

    let token = localStorage.getItem("token")
    const getCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-categories`);
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
    const getBranchProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products?page=${currentPage}&search=${filter.search}&filterCategory=${filter.category}&filterStatus=${filter.status}&sortName=${filter.sortName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) {
                const { data: responseData, pagination } = response.data;
                if (responseData) {
                    setAllBranchProduct(responseData.rows);
                    setTotalPages(Math.ceil(pagination.totalData / pagination.perPage))
                } else {
                    setAllBranchProduct([]);
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

    const onPageChange = (page) => {
        setAllBranchProduct([]);
        setCurrentPage(page)
    }
    const handleFilterChange = (e) => {
        setFilter({
            ...filter, [e.target.id]: e.target.value
        })
    }

    const handleDropdownChange = (obj, name) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: obj.value,
        }));
    }

    const handleRemove = async (productId) => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${productId}/remove`, {}, {
                headers: { Authorization: `Bearer ${token}` },
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
            getBranchProduct();
        }
    }
    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    useEffect(() => {
        getCategory()
        getBranchProduct()
    }, [filter, currentPage])

    return (
        <div className='w-full flex flex-col justify-center gap-4 font-inter'>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4 w-10/12 mx-auto my-6'>
                <SearchBar id={"search"} value={filter.search} type="text" onChange={handleFilterChange} placeholder="Enter here to search branch product by name..." />
                <CustomDropDowm options={nameOptions} onChange={(e) => handleDropdownChange(e, "sortName")} placeholder={"Sort by Name"} />
                <CustomDropDowm options={allCategory} onChange={(e) => handleDropdownChange(e, "category")} placeholder={"Filter by Category"} />
                <CustomDropDowm options={statusOptions} onChange={(e) => handleDropdownChange(e, "status")} placeholder={"Filter by Status"} />
            </div>
            <div className='w-full'>
                <div className="grid gap-2">
                    <table className="border-collapse w-full text-xs sm:text-base">
                        <thead className="border-b-2 border-maingreen text-maingreen uppercase">
                            <tr>
                                <th className="py-2 px-4" style={{ width: '45%' }}>Product</th>
                                <th className="py-2 px-4 hidden xl:table-cell" style={{ width: '35%%' }}>Details</th>
                                <th className="py-2 px-4" style={{ width: '7.5%' }}>Status</th>
                                <th className="py-2 px-4" style={{ width: '7.5%' }}>Qty</th>
                                <th className="py-2 px-4" style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {allBranchProduct.length !== 0 && allBranchProduct.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-100 border-b-2 border-gray-200">
                                    <td className="py-2 px-4 cursor-pointer" style={{ width: '45%' }} onClick={() => setSelectedProduct(item.id)}>
                                        <div className='grid grid-cols-1 lg:grid-cols-2 justify-center text-sm gap-1'>
                                            <div className='hidden lg:block'>
                                                <img
                                                    className="w-28 h-28 justify-center mx-auto m-2 object-cover"
                                                    src={`http://localhost:8000${item?.Product?.imgProduct}`}
                                                    onError={handleImageError}
                                                    alt="/"
                                                />
                                            </div>
                                            <div className='flex flex-col justify-center w-4/5 pl-2 gap-2'>
                                                <div className='text-maindarkgreen'>{item?.Product?.name}</div>
                                                <div>{item?.Product?.Category.name}</div>
                                                <div>{item?.Product?.weight}{item?.Product?.unitOfMeasurement} / pack</div>
                                                <div>{rupiah(item?.Product?.basePrice)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 hidden xl:table-cell cursor-pointer" style={{ width: '35%' }} onClick={() => setSelectedProduct(item.id)}>
                                        {item?.Product?.description.slice(0, 100)}
                                        {item?.Product?.description.length > 100 && (
                                            <span className="text-sm">...</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 text-center cursor-pointer" style={{ width: '7.5%' }} onClick={() => setSelectedProduct(item.id)}> {item?.status} </td>
                                    <td className="py-2 px-4 text-center cursor-pointer" style={{ width: '7.5%' }} onClick={() => setSelectedProduct(item.id)}> {item?.quantity} </td>
                                    <td className="py-2 px-4 text-center" style={{ width: '5%' }}><div className='px-4 text-reddanger grid justify-center'><Modal modalTitle="Delete Product" buttonCondition="trash" content="Deleting this product will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleRemove(item.id)} /></div></td>
                                </tr>
                            ))}
                            {allBranchProduct.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center">No Branch Product Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {selectedProduct && (
                    <ModalBranchProduct
                        branchProductId={selectedProduct}
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
