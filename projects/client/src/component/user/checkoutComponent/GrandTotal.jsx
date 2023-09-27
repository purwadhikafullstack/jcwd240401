import rupiah from "../../../helpers/rupiah";

export default function GrandTotal({ grandTotal }) {
  if (grandTotal) {
    return (
      <div className="flex justify-between ">
        <span className="font-semibold text-xl text-maingreen">Total</span>
        <span className="text-reddanger text-xl font-bold ">
          {rupiah(grandTotal)}
        </span>
      </div>
    );
  }
}
