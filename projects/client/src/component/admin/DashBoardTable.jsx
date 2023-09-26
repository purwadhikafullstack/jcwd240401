import React from "react";
import Label from "../Label";
import rupiah from "../../helpers/rupiah";

export default function DashBoardTable({ tableData }) {
  if (tableData) {
    const labelColor = (text) => {
      switch (text) {
        case "Waiting for payment":
          return "gray";
        case "Waiting for payment confirmation":
          return "purple";
        case "Processing":
          return "yellow";
        case "Delivering":
          return "blue";
        case "Order completed":
          return "green";
        case "Canceled":
          return "red";
        default:
          return "";
      }
    };
    return (
      <div className="bg-white px-4 pt-3 pb-4 rounded-md border border-gray-200 w-full">
        <span>Recent transactions</span>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Invoice Code
                </th>
                <th scope="col" className="px-6 py-3">
                  Order Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Total Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Order Date
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {transaction.invoiceCode}
                  </th>
                  <td className="px-6 py-4">
                    <Label
                      text={transaction?.orderStatus}
                      labelColor={labelColor(transaction?.orderStatus)}
                    />
                  </td>
                  <td className="px-6 py-4">{rupiah(transaction.totalPrice)}</td>
                  <td className="px-6 py-4">
                    {new Date(transaction.orderDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
