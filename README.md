# Catering Website

A responsive catering website built with HTML, CSS, and JavaScript, integrated with Firebase for backend services.

## Features

- **User Authentication**: Register and login for both users and admins
- **Product Management**: View and add catering products
- **Shopping Cart**: Add products to cart and manage quantities
- **Order Management**: Place orders and view order history
- **User Profiles**: Manage user information
- **Responsive Design**: Works on all device sizes

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Analytics if desired

### 2. Configure Authentication

1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider

### 3. Configure Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** for development
4. Choose a location close to your users

### 4. Get Configuration Details

1. Go to **Project settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add a web app
4. Register your app with a name
5. Copy the configuration object

### 5. Update Firebase Configuration

Replace the configuration in `js/firebase-config.js` with your actual Firebase project details:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
