import React from "react";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";
import { useNavigate } from "react-router-dom"

import rupiah from "../../../helpers/rupiah";
import { getAllVoucher } from "../../../api/promotion";
import CustomDropdownURLSearch from "../../CustomDropdownURLSearch";

export default function AllVoucher() {
  const [dataAllVoucher, setDataAllVoucher] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const fetchDataAllVoucher = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await getAllVoucher(token, params.get("page") || 1, params.get("sort") || "", params.get("voucher_type_id") || "")
      if (response.data) {
        const { data: responseData, pagination } = response.data;
        if (responseData) {
          setDataAllVoucher(responseData.rows);
          setTotalPages(Math.ceil(pagination.totalData / pagination.perPage));
        } else {
          setDataAllVoucher([]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllVoucher();
  }, [currentPage, filter]);

  const onPageChange = (page) => {
    setDataAllVoucher([]);
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

  const arrayData = [];
  const TableRow = () => {
    dataAllVoucher?.forEach((data, index) => {
      arrayData.push(
        <tr
          key={data.id}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
        >
          <td className="px-6 py-4">{data.Voucher_Type.type}</td>
          <td className="px-6 py-4">
            {data.voucher_type_id == 1
              ? "-"
              : data.voucher_type_id == 2
                ? `${data.amount}%`
                : rupiah(data.amount)}
          </td>
          <td className="px-6 py-4">{!data.usedLimit ? "-":`${data.usedLimit}`}</td>
          <td className="px-6 py-4">
            {data.minTransaction ? rupiah(data.minTransaction) : "-"}
          </td>
          <td className="px-6 py-4">
            {data.maxDiscount ? rupiah(data.maxDiscount) : "-"}
          </td>
          <td className="px-6 py-4">
            {data.expiredDate
              ? new Date(data.expiredDate).toLocaleDateString()
              : "-"}
          </td>
          <td className="px-6 py-4">
            {new Date(data.createdAt).toLocaleDateString()}
          </td>
          <td className="px-6 py-4">
            {data.expiredDate == null ? (
              "-"
            ) : new Date(data.expiredDate).setHours(0, 0, 0, 0) <
              new Date().setHours(0, 0, 0, 0) ? (
              <span className=" text-reddanger">expired</span>
            ) : (
              <span className=" text-maingreen">on going</span>
            )}
          </td>
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
    {
      label: "All Voucher Type",
      value: "",
    },
    {
      label: "Free Shipping",
      value: 1,
    },
    {
      label: "Percentage",
      value: 2,
    },
    {
      label: "Nominal",
      value: 3,
    },
  ];

  return (
    <div className="w-5/6 mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropdownURLSearch id="sort" options={options} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Created Date"} />
          <CustomDropdownURLSearch id="voucher_type_id" options={options2} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Discount Type"} />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase border-b-2 border-maingreen ">
              <tr>
                <th scope="col" className="px-6  py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Usage limit
                </th>
                <th scope="col" className="px-6 py-3">
                  Min transaction
                </th>
                <th scope="col" className="px-6 py-3">
                  Max Discount
                </th>
                <th scope="col" className="px-6 py-3">
                  Expired date
                </th>
                <th scope="col" className="px-6 py-3">
                  Create date
                </th>
              </tr>
            </thead>
            <tbody>
              {dataAllVoucher.length != 0 ? (
                <TableRow />
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center  text-base">
                    no vouchers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  );
}
