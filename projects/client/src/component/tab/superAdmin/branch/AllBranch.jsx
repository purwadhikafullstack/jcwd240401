import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Pagination } from "flowbite-react";
import CustomDropdown from '../../../CustomDropdown'
import SearchBar from '../../../SearchBar';

export default function AllBranch() {
    const [branchData, setBranchData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filter, setFilter] = useState({
        search: "",
        sort: ""
    })

    const token = localStorage.getItem("token")

    useEffect(() => {
        try{
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/branch?page=${currentPage}&search=${filter.search}&sortOrder=${filter.sort}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then((response) => {
                setBranchData(response.data.data?.rows)
                if(response.data.pagination) {
                setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
                }
            })
        }catch(error){
            console.log(error)
        }
    }, [currentPage, filter.search, filter.sort])

    const handleSearchValue = (e) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            search: e.target.value,
        }));
    }

    const onPageChange = (page) => {
        setBranchData([]);
        setCurrentPage(page)
    }

    const handleChangeDropdown = (obj) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            sort: obj.value,
        }));
    };

    const options = [{ label: "Default", value: "" }, { label: "City: A-Z", value: "ASC" }, { label: "City: Z-A", value: "DESC" }]

    return (
        <div className="w-full flex flex-col justify-center items-center gap-4 font-inter">
            <div className='flex flex-col gap-2 w-72 lg:flex-row lg:gap-4 lg:w-10/12 lg:mx-auto lg:my-6 '>
                <SearchBar value={filter.search} type="text" onChange={handleSearchValue} placeholder="Search branch by city or province" />
                <CustomDropdown options={options} onChange={handleChangeDropdown} placeholder={"Sort by City"} />
            </div>
            <div className='w-72 overflow-x-auto lg:w-full'>
            <table className="border-collapse w-full text-xs sm:text-base">
                <thead className="border-b-2 border-maingreen text-maingreen uppercase">
                    <tr>
                        <th className="py-2 px-4" style={{ width: '4%' }}>No</th>
                        <th className="py-2 px-4" style={{ width: '24%%' }}>City</th>
                        <th className="py-2 px-4" style={{ width: '24%' }}>Province</th>
                        <th className="py-2 px-4" style={{ width: '24%' }}>Branch Admin</th>
                        <th className="py-2 px-4" style={{ width: '24%' }}>Contact</th>
                    </tr>
                </thead>
                <tbody>
                {branchData ? branchData.map((data, index) => (
                        <tr>
                            <td className="py-2 px-4" style={{ width: '4%'}}>{index + 1}</td>
                            <td className="py-2 px-4" style={{ width: '24%'}}>{data.City?.city_name}</td>
                            <td className="py-2 px-4" style={{ width: '24%'}}>{data.City?.Province?.province_name}</td>
                            <td className="py-2 px-4" style={{ width: '24%'}}>{data.User?.name}</td>
                            <td className="py-2 px-4" style={{ width: '24%'}}>{data.User?.phone}</td>
                        </tr>
                )) : (
                <tr>
                    <td colSpan="5" className='py-4 text-center'>No Branch Found</td>
                </tr>
                )}
                </tbody>
            </table>
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
