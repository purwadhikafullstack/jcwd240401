import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import rupiah from "../../helpers/rupiah";
import { updateCart } from "../../store/reducer/cartSlice";
import Button from "../Button";
import Label from "../Label";

const CartItem = ({
  quantity,
  name,
  weight,
  UOM,
  productImg,
  discountId,
  discountType,
  isExpired,
  basePrice,
  discountAmount,
  cartId,
  productStock,
  productId,
  onSelect, // Add onSelect prop
  selected, // Add selected prop
}) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const handleImageError = (event) => {
    event.target.src =
      "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
  };

  const addQuantity = async (productId, currentQuantity, stock) => {
    try {
      if (currentQuantity <= stock) {
        const updatedQuantity = currentQuantity + 1;
        const response = await axios.post(
          `http://localhost:8000/api/users/carts/${productId}`,
          { quantity: updatedQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const cartResponse = await axios.get(
          "http://localhost:8000/api/users/carts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        dispatch(updateCart(cartResponse.data.data));
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const reduceQuantity = async (productId, currentQuantity) => {
    try {
      if (currentQuantity >= 0) {
        const updatedQuantity = currentQuantity - 1;
        const response = await axios.post(
          `http://localhost:8000/api/users/carts/${productId}`,
          { quantity: updatedQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const cartResponse = await axios.get(
          "http://localhost:8000/api/users/carts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        dispatch(updateCart(cartResponse.data.data));
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div key={cartId} className="mx-auto my-1 px-2 sm:px-4 lg:px-8 xl:px-16">
      <div className="flex bg-white border-b-2 border-x-lightgrey overflow-hidden items-center justify-start">
        <input
          type="checkbox"
          checked={selected} // Bind the selected state to the checkbox
          onChange={() => onSelect(cartId)} // Call the onSelect function when checkbox is clicked
        />
        <div className="relative w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0 hidden sm:block">
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
            <img
              alt="Placeholder Photo"
              className="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={`http://localhost:8000${productImg}`}
              onError={handleImageError}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 items-center w-full gap-2">
          <div className="sm:col-span-3 col-span-2 grid">
            <div className="flex flex-col font-semibold text-sm sm:text-base mx-2 sm:mx-4 justify-center content-center">
              {name}
              <div className="text-sm font-normal">
                {weight}
                {UOM} / pack
              </div>
            </div>
            <div className="flex mx-2 sm:mx-4 justify-between w-full relative content-center">
              <div className="flex flex-col px-2 sm:px-0 justify-center text-center">
                {discountId && isExpired === false ? (
                  <>
                    {discountType === 1 ? (
                      <div className="text-reddanger font-bold">
                        {rupiah(basePrice)}
                      </div>
                    ) : discountType === 2 ? (
                      <>
                        <div className="flex justify-start text-reddanger font-bold">
                          {rupiah(
                            basePrice - (basePrice * discountAmount) / 100
                          )}
                        </div>
                        <div className="text-xs flex items-center gap-3">
                          <div>
                            <Label
                              labelColor={"red"}
                              text={`${discountAmount} %`}
                            />
                          </div>
                          <del>{rupiah(basePrice)}</del>
                        </div>
                      </>
                    ) : discountType === 3 ? (
                      <>
                        <div className="text-reddanger font-bold">
                          {rupiah(basePrice - discountAmount)}
                        </div>
                        <div className="text-xs flex items-center gap-3">
                          <del>{rupiah(basePrice)}</del>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="text-reddanger font-bold">
                    {rupiah(basePrice)}
                  </div>
                )}
              </div>
            </div>
              </div>
            <div className="col-span-1 flex justify-around content-center items-center">
              <Button
                condition={"minus"}
                size={"3xl"}
                onClick={() =>
                  reduceQuantity(productId, quantity, productStock)
                }
              />
              <div className="h-fit mx-2 sm:mx-4">{quantity}</div>
              <Button
                condition={"plus"}
                size={"3xl"}
                onClick={() => addQuantity(productId, quantity, productStock)}
              />
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
