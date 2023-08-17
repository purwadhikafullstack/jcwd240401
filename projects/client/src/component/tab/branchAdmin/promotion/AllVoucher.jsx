import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "flowbite-react";
import { getAllVoucher } from "../../../../api/promotion";
import CustomDropdown from "../../../CustomDropdown";

export default function AllVoucher() {
  const [dataAllVoucher, setDataAllVoucher] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    sort: "",
  });
  const fetchDataAllVoucher = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/vouchers?page=${currentPage}&sortVoucher=${filter.sort}`
      );
      setDataAllVoucher(response.data.data);
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
          <td className="px-6 py-4">{data.amount}</td>
          <td className="px-6 py-4">{data.usedLimit}</td>
          <td className="px-6 py-4">{data.minTransaction}</td>
          <td className="px-6 py-4">{data.maxDiscount}</td>
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
                Voucher Type
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Usage limit
              </th>
              <th scope="col" className="px-6 py-3">
                Minimal transaction
              </th>
              <th scope="col" className="px-6 py-3">
                Max Discount
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
      </div>
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
  );
}
