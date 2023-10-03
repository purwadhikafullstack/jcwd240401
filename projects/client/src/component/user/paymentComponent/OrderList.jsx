import React from "react";
import CheckoutItem from "../CheckoutItem";

const OrderList = ({ orderData }) => {
  if (orderData) {
    return (
      <div>
        <div className="text-maingreen font-semibold mt-6">My Order Summary</div>
        {orderData.data.Branch_Products.map((product) => (
          <CheckoutItem
            key={product?.id}
            quantity={product.Order_Item?.quantity}
            name={product.Product.name}
            weight={product.Product.weight}
            UOM={product.Product.unitOfMeasurement}
            productImg={product.Product.imgProduct}
            discountId={product.Discount?.id}
            discountType={product.Discount?.discount_type_id}
            isExpired={product.Discount?.isExpired}
            basePrice={product.Product?.basePrice}
            discountAmount={product.Discount?.amount}
            productStock={product.quantity}
            cartId={product?.id}
            productId={product?.id}
          />
        ))}
      </div>
    );
  }
};

export default OrderList;
