import React, {useEffect, useState} from 'react'
import axios from 'axios'
import dayjs from 'dayjs';
import { LuEdit } from 'react-icons/lu';
import SearchBar from '../../../SearchBar';
import CustomDropdown from '../../../CustomDropdown'
import { Pagination } from 'flowbite-react';
import Label from '../../../Label';
import ModalOrder from '../../../ModalOrder';
import SearchInputBar from '../../../SearchInputBar';
import {Link, useNavigate} from 'react-router-dom'
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';

export default function OrderList() {
    const [orderData, setOrderData] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const orders = async() => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/branch-orders?page=${params.get("page") || 1}&search=${params.get("search") || ""}&filterStatus=${params.get("status") || ""}&sortDate=${params.get("sort") || ""}&startDate=${params.get("startDate") || ""}&endDate=${params.get("endDate") || ""}`, {
                headers: {
                    'Authorization' : `Bearer ${token}`
                }
            })
            if (response.data){
                setOrderData(response.data.data?.rows)
                setTotalPages(Math.ceil(response.data.pagination?.totalData / response.data.pagination?.perPage));

            } else {
                setOrderData([])
            }
        }catch(error){
            if(error.response){
                console.log(error.response.message)
            }
        }
    }

    useEffect(() => {
        orders()
    }, [currentPage, filter])

    const options = [
        { label: "Sort by order date", value: "" },
        { label: "order date: oldest", value: "ASC" },
        { label: "order date: newest", value: "DESC" },
    ];

    const options2 = [
        { label: "Filter by status", value: "" },
        { label: "Waiting for payment", value: "Waiting for payment" },
        { label: "Waiting for payment confirmation", value: "Waiting for payment confirmation" },
        { label: "Processing", value: "Processing" },
        { label: "Delivering", value: "Delivering" },
        { label: "Canceled", value: "Canceled" },
    ];

    const onPageChange = (page) => {
        setOrderData([]);
        setCurrentPage(page);
    };

    const labelColor = (text) => {
        switch(text) {
            case "Waiting for payment":
                return "gray";
                break;
            case "Waiting for payment confirmation":
                return "purple";
                break;
            case "Processing":
                return "yellow";
                break;
            case "Delivering":
                return "blue";
                break;
            case "Order completed":
                return "green";
                break
            case "Canceled":
                return "red";
                break;
            default:
                return "";
                break;
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
    
    return (
        <div className="w-5/6 mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6">
            <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={handleSearchSubmit} placeholder="Search by invoice code" />
        </div>
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0"
              onChange={handleDropdownChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0"
              onChange={handleDropdownChange}
            />
          </div>
        </div>
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropdownURLSearch
            id="sort"
            options={options}
            onChange={handleDropdownChange}
            placeholder={"Sort by order date"}
          />
          <CustomDropdownURLSearch
            id="status"
            options={options2}
            onChange={handleDropdownChange}
            placeholder={"Filter by status"}
          />
        </div>
        <div className="w-72 overflow-x-auto lg:w-full">
          <table className="w-full text-center font-inter">
            <thead className="text-maingreen uppercase border-b-2 border-maingreen ">
              <tr>
                <th scope="col" className="px-2 py-4s" style={{ width: '30%' }}>Invoice Code</th>
                <th scope="col" className="px-2 py-4" style={{ width: '30%' }}>Status</th>
                <th scope="col" className="px-2 py-4" style={{ width: '30%' }}>Order Date</th>
                <th className="py-2 px-4" style={{ width: '10%' }}></th>
              </tr>
            </thead>
            <tbody className='text-black text-sm'>
                {orderData.length !==0 ? orderData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-100 border-b-2 border-gray-200">
                        <td className="py-2 px-4" style={{ width: '30%' }} onClick={() => setSelectedOrder(data.id)}>{data.invoiceCode}</td>
                        <td className="py-2 px-4 flex justify-center" onClick={() => setSelectedOrder(data.id)}><Label text={data.orderStatus} labelColor={labelColor(data.orderStatus)} /></td>
                        <td className="py-2 px-4" style={{ width: '30%' }} onClick={() => setSelectedOrder(data.id)}>{dayjs(data.orderDate).format("DD/MM/YYYY")}</td>
                        <td className="py-2 px-4" style={{ width: '10%' }}><LuEdit className='text-maingreen w-6 h-6'/></td>
                    </tr>
                )) : (
                <tr>
                    <td colSpan="3" className='py-4 text-center'>No Orders Found</td>
                </tr>
                )}
            </tbody>
          </table>
        </div>
        {selectedOrder && (
                    <ModalOrder
                        orderId={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                    />
                )}
        <div className="flex justify-center">
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
    </div>
    )
}
