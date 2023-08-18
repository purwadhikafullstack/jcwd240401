import React, { useState, useEffect } from 'react'
import axios from "axios"
import SearchBar from '../../../SearchBar'
import { Pagination } from "flowbite-react";
import Modal from '../../../Modal'
import CustomDropDowm from '../../../CustomDropdown'
import AlertPopUp from '../../../AlertPopUp';

export default function AllCategory() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allCategory, setAllCategory] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        search: "",
        sort: ""
    })

    const handleRemove = async (categoryId) => {
        try {
            const response = await axios.patch(`http://localhost:8000/api/admins/categories/${categoryId}/remove`)
            if (response.status === 200) {
                setSuccessMessage(response?.data?.message)
                handleShowAlert()
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
            handleShowAlert()
        } finally {
            getCategory();
        }
    }

    const handleSearchValue = (e) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            search: e.target.value,
        }));
    }

    const getCategory = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/admins/categories?page=${currentPage}&search=${filter.search}&sortOrder=${filter.sort}`);
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
    }

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    useEffect(() => {
        getCategory()
    }, [filter, currentPage])

    const options = [{ label: "Sort By Name", value: "" }, { label: "Name: A-Z", value: "ASC" }, { label: "Name: Z-A", value: "DESC" }]

    const handleChangeDropdown = (obj) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            sort: obj.value,
        }));
    };

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }

    const handleHideAlert = () => {
        setShowAlert(false)
    }

    return (
        <div className='w-full flex flex-col justify-center gap-4 font-inter'>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <div className='flex gap-4 w-10/12 mx-auto my-6'>
                <SearchBar value={filter.search} type="text" onChange={handleSearchValue} placeholder="Enter here to search category by name..." />
                <CustomDropDowm options={options} onChange={handleChangeDropdown} placeholder={"Sort by Name"} />
            </div>
            <div className='w-full'>
                <div className="grid gap-2">
                    <table className="border-collapse w-full text-xs sm:text-base">
                        <thead>
                            <tr className="bg-lightgrey text-darkgrey">
                                <th className="py-2 px-4 font-normal hidden lg:table-cell" style={{ width: '25%' }}>Image</th>
                                <th className="py-2 px-4 font-normal" style={{ width: '60%' }}>Name</th>
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
                                    <td className="py-2 px-4 text-center" style={{ width: '75%' }}><div className='px-4 text-reddanger'><Modal modalTitle="Delete Category" buttonCondition="trash" content="Deleting this category will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleRemove(item.id)} /></div></td>
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
