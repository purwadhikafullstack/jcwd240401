import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Pagination } from "flowbite-react";
import { LuEdit } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
import CustomDropdown from "../CustomDropdown";
import Label from "../Label";


export default function UserOrderContent() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    sort: "",
    startDate: "",
    endDate: "",
  });
  const token = localStorage.getItem("token");

  const orders = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/orders?page=${currentPage}&search=${filter.search}&filterStatus=${filter.status}&sortDate=${filter.sort}&startDate=${filter.startDate}&endDate=${filter.endDate}`,
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
    { label: "Sort by order date", value: "" },
    { label: "order date: oldest", value: "ASC" },
    { label: "order date: newest", value: "DESC" },
  ];

  const options2 = [
    { label: "Filter by status", value: "" },
    { label: "Waiting for payment", value: "Waiting for payment" },
    {
      label: "Waiting for payment confirmation",
      value: "Waiting for payment confirmation",
    },
    { label: "Processing", value: "Processing" },
    { label: "Delivering", value: "Delivering" },
    { label: "Canceled", value: "Canceled" },
  ];

  const handleChangeDropdown = (obj, name) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: obj.value,
    }));
  };
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.id]: e.target.value,
    });
  };

  const onPageChange = (page) => {
    setOrderData([]);
    setCurrentPage(page);
  };

  const handleClick = (id) => {
    navigate(`/user/payment/${id}`);
  };

  const labelColor = (text) => {
    switch (text) {
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
        break;
      case "Canceled":
        return "red";
        break;
      default:
        return "";
        break;
    }
  };

  return (
    <div className="w-5/6 mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6">
          <SearchBar
            id={"search"}
            value={filter.search}
            type="text"
            onChange={handleFilterChange}
            placeholder="Search by Invoice Code"
          />
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
              value={filter.startDate}
              onChange={handleFilterChange}
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
              value={filter.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropdown
            options={options}
            onChange={(e) => handleChangeDropdown(e, "sort")}
            placeholder={"Sort by order date"}
          />
          <CustomDropdown
            options={options2}
            onChange={(e) => handleChangeDropdown(e, "status")}
            placeholder={"Filter by status"}
          />
        </div>
        <div className="w-72 overflow-x-auto lg:w-full">
          <table className="w-full text-center font-inter">
            <thead className="text-maingreen uppercase border-b-2 border-maingreen ">
              <tr>
                <th scope="col" className="px-2 py-4s" style={{ width: "30%" }}>
                  Invoice Code
                </th>
                <th scope="col" className="px-2 py-4" style={{ width: "30%" }}>
                  Status
                </th>
                <th scope="col" className="px-2 py-4" style={{ width: "30%" }}>
                  Order Date
                </th>
              </tr>
            </thead>
            <tbody className="text-black text-sm">
              {orderData.length !== 0 ? (
                orderData.map((data, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 border-b-2 border-gray-200"
                  >
                    <td
                      className="py-2 px-4"
                      style={{ width: "30%" }}
                      onClick={() => handleClick(data.id)}
                    >
                      {data.invoiceCode}
                    </td>
                    <td
                      className="py-2 px-4 flex justify-center"
                      onClick={() => handleClick(data.id)}
                    >
                      <Label
                        text={data.orderStatus}
                        labelColor={labelColor(data.orderStatus)}
                      />
                    </td>
                    <td
                      className="py-2 px-4"
                      style={{ width: "30%" }}
                      onClick={() => handleClick(data.id)}
                    >
                      {dayjs(data.orderDate).format("DD/MM/YYYY")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center">
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  );
}