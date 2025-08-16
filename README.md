# MCCIBS Mobile Application

A Flutter-based mobile application for MCCI Business School that provides students with access to their student card, notifications, and more.

## Features

- Student Authentication
- Student Card Access
- Events
- Information
- Profile Management
- Cross-platform Support (iOS & Android)

## Tech Stack

- **Frontend**: Flutter
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local Storage

## Project Structure

```
mccibs_mobile_app_v2/
├── lib/                    # Flutter application code
│   ├── models/            # Data models
│   ├── screens/           # UI screens
│   └── services/          # API and service integrations
├── backend/               # Node.js backend server
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads
│   └── public/           # Static files
└── ios/ & android/       # Platform-specific code
```

## Getting Started

### Prerequisites

- Flutter SDK
- Node.js
- MongoDB
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Remie030101/MccibsApp.git
cd MccibsApp
```

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add necessary environment variables (database URL, JWT secret, etc.)

5. Start the backend server:
```bash
cd backend
npm start
```

6. Run the Flutter application:
```bash
flutter run
```


