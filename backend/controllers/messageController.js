const Message = require('../models/Message');
const User = require('../models/User');
const validator = require('validator');
const xss = require('xss');

const sanitizeString = (str) => {
  if (!str) return str;
  return xss(validator.trim(str));
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, listingId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Receiver and message content are required'
      });
    }

    if (validator.isEmpty(content.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content cannot be empty'
      });
    }

    if (!validator.isLength(content, { min: 1, max: 1000 })) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content must be between 1 and 1000 characters'
      });
    }

    const sanitizedContent = sanitizeString(content);

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot send message to yourself'
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: sanitizedContent,
      listing: listingId || null
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('listing', 'title');

    res.status(201).json({
      status: 'success',
      data: populatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending message'
    });
  }
};


const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('listing', 'title')
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching conversation'
    });
  }
};


const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach(message => {
      const partnerId = message.sender._id.toString() === userId.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      if (!conversationsMap.has(partnerId)) {
        const partner = message.sender._id.toString() === userId.toString()
          ? message.receiver
          : message.sender;

        conversationsMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        });
      }

      conversationsMap.get(partnerId).messages.push(message);

      if (message.receiver._id.toString() === userId.toString() && !message.read) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values()).map(conv => ({
      partner: conv.partner,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount,
      totalMessages: conv.messages.length
    }));

    res.status(200).json({
      status: 'success',
      results: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching conversations'
    });
  }
};


const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params; 
    const currentUserId = req.user._id;

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} messages marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error marking messages as read'
    });
  }
};


const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching unread count'
    });
  }
};



const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting message'
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  getUnreadCount,
  deleteMessage
};