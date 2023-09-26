import React from "react";

export default function CustomAccordion({
  activeTab,
  tabId,
  title,
  children,
  onClick,
}) {
  return (
    <div className="w-5/6 mx-auto">
      <button
        type="button"
        className={`text-sm sm:text-base h-10 flex items-center justify-between w-full font-inter tracking-wide py-5 px-2 text-left ${activeTab === tabId
            ? "font-bold text-maingreen dark:text-maingreen border-b border-darkmaingreen dark:border-maingreen"
            : "text-darkgrey border-b border-grey-300 dark:border-gray-700 dark:text-gray-400"
          }`}
        onClick={() => onClick(tabId)}
      >
        <span>{title}</span>
        <svg
          className={`w-6 h-6 ${activeTab === tabId ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
      {activeTab === tabId && <div>{children}</div>}
    </div>
  );
}
