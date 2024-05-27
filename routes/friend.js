const express = require('express');
const router = express.Router();
const User = require('../modles/user'); 




router.post('/sendRequest', async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (friend.friendRequests.includes(userId)) {
            return res.status(400).json({ msg: 'Friend request already sent' });
        }
        if (user===friend){
            return res.status(400).json({ msg: 'You can not send friend request to yourself' });

        }

        friend.friendRequests.push(userId);
        await friend.save();

        res.status(200).json({ msg: 'Friend request sent' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


router.post('/acceptRequest', async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.friendRequests.includes(friendId)) {
            return res.status(400).json({ msg: 'No friend request found' });
        }

        user.friendRequests = user.friendRequests.filter(request => request.toString() !== friendId);
        user.friends.push(friendId);
        await user.save();

        friend.friends.push(userId);
        await friend.save();

        res.status(200).json({ msg: 'Friend request accepted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


router.post('/rejectRequest',async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.friendRequests.includes(friendId)) {
            return res.status(400).json({ msg: 'Friend request not found' });
        }

        user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
        await user.save();

        res.status(200).json({ msg: 'Friend request rejected' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});



router.post('/getFriendRequests',async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId).populate('friendRequests', 'name email');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json(user.friendRequests);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.post('/getFriends',async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId).populate('friends', 'name email');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json(user.friends);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});




module.exports = router;




