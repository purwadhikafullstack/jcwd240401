import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Pagination } from "flowbite-react";
import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import Label from "../Label";
import CustomDropdownURLSearch from "../CustomDropdownURLSearch";
import SearchInputBar from "../SearchInputBar";
import UnauthenticatedContent from "./UnauthenticatedContent";

export default function UserOrderContent() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const token = localStorage.getItem("token");
  const profile = useSelector((state) => state.auth.profile);

  const orders = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/orders?page=${params.get("page") || 1}&search=${params.get("search") || ""}&filterStatus=${params.get("status") || ""}&sortDate=${params.get("sortDate") || ""}&startDate=${params.get("startDate") || ""}&endDate=${params.get("endDate") || ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setOrderData(response.data.data?.rows);
        setTotalPages(
          Math.ceil(
            response.data.pagination?.totalData /
            response.data.pagination?.perPage
          )
        );
      } else {
        setOrderData([]);
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.message);
      }
    }
  };

  useEffect(() => {
    orders();
  }, [currentPage, filter]);

  const options = [
    { label: "Default", value: "" },
    { label: "Created Oldest", value: "ASC" },
    { label: "Created Latest", value: "DESC" },
  ];

  const options2 = [
    { label: "All Status", value: "" },
    { label: "Waiting for payment", value: "Waiting for payment" },
    {
      label: "Waiting for payment confirmation",
      value: "Waiting for payment confirmation",
    },
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

  const handleClick = (id) => {
    navigate(`/user/payment/${id}`);
  };

  const labelColor = (text) => {
    switch (text) {
      case "Waiting for payment":
        return "gray";
      case "Waiting for payment confirmation":
        return "purple";
      case "Processing":
        return "yellow";
      case "Delivering":
        return "blue";
      case "Order completed":
        return "green";
      case "Canceled":
        return "red";
      default:
        return "";
    }
  };

  return (
    <div className="py-2 sm:py-4 px-2 flex flex-col w-full sm:max-w-3xl mx-auto gap-4 lg:justify-center font-inter">
      {token && profile.role === "3" ? (
        <div className="w-5/6 mx-auto">
          <div className="relative">
            <div className="mx-auto py-2 w-5/6">
              <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={(searchValue) => handleFilterChange("search", searchValue)} placeholder="Search by Invoice Code" />
            </div>
            <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input id="startDate" type="date" className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0" value={params.get("startDate") || ""} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input id="endDate" type="date" className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0" value={params.get("endDate") || ""} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} />
              </div>
            </div>
            <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <CustomDropdownURLSearch id="sortDate" options={options} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Order Date"} />
              <CustomDropdownURLSearch id="status" options={options2} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Status"} />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-center font-inter">
                <thead className="text-maingreen uppercase border-b-2 border-maingreen ">
                  <tr>
                    <th scope="col" className="px-2 py-4s" style={{ width: "30%" }}>Invoice Code</th>
                    <th scope="col" className="px-2 py-4" style={{ width: "30%" }}>Status</th>
                    <th scope="col" className="px-2 py-4" style={{ width: "30%" }}>Order Date</th>
                  </tr>
                </thead>
                <tbody className="text-black text-sm">
                  {orderData.length !== 0 ? (
                    orderData.map((data, index) => (
                      <tr key={index} className="hover:bg-gray-100 border-b-2 border-gray-200" >
                        <td className="py-2 px-4" style={{ width: "30%" }} onClick={() => handleClick(data.id)}>
                          {data.invoiceCode}
                        </td>
                        <td className="py-2 px-4 flex justify-center" onClick={() => handleClick(data.id)}>
                          <Label
                            text={data.orderStatus}
                            labelColor={labelColor(data.orderStatus)}
                          />
                        </td>
                        <td className="py-2 px-4" style={{ width: "30%" }} onClick={() => handleClick(data.id)}>
                          {dayjs(data.orderDate).format("DD/MM/YYYY")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-center">No Orders Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
            </div>
          </div>
        </div>
      ) : (
        <UnauthenticatedContent />
      )}
    </div>
  );
}
