import React from "react";

const TimeRemaining = ({ timer }) => {
  return (
    <div className="text-reddanger text-xl font-bold">
      Time remaining: {Math.floor(timer / 60)}:
      {(timer % 60).toString().padStart(2, "0")}
    </div>
  );
};

export default TimeRemaining;
