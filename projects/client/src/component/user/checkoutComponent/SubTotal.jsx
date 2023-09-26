import rupiah from "../../../helpers/rupiah";

export default function SubTotal({ subTotal }) {
  return (
    <>
      <div className="flex justify-between">
        <span className="font-semibold text-xl text-maingreen">Sub total</span>
        <span className="text-reddanger text-xl font-bold ">
          {rupiah(subTotal)}
        </span>
      </div>
    </>
  );
}
