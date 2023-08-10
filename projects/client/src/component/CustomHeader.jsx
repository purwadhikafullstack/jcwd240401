import { useState } from "react";

const CustomHeader = ({ tabContent, titleContent, setContent }) => {
  const [activeTab, setActiveTab] = useState("");
  const handleTabClick = (tabId, content) => {
    setActiveTab(tabId);
    setContent(content);
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className=" text-2xl font-bold text-maingreen">{titleContent}</div>

      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul
          className="flex flex-wrap -mb-px text-sm font-josefin text-center"
          id="myTab"
          data-tabs-toggle="#myTabContent"
          role="tablist"
        >
          {tabContent.map((data) => (
            <li className="mr-2" role="presentation">
              <button
                className={`inline-block px-4 py-2 border-b-2 h-9 ${
                  activeTab === data.name
                    ? " border-maindarkgreen text-maingreen"
                    : "border-transparent"
                }`}
                id={`${data.name}-tab`}
                type="button"
                role="tab"
                aria-controls={data.name}
                aria-selected={activeTab === data.name ? "true" : "false"}
                onClick={() => handleTabClick(data.name, data.tab)}
              >
                <span className="hidden sm:block">{data.name}</span>
                <span className="text-darkgreen sm:hidden">{data.icon}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomHeader;
