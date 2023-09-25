import React, { useState, useEffect } from 'react';
import { Pagination } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { LuEdit } from "react-icons/lu"

import Modal from '../../../Modal';
import ModalProduct from '../../../ModalProduct';
import rupiah from '../../../../helpers/rupiah';
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';
import SearchInputBar from '../../../SearchInputBar';
import handleImageError from '../../../../helpers/handleImageError';
import AlertHelper from '../../../AlertHelper';
import { getProducts, removeProduct } from '../../../../api/product';
import { getCategoriesNoPagination } from '../../../../api/category';

export default function AllProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allProduct, setAllProduct] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const [allCategory, setAllCategory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const token = localStorage.getItem("token")
    const nameOptions = [{ label: "None", value: "" }, { label: "Name: A-Z", value: "ASC" }, { label: "Name: Z-A", value: "DESC" }]
    const priceOptions = [{ label: "None", value: "" }, { label: "Price: Low-High", value: "ASC" }, { label: "Price: High-Low", value: "DESC" }]

    const getCategory = async () => {
        try {
            const response = await getCategoriesNoPagination(token)
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

    const getProduct = async () => {
        try {
            const response = await getProducts(token, params.get("page") || 1, params.get("search") || "", params.get("category_id") || "", params.get("sortName") || "", params.get("sortPrice") || "")
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

    const handleFilterChange = (paramName, paramValue) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (paramValue === "") {
            newFilter.delete(paramName);
        } else {
            newFilter.set(paramName, paramValue);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set(paramName, paramValue);
        params.set("page", "1");
        navigate({ search: params.toString() });
    };

    const handleRemove = async (productId) => {
        try {
            const response = await removeProduct(token, productId)
            if (response.status === 200) {
                setSuccessMessage(response?.data?.message)
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
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            getProduct();
        }
    }

    useEffect(() => {
        getCategory()
        getProduct()
    }, [filter])

    return (
        <div className='w-full flex flex-col justify-center gap-4 font-inter'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4 w-10/12 mx-auto my-6'>
                <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={(searchValue) => handleFilterChange("search", searchValue)} placeholder="Enter here to search product by name..." />
                <CustomDropdownURLSearch id="category_id" options={allCategory} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter By Category"} />
                <CustomDropdownURLSearch id="sortName" options={nameOptions} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Name"} />
                <CustomDropdownURLSearch id="sortPrice" options={priceOptions} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Price"} />
            </div>
            <div className='w-full md:w-11/12 mx-auto'>
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
                                            <div className='flex flex-col justify-center w-4/5 gap-2 font-medium'>
                                                <div className='text-maingreen font-semibold'>{item.name}</div>
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
                                    <td className="py-2 px-4 text-center cursor-pointer text-sm md:text-base" style={{ width: '15%' }} onClick={() => setSelectedProduct(item.id)}>{rupiah(item.basePrice)}</td>
                                    <td className="py-2 px-4 text-center" style={{ width: '5%' }}><div className='px-4 text-reddanger grid justify-center gap-2'><Link to={`product/${item.id}/modify`}><LuEdit className="text-maingreen text-base sm:text-xl mx-auto" /></Link><Modal modalTitle="Delete Product" buttonCondition="trash" content="Deleting this product will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleRemove(item.id)} /></div></td>
                                </tr>
                            ))}
                            {allProduct.length === 0 && (<tr><td colSpan="4" className="py-4 text-center">No Product Found</td></tr>)}
                        </tbody>
                    </table>
                </div>
                {selectedProduct && (<ModalProduct productId={selectedProduct} onClose={() => setSelectedProduct(null)} />)}
            </div>
            <div className='flex justify-center'>
                <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
            </div>
        </div>
    )
}
