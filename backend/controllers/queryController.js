const { generateQuery } = require('../services/groqService');

exports.handleGenerateQuery = async (req, res) => {
    const { schema, prompt, database, previousMessages } = req.body;

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
        const query = await generateQuery(database, schema, prompt, previousMessages);
        res.json({ response: query }); // Make key consistent with frontend
    } catch (error) {
        console.error('Query Generation Error:', error.message);
        res.status(500).json({
            error: 'Failed to generate query.'
        });
    }
};
