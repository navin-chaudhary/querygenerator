const { generateQuery } = require('../services/groqService');

exports.generateQuery = async (req, res) => {
    const { schema, prompt, database } = req.body;

    if (!schema || !prompt || !database) {
        return res.status(400).json({ 
            error: 'Schema, prompt, and database are required.' 
        });
    }

    const supportedDatabases = ['MongoDB', 'PostgreSQL', 'MySQL'];
    if (!supportedDatabases.includes(database)) {
        return res.status(400).json({ 
            error: `Unsupported database: ${database}. Supported databases are: ${supportedDatabases.join(', ')}.` 
        });
    }

    try {
        const query = await generateQuery(database, schema, prompt);
        res.json({ query });
    } catch (error) {
        console.error('Query Generation Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate query.' 
        });
    }
};
