import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Pagination } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { LuEdit } from "react-icons/lu"

import Modal from '../../../Modal';
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';
import SearchInputBar from '../../../SearchInputBar';
import handleImageError from '../../../../helpers/handleImageError';
import AlertHelper from '../../../AlertHelper';

export default function AllCategory() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allCategory, setAllCategory] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();

    const token = localStorage.getItem("token")
    const handleRemove = async (categoryId) => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/categories/${categoryId}/remove`, null, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.status === 200) {
                setSuccessMessage(response?.data?.message)
            }
        } catch (error) {
            console.log(error)
            if (error?.response?.status === 404) {
                setErrorMessage("Category not found")
                console.log(error);
            }
            if (error?.response?.status === 400) {
                setErrorMessage(error?.response?.data?.message)
                console.log(error?.response?.data?.message);
            }
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            getCategory();
        }
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

    const getCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/categories?page=${params.get("page") || 1}&search=${params.get("search") || ""}&sortName=${params.get("sortName") || ""}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const { data: responseData, pagination } = response.data;

                if (responseData) {
                    setAllCategory(responseData.rows);
                    setTotalPages(Math.ceil(pagination.totalData / pagination.perPage))
                } else {
                    setAllCategory([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const onPageChange = (page) => {
        setAllCategory([]);
        setCurrentPage(page)
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", page.toString());
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", page.toString());
        navigate({ search: params.toString() });
    }

    useEffect(() => {
        getCategory()
    }, [filter, currentPage])

    const options = [{ label: "Default", value: "" }, { label: "Name: A-Z", value: "ASC" }, { label: "Name: Z-A", value: "DESC" }]

    const handleChangeDropdown = (e) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (e.target.value === "") {
            newFilter.delete("sortName");
        } else {
            newFilter.set("sortName", e.target.value);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", "1");
        params.set("sortName", e.target.value);
        navigate({ search: params.toString() });
    };

    return (
        <div className='w-full flex flex-col justify-center gap-4 font-inter'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} />
            <div className='flex flex-col sm:flex-row gap-4 w-10/12 mx-auto my-6'>
                <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={handleSearchSubmit} placeholder="Enter here to search category by name..." />
                <CustomDropdownURLSearch id="sortName" options={options} onChange={handleChangeDropdown} placeholder={"Sort by Name"} />
            </div>
            <div className='w-full md:w-11/12 mx-auto'>
                <div className="grid gap-2">
                    <table className="border-collapse w-full text-xs sm:text-base">
                        <thead className="border-b-2 border-maingreen text-maingreen uppercase">
                            <tr>
                                <th className="py-2 px-4 hidden lg:table-cell" style={{ width: '25%' }}>Image</th>
                                <th className="py-2 px-4" style={{ width: '60%' }}>Name</th>
                                <th className="py-2 px-4" style={{ width: '15%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCategory.length !== 0 && allCategory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-100 border-b-2 border-gray-200">
                                    <td className="py-2 px-4 hidden lg:table-cell" style={{ width: '25%' }} >
                                        <img
                                            className="w-28 h-28 justify-center mx-auto m-2 object-cover"
                                            src={`http://localhost:8000${item.imgCategory}`}
                                            onError={handleImageError}
                                            alt="/"
                                        />
                                    </td>
                                    <td className="py-2 px-4 text-center" style={{ width: '75%' }}>{item.name}</td>
                                    <td className="py-2 px-4 text-center" style={{ width: '75%' }}><div className='px-4 text-reddanger grid justify-center gap-2'><Link to={`category/${item.id}/modify`}><LuEdit className="text-maingreen text-base sm:text-xl mx-auto" /></Link><Modal modalTitle="Delete Category" buttonCondition="trash" content="Deleting this category will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleRemove(item.id)} /></div></td>
                                </tr>
                            ))}
                            {allCategory.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="py-4 text-center">No Category Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
