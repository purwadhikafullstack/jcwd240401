import { useNavigate } from "react-router-dom";
import Button from "../../Button";
import cartImg from "../../../assets/cart.png"
export default function EmptyCart() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center">
      <img src={cartImg} alt="Empty Cart" />
      <span className="text-center font-bold w-5/6 mx-auto my-4 sm:w-96 lg:w-[500px] lg:text-2xl">
        Oops! It looks like your cart is empty. Time to fill it up with your
        favorite items!
      </span>
      <div className="w-60 p-2">
        <Button
          label="Shop Now"
          condition="positive"
          onClick={() => navigate("/")}
        />
      </div>
    </div>
  );
}
