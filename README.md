# kalaaVerse - AI Artisan Marketplace

This is a Next.js project bootstrapped with `create-next-app` and enhanced within Firebase Studio. It's an AI-driven marketplace designed to empower local Indian artisans by improving their digital presence and connecting them with a contemporary audience.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

* [Node.js](https://nodejs.org/en/) (version 20.x or later recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)
* [Python](https://www.python.org/) (version 3.10 or later recommended)

## Getting Started

Follow these steps to get your development environment set up and running.

---

### Frontend (Next.js) Setup

1. **Clone the repository**

   First, you'll need to get the code onto your machine. If you've downloaded it as a ZIP, just unzip it.

2. **Install Dependencies**

   Navigate into your project directory in your terminal and run:

   ```bash
   cd frontend
   npm install
   ```

   or if you prefer using yarn:

   ```bash
   yarn install
   ```

3. **Set Up Environment Variables**

   The project uses a `.env` file to manage your Firebase configuration keys.

   1. Create a new file named `.env` in the root of your project directory.
   2. Copy the contents from `src/lib/firebase.ts` into this file. It should look something like this, but with your actual Firebase project keys:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef..."
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."
   ```

   *Note: `src/lib/firebase.ts` should be updated to read from these environment variables to avoid exposing keys directly in the source code.*

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   Open your browser and navigate to [http://localhost:9002](http://localhost:9002). The application should be running, and any code changes will reload automatically.

---

### Backend (Python/FastAPI) Setup

1. **Create a virtual environment**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment**

   * On Windows:

     ```bash
     .\venv\Scripts\activate
     ```

   * On macOS/Linux:

     ```bash
     source venv/bin/activate
     ```

3. **Run the backend server**

   On a separate terminal

   ```bash
   python -m backend.main
   ```

   By default, the FastAPI backend will start (usually on port 8000). You can access the API documentation at:

   ```
   http://localhost:9079/docs
   ```

---
