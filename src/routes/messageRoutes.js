const express = require('express');
const router = express.Router();
const { getConversations, getThread, sendMessage, deleteMessage, getContacts, deleteConversation } = require('../controllers/message');
const protect = require('../middleware/protect');

router.get('/conversations', protect, getConversations);
router.get('/contacts', protect, getContacts);
router.get('/:userId', protect, getThread);
router.post('/', protect, sendMessage);
router.delete('/conversation/:userId', protect, deleteConversation);
router.delete('/:messageId', protect, deleteMessage);


module.exports = router;