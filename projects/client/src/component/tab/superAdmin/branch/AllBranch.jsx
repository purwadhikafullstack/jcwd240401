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
            axios.get(`http://localhost:8000/api/admins/branch?page=${currentPage}&search=${filter.search}&sortOrder=${filter.sort}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then((response) => {
                setBranchData(response.data?.data?.rows)
                setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
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

    const options = [{ label: "Sort By City", value: "" }, { label: "City: A-Z", value: "ASC" }, { label: "City: Z-A", value: "DESC" }]

    return (
        <div className="w-full flex flex-col justify-center items-center gap-4 font-inter">
            <div className='flex flex-col gap-2 w-72 lg:flex-row lg:gap-4 lg:w-10/12 lg:mx-auto lg:my-6 '>
                <SearchBar value={filter.search} type="text" onChange={handleSearchValue} placeholder="Search branch by city or province" />
                <CustomDropdown options={options} onChange={handleChangeDropdown} placeholder={"Sort by City"} />
            </div>
            <div className="hidden lg:w-full lg:h-10 lg:bg-white lg:border-maingreen lg:border-b-2 lg:grid lg:grid-cols-9 lg:gap-3 lg:font-bold">
                <div className="col-span-1 flex justify-center font-inter items-center text-maingreen">No</div>
                <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">City</div>
                <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Province</div>
                <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Branch Admin</div>
                <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Contact</div>
            </div>
            {branchData.map((data, index) => (
            <div className="hidden lg:w-full lg:h-full lg:grid lg:grid-cols-9 lg:gap-3">
                <div className="col-span-1 flex justify-center text-center font-inter items-center">{index + 1}</div>
                <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.City?.city_name}</div>
                <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.City?.Province?.province_name}</div>
                <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.User?.name}</div>
                <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.User?.phone}</div>
            </div>
            ))}
            <div className="lg:hidden w-full h-10 bg-white border-maingreen border-b-2 grid grid-cols-5 gap-3 font-bold">
                <div className="col-span-1 flex justify-center font-inter items-center text-maingreen">No</div>
                <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">City</div>
                <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Province</div>
            </div>
            {branchData.map((data, index) => (
            <div className="lg:hidden w-full h-full grid grid-cols-5 gap-3">
                <div className="col-span-1 flex justify-center text-center font-inter items-center">{index + 1}</div>
                <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.City?.city_name}</div>
                <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.City?.Province?.province_name}</div>
            </div>
            ))}
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
