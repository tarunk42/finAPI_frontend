import React from 'react';
import GenericDataRenderer from './GenericDataRenderer'; // Import generic renderer
import { formatKey } from '../../utils/helpers'; // Import helper

const HistoricalStockVisualization = ({ data }) => {
   // Basic validation
   if (typeof data !== 'object' || data === null) {
    return <pre className="m-5 p-5 w-auto box-border whitespace-pre-wrap break-words font-mono text-sm text-red-700 bg-red-100 rounded">Error: Stock data is not valid: {String(data)}</pre>;
  }

  // Pass the entire data object to the generic renderer
  // The generic renderer will handle displaying symbol, dates, and the nested historical array table.
  return (
    <div className="p-5">
      {/* Optional: Keep a main title if desired, or let GenericDataRenderer handle it */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Historical Stock Data</h3>
      {/* Render the entire data object */}
      <GenericDataRenderer data={data} />
    </div>
  );
};

export default HistoricalStockVisualization;