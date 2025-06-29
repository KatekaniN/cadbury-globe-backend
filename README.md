# cadbury-globe-backend

This project is a Node.js Express backend service that detects the mood from an uploaded selfie image using the Google Cloud Vision API.

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   You have installed Node.js and npm (or yarn).
*   You have a Google Cloud Project with the **Cloud Vision API** enabled.
*   You have a **Service Account Key** JSON file from your Google Cloud Project with permissions to use the Vision API.

## Installation

To install the project, follow these steps:

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd cadbury-globe-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

## Configuration

This application requires some environment variables to be set. Create a `.env` file in the root of the project or set these variables in your deployment environment.

*   `GOOGLE_CLOUD_KEY`: **Required**. The Base64 encoded string of your Google Cloud Service Account Key JSON file.
    *   To get this, you can convert your `your-service-account-key.json` file to Base64. For example, on Linux/macOS:
        ```bash
        base64 -w 0 your-service-account-key.json
        ```
    *   The application can also read a `service-account-key.json` file placed in the same directory as `express.js` if `GOOGLE_CLOUD_KEY` is not set, but the primary method in `express.js` checks for the environment variable first.
*   `PORT`: Optional. The port the server will listen on. Defaults to `3000`.
*   `FRONTEND_URL`: Optional. The URL of the frontend application for CORS configuration. Defaults to `http://localhost:5173`.

Here's an example of what your `.env` file might look like:

```env
# .env.example

# Required: Base64 encoded content of your Google Cloud service account JSON key
GOOGLE_CLOUD_KEY="YOUR_BASE64_ENCODED_SERVICE_ACCOUNT_KEY_JSON"

# Optional: Port for the server to run on
PORT=3000

# Optional: Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**Important Security Note:** If you choose to use the `service-account-key.json` file directly instead of the `GOOGLE_CLOUD_KEY` environment variable, ensure this file is **never** committed to your version control system. Add it to your `.gitignore` file. The `GOOGLE_CLOUD_KEY` environment variable method is generally preferred for security, especially in production environments.

## Running the Application

To run the application:

*   **For production:**
    ```bash
    npm start
    ```
*   **For development (with auto-reloading via nodemon):**
    ```bash
    npm run dev
    ```

The server will start, and you should see a message like `Server running on port 3000`.

## API Endpoint

### `POST /detect-mood`

This endpoint analyzes an uploaded image and returns the detected mood.

*   **Request:**
    *   Method: `POST`
    *   Content-Type: `multipart/form-data`
    *   Body: Must include a single file field named `selfie` containing the image.
        *   Maximum file size: 5MB.

*   **Response:**
    *   **Success (HTTP 200):**
        ```json
        {
          "mood": "DetectedMood"
        }
        ```
        Where `DetectedMood` can be one of "Joy", "Sorrow", "Anger", "Surprise", or "Neutral".

    *   **Error (HTTP 400/500):**
        ```json
        {
          "error": "Error message describing the issue"
        }
        ```
        Examples: "No image file provided", "File parsing error", "Error analyzing image".

## `uploads` Directory

The application temporarily stores uploaded images in an `uploads` directory, which is created at the project root level if it doesn't already exist. The code attempts to delete these images after processing. Note that one `fs.unlinkSync(imagePath);` call in `express.js` is currently commented out, which might result in files persisting in the `uploads` directory if that specific path is taken during execution. It's advisable to ensure this directory is included in your `.gitignore` file if you don't want to commit any residual files.
