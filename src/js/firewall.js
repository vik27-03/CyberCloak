// firewall.js

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        blockBtn: document.getElementById('block-website'),
        filterBtn: document.getElementById('filter-button'),
        output: document.getElementById('output'),
        rulesBody: document.getElementById('rules-body'),
        websiteInput: document.getElementById('website-input'),
        ipInput: document.getElementById('ip-input'),
        actionSelect: document.getElementById('action-select')
    };

    let rules = [];

    // Helper functions
    const displayMessage = msg => elements.output.textContent = msg;
    const isValid = (value, pattern) => pattern.test(value);

    const validators = {
        ip: ip => isValid(ip, /^(\d{1,3}\.){3}\d{1,3}$/),
        domain: domain => isValid(domain, /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/)
    };

    // API calls
    const makeRequest = async (endpoint, data) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) throw new Error(result.error);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    // UI updates
    const updateRulesTable = () => {
        elements.rulesBody.innerHTML = rules.map((rule, index) => `
            <tr>
                <td>${rule.target}</td>
                <td>${rule.action}</td>
                <td><button class="button" onclick="removeRule(${index})">Remove</button></td>
            </tr>
        `).join('');
    };

    // Event handlers
    const handleBlock = async () => {
        const website = elements.websiteInput.value;
        if (!validators.domain(website)) {
            return displayMessage('Invalid website address');
        }

        try {
            const data = await makeRequest('/block-website', { website });
            rules.push({ target: website, action: 'BLOCK' });
            updateRulesTable();
            displayMessage(data.message);
        } catch (error) {
            displayMessage(`Error: ${error.message}`);
        }
    };

    const handleFilter = async () => {
        const ip = elements.ipInput.value;
        const action = elements.actionSelect.value;

        if (!validators.ip(ip)) {
            return displayMessage('Invalid IP address');
        }

        try {
            const data = await makeRequest('/filter-ip', { ip, action });
            rules.push({ target: ip, action });
            updateRulesTable();
            displayMessage(data.message);
        } catch (error) {
            displayMessage(`Error: ${error.message}`);
        }
    };

    // Remove rule handler
    window.removeRule = async (index) => {
        const rule = rules[index];
        try {
            const data = await makeRequest('/remove-rule', {
                target: rule.target,
                type: validators.ip(rule.target) ? 'ip' : 'website'
            });
            rules.splice(index, 1);
            updateRulesTable();
            displayMessage(data.message);
        } catch (error) {
            displayMessage(`Error: ${error.message}`);
        }
    };

    // Event listeners
    elements.blockBtn.addEventListener('click', handleBlock);
    elements.filterBtn.addEventListener('click', handleFilter);
});