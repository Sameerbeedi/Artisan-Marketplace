# kalaaVerse - AI Artisan Marketplace

This is a Next.js project bootstrapped with `create-next-app` and enhanced within Firebase Studio. It's an AI-driven marketplace designed to empower local Indian artisans by improving their digital presence and connecting them with a contemporary audience.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/) (version 20.x or later recommended)
- [npm](https://www.npmjs.com/) (which comes with Node.js) or [yarn](https://yarnpkg.com/)

## Getting Started

Follow these steps to get your development environment set up and running.

### 1. Clone the repository

First, you'll need to get the code onto your machine. If you've downloaded it as a ZIP, just unzip it.

### 2. Install Dependencies

Navigate into your project directory in your terminal and run the following command to install all the necessary packages defined in `package.json`:

```bash
npm install
```
or if you prefer using yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

The project uses a `.env` file to manage your Firebase configuration keys. These keys are necessary to connect to your Firebase backend services like Firestore and Authentication.

1.  Create a new file named `.env` in the root of your project directory.
2.  Copy the contents from `src/lib/firebase.ts` into this file. It should look something like this, but with your actual Firebase project keys:

```
# This is an example, use your actual keys from firebase.ts
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."
```
*Note: I will update `src/lib/firebase.ts` to read from these environment variables so you don't expose keys directly in your source code.*

### 4. Run the Development Server

Now you are ready to start the local development server. Run the following command:

```bash
npm run dev
```

This will start the application, typically on port 9002. You can open your browser and navigate to:

[http://localhost:9002](http://localhost:9002)

You should see your kalaaVerse application running. Any changes you make to the code will automatically reload in the browser.

Happy coding!
