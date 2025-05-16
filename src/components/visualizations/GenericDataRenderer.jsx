import React from 'react';
import { formatKey } from '../../utils/helpers'; // Import the helper

// --- Generic Recursive Data Renderer ---
// Note: We need to export this component now
const GenericDataRenderer = ({ data, level = 0 }) => {
  const basePadding = 'p-2';
  const borderClass = 'border border-gray-300';
  const tableClasses = `w-full border-collapse ${borderClass} text-sm mb-2`;
  const cellClasses = `${borderClass} ${basePadding} align-top`; // align-top for nested tables
  const headerCellClasses = `${cellClasses} font-bold bg-gray-100`;
  const listClasses = `list-disc list-inside ${basePadding}`;

  // Handle primitive types
  if (data === null || data === undefined) {
    return <span className="text-gray-500 italic">N/A</span>;
  }
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return String(data);
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500 italic">(Empty List)</span>;
    }

    // Check if it's an array of objects with consistent keys for table rendering
    const firstItemIsObject = typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0]);
    let headers = [];
    let isTable = false;
    if (firstItemIsObject) {
        headers = Object.keys(data[0]);
        isTable = data.every(item =>
            typeof item === 'object' && item !== null && !Array.isArray(item) &&
            Object.keys(item).length === headers.length &&
            headers.every(header => header in item)
        );
    }

    // Render as Table
    if (isTable && headers.length > 0) {
      return (
        <table className={tableClasses}>
          <thead className="bg-gray-100">
            <tr>
              {headers.map(header => (
                <th key={header} className={headerCellClasses}>{formatKey(header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="even:bg-gray-50 hover:bg-gray-200">
                {headers.map(header => (
                  <td key={header} className={cellClasses}>
                    {/* Recursive call */}
                    <GenericDataRenderer data={item[header]} level={level + 1} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Render as List
    return (
      <ul className={listClasses}>
        {data.map((item, index) => (
          <li key={index}>
             {/* Recursive call */}
            <GenericDataRenderer data={item} level={level + 1} />
          </li>
        ))}
      </ul>
    );
  }

  // Handle Objects
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
        return <span className="text-gray-500 italic">(Empty Object)</span>;
    }
    return (
      <table className={tableClasses}>
        {/* Optional: Add a header row for Key/Value if desired */}
        {/* <thead><tr><th className={headerCellClasses}>Key</th><th className={headerCellClasses}>Value</th></tr></thead> */}
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="even:bg-gray-50 hover:bg-gray-200">
              <td className={`${headerCellClasses} w-1/3`}>{formatKey(key)}</td> {/* Key cell */}
              <td className={cellClasses}> {/* Value cell */}
                 {/* Recursive call */}
                <GenericDataRenderer data={value} level={level + 1} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Fallback for unexpected types
  return <span className="text-red-500">Unsupported data type</span>;
};

export default GenericDataRenderer; // Export the component