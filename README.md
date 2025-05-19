<<<<<<< HEAD
# CyberCloak - Basic Firewall Management System

A web-based firewall management interface that provides easy control over iptables rules for website blocking and IP filtering.
```markdown
## Features

- 🌐 Website Blocking
  - Block access to specific websites
  - DNS-level blocking
  - IP resolution and blocking
  
- 🔒 IP Filtering
  - Filter IP addresses with ACCEPT/DROP/REJECT rules
  - Real-time rule application
  - Validation for IP addresses
  
- 📋 Rule Management
  - View active rules
  - Remove rules dynamically
  - Persistent rule storage

## Prerequisites

- Linux operating system
- Node.js (v12 or higher)
- npm (Node Package Manager)
- sudo privileges
- iptables
- dnsutils package (for host command)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cybercloak.git
cd cybercloak
```

2. Install dependencies:
```bash
npm install
```

3. Set execute permissions for the iptables script:
```bash
chmod +x src/scripts/iptables.sh
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Use the web interface to:
   - Block websites
   - Filter IP addresses
   - Manage active rules

## Project Structure

```
├── package.json
├── README.md
└── src/
    ├── css/
    │   └── styles.css
    ├── index.html
    ├── js/
    │   ├── firewall.js
    │   └── server.js
    └── scripts/
        └── iptables.sh
```

## API Endpoints

- `POST /block-website`: Block a website
- `POST /filter-ip`: Apply IP filtering rules
- `POST /remove-rule`: Remove existing rules

## Security Considerations

- Run with appropriate permissions
- Backup iptables rules before modifications
- Validate all user inputs
- Use secure protocols for remote access

## Development

To modify the firewall rules or add new features:

1. Edit 

iptables.sh

 for firewall logic
2. Update 

server.js

 for API endpoints
3. Modify 

firewall.js

 for frontend functionality

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Author

Sayandeep, Dhamini, Vikas, Saloni

## Acknowledgments

- Express.js team
- iptables developers
- Contributors and testers

## Troubleshooting

1. If rules aren't applying:
   - Check sudo permissions
   - Verify iptables installation
   - Check system logs

2. If website blocking fails:
   - Verify dnsutils package installation
   - Check DNS resolution
   - Verify network connectivity

## Support

For issues and feature requests, please create an issue in the repository.
=======
# CyberCloak
>>>>>>> 7deacecc9a090a11feefdd745f0986f06bc3445c
