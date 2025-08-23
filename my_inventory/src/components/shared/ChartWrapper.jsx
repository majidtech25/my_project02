// src/components/shared/ChartWrapper.jsx
import React from "react";
import Card from "./Card";

const ChartWrapper = ({ title, className = "" }) => {
  return (
    <Card className={className}>
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400 border border-dashed rounded">
        Chart Placeholder
      </div>
    </Card>
  );
};

export default ChartWrapper;
