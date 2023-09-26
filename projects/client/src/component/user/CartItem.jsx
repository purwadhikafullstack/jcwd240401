import { useDispatch } from "react-redux";
import rupiah from "../../helpers/rupiah";
import { updateCart } from "../../store/reducer/cartSlice";
import Button from "../Button";
import Label from "../Label";
import { addToCart, getCart } from "../../api/transaction";
import handleImageError from "../../helpers/handleImageError";

const CartItem = ({
  data,
  onSelect,
  selected,
}) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const addQuantity = async (productId, currentQuantity, stock) => {
    try {
      if (currentQuantity <= stock) {
        const updatedQuantity = currentQuantity + 1;
        await addToCart(token, productId, updatedQuantity);
        const cartResponse = await getCart(token);
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
        await addToCart(token, productId, updatedQuantity);
        const cartResponse = await getCart(token);
        dispatch(updateCart(cartResponse.data.data));
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div key={data.id} className="mx-auto my-1 px-2 sm:px-4 lg:px-8 xl:px-16">
      <div className="flex bg-white border-b-2 border-x-lightgrey overflow-hidden items-center justify-start">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(data.id)}
          className={`rounded-md border-maingreen border-2 p-2 m-2 ${selected ? " text-maingreen" : ""
            }`}
        />
        <div className="relative w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0 hidden sm:block">
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
            <img
              alt="Placeholder Photo"
              className="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={`${process.env.REACT_APP_BASE_URL}${data.Branch_Product.Product.imgProduct}`}
              onError={handleImageError}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 items-center w-full gap-2">
          <div className="sm:col-span-3 col-span-2 grid">
            <div className="flex flex-col font-semibold text-sm sm:text-base mx-2 sm:mx-4 justify-center content-center">
              {data.Branch_Product.Product.name}
              <div className="text-sm font-normal">
                {data.Branch_Product.Product.weight}
                {data.Branch_Product.Product.unitOfMeasurement} / pack
              </div>
            </div>
            <div className="flex mx-2 sm:mx-4 justify-between w-full relative content-center">
              <div className="flex flex-col px-2 sm:px-0 justify-center text-center">
                {data.Branch_Product.discount_id &&
                  data.Branch_Product.Discount?.isExpired === false ? (
                  <>
                    {data.Branch_Product.Discount?.discount_type_id === 1 ? (
                      <div className="text-reddanger font-bold">
                        {rupiah(data.Branch_Product.Product.basePrice)}
                      </div>
                    ) : data.Branch_Product.Discount?.discount_type_id === 2 ? (
                      <>
                        <div className="flex justify-start text-reddanger font-bold">
                          {rupiah(
                            data.Branch_Product.Product.basePrice -
                            (data.Branch_Product.Product.basePrice *
                              data.Branch_Product.Discount?.amount) /
                            100
                          )}
                        </div>
                        <div className="text-xs flex items-center gap-3">
                          <div>
                            <Label
                              labelColor={"red"}
                              text={`${data.Branch_Product.Discount?.amount} %`}
                            />
                          </div>
                          <del>
                            {rupiah(data.Branch_Product.Product.basePrice)}
                          </del>
                        </div>
                      </>
                    ) : data.Branch_Product.Discount?.discount_type_id === 3 ? (
                      <>
                        <div className="text-reddanger font-bold">
                          {rupiah(
                            data.Branch_Product.Product.basePrice -
                            data.Branch_Product.Discount?.amount
                          )}
                        </div>
                        <div className="text-xs flex items-center gap-3">
                          <del>
                            {rupiah(data.Branch_Product.Product.basePrice)}
                          </del>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="text-reddanger font-bold">
                    {rupiah(data.Branch_Product.Product.basePrice)}
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
                reduceQuantity(
                  data.Branch_Product.id,
                  data.quantity,
                  data.Branch_Product.quantity
                )
              }
              isDisabled={
                data.Branch_Product.Discount?.discount_type_id == 1 &&
                data.Branch_Product.Discount?.isExpired == false
              }
            />
            <div className="h-fit mx-2 sm:mx-4">{data.quantity}</div>
            <Button
              condition={"plus"}
              size={"3xl"}
              onClick={() =>
                addQuantity(
                  data.Branch_Product.id,
                  data.quantity,
                  data.Branch_Product.quantity
                )
              }
              isDisabled={
                data.Branch_Product.Discount?.discount_type_id == 1 &&
                data.Branch_Product.Discount?.isExpired == false
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
