import React from 'react';
import GenericDataRenderer from './GenericDataRenderer'; // Import generic renderer
import { formatKey } from '../../utils/helpers'; // Import helper if needed (though generic handles it now)

const WeatherVisualization = ({ data }) => {
  // Basic validation
  if (typeof data !== 'object' || data === null) {
    return <pre className="m-5 p-5 w-auto box-border whitespace-pre-wrap break-words font-mono text-sm text-red-700 bg-red-100 rounded">Error: Weather data is not valid: {String(data)}</pre>;
  }

  // Using Generic Renderer for Weather Data consistency
  return (
      <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Weather Information</h3>
          <GenericDataRenderer data={data} />
      </div>
  );
};

export default WeatherVisualization;