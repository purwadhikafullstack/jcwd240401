import { useState } from "react";

const CustomHeader = ({ tabContent, titleContent, setContent }) => {
  const [activeTab, setActiveTab] = useState(`${tabContent[0].name}`);
  const handleTabClick = (tabId, content) => {
    setActiveTab(tabId);
    setContent(content);
  };
  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">{titleContent}</div>
      <div className="w-full font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul
          className="flex flex-wrap -mb-px text-center"
          id="myTab"
          data-tabs-toggle="#myTabContent"
          role="tablist"
        >
          {tabContent.map((data) => (
            <li className="mr-2" role="presentation">
              <button
                className={`inline-block px-4 py-2 border-b-4 ${activeTab === data.name
                  ? "  border-maindarkgreen text-maingreen"
                  : "border-transparent"
                  }`}
                id={`${data.name}-tab`}
                type="button"
                role="tab"
                aria-controls={data.name}
                aria-selected={activeTab === data.name ? "true" : "false"}
                onClick={() => handleTabClick(data.name, data.tab)}
              >
                <span className="text-xl hidden lg:block w-40">{data.name}</span>
                <span className="text-darkgreen lg:hidden">{data.icon}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomHeader;