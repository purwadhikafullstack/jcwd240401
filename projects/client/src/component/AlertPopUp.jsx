"use client";

export default function AlertPopUp({ status, content, setter, condition }) {
    let mainAlertClass, xButtonClass;

    switch (condition) {
        case "warn":
            mainAlertClass = "flex items-center py-2 px-4 text-[#E1AD01] rounded-lg bg-[#F5E5D5]";
            xButtonClass = "ml-auto -mx-1.5 -my-1.5 text-[#E1AD01] rounded-lg ring-0 p-1.5 inline-flex items-center justify-center h-8 w-8";
            break;
        case "success":
            mainAlertClass = "flex items-center py-2 px-4 text-[#43936C] rounded-lg bg-[#D9E9E2]";
            xButtonClass = "ml-auto -mx-1.5 -my-1.5 text-[#43936C] rounded-lg ring-0 p-1.5 inline-flex items-center justify-center h-8 w-8";
            break;
        case "fail":
            mainAlertClass = "flex items-center py-2 px-4 text-[#CB3A31] rounded-lg bg-[#F5D8D6]";
            xButtonClass = "ml-auto -mx-1.5 -my-1.5 text-[#CB3A31] rounded-lg ring-0 p-1.5 inline-flex items-center justify-center h-8 w-8";
            break;
        default:
            mainAlertClass = "";
            xButtonClass = "";
            break;
    }

    const toggleCloseModel = () => {
        setter(false);
    };
    return (
        <div
            id="alert-1"
            className={mainAlertClass}
            role="alert"
        >
            <svg
                className="flex-shrink-0 w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="ml-3 text-sm font-medium">
                <span className="font-medium">{status}</span>
                {" " + content + " "}
            </div>
            <button
                type="button"
                className={xButtonClass}
                data-dismiss-target="#alert-1"
                aria-label="Close"
                onClick={toggleCloseModel}
            >
                <span className="sr-only">Close</span>
                <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                </svg>
            </button>
        </div>
    );
}
