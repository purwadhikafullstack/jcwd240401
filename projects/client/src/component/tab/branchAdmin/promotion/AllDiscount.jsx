import React from "react";
import { useState, useEffect } from "react";
import { getAllDiscount } from "../../../../api/promotion";

export default function AllDiscount() {
  const [dataAllDiscount, setDataAllDiscount] = useState([]);
  const fetchDataAllDiscount = async () => {
    try {
      const response = await getAllDiscount();
      setDataAllDiscount(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllDiscount();
  }, []);
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

  return (
    <div>
      <div className="relative overflow-x-auto">
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
      </div>
    </div>
  );
}
