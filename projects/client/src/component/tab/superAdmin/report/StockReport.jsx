import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";

import CustomDropDown from "../../../CustomDropdown";

export default function StockReport() {
  const [dataStockHistory, setDataStockHistory] = useState([]);
  const [dataAllBranchProduct, setDataAllBranchProduct] = useState([]);
  const [dataAllBranch, setDataAllBranch] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    branch: "1",
    sort: "",
    status: "",
    branch_product_id: "",
    startDate: "",
    endDate: "",
  });
  const fetchDataAllBranch = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-all-branch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data.data.rows;
      if (data) {
        let options = data.map((d) => ({
          label: `${d.City?.city_name}, ${d.City?.Province.province_name}`,
          value: d.id,
        }));

        setDataAllBranch(options);
      } else {
        setDataAllBranch([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDataStockHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/stock-history-sa?page=${currentPage}&filterBranch=${filter.branch}&sortDate=${filter.sort}&filterStatus=${filter.status}&filterBranchProduct=${filter.branch_product_id}&startDate=${filter.startDate}&endDate=${filter.endDate}`,
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
        `${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-branch-products-sa`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const data = response.data.data;
        console.log(data, "ini data");
        if (data) {
          const filteredData = data.filter(
            (d) => d.branch_id === parseInt(filter.branch)
          );
          const options = filteredData.map((d) => ({
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
  console.log(filter.branch, "ini filter");
  useEffect(() => {
    fetchDataStockHistory();
    fetchAllBranchProduct();
    fetchDataAllBranch();
  }, [currentPage, filter]);

  const onPageChange = (page) => {
    setDataStockHistory([]);
    setCurrentPage(page);
  };

  const renderSwitch = (param, data) => {
    switch (param) {
      case "restock by admin":
        return <td className="px-6 py-4 text-maingreen">{`+${data}`}</td>;
      case "reduced by admin":
        return <td className="px-6 py-4 text-reddanger">{`-${data}`}</td>;
      case "purchased by user":
        return <td className="px-6 py-4 text-reddanger">{`-${data}`}</td>;
      case "canceled by user":
        return <td className="px-6 py-4 text-maingreen">{`-${data}`}</td>;
      case "canceled by admin":
        return <td className="px-6 py-4 text-maingreen">{`-${data}`}</td>;
      default:
        return <td className="px-6 py-4">{param}</td>;
    }
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
          <td className="px-6 py-4">{`${data.Branch_Product.Product.name} [ ${data.Branch_Product.Product?.weight}${data.Branch_Product.Product.unitOfMeasurement} / pack ]`}</td>
          <td className="px-6 py-4">{data.totalQuantity}</td>
          <td className="px-6 py-4">
            {renderSwitch(data.status, data.quantity)}
          </td>
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
  console.log(dataAllBranch, "ini branch");
  return (
    <div className="w-5/6 mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Branch
          </label>
          <select
            id="branch"
            defaultValue={dataAllBranch[0]?.value}
            onChange={(e) => handleFilterChange(e)}
            className="w-full mt-1 bg-lightgrey rounded-md focus:border-maindarkgreen border-none"
          >
            {dataAllBranch.map((obj) => {
              return <option value={obj.value}>{obj.label}</option>;
            })}
          </select>
        </div>
        <div className="mx-auto py-2 w-5/6">
          <CustomDropDown
            options={dataAllBranchProduct}
            onChange={(e) => handleChangeDropdown(e, "branch_product_id")}
            placeholder={"filter by product"}
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
              className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0 "
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
          <CustomDropDown
            options={options}
            onChange={(e) => handleChangeDropdown(e, "sort")}
            placeholder={"Sort by create date"}
          />
          <CustomDropDown
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
                    no branch product found
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
