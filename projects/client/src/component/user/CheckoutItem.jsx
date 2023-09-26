import rupiah from "../../helpers/rupiah";
import Label from "../Label";
import handleImageError from "../../helpers/handleImageError";

const CheckoutItem = ({
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
    <div key={cartId} className="mx-auto my-1">
      <div className="flex bg-white border-b-2 border-x-lightgrey overflow-hidden items-center justify-start">
        <div className="relative w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0 hidden sm:block">
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
            <img
              alt="Placeholder Photo"
              className="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={`${process.env.REACT_APP_BASE_URL}${productImg}`}
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
            x {quantity}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutItem;
