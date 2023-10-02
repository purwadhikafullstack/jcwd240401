import React from "react";

export default function DashBoardList({ listData }) {
  if (listData) {
    return (
      <div className="bg-white px-4 pt-3 pb-4 rounded-md border border-gray-200 w-full">
        <span>Popular Products</span>
        <div className="mt-4 flex flex-col gap-3">
          {listData.map((product) => (
            <div className="flex" key={product.productId}>
              <div className="w-10 h-10 min-w-10 bg-gray-200 rounded-sm">
                {product.productImg && (
                  <img
                    src={`${process.env.REACT_APP_BASE_URL}${product.productImg}`}
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-sm"
                  />
                )}
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {product.productName}
                </span>
                <span className="text-sm">Avl. Stock: {product.sales}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
