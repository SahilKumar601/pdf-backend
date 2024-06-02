const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/sendRequest", async (req, res) => {
  const { Uemail, Femail } = req.body;

  try {
    const user = await User.findOne({ email: Uemail });
    const friend = await User.findOne({ email: Femail });

    if (!user || !friend) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (friend.friendRequests.includes(Uemail)) {
      return res
        .status(400)
        .json({ success: false, msg: "Friend request already sent" });
    }
    if (Uemail === Femail) {
      return res.status(400).json({
        success: false,
        msg: "You can not send friend request to yourself",
      });
    }
    if (friend.friends.includes(Uemail)) {
      return res
        .status(400)
        .json({ success: false, msg: "You are already friends" });
    }

    friend.friendRequests.push(Uemail);
    await friend.save();

    res.status(200).json({ success: true, msg: "Friend request sent" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
});

router.post("/acceptRequest", async (req, res) => {
  const { Uemail, Femail } = req.body;

  try {
    const user = await User.findOne({ email: Uemail });
    const friend = await User.findOne({ email: Femail });

    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (!user.friendRequests.includes(Femail)) {
      return res.status(400).json({
        success: false,
        msg: "No friend request found",
      });
    }

    user.friendRequests = user.friendRequests.filter(
      (request) => request.toString() !== Femail
    );
    user.friends.push(Femail);
    await user.save();

    friend.friends.push(Uemail);
    await friend.save();

    res.status(200).json({
      success: true,
      msg: "Friend request accepted",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
});

router.post("/rejectRequest", async (req, res) => {
  const { Uemail, Femail } = req.body;

  try {
    const user = await User.findOne({ email: Uemail });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (!user.friendRequests.includes(Femail)) {
      return res.status(400).json({
        success: false,
        msg: "Friend request not found",
      });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== Femail
    );
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Friend request rejected",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
});

async function getFriend(email) {
  try {
    let user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

async function getFriends(emails) {
  let friendsArray = [];

  for (let i = 0; i < emails.length; i++) {
    let friend = await getFriend(emails[i]);
    friendsArray.push(friend);
  }

  return friendsArray;
}

router.post("/getFriendRequests", async (req, res) => {
  const { Uemail } = req.body;
  let friendRequestsArray = [];

  try {
    const user = await User.findOne({ email: Uemail });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    friendRequestsArray = await getFriends(user.friendRequests);

    console.log(friendRequestsArray);

    res.status(200).json({
      success: true,
      msg: "Friend requests",
      data: friendRequestsArray,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
});

router.post("/getFriends", async (req, res) => {
  const { Uemail } = req.body;

  let friendsArray = [];

  try {
    const user = await User.findOne({ email: Uemail });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    friendsArray = await getFriends(user.friends);

    res.status(200).json({
      success: true,
      msg: "Friends",
      data: friendsArray,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
});

router.post("/searchFriend", async (req, res) => {
  const { Femail } = req.body;

  try {
    const user = await User.findOne({ email: Femail });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "User found",
      data: user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
});

module.exports = router;
