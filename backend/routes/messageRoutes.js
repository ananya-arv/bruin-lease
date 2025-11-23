const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  getUnreadCount,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', sendMessage);
router.get('/conversations', getAllConversations);
router.get('/unread/count', getUnreadCount);
router.get('/conversation/:userId', getConversation);
router.put('/read/:userId', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;