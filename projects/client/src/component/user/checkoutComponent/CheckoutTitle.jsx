import { useNavigate } from "react-router-dom";
import Button from "../../Button";

export default function CheckoutTitle() {
  const navigate = useNavigate()
  return (
    <div className="flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10">
      <div className="grid justify-center content-center">
        <Button condition={"back"} onClick={() => navigate(-1)} />
      </div>
      <div className="text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6">
        Checkout
      </div>
    </div>
  );
}
