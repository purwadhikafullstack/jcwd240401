
import rupiah from "../../helpers/rupiah";
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
}) => {
  return (
    <div className="mx-auto my-1 px-40">
      <div
        className="flex bg-white border-b-2 border-x-lightgrey overflow-hidden items-center justify-start"
        style={{ cursor: "auto" }}
      >
        <div className="relative w-32 h-32 flex-shrink-0">
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
            <img
              alt="Placeholder Photo"
              className="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={`http://localhost:8000${productImg}`}
            />
          </div>
        </div>
        <div className="grid grid-rows-2 items-start w-full h-[150px]">
          <div className="flex flex-col font-semibold text-sm sm:text-base  mx-2 justify-center content-center h-full">
            {name}
            <div className="text-sm font-normal">
              {weight}
              {UOM} / pack
            </div>
          </div>
          <div className="flex mx-auto justify-between w-full relative content-center h-full">
            <div className="flex flex-col px-2 justify-center">
              {discountId && isExpired === false ? (
                <>
                  {discountType === 1 ? (
                    <div className="text-reddanger font-bold">
                      {rupiah(basePrice)}
                    </div>
                  ) : discountType === 2 ? (
                    <>
                      <div className="text-reddanger font-bold">
                        {rupiah(basePrice - (basePrice * discountAmount) / 100)}
                      </div>
                      <div className="text-xs flex items-center gap-3">
                        <div>
                          {/* <Label
                            labelColor={"red"}
                            text={`${discountAmount} %`}
                          /> */}
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
      </div>
    </div>
  );
};

export default CartItem;
