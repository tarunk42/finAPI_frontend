// Maps state names to Tailwind classes and display text for chat connection status
export const connectionStates = {
  disconnected: { text: 'Disconnected', class: 'text-red-600', buttonText: 'Connect', inputEnabled: true, buttonEnabled: true, urlEnabled: true },
  sending: { text: 'Sending...', class: 'text-blue-600', buttonText: 'Connect', inputEnabled: false, buttonEnabled: false, urlEnabled: false }, // Covers 'Connecting...' too
  ready: { text: 'Ready', class: 'text-orange-500', buttonText: 'Connect', inputEnabled: true, buttonEnabled: false, urlEnabled: false },
  connected: { text: 'Connected', class: 'text-green-600', buttonText: 'Connect', inputEnabled: true, buttonEnabled: false, urlEnabled: false },
  error: { text: 'Error', class: 'text-red-600', buttonText: 'Connect', inputEnabled: false, buttonEnabled: true, urlEnabled: true } // Generic error state
};