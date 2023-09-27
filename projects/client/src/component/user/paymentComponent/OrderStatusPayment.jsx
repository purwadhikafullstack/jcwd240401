import Label from "../../Label";
import { orderStatusLabelColor as labelColor } from "../../../helpers/labelColor";

export default function OrderStatusPayment({ orderStatus }) {
  if (orderStatus) {
    return (
      <div className="flex flex-row">
        <span className="text-maingreen font-semibold pt-1">Order Status:</span>
        <span className="mx-2">
          <Label text={orderStatus} labelColor={labelColor(orderStatus)} />
        </span>
      </div>
    );
  }
}
