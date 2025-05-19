const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const IPTABLES_PATH = 'src/scripts/iptables.sh';

// Middleware
app.use(express.static('src'));
app.use(express.json());

// Helper functions
const execAsync = command => new Promise((resolve, reject) => {
    exec(command, (error, stdout) => error ? reject(error) : resolve(stdout));
});

const updateIptablesFile = async (command) => {
    const data = await fs.readFile(IPTABLES_PATH, 'utf8');
    const saveRulesIndex = data.indexOf('# Save the rules');
    
    if (saveRulesIndex === -1) {
        throw new Error('Could not find insertion point in iptables.sh');
    }

    const updatedContent = data.slice(0, saveRulesIndex) + 
                         '\n# Added by web interface\n' + 
                         command + '\n\n' + 
                         data.slice(saveRulesIndex);

    await fs.writeFile(IPTABLES_PATH, updatedContent, 'utf8');
    return execAsync(`sudo bash ${IPTABLES_PATH}`);
};

// Initialize iptables
execAsync(`chmod +x ${IPTABLES_PATH} && sudo bash ${IPTABLES_PATH}`)
    .then(() => console.log('Iptables initialized successfully'))
    .catch(error => console.error(`Error initializing iptables: ${error}`));

// Request handlers
const handleRequest = async (req, res, command) => {
    try {
        const stdout = await updateIptablesFile(command);
        res.json({ message: `Successfully ${req.path === '/block-website' ? 'blocked' : 'applied rule for'} ${req.body.website || req.body.ip}`, output: stdout });
    } catch (error) {
        res.status(500).json({ error: `Failed to update rules: ${error.message}` });
    }
};

const handleRemove = async (req, res) => {
    try {
        const { target, type } = req.body;
        const data = await fs.readFile(IPTABLES_PATH, 'utf8');
        const rulePattern = type === 'website' ? 
            new RegExp(`\\n# Added by web interface\\nblock_website "${target}"\\n`, 'g') :
            new RegExp(`\\n# Added by web interface\\nfilter_ip "${target}".*\\n`, 'g');
        
        const updatedContent = data.replace(rulePattern, '\n');
        await fs.writeFile(IPTABLES_PATH, updatedContent, 'utf8');
        const stdout = await execAsync(`sudo bash ${IPTABLES_PATH}`);
        
        res.json({ message: `Successfully removed rule for ${target}`, output: stdout });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove rule' });
    }
};

// Routes
app.post('/block-website', (req, res) => 
    handleRequest(req, res, `block_website "${req.body.website}"`));

app.post('/filter-ip', (req, res) => 
    handleRequest(req, res, `filter_ip "${req.body.ip}" "${req.body.action}"`));

app.post('/remove-rule', handleRemove);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));