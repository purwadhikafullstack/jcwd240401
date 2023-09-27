export const calculateCheckoutPrice = (selectedVoucher, subTotal, deliveryFee) => {
  if (selectedVoucher.value === "") {
    return Number(subTotal) + Number(deliveryFee);
  } else {
    if (selectedVoucher.value === 0) {
      return Number(subTotal);
    } else {
      return (
        Number(subTotal) + Number(deliveryFee) - Number(selectedVoucher.value)
      );
    }
  }
};
