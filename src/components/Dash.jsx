import React from 'react';
import { formatKey } from '../utils/helpers'; // Import helper
import GenericDataRenderer from './visualizations/GenericDataRenderer'; // Import generic renderer
import WeatherVisualization from './visualizations/WeatherVisualization'; // Import specific viz
import HistoricalStockVisualization from './visualizations/HistoricalStockVisualization'; // Import specific viz

// --- Main Dash Component ---
// Accepts structuredDataHistory array now
function Dash({ structuredDataHistory }) {

  // Function to render a single history item, which now can be an array of tool outputs
  const renderSingleHistoryEntry = (historyEntryData) => {
    if (historyEntryData === null || historyEntryData === undefined) {
        return null;
    }

    // historyEntryData is expected to be the array of tool_outputs
    if (!Array.isArray(historyEntryData)) {
        console.warn("Dash.jsx: Expected historyEntryData to be an array of tool outputs, got:", historyEntryData);
        // Optionally render it as a generic non-array object if needed
        if (typeof historyEntryData === 'object') {
             return (
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Unexpected Data Format</h3>
                    <GenericDataRenderer data={historyEntryData} />
                </div>
            );
        }
        return <pre className="m-5 p-5 w-auto box-border whitespace-pre-wrap break-words font-mono text-sm text-gray-700 bg-yellow-100 rounded">Received non-array data for visualization: {String(historyEntryData)}</pre>;
    }

    if (historyEntryData.length === 0) {
        return <p className="p-5 text-gray-500 italic">No tool data to visualize for this entry.</p>;
    }
    
    // Render each tool output in the array
    return historyEntryData.map((toolOutput, index) => {
        const dataToRender = toolOutput.data; // This is the actual JSON payload from the tool
        const toolName = toolOutput.tool_name; // Use tool_name as the dataType

        // If toolOutput.data is undefined (e.g. tool had an error or no structured output)
        if (dataToRender === undefined && toolOutput.raw_content) {
            return (
                <div key={index} className="p-5 border-b border-gray-200 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tool: {formatKey(toolName)} (Raw Output)</h3>
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm bg-gray-100 p-2 rounded">{toolOutput.raw_content}</pre>
                    {toolOutput.error && <p className="text-red-500 text-xs mt-1">{toolOutput.error}</p>}
                </div>
            );
        }
        if (dataToRender === undefined) {
             return (
                <div key={index} className="p-5 border-b border-gray-200 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tool: {formatKey(toolName)}</h3>
                    <p className="text-gray-500 italic">No structured data from this tool call.</p>
                    {toolOutput.error && <p className="text-red-500 text-xs mt-1">{toolOutput.error}</p>}
                </div>
            );
        }


        switch (toolName) {
          // The case should match the 'tool_name' string from the backend
          case 'weather_tool': // Assuming your weather tool is named 'weather_tool'
            return <WeatherVisualization key={index} data={dataToRender} />;
          case 'historical_stock_tool': // Assuming your historical stock tool is named 'historical_stock_tool'
            return <HistoricalStockVisualization key={index} data={dataToRender} />;
          // Add other specific cases if needed
          // e.g. case 'stock_market': return <StockMarketVisualization data={dataToRender} />;
          default:
            console.log("Dash.jsx: Rendering with GenericDataRenderer for tool_name:", toolName);
            return (
                <div key={index} className="p-5 border-b border-gray-200 last:border-b-0">
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">Tool: {formatKey(toolName)}</h3>
                     <GenericDataRenderer data={dataToRender} />
                </div>
            );
        }
    });
  };

  return (
    // Main container scrolls if content overflows
    <div className="w-full min-h-full flex flex-col text-gray-800 text-base overflow-y-auto">
      {structuredDataHistory.length === 0 ? (
        // Show placeholder if history is empty
        <div className="flex flex-col justify-center items-center h-full text-gray-400 text-2xl italic text-center p-5">
          Visualization Area
        </div>
      ) : (
        // Map over the history array
        structuredDataHistory.map((historyItem, index) => (
          // Use React.Fragment to avoid unnecessary divs and apply key
          <React.Fragment key={historyItem.id}>
            {/* Add a divider before every item except the first one */}
            {index > 0 && <hr className="my-4 border-t-2 border-gray-300" />}
            {/* Render the actual data item (which is an array of tool outputs) */}
            {renderSingleHistoryEntry(historyItem.data)}
          </React.Fragment>
        ))
      )}
    </div>
  );
}

export default Dash;