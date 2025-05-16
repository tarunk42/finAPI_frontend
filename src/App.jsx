import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"; // Import panel components
import Chat from './components/Chat';
import Dash from './components/Dash';

function App() {
  // State now holds an array of structured data items
  const [structuredDataHistory, setStructuredDataHistory] = useState([]);

  // Function to update the history
  const updateStructuredDataHistory = (newData) => {
    // Explicitly check for null to clear history (called on disconnect/connect)
    if (newData === null) {
      setStructuredDataHistory([]);
    // Only append if newData is not null and not undefined
    } else if (newData !== undefined) {
      setStructuredDataHistory(prevHistory => [...prevHistory, { id: uuidv4(), data: newData }]);
    }
    // If newData is undefined (meaning no structured data in response), do nothing to the history.
  };

  return (
    // Mimics body and app-container styles from CSS
    // Use flex, h-screen, w-screen, bg-gray-100 for body-like container
    // Then apply app-container styles within it, using responsive design (md:)
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-0 md:p-5">
      {/* Main container for panels */}
      <div className="w-full h-screen md:w-[calc(100%-40px)] md:h-[calc(100vh-40px)] bg-white flex flex-col md:flex-row overflow-hidden md:rounded-lg md:border md:border-gray-300 md:shadow-lg">
        {/* Use PanelGroup for horizontal resizing */}
        <PanelGroup direction="horizontal" className="flex flex-grow"> {/* Ensure PanelGroup fills the container */}

          {/* Chat Panel */}
          <Panel defaultSize={35} minSize={20} maxSize={75} className="flex flex-col h-full"> {/* Adjust default/min/max as needed */}
            {/* Original chat column content */}
            <div className="bg-white h-full flex flex-col"> {/* Ensure inner div takes full panel height */}
              <Chat updateStructuredDataHistory={updateStructuredDataHistory} />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-blue-500 active:bg-blue-600 cursor-col-resize transition-colors duration-200 ease-in-out hidden md:block" />

          {/* Dash Panel */}
          <Panel defaultSize={65} minSize={25} className="hidden md:flex flex-col h-full"> {/* Adjust default/min as needed */}
             {/* Original visualization column content */}
            <div className="flex-grow h-full bg-gray-50 flex flex-col overflow-y-auto">
              <Dash structuredDataHistory={structuredDataHistory} />
            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}

export default App;
