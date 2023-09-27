import { getMainAddress } from "../../../api/profile";

export  const fetchUserAddress = async (token, setUserAddress) => {
    try {
      const response = await getMainAddress(token);
      if (response.data.data) {
        setUserAddress(response.data.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };