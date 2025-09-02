# YourFamilyHub - Self-Hosted Family Hub

A complete family organization platform that runs entirely on your local network. Manage tasks, plan meals, organize movie nights, create polls, and track MotoGP events - all without any external dependencies.

FOR ME:
Make sure to fix after npm install the module path-to-regex by disable all in dist/index.js with DEBUG_URL. Now server.js should start as intended.
Commands: npm install, npm run dev, node server/server.js

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

1. **Download and extract GoldFamily:**
```bash
# Create directory for the application
sudo mkdir -p /var/www/YourFamilyHub
cd /var/www/YourFamilyHub

# Download the latest release
curl -L https://github.com/maxigoldy/YourFamilyHubHub/releases/latest/download/YourFamilyHubHub-dist.tar.gz | sudo tar -xz

# Set proper permissions
sudo chown -R www-data:www-data /var/www/YourFamilyHub
sudo chmod +x /var/www/YourFamilyHub/start.sh
```

2. **Install dependencies:**
```bash
cd /var/www/YourFamilyHub
sudo npm install --production
```

3. **Configure Nginx:**
```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/YourFamilyHub << 'EOF'
server {
    listen 80;
    server_name YourFamilyHub.local;  # Change to your preferred domain
    
    # Serve static files
    location / {
        root /var/www/YourFamilyHub/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
    
    # Proxy API requests to Node.js server
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/YourFamilyHub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Create systemd service:**
```bash
sudo tee /etc/systemd/system/YourFamilyHub.service << 'EOF'
[Unit]
Description=YourFamilyHub Self-Hosted Family Hub
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/YourFamilyHub
ExecStart=/usr/bin/node server/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/YourFamilyHub

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable YourFamilyHub
sudo systemctl start YourFamilyHub
```

5. **Verify installation:**
```bash
# Check service status
sudo systemctl status YourFamilyHub

# Check nginx status
sudo systemctl status nginx

# View logs if needed
sudo journalctl -u YourFamilyHub -f
```

6. **Access your application:**
   - Open your browser and navigate to `http://YourFamilyHub.local` (or your server's IP)
   - Complete the initial setup by creating an admin account
   - Configure your family code and app name

### Local Network Access

To access YourFamilyHub from other devices on your network:

1. **Find your server's IP address:**
```bash
ip addr show | grep inet
```

2. **Update nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/YourFamilyHub
# Change server_name to: server_name goldfamily.local YOUR_SERVER_IP;
sudo systemctl reload nginx
```

3. **Access from other devices:**
   - Use `http://YOUR_SERVER_IP` in any browser on your local network

### Optional: Custom Domain

To use a custom local domain (e.g., `family.home`):

1. **Add to your router's DNS or each device's hosts file:**
```bash
# On each device, edit /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
YOUR_SERVER_IP    family.home
```

2. **Update nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/YourFamilyHub
# Change server_name to: server_name family.home;
sudo systemctl reload nginx
```

## Manual Setup (Alternative)

If you prefer to set up manually:

1. **Clone and build:**
```bash
git clone https://github.com/maxigoldy/YourFamilyHubHub.git
cd YourFamilyHub
npm install
npm run build
```

2. **Start the server:**
```bash
node server/server.js
```

3. **Configure nginx to serve the `dist` folder and proxy `/api` to your Node.js server**

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

## Backup

To backup your data:
```bash
# Copy the database file
cp /var/www/YourFamilyHub/data.json /path/to/backup/YourFamilyHub-backup-$(date +%Y%m%d).db
```

To restore:
```bash
# Stop the service
sudo systemctl stop YourFamilyHub

# Replace the database
sudo cp /path/to/backup/YourFamilyHub-backup-YYYYMMDD.db /var/www/YourFamilyHub/data.json
sudo chown www-data:www-data /var/www/YourFamilyHub/data.json

# Start the service
sudo systemctl start YourFamilyHub
```

## Troubleshooting

### Service won't start
```bash
# Check logs
sudo journalctl -u YourFamilyHub -n 50

# Check if port 3000 is available
sudo netstat -tlnp | grep :3000
```

### Database issues
```bash
# Check database file permissions
ls -la /var/www/YourFamilyHub/data.json

# Reset database (WARNING: This deletes all data)
sudo rm /var/www/YourFamilyHub/data.json
sudo systemctl restart YourFamilyHub
```

### Nginx issues
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

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

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please check the troubleshooting section above or create an issue in the project repository.
