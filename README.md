# MCCIBS Mobile Application

A Flutter-based mobile application for MCCIBS (Management College of Computer Information and Business Studies) that provides students with access to their academic information, notifications, and more.

## Features

- Student Authentication
- Student Card Access
- Real-time Notifications
- Profile Management
- Cross-platform Support (iOS & Android)

## Tech Stack

- **Frontend**: Flutter
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local Storage
- **Push Notifications**: Firebase Cloud Messaging

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or support, please contact the development team at [contact@mccibs.com](mailto:contact@mccibs.com)
