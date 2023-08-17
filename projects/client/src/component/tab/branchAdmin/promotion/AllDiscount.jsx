import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { getAllDiscount } from "../../../../api/promotion";
import { Pagination } from "flowbite-react";
import CustomDropdown from "../../../CustomDropdown";

export default function AllDiscount() {
  const [dataAllDiscount, setDataAllDiscount] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    sort: "",
  });
  const fetchDataAllDiscount = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/discounts?page=${currentPage}&sortDiscount=${filter.sort}`
      );
      setDataAllDiscount(response.data.data);
      console.log(response.data);
      // setTotalPages(
      //   Math.ceil(
      //     response.data?.pagination?.totalData /
      //       response.data?.pagination?.perPage
      //   )
      // );
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
          <td className="px-6 py-4">{data.expiredDate}</td>
        </tr>
      );
    });

    return arrayData;
  };

  const options = [
    { label: "Sort By expired date", value: "" },
    { label: "expired date: newest", value: "ASC" },
    { label: "expired date: oldest", value: "DESC" },
  ];

  const handleChangeDropdown = (obj) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      sort: obj.value,
    }));
  };

  return (
    <div>
      <div className="relative overflow-x-auto">
        <div>
          <CustomDropdown
            options={options}
            onChange={handleChangeDropdown}
            placeholder={"Sort by expired date"}
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
            totalPages={5}
            nextLabel="Next"
            previousLabel="Back"
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
