import { useNavigate } from "react-router-dom";
import Button from "../../Button";

export default function PaymentTitle({ orderData }) {
  const navigate = useNavigate();
  if (orderData) {
    return (
      <>
        <div className="grid justify-center content-center">
          <Button condition={"back"} onClick={() => navigate("/user/orders")} />
        </div>
        <div className="text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6">
          <span>Invoice - </span>
          <span className="text-reddanger">{orderData?.data?.invoiceCode}</span>
        </div>
      </>
    );;
  }
}
