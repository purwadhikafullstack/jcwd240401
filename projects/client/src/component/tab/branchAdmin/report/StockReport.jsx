import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";
import dayjs from "dayjs";

import CustomDropDowm from "../../../CustomDropdown";


export default function StockReport() {
  const [dataStockHistory, setDataStockHistory] = useState([]);
  const [dataAllBranchProduct, setDataAllBranchProduct] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    sort: "",
    search: "",
    status: "",
    branch_product_id: "",
  });
  const fetchDataStockHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/stock-history?page=${currentPage}&sortDate=${filter.sort}&search=${filter.search}&filterStatus=${filter.status}&filterBranchProduct=${filter.branch_product_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const { data: responseData, pagination } = response.data;
        if (responseData) {
          setDataStockHistory(responseData.rows);
          setTotalPages(Math.ceil(pagination.totalData / pagination.perPage));
        } else {
          setDataStockHistory([]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAllBranchProduct = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/no-pagination-branch-products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const data = response.data.data;
        if (data) {
          let options = data.map((d) => ({
            label: `${d.Product?.name} [ ${d.Product?.weight}${d.Product.unitOfMeasurement} / pack ]`,
            value: d.id,
          }));
          options.splice(0, 0, { label: "filter by name", value: "" });
          setDataAllBranchProduct(options);
        } else {
          setDataAllBranchProduct([]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataStockHistory();
    fetchAllBranchProduct();
  }, [currentPage, filter]);

  const onPageChange = (page) => {
    setDataStockHistory([]);
    setCurrentPage(page);
  };

  //table data
  const arrayData = [];
  const TableRow = () => {
    dataStockHistory?.forEach((data, index) => {
      arrayData.push(
        <tr
          key={data.id}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
        >
          <td className="px-6 py-4">{data.Branch_Product.Product.name}</td>
          <td className="px-6 py-4">{data.totalQuantity}</td>
          <td className="px-6 py-4">{data.quantity}</td>
          <td className="px-6 py-4">{data.status}</td>
          <td className="px-6 py-4">
            {new Date(data.createdAt).toLocaleDateString()}
          </td>
        </tr>
      );
    });

    return arrayData;
  };

  const options = [
    { label: "Sort By create date", value: "" },
    { label: "create date: oldest", value: "ASC" },
    { label: "create date: newest", value: "DESC" },
  ];

  const options2 = [
    { label: "Filter by status", value: "" },
    { label: "restock by admin", value: "restock by admin" },
    { label: "reduced by admin", value: "reduced by admin" },
    { label: "canceled by admin", value: "canceled by admin" },
    { label: "canceled by user", value: "canceled by user" },
    { label: "purchased by user", value: "purchased by user" },
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

  return (
    <div className="w-5/6 mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6">
          <CustomDropDowm
            options={dataAllBranchProduct}
            onChange={(e) => handleChangeDropdown(e, "branach_poduct_id")}
            placeholder={"filter by product"}
          />
          {/* <SearchBar
            id={"search"}
            value={filter.search}
            type="text"
            onChange={handleFilterChange}
            placeholder="Enter here to search product by name..."
          /> */}
        </div>
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropDowm
            options={options}
            onChange={(e) => handleChangeDropdown(e, "sort")}
            placeholder={"Sort by expired date"}
          />
          <CustomDropDowm
            options={options2}
            onChange={(e) => handleChangeDropdown(e, "status")}
            placeholder={"filter by status"}
          />
        </div>
        <div className="w-72 overflow-x-auto lg:w-full">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase border-b-2 border-maingreen ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product
                </th>
                <th scope="col" className="px-6 py-3">
                  Total qty.
                </th>
                <th scope="col" className="px-6 py-3">
                  Qty.
                </th>
                <th scope="col" className="px-6 py-3">
                  status
                </th>
                <th scope="col" className="px-6 py-3">
                  Created date
                </th>
              </tr>
            </thead>
            <tbody>
              {dataStockHistory.length != 0 ? (
                <TableRow />
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center  text-base">
                    no discounts found
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
