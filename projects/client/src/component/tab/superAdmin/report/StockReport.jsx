import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";
import { useNavigate } from "react-router-dom";

import CustomDropdownURLSearch from "../../../CustomDropdownURLSearch";

export default function StockReport() {
  const [dataStockHistory, setDataStockHistory] = useState([]);
  const [dataAllBranchProduct, setDataAllBranchProduct] = useState([]);
  const [dataAllBranch, setDataAllBranch] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem("token");
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  const fetchDataAllBranch = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-all-branch`, { headers: { Authorization: `Bearer ${token}` } });
      const data = response.data.data.rows;
      if (data) {
        let options = data.map((d) => ({ label: `${d.City?.city_name}, ${d.City?.Province.province_name}`, value: d.id, }));
        setDataAllBranch(options);
      } else {
        setDataAllBranch([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDataStockHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/stock-history-sa?page=${params.get("page") || 1}&filterBranch=${params.get("branch_id") || ""}&sortDate=${params.get("sort") || ""}&filterStatus=${params.get("status") || ""}&filterBranchProduct=${params.get("branch_product_id") || ""}&startDate=${params.get("startDate") || ""}&endDate=${params.get("endDate") || ""}`, { headers: { Authorization: `Bearer ${token}` } });
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
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-branch-products-sa`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const filteredData = data.filter(
            (d) => d.branch_id === parseInt(params.get("branch_id"))
          );
          const options = filteredData.map((d) => ({ label: `${d.Product?.name} [ ${d.Product?.weight}${d.Product.unitOfMeasurement} / pack ]`, value: d.id, }));
          options.splice(0, 0, { label: "All Product", value: "" });
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
    fetchDataAllBranch();
    if (params.get("branch_id")) {
      setSelectedBranch(true)
    }
  }, [currentPage, filter]);

  const renderSwitch = (param, data) => {
    switch (param) {
      case "restock by admin":
        return <td className="px-6 py-4 text-maingreen">{`+${data}`}</td>;
      case "reduced by admin":
        return <td className="px-6 py-4 text-reddanger">{`-${data}`}</td>;
      case "purchased by user":
        return <td className="px-6 py-4 text-reddanger">{`-${data}`}</td>;
      case "canceled by user":
        return <td className="px-6 py-4 text-maingreen">{`+${data}`}</td>;
      case "canceled by admin":
        return <td className="px-6 py-4 text-maingreen">{`+${data}`}</td>;
      default:
        return <td className="px-6 py-4">{param}</td>;
    }
  };

  const arrayData = [];
  const TableRow = () => {
    dataStockHistory?.forEach((data, index) => {
      arrayData.push(
        <tr key={data.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <td className="px-6 py-4">{`${data.Branch_Product.Product.name} [ ${data.Branch_Product.Product?.weight}${data.Branch_Product.Product.unitOfMeasurement} / pack ]`}</td>
          <td className="px-6 py-4">{data.totalQuantity}</td>
          <td className="px-6 py-4">{renderSwitch(data.status, data.quantity)}</td>
          <td className="px-6 py-4">{data.status}</td>
          <td className="px-6 py-4">{new Date(data.createdAt).toLocaleDateString()}</td>
        </tr>
      );
    });

    return arrayData;
  };

  const options = [
    { label: "Default", value: "" },
    { label: "Created Oldest", value: "ASC" },
    { label: "Created Latest", value: "DESC" },
  ];

  const options2 = [
    { label: "All Status", value: "" },
    { label: "Restock by Admin", value: "restock by admin" },
    { label: "Reduced by Admin", value: "reduced by admin" },
    { label: "Canceled by Admin", value: "canceled by admin" },
    { label: "Canceled by User", value: "canceled by user" },
    { label: "Purchased by User", value: "purchased by user" },
  ];

  const onPageChange = (page) => {
    setDataStockHistory([]);
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

  return (
    <div>
      <div className="mx-auto w-5/6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
        <CustomDropdownURLSearch id="branch_id" options={dataAllBranch} onChange={(e) => { handleFilterChange(e.target.id, e.target.value); setSelectedBranch(true) }} placeholder={"Select by Branch"} />
      </div>
      {!selectedBranch ? (
        <div>
          <hr className="m-4" />
          <div className="font-inter text-center text-maingreen w-11/12 mx-auto">Please select a branch to view stock report</div>
        </div>
      ) : (
        <div className="w-5/6 mx-auto">
          <div className="relative">
            <div className="mx-auto py-2 w-5/6">
              <CustomDropdownURLSearch id="branch_product_id" options={dataAllBranchProduct} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter By Product"} />
            </div>
            <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input id="startDate" type="date" className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0 " value={params.get("startDate") || ""} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input id="endDate" type="date" className="w-full mt-1 bg-lightgrey rounded-md border-none border-gray-300 focus:border-maindarkgreen focus:ring-0" value={params.get("endDate") || ""} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} />
              </div>
            </div>
            <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <CustomDropdownURLSearch id="sort" options={options} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Created Date"} />
              <CustomDropdownURLSearch id="status" options={options2} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Status"} />
            </div>
            <div className=" overflow-x-auto w-full">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase border-b-2 border-maingreen ">
                  <tr>
                    <th scope="col" className="px-6 py-3">Product</th>
                    <th scope="col" className="px-6 py-3"> Total qty.</th>
                    <th scope="col" className="px-6 py-3">Qty.</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created date</th>
                  </tr>
                </thead>
                <tbody>
                  {dataStockHistory.length != 0 ? (<TableRow />) : (<tr> <td colSpan="7" className="py-4 text-center  text-base">No Stock Report Found</td> </tr>)}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
