import React from "react";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"

import rupiah from "../../../helpers/rupiah";
import { getAllDiscount } from "../../../api/promotion";
import CustomDropdownURLSearch from "../../CustomDropdownURLSearch";

export default function AllDiscount() {
  const [dataAllDiscount, setDataAllDiscount] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(new URLSearchParams());
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fetchDataAllDiscount = async () => {
    try {
      const response = await getAllDiscount(
        token,
        params.get("page") || 1, params.get("sort") || "", params.get("discount_type_id") || ""
      );
      if (response.data) {
        const { data: responseData, pagination } = response.data;
        if (responseData) {
          setDataAllDiscount(responseData.rows);
          setTotalPages(Math.ceil(pagination.totalData / pagination.perPage));
        } else {
          setDataAllDiscount([]);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchDataAllDiscount();
  }, [currentPage, filter]);

  const onPageChange = (page) => {
    setDataAllDiscount([]);
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
  const tomorrow = dayjs().add(1, "day");

  const TableRow = () => {
    dataAllDiscount?.forEach((data, index) => {
      arrayData.push(
        <tr
          key={data.id}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
        >
          <td className="px-6 py-4">{data.Discount_Type.type}</td>
          <td className="px-6 py-4">
            {data.discount_type_id == 1
              ? "-"
              : data.discount_type_id == 2
                ? `${data.amount}%`
                : rupiah(data.amount)}
          </td>
          <td className="px-6 py-4">
            {new Date(data.expiredDate).toLocaleDateString()}
          </td>
          <td className="px-6 py-4">
            {new Date(data.createdAt).toLocaleDateString()}
          </td>
          <td className="px-6 py-4">
            {new Date(data.expiredDate).setHours(0, 0, 0, 0) <
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
    { label: "All Discount Type", value: "" },
    { label: "Buy one get one", value: 1 },
    { label: "Discount by percentage", value: 2 },
    { label: "Discount by nominal", value: 3 },
  ];

  return (
    <div className="w-5/6 mx-auto">
      <div className="relative">
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <CustomDropdownURLSearch id="sort" options={options} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Created Date"} />
          <CustomDropdownURLSearch id="discount_type_id" options={options2} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Filter by Discount Type"} />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase border-b-2 border-maingreen ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Discount type
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Expired date
                </th>

                <th scope="col" className="px-6 py-3">
                  Created date
                </th>
              </tr>
            </thead>
            <tbody>
              {dataAllDiscount.length != 0 ? (
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
