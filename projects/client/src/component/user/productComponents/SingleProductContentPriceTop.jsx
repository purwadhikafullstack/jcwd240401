import React from 'react'

import rupiah from '../../../helpers/rupiah';
import Label from '../../Label';

export default function SingleProductContentPriceTop({ productData }) {
    return (
        <div className="sm:hidden grid p-4">
            <div>{productData?.Product?.name}</div>
            <div className="text-sm text-darkgrey flex items-center">{`${productData?.Product?.weight}${productData?.Product?.unitOfMeasurement} / pack`}</div>
            <div className="py-3">
                {productData.discount_id &&
                    productData?.Discount?.isExpired === false ? (
                    <>
                        {productData.Discount.discount_type_id === 1 ? (
                            <div className="text-reddanger font-bold">
                                {rupiah(productData.Product.basePrice)}
                            </div>
                        ) : productData.Discount.discount_type_id === 2 ? (
                            <>
                                <div className="text-reddanger font-bold">
                                    {rupiah(
                                        productData.Product.basePrice -
                                        (productData.Product.basePrice *
                                            productData.Discount.amount) /
                                        100
                                    )}
                                </div>
                                <div className="text-xs flex items-center gap-3">
                                    <div>
                                        <Label
                                            labelColor={"red"}
                                            text={`${productData.Discount.amount} %`}
                                        />
                                    </div>
                                    <del>
                                        {rupiah(productData.Product.basePrice)}
                                    </del>
                                </div>
                            </>
                        ) : productData.Discount.discount_type_id === 3 ? (
                            <>
                                <div className="text-reddanger font-bold">
                                    {rupiah(
                                        productData.Product.basePrice -
                                        productData.Discount.amount
                                    )}
                                </div>
                                <div className="text-xs flex items-center gap-3">
                                    <del>
                                        {rupiah(productData.Product.basePrice)}
                                    </del>
                                </div>
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="text-reddanger font-bold">
                        {rupiah(productData?.Product?.basePrice)}
                    </div>
                )}
            </div>
        </div>
    )
}
