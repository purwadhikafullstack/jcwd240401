import React from 'react'
import dayjs from 'dayjs'
import { orderStatusLabelColor } from '../../../helpers/labelColor'
import Label from '../../Label'

export default function OrderListTable({ orderData, setSelectedOrder }) {
  const handleOnClick = (orderId) => {
    setSelectedOrder(orderId)
  }
  return (
    <table className="w-full text-center font-inter">
      <thead className="text-maingreen uppercase border-b-2 border-maingreen ">
        <tr>
          <th scope="col" className="px-2 py-4s" style={{ width: '30%' }}>Invoice Code</th>
          <th scope="col" className="px-2 py-4" style={{ width: '40%' }}>Status</th>
          <th scope="col" className="px-2 py-4" style={{ width: '30%' }}>Order Date</th>
        </tr>
      </thead>
      <tbody className='text-black text-sm'>
        {orderData.length !== 0 ? orderData.map((data, index) => (
          <tr key={index} className="hover:bg-gray-100 border-b-2 border-gray-200">
            <td className="py-2 px-4" style={{ width: '30%' }} onClick={() => handleOnClick(data.id)}>{data.invoiceCode}</td>
            <td className="py-2 px-4 " style={{ width: '40%' }} onClick={() => handleOnClick(data.id)}><Label text={data.orderStatus} labelColor={orderStatusLabelColor(data.orderStatus)} /></td>
            <td className="py-2 px-4" style={{ width: '30%' }} onClick={() => handleOnClick(data.id)}>{dayjs(data.orderDate).format("DD/MM/YYYY")}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan="3" className='py-4 text-center'>No Orders Found</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
