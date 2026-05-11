// require('dotenv').config();
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const nodemailer = require('nodemailer');
// const bcrypt = require('bcryptjs');
// const { v4: uuidv4 } = require('uuid');
// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const { DynamoDBDocumentClient, PutCommand, UpdateCommand, ScanCommand, DeleteCommand, GetCommand} = require("@aws-sdk/lib-dynamodb");
// const { S3Client } = require('@aws-sdk/client-s3');

// const app = express();
// app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
// app.use(express.json());

// const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
// const docClient = DynamoDBDocumentClient.from(client);
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// });

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// // =================================================================
// // 1. ĐĂNG KÝ & ĐĂNG NHẬP
// // =================================================================
// app.post('/api/auth/register', async (req, res) => {
//     const { email, password, fullName, dob, gender } = req.body;
//     if (!passwordRegex.test(password)) return res.status(400).json({ error: "Mật khẩu phải từ 6 ký tự, gồm chữ hoa, chữ thường và số!" });

//     try {
//         const checkEmail = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
//         if (checkEmail.Items.length > 0) return res.status(400).json({ error: "Email đã tồn tại!" });

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         const newUser = {
//             id: uuidv4(), email, password: hashedPassword, fullName, dob: dob || "", gender: gender || "Khác", avatar: "", bio: "",
//             status: "PENDING", otp, otpExpiredAt: Date.now() + 5 * 60 * 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
//         };

//         await docClient.send(new PutCommand({ TableName: "Users", Item: newUser }));
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER, to: email, subject: "Kích hoạt tài khoản OTT Chat",
//             html: `<div style="font-family: Arial, sans-serif;"><h2>Xác thực tài khoản OTT Chat</h2><p>Mã OTP của bạn là:</p><div style="font-size: 28px; font-weight: bold; color: #0068ff; margin: 16px 0;">${otp}</div><p>Mã có hiệu lực trong 5 phút.</p></div>`
//         });
//         res.status(200).json({ message: "Đăng ký thành công! Tài khoản đang chờ xác thực." });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// app.post('/api/auth/verify', async (req, res) => {
//     const { email, otp } = req.body;
//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
//         const user = result.Items?.[0];
//         if (!user) return res.status(404).json({ error: "Người dùng không tồn tại!" });
//         if (!user.otp || String(user.otp) !== String(otp)) return res.status(400).json({ error: "Mã OTP không chính xác!" });
    
//         if (user.otpExpiredAt && Date.now() > user.otpExpiredAt) return res.status(400).json({ error: "Mã OTP đã hết hạn!" });

//         await docClient.send(new UpdateCommand({
//             TableName: "Users", Key: { id: user.id },
//             UpdateExpression: "set #status = :s, updatedAt = :u remove otp, otpExpiredAt",
//             ExpressionAttributeNames: { "#status": "status" }, ExpressionAttributeValues: { ":s": "ACTIVE", ":u": new Date().toISOString() }
//         }));
//         return res.status(200).json({ message: "Xác thực thành công! Hãy đăng nhập." });
//     } catch (error) { return res.status(500).json({ error: "Lỗi hệ thống" }); }
// });

// app.post('/api/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
//         const user = result.Items[0];
//         if (!user) return res.status(400).json({ error: "Sai email hoặc mật khẩu!" });
//         if (user.status === "PENDING") return res.status(403).json({ error: "Vui lòng xác thực email trước khi đăng nhập!" });
//         if (user.status === "LOCKED") return res.status(403).json({ error: "Tài khoản bị khóa!" });
//         if (user.status === "DELETED") return res.status(403).json({ error: "Tài khoản đã xóa." });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ error: "Sai email hoặc mật khẩu!" });
//         delete user.password; 
//         res.status(200).json({ message: "Đăng nhập thành công", user });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// // =================================================================
// // 3. QUÊN MẬT KHẨU & ĐỔI MẬT KHẨU & CHỈNH SỬA THÔNG TIN
// // =================================================================
// app.post('/api/auth/forgot-password', async (req, res) => {
//     const { email } = req.body;
//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
//         const user = result.Items[0];
//         if (!user || user.status === "DELETED") return res.status(404).json({ error: "Email không tồn tại!" });

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": user.id }, UpdateExpression: "set otp = :o", ExpressionAttributeValues: { ":o": otp } }));
//         await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: 'Khôi phục mật khẩu', html: `<h3>OTP của bạn: <b style="color: red;">${otp}</b></h3>` });
//         res.status(200).json({ message: "Mã OTP đã được gửi." });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// app.post('/api/auth/reset-password', async (req, res) => {
//     const { email, otp, newPassword } = req.body;
//     if (!passwordRegex.test(newPassword)) return res.status(400).json({ error: "Mật khẩu không đủ mạnh!" });

//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
//         const user = result.Items[0];
//         if (user && String(user.otp) === String(otp)) {
//             const hashedPassword = await bcrypt.hash(newPassword, 10);
//             await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": user.id }, UpdateExpression: "set password = :p remove otp", ExpressionAttributeValues: { ":p": hashedPassword } }));
//             res.status(200).json({ message: "Đổi mật khẩu thành công!" });
//         } else { res.status(400).json({ error: "OTP sai hoặc hết hạn!" }); }
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// app.post('/api/users/change-password', async (req, res) => {
//     const { userId, oldPassword, newPassword } = req.body;
//     if (!passwordRegex.test(newPassword)) return res.status(400).json({ error: "Mật khẩu không đủ mạnh!" });
//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "id = :id", ExpressionAttributeValues: { ":id": userId } }));
//         const user = result.Items[0];
//         const isMatch = await bcrypt.compare(oldPassword, user.password);
//         if (!isMatch) return res.status(400).json({ error: "Mật khẩu hiện tại sai!" });

//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": userId }, UpdateExpression: "set password = :p", ExpressionAttributeValues: { ":p": hashedPassword } }));
//         res.status(200).json({ message: "Đổi mật khẩu thành công!" });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// app.put('/api/users/update', async (req, res) => {
//     const { userId, fullName, dob, gender, avatar } = req.body;
//     try {
//         await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": userId }, UpdateExpression: "set fullName = :f, dob = :d, gender = :g, avatar = :a", ExpressionAttributeValues: { ":f": fullName, ":d": dob, ":g": gender, ":a": avatar } }));
//         res.json({ message: "Cập nhật thành công!" });
//     } catch (error) { res.status(500).json({ error: "Lỗi cập nhật" }); }
// });

// // =================================================================
// // 4. QUẢN LÝ NHÓM & LẤY TIN NHẮN
// // =================================================================
// app.get('/api/messages/:roomId', async (req, res) => {
//     const { roomId } = req.params;
//     const { userId } = req.query;

//     try {
//         let userJoinedAt = null;
//         if (userId && roomId.startsWith('GROUP_')) {
//             const groupRes = await docClient.send(new GetCommand({ TableName: "Conversations", Key: { id: roomId } }));
//             if (groupRes.Item && groupRes.Item.joinDates) {
//                 userJoinedAt = groupRes.Item.joinDates[userId];
//             }
//         }

//         const result = await docClient.send(new ScanCommand({
//             TableName: "Messages", FilterExpression: "conversationId = :r OR roomId = :r", ExpressionAttributeValues: { ":r": roomId }
//         }));
        
//         let sortedMessages = result.Items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

//         if (userJoinedAt) {
//             sortedMessages = sortedMessages.filter(msg => new Date(msg.createdAt) >= new Date(userJoinedAt));
//         }
//         res.status(200).json(sortedMessages);
//     } catch (error) { res.status(500).json({ error: "Lỗi tải tin nhắn" }); }
// });

// app.post('/api/conversations/group', async (req, res) => {
//     const { name, creatorId, memberIds } = req.body;
//     try {
//         if (!name || !memberIds || memberIds.length < 2) return res.status(400).json({ error: "Dữ liệu không hợp lệ" });

//         const conversationId = "GROUP_" + Date.now();
//         const now = new Date().toISOString();
        
//         const joinDates = {};
//         [creatorId, ...memberIds].forEach(id => { joinDates[id] = now; });

//         const newGroup = {
//             id: conversationId, type: "group", name: name,
//             participants: [...new Set([creatorId, ...memberIds])], 
//             adminIds: [creatorId], 
//             sendMode: "all_members",
//             joinDates: joinDates, 
//             createdAt: now, updatedAt: now
//         };

//         await docClient.send(new PutCommand({ TableName: "Conversations", Item: newGroup }));
//         res.status(200).json(newGroup);
//     } catch (error) { res.status(500).json({ error: "Lỗi tạo nhóm" }); }
// });

// app.post('/api/conversations/group/:action', async (req, res) => {
//     const { action } = req.params;
//     const { roomId, adminId, targetUserId, userId, newMembers, name, avatar, sendMode, newAdminId } = req.body;
//     try {
//         const getGroup = await docClient.send(new GetCommand({ TableName: "Conversations", Key: { id: roomId } }));
//         if (!getGroup.Item || getGroup.Item.type !== 'group') return res.status(404).json({ error: "Không tìm thấy nhóm" });
        
//         let group = getGroup.Item;
//         const requesterId = adminId || userId; 
//         if (!group.joinDates) group.joinDates = {};

//         if (action === 'remove' || action === 'make_admin' || action === 'transfer_owner') {
//             if (!group.adminIds.includes(requesterId)) return res.status(403).json({ error: "Chỉ Quản trị viên mới có quyền!" });
            
//             if (action === 'remove') {
//                 group.participants = group.participants.filter(id => id !== targetUserId);
//                 group.adminIds = group.adminIds.filter(id => id !== targetUserId);
//                 delete group.joinDates[targetUserId];
//             } else if (action === 'make_admin') {
//                 if (!group.adminIds.includes(targetUserId)) group.adminIds.push(targetUserId);
//             } else if (action === 'transfer_owner') {
//                 group.adminIds = group.adminIds.filter(id => id !== requesterId); 
//                 if (!group.adminIds.includes(newAdminId)) group.adminIds.push(newAdminId); 
//             }
//         } else if (action === 'leave') {
//             group.participants = group.participants.filter(id => id !== requesterId);
//             group.adminIds = group.adminIds.filter(id => id !== requesterId);
//             delete group.joinDates[requesterId];

//             if (group.participants.length === 0) {
//                 await docClient.send(new DeleteCommand({ TableName: "Conversations", Key: { id: roomId } }));
//                 return res.status(200).json({ message: "Nhóm đã tự giải tán vì không còn ai." });
//             }
//         } else if (action === 'add_members') {
//             const uniqueNewIds = newMembers.filter(id => !group.participants.includes(id));
//             group.participants.push(...uniqueNewIds);
//             const now = new Date().toISOString();
//             uniqueNewIds.forEach(id => { group.joinDates[id] = now; });
//         } else if (action === 'update_info') {
//             if (!group.adminIds.includes(requesterId) && sendMode) return res.status(403).json({ error: "No permission" });
//             if (name) group.name = name;
//             if (avatar) group.avatar = avatar;
//             if (sendMode) {
//                 group.sendMode = sendMode;
//                 // Bắn tín hiệu đổi quyền cho các client khác
//                 io.to(roomId).emit('group_event', { roomId, action: 'sendMode_changed', data: { sendMode } });
//             }
//         }

//         group.updatedAt = new Date().toISOString();
//         await docClient.send(new PutCommand({ TableName: "Conversations", Item: group }));
//         res.status(200).json(group);
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// app.delete('/api/conversations/group/:roomId', async (req, res) => {
//     const { roomId } = req.params;
//     const { adminId } = req.query;
//     try {
//         const getGroup = await docClient.send(new GetCommand({ TableName: "Conversations", Key: { id: roomId } }));
//         if (!getGroup.Item || !getGroup.Item.adminIds.includes(adminId)) return res.status(403).json({ error: "Không có quyền" });
//         await docClient.send(new DeleteCommand({ TableName: "Conversations", Key: { id: roomId } }));
//         res.status(200).json({ message: "Giải tán thành công" });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// app.delete('/api/conversations/:roomId', async (req, res) => {
//     const { roomId } = req.params;
//     try {
//         await docClient.send(new DeleteCommand({ TableName: "Conversations", Key: { "id": roomId } }));
//         res.status(200).json({ message: "Đã xóa cuộc trò chuyện thành công!" });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server khi xóa" }); }
// });

// // =================================================================
// // 5. LẤY DANH SÁCH HỘI THOẠI (Fix hiển thị số tin nhắn chưa đọc)
// // =================================================================
// app.get('/api/conversations/user/:userId', async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const convRes = await docClient.send(new ScanCommand({ TableName: "Conversations" }));
//         const userConvs = convRes.Items.filter(c => c.participants && c.participants.includes(userId));
//         const usersRes = await docClient.send(new ScanCommand({ TableName: "Users" }));

//         // Khôi phục logic lấy tin chưa đọc
//         const msgsRes = await docClient.send(new ScanCommand({
//             TableName: "Messages",
//             FilterExpression: "authorId <> :u AND #st = :s",
//             ExpressionAttributeNames: { "#st": "status" },
//             ExpressionAttributeValues: { ":u": userId, ":s": "sent" }
//         }));
//         const unreadMsgs = msgsRes.Items || [];

//         const result = userConvs.map(conv => {
//             const unreadCount = unreadMsgs.filter(m => m.conversationId === conv.id).length;
            
//             if (conv.type === '1-1') {
//                 const otherId = conv.participants.find(id => id !== userId);
//                 const other = usersRes.Items.find(u => u.id === otherId);
//                 return { ...conv, name: other?.fullName || "Người dùng ẩn", avatar: other?.avatar || "", unreadCount };
//             } else {
//                 const detailedMembers = conv.participants.map(pid => {
//                     const u = usersRes.Items.find(user => user.id === pid);
//                     return u ? { id: u.id, fullName: u.fullName, avatar: u.avatar, joinedAt: conv.joinDates ? conv.joinDates[pid] : null } : null;
//                 }).filter(Boolean);
//                 return { ...conv, members: detailedMembers, unreadCount };
//             }
//         });
//         res.status(200).json(result.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });

// app.post('/api/conversations/1-1', async (req, res) => {
//     const { senderId, receiverId } = req.body;
//     const sortedIds = [senderId, receiverId].sort();
//     const conversationId = `1-1_${sortedIds[0]}_${sortedIds[1]}`;
//     try {
//         const checkExist = await docClient.send(new ScanCommand({ TableName: "Conversations", FilterExpression: "id = :id", ExpressionAttributeValues: { ":id": conversationId } }));
//         if (checkExist.Items.length > 0) return res.status(200).json(checkExist.Items[0]); 

//         const newConversation = { id: conversationId, type: "1-1", participants: [senderId, receiverId], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
//         await docClient.send(new PutCommand({ TableName: "Conversations", Item: newConversation }));
//         res.status(200).json(newConversation);
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });

// // =================================================================
// // 6. QUẢN LÝ KẾT BẠN
// // =================================================================
// app.get('/api/users', async (req, res) => {
//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "#status = :s", ExpressionAttributeNames: { "#status": "status" }, ExpressionAttributeValues: { ":s": "ACTIVE" } }));
//         const users = result.Items.map(u => ({ id: u.id, fullName: u.fullName, avatar: u.avatar, email: u.email }));
//         res.status(200).json(users);
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });
// // Thêm API này vào file server.js để lấy thông tin Profile của 1 người
// app.get('/api/users/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await docClient.send(new GetCommand({
//             TableName: "Users",
//             Key: { id }
//         }));
        
//         if (result.Item) {
//             const user = result.Item;
//             delete user.password; // Xóa password trước khi gửi về mobile cho bảo mật
//             delete user.otp;
//             res.status(200).json(user);
//         } else {
//             res.status(404).json({ error: "Không tìm thấy người dùng" });
//         }
//     } catch (error) {
//         console.error("Lỗi lấy user:", error);
//         res.status(500).json({ error: "Lỗi server" });
//     }
// });
// app.post('/api/friends/search', async (req, res) => {
//     const { email } = req.body;
//     try {
//         const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
//         if (result.Items.length === 0) return res.status(404).json({ error: "Không tìm thấy" });
//         const user = result.Items[0];
//         res.json({ id: user.id, fullName: user.fullName, avatar: user.avatar, email: user.email });
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });
// app.post('/api/friends/request', async (req, res) => {
//     const { senderId, receiverId } = req.body;
//     try {
//         const friendship = { id: "FRIEND_" + Date.now().toString(), senderId, receiverId, status: "PENDING", createdAt: new Date().toISOString() };
//         await docClient.send(new PutCommand({ TableName: "Friendships", Item: friendship }));
//         res.json({ message: "Đã gửi!" });
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });
// app.post('/api/friends/accept', async (req, res) => {
//     const { friendshipId } = req.body;
//     try {
//         await docClient.send(new UpdateCommand({ TableName: "Friendships", Key: { id: friendshipId }, UpdateExpression: "set #s = :status", ExpressionAttributeNames: { "#s": "status" }, ExpressionAttributeValues: { ":status": "ACCEPTED" } }));
//         res.json({ message: "Đã chấp nhận!" });
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });
// app.post('/api/friends/delete', async (req, res) => {
//     const { friendshipId } = req.body;
//     try {
//         await docClient.send(new DeleteCommand({ TableName: "Friendships", Key: { id: friendshipId } }));
//         res.json({ message: "Đã xóa!" });
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });
// app.get('/api/friends/:userId', async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const usersRes = await docClient.send(new ScanCommand({ TableName: "Users" }));
//         const friendsRes = await docClient.send(new ScanCommand({ TableName: "Friendships" }));
        
//         const pendingRequests = friendsRes.Items.filter(f => f.receiverId === userId && f.status === "PENDING").map(f => ({ friendshipId: f.id, user: usersRes.Items.find(u => u.id === f.senderId) }));
//         const sentRequests = friendsRes.Items.filter(f => f.senderId === userId && f.status === "PENDING").map(f => ({ friendshipId: f.id, user: usersRes.Items.find(u => u.id === f.receiverId) }));
//         const acceptedFriends = friendsRes.Items.filter(f => (f.senderId === userId || f.receiverId === userId) && f.status === "ACCEPTED").map(f => {
//             const friendId = f.senderId === userId ? f.receiverId : f.senderId;
//             return { friendshipId: f.id, user: usersRes.Items.find(u => u.id === friendId) };
//         });
//         res.json({ pendingRequests, sentRequests, acceptedFriends });
//     } catch (error) { res.status(500).json({ error: "Lỗi" }); }
// });

// // =================================================================
// // 7. SOCKET.IO (CHAT & XỬ LÝ NHÓM WEBRTC)
// // =================================================================
// const onlineUsers = new Map();
// const busyUsers = new Set();
// const groupCallsMap = new Map(); // Lưu trữ: roomId -> Map(userId -> userName)

// io.on('connection', (socket) => {
//     console.log(`[Socket] Kết nối mới: ${socket.id}`);
//     socket.on('register_user', (userId) => { if(userId) { onlineUsers.set(userId, socket.id); socket.userId = userId; io.emit('user_online', userId); }});
//     socket.on('get_online_users', () => { socket.emit('online_users_list', Array.from(onlineUsers.keys())); });
//     socket.on('join_room', (roomId) => { socket.join(roomId); });

//     socket.on('send_message', async (data) => {
//         const messageItem = {
//             id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
//             conversationId: data.roomId, authorId: data.senderId, authorName: data.senderName, text: data.text,
//             messageType: data.messageType || 'text', fileName: data.fileName || '', status: 'sent', 
//             replyTo: data.replyTo || null, isRecalled: false, deletedFor: [], createdAt: new Date().toISOString()
//         };
//         try { io.to(data.roomId).emit('receive_message', messageItem); await docClient.send(new PutCommand({ TableName: "Messages", Item: messageItem })); } catch (error) {}
//     });

//     socket.on('recall_message', async ({ messageId, roomId }) => {
//         try {
//             await docClient.send(new UpdateCommand({ TableName: "Messages", Key: { id: messageId }, UpdateExpression: "set isRecalled = :r", ExpressionAttributeValues: { ":r": true } }));
//             io.to(roomId).emit('message_recalled', messageId);
//         } catch (error) {}
//     });
//     socket.on('delete_message_for_me', async ({ messageId, userId, roomId }) => {
//         try {
//             const getMsg = await docClient.send(new GetCommand({ TableName: "Messages", Key: { id: messageId } }));
//             if (getMsg.Item) {
//                 let deletedFor = getMsg.Item.deletedFor || [];
//                 if (!deletedFor.includes(userId)) {
//                     deletedFor.push(userId);
//                     await docClient.send(new UpdateCommand({ TableName: "Messages", Key: { id: messageId }, UpdateExpression: "set deletedFor = :d", ExpressionAttributeValues: { ":d": deletedFor } }));
//                 }
//             }
//             socket.emit('message_deleted_for_me', messageId);
//         } catch (error) {}
//     });

//     socket.on('mark_as_seen', async ({ roomId, userId }) => {
//         try {
//             socket.to(roomId).emit('messages_seen', { roomId, userId });
//             const result = await docClient.send(new ScanCommand({
//                 TableName: "Messages", FilterExpression: "conversationId = :r AND authorId <> :u AND #st = :s",
//                 ExpressionAttributeNames: { "#st": "status" }, ExpressionAttributeValues: { ":r": roomId, ":u": userId, ":s": "sent" }
//             }));
//             for (const msg of result.Items) {
//                 await docClient.send(new UpdateCommand({ TableName: "Messages", Key: { id: msg.id }, UpdateExpression: "set #st = :seen", ExpressionAttributeNames: { "#st": "status" }, ExpressionAttributeValues: { ":seen": "seen" } }));
//             }
//         } catch (error) {}
//     });

//     socket.on('typing', ({ roomId, userName, isTyping }) => { socket.to(roomId).emit('user_typing', { userName, isTyping }); });
//     socket.on('group_event', (data) => { io.to(data.roomId).emit('group_event', data); });

//     // --- WebRTC 1-1 ---
//     socket.on('request_call', ({ caller, receiverId, isVideo }) => {
//         const receiverSocketId = onlineUsers.get(receiverId);
//         if (!receiverSocketId) return socket.emit('call_status', { status: 'failed', reason: 'Người dùng không trực tuyến' });
//         if (busyUsers.has(receiverId) || busyUsers.has(caller.id)) return socket.emit('call_status', { status: 'busy', reason: 'Người dùng đang bận' });

//         busyUsers.add(caller.id);
//         busyUsers.add(receiverId);
//         socket.emit('call_status', { status: 'ringing' });
//         io.to(receiverSocketId).emit('incoming_call', { caller, isVideo });
//     });

//     socket.on('accept_call', ({ callerId, receiverId }) => {
//         const callerSocketId = onlineUsers.get(callerId);
//         if (callerSocketId) io.to(callerSocketId).emit('call_accepted');
//     });

//     socket.on('reject_call', ({ callerId, receiverId, status }) => {
//         busyUsers.delete(callerId); busyUsers.delete(receiverId);
//         const callerSocketId = onlineUsers.get(callerId);
//         if (callerSocketId) io.to(callerSocketId).emit('call_status', { status: status }); 
//     });

//     socket.on('end_call', async ({ callerId, receiverId, callData }) => {
//         busyUsers.delete(callerId); busyUsers.delete(receiverId);
//         const targetId = socket.userId === callerId ? receiverId : callerId;
//         const targetSocketId = onlineUsers.get(targetId);
//         if (targetSocketId) io.to(targetSocketId).emit('call_ended');

//         if (callData) {
//             const historyItem = { id: "CALL_" + Date.now(), callerId: callData.callerId, receiverId: callData.receiverId, startTime: callData.startTime, endTime: new Date().toISOString(), duration: callData.duration, status: callData.status, createdAt: new Date().toISOString() };
//             try { await docClient.send(new PutCommand({ TableName: "CallHistory", Item: historyItem })); } catch (error) {}
//         }
//     });

//     // --- XỬ LÝ NHÓM: TRẠM TRUNG CHUYỂN MESH & ĐẾM NGƯỜI ---
//     const broadcastActiveCalls = () => {
//         // Gửi danh sách các phòng đang có cuộc gọi cho TẤT CẢ mọi người
//         const activeCalls = Array.from(groupCallsMap.keys());
//         io.emit('active_group_calls', activeCalls);
//     };

//     socket.on('start_group_call', ({ roomId, caller, roomName }) => {
//         socket.to(roomId).emit('incoming_group_call', { roomId, caller, roomName });
//         // Khởi tạo phòng nếu chưa có
//         if (!groupCallsMap.has(roomId)) {
//             groupCallsMap.set(roomId, new Map());
//             broadcastActiveCalls(); // Cập nhật danh sách phòng đang gọi
//         }
//     });

//     socket.on('join_group_call', ({ roomId, user }) => {
//         socket.to(roomId).emit('user_joined_group_call', user);
//         if (!groupCallsMap.has(roomId)) {
//             groupCallsMap.set(roomId, new Map());
//             broadcastActiveCalls();
//         }
//         groupCallsMap.get(roomId).set(user.id, user.fullName);
//     });

//     // Khi có ai đó rời phòng (Hoặc người cuối cùng)
//     socket.on('leave_group_call', async ({ roomId, userId }) => {
//         socket.to(roomId).emit('user_left_group_call', userId);

//         const currentRoom = groupCallsMap.get(roomId);
//         if (currentRoom && currentRoom.has(userId)) {
//             const userName = currentRoom.get(userId);
//             currentRoom.delete(userId); 

//             try {
//                 const leaveMsg = {
//                     id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
//                     conversationId: roomId, authorId: "system", authorName: "Hệ thống",
//                     text: `${userName} đã rời cuộc gọi.`, messageType: 'system',
//                     status: 'sent', createdAt: new Date().toISOString()
//                 };
//                 io.to(roomId).emit('receive_message', leaveMsg);
//                 await docClient.send(new PutCommand({ TableName: "Messages", Item: leaveMsg }));

//                 if (currentRoom.size === 0) {
//                     groupCallsMap.delete(roomId);
//                     broadcastActiveCalls(); // Báo cho mọi người là phòng này hết gọi rồi
                    
//                     const endMsg = {
//                         id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
//                         conversationId: roomId, authorId: "system", authorName: "Hệ thống",
//                         text: `Cuộc gọi video nhóm đã kết thúc.`, messageType: 'system',
//                         status: 'sent', createdAt: new Date().toISOString()
//                     };
//                     io.to(roomId).emit('receive_message', endMsg);
//                     await docClient.send(new PutCommand({ TableName: "Messages", Item: endMsg }));
//                 }
//             } catch (error) { console.error(error); }
//         }
//     });

//     socket.on('webrtc_signal', ({ targetId, signal, senderId, isGroup }) => {
//         const targetSocketId = onlineUsers.get(targetId);
//         if (targetSocketId) io.to(targetSocketId).emit('webrtc_signal', { signal, senderId, isGroup });
//     });

//     // Gỡ lỗi nếu đang gọi nhóm mà vô tình tắt Web đứt ngang
//     socket.on('disconnect', async () => {
//         const dUserId = socket.userId;
//         if (dUserId) {
//             onlineUsers.delete(dUserId); 
//             busyUsers.delete(dUserId); 
//             io.emit('user_offline', dUserId); 

//             // Quét xem ông này có đang dở dang trong Group nào không để vứt ổng ra
//             for (let [roomId, callRoom] of groupCallsMap.entries()) {
//                 if (callRoom.has(dUserId)) {
//                     const dUserName = callRoom.get(dUserId);
//                     callRoom.delete(dUserId);
//                     socket.to(roomId).emit('user_left_group_call', dUserId);

//                     try {
//                         const leaveMsg = {
//                             id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
//                             conversationId: roomId, authorId: "system", authorName: "Hệ thống",
//                             text: `${dUserName} đã mất kết nối.`, messageType: 'system',
//                             status: 'sent', createdAt: new Date().toISOString()
//                         };
//                         io.to(roomId).emit('receive_message', leaveMsg);
//                         await docClient.send(new PutCommand({ TableName: "Messages", Item: leaveMsg }));

//                         if (callRoom.size === 0) {
//                             groupCallsMap.delete(roomId);
//                             broadcastActiveCalls(); // Báo cho mọi người là phòng này hết gọi rồi
//                             const endMsg = {
//                                 id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
//                                 conversationId: roomId, authorId: "system", authorName: "Hệ thống",
//                                 text: `Cuộc gọi video nhóm đã kết thúc.`, messageType: 'system',
//                                 status: 'sent', createdAt: new Date().toISOString()
//                             };
//                             io.to(roomId).emit('receive_message', endMsg);
//                             await docClient.send(new PutCommand({ TableName: "Messages", Item: endMsg }));
//                         }
//                     } catch (e) { console.error(e); }
//                 }
//             }
//         }
//     });
// });

// // =================================================================
// // 8. UPLOAD FILE LÊN AWS S3
// // =================================================================
// const AWS_REGION = "us-east-1";
// const BUCKET_NAME = "ott-community-media-dhk18"; 
// const s3Client = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } });

// const upload = multer({ 
//     storage: multerS3({ s3: s3Client, bucket: BUCKET_NAME, contentType: function (req, file, cb) { cb(null, file.mimetype); }, key: function (req, file, cb) { const fileName = `chat_files/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`; cb(null, fileName); } }),
//     limits: { fileSize: 50 * 1024 * 1024 } 
// });

// app.post('/api/upload', upload.single('file'), (req, res) => {
//     if (!req.file) return res.status(400).json({ error: "Chưa có file" });
//     try {
//         const fileUrl = req.file.location; 
//         let finalType = 'file'; const mime = req.file.mimetype; const ext = req.file.originalname.toLowerCase();
//         if (mime.startsWith('image/') || ext.endsWith('.jpg') || ext.endsWith('.png')) finalType = 'image';
//         else if (mime.startsWith('video/') || ext.endsWith('.mp4')) finalType = 'video';
//         else if (mime.startsWith('audio/') || ext.endsWith('.webm') || ext.endsWith('.mp3')) finalType = 'audio';

//         res.status(200).json({ url: fileUrl, type: finalType, name: req.file.originalname });
//     } catch (error) { res.status(500).json({ error: "Lỗi upload file" }); }
// });
// // =================================================================
// // 9. API THẢ CẢM XÚC & GHIM TIN NHẮN
// // =================================================================

// // 1. API Thả cảm xúc
// app.post('/api/messages/react', async (req, res) => {
//     const { messageId, userId, reaction, roomId } = req.body;
//     try {
//         const getMsg = await docClient.send(new GetCommand({ TableName: "Messages", Key: { id: messageId } }));
//         if (!getMsg.Item) return res.status(404).json({ error: "Không tìm thấy tin nhắn" });
        
//         let reactions = getMsg.Item.reactions || {};
//         if (reactions[userId] === reaction) delete reactions[userId]; // Bấm lần 2 cùng icon để hủy
//         else reactions[userId] = reaction; // Đổi icon
        
//         await docClient.send(new UpdateCommand({ 
//             TableName: "Messages", Key: { id: messageId }, 
//             UpdateExpression: "set reactions = :r", 
//             ExpressionAttributeValues: { ":r": reactions } 
//         }));
        
//         io.to(roomId).emit('message_reacted', { messageId, reactions });
//         res.status(200).json({ success: true, reactions });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });

// // 2. API Ghim tin nhắn
// app.post('/api/conversations/pin', async (req, res) => {
//     const { roomId, messageId, messageText, authorName } = req.body;
//     try {
//         // Truyền messageId = null để gỡ ghim
//         const pinnedMessage = messageId ? { id: messageId, text: messageText, authorName } : null;
//         await docClient.send(new UpdateCommand({ 
//             TableName: "Conversations", Key: { id: roomId }, 
//             UpdateExpression: "set pinnedMessage = :p", 
//             ExpressionAttributeValues: { ":p": pinnedMessage } 
//         }));
        
//         io.to(roomId).emit('message_pinned', { pinnedMessage });
//         res.status(200).json({ success: true, pinnedMessage });
//     } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
// });
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 BACKEND CHẠY CỔNG ${PORT}`));

require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, ScanCommand, DeleteCommand, GetCommand} = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json());

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// =================================================================
// 1. ĐĂNG KÝ & ĐĂNG NHẬP
// =================================================================
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName, dob, gender } = req.body;
    if (!passwordRegex.test(password)) return res.status(400).json({ error: "Mật khẩu phải từ 6 ký tự, gồm chữ hoa, chữ thường và số!" });

    try {
        const checkEmail = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
        if (checkEmail.Items.length > 0) return res.status(400).json({ error: "Email đã tồn tại!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = {
            id: uuidv4(), email, password: hashedPassword, fullName, dob: dob || "", gender: gender || "Khác", avatar: "", bio: "",
            status: "PENDING", otp, otpExpiredAt: Date.now() + 5 * 60 * 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };

        await docClient.send(new PutCommand({ TableName: "Users", Item: newUser }));
        await transporter.sendMail({
            from: process.env.EMAIL_USER, to: email, subject: "Kích hoạt tài khoản OTT Chat",
            html: `<div style="font-family: Arial, sans-serif;"><h2>Xác thực tài khoản OTT Chat</h2><p>Mã OTP của bạn là:</p><div style="font-size: 28px; font-weight: bold; color: #0068ff; margin: 16px 0;">${otp}</div><p>Mã có hiệu lực trong 5 phút.</p></div>`
        });
        res.status(200).json({ message: "Đăng ký thành công! Tài khoản đang chờ xác thực." });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

app.post('/api/auth/verify', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
        const user = result.Items?.[0];
        if (!user) return res.status(404).json({ error: "Người dùng không tồn tại!" });
        if (!user.otp || String(user.otp) !== String(otp)) return res.status(400).json({ error: "Mã OTP không chính xác!" });
    
        if (user.otpExpiredAt && Date.now() > user.otpExpiredAt) return res.status(400).json({ error: "Mã OTP đã hết hạn!" });

        await docClient.send(new UpdateCommand({
            TableName: "Users", Key: { id: user.id },
            UpdateExpression: "set #status = :s, updatedAt = :u remove otp, otpExpiredAt",
            ExpressionAttributeNames: { "#status": "status" }, ExpressionAttributeValues: { ":s": "ACTIVE", ":u": new Date().toISOString() }
        }));
        return res.status(200).json({ message: "Xác thực thành công! Hãy đăng nhập." });
    } catch (error) { return res.status(500).json({ error: "Lỗi hệ thống" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
        const user = result.Items[0];
        if (!user) return res.status(400).json({ error: "Sai email hoặc mật khẩu!" });
        if (user.status === "PENDING") return res.status(403).json({ error: "Vui lòng xác thực email trước khi đăng nhập!" });
        if (user.status === "LOCKED") return res.status(403).json({ error: "Tài khoản bị khóa!" });
        if (user.status === "DELETED") return res.status(403).json({ error: "Tài khoản đã xóa." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Sai email hoặc mật khẩu!" });
        delete user.password; 
        res.status(200).json({ message: "Đăng nhập thành công", user });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

// =================================================================
// 3. QUÊN MẬT KHẨU & ĐỔI MẬT KHẨU & CHỈNH SỬA THÔNG TIN
// =================================================================
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
        const user = result.Items[0];
        if (!user || user.status === "DELETED") return res.status(404).json({ error: "Email không tồn tại!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": user.id }, UpdateExpression: "set otp = :o", ExpressionAttributeValues: { ":o": otp } }));
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: 'Khôi phục mật khẩu', html: `<h3>OTP của bạn: <b style="color: red;">${otp}</b></h3>` });
        res.status(200).json({ message: "Mã OTP đã được gửi." });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!passwordRegex.test(newPassword)) return res.status(400).json({ error: "Mật khẩu không đủ mạnh!" });

    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
        const user = result.Items[0];
        if (user && String(user.otp) === String(otp)) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": user.id }, UpdateExpression: "set password = :p remove otp", ExpressionAttributeValues: { ":p": hashedPassword } }));
            res.status(200).json({ message: "Đổi mật khẩu thành công!" });
        } else { res.status(400).json({ error: "OTP sai hoặc hết hạn!" }); }
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

app.post('/api/users/change-password', async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!passwordRegex.test(newPassword)) return res.status(400).json({ error: "Mật khẩu không đủ mạnh!" });
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "id = :id", ExpressionAttributeValues: { ":id": userId } }));
        const user = result.Items[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Mật khẩu hiện tại sai!" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": userId }, UpdateExpression: "set password = :p", ExpressionAttributeValues: { ":p": hashedPassword } }));
        res.status(200).json({ message: "Đổi mật khẩu thành công!" });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

app.put('/api/users/update', async (req, res) => {
    const { userId, fullName, dob, gender, avatar } = req.body;
    try {
        await docClient.send(new UpdateCommand({ TableName: "Users", Key: { "id": userId }, UpdateExpression: "set fullName = :f, dob = :d, gender = :g, avatar = :a", ExpressionAttributeValues: { ":f": fullName, ":d": dob, ":g": gender, ":a": avatar } }));
        res.json({ message: "Cập nhật thành công!" });
    } catch (error) { res.status(500).json({ error: "Lỗi cập nhật" }); }
});

// =================================================================
// 4. QUẢN LÝ NHÓM & LẤY TIN NHẮN
// =================================================================
app.get('/api/messages/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.query;

    try {
        let userJoinedAt = null;
        if (userId && roomId.startsWith('GROUP_')) {
            const groupRes = await docClient.send(new GetCommand({ TableName: "Conversations", Key: { id: roomId } }));
            if (groupRes.Item && groupRes.Item.joinDates) {
                userJoinedAt = groupRes.Item.joinDates[userId];
            }
        }

        const result = await docClient.send(new ScanCommand({
            TableName: "Messages", FilterExpression: "conversationId = :r OR roomId = :r", ExpressionAttributeValues: { ":r": roomId }
        }));
        
        let sortedMessages = result.Items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (userJoinedAt) {
            sortedMessages = sortedMessages.filter(msg => new Date(msg.createdAt) >= new Date(userJoinedAt));
        }
        res.status(200).json(sortedMessages);
    } catch (error) { res.status(500).json({ error: "Lỗi tải tin nhắn" }); }
});

app.post('/api/conversations/group', async (req, res) => {
    const { name, creatorId, memberIds } = req.body;
    try {
        if (!name || !memberIds || memberIds.length < 2) return res.status(400).json({ error: "Dữ liệu không hợp lệ" });

        const conversationId = "GROUP_" + Date.now();
        const now = new Date().toISOString();
        
        const joinDates = {};
        [creatorId, ...memberIds].forEach(id => { joinDates[id] = now; });

        const newGroup = {
            id: conversationId, type: "group", name: name,
            participants: [...new Set([creatorId, ...memberIds])], 
            adminIds: [creatorId], 
            sendMode: "all_members",
            joinDates: joinDates, 
            createdAt: now, updatedAt: now
        };

        await docClient.send(new PutCommand({ TableName: "Conversations", Item: newGroup }));
        res.status(200).json(newGroup);
    } catch (error) { res.status(500).json({ error: "Lỗi tạo nhóm" }); }
});

app.post('/api/conversations/group/:action', async (req, res) => {
    const { action } = req.params;
    const { roomId, adminId, targetUserId, userId, newMembers, name, avatar, sendMode, newAdminId } = req.body;
    try {
        const getGroup = await docClient.send(new GetCommand({ TableName: "Conversations", Key: { id: roomId } }));
        if (!getGroup.Item || getGroup.Item.type !== 'group') return res.status(404).json({ error: "Không tìm thấy nhóm" });
        
        let group = getGroup.Item;
        const requesterId = adminId || userId; 
        if (!group.joinDates) group.joinDates = {};

        if (action === 'remove' || action === 'make_admin' || action === 'transfer_owner') {
            if (!group.adminIds.includes(requesterId)) return res.status(403).json({ error: "Chỉ Quản trị viên mới có quyền!" });
            
            if (action === 'remove') {
                group.participants = group.participants.filter(id => id !== targetUserId);
                group.adminIds = group.adminIds.filter(id => id !== targetUserId);
                delete group.joinDates[targetUserId];
            } else if (action === 'make_admin') {
                if (!group.adminIds.includes(targetUserId)) group.adminIds.push(targetUserId);
            } else if (action === 'transfer_owner') {
                group.adminIds = group.adminIds.filter(id => id !== requesterId); 
                if (!group.adminIds.includes(newAdminId)) group.adminIds.push(newAdminId); 
            }
        } else if (action === 'leave') {
            group.participants = group.participants.filter(id => id !== requesterId);
            group.adminIds = group.adminIds.filter(id => id !== requesterId);
            delete group.joinDates[requesterId];

            if (group.participants.length === 0) {
                await docClient.send(new DeleteCommand({ TableName: "Conversations", Key: { id: roomId } }));
                return res.status(200).json({ message: "Nhóm đã tự giải tán vì không còn ai." });
            }
        } else if (action === 'add_members') {
            const uniqueNewIds = newMembers.filter(id => !group.participants.includes(id));
            group.participants.push(...uniqueNewIds);
            const now = new Date().toISOString();
            uniqueNewIds.forEach(id => { group.joinDates[id] = now; });
        } else if (action === 'update_info') {
            if (!group.adminIds.includes(requesterId) && sendMode) return res.status(403).json({ error: "No permission" });
            if (name) group.name = name;
            if (avatar) group.avatar = avatar;
            if (sendMode) {
                group.sendMode = sendMode;
                // Bắn tín hiệu đổi quyền cho các client khác
                io.to(roomId).emit('group_event', { roomId, action: 'sendMode_changed', data: { sendMode } });
            }
        }

        group.updatedAt = new Date().toISOString();
        await docClient.send(new PutCommand({ TableName: "Conversations", Item: group }));
        res.status(200).json(group);
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

app.delete('/api/conversations/group/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { adminId } = req.query;
    try {
        const getGroup = await docClient.send(new GetCommand({ TableName: "Conversations", Key: { id: roomId } }));
        if (!getGroup.Item || !getGroup.Item.adminIds.includes(adminId)) return res.status(403).json({ error: "Không có quyền" });
        await docClient.send(new DeleteCommand({ TableName: "Conversations", Key: { id: roomId } }));
        res.status(200).json({ message: "Giải tán thành công" });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

app.delete('/api/conversations/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        await docClient.send(new DeleteCommand({ TableName: "Conversations", Key: { "id": roomId } }));
        res.status(200).json({ message: "Đã xóa cuộc trò chuyện thành công!" });
    } catch (error) { res.status(500).json({ error: "Lỗi Server khi xóa" }); }
});

// =================================================================
// 5. LẤY DANH SÁCH HỘI THOẠI (Fix hiển thị số tin nhắn chưa đọc)
// =================================================================
app.get('/api/conversations/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const convRes = await docClient.send(new ScanCommand({ TableName: "Conversations" }));
        const userConvs = convRes.Items.filter(c => c.participants && c.participants.includes(userId));
        const usersRes = await docClient.send(new ScanCommand({ TableName: "Users" }));

        // Khôi phục logic lấy tin chưa đọc
        const msgsRes = await docClient.send(new ScanCommand({
            TableName: "Messages",
            FilterExpression: "authorId <> :u AND #st = :s",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":u": userId, ":s": "sent" }
        }));
        const unreadMsgs = msgsRes.Items || [];

        const result = userConvs.map(conv => {
            const unreadCount = unreadMsgs.filter(m => m.conversationId === conv.id).length;
            
            if (conv.type === '1-1') {
                const otherId = conv.participants.find(id => id !== userId);
                const other = usersRes.Items.find(u => u.id === otherId);
                return { ...conv, name: other?.fullName || "Người dùng ẩn", avatar: other?.avatar || "", unreadCount };
            } else {
                const detailedMembers = conv.participants.map(pid => {
                    const u = usersRes.Items.find(user => user.id === pid);
                    return u ? { id: u.id, fullName: u.fullName, avatar: u.avatar, joinedAt: conv.joinDates ? conv.joinDates[pid] : null } : null;
                }).filter(Boolean);
                return { ...conv, members: detailedMembers, unreadCount };
            }
        });
        res.status(200).json(result.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});

app.post('/api/conversations/1-1', async (req, res) => {
    const { senderId, receiverId } = req.body;
    const sortedIds = [senderId, receiverId].sort();
    const conversationId = `1-1_${sortedIds[0]}_${sortedIds[1]}`;
    try {
        const checkExist = await docClient.send(new ScanCommand({ TableName: "Conversations", FilterExpression: "id = :id", ExpressionAttributeValues: { ":id": conversationId } }));
        if (checkExist.Items.length > 0) return res.status(200).json(checkExist.Items[0]); 

        const newConversation = { id: conversationId, type: "1-1", participants: [senderId, receiverId], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        await docClient.send(new PutCommand({ TableName: "Conversations", Item: newConversation }));
        res.status(200).json(newConversation);
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});

// =================================================================
// 6. QUẢN LÝ KẾT BẠN
// =================================================================
app.get('/api/users', async (req, res) => {
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "#status = :s", ExpressionAttributeNames: { "#status": "status" }, ExpressionAttributeValues: { ":s": "ACTIVE" } }));
        const users = result.Items.map(u => ({ id: u.id, fullName: u.fullName, avatar: u.avatar, email: u.email }));
        res.status(200).json(users);
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});
// Thêm API này vào file server.js để lấy thông tin Profile của 1 người
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await docClient.send(new GetCommand({
            TableName: "Users",
            Key: { id }
        }));
        
        if (result.Item) {
            const user = result.Item;
            delete user.password; // Xóa password trước khi gửi về mobile cho bảo mật
            delete user.otp;
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        console.error("Lỗi lấy user:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});
app.post('/api/friends/search', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
        if (result.Items.length === 0) return res.status(404).json({ error: "Không tìm thấy" });
        const user = result.Items[0];
        res.json({ id: user.id, fullName: user.fullName, avatar: user.avatar, email: user.email });
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});
app.post('/api/friends/request', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        const friendship = { id: "FRIEND_" + Date.now().toString(), senderId, receiverId, status: "PENDING", createdAt: new Date().toISOString() };
        await docClient.send(new PutCommand({ TableName: "Friendships", Item: friendship }));
        res.json({ message: "Đã gửi!" });
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});
app.post('/api/friends/accept', async (req, res) => {
    const { friendshipId } = req.body;
    try {
        await docClient.send(new UpdateCommand({ TableName: "Friendships", Key: { id: friendshipId }, UpdateExpression: "set #s = :status", ExpressionAttributeNames: { "#s": "status" }, ExpressionAttributeValues: { ":status": "ACCEPTED" } }));
        res.json({ message: "Đã chấp nhận!" });
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});
app.post('/api/friends/delete', async (req, res) => {
    const { friendshipId } = req.body;
    try {
        await docClient.send(new DeleteCommand({ TableName: "Friendships", Key: { id: friendshipId } }));
        res.json({ message: "Đã xóa!" });
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});
app.get('/api/friends/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const usersRes = await docClient.send(new ScanCommand({ TableName: "Users" }));
        const friendsRes = await docClient.send(new ScanCommand({ TableName: "Friendships" }));
        
        const pendingRequests = friendsRes.Items.filter(f => f.receiverId === userId && f.status === "PENDING").map(f => ({ friendshipId: f.id, user: usersRes.Items.find(u => u.id === f.senderId) }));
        const sentRequests = friendsRes.Items.filter(f => f.senderId === userId && f.status === "PENDING").map(f => ({ friendshipId: f.id, user: usersRes.Items.find(u => u.id === f.receiverId) }));
        const acceptedFriends = friendsRes.Items.filter(f => (f.senderId === userId || f.receiverId === userId) && f.status === "ACCEPTED").map(f => {
            const friendId = f.senderId === userId ? f.receiverId : f.senderId;
            return { friendshipId: f.id, user: usersRes.Items.find(u => u.id === friendId) };
        });
        res.json({ pendingRequests, sentRequests, acceptedFriends });
    } catch (error) { res.status(500).json({ error: "Lỗi" }); }
});

// =================================================================
// 7. SOCKET.IO (CHAT & XỬ LÝ NHÓM WEBRTC)
// =================================================================
const onlineUsers = new Map();
const busyUsers = new Set();
const groupCallsMap = new Map(); // Lưu trữ: roomId -> Map(userId -> userName)

io.on('connection', (socket) => {
    console.log(`[Socket] Kết nối mới: ${socket.id}`);
    socket.on('register_user', (userId) => { if(userId) { onlineUsers.set(userId, socket.id); socket.userId = userId; io.emit('user_online', userId); }});
    socket.on('get_online_users', () => { socket.emit('online_users_list', Array.from(onlineUsers.keys())); });
    socket.on('join_room', (roomId) => { socket.join(roomId); });

    socket.on('send_message', async (data) => {
        const messageItem = {
            id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
            conversationId: data.roomId, authorId: data.senderId, authorName: data.senderName, text: data.text,
            messageType: data.messageType || 'text', fileName: data.fileName || '', status: 'sent', 
            replyTo: data.replyTo || null, isRecalled: false, deletedFor: [], createdAt: new Date().toISOString()
        };
        try { io.to(data.roomId).emit('receive_message', messageItem); await docClient.send(new PutCommand({ TableName: "Messages", Item: messageItem })); } catch (error) {}
    });

    socket.on('recall_message', async ({ messageId, roomId }) => {
        try {
            await docClient.send(new UpdateCommand({ TableName: "Messages", Key: { id: messageId }, UpdateExpression: "set isRecalled = :r", ExpressionAttributeValues: { ":r": true } }));
            io.to(roomId).emit('message_recalled', messageId);
        } catch (error) {}
    });
    socket.on('delete_message_for_me', async ({ messageId, userId, roomId }) => {
        try {
            const getMsg = await docClient.send(new GetCommand({ TableName: "Messages", Key: { id: messageId } }));
            if (getMsg.Item) {
                let deletedFor = getMsg.Item.deletedFor || [];
                if (!deletedFor.includes(userId)) {
                    deletedFor.push(userId);
                    await docClient.send(new UpdateCommand({ TableName: "Messages", Key: { id: messageId }, UpdateExpression: "set deletedFor = :d", ExpressionAttributeValues: { ":d": deletedFor } }));
                }
            }
            socket.emit('message_deleted_for_me', messageId);
        } catch (error) {}
    });

    socket.on('mark_as_seen', async ({ roomId, userId }) => {
        try {
            socket.to(roomId).emit('messages_seen', { roomId, userId });
            const result = await docClient.send(new ScanCommand({
                TableName: "Messages", FilterExpression: "conversationId = :r AND authorId <> :u AND #st = :s",
                ExpressionAttributeNames: { "#st": "status" }, ExpressionAttributeValues: { ":r": roomId, ":u": userId, ":s": "sent" }
            }));
            for (const msg of result.Items) {
                await docClient.send(new UpdateCommand({ TableName: "Messages", Key: { id: msg.id }, UpdateExpression: "set #st = :seen", ExpressionAttributeNames: { "#st": "status" }, ExpressionAttributeValues: { ":seen": "seen" } }));
            }
        } catch (error) {}
    });

    socket.on('typing', ({ roomId, userName, isTyping }) => { socket.to(roomId).emit('user_typing', { roomId, userName, isTyping }); });
    socket.on('group_event', (data) => { io.to(data.roomId).emit('group_event', data); });

    // --- WebRTC 1-1 ---
    socket.on('request_call', ({ caller, receiverId, isVideo }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (!receiverSocketId) return socket.emit('call_status', { status: 'failed', reason: 'Người dùng không trực tuyến' });
        if (busyUsers.has(receiverId) || busyUsers.has(caller.id)) return socket.emit('call_status', { status: 'busy', reason: 'Người dùng đang bận' });

        busyUsers.add(caller.id);
        busyUsers.add(receiverId);
        socket.emit('call_status', { status: 'ringing' });
        io.to(receiverSocketId).emit('incoming_call', { caller, isVideo });
    });

    socket.on('accept_call', ({ callerId, receiverId }) => {
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) io.to(callerSocketId).emit('call_accepted');
    });

    socket.on('reject_call', ({ callerId, receiverId, status }) => {
        busyUsers.delete(callerId); busyUsers.delete(receiverId);
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) io.to(callerSocketId).emit('call_status', { status: status }); 
    });

    socket.on('end_call', async ({ callerId, receiverId, callData }) => {
        busyUsers.delete(callerId); busyUsers.delete(receiverId);
        const targetId = socket.userId === callerId ? receiverId : callerId;
        const targetSocketId = onlineUsers.get(targetId);
        if (targetSocketId) io.to(targetSocketId).emit('call_ended');

        if (callData) {
            const historyItem = { id: "CALL_" + Date.now(), callerId: callData.callerId, receiverId: callData.receiverId, startTime: callData.startTime, endTime: new Date().toISOString(), duration: callData.duration, status: callData.status, createdAt: new Date().toISOString() };
            try { await docClient.send(new PutCommand({ TableName: "CallHistory", Item: historyItem })); } catch (error) {}
        }
    });

    // --- XỬ LÝ NHÓM: TRẠM TRUNG CHUYỂN MESH & ĐẾM NGƯỜI ---
    const broadcastActiveCalls = () => {
        // Gửi danh sách các phòng đang có cuộc gọi cho TẤT CẢ mọi người
        const activeCalls = Array.from(groupCallsMap.keys());
        io.emit('active_group_calls', activeCalls);
    };

    socket.on('start_group_call', ({ roomId, caller, roomName }) => {
        socket.to(roomId).emit('incoming_group_call', { roomId, caller, roomName });
        // Khởi tạo phòng nếu chưa có
        if (!groupCallsMap.has(roomId)) {
            groupCallsMap.set(roomId, new Map());
            broadcastActiveCalls(); // Cập nhật danh sách phòng đang gọi
        }
    });

    socket.on('join_group_call', ({ roomId, user }) => {
        socket.to(roomId).emit('user_joined_group_call', user);
        if (!groupCallsMap.has(roomId)) {
            groupCallsMap.set(roomId, new Map());
            broadcastActiveCalls();
        }
        groupCallsMap.get(roomId).set(user.id, user.fullName);
    });

    // Khi có ai đó rời phòng (Hoặc người cuối cùng)
    socket.on('leave_group_call', async ({ roomId, userId }) => {
        socket.to(roomId).emit('user_left_group_call', userId);

        const currentRoom = groupCallsMap.get(roomId);
        if (currentRoom && currentRoom.has(userId)) {
            const userName = currentRoom.get(userId);
            currentRoom.delete(userId); 

            try {
                const leaveMsg = {
                    id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
                    conversationId: roomId, authorId: "system", authorName: "Hệ thống",
                    text: `${userName} đã rời cuộc gọi.`, messageType: 'system',
                    status: 'sent', createdAt: new Date().toISOString()
                };
                io.to(roomId).emit('receive_message', leaveMsg);
                await docClient.send(new PutCommand({ TableName: "Messages", Item: leaveMsg }));

                if (currentRoom.size === 0) {
                    groupCallsMap.delete(roomId);
                    broadcastActiveCalls(); // Báo cho mọi người là phòng này hết gọi rồi
                    
                    const endMsg = {
                        id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
                        conversationId: roomId, authorId: "system", authorName: "Hệ thống",
                        text: `Cuộc gọi video nhóm đã kết thúc.`, messageType: 'system',
                        status: 'sent', createdAt: new Date().toISOString()
                    };
                    io.to(roomId).emit('receive_message', endMsg);
                    await docClient.send(new PutCommand({ TableName: "Messages", Item: endMsg }));
                }
            } catch (error) { console.error(error); }
        }
    });

    socket.on('webrtc_signal', ({ targetId, signal, senderId, isGroup }) => {
        const targetSocketId = onlineUsers.get(targetId);
        if (targetSocketId) io.to(targetSocketId).emit('webrtc_signal', { signal, senderId, isGroup });
    });

    // Gỡ lỗi nếu đang gọi nhóm mà vô tình tắt Web đứt ngang
    socket.on('disconnect', async () => {
        const dUserId = socket.userId;
        if (dUserId) {
            onlineUsers.delete(dUserId); 
            busyUsers.delete(dUserId); 
            io.emit('user_offline', dUserId); 

            // Quét xem ông này có đang dở dang trong Group nào không để vứt ổng ra
            for (let [roomId, callRoom] of groupCallsMap.entries()) {
                if (callRoom.has(dUserId)) {
                    const dUserName = callRoom.get(dUserId);
                    callRoom.delete(dUserId);
                    socket.to(roomId).emit('user_left_group_call', dUserId);

                    try {
                        const leaveMsg = {
                            id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
                            conversationId: roomId, authorId: "system", authorName: "Hệ thống",
                            text: `${dUserName} đã mất kết nối.`, messageType: 'system',
                            status: 'sent', createdAt: new Date().toISOString()
                        };
                        io.to(roomId).emit('receive_message', leaveMsg);
                        await docClient.send(new PutCommand({ TableName: "Messages", Item: leaveMsg }));

                        if (callRoom.size === 0) {
                            groupCallsMap.delete(roomId);
                            broadcastActiveCalls(); // Báo cho mọi người là phòng này hết gọi rồi
                            const endMsg = {
                                id: "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
                                conversationId: roomId, authorId: "system", authorName: "Hệ thống",
                                text: `Cuộc gọi video nhóm đã kết thúc.`, messageType: 'system',
                                status: 'sent', createdAt: new Date().toISOString()
                            };
                            io.to(roomId).emit('receive_message', endMsg);
                            await docClient.send(new PutCommand({ TableName: "Messages", Item: endMsg }));
                        }
                    } catch (e) { console.error(e); }
                }
            }
        }
    });
});

// =================================================================
// 8. UPLOAD FILE LÊN AWS S3
// =================================================================
const AWS_REGION = "us-east-1";
const BUCKET_NAME = "ott-community-media-dhk18"; 
const s3Client = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } });

const upload = multer({ 
    storage: multerS3({ s3: s3Client, bucket: BUCKET_NAME, contentType: function (req, file, cb) { cb(null, file.mimetype); }, key: function (req, file, cb) { const fileName = `chat_files/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`; cb(null, fileName); } }),
    limits: { fileSize: 50 * 1024 * 1024 } 
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Chưa có file" });
    try {
        const fileUrl = req.file.location; 
        let finalType = 'file'; const mime = req.file.mimetype; const ext = req.file.originalname.toLowerCase();
        if (mime.startsWith('image/') || ext.endsWith('.jpg') || ext.endsWith('.png')) finalType = 'image';
        else if (mime.startsWith('video/') || ext.endsWith('.mp4')) finalType = 'video';
        else if (mime.startsWith('audio/') || ext.endsWith('.webm') || ext.endsWith('.mp3')) finalType = 'audio';

        res.status(200).json({ url: fileUrl, type: finalType, name: req.file.originalname });
    } catch (error) { res.status(500).json({ error: "Lỗi upload file" }); }
});
// =================================================================
// 9. API THẢ CẢM XÚC & GHIM TIN NHẮN
// =================================================================

// 1. API Thả cảm xúc
app.post('/api/messages/react', async (req, res) => {
    const { messageId, userId, reaction, roomId } = req.body;
    try {
        const getMsg = await docClient.send(new GetCommand({ TableName: "Messages", Key: { id: messageId } }));
        if (!getMsg.Item) return res.status(404).json({ error: "Không tìm thấy tin nhắn" });
        
        let reactions = getMsg.Item.reactions || {};
        if (reactions[userId] === reaction) delete reactions[userId]; // Bấm lần 2 cùng icon để hủy
        else reactions[userId] = reaction; // Đổi icon
        
        await docClient.send(new UpdateCommand({ 
            TableName: "Messages", Key: { id: messageId }, 
            UpdateExpression: "set reactions = :r", 
            ExpressionAttributeValues: { ":r": reactions } 
        }));
        
        io.to(roomId).emit('message_reacted', { messageId, reactions });
        res.status(200).json({ success: true, reactions });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});

// 2. API Ghim tin nhắn
app.post('/api/conversations/pin', async (req, res) => {
    const { roomId, messageId, messageText, authorName } = req.body;
    try {
        // Truyền messageId = null để gỡ ghim
        const pinnedMessage = messageId ? { id: messageId, text: messageText, authorName } : null;
        await docClient.send(new UpdateCommand({ 
            TableName: "Conversations", Key: { id: roomId }, 
            UpdateExpression: "set pinnedMessage = :p", 
            ExpressionAttributeValues: { ":p": pinnedMessage } 
        }));
        
        io.to(roomId).emit('message_pinned', { pinnedMessage });
        res.status(200).json({ success: true, pinnedMessage });
    } catch (error) { res.status(500).json({ error: "Lỗi Server" }); }
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 BACKEND CHẠY CỔNG ${PORT}`));