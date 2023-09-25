import React from "react";
import rupiah from "../../helpers/rupiah";
import { MdDiscount } from "react-icons/md";
import { LiaShippingFastSolid } from "react-icons/lia";
import { BiSolidDiscount } from "react-icons/bi";
import { FaRupiahSign } from "react-icons/fa6";

const VoucherList = ({ vouchers, selectedVoucher, handleVoucherClick }) => {
  const label = (type) => {
    switch (type) {
      case 1:
        return <LiaShippingFastSolid size={30} className="text-maingreen" />;
        break;
      case 2:
        return <BiSolidDiscount size={30} className="text-maingreen" />;
        break;
      case 3:
        return <FaRupiahSign size={30} className="text-maingreen" />;
        break;
      default:
        return "";
        break;
    }
  };
  console.log(vouchers.Voucher.id, selectedVoucher.id, "inininini");
  return (
    <div
      key={vouchers.id}
      className={`border p-4 rounded-lg cursor-pointer ${
        selectedVoucher.id === vouchers.Voucher.id
          ? "border-maingreen"
          : "border-gray-300"
      } ${!vouchers.isEligible ? "opacity-60 pointer-events-none" : ""}`}
      onClick={() => {
        if (vouchers.isEligible) {
          handleVoucherClick(
            vouchers?.voucher_id,
            vouchers?.Voucher?.maxDiscount
          );
        }
      }}
    >
      <div className="flex">
        <div className="flex justify-center items-center">
          {label(vouchers.Voucher.voucher_type_id)}
        </div>
        <div className="ml-4">
          <h4>{vouchers.Voucher.Voucher_Type.type}</h4>
          {vouchers.Voucher.expiredDate !== null ? (
            <div>
              <p>Min Transaction: {rupiah(vouchers.Voucher.minTransaction)}</p>
              <p>
                Exp. date:{" "}
                {new Date(vouchers.Voucher.expiredDate).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p>Referral</p>
          )}
          {!vouchers.isEligible && <p className="text-red-500">Not Eligible</p>}
        </div>
      </div>
    </div>
  );
};

export default VoucherList;
