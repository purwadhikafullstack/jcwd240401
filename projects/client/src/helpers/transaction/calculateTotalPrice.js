export const calculateTotalPrice = (selectedCartItems, type) => {
  let total = 0;
  switch (type) {
    case "cart":
      if (selectedCartItems.length > 0) {
        for (const item of selectedCartItems) {
          const basePrice = item.Branch_Product?.Product?.basePrice;
          const quantity = item.quantity;
          const discount = item.Branch_Product?.Discount;
          const expired = item.Branch_Product?.Discount?.isExpired;

          if (discount && !expired) {
            if (discount.discount_type_id === 2) {
              const discountAmount = discount.amount;
              total += ((basePrice * (100 - discountAmount)) / 100) * quantity;
            } else if (discount.discount_type_id === 3) {
              const discountAmount = discount.amount;
              total += (basePrice - discountAmount) * quantity;
            } else if (discount.discount_type_id === 1) {
              total += basePrice;
            }
          } else {
            total += basePrice * quantity;
          }
        }
      }

      return total;

      break;
    case "payment":
      if (selectedCartItems?.length > 0) {
        for (const item of selectedCartItems) {
          const basePrice = item.Product.basePrice;
          const quantity = item.Order_Item?.quantity;
          const discount = item.Discount;
          const expired = item.Discount?.isExpired;
          if (discount && !expired) {
            if (discount.discount_type_id === 2) {
              const discountAmount = discount.amount;
              total += ((basePrice * (100 - discountAmount)) / 100) * quantity;
            } else if (discount.discount_type_id === 3) {
              const discountAmount = discount.amount;
              total += (basePrice - discountAmount) * quantity;
            } else if (discount.discount_type_id === 1) {
              total += basePrice;
            }
          } else {
            total += basePrice * quantity;
          }
        }
      }

      return total;
    default:
      break;
  }
};
