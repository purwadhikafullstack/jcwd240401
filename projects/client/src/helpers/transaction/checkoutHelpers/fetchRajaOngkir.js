import { getShippingCost } from "../../../api/transaction";
import rupiah from "../../rupiah";

export const fetchRajaOngkir = async (token, origin, destination, totalWeight, courier, setShipping) => {
    try {
      const response = await getShippingCost(token, origin, destination, totalWeight, courier);
      if (response?.data?.data?.results[0]?.costs) {
        let data = response?.data?.data?.results[0]?.costs;
        if (data) {
          let option = data?.map((d) => ({
            label: `${d.service} - ${rupiah(d.cost[0]?.value)}  [${
              d.cost[0]?.etd
            } hari] `,
            value: d.cost[0].value,
          }));
          setShipping(option);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };