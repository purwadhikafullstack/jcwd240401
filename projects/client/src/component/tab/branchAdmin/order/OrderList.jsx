import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import { LuEdit } from 'react-icons/lu';
import { Pagination } from 'flowbite-react';
import Label from '../../../Label';
import ModalOrder from '../../../ModalOrder';
import SearchInputBar from '../../../SearchInputBar';
import { Link, useNavigate } from 'react-router-dom'
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';
import { orderStatusLabelColor } from '../../../../helpers/labelColor';
import { getBranchOrders } from '../../../../api/transaction'

export default function OrderList() {
  const [orderData, setOrderData] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const orders = async () => {
    try {
      const response = await getBranchOrders(token, params.get("page") || 1, params.get("search") || "", params.get("status") || "", params.get("sort") || "", params.get("startDate") || "", params.get("endDate") || "")
      if (response.data) {
        setOrderData(response.data.data?.rows)
        setTotalPages(Math.ceil(response.data.pagination?.totalData / response.data.pagination?.perPage));

      } else {
        setOrderData([])
      }
    } catch (error) {
      if (error.response) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    orders()
  }, [currentPage, filter])

  const options = [
    { label: "Default", value: "" },
    { label: "order date: oldest", value: "ASC" },
    { label: "order date: newest", value: "DESC" },
  ];

  const options2 = [
    { label: "All Status", value: "" },
    { label: "Waiting for payment", value: "Waiting for payment" },
    { label: "Waiting for payment confirmation", value: "Waiting for payment confirmation" },
    { label: "Processing", value: "Processing" },
    { label: "Delivering", value: "Delivering" },
    { label: "Canceled", value: "Canceled" },
    { label: "Order completed", value: "Order completed" }
  ];

  const onPageChange = (page) => {
    setOrderData([]);
    setCurrentPage(page);
    const newFilter = new URLSearchParams(filter.toString());
    newFilter.set("page", page.toString());
    setFilter(newFilter);
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    navigate({ search: params.toString() });
  };

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

  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6">
          <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={(searchValue) => handleFilterChange("search", searchValue)} placeholder="Search by Invoice Code" />
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
              onChange={(e) => handleFilterChange(e.target.id, e.target.value)}
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
              onChange={(e) => handleFilterChange(e.target.id, e.target.value)}
            />
          </div>
        </div>
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropdownURLSearch
            id="sort"
            options={options}
            onChange={(e) => handleFilterChange(e.target.id, e.target.value)}
            placeholder={"Sort by Order Date"}
          />
          <CustomDropdownURLSearch
            id="status"
            options={options2}
            onChange={(e) => handleFilterChange(e.target.id, e.target.value)}
            placeholder={"Filter by Status"}
          />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center font-inter">
            <thead className="text-maingreen uppercase border-b-2 border-maingreen ">
              <tr>
                <th scope="col" className="px-2 py-4s" style={{ width: '25%' }}>Invoice Code</th>
                <th scope="col" className="px-2 py-4" style={{ width: '40%' }}>Status</th>
                <th scope="col" className="px-2 py-4" style={{ width: '25%' }}>Order Date</th>
                <th className="py-2 px-4" style={{ width: '10%' }}></th>
              </tr>
            </thead>
            <tbody className='text-black text-sm'>
              {orderData.length !== 0 ? orderData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-100 border-b-2 border-gray-200">
                  <td className="py-2 px-4" style={{ width: '30%' }} onClick={() => setSelectedOrder(data.id)}>{data.invoiceCode}</td>
                  <td className="py-2 px-4 flex justify-center" onClick={() => setSelectedOrder(data.id)}><Label text={data.orderStatus} labelColor={orderStatusLabelColor(data.orderStatus)} /></td>
                  <td className="py-2 px-4" style={{ width: '30%' }} onClick={() => setSelectedOrder(data.id)}>{dayjs(data.orderDate).format("DD/MM/YYYY")}</td>
                  <td className="py-2 px-4" style={{ width: '10%' }}>{data.orderStatus === "Waiting for payment confirmation" || data.orderStatus === "Processing" ? <Link to={`order/${data.id}/modify`}><LuEdit className='text-maingreen w-6 h-6' /></Link> : null}</td>
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
