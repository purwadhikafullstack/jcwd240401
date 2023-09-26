import CheckoutItem from "../CheckoutItem";

export default function CheckoutList({ checkoutItems }) {
  if (checkoutItems) {
    return (
      <div>
        {checkoutItems.map((data) => (
          <CheckoutItem
            key={data.id}
            quantity={data.quantity}
            name={data.Branch_Product.Product.name}
            weight={data.Branch_Product.Product.weight}
            UOM={data.Branch_Product.Product.unitOfMeasurement}
            productImg={data.Branch_Product.Product.imgProduct}
            discountId={data.Branch_Product.discount_id}
            discountType={data.Branch_Product.Discount?.discount_type_id}
            isExpired={data.Branch_Product.Discount?.isExpired}
            basePrice={data.Branch_Product.Product.basePrice}
            discountAmount={data.Branch_Product.Discount?.amount}
            productStock={data.Branch_Product.quantity}
            cartId={data.id}
            productId={data.Branch_Product.id}
          />
        ))}
      </div>
    );
  }
}
