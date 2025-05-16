import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // KaTeX CSS

const Chat = ({ updateStructuredDataHistory }) => { // Destructure the prop
    // const [serverUrl, setServerUrl] = useState('http://127.0.0.1:5050'); // Base URL for the API
    // const [serverUrl, setServerUrl] = useState('https://finance-agent-bevg.onrender.com'); // Base URL for the API
    const [serverUrl, setServerUrl] = useState('https://lively-intimate-treefrog.ngrok-free.app'); // Base URL for the API
    // https://2bff-89-168-199-23.ngrok-free.app
    const [chatEndpoint, setChatEndpoint] = useState('/chat'); // Chat endpoint path
    const [agentType, setAgentType] = useState('financial_assistant');
    const [currentMessage, setCurrentMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: 'info', message: 'Initializing...' });
    const [apiAvailable, setApiAvailable] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for the file input

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const checkApiHealth = useCallback(async () => {
        if (!serverUrl.trim()) {
            setStatus({ type: 'error', message: 'Server URL cannot be empty.' });
            setApiAvailable(false);
            return;
        }
        setStatus({ type: 'info', message: 'Checking API status...' });
        try {
            const healthUrl = `${serverUrl.trim().replace(/\/$/, '')}/health`;
            const response = await fetch(healthUrl, {
                method: 'GET',
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
});
            if (!response.ok) {
                throw new Error(`API health check failed: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status === 'healthy') {
                setStatus({ type: 'success', message: 'API is healthy. Ready to chat!' });
                setApiAvailable(true);
            } else {
                throw new Error('API reported unhealthy status.');
            }
        } catch (error) {
            console.error("API Health Check Error:", error);
            setStatus({ type: 'error', message: `API connection failed: ${error.message}. Ensure backend is running and CORS is configured.` });
            setApiAvailable(false);
        }
    }, [serverUrl]);

    useEffect(() => {
        checkApiHealth();
    }, [checkApiHealth]); // Re-check if serverUrl changes

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!currentMessage.trim() && !uploadedImage) || isLoading || !apiAvailable) {
            if (!apiAvailable) {
                setStatus({ type: 'error', message: 'Cannot send message, API is not available. Check URL and backend.' });
            }
            if (!currentMessage.trim() && !uploadedImage) {
                setStatus({ type: 'info', message: 'Please type a message or upload an image.' });
            }
            return;
        }

        const newMessage = { role: 'user', content: currentMessage }; // Capture current message content
        const messagePayload = { role: 'user', content: newMessage.content };
        if (uploadedImage) {
            // Store the necessary image info for rendering in the chat
            messagePayload.imageData = {
                data: uploadedImage.data,
                media_type: uploadedImage.media_type,
                name: uploadedImage.name
            };
        }
        setMessages(prev => [...prev, messagePayload]);
        setCurrentMessage('');
        // Do not reset uploadedImage here yet, only after successful send

        setIsLoading(true);
        setStatus({ type: 'info', message: 'Sending message...' });

        try {
            const fullChatUrl = `${serverUrl.trim().replace(/\/$/, '')}${chatEndpoint.startsWith('/') ? chatEndpoint : `/${chatEndpoint}`}`;
            
            const historyForApi = messages.map(msg => ({ // Use current messages state before adding the new one
                role: msg.role,
                content: msg.content
            })).filter(msg => msg.role === 'user' || msg.role === 'assistant');

            const requestBody = {
                query: newMessage.content, // Use captured message content
                agent_type: agentType,
                history: historyForApi,
            };

            if (uploadedImage) {
                requestBody.image = uploadedImage;
            }

            const response = await fetch(fullChatUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                let errorDetail = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.detail || errorDetail;
                } catch (jsonError) {
                    // If response is not JSON, use the status text
                    errorDetail = response.statusText || errorDetail;
                }
                throw new Error(errorDetail);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            setStatus({ type: 'success', message: 'Message received.' });
            setUploadedImage(null); // Clear the image after successful send

            if (data.tool_outputs && data.tool_outputs.length > 0) {
                console.log("Chat.jsx: Tool outputs received from API:", data.tool_outputs);
                if (updateStructuredDataHistory) {
                    updateStructuredDataHistory(data.tool_outputs);
                }
            }

        } catch (error) {
            console.error("Send Message Error:", error);
            setMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message}` }]);
            setStatus({ type: 'error', message: `Failed to send/receive message: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const [uploadedImage, setUploadedImage] = useState(null);

const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log("handleImageUpload triggered. File:", file); // Debug log
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage({
                data: reader.result.split(',')[1],
                media_type: file.type,
                name: file.name // Optionally store file name for display
            });
            console.log("Image processed and set:", { name: file.name, type: file.type }); // Debug log
        };
        reader.readAsDataURL(file);
    } else {
        console.log("No file selected or file event issue."); // Debug log
    }
};

    
    const getStatusColor = () => {
        if (status.type === 'success') return 'text-green-600';
        if (status.type === 'error') return 'text-red-600';
        return 'text-gray-600'; // Info
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            {/* Header: Configuration */}
            <div className="p-4 bg-white border-b border-gray-300 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-1">Server Base URL:</label>
                        <input
                            type="text"
                            id="serverUrl"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            onBlur={checkApiHealth} // Re-check health on blur
                            placeholder="e.g., http://127.0.0.1:5050"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="agentType" className="block text-sm font-medium text-gray-700 mb-1">Agent Type:</label>
                        <input
                            type="text"
                            id="agentType"
                            value={agentType}
                            onChange={(e) => setAgentType(e.target.value)}
                            placeholder="e.g., financial_assistant"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="md:text-right">
                        <button
                            onClick={checkApiHealth}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                            disabled={isLoading}
                        >
                            Refresh API Status
                        </button>
                    </div>
                </div>
                <p className={`mt-2 text-sm ${getStatusColor()}`}>{status.message}</p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] p-3 rounded-xl shadow-md text-sm ${
                                msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' :
                                msg.role === 'assistant' ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' : // Removed prose classes
                                'bg-red-100 text-red-700 border border-red-300 rounded-none w-full text-center' // System/Error message
                            }`}
                        >
                            {msg.imageData && (
                                <img
                                    src={`data:${msg.imageData.media_type};base64,${msg.imageData.data}`}
                                    alt={msg.imageData.name || "Uploaded image"}
                                    className="max-w-full h-auto my-2 rounded" // Changed styling for responsiveness
                                />
                            )}
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                /* For user messages, only display content if it's not just an image message */
                                msg.content || (msg.imageData && !msg.content) ? msg.content : null
                            )}
                            {/* If it's a user message with only an image and no text,
                                 and you want to display something like "[Image: filename.jpg]",
                                 you can add logic here. For now, it will just show the image. */}
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-[75%] p-3 rounded-xl shadow-md text-sm bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                            <i>Assistant is typing...</i>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-300 shadow-sm">
                <div className="flex flex-col"> {/* Main container for input row and selected file info */}
                    <div className="flex items-center gap-3"> {/* Input row */}
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder={apiAvailable ? "Type your message..." : "API not available. Check server URL."}
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            disabled={isLoading || !apiAvailable}
                        />
                        <button
                            type="button" // Important: type="button" to prevent form submission
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            className="cursor-pointer px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            disabled={isLoading || !apiAvailable}
                        >
                            📎
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef} // Assign the ref here
                            id="fileUploadInput" // Add an id
                        />
                        <button
                            type="submit"
                            disabled={isLoading || (!currentMessage.trim() && !uploadedImage) || !apiAvailable}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            Send
                        </button>
                    </div>
                    {uploadedImage && uploadedImage.name && (
                        <div className="mt-1 text-xs text-gray-500 truncate"> {/* Adjusted styling and placement */}
                            Selected: {uploadedImage.name}
                            <button
                                type="button"
                                onClick={() => {
                                    setUploadedImage(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = ""; // Reset file input
                                    }
                                }}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                (Remove)
                            </button>
                        </div>
                    )}
                </div>
            </form>

        </div>
    );
};

export default Chat;