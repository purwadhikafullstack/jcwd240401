import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";
import dayjs from "dayjs";

export default function StockReport() {
  const [dataStockHistory, setDataStockHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    sort: "",
    branch_product_id: "",
  });
  const fetchDataStockHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/stock-history?page=${currentPage}&sortDate=${filter.sort}&filterBranchProduct=${filter.branch_product_id}`,
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
  useEffect(() => {
    fetchDataStockHistory();
  }, [currentPage, filter]);

  const onPageChange = (page) => {
    setDataStockHistory([]);
    setCurrentPage(page);
  };

  //table data
  const arrayData = [];
  const tomorrow = dayjs().add(1, "day");

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
    { label: "Filter by discount type", value: "" },
    { label: "Buy one get one", value: 1 },
    { label: "Discount by percentage", value: 2 },
    { label: "Discount by nominal", value: 3 },
  ];

  const handleChangeDropdown = (obj, name) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: obj.value,
    }));
  };

  return (
    <div className="w-5/6 mx-auto">
      <div className="relative">
        {/* <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropdown
            options={options}
            onChange={(e) => handleChangeDropdown(e, "sort")}
            placeholder={"Sort by expired date"}
          />
          <CustomDropdown
            options={options2}
            onChange={(e) => handleChangeDropdown(e, "discount_type_id")}
            placeholder={"filter by discount type"}
          />
        </div> */}
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
