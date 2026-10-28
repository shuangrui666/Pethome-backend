import { Request, Response } from 'express';
import User from '../models/User.model';
import Post from '../models/Post.model';
import Meetup from '../models/Meetup.model';
import FriendRequest from '../models/FriendRequest.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 关注用户
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId === req.user!.userId) {
      return res.status(400).json({
        success: false,
        message: '不能关注自己'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查是否已关注
    if (user.followers.includes(req.user!.userId)) {
      return res.status(400).json({
        success: false,
        message: '已关注该用户'
      });
    }

    user.followers.push(req.user!.userId);
    await user.save();

    // 更新被关注用户的 following 计数
    const followingUser = await User.findById(req.user!.userId);
    if (followingUser && !followingUser.following.includes(userId)) {
      followingUser.following.push(userId);
      await followingUser.save();
    }

    res.json({
      success: true,
      message: '关注成功'
    });
  } catch (error: any) {
    console.error('关注用户错误:', error);
    res.status(500).json({
      success: false,
      message: '关注失败',
      error: error.message
    });
  }
};

// 取消关注
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    user.followers = user.followers.filter(
      id => id.toString() !== req.user!.userId
    );
    await user.save();

    // 更新取消关注用户的 following 列表
    const unfollowingUser = await User.findById(req.user!.userId);
    if (unfollowingUser) {
      unfollowingUser.following = unfollowingUser.following.filter(
        id => id.toString() !== userId
      );
      await unfollowingUser.save();
    }

    res.json({
      success: true,
      message: '取消关注成功'
    });
  } catch (error: any) {
    console.error('取消关注错误:', error);
    res.status(500).json({
      success: false,
      message: '取消关注失败',
      error: error.message
    });
  }
};

// 获取我的关注列表
export const getFollowingList = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user!.userId)
      .populate('following', 'username avatar bio location petCount');

    const following = user?.following || [];
    const total = following.length;

    const paginatedFollowing = following
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json({
      success: true,
      data: paginatedFollowing,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取关注列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取关注列表失败',
      error: error.message
    });
  }
};

// 获取我的粉丝列表
export const getFollowersList = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user!.userId)
      .populate('followers', 'username avatar bio location petCount');

    const followers = user?.followers || [];
    const total = followers.length;

    const paginatedFollowers = followers
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json({
      success: true,
      data: paginatedFollowers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取粉丝列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取粉丝列表失败',
      error: error.message
    });
  }
};

// 获取我的动态流（关注用户的帖子）
export const getMyFeed = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取关注用户的帖子
    const followingIds = user.following;
    
    const posts = await Post.find({
      authorId: { $in: followingIds }
    })
      .populate('authorId', 'username avatar')
      .populate('comments.userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments({
      authorId: { $in: followingIds }
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取动态流错误:', error);
    res.status(500).json({
      success: false,
      message: '获取动态流失败',
      error: error.message
    });
  }
};

// 获取用户详情
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查是否已关注
    const currentUser = await User.findById(req.query.currentUserId);
    const isFollowing = currentUser?.followers.includes(userId) || false;

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        isFollowing
      }
    });
  } catch (error: any) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败',
      error: error.message
    });
  }
};

// 获取用户的帖子
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({ authorId: userId })
      .populate('authorId', 'username avatar')
      .populate('comments.userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments({ authorId: userId });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取用户帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户帖子失败',
      error: error.message
    });
  }
};

// 同城养宠人列表
export const getLocalPetOwners = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, location, distance = 10000 } = req.query;

    const query: any = { role: 'user' };
    
    if (location && req.query.longitude && req.query.latitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(req.query.longitude), Number(req.query.latitude)]
          },
          $maxDistance: Number(distance)
        }
      };
    }

    const users = await User.find(query)
      .select('username avatar bio location petCount pets following followers')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取同城养宠人错误:', error);
    res.status(500).json({
      success: false,
      message: '获取同城养宠人失败',
      error: error.message
    });
  }
};

// 发送私信
export const sendPrivateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;

    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: '接收用户不存在'
      });
    }

    const message = {
      senderId: req.user!.userId,
      recipientId: userId,
      content,
      createdAt: new Date()
    };

    recipient.messages.push(message);
    await recipient.save();

    res.status(201).json({
      success: true,
      message: '私信发送成功',
      data: message
    });
  } catch (error: any) {
    console.error('发送私信错误:', error);
    res.status(500).json({
      success: false,
      message: '发送私信失败',
      error: error.message
    });
  }
};

// 获取私信列表
export const getPrivateMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取与指定用户的所有私信
    const messages = user.messages
      .filter(
        m =>
          (m.senderId.toString() === userId && m.recipientId.toString() === req.user!.userId) ||
          (m.senderId.toString() === req.user!.userId && m.recipientId.toString() === userId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: user.messages.filter(
          m =>
            (m.senderId.toString() === userId && m.recipientId.toString() === req.user!.userId) ||
            (m.senderId.toString() === req.user!.userId && m.recipientId.toString() === userId)
        ).length
      }
    });
  } catch (error: any) {
    console.error('获取私信列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取私信列表失败',
      error: error.message
    });
  }
};

// 查找附近养宠人（基于地理位置）
export const findCompanions = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, distance = 5000, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '请提供经纬度坐标'
      });
    }

    const query: any = {
      role: 'user',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(distance)
        }
      }
    };

    // 排除自己
    query._id = { $ne: req.user!.userId };

    const users = await User.find(query)
      .select('username avatar bio location petCount pets following followers')
      .limit(Number(limit));

    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('查找附近养宠人错误:', error);
    res.status(500).json({
      success: false,
      message: '查找失败',
      error: error.message
    });
  }
};

// 创建遛狗聚会
export const createMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, meetupTime, maxParticipants, coordinates } = req.body;

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const meetup = new Meetup({
      title,
      description,
      organizerId: req.user!.userId,
      organizerName: user.username,
      organizerAvatar: user.avatar,
      location,
      coordinates: coordinates ? {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      } : undefined,
      meetupTime: new Date(meetupTime),
      maxParticipants,
      currentParticipants: [req.user!.userId],
      status: 'upcoming'
    });

    await meetup.save();

    res.status(201).json({
      success: true,
      data: meetup
    });
  } catch (error: any) {
    console.error('创建聚会错误:', error);
    res.status(500).json({
      success: false,
      message: '创建聚会失败',
      error: error.message
    });
  }
};

// 获取聚会列表
export const getMeetupList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, location } = req.query;

    const query: any = { status: status || 'upcoming' };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const meetups = await Meetup.find(query)
      .populate('organizerId', 'username avatar')
      .populate('currentParticipants', 'username avatar')
      .sort({ meetupTime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Meetup.countDocuments(query);

    res.json({
      success: true,
      data: meetups,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取聚会列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取聚会列表失败',
      error: error.message
    });
  }
};

// 获取我的聚会
export const getMyMeetups = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type = 'all' } = req.query;

    let query: any = {};

    if (type === 'organized') {
      query.organizerId = req.user!.userId;
    } else if (type === 'joined') {
      query.currentParticipants = req.user!.userId;
    } else {
      query.$or = [
        { organizerId: req.user!.userId },
        { currentParticipants: req.user!.userId }
      ];
    }

    const meetups = await Meetup.find(query)
      .populate('organizerId', 'username avatar')
      .populate('currentParticipants', 'username avatar')
      .sort({ meetupTime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Meetup.countDocuments(query);

    res.json({
      success: true,
      data: meetups,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的聚会错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的聚会失败',
      error: error.message
    });
  }
};

// 加入聚会
export const joinMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const meetup = await Meetup.findById(id);
    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: '聚会不存在'
      });
    }

    if (meetup.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: '聚会已开始或已结束'
      });
    }

    if (meetup.currentParticipants.some(id => id.toString() === req.user!.userId)) {
      return res.status(400).json({
        success: false,
        message: '已加入该聚会'
      });
    }

    if (meetup.currentParticipants.length >= meetup.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: '聚会人数已满'
      });
    }

    meetup.currentParticipants.push(req.user!.userId);
    await meetup.save();

    res.json({
      success: true,
      message: '加入聚会成功',
      data: meetup
    });
  } catch (error: any) {
    console.error('加入聚会错误:', error);
    res.status(500).json({
      success: false,
      message: '加入聚会失败',
      error: error.message
    });
  }
};

// 退出聚会
export const leaveMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const meetup = await Meetup.findById(id);
    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: '聚会不存在'
      });
    }

    meetup.currentParticipants = meetup.currentParticipants.filter(
      pid => pid.toString() !== req.user!.userId
    );
    await meetup.save();

    res.json({
      success: true,
      message: '退出聚会成功',
      data: meetup
    });
  } catch (error: any) {
    console.error('退出聚会错误:', error);
    res.status(500).json({
      success: false,
      message: '退出聚会失败',
      error: error.message
    });
  }
};

// 取消聚会
export const cancelMeetup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const meetup = await Meetup.findById(id);
    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: '聚会不存在'
      });
    }

    if (meetup.organizerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '只有组织者可以取消聚会'
      });
    }

    meetup.status = 'cancelled';
    await meetup.save();

    res.json({
      success: true,
      message: '聚会已取消',
      data: meetup
    });
  } catch (error: any) {
    console.error('取消聚会错误:', error);
    res.status(500).json({
      success: false,
      message: '取消聚会失败',
      error: error.message
    });
  }
};

// 发送好友请求
export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId, message } = req.body;

    if (targetUserId === req.user!.userId) {
      return res.status(400).json({
        success: false,
        message: '不能给自己发送好友请求'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查是否已是好友
    const sender = await User.findById(req.user!.userId);
    if (sender?.friends.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: '已经是好友了'
      });
    }

    // 检查是否有待处理的请求
    const existingRequest = await FriendRequest.findOne({
      senderId: req.user!.userId,
      recipientId: targetUserId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: '已发送过好友请求，请等待对方处理'
      });
    }

    const friendRequest = new FriendRequest({
      senderId: req.user!.userId,
      senderName: sender?.username || '',
      senderAvatar: sender?.avatar || '',
      recipientId: targetUserId,
      message: message || '',
      status: 'pending'
    });

    await friendRequest.save();

    // 更新接收用户的好友请求列表
    targetUser.friendRequests.push({
      requestId: friendRequest._id.toString(),
      senderId: friendRequest.senderId.toString(),
      message: friendRequest.message || '',
      status: 'pending',
      createdAt: new Date()
    });
    await targetUser.save();

    res.status(201).json({
      success: true,
      message: '好友请求发送成功',
      data: friendRequest
    });
  } catch (error: any) {
    console.error('发送好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '发送好友请求失败',
      error: error.message
    });
  }
};

// 接受好友请求
export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: '好友请求不存在'
      });
    }

    if (friendRequest.recipientId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '这不是发给你的请求'
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '该请求已处理'
      });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    // 更新双方用户的好友列表
    const sender = await User.findById(friendRequest.senderId);
    const recipient = await User.findById(req.user!.userId);

    if (sender && recipient) {
      sender.friends.push(req.user!.userId.toString());
      recipient.friends.push(sender._id.toString());
      await sender.save();
      await recipient.save();
    }

    // 从好友请求列表中移除
    if (recipient) {
      recipient.friendRequests = recipient.friendRequests.filter(
        id => id.toString() !== requestId
      );
      await recipient.save();
    }

    res.json({
      success: true,
      message: '好友关系建立成功'
    });
  } catch (error: any) {
    console.error('接受好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '接受好友请求失败',
      error: error.message
    });
  }
};

// 拒绝好友请求
export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: '好友请求不存在'
      });
    }

    if (friendRequest.recipientId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '这不是发给你的请求'
      });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    // 从好友请求列表中移除
    const recipient = await User.findById(req.user!.userId);
    if (recipient) {
      recipient.friendRequests = recipient.friendRequests.filter(
        id => id.toString() !== requestId
      );
      await recipient.save();
    }

    res.json({
      success: true,
      message: '好友请求已拒绝'
    });
  } catch (error: any) {
    console.error('拒绝好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '拒绝好友请求失败',
      error: error.message
    });
  }
};

// 取消好友
export const unfriend = async (req: AuthRequest, res: Response) => {
  try {
    const { friendId } = req.params;

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: '不是好友关系'
      });
    }

    // 移除双方的好友关系
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();

    const friend = await User.findById(friendId);
    if (friend) {
      friend.friends = friend.friends.filter(
        id => id.toString() !== req.user!.userId
      );
      await friend.save();
    }

    res.json({
      success: true,
      message: '取消好友成功'
    });
  } catch (error: any) {
    console.error('取消好友错误:', error);
    res.status(500).json({
      success: false,
      message: '取消好友失败',
      error: error.message
    });
  }
};

// 获取好友列表
export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user!.userId)
      .populate('friends', 'username avatar bio location petCount pets');

    const friends = user?.friends || [];
    const total = friends.length;

    const paginatedFriends = friends
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json({
      success: true,
      data: paginatedFriends,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取好友列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取好友列表失败',
      error: error.message
    });
  }
};

// 获取好友请求列表
export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId)
      .populate('friendRequests', 'senderId senderName senderAvatar message status createdAt');

    const friendRequests = user?.friendRequests || [];
    const pendingRequests = friendRequests.filter(
      (req: any) => req.status === 'pending'
    );

    res.json({
      success: true,
      data: pendingRequests
    });
  } catch (error: any) {
    console.error('获取好友请求列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取好友请求列表失败',
      error: error.message
    });
  }
};
