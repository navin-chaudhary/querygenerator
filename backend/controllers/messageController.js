const Message = require('../models/Message');

exports.saveMessage = async (req, res) => {
  const { sender, text, database, schema, timestamp } = req.body;
  
  if (!sender || !text || !timestamp) {
    return res.status(400).json({ message: 'Sender, text, and timestamp are required' });
  }

  try {
    const message = new Message({
      userId: req.user.userId,
      sender,
      text,
      database: database || null,
      schema: schema || null,
      timestamp,
    });
    await message.save();
    res.status(201).json({ message: 'Message saved successfully' });
  } catch (error) {
    console.error('Save message error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.userId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};