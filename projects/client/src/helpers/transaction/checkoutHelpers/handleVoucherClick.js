export const handleVoucherClick = (id, value, selectedVoucher, setSelectedVoucher) => {
    if (selectedVoucher.id === id) {
      setSelectedVoucher({ id: "", value: "" });
    } else {
      if (value === null) {
        setSelectedVoucher({ id, value: 0 });
      } else {
        setSelectedVoucher({ id, value });
      }
    }
  };