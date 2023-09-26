import { getUserVouchers } from "../../../api/promotion";

export  const fetchUserVouchers = async (token, subTotal, setVouchersList) => {
    try {
      const response = await getUserVouchers(token, subTotal);
      if (response.data.data.length === 0) {
        setVouchersList(response.data.data);
      } else {
        const data = response?.data?.data;
        if (data) {
          setVouchersList(data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };