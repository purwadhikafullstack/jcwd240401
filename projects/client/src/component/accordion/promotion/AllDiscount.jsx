import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Pagination } from "flowbite-react";
import CustomDropdown from "../../CustomDropdown";

export default function AllDiscount() {
  const [dataAllDiscount, setDataAllDiscount] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    sort: "",
    discount_type_id: "",
  });
  const fetchDataAllDiscount = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/discounts?page=${currentPage}&sortDiscount=${filter.sort}&filterDiscountType=${filter.discount_type_id}`
      );
      setDataAllDiscount(response.data.data.rows);
      console.log(response.data);
      setTotalPages(
        Math.ceil(
          response.data?.pagination?.totalData /
            response.data?.pagination?.perPage
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllDiscount();
  }, [currentPage, filter]);

  const onPageChange = (page) => {
    setDataAllDiscount([]);
    setCurrentPage(page);
  };

  //table data
  const arrayData = [];
  const TableRow = () => {
    dataAllDiscount?.forEach((data, index) => {
      arrayData.push(
        <tr
          key={data.id}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
        >
          <td className="px-6 py-4">{data.Discount_Type.type}</td>
          <td className="px-6 py-4">{data.amount}</td>
          <td className="px-6 py-4">
            {new Date(data.expiredDate).toLocaleDateString()}
          </td>
          <td className="px-6 py-4">
            {new Date(data.createdAt).toLocaleDateString()}
          </td>
        </tr>
      );
    });

    return arrayData;
  };

  const options = [
    { label: "Sort By expired date", value: "" },
    { label: "expired date: oldest", value: "ASC" },
    { label: "expired date: newest", value: "DESC" },
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
    <div>
      <div className="relative overflow-x-auto">
        <div className="mx-auto py-2 w-5/6 grid grid-cols-1 lg:grid-cols-2 gap-2">
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
        </div>
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
            <TableRow />
          </tbody>
        </table>
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
