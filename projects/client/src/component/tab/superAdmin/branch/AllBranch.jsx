import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Pagination } from "flowbite-react";
import { useNavigate } from 'react-router-dom'
import SearchInputBar from '../../../SearchInputBar';
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';

export default function AllBranch() {
    const [branchData, setBranchData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const getAllBranch = async() => {
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/branch?page=${params.get("page") || 1}&search=${params.get("search") || ""}&sortOrder=${params.get("sort") || ""}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if(response.data){
                setBranchData(response.data.data?.rows)
                if(response.data.pagination) {
                    setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
                }
            } else {
                setBranchData([])
            }
        }catch(error){
            if(error.response){
                console.log(error.response.message)
            }
        }
    }

    useEffect(() => {
        getAllBranch()
    }, [currentPage, filter])

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

    const onPageChange = (page) => {
        setBranchData([]);
        setCurrentPage(page);
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", page.toString());
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", page.toString());
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

    const options = [{ label: "Default", value: "" }, { label: "City: A-Z", value: "ASC" }, { label: "City: Z-A", value: "DESC" }]

    return (
        <div className="w-full flex flex-col justify-center items-center gap-4 font-inter">
            <div className='flex flex-col gap-2 w-72 lg:flex-row lg:gap-4 lg:w-10/12 lg:mx-auto lg:my-6 '>
                <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={handleSearchSubmit} placeholder="Search by city or province" />
                <CustomDropdownURLSearch
                    id="sort"
                    options={options}
                    onChange={handleDropdownChange}
                    placeholder={"Sort by city"}
                />            
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
