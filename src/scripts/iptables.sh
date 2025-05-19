#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (sudo)"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p /etc/iptables

# Backup existing rules
echo "Creating backup of existing rules..."
iptables-save > /etc/iptables/rules.backup.$(date +%F)

# Flush existing rules
echo "Flushing existing rules..."
iptables -F
iptables -X
iptables -Z

# Set default policies
echo "Setting default policies..."
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow established and related connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow loopback interface
iptables -A INPUT -i lo -j ACCEPT

# Allow incoming SSH connections
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow incoming HTTP connections
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow incoming HTTPS connections
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow DNS queries
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p udp --sport 53 -j ACCEPT

# Website blocking function
block_website() {
    local website=$1
    if [ -z "$website" ]; then
        echo "Error: Website parameter required"
        return 1
    fi
    
    # Check if host command exists
    if ! command -v host &> /dev/null; then
        echo "Error: 'host' command not found. Please install dnsutils package."
        return 1
    fi  
    
    # Resolve IP addresses for the website
    echo "Resolving IPs for $website..."
    local ips=$(host $website | awk '/has address/ { print $4 }')
    if [ -n "$ips" ]; then
        for ip in $ips; do
            iptables -A OUTPUT -p tcp -d $ip -j DROP
            iptables -A OUTPUT -p udp -d $ip -j DROP
            echo "Blocked IP $ip for website: $website"
        done
        # Add DNS blocking
        iptables -A OUTPUT -p udp --dport 53 -m string --string "$website" --algo bm -j DROP
        echo "Added DNS blocking for $website"
    else
        echo "Could not resolve $website"
        return 1
    fi
}

# IP filtering function
filter_ip() {
    local ip=$1
    local action=$2
    
    if [ -z "$ip" ] || [ -z "$action" ]; then
        echo "Error: IP and action parameters required"
        return 1
    fi
    
    # Validate IP address format
    if ! echo $ip | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' > /dev/null; then
        echo "Error: Invalid IP address format"
        return 1
    fi
    
    # Validate action
    case $action in
        "ACCEPT"|"DROP"|"REJECT")
            iptables -A INPUT -s $ip -j $action
            echo "Applied $action rule for IP: $ip"
            ;;
        *)
            echo "Error: Invalid action. Use ACCEPT, DROP, or REJECT"
            return 1
            ;;
    esac
}

# Function to remove rules
remove_rule() {
    local target=$1
    local chain=$2
    
    iptables -D $chain $target
    echo "Removed rule $target from chain $chain"
}

# Function to list all rules
list_rules() {
    echo "Current iptables rules:"
    iptables -L -v -n
}

# Example usage:
# block_website "www.wikipedia.org"
# block_website "www.google.com"
# filter_ip "192.168.1.100" "DROP"

























# Save the rules
if [ -d "/etc/iptables" ]; then
    iptables-save > /etc/iptables/rules.v4
else
    mkdir -p /etc/iptables
    iptables-save > /etc/iptables/rules.v4
fi

# Display the current rules
echo "Current iptables rules:"
iptables -L -v -n

# Create restore script for persistence across reboots
mkdir -p /etc/network/if-pre-up.d
cat > /etc/network/if-pre-up.d/iptables-restore << EOF
#!/bin/sh
iptables-restore < /etc/iptables/rules.v4
EOF

chmod +x /etc/network/if-pre-up.d/iptables-restore

echo "Firewall configuration completed successfully!"