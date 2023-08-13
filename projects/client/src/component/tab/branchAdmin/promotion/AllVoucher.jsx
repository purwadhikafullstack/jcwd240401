import React from "react";
import { useState, useEffect } from "react";
import { getAllVoucher } from "../../../../api/promotion";

export default function AllVoucher() {
  const [dataAllVoucher, setDataAllVoucher] = useState([]);
  const fetchDataAllVoucher = async () => {
    try {
      const response = await getAllVoucher();
      setDataAllVoucher(response.data.data);
      console.log(response.data.data, "hehe");
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllVoucher();
  }, []);
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

  return (
    <div>
      <div className="relative overflow-x-auto">
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
    </div>
  );
}
