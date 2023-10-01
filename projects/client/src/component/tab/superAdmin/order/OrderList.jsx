import React, { useEffect, useState } from 'react'
import { Pagination } from 'flowbite-react';
import ModalOrder from '../../../ModalOrder';
import SearchInputBar from '../../../SearchInputBar';
import CustomDropdownURLSearch from '../../../CustomDropdownURLSearch';
import { useNavigate } from 'react-router-dom';
import OrderListTable from '../../../admin/SuperAdminOrderListComponent/OrderListTable';
import { getAllOrders } from '../../../../api/transaction'
import { getAllBranchesNoPagination } from '../../../../api/branch'

export default function OrderList() {
  const [orderData, setOrderData] = useState([])
  const [allBranchData, setAllBranchData] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const orders = async () => {
    try {
      const response = await getAllOrders(token, params.get("page") || 1, params.get("branchId") || "", params.get("search") || "", params.get("status") || "", params.get("sort") || "", params.get("startDate") || "", params.get("endDate") || "")
      if (response.data) {
        setOrderData(response.data.data?.rows)
        setTotalPages(Math.ceil(response.data.pagination?.totalData / response.data.pagination?.perPage));

      } else {
        setOrderData([])
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.message)
      }
    }
  }
  const allBranch = async () => {
    const response = await getAllBranchesNoPagination(token)
    if (response.data) {
      const data = response.data.data?.rows;
      if (data) {
        let options = data.map((d) => ({
          label: `${d.City?.city_name}, ${d.City?.Province?.province_name}`,
          value: d.id,
        }));
        options.splice(0, 0, { label: "All branch", value: "" });
        setAllBranchData(options);
      } else {
        setAllBranchData([]);
      }
    }
  }

  useEffect(() => {
    orders()
    allBranch()
  }, [currentPage, filter])

  const options = [
    { label: "Default", value: "" },
    { label: "order date: oldest", value: "ASC" },
    { label: "order date: newest", value: "DESC" },
  ];

  const options2 = [
    { label: "Default", value: "" },
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

  function getBranchLabel(branchId) {
    const selectedBranch = allBranchData.find((branch) => Number(branch.value) === Number(branchId));
    return selectedBranch ? selectedBranch.label : 'Default';
  }

  let branchLabel = getBranchLabel(params.get("branchId"));

  useEffect(() => {
    branchLabel = getBranchLabel(params.get("branchId"));
  }, [filter])
  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6">
          <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={(searchValue) => handleFilterChange("search", searchValue)} placeholder="Search by invoice code" />
        </div>
        <div className="mx-auto py-2 w-5/6">
          <CustomDropdownURLSearch id="branchId" options={allBranchData} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Branch"} />
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
        <div className="w-full text-left my-2">Showing Orders From Branch: <span className="font-bold text-maingreen">{branchLabel}</span></div>
        <div className="overflow-x-auto w-full">
          <OrderListTable orderData={orderData} setSelectedOrder={setSelectedOrder} />
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
