const orderStatusLabelColor = (text) => {
    switch(text) {
        case "Waiting for payment":
            return "gray";
        case "Waiting for payment confirmation":
            return "purple";
        case "Processing":
            return "yellow";
        case "Delivering":
            return "blue";
        case "Order completed":
            return "green";
        case "Canceled":
            return "red";
        default:
            return "";
    }
}

export {orderStatusLabelColor};