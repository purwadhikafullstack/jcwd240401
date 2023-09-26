export const calculateTotalWeight = (responseData) => {
    let total = 0;
    if (responseData.length > 0) {
      for (const item of responseData) {
        const itemWeight = item.Branch_Product?.Product?.weight;
        const itemQuantity = item.quantity;
        total += itemWeight * itemQuantity;
      }
    }
    return total;
  };