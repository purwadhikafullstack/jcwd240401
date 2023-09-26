import { useNavigate } from "react-router-dom";
import Button from "../../Button";
import cartImg from "../../../assets/cart.png"
export default function EmptyCart() {
    const navigate=useNavigate()
  return (
    <div className="flex flex-col items-center justify-center">
      <img src={cartImg} alt="Empty Cart" />
      <span className="font-bold text-3xl p-2 text-center ">
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
