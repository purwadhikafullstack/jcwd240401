import React, { useState, useEffect } from 'react';
import { Pagination } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { LuEdit } from "react-icons/lu"

import Modal from '../../../Modal';
import ModalBranchProduct from '../../../ModalBranchProduct';
import rupiah from '../../../../helpers/rupiah';
import SearchInputBar from '../../../SearchInputBar';
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';
import Label from '../../../Label';
import handleImageError from '../../../../helpers/handleImageError'
import AlertHelper from '../../../AlertHelper';
import { getCategoriesNoPagination } from '../../../../api/category';
import { getBranchProducts, removeBranchProduct } from '../../../../api/branchProduct';

export default function AllBranchProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allBranchProduct, setAllBranchProduct] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState(new URLSearchParams());
    const [allCategory, setAllCategory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const nameOptions = [{ label: "Default", value: "" }, { label: "Name: A-Z", value: "ASC" }, { label: "Name: Z-A", value: "DESC" }]
    const statusOptions = [{ label: "All Status", value: "" }, { label: "Ready", value: "ready" }, { label: "Restock", value: "restock" }, { label: "Empty", value: "empty" }]
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const token = localStorage.getItem("token")

    const getCategory = async () => {
        try {
            const response = await getCategoriesNoPagination(token);
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    const optionOne = { label: "All Category", value: "" }
                    let options = data.map((d) => ({ label: d.name, value: d.id, }));
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
            const response = await getBranchProducts(token, params.get("page") || 1, params.get("search") || "", params.get("category_id") || "", params.get("filterStatus") || "", params.get("sortName") || "")
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

    const onPageChange = (page) => {
        setAllBranchProduct([]);
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

    const handleRemove = async (branchProductId) => {
        try {
            const response = await removeBranchProduct(token, branchProductId)
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
            getBranchProduct();
        }
    }

    useEffect(() => {
        getCategory()
        getBranchProduct()
    }, [filter, currentPage])

    function getLabelColor(status) {
        switch (status) {
            case "empty":
                return "red";
            case "restock":
                return "blue";
            case "ready":
                return "green";
            default:
                return "red";
        }
    }

    return (
        <div className='w-full flex flex-col justify-center gap-4 font-inter'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4 w-10/12 mx-auto my-6'>
                <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={(searchValue) => handleFilterChange("search", searchValue)} placeholder="Enter here to search product by name..." />
                <CustomDropdownURLSearch id="sortName" options={nameOptions} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Name"} />
                <CustomDropdownURLSearch id="category_id" options={allCategory} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Category"} />
                <CustomDropdownURLSearch id="filterStatus" options={statusOptions} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Status"} />
            </div>
            <div className='w-full md:w-11/12 mx-auto'>
                <div className="grid gap-2">
                    <table className="border-collapse w-full text-xs sm:text-base">
                        <thead className="border-b-2 border-maingreen text-maingreen uppercase">
                            <tr>
                                <th className="py-2 px-4" style={{ width: '45%' }}>Product</th>
                                <th className="py-2 px-4 hidden xl:table-cell" style={{ width: '35%%' }}>Details</th>
                                <th className="py-2 px-4" style={{ width: '7.5%' }}>Status</th>
                                <th className="py-2 px-4 hidden xl:table-cell" style={{ width: '7.5%' }}>Qty</th>
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
                                                    src={`${process.env.REACT_APP_BASE_URL}${item?.Product?.imgProduct}`}
                                                    onError={handleImageError}
                                                    alt="/"
                                                />
                                            </div>
                                            <div className='flex flex-col justify-center w-full sm:pl-2 gap-2 text-xs sm:text-sm font-medium'>
                                                <div className='text-maingreen font-semibold'>{item?.Product?.name}</div>
                                                <div>{item?.Product?.Category.name}</div>
                                                <div>{item?.Product?.weight}{item?.Product?.unitOfMeasurement} / pack</div>
                                                <div>{rupiah(item?.Product?.basePrice)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 hidden xl:table-cell cursor-pointer text-sm" style={{ width: '35%' }} onClick={() => setSelectedProduct(item.id)}>
                                        {item?.Product?.description.slice(0, 100)}
                                        {item?.Product?.description.length > 100 && (<span className="text-sm">...</span>)}
                                    </td>
                                    <td className="py-2 px-4 text-center cursor-pointer" style={{ width: '7.5%' }} onClick={() => setSelectedProduct(item.id)}> <Label labelColor={getLabelColor(item?.status)} text={item?.status} /> </td>
                                    <td className="py-2 px-4 hidden xl:table-cell text-center cursor-pointer" style={{ width: '7.5%' }} onClick={() => setSelectedProduct(item.id)}> {item?.quantity} </td>
                                    <td className="py-2 sm:px-4 text-center" style={{ width: '5%' }}><div className='px-4 text-reddanger grid grid-rows-2 justify-center gap-2'><Link to={`branch-product/${item.id}/modify`}><LuEdit className="text-maingreen text-base sm:text-xl mx-auto" /></Link><Modal buttonTypeToggle={"button"} modalTitle="Delete Product" buttonCondition="trash" content="Deleting this product will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleRemove(item.id)} /></div></td>
                                </tr>
                            ))}
                            {allBranchProduct.length === 0 && (<tr><td colSpan="4" className="py-4 text-center">No Branch Product Found</td></tr>)}
                        </tbody>
                    </table>
                </div>
                {selectedProduct && (<ModalBranchProduct branchProductId={selectedProduct} onClose={() => setSelectedProduct(null)} />)}
            </div>
            <div className='flex justify-center'>
                <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
            </div>
        </div>
    )
}
