// Function to encode file to Base64
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // result includes 'data:mime/type;base64,' prefix
    reader.onerror = error => reject(error);
});

// Helper function to format keys (e.g., "feels_like" -> "Feels Like")
export const formatKey = (key) => {
  // Check if key is a number (like an array index), if so, return it as is.
  if (typeof key === 'number' || !isNaN(parseInt(key))) {
    return key;
  }
  // Otherwise, format the string key
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};