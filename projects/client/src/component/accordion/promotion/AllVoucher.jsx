import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Pagination } from "flowbite-react";
import CustomDropdown from "../../CustomDropdown";

export default function AllVoucher() {
  const [dataAllVoucher, setDataAllVoucher] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    sort: "",
    voucher_type_id: "",
  });
  const fetchDataAllVoucher = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/vouchers?page=${currentPage}&sortVoucher=${filter.sort}&filterVoucherType=${filter.voucher_type_id}`
      );
      setDataAllVoucher(response.data.data.rows);
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
    { label: "expired date: newest", value: "ASC" },
    { label: "expired date: oldest", value: "DESC" },
  ];

  const options2 = [
    {
      label: "filter by voucher type",
      value: "",
    },
    {
      label: "free shipping",
      value: 1,
    },
    {
      label: "by percentage",
      value: 2,
    },
    {
      label: "by nominal",
      value: 3,
    },
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
            onChange={(e) => handleChangeDropdown(e, "voucher_type_id")}
            placeholder={"filter by discount type"}
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
              <th scope="col" className="px-6 py-3">
                Create date
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
          totalPages={totalPages}
          nextLabel="Next"
          previousLabel="Back"
          className="mx-auto"
        />
      </div>
    </div>
  );
}
