import React from 'react'

export default function SingleProductContentDetails({ productData }) {

    return (
        <>
            <div className="p-4 bg-lightgrey w-full h-fit text-darkgrey text-sm">
                {productData?.Product?.description}
            </div>
            <div className="p-4">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="py-2 text-left" colSpan={2}>
                                Product Details
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr>
                            <td
                                className="py-2 text-maindarkgreen align-top"
                                style={{ width: "40%" }}
                            >
                                Stock
                            </td>
                            <td className="p-2" style={{ width: "60%" }}>
                                {productData?.quantity} Qty
                            </td>
                        </tr>
                        <tr>
                            <td
                                className="py-2 text-maindarkgreen align-top"
                                style={{ width: "40%" }}
                            >
                                Origin
                            </td>
                            <td className="p-2" style={{ width: "60%" }}>
                                {productData?.origin}
                            </td>
                        </tr>
                        <tr>
                            <td
                                className="py-2 text-maindarkgreen align-top"
                                style={{ width: "40%" }}
                            >
                                Storage Instruction
                            </td>
                            <td className="p-2" style={{ width: "60%" }}>
                                {productData?.Product?.storageInstruction}
                            </td>
                        </tr>
                        <tr>
                            <td
                                className="py-2 text-maindarkgreen align-top"
                                style={{ width: "40%" }}
                            >
                                Storage Period
                            </td>
                            <td className="p-2" style={{ width: "60%" }}>
                                {productData?.Product?.storagePeriod}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
