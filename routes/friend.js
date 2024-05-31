const express = require('express');
const router = express.Router();
const User = require('../modles/user'); 




router.post('/sendRequest', async (req, res) => {
    const { Uemail, Femail } = req.body;

    try {
        const user = await User.findOne({ email: Uemail });
        const friend = await User.findOne({ email: Femail });

        if (!user || !friend) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (friend.friendRequests.includes(Uemail)) {
            return res.status(400).json({ msg: 'Friend request already sent' });
        }
        if (user===friend){
            return res.status(400).json({ msg: 'You can not send friend request to yourself' });

        }
        if (friend.friends.includes(Uemail)) {
            return res.status(400).json({ msg: 'You are already friends' });
        }

        friend.friendRequests.push(Uemail);
        await friend.save();

        res.status(200).json({ msg: 'Friend request sent' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


router.post('/acceptRequest', async (req, res) => {
    const { Uemail, Femail } = req.body;

    try {
        const user = await User.findOne({ email: Uemail });
        const friend = await User.findOne({ email: Femail });

        if (!user || !friend) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.friendRequests.includes(Femail)) {
            return res.status(400).json({ msg: 'No friend request found' });
        }

        user.friendRequests = user.friendRequests.filter(request => request.toString() !== Femail);
        user.friends.push(Femail);
        await user.save();

        friend.friends.push(Uemail);
        await friend.save();

        res.status(200).json({ msg: 'Friend request accepted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


router.post('/rejectRequest',async (req, res) => {
    const { Uemail, Femail } = req.body;

    try {
        const user = await User.findOne({ email: Uemail });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.friendRequests.includes(Femail)) {
            return res.status(400).json({ msg: 'Friend request not found' });
        }

        user.friendRequests = user.friendRequests.filter(id => id.toString() !== Femail);
        await user.save();

        res.status(200).json({ msg: 'Friend request rejected' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});



router.post('/getFriendRequests',async (req, res) => {
    const { Uemail} = req.body;;

    try {
        const user = await User.findOne({ email: Uemail });

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
    const { Uemail} = req.body;

    try {
        const user = await User.findOne({ email: Uemail });

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




