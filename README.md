# YourFamilyHub - Self-Hosted Family Hub

A complete family organization platform that runs entirely on your local network. Manage tasks, plan meals, organize movie nights, create polls, and track MotoGP events - all without any external dependencies.

### Documentation: https://maxigoldmann.gitbook.io/yourfamilyhub

## Features

- **Tasks Management**: Create, assign, and track family tasks
- **Movie Night**: Collaborative watchlist with ratings and reviews
- **Polls**: Create polls with optional lucky wheel for random selection
- **Diner Planning**: Plan family meals up to 2 weeks in advance
- **MotoGP Calendar**: Import and track MotoGP race schedules (optional)
- **Network Links**: Quick access to local network services
- **User Management**: Family member accounts with admin controls
- **Completely Local**: No external network traffic, all data stored locally

## Quick Setup with Nginx

### Prerequisites

- Linux server with nginx installed
- Node.js 18+ installed
- Git installed

### Installation
See our Docs: https://maxigoldmann.gitbook.io/yourfamilyhub

## Configuration

### Initial Setup
1. Access the application in your browser
2. Complete the setup wizard:
   - Choose your app name (replaces "GoldFamily" in the header)
   - Create an admin account
   - Set a family code for new registrations
   - Configure optional features (MotoGP tab)

### Admin Features
- **User Management**: Create, edit, and delete family member accounts
- **App Settings**: Change app name, admin password, family code
- **Feature Toggles**: Enable/disable MotoGP tab
- **Network Links**: Manage quick links to local services

### Data Storage
- All data is stored in `data.json` (SQLite database)
- No external network connections
- Automatic database initialization
- Data persists between restarts

## Security

- **Local Only**: No external network traffic
- **Family Code Protection**: Prevents unauthorized registrations
- **Admin Controls**: Secure admin panel with password protection
- **Data Isolation**: Each family's data is completely separate

## Development

To run in development mode:
```bash
# Install dependencies
npm install

# Start development server (frontend)
npm run dev

# Start backend server (in another terminal)
node server/server.js
```

## License

This project is not licensed under any open-source license.

You are welcome to contribute to its development and use it for yourself. However, you are not allowed to republish this project or its code in any form. It was created for personal use by me and my family and is now shared with the self-hosting community as a courtesy.

Please respect the following conditions:

Do not re-upload, sell, or make any profit from this project.

You may use and modify it only for personal use.

If you have improvements or enhancements to share, feel free to open a pull request.

Thank you for respecting these terms.

## Support

For issues and questions, please check the troubleshooting section above or create an issue in the project repository.
