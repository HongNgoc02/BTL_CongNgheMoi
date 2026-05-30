// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import EmojiPicker from 'emoji-picker-react';
// import { 
//     Send, MessageCircle, Contact, Settings, 
//     UserCircle2, UserPlus, Check, Search, Clock,
//     Smile, Image as ImageIcon, Paperclip, Film, FileText, Download, Loader2,
//     Globe, Moon, Sun, X, UserMinus, CheckCheck,
//     CornerUpLeft, Trash2, RotateCcw, Forward,
//     Phone, Video, Mic, MicOff, Camera, CameraOff, PhoneOff, PhoneCall, Info,
//     Users, ShieldCheck, ShieldAlert, LogOut, Edit3, Camera as CameraIcon, Key, Video as VideoIcon,
//     MoreHorizontal, Pin, EyeOff
// } from 'lucide-react';
// import api from '../services/api';

// const socket = io('http://10.17.87.137:5000'); 
// const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// // =================================================================
// // 0. TIỆN ÍCH CHUNG
// // =================================================================
// const formatTimeSeconds = (sec) => { 
//     const m = Math.floor(sec / 60).toString().padStart(2, '0'); 
//     const s = (sec % 60).toString().padStart(2, '0'); 
//     return `${m}:${s}`; 
// };

// const formatTimeMillis = (millis) => {
//     const totalSeconds = Math.floor(millis / 1000);
//     const m = Math.floor(totalSeconds / 60);
//     const s = totalSeconds % 60;
//     return `${m}:${s < 10 ? '0' : ''}${s}`;
// };

// // =================================================================
// // 1. COMPONENT FORM XÁC NHẬN TÙY CHỈNH
// // =================================================================
// const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose, isAlert, theme, bgPanel }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
//             <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${bgPanel} transform transition-all scale-100`}>
//                 <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
//                     <h2 className="text-xl font-bold">{title}</h2>
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"><X size={20} /></button>
//                 </div>
//                 <div className="p-6 text-center text-[16px] leading-relaxed">
//                     {message}
//                 </div>
//                 <div className={`p-4 border-t flex gap-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
//                     {!isAlert && (
//                         <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
//                     )}
//                     <button 
//                         onClick={onConfirm} 
//                         className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isAlert ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
//                     >
//                         {isAlert ? "Đã hiểu" : "Xác nhận"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // =================================================================
// // COMPONENT TRÌNH PHÁT GHI ÂM TẠI CHỖ
// // =================================================================
// const InlineAudioPlayer = ({ uri, isMine }) => {
//     const [soundActive, setSoundActive] = useState(false);
//     return (
//         <div className="flex items-center gap-2 py-1">
//             <audio 
//                 src={uri} 
//                 controls 
//                 className="max-w-[200px] h-8 outline-none" 
//                 onPlay={() => setSoundActive(true)} 
//                 onPause={() => setSoundActive(false)}
//             />
//         </div>
//     );
// };

// // =================================================================
// // COMPONENT RENDER VIDEO THÔNG MINH CHO CẢ 1-1 VÀ NHÓM
// // =================================================================
// const VideoPlayer = ({ stream, isLocal, className }) => {
//     const ref = useRef();
//     useEffect(() => {
//         if (ref.current && stream) {
//             ref.current.srcObject = stream;
//         }
//     }, [stream]);
//     return <video ref={ref} autoPlay playsInline muted={isLocal} className={className} />;
// };

// // =================================================================
// // 2. COMPONENT TẠO NHÓM / THÊM THÀNH VIÊN / CHUYỂN QUYỀN
// // =================================================================
// const CreateGroupModal = ({ friends, groupMembers, onClose, onCreate, onTransfer, theme, bgPanel, mode = 'create' }) => {
//     const [groupName, setGroupName] = useState("");
//     const [selectedMembers, setSelectedMembers] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");

//     const displayList = mode === 'transfer' ? groupMembers : friends;
//     const filteredList = displayList.filter(f => {
//         const name = mode === 'transfer' ? f.fullName : f.user.fullName;
//         return name.toLowerCase().includes(searchTerm.toLowerCase());
//     });

//     const toggleMember = (userId) => {
//         if (mode === 'transfer') {
//             setSelectedMembers([userId]);
//         } else {
//             setSelectedMembers(prev => 
//                 prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
//             );
//         }
//     };

//     const handleConfirm = () => {
//         if (mode === 'create') {
//             if (!groupName.trim()) return alert("Vui lòng nhập tên nhóm!");
//             if (selectedMembers.length < 2) return alert("Chọn ít nhất 2 thành viên để tạo nhóm!");
//             onCreate(groupName, selectedMembers);
//         } else if (mode === 'add') {
//             if (selectedMembers.length === 0) return alert("Chọn ít nhất 1 người để thêm!");
//             onCreate(null, selectedMembers);
//         } else if (mode === 'transfer') {
//             if (selectedMembers.length !== 1) return alert("Chọn 1 người để chuyển quyền!");
//             onTransfer(selectedMembers[0]);
//         }
//     };

//     const modalTitle = mode === 'create' ? "Tạo nhóm mới" : mode === 'add' ? "Thêm thành viên" : "Chuyển quyền Nhóm trưởng";

//     return (
//         <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
//             <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${bgPanel}`}>
//                 <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
//                     <h2 className="text-xl font-bold flex items-center gap-2">
//                         <Users className="text-blue-500" /> {modalTitle}
//                     </h2>
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"><X size={20} /></button>
//                 </div>
//                 <div className="p-5">
//                     {mode === 'create' && (
//                         <>
//                             <label className="block text-sm font-bold mb-2">Tên nhóm</label>
//                             <input type="text" placeholder="Ví dụ: Nhóm Học Tập..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className={`w-full p-3 rounded-xl mb-4 outline-none border focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`} />
//                         </>
//                     )}
//                     <label className="block text-sm font-bold mb-2">Chọn người ({selectedMembers.length})</label>
//                     <div className={`flex items-center gap-2 p-2 rounded-xl mb-3 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
//                         <Search size={18} className="text-gray-400 ml-2" />
//                         <input type="text" placeholder="Chọn tên..." onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none w-full p-1" />
//                     </div>
//                     <div className="max-h-64 overflow-y-auto pr-2">
//                         {filteredList.length > 0 ? filteredList.map(item => {
//                             const id = mode === 'transfer' ? item.id : item.user.id;
//                             const name = mode === 'transfer' ? item.fullName : item.user.fullName;
//                             const avatar = mode === 'transfer' ? item.avatar : item.user.avatar;
                            
//                             return (
//                                 <div key={id} onClick={() => toggleMember(id)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all ${selectedMembers.includes(id) ? (theme === 'dark' ? 'bg-blue-900/30 border-blue-500 border' : 'bg-blue-50 border-blue-200 border') : 'hover:bg-gray-100 border border-transparent'}`}>
//                                     <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all ${selectedMembers.includes(id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
//                                         {selectedMembers.includes(id) && <Check size={14} className="text-white"/>}
//                                     </div>
//                                     <img src={avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="avatar"/>
//                                     <span className="font-semibold flex-1">{name}</span>
//                                 </div>
//                             )
//                         }) : <p className="text-center text-gray-500 py-4">Không tìm thấy ai</p>}
//                     </div>
//                 </div>
//                 <div className={`p-5 border-t flex gap-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
//                     <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
//                     <button 
//                         onClick={handleConfirm} 
//                         className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
//                             (mode === 'transfer' && selectedMembers.length === 1) || 
//                             (mode === 'add' && selectedMembers.length >= 1) || 
//                             (mode === 'create' && selectedMembers.length >= 2) 
//                             ? 'bg-[#0068ff] hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}
//                     >
//                         Xác nhận
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const Chat = () => {
//     const navigate = useNavigate();
//     const scrollRef = useRef();
//     const imageInputRef = useRef(null);
//     const videoInputRef = useRef(null); 
//     const fileInputRef = useRef(null);
//     const groupAvatarInputRef = useRef(null);
//     const typingTimeoutRef = useRef(null);

//     const [user] = useState(() => {
//         const storedUser = localStorage.getItem('user');
//         return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
//     });

//     const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
//     const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

//     // === CSS CHUNG ===
//     const bgMain = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800';
//     const bgPanel = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
//     const bgChatArea = theme === 'dark' ? 'bg-[#1a1d21]' : 'bg-[#eef0f1]';
//     const hoverItem = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
//     const activeIcon = "bg-blue-700 text-white shadow-inner";
//     const inactiveIcon = "text-white/70 hover:bg-blue-600 hover:text-white transition-all";

//     const t = {
//         search: lang === 'vi' ? "Tìm kiếm..." : "Search...",
//         roomName: lang === 'vi' ? "Phòng Chat Chung" : "General Chat",
//         roomDesc: lang === 'vi' ? "Nơi mọi người giao lưu" : "Where everyone hangs out",
//         friends: lang === 'vi' ? "Bạn bè" : "Friends",
//         today: lang === 'vi' ? "Hôm nay" : "Today",
//         placeholder: lang === 'vi' ? `Nhập tin nhắn...` : `Message...`,
//         settings: lang === 'vi' ? "Cài đặt" : "Settings",
//         profile: lang === 'vi' ? "Hồ sơ của bạn" : "Your Profile",
//         logout: lang === 'vi' ? "Đăng xuất" : "Log out",
//         online: lang === 'vi' ? "Vừa truy cập" : "Active just now",
//         langLabel: lang === 'vi' ? "Ngôn ngữ: Tiếng Việt" : "Language: English",
//         themeLabel: theme === 'light' ? (lang === 'vi' ? "Giao diện: Sáng" : "Theme: Light") : (lang === 'vi' ? "Giao diện: Tối" : "Theme: Dark"),
//         sent: lang === 'vi' ? "Đã gửi" : "Sent",
//         seen: lang === 'vi' ? "Đã xem" : "Seen"
//     };

//     const [activeTab, setActiveTab] = useState('messages');
//     const [activeRoom, setActiveRoom] = useState({}); 
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [isUploading, setIsUploading] = useState(false); 
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
//     // TYPING STATE (Bảo vệ lỗi bóng ma)
//     const [typingUsers, setTypingUsers] = useState({}); 
    
//     const [replyingTo, setReplyingTo] = useState(null); 
//     const [friends, setFriends] = useState([]);
//     const [pendingRequests, setPendingRequests] = useState([]);
//     const [sentRequests, setSentRequests] = useState([]); 
//     const [conversations, setConversations] = useState([]);
    
//     const [showAddFriendModal, setShowAddFriendModal] = useState(false);
//     const [showInfoModal, setShowInfoModal] = useState(false); 
//     const [showForwardModal, setShowForwardModal] = useState(false);
//     const [forwardingMsg, setForwardingMsg] = useState(null);
//     const [showCreateGroupModal, setShowCreateGroupModal] = useState(false); 
//     const [showGroupSettings, setShowGroupSettings] = useState(false);
//     const [showAddMemberModal, setShowAddMemberModal] = useState(false); 
//     const [showTransferOwnerModal, setShowTransferOwnerModal] = useState(false);
    
//     const [reactionDetailMsg, setReactionDetailMsg] = useState(null);
//     const [activeConvMenu, setActiveConvMenu] = useState(null);

//     const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isAlert: false });

//     const [isEditingGroupName, setIsEditingGroupName] = useState(false);
//     const [editGroupName, setEditGroupName] = useState("");

//     const [searchEmail, setSearchEmail] = useState("");
//     const [searchResult, setSearchResult] = useState(null);
//     const [searchTerm, setSearchTerm] = useState(""); 
//     const [onlineUsersList, setOnlineUsersList] = useState([]);
//     const [showUserMenu, setShowUserMenu] = useState(false);
//     const [showSettingsMenu, setShowSettingsMenu] = useState(false);

//     const [activeGroupCalls, setActiveGroupCalls] = useState([]);

//     const [callState, setCallState] = useState('idle'); 
//     const [callDetail, setCallDetail] = useState(null); 
//     const [callDuration, setCallDuration] = useState(0);
//     const [isMicOn, setIsMicOn] = useState(true);
//     const [isCamOn, setIsCamOn] = useState(true);
//     const [remoteCamOn, setRemoteCamOn] = useState(true);
//     const [remoteMicOn, setRemoteMicOn] = useState(true); 

//     const peerConnectionRef = useRef(null);
//     const groupPeersRef = useRef({});       
//     const localStreamRef = useRef(null);
//     const timerRef = useRef(null);
    
//     const [localStream, setLocalStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [groupStreams, setGroupStreams] = useState({}); 

//     const [isRecording, setIsRecording] = useState(false);
//     const [recordingTime, setRecordingTime] = useState(0);
//     const mediaRecorderRef = useRef(null);
//     const audioChunksRef = useRef([]);
//     const recordingTimerRef = useRef(null);

//     const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

//     useEffect(() => {
//         return () => {
//             if (timerRef.current) clearInterval(timerRef.current);
//             if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
//         };
//     }, []);

//     useEffect(() => {
//         localStorage.setItem('theme', theme);
//         localStorage.setItem('lang', lang);
//     }, [theme, lang]);

//     // =================================================================
//     // LOAD DỮ LIỆU BẠN BÈ VÀ HỘI THOẠI
//     // =================================================================
//     const loadFriendsData = useCallback(async () => {
//         if (!user) return;
//         try {
//             const res = await api.get(`/friends/${user.id}`);
//             setPendingRequests(res.data.pendingRequests);
//             setSentRequests(res.data.sentRequests);
//             setFriends(res.data.acceptedFriends);
//         } catch (err) { console.error("Lỗi tải bạn bè:", err); }
//     }, [user]);

//     const loadConversations = useCallback(async () => {
//         if (!user) return;
//         try {
//             const res = await api.get(`/conversations/user/${user.id}`);
//             setConversations(res.data);
            
//             res.data.forEach(conv => {
//                 socket.emit("join_room", conv.id);
//             });
            
//             if (activeRoom.type === 'group' && activeRoom.id) {
//                 const updatedRoom = res.data.find(c => c.id === activeRoom.id);
//                 if (!updatedRoom) {
//                      setActiveRoom(prev => ({ ...prev, isKicked: true }));
//                 } else {
//                      setActiveRoom(prev => ({ ...updatedRoom, isKicked: false, sendMode: prev.sendMode !== updatedRoom.sendMode ? updatedRoom.sendMode : prev.sendMode }));
//                 }
//             }
//         } catch (err) { console.error("Lỗi tải hội thoại:", err); }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [user, activeRoom.id, activeRoom.type]);

//     const getUserDetails = useCallback((uid) => {
//         if (uid === user?.id) return user;
//         if (activeRoom.type === 'group') {
//             return activeRoom.members?.find(m => m.id === uid) || { fullName: "Thành viên ẩn" };
//         } else {
//             const friend = friends.find(f => f.user.id === uid);
//             if (friend) return friend.user;
//             return { fullName: "Người dùng" };
//         }
//     }, [user, activeRoom, friends]);

//     // =================================================================
//     // WEBRTC AN TOÀN TUYỆT ĐỐI
//     // =================================================================
//     const createGroupPeerConnection = useCallback((partnerId, isInitiator) => {
//         const pc = new RTCPeerConnection(rtcConfig);
//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
//         }
//         pc.ontrack = (event) => setGroupStreams(prev => ({ ...prev, [partnerId]: event.streams[0] }));
//         pc.onicecandidate = (event) => {
//             if (event.candidate) socket.emit('webrtc_signal', { targetId: partnerId, senderId: user.id, signal: event.candidate, isGroup: true });
//         };
//         groupPeersRef.current[partnerId] = pc;
//         if (isInitiator) {
//             pc.createOffer().then(offer => {
//                 pc.setLocalDescription(offer);
//                 socket.emit('webrtc_signal', { targetId: partnerId, senderId: user.id, signal: offer, isGroup: true });
//             }).catch(err => console.error(err));
//         }
//         return pc;
//     }, [user]);

//     const initWebRTC = useCallback(async (isInitiator) => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: callDetail?.isVideo, audio: true });
//             localStreamRef.current = stream;
//             setLocalStream(stream);
//             const pc = new RTCPeerConnection(rtcConfig);
//             peerConnectionRef.current = pc;
//             pc.iceQueue = []; 
//             stream.getTracks().forEach(track => pc.addTrack(track, stream));
//             pc.ontrack = (event) => setRemoteStream(event.streams[0]);
//             pc.onicecandidate = (event) => {
//                 if (event.candidate && callDetail?.partner?.id) {
//                     socket.emit('webrtc_signal', { targetId: callDetail.partner.id, senderId: user.id, signal: event.candidate, isGroup: false });
//                 }
//             };
//             if (isInitiator && callDetail?.partner?.id) {
//                 const offer = await pc.createOffer();
//                 await pc.setLocalDescription(offer);
//                 socket.emit('webrtc_signal', { targetId: callDetail.partner.id, senderId: user.id, signal: offer, isGroup: false });
//             }
//         } catch (err) { 
//             console.error("Camera error:", err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi thiết bị", message: "Vui lòng cấp quyền truy cập Camera/Mic trên trình duyệt!", onConfirm: closeConfirm, theme, bgPanel });
//             resetCall(); 
//         }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [callDetail, theme, bgPanel, user]);

//     useEffect(() => {
//         if (!user) { navigate('/login'); return; }
//         socket.emit("register_user", user.id);

//         loadConversations();
//         loadFriendsData();

//         const fetchMessages = async (roomId) => {
//             try {
//                 const res = await api.get(`/messages/${roomId}?userId=${user.id}`);
//                 let filteredMessages = res.data;
//                 if (activeRoom.type === 'group' && activeRoom.members) {
//                     const currentUserMemberInfo = activeRoom.members.find(m => m.id === user.id);
//                     if (currentUserMemberInfo && currentUserMemberInfo.joinedAt) {
//                          const joinTime = new Date(currentUserMemberInfo.joinedAt).getTime();
//                          filteredMessages = res.data.filter(m => {
//                              if (m.messageType === 'system' && m.text.includes('thêm')) return true;
//                              return new Date(m.createdAt).getTime() >= joinTime;
//                          });
//                     }
//                 }
//                 setMessages(filteredMessages);
//                 socket.emit("mark_as_seen", { roomId, userId: user.id });
//             } catch (err) { console.error("Lỗi tải tin nhắn:", err); }
//         };
        
//         if (activeRoom.id) {
//             fetchMessages(activeRoom.id);
//         }
        
//         setTypingUsers({}); setReplyingTo(null); 
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [navigate, user, activeRoom.id]); 

//     useEffect(() => {
//         if (!user) return; 

//         const handleReceiveMessage = (data) => {
//             if (data.conversationId === activeRoom.id) {
//                 let shouldAdd = true;
//                 if (activeRoom.type === 'group' && activeRoom.members) {
//                     const currentUserMemberInfo = activeRoom.members.find(m => m.id === user.id);
//                     if (currentUserMemberInfo && currentUserMemberInfo.joinedAt) {
//                         const joinTime = new Date(currentUserMemberInfo.joinedAt).getTime();
//                         if (new Date(data.createdAt).getTime() < joinTime && !(data.messageType === 'system' && data.text.includes('thêm'))) {
//                             shouldAdd = false;
//                         }
//                     }
//                 }
//                 if (shouldAdd) {
//                     setMessages((prev) => [...prev, data]);
//                     if (data.authorId !== user.id) socket.emit("mark_as_seen", { roomId: activeRoom.id, userId: user.id });
//                 }
//             }
//             loadConversations(); 
//         };

//         const handleGroupUpdate = ({ roomId, action, data }) => {
//             if (roomId === activeRoom.id) {
//                 if (action === 'member_removed' && data.targetUserId === user.id) {
//                      setActiveRoom(prev => ({ ...prev, isKicked: true }));
//                      setShowGroupSettings(false);
//                 } else if (action === 'group_disbanded') {
//                      setActiveRoom(prev => ({ ...prev, isDisbanded: true }));
//                      setShowGroupSettings(false);
//                 } else if (action === 'sendMode_changed') {
//                      setActiveRoom(prev => ({ ...prev, sendMode: data.sendMode }));
//                 }
//             }
//             loadConversations();
//         };

//         const handleMessagesSeen = ({ roomId }) => {
//             if (roomId === activeRoom.id) {
//                 setMessages(prev => prev.map(msg => (msg.authorId === user.id && msg.status !== 'seen') ? { ...msg, status: 'seen' } : msg));
//             }
//         };

//         const handleUserTyping = ({ roomId, userName, isTyping }) => {
//             setTypingUsers(prev => {
//                 const roomTypers = prev[roomId] || [];
//                 if (isTyping && !roomTypers.includes(userName)) {
//                     return { ...prev, [roomId]: [...roomTypers, userName] };
//                 }
//                 if (!isTyping) {
//                     return { ...prev, [roomId]: roomTypers.filter(n => n !== userName) };
//                 }
//                 return prev;
//             });
//         };

//         const handleMessageRecalled = (messageId) => { 
//             setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRecalled: true } : msg));
//         };
        
//         const handleMessageDeleted = (messageId) => { 
//             setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, deletedFor: [...(msg.deletedFor || []), user.id] } : msg));
//         };

//         const handleIncomingCall = ({ caller, isVideo }) => {
//             setCallState('incoming');
//             setCallDetail({ partner: caller, isVideo, isCaller: false });
//         };

//         const handleCallStatus = ({ status, reason }) => {
//             setCallState(status);
//             if (status === 'busy' || status === 'failed' || status === 'rejected' || status === 'missed') {
//                 if (callDetail?.isCaller && status !== 'missed') { 
//                     const targetRoomId = `1-1_${[String(user.id), String(callDetail.partner?.id)].sort().join('_')}`;
//                     let txt = "📞 Cuộc gọi nhỡ";
//                     if (status === 'busy') txt = "📞 Người dùng đang bận";
//                     else if (status === 'rejected') txt = "📞 Đã từ chối cuộc gọi";
//                     socket.emit("send_message", { roomId: targetRoomId, senderId: user.id, senderName: user?.fullName, text: txt, messageType: 'call' });
//                 }
//                 setTimeout(resetCall, 2000);
//             }
//         };

//         const handleCallAccepted = async () => {
//             setCallState('in-call');
//             startTimer();
//             await initWebRTC(true); 
//         };

//         const handleCallEnded = () => { 
//             setCallState('ended');
//             setTimeout(resetCall, 2000);
//         };

//         const handleIncomingGroupCall = ({ roomId, caller, roomName }) => {
//             setCallState('incoming');
//             setCallDetail({ isGroup: true, roomId, partner: { id: caller.id, name: caller.fullName, avatar: caller.avatar }, name: roomName });
//         };

//         const handleUserJoinedGroupCall = (newUser) => {
//             if (callState === 'in-group-call') createGroupPeerConnection(newUser.id, true);
//         };

//         const handleUserLeftGroupCall = (userIdLeave) => {
//             if (groupPeersRef.current[userIdLeave]) {
//                 groupPeersRef.current[userIdLeave].close();
//                 delete groupPeersRef.current[userIdLeave];
//             }
//             setGroupStreams(prev => {
//                 const newStreams = { ...prev };
//                 delete newStreams[userIdLeave];
//                 return newStreams;
//             });
//         };

//         const handleWebRTCSignal = async ({ signal, senderId, isGroup }) => {
//             if (signal.customType === 'media_toggle') {
//                 if (!isGroup) {
//                     if (signal.media === 'video') setRemoteCamOn(signal.isEnabled);
//                     if (signal.media === 'audio') setRemoteMicOn(signal.isEnabled);
//                 }
//                 return;
//             }

//             let pc = isGroup ? groupPeersRef.current[senderId] : peerConnectionRef.current;

//             if (!pc && isGroup) {
//                 pc = createGroupPeerConnection(senderId, false);
//             } else if (!pc && !isGroup) {
//                 await initWebRTC(false);
//                 pc = peerConnectionRef.current;
//             }

//             if (!pc) return;

//             try {
//                 if (signal.type === 'offer') {
//                     await pc.setRemoteDescription(new RTCSessionDescription(signal));
//                     const answer = await pc.createAnswer();
//                     await pc.setLocalDescription(answer);
//                     const target = isGroup ? senderId : (callDetail?.partner?.id);
//                     if (target) socket.emit('webrtc_signal', { targetId: target, senderId: user.id, signal: answer, isGroup });
//                 } else if (signal.type === 'answer') {
//                     await pc.setRemoteDescription(new RTCSessionDescription(signal));
//                 } else if (signal.candidate) {
//                     await pc.addIceCandidate(new RTCIceCandidate(signal));
//                 }
//             } catch (err) { console.error("WebRTC SIGNAL error:", err); }
//         };

//         const handleMessageReacted = ({ messageId, reactions }) => {
//             setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
//         };

//         const handleMessagePinned = ({ pinnedMessage }) => {
//             setActiveRoom(prev => ({ ...prev, pinnedMessage }));
//             loadConversations();
//         };

//         socket.on('active_group_calls', (activeCalls) => setActiveGroupCalls(activeCalls || []));
//         socket.on("receive_message", handleReceiveMessage);
//         socket.on("messages_seen", handleMessagesSeen);
//         socket.on("user_typing", handleUserTyping);
//         socket.on("message_recalled", handleMessageRecalled);
//         socket.on("message_deleted_for_me", handleMessageDeleted);
//         socket.on('incoming_call', handleIncomingCall);
//         socket.on('call_status', handleCallStatus);
//         socket.on('call_accepted', handleCallAccepted);
//         socket.on('call_ended', handleCallEnded);
//         socket.on('webrtc_signal', handleWebRTCSignal);
//         socket.on('group_event', handleGroupUpdate);
//         socket.on('message_reacted', handleMessageReacted); 
//         socket.on('message_pinned', handleMessagePinned);   
//         socket.on('incoming_group_call', handleIncomingGroupCall);
//         socket.on('user_joined_group_call', handleUserJoinedGroupCall);
//         socket.on('user_left_group_call', handleUserLeftGroupCall);

//         socket.emit('get_online_users');
//         socket.on('online_users_list', (users) => setOnlineUsersList(users));
//         socket.on('user_online', (uid) => setOnlineUsersList(prev => [...new Set([...prev, uid])]));
//         socket.on('user_offline', (uid) => setOnlineUsersList(prev => prev.filter(id => id !== uid)));

//         return () => {
//             socket.off("receive_message", handleReceiveMessage);
//             socket.off("messages_seen", handleMessagesSeen);
//             socket.off("user_typing", handleUserTyping);
//             socket.off("message_recalled", handleMessageRecalled);
//             socket.off("message_deleted_for_me", handleMessageDeleted);
//             socket.off('incoming_call', handleIncomingCall);
//             socket.off('call_status', handleCallStatus);
//             socket.off('call_accepted', handleCallAccepted);
//             socket.off('call_ended', handleCallEnded);
//             socket.off('webrtc_signal', handleWebRTCSignal);
//             socket.off('group_event', handleGroupUpdate);
//             socket.off('message_reacted', handleMessageReacted); 
//             socket.off('message_pinned', handleMessagePinned);   
//             socket.off('incoming_group_call');
//             socket.off('user_joined_group_call');
//             socket.off('user_left_group_call');
//             socket.off('active_group_calls');
//             socket.off('online_users_list');
//             socket.off('user_online');
//             socket.off('user_offline');
//         };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [activeRoom.id, loadConversations, user, callDetail, initWebRTC, callState]);

//     useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isUploading, showEmojiPicker, typingUsers, replyingTo, isRecording]);
    
//     const partnerId = activeRoom.type === '1-1' && user ? activeRoom.id.replace('1-1_', '').replace(user.id, '').replace('_', '') : null;
//     const isPartnerOnline = partnerId && onlineUsersList.includes(partnerId);

//     // ==========================================
//     // LOGIC VIDEO CALL BẢO VỆ CHUẨN XÁC
//     // ==========================================
//     useEffect(() => {
//         let timeout;
//         if (callState === 'calling' || callState === 'incoming') {
//             timeout = setTimeout(() => {
//                 if (callState === 'calling' && callDetail?.partner?.id) {
//                     const pId = callDetail.partner.id;
//                     const targetRoomId = `1-1_${[String(user?.id), String(pId)].sort().join('_')}`; 
//                     socket.emit('end_call', { callerId: user?.id, receiverId: pId, callData: null });
//                     socket.emit("send_message", { roomId: targetRoomId, senderId: user?.id, senderName: user?.fullName, text: "📞 Cuộc gọi nhỡ", messageType: 'call' });
//                     setCallState('missed');
//                     setTimeout(resetCall, 2000);
//                 } else {
//                     setCallState('missed');
//                     setTimeout(resetCall, 2000);
//                 }
//             }, 30000);
//         }
//         return () => clearTimeout(timeout);
//     }, [callState, callDetail, user]);

//     const startCall = (isVideo) => {
//         if (!activeRoom || activeRoom.type !== '1-1' || !user || !user.id) return;
//         if (callState !== 'idle') return; // Chặn bấm đúp tránh lỗi người dùng đang bận
        
//         let pId = null;
//         if (activeRoom.members && activeRoom.members.length > 0) {
//             const partner = activeRoom.members.find(m => String(m.id) !== String(user.id));
//             if (partner) pId = partner.id;
//         }
//         if (!pId && activeRoom.id) {
//             pId = String(activeRoom.id).split('_').find(id => id !== String(user.id) && id !== '1-1');
//         }
//         if (!pId) {
//             console.error("Lỗi: Không tìm thấy ID đối tác để gọi!");
//             return;
//         }

//         setCallState('calling');
//         setCallDetail({ partner: { id: pId, name: activeRoom.name, avatar: activeRoom.avatar }, isVideo, isCaller: true });
//         socket.emit('request_call', { caller: user, receiverId: pId, isVideo });
//     };

//     const acceptCall = async () => {
//         if (!callDetail || !callDetail.partner) return;
//         socket.emit('accept_call', { callerId: callDetail.partner.id, receiverId: user.id });
//         setCallState('in-call');
//         startTimer();
//         await initWebRTC(false); 
//     };

//     const rejectCall = () => {
//         if (!callDetail || !callDetail.partner) return;
//         socket.emit('reject_call', { callerId: callDetail.partner.id, receiverId: user.id, status: 'rejected' });
//         resetCall();
//     };

//     const endCall = () => {
//         const pId = callDetail?.partner?.id;
//         if (!pId) {
//             setCallState('ended');
//             setTimeout(resetCall, 2000);
//             return;
//         }
//         const targetRoomId = `1-1_${[String(user.id), String(pId)].sort().join('_')}`; 
//         let finalStatus = 'ended';
//         let txt = `📞 Cuộc gọi kết thúc (${formatTimeSeconds(callDuration)})`;
//         if (callDuration === 0) {
//             if (callState === 'calling') { finalStatus = 'canceled'; txt = "📞 Cuộc gọi bị hủy"; } 
//             else { finalStatus = 'missed'; }
//         }
//         socket.emit('end_call', { 
//             callerId: callDetail.isCaller ? user.id : pId, receiverId: callDetail.isCaller ? pId : user.id,
//             callData: { callerId: callDetail.isCaller ? user.id : pId, receiverId: callDetail.isCaller ? pId : user.id, startTime: new Date(Date.now() - callDuration * 1000).toISOString(), duration: callDuration, status: finalStatus }
//         });
//         if (callDetail.isCaller || finalStatus === 'ended') {
//             socket.emit("send_message", { roomId: targetRoomId, senderId: user.id, senderName: user.fullName, text: txt, messageType: 'call' });
//         }
//         setCallState('ended');
//         setTimeout(resetCall, 2000);
//     };

//     const startGroupCall = async () => {
//         if (!activeRoom || !activeRoom.id) return;
//         if (callState !== 'idle') return; // Chặn bấm đúp
//         setCallState('in-group-call');
//         setCallDetail({ isGroup: true, roomId: activeRoom.id, name: activeRoom.name });
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             localStreamRef.current = stream;
//             setLocalStream(stream);
//             socket.emit('start_group_call', { roomId: activeRoom.id, caller: user, roomName: activeRoom.name });
//             socket.emit('join_group_call', { roomId: activeRoom.id, user });
//             startTimer();
//         } catch (err) {
//             console.error(err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Cấp quyền Camera/Mic để tham gia!", onConfirm: closeConfirm, theme, bgPanel });
//             resetCall();
//         }
//     };

//     const joinGroupCall = async (roomId, roomName) => {
//         if (callState !== 'idle' && callState !== 'incoming') return; // Chặn lỗi văng ra
//         setCallState('in-group-call');
//         setCallDetail({ isGroup: true, roomId, name: roomName });
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             localStreamRef.current = stream;
//             setLocalStream(stream);
//             socket.emit('join_group_call', { roomId, user });
//             startTimer();
//         } catch (err) {
//             console.error(err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Cấp quyền Camera/Mic để tham gia!", onConfirm: closeConfirm, theme, bgPanel });
//             resetCall();
//         }
//     };

//     const endGroupCall = () => {
//         if (callDetail?.roomId) socket.emit('leave_group_call', { roomId: callDetail.roomId, userId: user.id });
//         setCallState('ended');
//         setTimeout(resetCall, 2000);
//     };

//     const resetCall = () => {
//         if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
//         if (peerConnectionRef.current) peerConnectionRef.current.close();
//         Object.values(groupPeersRef.current).forEach(pc => pc.close());
//         groupPeersRef.current = {};
//         setLocalStream(null); setRemoteStream(null); setGroupStreams({});
//         clearInterval(timerRef.current);
        
//         setCallState('idle'); setCallDetail(null); setCallDuration(0);
//         setIsCamOn(true); setIsMicOn(true); setRemoteCamOn(true); setRemoteMicOn(true); 
//     };

//     const startTimer = () => { timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000); };
    
//     const toggleMic = () => { 
//         if(localStreamRef.current) { 
//             const track = localStreamRef.current.getAudioTracks()[0]; 
//             if(track) { 
//                 track.enabled = !track.enabled; setIsMicOn(track.enabled); 
//                 const target = callDetail.isGroup ? null : callDetail.partner?.id; 
//                 socket.emit('webrtc_signal', { targetId: target, senderId: user.id, signal: { customType: 'media_toggle', media: 'audio', isEnabled: track.enabled }, isGroup: callDetail.isGroup }); 
//             } 
//         } 
//     };
//     const toggleCam = () => { 
//         if(localStreamRef.current) { 
//             const track = localStreamRef.current.getVideoTracks()[0]; 
//             if(track) { 
//                 track.enabled = !track.enabled; setIsCamOn(track.enabled); 
//                 const target = callDetail.isGroup ? null : callDetail.partner?.id; 
//                 socket.emit('webrtc_signal', { targetId: target, senderId: user.id, signal: { customType: 'media_toggle', media: 'video', isEnabled: track.enabled }, isGroup: callDetail.isGroup }); 
//             } 
//         } 
//     };

//     // ==========================================
//     // KẾT BẠN
//     // ==========================================
//     const handleSearchAddFriend = async (e) => { 
//         e.preventDefault(); 
//         try { 
//             const res = await api.post('/friends/search', { email: searchEmail.trim() }); 
//             if (res.data.id === user.id) { 
//                 setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Bạn không thể tự kết bạn!", onConfirm: closeConfirm, theme, bgPanel }); 
//                 setSearchResult(null); 
//             } else { setSearchResult(res.data); }
//         } catch (err) { 
//             console.error("Lỗi tìm bạn:", err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Không tìm thấy người dùng!", onConfirm: closeConfirm, theme, bgPanel }); 
//             setSearchResult(null); 
//         } 
//     };
//     const handleSendRequest = async () => { try { await api.post('/friends/request', { senderId: user.id, receiverId: searchResult.id }); setShowAddFriendModal(false); setSearchResult(null); setSearchEmail(""); loadFriendsData(); } catch (err) { console.error(err); } };
//     const handleAcceptRequest = async (friendshipId) => { try { await api.post('/friends/accept', { friendshipId }); loadFriendsData(); } catch (err) { console.error(err); } };
//     const handleDeleteFriendship = async (e, friendshipId, confirmMsg) => { 
//         e.stopPropagation(); 
//         if(confirmMsg) {
//              setConfirmDialog({
//                  isOpen: true, isAlert: false, title: "Xác nhận", message: confirmMsg, theme, bgPanel,
//                  onConfirm: async () => { closeConfirm(); try { await api.post('/friends/delete', { friendshipId }); loadFriendsData(); } catch (err) { console.error(err); } }
//              });
//              return;
//         }
//         try { await api.post('/friends/delete', { friendshipId }); loadFriendsData(); } catch (err) { console.error(err); } 
//     };
//     const startPrivateChat = async (targetUser) => { try { const res = await api.post('/conversations/1-1', { senderId: user.id, receiverId: targetUser.id }); setActiveRoom({ id: res.data.id, name: targetUser.fullName, avatar: targetUser.avatar, type: "1-1" }); setActiveTab('messages'); loadConversations(); } catch (err) { console.error(err); } };

//     // ==========================================
//     // LOGIC CHAT
//     // ==========================================
//     const formatConversationTime = (dateString) => {
//         if (!dateString) return "";
//         const d = new Date(dateString); const now = new Date();
//         return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
//     };

//     const handleDeleteConversation = (e, convId, convName, type) => {
//         e.stopPropagation();
//         setActiveConvMenu(null);
//         if (type === 'group') {
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Thông báo", message: `Vui lòng mở "Thông tin nhóm" ở góc phải để Rời nhóm hoặc Giải tán.`, onConfirm: closeConfirm, theme, bgPanel });
//             return;
//         }
//         setConfirmDialog({
//             isOpen: true, isAlert: false, title: "Xóa cuộc trò chuyện", message: `Xóa toàn bộ tin nhắn với ${convName}?`, theme, bgPanel,
//             onConfirm: async () => {
//                 closeConfirm();
//                 try {
//                     await api.delete(`/conversations/${convId}`);
//                     loadConversations();
//                     if (activeRoom.id === convId) setActiveRoom({});
//                 } catch (err) { 
//                     console.error("Lỗi xóa hội thoại:", err);
//                     try {
//                         await api.post('/conversations/delete', { userId: user.id, conversationId: convId });
//                         loadConversations();
//                         if (activeRoom.id === convId) setActiveRoom({});
//                     } catch (err2) {
//                         console.error(err2);
//                         setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Không thể xóa hội thoại lúc này.", onConfirm: closeConfirm, theme, bgPanel }); 
//                     }
//                 }
//             }
//         });
//     };

//     const sortedConversations = [...conversations].sort((a, b) => {
//         if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
//         if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
//         return new Date(b.updatedAt) - new Date(a.updatedAt);
//     });

//     const filteredConversations = sortedConversations.filter(conv => conv.name?.toLowerCase().includes(searchTerm.toLowerCase()));
//     const filteredFriends = friends.filter(friend => friend.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || friend.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

//     const startRecording = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             const mediaRecorder = new MediaRecorder(stream);
//             mediaRecorderRef.current = mediaRecorder;
//             audioChunksRef.current = [];

//             mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

//             mediaRecorder.onstop = async () => {
//                 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//                 const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
//                 const formData = new FormData(); formData.append('file', file);
//                 setIsUploading(true);

//                 try {
//                     const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
//                     socket.emit("send_message", { roomId: activeRoom.id, senderId: user.id, senderName: user.fullName, text: res.data.url, messageType: 'audio', fileName: "Tin nhắn thoại", replyTo: replyingTo?.id || null });
//                 } catch (err) {
//                     console.error("Lỗi upload ghi âm:", err);
//                     setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi gửi tin nhắn thoại!", onConfirm: closeConfirm, theme, bgPanel });
//                 } finally { setIsUploading(false); setReplyingTo(null); }
//                 stream.getTracks().forEach(track => track.stop());
//             };

//             mediaRecorder.start(); setIsRecording(true); setRecordingTime(0);
//             recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
//         } catch (err) { 
//             console.error("Lỗi truy cập Mic:", err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Quyền truy cập", message: "Vui lòng cấp quyền Microphone!", onConfirm: closeConfirm, theme, bgPanel }); 
//         }
//     };

//     const stopAndSendRecording = () => {
//         if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(recordingTimerRef.current); }
//     };

//     const cancelRecordingAction = () => {
//         if (mediaRecorderRef.current && isRecording) {
//             mediaRecorderRef.current.onstop = null; mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop()); mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(recordingTimerRef.current);
//         }
//     };

//     const sendSystemMessage = (text, customRoomId = null) => {
//         socket.emit("send_message", { roomId: customRoomId || activeRoom.id, senderId: "system", senderName: "Hệ thống", text: text, messageType: 'system' });
//     };

//     const handleTyping = (e) => {
//         setNewMessage(e.target.value);
//         socket.emit("typing", { roomId: activeRoom.id, userName: user.fullName, isTyping: true });
//         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = setTimeout(() => { socket.emit("typing", { roomId: activeRoom.id, userName: user.fullName, isTyping: false }); }, 2000);
//     };

//     const handleSendMessage = (e) => {
//         e?.preventDefault(); 
//         if (!newMessage.trim() || !user) return;
//         socket.emit("send_message", { roomId: activeRoom.id, senderId: user.id, senderName: user.fullName, text: newMessage, messageType: 'text', replyTo: replyingTo?.id || null });
//         setNewMessage(""); setShowEmojiPicker(false); setReplyingTo(null); 
//         socket.emit("typing", { roomId: activeRoom.id, userName: user.fullName, isTyping: false });
//         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//     };

//     const handleForwardMessage = (targetRoomId) => {
//         if (!forwardingMsg || !user) return;
//         socket.emit("send_message", { roomId: targetRoomId, senderId: user.id, senderName: user.fullName, text: forwardingMsg.text, messageType: forwardingMsg.messageType, fileName: forwardingMsg.fileName || "", replyTo: null });
//         setShowForwardModal(false); setForwardingMsg(null); 
//         setConfirmDialog({ isOpen: true, isAlert: true, title: "Thành công", message: "Đã chuyển tiếp tin nhắn thành công!", onConfirm: closeConfirm, theme, bgPanel });
//     };

//     const handleFileUpload = async (e, typeOverride, isGroupAvatar = false) => {
//         const files = Array.from(e.target.files);
//         if (!files.length) return;
//         setIsUploading(!isGroupAvatar);
//         for (const file of files) {
//             if (file.size > 10 * 1024 * 1024) { 
//                  setConfirmDialog({ isOpen: true, isAlert: true, title: "File quá lớn", message: `File ${file.name} quá lớn! Vui lòng chọn dưới 10MB.`, onConfirm: closeConfirm, theme, bgPanel });
//                  continue; 
//             }
//             const formData = new FormData(); formData.append('file', file);
//             try {
//                 const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
//                 if (isGroupAvatar) {
//                     await handleUpdateGroupInfo(null, res.data.url);
//                 } else {
//                     let finalType = typeOverride || 'file';
//                     if (!typeOverride) {
//                         if (res.data.type.includes('image')) finalType = 'image';
//                         else if (res.data.type.includes('video')) finalType = 'video';
//                         else if (res.data.type.includes('audio')) finalType = 'audio';
//                     }
//                     socket.emit("send_message", { roomId: activeRoom.id, senderId: user.id, senderName: user.fullName, text: res.data.url, messageType: finalType, fileName: res.data.name || file.name, replyTo: replyingTo?.id || null });
//                 }
//             } catch (err) { 
//                 console.error(err);
//                 setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi tải file lên server.", onConfirm: closeConfirm, theme, bgPanel }); 
//             }
//         }
//         setIsUploading(false); e.target.value = null; setReplyingTo(null); 
//     };

//     // ==========================================
//     // QUẢN LÝ NHÓM 
//     // ==========================================
//     const handleCreateGroup = async (name, memberIds) => {
//         try {
//             const res = await api.post('/conversations/group', { name: name, creatorId: user.id, memberIds: [...memberIds, user.id] });
//             setShowCreateGroupModal(false); loadConversations();
//             const newConv = await api.get(`/conversations/user/${user.id}`);
//             const fullRoom = newConv.data.find(c => c.id === res.data.id);
//             if (fullRoom) setActiveRoom(fullRoom);
//             else setActiveRoom({ id: res.data.id, name: res.data.name, type: "group", sendMode: "all_members", members: res.data.members || [], adminIds: res.data.adminIds || [user.id] });
//             socket.emit("send_message", { roomId: res.data.id, senderId: "system", senderName: "Hệ thống", text: `${user.fullName} đã tạo nhóm.`, messageType: 'system' });
//         } catch (err) { 
//             console.error(err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi hệ thống khi tạo nhóm!", onConfirm: closeConfirm, theme, bgPanel }); 
//         }
//     };

//     const handleUpdateGroupMember = (targetId, action, newMembers = []) => {
//         if (action === 'remove') {
//             setConfirmDialog({
//                 isOpen: true, isAlert: false, title: "Xóa thành viên", message: "Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?", theme, bgPanel,
//                 onConfirm: async () => { closeConfirm(); executeGroupUpdate(targetId, action, newMembers); }
//             });
//         } else { executeGroupUpdate(targetId, action, newMembers); }
//     };

//     const executeGroupUpdate = async (targetId, action, newMembers) => {
//         try {
//             const res = await api.post(`/conversations/group/${action}`, {
//                 roomId: activeRoom.id, adminId: user.id, userId: user.id, targetUserId: targetId, newMembers: newMembers
//             });
//             let newMembersList = [...(activeRoom.members || [])];
//             if (action === 'remove') {
//                 newMembersList = newMembersList.filter(m => m.id !== targetId);
//                 const removedUser = activeRoom.members.find(m => m.id === targetId);
//                 sendSystemMessage(`Đã xóa ${removedUser?.fullName || 'thành viên'} khỏi nhóm.`);
//                 socket.emit("group_event", { roomId: activeRoom.id, action: "member_removed", data: { targetUserId: targetId } });
//             } else if (action === 'add_members') {
//                 const newConv = await api.get(`/conversations/user/${user.id}`);
//                 const fullRoom = newConv.data.find(c => c.id === activeRoom.id);
//                 if (fullRoom && fullRoom.members) newMembersList = fullRoom.members;
//                 sendSystemMessage(`${user.fullName} đã thêm thành viên mới.`);
//                 setShowAddMemberModal(false);
//             } else if (action === 'make_admin') {
//                 const adminName = activeRoom.members.find(m => m.id === targetId)?.fullName;
//                 sendSystemMessage(`${user.fullName} đã gán quyền quản trị cho ${adminName}.`);
//             }
//             setActiveRoom(prev => ({ ...prev, members: newMembersList, adminIds: res.data.adminIds || prev.adminIds }));
//             loadConversations();
//         } catch (err) { 
//             console.error(err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Bạn không có quyền hoặc có lỗi xảy ra!", onConfirm: closeConfirm, theme, bgPanel }); 
//         }
//     }

//     const handleUpdateGroupInfo = async (newName, newAvatar) => {
//         try {
//             const res = await api.post(`/conversations/group/update_info`, { roomId: activeRoom.id, name: newName, avatar: newAvatar });
//             setActiveRoom(prev => ({ ...prev, name: res.data.name, avatar: res.data.avatar })); loadConversations(); setIsEditingGroupName(false);
//             if (newName) sendSystemMessage(`${user.fullName} đã đổi tên nhóm thành "${newName}".`);
//             if (newAvatar) sendSystemMessage(`${user.fullName} đã thay đổi ảnh đại diện nhóm.`);
//         } catch (err) { 
//             console.error(err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi khi đổi thông tin nhóm.", onConfirm: closeConfirm, theme, bgPanel }); 
//         }
//     };

//     const handleUpdateSendMode = async (newMode) => {
//         try {
//             setActiveRoom(prev => ({ ...prev, sendMode: newMode })); 
//             await api.post(`/conversations/group/update_info`, { roomId: activeRoom.id, sendMode: newMode, adminId: user.id });
//             const modeText = newMode === 'leaders_only' ? 'Chỉ Nhóm trưởng mới được nhắn tin.' : 'Tất cả mọi người đều được nhắn tin.';
//             sendSystemMessage(`${user.fullName} đã đổi chế độ: ${modeText}`);
//         } catch (err) { 
//             console.error(err);
//             setActiveRoom(prev => ({ ...prev, sendMode: prev.sendMode === 'leaders_only' ? 'all_members' : 'leaders_only' })); 
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Chỉ nhóm trưởng mới có quyền đổi chế độ!", onConfirm: closeConfirm, theme, bgPanel }); 
//         }
//     }

//     const handleTransferOwnership = async (newAdminId) => {
//         try {
//             const res = await api.post(`/conversations/group/transfer_owner`, { roomId: activeRoom.id, adminId: user.id, newAdminId: newAdminId });
//             const newAdminName = activeRoom.members.find(m => m.id === newAdminId)?.fullName;
//             sendSystemMessage(`${user.fullName} đã chuyển quyền Nhóm trưởng cho ${newAdminName}.`);
//             setActiveRoom(prev => ({ ...prev, adminIds: res.data.adminIds })); setShowTransferOwnerModal(false); loadConversations();
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Chuyển quyền", message: `Đã chuyển quyền Nhóm trưởng cho ${newAdminName}`, onConfirm: closeConfirm, theme, bgPanel });
//         } catch (err) { 
//             console.error(err);
//             setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi chuyển quyền!", onConfirm: closeConfirm, theme, bgPanel }); 
//         }
//     };

//     const handleLeaveGroup = () => {
//         const isOwner = activeRoom.adminIds?.includes(user.id);
//         const otherMembersCount = (activeRoom.members || []).filter(m => m.id !== user.id).length;
//         if (isOwner && otherMembersCount > 0) {
//             setConfirmDialog({
//                 isOpen: true, isAlert: true, title: "Chuyển quyền Nhóm trưởng", 
//                 message: "Bạn đang là Nhóm trưởng. Vui lòng chuyển quyền cho một thành viên khác trước khi rời nhóm!", theme, bgPanel,
//                 onConfirm: () => { closeConfirm(); setShowTransferOwnerModal(true); }
//             });
//             return;
//         }
//         setConfirmDialog({
//             isOpen: true, isAlert: false, title: "Rời nhóm", message: "Bạn có chắc chắn muốn rời khỏi nhóm này?", theme, bgPanel,
//             onConfirm: async () => {
//                 closeConfirm();
//                 try {
//                     sendSystemMessage(`${user.fullName} đã rời khỏi nhóm.`);
//                     await api.post(`/conversations/group/leave`, { roomId: activeRoom.id, userId: user.id });
//                     setShowGroupSettings(false); setActiveRoom({}); loadConversations();
//                 } catch (err) { console.error("Lỗi rời nhóm:", err); }
//             }
//         });
//     };

//     const handleDisbandGroup = () => {
//         setConfirmDialog({
//             isOpen: true, isAlert: false, title: "Giải tán nhóm", theme, bgPanel,
//             message: "CẢNH BÁO: Bạn có chắc chắn muốn GIẢI TÁN nhóm này? Toàn bộ dữ liệu tin nhắn sẽ bị xóa vĩnh viễn.",
//             onConfirm: async () => {
//                 closeConfirm();
//                 try {
//                     await api.delete(`/conversations/group/${activeRoom.id}?adminId=${user.id}`);
//                     socket.emit("group_event", { roomId: activeRoom.id, action: "group_disbanded", data: null });
//                     setShowGroupSettings(false); setActiveRoom({}); loadConversations();
//                 } catch (err) { 
//                     console.error("Lỗi giải tán nhóm:", err);
//                     setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Chỉ quản trị viên mới có thể giải tán nhóm!", onConfirm: closeConfirm, theme, bgPanel }); 
//                 }
//             }
//         });
//     };

//     const scrollToMessage = (msgId) => {
//         const element = document.getElementById(`msg-${msgId}`);
//         if (element) {
//             element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//             element.classList.add('bg-yellow-100', 'transition-colors', 'duration-500');
//             setTimeout(() => {
//                 element.classList.remove('bg-yellow-100');
//             }, 2000);
//         }
//     };

//     const handleEmojiClick = (emojiObject) => { setNewMessage(prev => prev + emojiObject.emoji); };
//     const handleRecall = (messageId) => { setConfirmDialog({ isOpen: true, isAlert: false, title: "Thu hồi", message: "Thu hồi tin nhắn này với mọi người?", theme, bgPanel, onConfirm: () => { closeConfirm(); socket.emit("recall_message", { messageId, roomId: activeRoom.id }); }}); };
//     const handleDeleteForMe = (messageId) => { setConfirmDialog({ isOpen: true, isAlert: false, title: "Xóa tin nhắn", message: "Xóa tin nhắn này ở phía bạn?", theme, bgPanel, onConfirm: () => { closeConfirm(); socket.emit("delete_message_for_me", { messageId, userId: user.id, roomId: activeRoom.id }); }}); };
//     const handleLogout = () => { localStorage.clear(); navigate('/login'); };
//     const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
//     const toggleLang = () => setLang(lang === 'vi' ? 'en' : 'vi');

//     if (!user) return null;

//     // --- XÁC ĐỊNH QUYỀN GỬI TIN NHẮN ---
//     const isKicked = activeRoom.isKicked || activeRoom.isDisbanded;
//     const isOwner = activeRoom.type === 'group' && activeRoom.adminIds?.includes(user?.id);
//     const currentSendMode = activeRoom.sendMode || 'all_members';
//     const canSendMessage = !isKicked && (activeRoom.type !== 'group' || currentSendMode === 'all_members' || isOwner);
//     const inputPlaceholder = isKicked ? "Bạn không còn là thành viên nhóm" : (canSendMessage ? t.placeholder : "Chỉ Trưởng nhóm mới được gửi tin nhắn");

//     const toolbarIcon = `p-2 rounded-md transition-colors relative ${!canSendMessage ? 'text-gray-300 cursor-not-allowed' : (theme==='dark' ? 'cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white' : 'cursor-pointer text-[#001A33] hover:bg-gray-100')}`;

//     // TÌM XEM PHÒNG NÀY CÓ AI ĐANG GÕ KHÔNG BẰNG ĐÚNG ID CỦA NÓ
//     const currentRoomTyping = typingUsers[activeRoom.id] || [];

//     return (
//         <div className={`flex h-screen font-sans ${bgMain} transition-colors duration-300`}>
            
//             {/* OVERLAY VIDEO CALL 1-1 VÀ NHÓM */}
//             {callState !== 'idle' && callDetail && (
//                 <div className="fixed inset-0 bg-gray-900 z-[100] flex flex-col p-4 text-white">
//                     <div className="flex justify-between items-center mb-4 z-20 shrink-0">
//                         <h2 className="text-xl font-bold bg-black/50 px-4 py-2 rounded-xl border border-gray-700">
//                             {callDetail.isGroup ? "Nhóm: " + callDetail.name : callDetail.partner?.name || callDetail.partner?.fullName}
//                         </h2>
//                     </div>

//                     <div className="flex-1 flex gap-4 min-h-0 z-10">
//                         {/* Khu vực Video chính */}
//                         {callState === 'in-group-call' ? (
//                             <div className="w-full h-full flex flex-wrap gap-4 justify-center items-center overflow-y-auto pb-20">
//                                 <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700 w-full max-w-[320px] aspect-video shrink-0">
//                                     {isCamOn && localStream ? (
//                                         <VideoPlayer stream={localStream} isLocal={true} className="w-full h-full object-cover" />
//                                     ) : (
//                                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white"><UserCircle2 size={60}/><span className="text-xs mt-2">Camera Tắt</span></div>
//                                     )}
//                                     <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-bold">Bạn ({user?.fullName})</div>
//                                 </div>
//                                 {Object.entries(groupStreams).map(([peerId, stream]) => {
//                                     const memberName = activeRoom.members?.find(m => m.id === peerId)?.fullName || "Thành viên";
//                                     return (
//                                         <div key={peerId} className="relative bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700 w-full max-w-[320px] aspect-video shrink-0">
//                                             <VideoPlayer stream={stream} isLocal={false} className="w-full h-full object-cover" />
//                                             <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-bold">{memberName}</div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ) : (
//                             <div className="flex-1 relative bg-gray-950 flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-inner">
//                                 {remoteCamOn && callState === 'in-call' && remoteStream ? (
//                                     <VideoPlayer stream={remoteStream} isLocal={false} className="absolute inset-0 w-full h-full object-cover" />
//                                 ) : (
//                                     (!remoteCamOn && callState === 'in-call') && (
//                                          <div className="flex flex-col items-center animate-pulse z-10">
//                                             <div className="w-32 h-32 bg-gray-700 rounded-full mb-4 overflow-hidden border-4 border-gray-500 shadow-xl flex items-center justify-center">
//                                             {callDetail.partner?.avatar ? <img src={callDetail.partner.avatar} className="w-full h-full object-cover" alt="partner"/> : <UserCircle2 size={90} className="text-gray-400"/>}
//                                             </div>
//                                             <p className="text-xl text-gray-300 font-medium">Người dùng đã tắt Camera</p>
//                                         </div>
//                                     )
//                                 )}
//                                 {/* HIỂN THỊ ICON MIC OFF NẾU NGƯỜI KIA TẮT MIC */}
//                                 {!remoteMicOn && callState === 'in-call' && (
//                                     <div className="absolute top-4 left-4 bg-red-500/80 p-2 rounded-full z-20">
//                                         <MicOff size={20} className="text-white"/>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Camera nhỏ góc phải (Chỉ dùng cho 1-1) */}
//                     {callDetail.isVideo && callState !== 'in-group-call' && (
//                          <div className="absolute top-6 right-6 w-40 h-60 bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-600 z-10 overflow-hidden flex flex-col items-center justify-center">
//                             {isCamOn && localStream ? (
//                                 <VideoPlayer stream={localStream} isLocal={true} className="absolute inset-0 w-full h-full object-cover" />
//                             ) : (
//                                 <div className="flex flex-col items-center text-gray-400 z-10"> <UserCircle2 size={50} /> <span className="text-xs mt-2 font-medium">Camera tắt</span> </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Popup Chờ bắt máy / Trạng thái cuộc gọi 1-1 */}
//                     {!callDetail.isGroup && callState !== 'in-call' && (
//                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 bg-black/50 p-6 rounded-3xl backdrop-blur-sm">
//                             <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 overflow-hidden border-4 border-blue-500">
//                                 {callDetail.partner?.avatar ? <img src={callDetail.partner.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={90}/>}
//                             </div>
//                             <h2 className="text-3xl font-bold flex items-center gap-2 justify-center">
//                                  {callDetail.partner?.name || callDetail.partner?.fullName}
//                             </h2>
//                             <p className="text-gray-300 mt-2 text-lg">
//                                 {callState === 'calling' && "Đang gọi..."}
//                                 {callState === 'ringing' && "Đang đổ chuông..."}
//                                 {callState === 'incoming' && "Đang gọi cho bạn..."}
//                                 {callState === 'missed' && "Cuộc gọi bị bỏ lỡ"}
//                                 {callState === 'ended' && "Cuộc gọi kết thúc"}
//                                 {callState === 'busy' && "Người dùng đang bận"}
//                                 {callState === 'rejected' && "Đã từ chối cuộc gọi"}
//                             </p>
//                         </div>
//                     )}

//                     {/* Popup Chờ bắt máy / Trạng thái cuộc gọi cho NHÓM */}
//                     {callDetail.isGroup && callState !== 'in-group-call' && (
//                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 bg-black/50 p-6 rounded-3xl backdrop-blur-sm">
//                             <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 overflow-hidden border-4 border-blue-500">
//                                 {callDetail.partner?.avatar ? <img src={callDetail.partner.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={90}/>}
//                             </div>
//                             <h2 className="text-3xl font-bold flex items-center gap-2 justify-center text-blue-400">
//                                  {callDetail.name}
//                             </h2>
//                             <p className="text-gray-200 mt-2 text-lg">
//                                 {callState === 'incoming' && <span><strong>{callDetail.partner?.name || callDetail.partner?.fullName}</strong> đang mời bạn tham gia...</span>}
//                                 {callState === 'ended' && "Cuộc gọi kết thúc"}
//                             </p>
//                         </div>
//                     )}

//                     {/* Controls Nút Gọi */}
//                     <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20 bg-black/60 px-8 py-4 rounded-full backdrop-blur-md border border-gray-700 shadow-2xl">
//                         {callState === 'incoming' ? (
//                             <>
//                                 <button onClick={() => callDetail.isGroup ? joinGroupCall(callDetail.roomId, callDetail.name) : acceptCall()} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-lg animate-bounce"><PhoneCall size={28} /></button>
//                                 <button onClick={() => callDetail.isGroup ? resetCall() : rejectCall()} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"><PhoneOff size={28} /></button>
//                             </>
//                         ) : (
//                               <>
//                                 {(callState === 'in-call' || callState === 'in-group-call') && (
//                                     <>
//                                         <div className="text-gray-300 font-mono text-sm w-12 text-center">{formatTimeSeconds(callDuration)}</div>
//                                         <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 text-white'}`}>{isMicOn ? <Mic size={24}/> : <MicOff size={24}/>}</button>
//                                         <button onClick={toggleCam} className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isCamOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 text-white'}`}>{isCamOn ? <Camera size={24}/> : <CameraOff size={24}/>}</button>
//                                     </>
//                                 )}
//                                 <button onClick={callState === 'in-group-call' ? endGroupCall : endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg mx-2"><PhoneOff size={28} /></button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* MODAL THÊM BẠN BÈ */}
//             {showAddFriendModal && (
//                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//                     <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${bgPanel}`}>
//                         <div className="flex justify-between items-center mb-4">
//                             <h2 className="text-xl font-bold">Thêm bạn bè</h2>
//                             <button onClick={() => setShowAddFriendModal(false)} className="text-gray-500 hover:text-red-500 font-bold">✕</button>
//                         </div>
//                         <form onSubmit={handleSearchAddFriend} className="flex gap-2 mb-4">
//                             <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} placeholder="Nhập email cần tìm..." className={`flex-1 px-4 py-2 rounded-lg outline-none border transition-colors ${theme==='dark'?'bg-gray-700 border-gray-600 text-white':'bg-gray-50 border-gray-200 text-black'}`} required />
//                             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Search size={20}/></button>
//                         </form>
//                         {searchResult && (
//                             <div className={`p-4 rounded-xl flex items-center justify-between border ${theme==='dark'?'border-gray-600 bg-gray-700':'border-blue-100 bg-blue-50'}`}>
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden font-bold text-blue-600 shadow-sm border border-gray-200">
//                                         {searchResult.avatar ? <img src={searchResult.avatar} className="w-full h-full object-cover" alt="avatar"/> : searchResult.fullName.charAt(0).toUpperCase()}
//                                     </div>
//                                     <div>
//                                         <p className="font-bold text-[15px]">{searchResult.fullName}</p>
//                                         <p className="text-[13px] text-gray-500">{searchResult.email}</p>
//                                     </div>
//                                 </div>
//                                 <button onClick={handleSendRequest} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Kết bạn</button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* CỘT 1: MENU */}
//             <div className="w-[68px] bg-[#0068ff] flex flex-col items-center py-6 z-30 shrink-0 shadow-lg">
//                 <div className="relative mb-6">
//                     <div className="w-12 h-12 rounded-full cursor-pointer border border-blue-400 overflow-hidden hover:opacity-80 transition-opacity bg-white text-[#0068ff] flex items-center justify-center font-bold" onClick={() => setShowUserMenu(!showUserMenu)}>
//                         {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="me" /> : user?.fullName?.charAt(0).toUpperCase()}
//                     </div>
//                     {showUserMenu && (
//                         <>
//                              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
//                             <div className={`absolute top-0 left-16 w-64 rounded-xl shadow-2xl border py-2 z-50 ${bgPanel}`}>
//                                 <div className={`px-4 py-3 border-b ${theme==='dark'?'border-gray-700':'border-gray-100'}`}> <p className="font-bold text-[17px] truncate">{user?.fullName}</p> </div>
//                                 <div className="py-1">
//                                      <Link to="/profile" className={`block px-4 py-2.5 text-[15px] ${hoverItem}`}>{t.profile}</Link>
//                                     <div className={`block px-4 py-2.5 text-[15px] cursor-pointer ${hoverItem}`} onClick={() => {setShowUserMenu(false); setShowSettingsMenu(true);}}>{t.settings}</div>
//                                 </div>
//                                 <div className={`border-t my-1 ${theme==='dark'?'border-gray-700':'border-gray-100'}`}></div>
//                                 <button onClick={handleLogout} className={`w-full text-left px-4 py-2.5 text-[15px] text-red-500 ${hoverItem}`}>{t.logout}</button>
//                             </div>
//                         </>
//                     )}
//                  </div>
//                 <div className="flex flex-col gap-4 w-full items-center">
//                     <div onClick={() => setActiveTab('messages')} className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${activeTab === 'messages' ? activeIcon : inactiveIcon}`} title="Tin nhắn"><MessageCircle size={26} fill={activeTab === 'messages' ? "currentColor" : "none"} /></div>
//                     <div onClick={() => setActiveTab('contacts')} className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${activeTab === 'contacts' ? activeIcon : inactiveIcon}`} title="Danh bạ"><Contact size={26} /></div>
//                 </div>
//                 <div className="relative mt-auto mb-2 w-full flex justify-center">
//                     <div className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${showSettingsMenu ? activeIcon : inactiveIcon}`} onClick={() => setShowSettingsMenu(!showSettingsMenu)}> <Settings size={26} /> </div>
//                     {showSettingsMenu && (
//                         <>
//                             <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)}></div>
//                             <div className={`absolute bottom-0 left-16 w-56 rounded-xl shadow-2xl border py-2 z-50 ${bgPanel}`}>
//                                 <button onClick={toggleLang} className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] ${hoverItem}`}><Globe size={18} className="text-blue-500" /> <span>{t.langLabel}</span></button>
//                                 <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] ${hoverItem}`}>{theme === 'light' ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-orange-400" />} <span>{t.themeLabel}</span></button>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* CỘT 2: DANH SÁCH HỘI THOẠI & BẠN BÈ */}
//             <div className={`hidden md:flex w-[340px] border-r flex-col z-10 ${bgPanel} transition-colors duration-300 relative`}>
                
//                 {/* THANH THÔNG BÁO CUỘC GỌI NHÓM ĐANG DIỄN RA */}
//                 {activeRoom.type === 'group' && activeGroupCalls.includes(activeRoom.id) && callState !== 'in-group-call' && (
//                     <div className="absolute top-0 left-0 right-0 bg-green-500 text-white p-3 z-20 flex justify-between items-center shadow-md animate-pulse">
//                         <div className="flex items-center gap-2">
//                             <VideoIcon size={20} />
//                             <span className="font-bold text-sm">Đang có cuộc gọi nhóm</span>
//                         </div>
//                         <button onClick={() => joinGroupCall(activeRoom.id, activeRoom.name)} className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-100 transition-colors">
//                             Tham gia
//                         </button>
//                     </div>
//                 )}

//                 <div className={`p-4 border-b flex gap-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${(activeRoom.type === 'group' && activeGroupCalls.includes(activeRoom.id) && callState !== 'in-group-call') ? 'mt-12' : ''}`}>
//                     <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`flex-1 px-4 py-2 text-[14px] rounded-lg outline-none transition-all border border-transparent ${theme==='dark'?'bg-gray-700 text-white placeholder-gray-400':'bg-gray-100 focus:bg-white focus:border focus:border-blue-400'}`} />
//                     {activeTab === 'contacts' && ( <button onClick={() => setShowAddFriendModal(true)} title="Thêm bạn bè" className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${theme==='dark'?'bg-gray-700 text-blue-400 hover:bg-gray-600':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}> <UserPlus size={18}/> </button> )}
//                     {activeTab === 'messages' && ( <button onClick={() => setShowCreateGroupModal(true)} title="Tạo nhóm mới" className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${theme==='dark'?'bg-gray-700 text-blue-400 hover:bg-gray-600':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}> <Users size={18}/> </button> )}
//                 </div>
//                 <div className="flex-1 overflow-y-auto p-2">
//                     {activeTab === 'messages' && (
//                         <>
//                             <div className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>Gần đây</div>
//                             {filteredConversations.map((conv) => (
//                                 <div key={conv.id} onClick={() => setActiveRoom(conv)} className={`group p-3 cursor-pointer rounded-xl flex gap-3 items-center relative ${activeRoom.id === conv.id ? (theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-50') : hoverItem}`}>
//                                     <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 border border-gray-200">
//                                         {conv.avatar ? <img src={conv.avatar} className="w-full h-full object-cover" alt="avatar"/> : (conv.type === 'group' ? <Users size={30} /> : <UserCircle2 size={30} />)}
//                                     </div>
//                                     <div className="flex-1 min-w-0 flex flex-col justify-center pr-8">
//                                         <div className="font-bold text-[15px] truncate flex justify-between items-center">
//                                             <span className="truncate">{conv.name}</span>
//                                             {conv.unreadCount > 0 && ( <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2"> {conv.unreadCount > 5 ? '5+' : conv.unreadCount} </span> )}
//                                         </div>
//                                         <div className={`text-[12px] mt-1 flex items-center gap-1 ${theme==='dark'?'text-gray-400':'text-gray-400'}`}>
//                                             <span>{formatConversationTime(conv.updatedAt)}</span>
//                                         </div>
//                                     </div>
                                    
//                                     {/* MENU 3 CHẤM Ở DANH SÁCH HỘI THOẠI */}
//                                     <div className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 relative" onClick={(e) => e.stopPropagation()}>
//                                         <button onClick={() => setActiveConvMenu(activeConvMenu === conv.id ? null : conv.id)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors shadow-sm bg-white border border-gray-100">
//                                             <MoreHorizontal size={18} />
//                                         </button>
//                                         {activeConvMenu === conv.id && (
//                                             <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-[100]" onMouseLeave={() => setActiveConvMenu(null)}>
//                                                 <button onClick={(e) => { e.stopPropagation(); setActiveConvMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
//                                                     <Pin size={16} /> Ghim trò chuyện
//                                                 </button>
//                                                 <button onClick={(e) => { e.stopPropagation(); setActiveConvMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
//                                                     <CheckCheck size={16} /> Đánh dấu chưa đọc
//                                                 </button>
//                                                 <button onClick={(e) => { e.stopPropagation(); setActiveConvMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
//                                                     <EyeOff size={16} /> Ẩn trò chuyện
//                                                 </button>
//                                                 <div className="h-px bg-gray-200 my-1 w-full"></div>
//                                                 <button onClick={(e) => { e.stopPropagation(); setActiveConvMenu(null); handleDeleteConversation(e, conv.id, conv.name, conv.type); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
//                                                     <Trash2 size={16} /> Xóa trò chuyện
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                             {filteredConversations.length === 0 && searchTerm && ( <div className="px-3 py-4 text-center text-sm text-gray-500">Không tìm thấy kết quả nào.</div> )}
//                         </>
//                     )}

//                     {activeTab === 'contacts' && (
//                         <>
//                             {!searchTerm && pendingRequests.length > 0 && (
//                                 <div className="mb-4">
//                                     <div className="px-3 py-2 text-[12px] font-bold uppercase text-orange-500 tracking-wider">Lời mời kết bạn ({pendingRequests.length})</div>
//                                     {pendingRequests.map((req) => (
//                                         <div key={req.friendshipId} className={`p-3 rounded-xl flex justify-between items-center ${hoverItem}`}>
//                                             <div className="flex gap-3 items-center">
//                                                 <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex justify-center items-center font-bold overflow-hidden border border-gray-200"> {req.user.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" alt="avatar"/> : req.user.fullName.charAt(0).toUpperCase()} </div>
//                                                 <div className="font-bold text-[14px] truncate max-w-[100px]">{req.user.fullName}</div>
//                                             </div>
//                                             <div className="flex gap-1">
//                                                 <button onClick={(e) => handleDeleteFriendship(e, req.friendshipId)} title="Từ chối" className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 shadow-sm"><X size={16}/></button>
//                                                 <button onClick={() => handleAcceptRequest(req.friendshipId)} title="Chấp nhận" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-sm"><Check size={16}/></button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}

//                             {!searchTerm && sentRequests.length > 0 && (
//                                 <div className="mb-4">
//                                     <div className="px-3 py-2 text-[12px] font-bold uppercase text-blue-500 tracking-wider">Đã gửi lời mời ({sentRequests.length})</div>
//                                     {sentRequests.map((req) => (
//                                         <div key={req.friendshipId} className={`p-3 rounded-xl flex justify-between items-center ${hoverItem}`}>
//                                             <div className="flex gap-3 items-center">
//                                                 <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex justify-center items-center font-bold overflow-hidden border border-gray-200">
//                                                     {req.user.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" alt="avatar"/> : req.user.fullName.charAt(0).toUpperCase()}
//                                                 </div>
//                                                 <div className="font-bold text-[14px] text-gray-500 truncate max-w-[100px]">Đến: {req.user.fullName}</div>
//                                             </div>
//                                             <button onClick={(e) => handleDeleteFriendship(e, req.friendshipId, `Hủy lời mời kết bạn?`)} title="Hủy lời mời" className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 shadow-sm"><X size={16}/></button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}

//                             <div>
//                                 <div className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>{t.friends} ({filteredFriends.length})</div>
//                                 {filteredFriends.length === 0 ? ( <div className={`px-3 py-4 text-center text-sm ${theme==='dark'?'text-gray-500':'text-gray-400'}`}> {searchTerm ? "Không tìm thấy bạn bè nào." : "Chưa có bạn bè nào.\nHãy tìm kiếm và kết bạn nhé!"} </div> ) : (
//                                     filteredFriends.map((friend) => (
//                                         <div key={friend.friendshipId} onClick={() => startPrivateChat(friend.user)} className={`p-3 cursor-pointer rounded-xl flex justify-between items-center ${activeRoom.name === friend.user.fullName ? (theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-50') : hoverItem}`}>
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold overflow-hidden border border-gray-200 shrink-0"> {friend.user.avatar ? <img src={friend.user.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={30} />} </div>
//                                                 <div className="flex-1 min-w-0"> <div className="font-bold text-[15px] truncate max-w-[120px]">{friend.user.fullName}</div> </div>
//                                             </div>
//                                             <button onClick={(e) => handleDeleteFriendship(e, friend.friendshipId, `Bạn có chắc muốn hủy kết bạn với ${friend.user.fullName}?`)} title="Hủy kết bạn" className={`p-2 rounded-lg transition-colors ${theme==='dark'?'text-gray-500 hover:text-red-400 hover:bg-gray-700':'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}><UserMinus size={18}/></button>
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* CỘT 3: KHUNG CHAT CHÍNH */}
//             <div className={`flex-1 flex flex-col ${bgChatArea}`}>
//                 {activeRoom.id ? (
//                     <>
//                         <div className={`h-[68px] border-b flex items-center px-6 shadow-sm shrink-0 ${bgPanel}`}>
//                             <div className="flex items-center justify-between w-full">
//                                 <div className="flex items-center gap-3">
//                                     {activeRoom.type === '1-1' ? (
//                                         <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0 border border-gray-300"> {activeRoom.avatar ? <img src={activeRoom.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 className="text-gray-500"/>} </div>
//                                     ) : ( 
//                                         <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm overflow-hidden">
//                                             {activeRoom.avatar ? <img src={activeRoom.avatar} className="w-full h-full object-cover" alt="avatar"/> : <Users size={20}/>}
//                                         </div> 
//                                     )}
//                                     <div>
//                                         <div className="font-bold text-[17px] flex items-center gap-2">{activeRoom.name} {activeRoom.type !== '1-1' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}</div>
//                                         {activeRoom.type === '1-1' && ( <div className={`text-[12px] font-medium ${isPartnerOnline ? 'text-green-500' : 'text-gray-500'}`}> {isPartnerOnline ? t.online : "Ngoại tuyến"} </div> )}
//                                         {activeRoom.type === 'group' && ( <div className={`text-[12px] font-medium ${theme==='dark'?'text-gray-400':'text-gray-500'}`}> {activeRoom.members?.length || 0} thành viên </div> )}
//                                     </div>
//                                 </div>
                                
//                                 <div className="flex gap-5 text-blue-500 mr-2 items-center">
//                                     {activeRoom.type === '1-1' && (
//                                         <>
//                                             <Phone onClick={() => startCall(false)} className="cursor-pointer hover:text-blue-700 transition" size={24} />
//                                             <Video onClick={() => startCall(true)} className="cursor-pointer hover:text-blue-700 transition" size={26} />
//                                             <Info onClick={() => setShowInfoModal(true)} className="cursor-pointer text-gray-400 hover:text-blue-500 transition ml-2" size={26} />
//                                         </>
//                                     )}
//                                     {activeRoom.type === 'group' && (
//                                         <>
//                                             {/* Nút Gọi Video Nhóm */}
//                                             {!isKicked && <Video onClick={startGroupCall} className="cursor-pointer hover:text-blue-700 transition" size={26} title="Gọi Video Nhóm" />}
//                                             <Info onClick={() => setShowGroupSettings(true)} className="cursor-pointer text-gray-400 hover:text-blue-500 transition ml-2" size={26} />
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* HIỂN THỊ BẢNG GHIM TIN NHẮN */}
//                         {activeRoom.pinnedMessage && (
//                             <div className="flex items-center justify-between bg-blue-50 p-3 border-b border-blue-100 shrink-0">
//                                 <div 
//                                     className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80"
//                                     onClick={() => scrollToMessage(activeRoom.pinnedMessage.id)}
//                                 >
//                                     <Paperclip size={18} className="text-blue-600 shrink-0" />
//                                     <div className="flex flex-col truncate">
//                                         <span className="text-xs font-bold text-blue-700">Tin nhắn đã ghim</span>
//                                         <span className="text-sm text-gray-700 truncate">
//                                             <span className="font-semibold">{activeRoom.pinnedMessage.authorName}:</span> {activeRoom.pinnedMessage.text}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <button onClick={() => api.post('/conversations/pin', { roomId: activeRoom.id, messageId: null })} className="text-gray-400 hover:text-red-500 p-1 shrink-0 font-bold">
//                                     <X size={18} />
//                                 </button>
//                             </div>
//                         )}

//                         {isKicked && (
//                             <div className="bg-red-50 text-red-600 text-center py-2 font-bold text-sm">
//                                 Bạn không còn là thành viên của nhóm này
//                             </div>
//                         )}
                        
//                         <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 relative">
//                             <div className="flex justify-center my-2">
//                                 <span className={`text-xs px-4 py-1.5 rounded-full font-medium shadow-sm ${theme==='dark'?'bg-gray-800 text-gray-400':'bg-gray-200/80 text-gray-500'}`}>{t.today}</span>
//                             </div>

//                             {messages.map((msg, index) => {
//                                 const isMine = msg.authorId === user?.id;
//                                 if (msg.deletedFor && msg.deletedFor.includes(user?.id)) return null;
                                
//                                 // HIỂN THỊ TIN NHẮN HỆ THỐNG
//                                 if (msg.messageType === 'system') {
//                                     return (
//                                         <div key={msg.id || index} className="flex justify-center my-3">
//                                             <span className="bg-gray-200/50 text-gray-500 text-[12px] px-4 py-1.5 rounded-full font-medium shadow-sm italic">
//                                                 {msg.text}
//                                             </span>
//                                         </div>
//                                     );
//                                 }

//                                 const repliedMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
//                                 const renderMessageContent = () => {
//                                     if (msg.isRecalled) return <span className="italic text-gray-400">Tin nhắn đã được thu hồi</span>;
//                                     if (msg.messageType === 'call') { return ( <div className="flex items-center gap-3 py-1"> <div className={`p-2 rounded-full ${isMine ? 'bg-white/20' : 'bg-blue-100'}`}> <Phone size={16} className={isMine ? 'text-white' : 'text-blue-600'} /> </div> <span className="font-semibold text-[14px]">{msg.text}</span> </div> ); }
//                                     let type = msg.messageType || 'text';
//                                     if (!msg.messageType && msg.text && msg.text.startsWith('http')) {
//                                         if (msg.text.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = 'image';
//                                         else if (msg.text.match(/\.(mp4|webm|ogg)$/i)) type = 'video';
//                                         else if (msg.text.match(/\.(mp3|wav|webm|ogg)$/i)) type = 'audio';
//                                         else type = 'file';
//                                     }
//                                     const content = () => {
//                                         if (type === 'image') return <img src={msg.text} alt="Ảnh" className="min-w-[200px] max-w-[350px] w-auto h-auto rounded-lg cursor-pointer hover:opacity-90 shadow-sm" onClick={() => window.open(msg.text, '_blank')} />;
//                                         if (type === 'video') return <video src={msg.text} controls className="max-w-[280px] rounded-lg outline-none" />;
//                                         if (type === 'audio') return <InlineAudioPlayer uri={msg.text} isMine={isMine} />;
//                                         if (type === 'file') return ( <div className="flex items-center gap-3 bg-black/10 p-3 rounded-lg min-w-[220px]"> <FileText size={32} className={isMine ? "text-white" : "text-blue-500"} /> <div className="flex flex-col flex-1 overflow-hidden"> <span className="font-bold text-sm truncate max-w-[180px]" title={msg.fileName}>{msg.fileName || "Tài liệu đính kèm"}</span> <a href={msg.text} target="_blank" rel="noreferrer" className={`text-xs mt-1 hover:underline flex items-center gap-1 ${isMine ? 'text-blue-100' : 'text-blue-600'}`}><Download size={12}/> Tải xuống</a> </div> </div> );
//                                         return <span>{msg.text}</span>;
//                                     };
//                                     return ( <div className="flex flex-col"> {repliedMsg && ( <div className={`mb-2 pl-3 border-l-4 py-1 text-xs rounded-r-md opacity-80 ${isMine ? 'border-blue-200 bg-black/10' : 'border-blue-500 bg-gray-100 text-gray-700'}`}> <div className="font-bold">{repliedMsg.authorName}</div> <div className="truncate max-w-[200px]">{repliedMsg.isRecalled ? "Tin nhắn đã thu hồi" : (repliedMsg.messageType !== 'text' ? "[Đính kèm]" : repliedMsg.text)}</div> </div> )} {content()} </div> );
//                                 };
//                                 return (
//                                     <div key={msg.id || index} id={`msg-${msg.id}`} className={`group flex items-center relative rounded-xl ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        
//                                         <div className={`hidden group-hover:flex items-center gap-1 mx-2 transition-all ${isMine ? 'order-1' : 'order-2'}`}>
//                                             <button onClick={() => setReplyingTo(msg)} title="Trả lời" className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 shadow-sm"><CornerUpLeft size={14}/></button>
//                                             <button onClick={() => { setForwardingMsg(msg); setShowForwardModal(true); }} title="Chuyển tiếp" className="p-1.5 bg-gray-100 hover:bg-blue-100 rounded-full text-gray-500 hover:text-blue-500 shadow-sm"><Forward size={14}/></button>
//                                             <button onClick={() => handleDeleteForMe(msg.id)} title="Xóa phía tôi" className="p-1.5 bg-gray-100 hover:bg-red-100 rounded-full text-gray-500 hover:text-red-500 shadow-sm"><Trash2 size={14}/></button>
//                                             {isMine && !msg.isRecalled && <button onClick={() => handleRecall(msg.id)} title="Thu hồi" className="p-1.5 bg-gray-100 hover:bg-orange-100 rounded-full text-gray-500 hover:text-orange-500 shadow-sm"><RotateCcw size={14}/></button>}
//                                             <button onClick={() => api.post('/conversations/pin', { roomId: activeRoom.id, messageId: msg.id, messageText: msg.messageType==='text'? msg.text : '[Tệp đính kèm]', authorName: msg.authorName })} title="Ghim" className="p-1.5 bg-gray-100 hover:bg-green-100 rounded-full text-gray-500 hover:text-green-600 shadow-sm"><Paperclip size={14}/></button>
                                            
//                                             <div className="relative inline-block group/emo">
//                                                 <button title="Thả cảm xúc" className="p-1.5 bg-gray-100 hover:bg-yellow-100 rounded-full text-gray-500 hover:text-yellow-600 shadow-sm"><Smile size={14}/></button>
//                                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 pb-2 opacity-0 invisible group-hover/emo:opacity-100 group-hover/emo:visible transition-all z-[100]">
//                                                     <div className="bg-white shadow-xl border border-gray-200 rounded-full p-1.5 flex gap-1">
//                                                         {['👍', '❤️', '😂', '😮', '😥', '😡'].map(emo => (
//                                                             <button key={emo} onClick={() => api.post('/messages/react', { messageId: msg.id, userId: user.id, reaction: emo, roomId: activeRoom.id })} className="hover:scale-125 transition-transform text-xl px-1">{emo}</button>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className={`flex flex-col ${isMine ? 'items-end order-2' : 'items-start order-1'} max-w-[65%] relative`}>
//                                             {!isMine && <span className={`text-[12px] mb-1 ml-1 font-medium ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>{msg.authorName}</span>}
//                                             <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] break-words relative ${msg.isRecalled ? (theme==='dark'?'bg-gray-800 text-gray-500':'bg-gray-100 text-gray-400 italic') : (isMine ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-[#e5efff] text-[#0068ff]') : (theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'))} ${isMine ? 'rounded-tr-none' : 'rounded-tl-none'}`}> 
//                                                 {renderMessageContent()} 
//                                             </div>
//                                             {/* HIỂN THỊ CẢM XÚC ĐÃ THẢ KIỂU XEM CHI TIẾT */}
//                                             {msg.reactions && Object.keys(msg.reactions).length > 0 && (
//                                                 <div 
//                                                     onClick={() => setReactionDetailMsg(msg)}
//                                                     className={`absolute -bottom-3 ${isMine ? 'right-2' : 'left-2'} bg-white shadow-md rounded-full px-1.5 py-0.5 text-xs flex items-center border border-gray-200 z-10 cursor-pointer hover:bg-gray-50`}
//                                                 >
//                                                     {Array.from(new Set(Object.values(msg.reactions))).join('')}
//                                                     <span className="ml-1 text-gray-500 font-bold text-[10px]">
//                                                         {Object.keys(msg.reactions).length > 1 ? Object.keys(msg.reactions).length : ''}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                             <div className={`flex items-center gap-1 text-[10px] mt-1 ${theme==='dark'?'text-gray-400':'text-gray-400'}`}>
//                                                 <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
//                                                 {isMine && !msg.isRecalled && ( <> <span>•</span> <span className="flex items-center gap-0.5"> {msg.status === 'seen' ? <><CheckCheck size={12} className="text-blue-500"/> {t.seen}</> : <><Check size={12}/> {t.sent}</>} </span> </> )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
                            
//                             {/* CHỈ HIỂN THỊ AI ĐÓ ĐANG GÕ TRONG ĐÚNG PHÒNG ĐÓ */}
//                             {currentRoomTyping.length > 0 && (
//                                 <div className="flex justify-start">
//                                     <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-2xl rounded-tl-none text-sm shadow-sm">
//                                         <span className="italic">{currentRoomTyping.join(', ')} đang gõ...</span>
//                                     </div>
//                                 </div>
//                             )}

//                             {isUploading && ( <div className="flex justify-end"> <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl rounded-tr-none shadow-sm"> <Loader2 size={16} className="animate-spin" /> <span className="text-sm font-medium">Đang xử lý...</span> </div> </div> )}
//                             <div ref={scrollRef} />
//                         </div>

//                         {/* INPUT AREA */}
//                         <div className={`border-t flex flex-col ${bgPanel}`}>
//                             {replyingTo && ( <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 px-4 py-2 mx-4 mt-2 rounded-r-lg"> <div className="flex flex-col"> <span className="text-xs font-bold text-blue-600 truncate">Đang trả lời {replyingTo.authorName}</span> <span className="text-sm text-gray-600 truncate max-w-[250px]">{replyingTo.messageType !== 'text' ? "[Tệp đính kèm]" : replyingTo.text}</span> </div> <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-blue-100 rounded-full text-gray-500 hover:text-red-500"><X size={16}/></button> </div> )}
//                             <div className={`flex items-center gap-2 px-4 py-2 border-b ${theme==='dark'?'border-gray-700 bg-gray-800':'border-gray-100 bg-gray-50'}`}>
//                                 <div className={toolbarIcon} onClick={() => { if(canSendMessage) setShowEmojiPicker(!showEmojiPicker) }}> <Smile size={22} strokeWidth={1.5}/> {showEmojiPicker && ( <div className="absolute bottom-12 left-0 z-50 shadow-2xl"> <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowEmojiPicker(false)}></div> <div className="relative z-50"> <EmojiPicker onEmojiClick={handleEmojiClick} theme={theme} lazyLoadEmojis={true} /> </div> </div> )} </div>
                                
//                                 <div className={toolbarIcon} onClick={() => { if(canSendMessage) imageInputRef.current.click() }}><ImageIcon size={22} strokeWidth={1.5}/>
//                                     <input type="file" hidden ref={imageInputRef} accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'image')} />
//                                 </div>
//                                 <div className={toolbarIcon} onClick={() => { if(canSendMessage) videoInputRef.current.click() }}><Film size={22} strokeWidth={1.5}/>
//                                     <input type="file" hidden ref={videoInputRef} accept="video/*" multiple onChange={(e) => handleFileUpload(e, 'video')} />
//                                 </div>
//                                 <div className={toolbarIcon} onClick={() => { if(canSendMessage) fileInputRef.current.click() }}><Paperclip size={22} strokeWidth={1.5}/>
//                                     <input type="file" hidden ref={fileInputRef} accept="*" multiple onChange={(e) => handleFileUpload(e, 'file')} />
//                                 </div>

//                                 <div className={`${toolbarIcon} ${isRecording ? 'text-red-500' : ''}`} onClick={() => { if(canSendMessage) (isRecording ? cancelRecordingAction() : startRecording()) }}> <Mic size={22} strokeWidth={1.5}/> </div>
//                             </div>
//                             <div className="p-3 flex items-center gap-3">
//                                 {isRecording ? ( <div className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg border ${theme==='dark'?'bg-red-900/30 border-red-800 text-red-400':'bg-red-50 border-red-200 text-red-500'}`}> <div className="flex items-center gap-2 animate-pulse"> <div className="w-3 h-3 bg-red-500 rounded-full"></div> <span className="font-medium">Đang ghi âm... {formatTimeSeconds(recordingTime)}</span> </div> <div className="flex items-center gap-4"> <button type="button" onClick={cancelRecordingAction} className="hover:text-red-700 text-sm font-bold">Hủy</button> </div> </div> ) : ( <form onSubmit={handleSendMessage} className="flex-1 flex items-center"> 
//                                     <input 
//                                         type="text" 
//                                         value={newMessage} 
//                                         onChange={handleTyping} 
//                                         placeholder={isUploading ? "Đang xử lý..." : inputPlaceholder} 
//                                         disabled={!canSendMessage || isUploading} 
//                                         className={`w-full px-4 py-3 text-[15px] outline-none transition-colors border border-transparent focus:border-blue-400 rounded-lg ${!canSendMessage ? 'bg-gray-100 cursor-not-allowed' : (theme==='dark'?'bg-gray-700 text-white placeholder-gray-400':'bg-white text-black')}`} 
//                                     /> 
//                                 </form> )}
//                                 {isRecording ? ( <button type="button" onClick={stopAndSendRecording} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all flex shrink-0 shadow-md"> <Send size={20} /> </button> ) : ( <button type="submit" onClick={handleSendMessage} disabled={!canSendMessage || !newMessage.trim() || isUploading} className={`p-3 rounded-xl transition-all flex shrink-0 shadow-md ${!canSendMessage || !newMessage.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0068ff] text-white hover:bg-[#0054cc]'}`}> <Send size={20} /> </button> )}
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex-1 flex items-center justify-center text-gray-400">
//                         <div className="flex flex-col items-center gap-4">
//                             <MessageCircle size={64} className="text-gray-300" />
//                             <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* MODAL CHI TIẾT CẢM XÚC */}
//             {reactionDetailMsg && (
//                 <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setReactionDetailMsg(null)}>
//                     <div className={`w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden ${bgPanel}`} onClick={e => e.stopPropagation()}>
//                         <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
//                             <h2 className="text-[17px] font-bold">Biểu tượng cảm xúc</h2>
//                             <button onClick={() => setReactionDetailMsg(null)} className="text-gray-500 hover:text-red-500 transition-colors"><X size={24}/></button>
//                         </div>
//                         <div className="p-2 max-h-[50vh] overflow-y-auto">
//                             {Object.entries(reactionDetailMsg.reactions).map(([uid, emo]) => {
//                                 const u = getUserDetails(uid);
//                                 return (
//                                     <div key={uid} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${hoverItem}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shrink-0 border border-gray-200">
//                                                 {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={40} className="text-gray-400"/>}
//                                             </div>
//                                             <span className="font-bold text-[15px]">{u.fullName} {uid === user.id && "(Bạn)"}</span>
//                                         </div>
//                                         <span className="text-2xl">{emo}</span>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* MODAL THÔNG TIN TÀI KHOẢN (1-1) */}
//             {(() => {
//                 const partnerInfo = friends.find(f => f.user.id === partnerId)?.user || {};
//                 return showInfoModal && (
//                     <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
//                         <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col relative ${bgPanel}`}>
//                             <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}> <h2 className="text-[17px] font-bold">Thông tin tài khoản</h2> <button onClick={() => setShowInfoModal(false)} className="text-gray-500 hover:text-red-500 transition-colors"> <X size={24}/> </button> </div>
//                             <div className="p-5 flex flex-col">
//                                 <div className="w-16 h-16 bg-gray-200 rounded-full shadow-sm overflow-hidden mb-3"> {activeRoom.avatar ? <img src={activeRoom.avatar} alt="avatar" className="w-full h-full object-cover"/> : <UserCircle2 size={64} className="text-gray-400"/>} </div>
//                                 <div className="flex items-center gap-2 mb-4"> <h3 className="text-2xl font-bold">{activeRoom.name}</h3> {isPartnerOnline && <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1"></span>} </div>
//                                 <button onClick={() => setShowInfoModal(false)} className="w-full py-2.5 bg-[#e5efff] text-[#0068ff] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors mb-5"> <MessageCircle size={18}/> Nhắn tin </button>
//                                 <div className={`w-full h-1.5 -mx-5 px-5 mb-5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-[#f4f5f7]'}`}></div>
//                                 <h4 className="font-bold text-[16px] mb-4">Thông tin cá nhân</h4>
//                                 <div className="flex flex-col gap-4 text-[15px]">
//                                     <div className="flex items-center"> <span className={`w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Giới tính</span> <span className="font-medium">{partnerInfo.gender || 'Nam'}</span> </div>
//                                     <div className="flex items-center"> <span className={`w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ngày sinh</span> <span className="font-medium">{partnerInfo.dob ? new Date(partnerInfo.dob).toLocaleDateString('en-CA') : '2002-11-18'}</span> </div>
//                                     <div className="flex items-start"> <span className={`w-24 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email</span> <span className="font-medium break-all">{partnerInfo.email || 'Chưa cập nhật'}</span> </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 );
//             })()}

//             {/* MODAL QUẢN LÝ NHÓM (CHUẨN ZALO) */}
//             {showGroupSettings && activeRoom.type === 'group' && (
//                 <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
//                     <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col ${bgPanel}`}>
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-xl font-bold">Thông tin nhóm</h2>
//                             <button onClick={() => { setShowGroupSettings(false); setIsEditingGroupName(false); }} className="text-gray-500 hover:text-red-500"><X size={24}/></button>
//                         </div>
                        
//                         <div className="flex flex-col items-center mb-4">
//                             {/* CHO PHÉP MỌI THÀNH VIÊN ĐỔI ẢNH NHÓM */}
//                             <div className="relative group cursor-pointer mb-3" onClick={() => groupAvatarInputRef.current.click()}>
//                                 <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
//                                     {activeRoom.avatar ? <img src={activeRoom.avatar} className="w-full h-full object-cover" alt="avatar"/> : <Users size={40} className="text-gray-400"/>}
//                                 </div>
//                                 <div className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center text-white">
//                                     <CameraIcon size={20} />
//                                 </div>
//                                 <input type="file" hidden ref={groupAvatarInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'image', true)} />
//                             </div>

//                             {/* CHO PHÉP MỌI THÀNH VIÊN ĐỔI TÊN NHÓM */}
//                             {isEditingGroupName ? (
//                                 <div className="flex gap-2 w-full">
//                                     <input type="text" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="flex-1 p-2 border rounded-lg outline-none" autoFocus />
//                                     <button onClick={() => handleUpdateGroupInfo(editGroupName, null)} className="p-2 bg-blue-600 text-white rounded-lg"><Check size={18}/></button>
//                                     <button onClick={() => setIsEditingGroupName(false)} className="p-2 bg-gray-200 text-gray-600 rounded-lg"><X size={18}/></button>
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditGroupName(activeRoom.name); setIsEditingGroupName(true); }}>
//                                     <h3 className="text-xl font-bold">{activeRoom.name}</h3>
//                                     <Edit3 size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
//                                 </div>
//                             )}
//                         </div>

//                         <div className="space-y-3">
//                             <div className={`h-1 w-full ${theme==='dark'?'bg-gray-700':'bg-gray-100'}`}></div>
                            
//                             {/* CHẾ ĐỘ GỬI TIN NHẮN (RADIO BUTTONS) - CHỈ ADMIN */}
//                             {isOwner && (
//                                 <div className="mb-4">
//                                     <span className="font-bold text-sm block mb-2">Quyền gửi tin nhắn:</span>
//                                     <div className="flex flex-col gap-2">
//                                         <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${theme==='dark'?'hover:bg-gray-700 border-gray-600':'hover:bg-gray-50 border-gray-200'}`}>
//                                             <input 
//                                                 type="radio" 
//                                                 name="sendMode" 
//                                                 value="all_members" 
//                                                 checked={(activeRoom.sendMode || 'all_members') === 'all_members'} 
//                                                 onChange={(e) => handleUpdateSendMode(e.target.value)}
//                                                 className="w-4 h-4 accent-blue-600 cursor-pointer"
//                                             />
//                                             <span className="text-[14px] font-medium">Tất cả mọi người</span>
//                                         </label>
//                                         <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${theme==='dark'?'hover:bg-gray-700 border-gray-600':'hover:bg-gray-50 border-gray-200'}`}>
//                                             <input 
//                                                 type="radio" 
//                                                 name="sendMode" 
//                                                 value="leaders_only" 
//                                                 checked={activeRoom.sendMode === 'leaders_only'} 
//                                                 onChange={(e) => handleUpdateSendMode(e.target.value)}
//                                                 className="w-4 h-4 accent-blue-600 cursor-pointer"
//                                             />
//                                             <span className="text-[14px] font-medium">Chỉ Trưởng nhóm</span>
//                                         </label>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="flex justify-between items-center">
//                                 <h3 className="font-bold text-gray-500 text-xs uppercase">Thành viên ({activeRoom.members?.length || 0})</h3>
//                                 {/* TẤT CẢ MỌI NGƯỜI TRONG NHÓM ĐỀU CÓ QUYỀN THÊM THÀNH VIÊN */}
//                                 {!isKicked && (
//                                     <button onClick={() => setShowAddMemberModal(true)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg flex items-center gap-1 text-sm font-medium"><UserPlus size={16}/> Thêm</button>
//                                 )}
//                             </div>

//                             <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
//                                 {activeRoom.members?.map(m => (
//                                     <div key={m.id} className={`flex justify-between items-center p-2 rounded-lg ${theme==='dark'?'hover:bg-gray-700':'hover:bg-gray-50'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
//                                                 {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={40} className="text-gray-400"/>}
//                                             </div>
//                                             <div className="flex flex-col">
//                                                 <span className="font-medium text-[15px]">{m.fullName} {m.id === user?.id && "(Bạn)"}</span>
//                                                 {activeRoom.adminIds?.includes(m.id) && (
//                                                     <span className="text-[11px] flex items-center gap-1 text-orange-500 font-bold"><Key size={10}/> Nhóm trưởng</span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         {/* CHỈ ADMIN MỚI ĐƯỢC XÓA NGƯỜI (KHÔNG ĐƯỢC TỰ XÓA MÌNH TẠI ĐÂY) */}
//                                         {user?.id !== m.id && activeRoom.adminIds?.includes(user?.id) && (
//                                             <div className="flex gap-2">
//                                                 <button onClick={() => handleUpdateGroupMember(m.id, 'remove')} title="Xóa khỏi nhóm" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><UserMinus size={16}/></button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="h-1 w-full bg-gray-100 my-4"></div>

//                             {!isKicked && (
//                                 <button onClick={handleLeaveGroup} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={20}/> <span className="font-bold">Rời nhóm</span></button>
//                             )}

//                             {activeRoom.adminIds?.includes(user?.id) && (
//                                 <button onClick={handleDisbandGroup} className="w-full flex items-center gap-3 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><ShieldAlert size={20}/> <span className="font-bold">Giải tán nhóm</span></button>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* CÁC MODALS CỤ THỂ */}
//             <ConfirmModal 
//                 isOpen={confirmDialog.isOpen} 
//                 title={confirmDialog.title} 
//                 message={confirmDialog.message} 
//                 onConfirm={confirmDialog.onConfirm} 
//                 onClose={closeConfirm} 
//                 isAlert={confirmDialog.isAlert} 
//                 theme={theme} 
//                 bgPanel={bgPanel} 
//             />

//             {showAddMemberModal && (
//                 <CreateGroupModal 
//                     friends={friends.filter(f => !activeRoom.members?.some(m => m.id === f.user.id))} 
//                     theme={theme} bgPanel={bgPanel} mode='add'
//                     onClose={() => setShowAddMemberModal(false)} 
//                     onCreate={(dummyName, selectedIds) => handleUpdateGroupMember(null, 'add_members', selectedIds)} 
//                 />
//             )}
//             {showTransferOwnerModal && (
//                 <CreateGroupModal 
//                     groupMembers={activeRoom.members?.filter(m => m.id !== user?.id)} 
//                     theme={theme} bgPanel={bgPanel} mode='transfer'
//                     onClose={() => setShowTransferOwnerModal(false)} 
//                     onTransfer={handleTransferOwnership} 
//                 />
//             )}
//             {showCreateGroupModal && (
//                 <CreateGroupModal friends={friends} theme={theme} bgPanel={bgPanel} mode='create' onClose={() => setShowCreateGroupModal(false)} onCreate={handleCreateGroup} />
//             )}

//             {/* MODAL CHUYỂN TIẾP TIN NHẮN */}
//             {showForwardModal && (
//                 <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
//                     <div className={`w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden ${bgPanel}`}>
//                         <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}> <h2 className="text-[17px] font-bold">Chuyển tiếp đến...</h2> <button onClick={() => { setShowForwardModal(false); setForwardingMsg(null); }} className="text-gray-400 hover:text-red-500 transition-colors"> <X size={24}/> </button> </div>
//                         <div className="p-2 max-h-[60vh] overflow-y-auto">
//                             {sortedConversations.map((conv) => ( <div key={conv.id} onClick={() => handleForwardMessage(conv.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${hoverItem}`}> <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0 border border-gray-200"> {conv.avatar ? <img src={conv.avatar} alt="avatar" className="w-full h-full object-cover"/> : (conv.type === 'group' ? <Users size={48} className="text-gray-400"/> : <UserCircle2 size={48} className="text-gray-400"/>)} </div> <span className="font-bold text-[15px] truncate">{conv.name}</span> </div> ))}
//                             {sortedConversations.length === 0 && ( <div className="p-4 text-center text-gray-500 text-sm">Chưa có cuộc trò chuyện nào để chuyển tiếp.</div> )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Chat;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { 
    Send, MessageCircle, Contact, Settings, 
    UserCircle2, UserPlus, Check, Search, Clock,
    Smile, Image as ImageIcon, Paperclip, Film, FileText, Download, Loader2,
    Globe, Moon, Sun, X, UserMinus, CheckCheck,
    CornerUpLeft, Trash2, RotateCcw, Forward,
    Phone, Video, Mic, MicOff, Camera, CameraOff, PhoneOff, PhoneCall, Info,
    Users, ShieldCheck, ShieldAlert, LogOut, Edit3, Camera as CameraIcon, Key, Video as VideoIcon,
    MoreHorizontal, Pin, EyeOff
} from 'lucide-react';
import api from '../services/api';

const socket = io('http://44.200.231.22:5000'); 
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// =================================================================
// 0. TIỆN ÍCH CHUNG
// =================================================================
const formatTimeSeconds = (sec) => { 
    const m = Math.floor(sec / 60).toString().padStart(2, '0'); 
    const s = (sec % 60).toString().padStart(2, '0'); 
    return `${m}:${s}`; 
};

const formatTimeMillis = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// =================================================================
// 1. COMPONENT FORM XÁC NHẬN TÙY CHỈNH
// =================================================================
const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose, isAlert, theme, bgPanel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${bgPanel} transform transition-all scale-100`}>
                <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 text-center text-[16px] leading-relaxed">
                    {message}
                </div>
                <div className={`p-4 border-t flex gap-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    {!isAlert && (
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
                    )}
                    <button 
                        onClick={onConfirm} 
                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isAlert ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isAlert ? "Đã hiểu" : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// COMPONENT TRÌNH PHÁT GHI ÂM TẠI CHỖ
// =================================================================
const InlineAudioPlayer = ({ uri }) => {
    const [soundActive, setSoundActive] = useState(false);
    return (
        <div className="flex items-center gap-2 py-1">
            <audio
                src={uri}
                controls
                className="max-w-[200px] h-8 outline-none"
                onPlay={() => setSoundActive(true)}
                onPause={() => setSoundActive(false)}
            />
        </div>
    );
};

// =================================================================
// COMPONENT RENDER VIDEO THÔNG MINH CHO CẢ 1-1 VÀ NHÓM
// =================================================================
const VideoPlayer = ({ stream, isLocal, className }) => {
    const ref = useRef();
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);
    return <video ref={ref} autoPlay playsInline muted={isLocal} className={className} />;
};

// =================================================================
// 2. COMPONENT TẠO NHÓM / THÊM THÀNH VIÊN / CHUYỂN QUYỀN
// =================================================================
const CreateGroupModal = ({ friends, groupMembers, onClose, onCreate, onTransfer, theme, bgPanel, mode = 'create' }) => {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const displayList = mode === 'transfer' ? groupMembers : friends;
    const filteredList = displayList.filter(f => {
        const name = mode === 'transfer' ? f.fullName : f.user.fullName;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const toggleMember = (userId) => {
        if (mode === 'transfer') {
            setSelectedMembers([userId]);
        } else {
            setSelectedMembers(prev => 
                prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
            );
        }
    };

    const handleConfirm = () => {
        if (mode === 'create') {
            if (!groupName.trim()) return alert("Vui lòng nhập tên nhóm!");
            if (selectedMembers.length < 2) return alert("Chọn ít nhất 2 thành viên để tạo nhóm!");
            onCreate(groupName, selectedMembers);
        } else if (mode === 'add') {
            if (selectedMembers.length === 0) return alert("Chọn ít nhất 1 người để thêm!");
            onCreate(null, selectedMembers);
        } else if (mode === 'transfer') {
            if (selectedMembers.length !== 1) return alert("Chọn 1 người để chuyển quyền!");
            onTransfer(selectedMembers[0]);
        }
    };

    const modalTitle = mode === 'create' ? "Tạo nhóm mới" : mode === 'add' ? "Thêm thành viên" : "Chuyển quyền Nhóm trưởng";

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${bgPanel}`}>
                <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-blue-500" /> {modalTitle}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-5">
                    {mode === 'create' && (
                        <>
                            <label className="block text-sm font-bold mb-2">Tên nhóm</label>
                            <input type="text" placeholder="Ví dụ: Nhóm Học Tập..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className={`w-full p-3 rounded-xl mb-4 outline-none border focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`} />
                        </>
                    )}
                    <label className="block text-sm font-bold mb-2">Chọn người ({selectedMembers.length})</label>
                    <div className={`flex items-center gap-2 p-2 rounded-xl mb-3 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <Search size={18} className="text-gray-400 ml-2" />
                        <input type="text" placeholder="Chọn tên..." onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none w-full p-1" />
                    </div>
                    <div className="max-h-64 overflow-y-auto pr-2">
                        {filteredList.length > 0 ? filteredList.map(item => {
                            const id = mode === 'transfer' ? item.id : item.user.id;
                            const name = mode === 'transfer' ? item.fullName : item.user.fullName;
                            const avatar = mode === 'transfer' ? item.avatar : item.user.avatar;
                            
                            return (
                                <div key={id} onClick={() => toggleMember(id)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all ${selectedMembers.includes(id) ? (theme === 'dark' ? 'bg-blue-900/30 border-blue-500 border' : 'bg-blue-50 border-blue-200 border') : 'hover:bg-gray-100 border border-transparent'}`}>
                                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all ${selectedMembers.includes(id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                        {selectedMembers.includes(id) && <Check size={14} className="text-white"/>}
                                    </div>
                                    <img src={avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="avatar"/>
                                    <span className="font-semibold flex-1">{name}</span>
                                </div>
                            )
                        }) : <p className="text-center text-gray-500 py-4">Không tìm thấy ai</p>}
                    </div>
                </div>
                <div className={`p-5 border-t flex gap-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all">Hủy</button>
                    <button 
                        onClick={handleConfirm} 
                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                            (mode === 'transfer' && selectedMembers.length === 1) || 
                            (mode === 'add' && selectedMembers.length >= 1) || 
                            (mode === 'create' && selectedMembers.length >= 2) 
                            ? 'bg-[#0068ff] hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

const Chat = () => {
    const navigate = useNavigate();
    const scrollRef = useRef();
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null); 
    const fileInputRef = useRef(null);
    const groupAvatarInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const [user] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    });

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

    // === CSS CHUNG ===
    const bgMain = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800';
    const bgPanel = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const bgChatArea = theme === 'dark' ? 'bg-[#1a1d21]' : 'bg-[#eef0f1]';
    const hoverItem = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
    const activeIcon = "bg-blue-700 text-white shadow-inner";
    const inactiveIcon = "text-white/70 hover:bg-blue-600 hover:text-white transition-all";

    const t = {
        search: lang === 'vi' ? "Tìm kiếm..." : "Search...",
        roomName: lang === 'vi' ? "Phòng Chat Chung" : "General Chat",
        roomDesc: lang === 'vi' ? "Nơi mọi người giao lưu" : "Where everyone hangs out",
        friends: lang === 'vi' ? "Bạn bè" : "Friends",
        today: lang === 'vi' ? "Hôm nay" : "Today",
        placeholder: lang === 'vi' ? `Nhập tin nhắn...` : `Message...`,
        settings: lang === 'vi' ? "Cài đặt" : "Settings",
        profile: lang === 'vi' ? "Hồ sơ của bạn" : "Your Profile",
        logout: lang === 'vi' ? "Đăng xuất" : "Log out",
        online: lang === 'vi' ? "Vừa truy cập" : "Active just now",
        langLabel: lang === 'vi' ? "Ngôn ngữ: Tiếng Việt" : "Language: English",
        themeLabel: theme === 'light' ? (lang === 'vi' ? "Giao diện: Sáng" : "Theme: Light") : (lang === 'vi' ? "Giao diện: Tối" : "Theme: Dark"),
        sent: lang === 'vi' ? "Đã gửi" : "Sent",
        seen: lang === 'vi' ? "Đã xem" : "Seen"
    };

    const [activeTab, setActiveTab] = useState('messages');
    const [activeRoom, setActiveRoom] = useState({}); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false); 
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    // TYPING STATE (Bảo vệ lỗi bóng ma)
    const [typingUsers, setTypingUsers] = useState({}); 
    
    const [replyingTo, setReplyingTo] = useState(null); 
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]); 
    const [conversations, setConversations] = useState([]);
    
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false); 
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardingMsg, setForwardingMsg] = useState(null);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false); 
    const [showGroupSettings, setShowGroupSettings] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false); 
    const [showTransferOwnerModal, setShowTransferOwnerModal] = useState(false);
    
    const [reactionDetailMsg, setReactionDetailMsg] = useState(null);
    const [activeConvMenu, setActiveConvMenu] = useState(null);
    const [hiddenConversations, setHiddenConversations] = useState(() => {
        try { return JSON.parse(localStorage.getItem('hiddenConversations') || '[]'); } catch { return []; }
    });
    const [clearedConversations, setClearedConversations] = useState(() => {
        try { return JSON.parse(localStorage.getItem('clearedConversations') || '{}'); } catch { return {}; }
    });
    const [pinnedConversations, setPinnedConversations] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const u = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
            if (u && Array.isArray(u.pinnedConvs)) return u.pinnedConvs;
            return JSON.parse(localStorage.getItem('pinnedConversations') || '[]');
        } catch { return []; }
    });

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isAlert: false });

    const [isEditingGroupName, setIsEditingGroupName] = useState(false);
    const [editGroupName, setEditGroupName] = useState("");

    const [searchEmail, setSearchEmail] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [onlineUsersList, setOnlineUsersList] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    const [activeGroupCalls, setActiveGroupCalls] = useState([]);

    const [callState, setCallState] = useState('idle');
    const [callDetail, setCallDetail] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [remoteCamOn, setRemoteCamOn] = useState(true);
    const [remoteMicOn, setRemoteMicOn] = useState(true);

    const peerConnectionRef = useRef(null);
    const groupPeersRef = useRef({});       
    const localStreamRef = useRef(null);
    const timerRef = useRef(null);
    
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [groupStreams, setGroupStreams] = useState({});
    const [remoteMedia, setRemoteMedia] = useState({});

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));


    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('lang', lang);
    }, [theme, lang]);

    // =================================================================
    // LOAD DỮ LIỆU BẠN BÈ VÀ HỘI THOẠI
    // =================================================================
    const loadFriendsData = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get(`/friends/${user.id}`);
            setPendingRequests(res.data.pendingRequests);
            setSentRequests(res.data.sentRequests);
            setFriends(res.data.acceptedFriends);
        } catch (err) { console.error("Lỗi tải bạn bè:", err); }
    }, [user]);

    const loadConversations = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get(`/conversations/user/${user.id}`);
            setConversations(res.data);
            
            res.data.forEach(conv => {
                socket.emit("join_room", conv.id);
            });
            
            if (activeRoom.type === 'group' && activeRoom.id) {
                const updatedRoom = res.data.find(c => c.id === activeRoom.id);
                if (!updatedRoom) {
                     setActiveRoom(prev => ({ ...prev, isKicked: true }));
                } else {
                     setActiveRoom(prev => ({ ...updatedRoom, isKicked: false, sendMode: prev.sendMode !== updatedRoom.sendMode ? updatedRoom.sendMode : prev.sendMode }));
                }
            }
        } catch (err) { console.error("Lỗi tải hội thoại:", err); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeRoom.id, activeRoom.type]);

    const getUserDetails = useCallback((uid) => {
        if (uid === user?.id) return user;
        if (activeRoom.type === 'group') {
            return activeRoom.members?.find(m => m.id === uid) || { fullName: "Thành viên ẩn" };
        } else {
            const friend = friends.find(f => f.user.id === uid);
            if (friend) return friend.user;
            return { fullName: "Người dùng" };
        }
    }, [user, activeRoom, friends]);

    // =================================================================
    // WEBRTC AN TOÀN TUYỆT ĐỐI
    // =================================================================
    const createGroupPeerConnection = useCallback((partnerId, isInitiator) => {
        const pc = new RTCPeerConnection(rtcConfig);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }
        pc.ontrack = (event) => setGroupStreams(prev => ({ ...prev, [partnerId]: event.streams[0] }));
        pc.onicecandidate = (event) => {
            if (event.candidate) socket.emit('webrtc_signal', { targetId: partnerId, senderId: user.id, signal: event.candidate, isGroup: true });
        };
        groupPeersRef.current[partnerId] = pc;
        if (isInitiator) {
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                socket.emit('webrtc_signal', { targetId: partnerId, senderId: user.id, signal: offer, isGroup: true });
            }).catch(err => console.error(err));
        }
        return pc;
    }, [user]);

    const initWebRTC = useCallback(async (isInitiator) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: callDetail?.isVideo, audio: true });
            localStreamRef.current = stream;
            setLocalStream(stream);
            const pc = new RTCPeerConnection(rtcConfig);
            peerConnectionRef.current = pc;
            pc.iceQueue = []; 
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            pc.ontrack = (event) => setRemoteStream(event.streams[0]);
            pc.onicecandidate = (event) => {
                if (event.candidate && callDetail?.partner?.id) {
                    socket.emit('webrtc_signal', { targetId: callDetail.partner.id, senderId: user.id, signal: event.candidate, isGroup: false });
                }
            };
            if (isInitiator && callDetail?.partner?.id) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('webrtc_signal', { targetId: callDetail.partner.id, senderId: user.id, signal: offer, isGroup: false });
            }
        } catch (err) { 
            console.error("Camera error:", err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi thiết bị", message: "Vui lòng cấp quyền truy cập Camera/Mic trên trình duyệt!", onConfirm: closeConfirm, theme, bgPanel });
            resetCall(); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callDetail, theme, bgPanel, user]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        socket.emit("register_user", user.id);

        loadConversations();
        loadFriendsData();

        const fetchMessages = async (roomId) => {
            try {
                const res = await api.get(`/messages/${roomId}?userId=${user.id}`);
                let filteredMessages = res.data;
                // Lọc theo thời điểm xóa (Zalo-style clear)
                const clearTime = clearedConversations[roomId];
                if (clearTime) {
                    filteredMessages = filteredMessages.filter(m => new Date(m.createdAt).getTime() > clearTime);
                }
                if (activeRoom.type === 'group' && activeRoom.members) {
                    const currentUserMemberInfo = activeRoom.members.find(m => m.id === user.id);
                    if (currentUserMemberInfo && currentUserMemberInfo.joinedAt) {
                         const joinTime = new Date(currentUserMemberInfo.joinedAt).getTime();
                         filteredMessages = filteredMessages.filter(m => {
                             if (m.messageType === 'system' && m.text.includes('thêm')) return true;
                             return new Date(m.createdAt).getTime() >= joinTime;
                         });
                    }
                }
                setMessages(filteredMessages);
                socket.emit("mark_as_seen", { roomId, userId: user.id });
            } catch (err) { console.error("Lỗi tải tin nhắn:", err); }
        };
        
        if (activeRoom.id) {
            fetchMessages(activeRoom.id);
        }
        
        setTypingUsers({}); setReplyingTo(null); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, user, activeRoom.id]); 

    useEffect(() => {
        if (!user) return; 

        const handleReceiveMessage = (data) => {
            // Unhide conversation if a new message arrives
            if (data.conversationId) {
                setHiddenConversations(prev => {
                    if (!prev.includes(data.conversationId)) return prev;
                    const updated = prev.filter(id => id !== data.conversationId);
                    localStorage.setItem('hiddenConversations', JSON.stringify(updated));
                    return updated;
                });
                // Khi có tin mới → xóa timestamp clear để tin mới hiển thị bình thường
                setClearedConversations(prev => {
                    if (!prev[data.conversationId]) return prev;
                    const updated = { ...prev };
                    delete updated[data.conversationId];
                    localStorage.setItem('clearedConversations', JSON.stringify(updated));
                    return updated;
                });
                // Cập nhật updatedAt ngay lập tức để thời gian hiển thị đúng
                setConversations(prev => prev.map(conv =>
                    conv.id === data.conversationId
                        ? { ...conv, updatedAt: data.createdAt || new Date().toISOString() }
                        : conv
                ));
            }
            if (data.conversationId === activeRoom.id) {
                let shouldAdd = true;
                if (activeRoom.type === 'group' && activeRoom.members) {
                    const currentUserMemberInfo = activeRoom.members.find(m => m.id === user.id);
                    if (currentUserMemberInfo && currentUserMemberInfo.joinedAt) {
                        const joinTime = new Date(currentUserMemberInfo.joinedAt).getTime();
                        if (new Date(data.createdAt).getTime() < joinTime && !(data.messageType === 'system' && data.text.includes('thêm'))) {
                            shouldAdd = false;
                        }
                    }
                }
                if (shouldAdd) {
                    setMessages((prev) => [...prev, data]);
                    if (data.authorId !== user.id) socket.emit("mark_as_seen", { roomId: activeRoom.id, userId: user.id });
                }
            }
            loadConversations();
        };

        const handleGroupUpdate = ({ roomId, action, data }) => {
            if (roomId === activeRoom.id) {
                if (action === 'member_removed' && data.targetUserId === user.id) {
                     setActiveRoom(prev => ({ ...prev, isKicked: true }));
                     setShowGroupSettings(false);
                } else if (action === 'group_disbanded') {
                     setActiveRoom(prev => ({ ...prev, isDisbanded: true }));
                     setShowGroupSettings(false);
                } else if (action === 'sendMode_changed') {
                     setActiveRoom(prev => ({ ...prev, sendMode: data.sendMode }));
                }
            }
            loadConversations();
        };

        const handleMessagesSeen = ({ roomId }) => {
            if (roomId === activeRoom.id) {
                setMessages(prev => prev.map(msg => (msg.authorId === user.id && msg.status !== 'seen') ? { ...msg, status: 'seen' } : msg));
            }
        };

        const handleUserTyping = ({ roomId, userName, isTyping }) => {
            setTypingUsers(prev => {
                const roomTypers = prev[roomId] || [];
                if (isTyping && !roomTypers.includes(userName)) {
                    return { ...prev, [roomId]: [...roomTypers, userName] };
                }
                if (!isTyping) {
                    return { ...prev, [roomId]: roomTypers.filter(n => n !== userName) };
                }
                return prev;
            });
        };

        const handleMessageRecalled = (messageId) => { 
            setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRecalled: true } : msg));
        };
        
        const handleMessageDeleted = (messageId) => { 
            setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, deletedFor: [...(msg.deletedFor || []), user.id] } : msg));
        };

        const handleIncomingCall = ({ caller, isVideo }) => {
            setCallState('incoming');
            setCallDetail({ partner: caller, isVideo, isCaller: false });
        };

        const handleCallStatus = ({ status, reason }) => {
            setCallState(status);
            if (status === 'busy' || status === 'failed' || status === 'rejected' || status === 'missed') {
                if (callDetail?.isCaller && status !== 'missed') { 
                    const targetRoomId = `1-1_${[String(user.id), String(callDetail.partner?.id)].sort().join('_')}`;
                    let txt = "📞 Cuộc gọi nhỡ";
                    if (status === 'busy') txt = "📞 Người dùng đang bận";
                    else if (status === 'rejected') txt = "📞 Đã từ chối cuộc gọi";
                    socket.emit("send_message", { roomId: targetRoomId, senderId: user.id, senderName: user?.fullName, text: txt, messageType: 'call' });
                }
                setTimeout(resetCall, 2000);
            }
        };

        const handleCallAccepted = async () => {
            setCallState('in-call');
            startTimer();
            await initWebRTC(true); 
        };

        const handleCallEnded = () => { 
            setCallState('ended');
            setTimeout(resetCall, 2000);
        };

        const handleIncomingGroupCall = ({ roomId, caller, roomName }) => {
            setCallState('incoming');
            setCallDetail({ isGroup: true, roomId, partner: { id: caller.id, name: caller.fullName, avatar: caller.avatar }, name: roomName });
        };

        const handleUserJoinedGroupCall = (newUser) => {
            if (callState === 'in-group-call') createGroupPeerConnection(newUser.id, true);
        };

        const handleUserLeftGroupCall = (userIdLeave) => {
            if (groupPeersRef.current[userIdLeave]) {
                groupPeersRef.current[userIdLeave].close();
                delete groupPeersRef.current[userIdLeave];
            }
            setGroupStreams(prev => {
                const newStreams = { ...prev };
                delete newStreams[userIdLeave];
                return newStreams;
            });
        };

        const handleWebRTCSignal = async ({ signal, senderId, isGroup }) => {
            if (signal.customType === 'media_toggle') {
                if (!isGroup) {
                    if (signal.media === 'video') setRemoteCamOn(signal.isEnabled);
                    if (signal.media === 'audio') setRemoteMicOn(signal.isEnabled);
                } else {
                    setRemoteMedia(prev => ({
                        ...prev,
                        [senderId]: { ...prev[senderId], [signal.media]: signal.isEnabled }
                    }));
                }
                return;
            }

            let pc = isGroup ? groupPeersRef.current[senderId] : peerConnectionRef.current;

            if (!pc && isGroup) {
                pc = createGroupPeerConnection(senderId, false);
            } else if (!pc && !isGroup) {
                await initWebRTC(false);
                pc = peerConnectionRef.current;
            }

            if (!pc) return;

            try {
                if (signal.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    const target = isGroup ? senderId : (callDetail?.partner?.id);
                    if (target) socket.emit('webrtc_signal', { targetId: target, senderId: user.id, signal: answer, isGroup });
                } else if (signal.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                } else if (signal.candidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(signal));
                }
            } catch (err) { console.error("WebRTC SIGNAL error:", err); }
        };

        const handleMessageReacted = ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
        };

        const handleMessagePinned = ({ pinnedMessage }) => {
            setActiveRoom(prev => ({ ...prev, pinnedMessage }));
            loadConversations();
        };

        socket.on('active_group_calls', (activeCalls) => setActiveGroupCalls(activeCalls || []));
        socket.on("receive_message", handleReceiveMessage);
        socket.on("messages_seen", handleMessagesSeen);
        socket.on("user_typing", handleUserTyping);
        socket.on("message_recalled", handleMessageRecalled);
        socket.on("message_deleted_for_me", handleMessageDeleted);
        socket.on('incoming_call', handleIncomingCall);
        socket.on('call_status', handleCallStatus);
        socket.on('call_accepted', handleCallAccepted);
        socket.on('call_ended', handleCallEnded);
        socket.on('webrtc_signal', handleWebRTCSignal);
        socket.on('group_event', handleGroupUpdate);
        socket.on('message_reacted', handleMessageReacted); 
        socket.on('message_pinned', handleMessagePinned);   
        socket.on('incoming_group_call', handleIncomingGroupCall);
        socket.on('user_joined_group_call', handleUserJoinedGroupCall);
        socket.on('user_left_group_call', handleUserLeftGroupCall);

        socket.emit('get_online_users');
        socket.on('online_users_list', (users) => setOnlineUsersList(users));
        socket.on('user_online', (uid) => setOnlineUsersList(prev => [...new Set([...prev, uid])]));
        socket.on('user_offline', (uid) => setOnlineUsersList(prev => prev.filter(id => id !== uid)));

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("messages_seen", handleMessagesSeen);
            socket.off("user_typing", handleUserTyping);
            socket.off("message_recalled", handleMessageRecalled);
            socket.off("message_deleted_for_me", handleMessageDeleted);
            socket.off('incoming_call', handleIncomingCall);
            socket.off('call_status', handleCallStatus);
            socket.off('call_accepted', handleCallAccepted);
            socket.off('call_ended', handleCallEnded);
            socket.off('webrtc_signal', handleWebRTCSignal);
            socket.off('group_event', handleGroupUpdate);
            socket.off('message_reacted', handleMessageReacted); 
            socket.off('message_pinned', handleMessagePinned);   
            socket.off('incoming_group_call');
            socket.off('user_joined_group_call');
            socket.off('user_left_group_call');
            socket.off('active_group_calls');
            socket.off('online_users_list');
            socket.off('user_online');
            socket.off('user_offline');
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoom.id, loadConversations, user, callDetail, initWebRTC, callState]);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isUploading, showEmojiPicker, typingUsers, replyingTo, isRecording]);
    
    const partnerId = activeRoom.type === '1-1' && user ? activeRoom.id.replace('1-1_', '').replace(user.id, '').replace('_', '') : null;
    const isPartnerOnline = partnerId && onlineUsersList.includes(partnerId);

    // ==========================================
    // LOGIC VIDEO CALL BẢO VỆ CHUẨN XÁC
    // ==========================================
    useEffect(() => {
        let timeout;
        if (callState === 'calling' || callState === 'incoming') {
            timeout = setTimeout(() => {
                if (callState === 'calling' && callDetail?.partner?.id) {
                    const pId = callDetail.partner.id;
                    const targetRoomId = `1-1_${[String(user?.id), String(pId)].sort().join('_')}`; 
                    socket.emit('end_call', { callerId: user?.id, receiverId: pId, callData: null });
                    socket.emit("send_message", { roomId: targetRoomId, senderId: user?.id, senderName: user?.fullName, text: "📞 Cuộc gọi nhỡ", messageType: 'call' });
                    setCallState('missed');
                    setTimeout(resetCall, 2000);
                } else {
                    setCallState('missed');
                    setTimeout(resetCall, 2000);
                }
            }, 30000);
        }
        return () => clearTimeout(timeout);
    }, [callState, callDetail, user]);

    const startCall = (isVideo) => {
        if (!activeRoom || activeRoom.type !== '1-1' || !user || !user.id) return;
        if (callState !== 'idle') return; // Chặn bấm đúp tránh lỗi người dùng đang bận
        
        let pId = null;
        if (activeRoom.members && activeRoom.members.length > 0) {
            const partner = activeRoom.members.find(m => String(m.id) !== String(user.id));
            if (partner) pId = partner.id;
        }
        if (!pId && activeRoom.id) {
            pId = String(activeRoom.id).split('_').find(id => id !== String(user.id) && id !== '1-1');
        }
        if (!pId) {
            console.error("Lỗi: Không tìm thấy ID đối tác để gọi!");
            return;
        }

        setCallState('calling');
        setCallDetail({ partner: { id: pId, name: activeRoom.name, avatar: activeRoom.avatar }, isVideo, isCaller: true });
        socket.emit('request_call', { caller: user, receiverId: pId, isVideo });
    };

    const acceptCall = async () => {
        if (!callDetail || !callDetail.partner) return;
        socket.emit('accept_call', { callerId: callDetail.partner.id, receiverId: user.id });
        setCallState('in-call');
        startTimer();
        await initWebRTC(false); 
    };

    const rejectCall = () => {
        if (!callDetail || !callDetail.partner) return;
        socket.emit('reject_call', { callerId: callDetail.partner.id, receiverId: user.id, status: 'rejected' });
        resetCall();
    };

    const endCall = () => {
        const pId = callDetail?.partner?.id;
        if (!pId) {
            setCallState('ended');
            setTimeout(resetCall, 2000);
            return;
        }
        const targetRoomId = `1-1_${[String(user.id), String(pId)].sort().join('_')}`; 
        let finalStatus = 'ended';
        let txt = `📞 Cuộc gọi kết thúc (${formatTimeSeconds(callDuration)})`;
        if (callDuration === 0) {
            if (callState === 'calling') { finalStatus = 'canceled'; txt = "📞 Cuộc gọi bị hủy"; } 
            else { finalStatus = 'missed'; }
        }
        socket.emit('end_call', { 
            callerId: callDetail.isCaller ? user.id : pId, receiverId: callDetail.isCaller ? pId : user.id,
            callData: { callerId: callDetail.isCaller ? user.id : pId, receiverId: callDetail.isCaller ? pId : user.id, startTime: new Date(Date.now() - callDuration * 1000).toISOString(), duration: callDuration, status: finalStatus }
        });
        if (callDetail.isCaller || finalStatus === 'ended') {
            socket.emit("send_message", { roomId: targetRoomId, senderId: user.id, senderName: user.fullName, text: txt, messageType: 'call' });
        }
        setCallState('ended');
        setTimeout(resetCall, 2000);
    };

    const startGroupCall = async () => {
        if (!activeRoom || !activeRoom.id) return;
        if (callState !== 'idle') return; // Chặn bấm đúp
        setCallState('in-group-call');
        setCallDetail({ isGroup: true, roomId: activeRoom.id, name: activeRoom.name });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setLocalStream(stream);
            socket.emit('start_group_call', { roomId: activeRoom.id, caller: user, roomName: activeRoom.name });
            socket.emit('join_group_call', { roomId: activeRoom.id, user });
            startTimer();
        } catch (err) {
            console.error(err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Cấp quyền Camera/Mic để tham gia!", onConfirm: closeConfirm, theme, bgPanel });
            resetCall();
        }
    };

    const joinGroupCall = async (roomId, roomName) => {
        if (callState !== 'idle' && callState !== 'incoming') return; // Chặn lỗi văng ra
        setCallState('in-group-call');
        setCallDetail({ isGroup: true, roomId, name: roomName });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setLocalStream(stream);
            socket.emit('join_group_call', { roomId, user });
            startTimer();
        } catch (err) {
            console.error(err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Cấp quyền Camera/Mic để tham gia!", onConfirm: closeConfirm, theme, bgPanel });
            resetCall();
        }
    };

    const endGroupCall = () => {
        if (callDetail?.roomId) socket.emit('leave_group_call', { roomId: callDetail.roomId, userId: user.id });
        setCallState('ended');
        setTimeout(resetCall, 2000);
    };

    const resetCall = () => {
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        Object.values(groupPeersRef.current).forEach(pc => pc.close());
        groupPeersRef.current = {};
        setLocalStream(null); setRemoteStream(null); setGroupStreams({}); setRemoteMedia({});
        clearInterval(timerRef.current);
        setCallState('idle'); setCallDetail(null); setCallDuration(0);
        setIsCamOn(true); setIsMicOn(true); setRemoteCamOn(true); setRemoteMicOn(true);
    };

    const startTimer = () => { timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000); };
    
    const toggleMic = () => {
        if(localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if(track) {
                track.enabled = !track.enabled; setIsMicOn(track.enabled);
                if (callDetail?.isGroup) {
                    Object.keys(groupPeersRef.current).forEach(peerId => {
                        socket.emit('webrtc_signal', { targetId: peerId, senderId: user.id, signal: { customType: 'media_toggle', media: 'audio', isEnabled: track.enabled }, isGroup: true });
                    });
                } else {
                    socket.emit('webrtc_signal', { targetId: callDetail?.partner?.id, senderId: user.id, signal: { customType: 'media_toggle', media: 'audio', isEnabled: track.enabled }, isGroup: false });
                }
            }
        }
    };
    const toggleCam = () => {
        if(localStreamRef.current) {
            const track = localStreamRef.current.getVideoTracks()[0];
            if(track) {
                track.enabled = !track.enabled; setIsCamOn(track.enabled);
                if (callDetail?.isGroup) {
                    Object.keys(groupPeersRef.current).forEach(peerId => {
                        socket.emit('webrtc_signal', { targetId: peerId, senderId: user.id, signal: { customType: 'media_toggle', media: 'video', isEnabled: track.enabled }, isGroup: true });
                    });
                } else {
                    socket.emit('webrtc_signal', { targetId: callDetail?.partner?.id, senderId: user.id, signal: { customType: 'media_toggle', media: 'video', isEnabled: track.enabled }, isGroup: false });
                }
            }
        }
    };

    // ==========================================
    // KẾT BẠN
    // ==========================================
    const handleSearchAddFriend = async (e) => { 
        e.preventDefault(); 
        try { 
            const res = await api.post('/friends/search', { email: searchEmail.trim() }); 
            if (res.data.id === user.id) { 
                setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Bạn không thể tự kết bạn!", onConfirm: closeConfirm, theme, bgPanel }); 
                setSearchResult(null); 
            } else { setSearchResult(res.data); }
        } catch (err) { 
            console.error("Lỗi tìm bạn:", err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Không tìm thấy người dùng!", onConfirm: closeConfirm, theme, bgPanel }); 
            setSearchResult(null); 
        } 
    };
    const handleSendRequest = async () => { try { await api.post('/friends/request', { senderId: user.id, receiverId: searchResult.id }); setShowAddFriendModal(false); setSearchResult(null); setSearchEmail(""); loadFriendsData(); } catch (err) { console.error(err); } };
    const handleAcceptRequest = async (friendshipId) => { try { await api.post('/friends/accept', { friendshipId }); loadFriendsData(); } catch (err) { console.error(err); } };
    const handleDeleteFriendship = async (e, friendshipId, confirmMsg) => { 
        e.stopPropagation(); 
        if(confirmMsg) {
             setConfirmDialog({
                 isOpen: true, isAlert: false, title: "Xác nhận", message: confirmMsg, theme, bgPanel,
                 onConfirm: async () => { closeConfirm(); try { await api.post('/friends/delete', { friendshipId }); loadFriendsData(); } catch (err) { console.error(err); } }
             });
             return;
        }
        try { await api.post('/friends/delete', { friendshipId }); loadFriendsData(); } catch (err) { console.error(err); } 
    };
    const startPrivateChat = async (targetUser) => { try { const res = await api.post('/conversations/1-1', { senderId: user.id, receiverId: targetUser.id }); setActiveRoom({ id: res.data.id, name: targetUser.fullName, avatar: targetUser.avatar, type: "1-1" }); setActiveTab('messages'); loadConversations(); } catch (err) { console.error(err); } };

    // ==========================================
    // LOGIC CHAT
    // ==========================================
    const formatConversationTime = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString); const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const handleDeleteConversation = (e, convId, convName) => {
        e.stopPropagation();
        setActiveConvMenu(null);
        setConfirmDialog({
            isOpen: true, isAlert: false, title: "Ẩn cuộc trò chuyện", message: `Ẩn "${convName}" khỏi danh sách? Tin nhắn mới sẽ hiển thị lại.`, theme, bgPanel,
            onConfirm: () => {
                closeConfirm();
                const updated = hiddenConversations.includes(convId)
                    ? hiddenConversations
                    : [...hiddenConversations, convId];
                setHiddenConversations(updated);
                localStorage.setItem('hiddenConversations', JSON.stringify(updated));
                if (activeRoom.id === convId) setActiveRoom({});
            }
        });
    };

    const handleHardDeleteConversation = (e, convId, convName) => {
        e.stopPropagation();
        setActiveConvMenu(null);
        setConfirmDialog({
            isOpen: true, isAlert: false, title: "Xóa lịch sử trò chuyện", message: `Xóa toàn bộ tin nhắn với "${convName}"? Cuộc trò chuyện sẽ xuất hiện lại khi có tin nhắn mới.`, theme, bgPanel,
            onConfirm: () => {
                closeConfirm();
                const now = Date.now();
                // Lưu timestamp xóa — tin nhắn cũ hơn thời điểm này sẽ bị ẩn
                const updatedCleared = { ...clearedConversations, [convId]: now };
                setClearedConversations(updatedCleared);
                localStorage.setItem('clearedConversations', JSON.stringify(updatedCleared));
                // Ẩn khỏi danh sách gần đây
                const updatedHidden = hiddenConversations.includes(convId) ? hiddenConversations : [...hiddenConversations, convId];
                setHiddenConversations(updatedHidden);
                localStorage.setItem('hiddenConversations', JSON.stringify(updatedHidden));
                if (activeRoom.id === convId) { setActiveRoom({}); setMessages([]); }
            }
        });
    };

    const handlePinConversation = async (e, convId) => {
        e.stopPropagation();
        setActiveConvMenu(null);
        if (!user) return;
        if (!pinnedConversations.includes(convId) && pinnedConversations.length >= 3) {
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Đã đạt giới hạn", message: "Chỉ được ghim tối đa 3 cuộc trò chuyện.", onConfirm: closeConfirm, theme, bgPanel });
            return;
        }
        try {
            const res = await api.post('/users/pin-conversation', { userId: user.id, roomId: convId });
            const updated = res.data.pinnedConvs;
            setPinnedConversations(updated);
            localStorage.setItem('pinnedConversations', JSON.stringify(updated));
            // Đồng bộ vào user đã lưu để lần mở sau vẫn đúng
            try { localStorage.setItem('user', JSON.stringify({ ...user, pinnedConvs: updated })); } catch { /* ignore */ }
        } catch (err) {
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: err.response?.data?.error || "Không thể ghim. Thử lại sau.", onConfirm: closeConfirm, theme, bgPanel });
        }
    };

    const sortedConversations = [...conversations]
        .filter(conv => !hiddenConversations.includes(conv.id))
        .sort((a, b) => {
            const aPinned = pinnedConversations.includes(a.id);
            const bPinned = pinnedConversations.includes(b.id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
            if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    const filteredConversations = sortedConversations.filter(conv => conv.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredFriends = friends.filter(friend => friend.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || friend.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                const formData = new FormData(); formData.append('file', file);
                setIsUploading(true);

                try {
                    const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    socket.emit("send_message", { roomId: activeRoom.id, senderId: user.id, senderName: user.fullName, text: res.data.url, messageType: 'audio', fileName: "Tin nhắn thoại", replyTo: replyingTo?.id || null });
                } catch (err) {
                    console.error("Lỗi upload ghi âm:", err);
                    setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi gửi tin nhắn thoại!", onConfirm: closeConfirm, theme, bgPanel });
                } finally { setIsUploading(false); setReplyingTo(null); }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(); setIsRecording(true); setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (err) { 
            console.error("Lỗi truy cập Mic:", err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Quyền truy cập", message: "Vui lòng cấp quyền Microphone!", onConfirm: closeConfirm, theme, bgPanel }); 
        }
    };

    const stopAndSendRecording = () => {
        if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(recordingTimerRef.current); }
    };

    const cancelRecordingAction = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = null; mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop()); mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(recordingTimerRef.current);
        }
    };

    const sendSystemMessage = (text, customRoomId = null) => {
        socket.emit("send_message", { roomId: customRoomId || activeRoom.id, senderId: "system", senderName: "Hệ thống", text: text, messageType: 'system' });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socket.emit("typing", { roomId: activeRoom.id, userName: user.fullName, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { socket.emit("typing", { roomId: activeRoom.id, userName: user.fullName, isTyping: false }); }, 2000);
    };

    const handleSendMessage = (e) => {
        e?.preventDefault(); 
        if (!newMessage.trim() || !user) return;
        socket.emit("send_message", { roomId: activeRoom.id, senderId: user.id, senderName: user.fullName, text: newMessage, messageType: 'text', replyTo: replyingTo?.id || null });
        setNewMessage(""); setShowEmojiPicker(false); setReplyingTo(null); 
        socket.emit("typing", { roomId: activeRoom.id, userName: user.fullName, isTyping: false });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleForwardMessage = (targetRoomId) => {
        if (!forwardingMsg || !user) return;
        socket.emit("send_message", { roomId: targetRoomId, senderId: user.id, senderName: user.fullName, text: forwardingMsg.text, messageType: forwardingMsg.messageType, fileName: forwardingMsg.fileName || "", replyTo: null });
        setShowForwardModal(false); setForwardingMsg(null); 
        setConfirmDialog({ isOpen: true, isAlert: true, title: "Thành công", message: "Đã chuyển tiếp tin nhắn thành công!", onConfirm: closeConfirm, theme, bgPanel });
    };

    const handleFileUpload = async (e, typeOverride, isGroupAvatar = false) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setIsUploading(!isGroupAvatar);
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { 
                 setConfirmDialog({ isOpen: true, isAlert: true, title: "File quá lớn", message: `File ${file.name} quá lớn! Vui lòng chọn dưới 10MB.`, onConfirm: closeConfirm, theme, bgPanel });
                 continue; 
            }
            const formData = new FormData(); formData.append('file', file);
            try {
                const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (isGroupAvatar) {
                    await handleUpdateGroupInfo(null, res.data.url);
                } else {
                    let finalType = typeOverride || 'file';
                    if (!typeOverride) {
                        if (res.data.type.includes('image')) finalType = 'image';
                        else if (res.data.type.includes('video')) finalType = 'video';
                        else if (res.data.type.includes('audio')) finalType = 'audio';
                    }
                    socket.emit("send_message", { roomId: activeRoom.id, senderId: user.id, senderName: user.fullName, text: res.data.url, messageType: finalType, fileName: res.data.name || file.name, replyTo: replyingTo?.id || null });
                }
            } catch (err) { 
                console.error(err);
                setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi tải file lên server.", onConfirm: closeConfirm, theme, bgPanel }); 
            }
        }
        setIsUploading(false); e.target.value = null; setReplyingTo(null); 
    };

    // ==========================================
    // QUẢN LÝ NHÓM 
    // ==========================================
    const handleCreateGroup = async (name, memberIds) => {
        try {
            const res = await api.post('/conversations/group', { name: name, creatorId: user.id, memberIds: [...memberIds, user.id] });
            setShowCreateGroupModal(false); loadConversations();
            const newConv = await api.get(`/conversations/user/${user.id}`);
            const fullRoom = newConv.data.find(c => c.id === res.data.id);
            if (fullRoom) setActiveRoom(fullRoom);
            else setActiveRoom({ id: res.data.id, name: res.data.name, type: "group", sendMode: "all_members", members: res.data.members || [], adminIds: res.data.adminIds || [user.id] });
            socket.emit("send_message", { roomId: res.data.id, senderId: "system", senderName: "Hệ thống", text: `${user.fullName} đã tạo nhóm.`, messageType: 'system' });
        } catch (err) { 
            console.error(err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi hệ thống khi tạo nhóm!", onConfirm: closeConfirm, theme, bgPanel }); 
        }
    };

    const handleUpdateGroupMember = (targetId, action, newMembers = []) => {
        if (action === 'remove') {
            setConfirmDialog({
                isOpen: true, isAlert: false, title: "Xóa thành viên", message: "Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?", theme, bgPanel,
                onConfirm: async () => { closeConfirm(); executeGroupUpdate(targetId, action, newMembers); }
            });
        } else { executeGroupUpdate(targetId, action, newMembers); }
    };

    const executeGroupUpdate = async (targetId, action, newMembers) => {
        try {
            const res = await api.post(`/conversations/group/${action}`, {
                roomId: activeRoom.id, adminId: user.id, userId: user.id, targetUserId: targetId, newMembers: newMembers
            });
            let newMembersList = [...(activeRoom.members || [])];
            if (action === 'remove') {
                newMembersList = newMembersList.filter(m => m.id !== targetId);
                const removedUser = activeRoom.members.find(m => m.id === targetId);
                sendSystemMessage(`Đã xóa ${removedUser?.fullName || 'thành viên'} khỏi nhóm.`);
                socket.emit("group_event", { roomId: activeRoom.id, action: "member_removed", data: { targetUserId: targetId } });
            } else if (action === 'add_members') {
                const newConv = await api.get(`/conversations/user/${user.id}`);
                const fullRoom = newConv.data.find(c => c.id === activeRoom.id);
                if (fullRoom && fullRoom.members) newMembersList = fullRoom.members;
                sendSystemMessage(`${user.fullName} đã thêm thành viên mới.`);
                setShowAddMemberModal(false);
            } else if (action === 'make_admin') {
                const adminName = activeRoom.members.find(m => m.id === targetId)?.fullName;
                sendSystemMessage(`${user.fullName} đã gán quyền quản trị cho ${adminName}.`);
            }
            setActiveRoom(prev => ({ ...prev, members: newMembersList, adminIds: res.data.adminIds || prev.adminIds }));
            loadConversations();
        } catch (err) { 
            console.error(err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Bạn không có quyền hoặc có lỗi xảy ra!", onConfirm: closeConfirm, theme, bgPanel }); 
        }
    }

    const handleUpdateGroupInfo = async (newName, newAvatar) => {
        try {
            const res = await api.post(`/conversations/group/update_info`, { roomId: activeRoom.id, name: newName, avatar: newAvatar });
            setActiveRoom(prev => ({ ...prev, name: res.data.name, avatar: res.data.avatar })); loadConversations(); setIsEditingGroupName(false);
            if (newName) sendSystemMessage(`${user.fullName} đã đổi tên nhóm thành "${newName}".`);
            if (newAvatar) sendSystemMessage(`${user.fullName} đã thay đổi ảnh đại diện nhóm.`);
        } catch (err) { 
            console.error(err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi khi đổi thông tin nhóm.", onConfirm: closeConfirm, theme, bgPanel }); 
        }
    };

    const handleUpdateSendMode = async (newMode) => {
        try {
            setActiveRoom(prev => ({ ...prev, sendMode: newMode })); 
            await api.post(`/conversations/group/update_info`, { roomId: activeRoom.id, sendMode: newMode, adminId: user.id });
            const modeText = newMode === 'leaders_only' ? 'Chỉ Nhóm trưởng mới được nhắn tin.' : 'Tất cả mọi người đều được nhắn tin.';
            sendSystemMessage(`${user.fullName} đã đổi chế độ: ${modeText}`);
        } catch (err) { 
            console.error(err);
            setActiveRoom(prev => ({ ...prev, sendMode: prev.sendMode === 'leaders_only' ? 'all_members' : 'leaders_only' })); 
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Chỉ nhóm trưởng mới có quyền đổi chế độ!", onConfirm: closeConfirm, theme, bgPanel }); 
        }
    }

    const handleTransferOwnership = async (newAdminId) => {
        try {
            const res = await api.post(`/conversations/group/transfer_owner`, { roomId: activeRoom.id, adminId: user.id, newAdminId: newAdminId });
            const newAdminName = activeRoom.members.find(m => m.id === newAdminId)?.fullName;
            sendSystemMessage(`${user.fullName} đã chuyển quyền Nhóm trưởng cho ${newAdminName}.`);
            setActiveRoom(prev => ({ ...prev, adminIds: res.data.adminIds })); setShowTransferOwnerModal(false); loadConversations();
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Chuyển quyền", message: `Đã chuyển quyền Nhóm trưởng cho ${newAdminName}`, onConfirm: closeConfirm, theme, bgPanel });
        } catch (err) { 
            console.error(err);
            setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Lỗi chuyển quyền!", onConfirm: closeConfirm, theme, bgPanel }); 
        }
    };

    const handleLeaveGroup = () => {
        const isOwner = activeRoom.adminIds?.includes(user.id);
        const otherMembersCount = (activeRoom.members || []).filter(m => m.id !== user.id).length;
        if (isOwner && otherMembersCount > 0) {
            setConfirmDialog({
                isOpen: true, isAlert: true, title: "Chuyển quyền Nhóm trưởng", 
                message: "Bạn đang là Nhóm trưởng. Vui lòng chuyển quyền cho một thành viên khác trước khi rời nhóm!", theme, bgPanel,
                onConfirm: () => { closeConfirm(); setShowTransferOwnerModal(true); }
            });
            return;
        }
        setConfirmDialog({
            isOpen: true, isAlert: false, title: "Rời nhóm", message: "Bạn có chắc chắn muốn rời khỏi nhóm này?", theme, bgPanel,
            onConfirm: async () => {
                closeConfirm();
                try {
                    sendSystemMessage(`${user.fullName} đã rời khỏi nhóm.`);
                    await api.post(`/conversations/group/leave`, { roomId: activeRoom.id, userId: user.id });
                    setShowGroupSettings(false); setActiveRoom({}); loadConversations();
                } catch (err) { console.error("Lỗi rời nhóm:", err); }
            }
        });
    };

    const handleDisbandGroup = () => {
        setConfirmDialog({
            isOpen: true, isAlert: false, title: "Giải tán nhóm", theme, bgPanel,
            message: "CẢNH BÁO: Bạn có chắc chắn muốn GIẢI TÁN nhóm này? Toàn bộ dữ liệu tin nhắn sẽ bị xóa vĩnh viễn.",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await api.delete(`/conversations/group/${activeRoom.id}?adminId=${user.id}`);
                    socket.emit("group_event", { roomId: activeRoom.id, action: "group_disbanded", data: null });
                    setShowGroupSettings(false); setActiveRoom({}); loadConversations();
                } catch (err) { 
                    console.error("Lỗi giải tán nhóm:", err);
                    setConfirmDialog({ isOpen: true, isAlert: true, title: "Lỗi", message: "Chỉ quản trị viên mới có thể giải tán nhóm!", onConfirm: closeConfirm, theme, bgPanel }); 
                }
            }
        });
    };

    const scrollToMessage = (msgId) => {
        const element = document.getElementById(`msg-${msgId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-100', 'transition-colors', 'duration-500');
            setTimeout(() => {
                element.classList.remove('bg-yellow-100');
            }, 2000);
        }
    };

    const handleEmojiClick = (emojiObject) => { setNewMessage(prev => prev + emojiObject.emoji); };
    const handleRecall = (messageId) => { setConfirmDialog({ isOpen: true, isAlert: false, title: "Thu hồi", message: "Thu hồi tin nhắn này với mọi người?", theme, bgPanel, onConfirm: () => { closeConfirm(); socket.emit("recall_message", { messageId, roomId: activeRoom.id }); }}); };
    const handleDeleteForMe = (messageId) => { setConfirmDialog({ isOpen: true, isAlert: false, title: "Xóa tin nhắn", message: "Xóa tin nhắn này ở phía bạn?", theme, bgPanel, onConfirm: () => { closeConfirm(); socket.emit("delete_message_for_me", { messageId, userId: user.id, roomId: activeRoom.id }); }}); };
    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const toggleLang = () => setLang(lang === 'vi' ? 'en' : 'vi');

    if (!user) return null;

    // --- XÁC ĐỊNH QUYỀN GỬI TIN NHẮN ---
    const isKicked = activeRoom.isKicked || activeRoom.isDisbanded;
    const isOwner = activeRoom.type === 'group' && activeRoom.adminIds?.includes(user?.id);
    const currentSendMode = activeRoom.sendMode || 'all_members';
    const canSendMessage = !isKicked && (activeRoom.type !== 'group' || currentSendMode === 'all_members' || isOwner);
    const inputPlaceholder = isKicked ? "Bạn không còn là thành viên nhóm" : (canSendMessage ? t.placeholder : "Chỉ Trưởng nhóm mới được gửi tin nhắn");

    const toolbarIcon = `p-2 rounded-md transition-colors relative ${!canSendMessage ? 'text-gray-300 cursor-not-allowed' : (theme==='dark' ? 'cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white' : 'cursor-pointer text-[#001A33] hover:bg-gray-100')}`;

    // TÌM XEM PHÒNG NÀY CÓ AI ĐANG GÕ KHÔNG BẰNG ĐÚNG ID CỦA NÓ
    const currentRoomTyping = typingUsers[activeRoom.id] || [];

    return (
        <div className={`flex h-screen font-sans ${bgMain} transition-colors duration-300`}>
            
            {/* OVERLAY VIDEO CALL 1-1 VÀ NHÓM */}
            {callState !== 'idle' && callDetail && (
                <div className="fixed inset-0 bg-gray-900 z-[100] flex flex-col p-4 text-white">
                    <div className="flex justify-between items-center mb-4 z-20 shrink-0">
                        <h2 className="text-xl font-bold bg-black/50 px-4 py-2 rounded-xl border border-gray-700">
                            {callDetail.isGroup ? "Nhóm: " + callDetail.name : callDetail.partner?.name || callDetail.partner?.fullName}
                        </h2>
                    </div>

                    <div className="flex-1 flex gap-4 min-h-0 z-10">
                        {/* Khu vực Video chính */}
                        {callState === 'in-group-call' ? (
                            <div className="w-full h-full flex flex-wrap gap-4 justify-center items-center overflow-y-auto pb-20">
                                <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700 w-full max-w-[320px] aspect-video shrink-0">
                                    {isCamOn && localStream ? (
                                        <VideoPlayer stream={localStream} isLocal={true} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white"><UserCircle2 size={60}/><span className="text-xs mt-2">Camera Tắt</span></div>
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-bold">Bạn ({user?.fullName})</div>
                                </div>
                                {Object.entries(groupStreams).map(([peerId, stream]) => {
                                    const memberName = activeRoom.members?.find(m => m.id === peerId)?.fullName || "Thành viên";
                                    return (
                                        <div key={peerId} className="relative bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700 w-full max-w-[320px] aspect-video shrink-0">
                                            <VideoPlayer stream={stream} isLocal={false} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-bold">{memberName}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 relative bg-gray-950 flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-inner">
                                {callDetail.isVideo && remoteCamOn && callState === 'in-call' && remoteStream ? (
                                    <VideoPlayer stream={remoteStream} isLocal={false} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    callState === 'in-call' && (
                                         <div className="flex flex-col items-center z-10">
                                            <div className="w-32 h-32 bg-gray-700 rounded-full mb-4 overflow-hidden border-4 border-gray-500 shadow-xl flex items-center justify-center">
                                            {callDetail.partner?.avatar ? <img src={callDetail.partner.avatar} className="w-full h-full object-cover" alt="partner"/> : <UserCircle2 size={90} className="text-gray-400"/>}
                                            </div>
                                            <p className="text-xl text-gray-300 font-medium">{callDetail.isVideo ? "Người dùng đã tắt Camera" : (callDetail.partner?.name || callDetail.partner?.fullName)}</p>
                                        </div>
                                    )
                                )}
                                {/* HIỂN THỊ ICON MIC OFF NẾU NGƯỜI KIA TẮT MIC */}
                                {!remoteMicOn && callState === 'in-call' && (
                                    <div className="absolute top-4 left-4 bg-red-500/80 p-2 rounded-full z-20">
                                        <MicOff size={20} className="text-white"/>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Camera nhỏ góc phải (Chỉ dùng cho 1-1 VIDEO) */}
                    {callDetail.isVideo && callState === 'in-call' && (
                         <div className="absolute top-6 right-6 w-40 h-60 bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-600 z-10 overflow-hidden flex flex-col items-center justify-center">
                            {isCamOn && localStream ? (
                                <VideoPlayer stream={localStream} isLocal={true} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400 z-10"> <UserCircle2 size={50} /> <span className="text-xs mt-2 font-medium">Camera tắt</span> </div>
                            )}
                        </div>
                    )}

                    {/* Popup Chờ bắt máy / Trạng thái cuộc gọi 1-1 */}
                    {!callDetail.isGroup && callState !== 'in-call' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 bg-black/50 p-6 rounded-3xl backdrop-blur-sm">
                            <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 overflow-hidden border-4 border-blue-500">
                                {callDetail.partner?.avatar ? <img src={callDetail.partner.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={90}/>}
                            </div>
                            <h2 className="text-3xl font-bold flex items-center gap-2 justify-center">
                                 {callDetail.partner?.name || callDetail.partner?.fullName}
                            </h2>
                            <p className="text-gray-300 mt-2 text-lg">
                                {callState === 'calling' && "Đang gọi..."}
                                {callState === 'ringing' && "Đang đổ chuông..."}
                                {callState === 'incoming' && "Đang gọi cho bạn..."}
                                {callState === 'missed' && "Cuộc gọi bị bỏ lỡ"}
                                {callState === 'ended' && "Cuộc gọi kết thúc"}
                                {callState === 'busy' && "Người dùng đang bận"}
                                {callState === 'rejected' && "Đã từ chối cuộc gọi"}
                            </p>
                        </div>
                    )}

                    {/* Popup Chờ bắt máy / Trạng thái cuộc gọi cho NHÓM */}
                    {callDetail.isGroup && callState !== 'in-group-call' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 bg-black/50 p-6 rounded-3xl backdrop-blur-sm">
                            <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 overflow-hidden border-4 border-blue-500">
                                {callDetail.partner?.avatar ? <img src={callDetail.partner.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={90}/>}
                            </div>
                            <h2 className="text-3xl font-bold flex items-center gap-2 justify-center text-blue-400">
                                 {callDetail.name}
                            </h2>
                            <p className="text-gray-200 mt-2 text-lg">
                                {callState === 'incoming' && <span><strong>{callDetail.partner?.name || callDetail.partner?.fullName}</strong> đang mời bạn tham gia...</span>}
                                {callState === 'ended' && "Cuộc gọi kết thúc"}
                            </p>
                        </div>
                    )}

                    {/* Controls Nút Gọi */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20 bg-black/60 px-8 py-4 rounded-full backdrop-blur-md border border-gray-700 shadow-2xl">
                        {callState === 'incoming' ? (
                            <>
                                <button onClick={() => callDetail.isGroup ? joinGroupCall(callDetail.roomId, callDetail.name) : acceptCall()} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-lg animate-bounce"><PhoneCall size={28} /></button>
                                <button onClick={() => callDetail.isGroup ? resetCall() : rejectCall()} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"><PhoneOff size={28} /></button>
                            </>
                        ) : (
                              <>
                                {(callState === 'in-call' || callState === 'in-group-call') && (
                                    <>
                                        <div className="text-gray-300 font-mono text-sm w-12 text-center">{formatTimeSeconds(callDuration)}</div>
                                        <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 text-white'}`}>{isMicOn ? <Mic size={24}/> : <MicOff size={24}/>}</button>
                                        {(callDetail?.isVideo || callState === 'in-group-call') && <button onClick={toggleCam} className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isCamOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 text-white'}`}>{isCamOn ? <Camera size={24}/> : <CameraOff size={24}/>}</button>}
                                    </>
                                )}
                                <button onClick={callState === 'in-group-call' ? endGroupCall : endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg mx-2"><PhoneOff size={28} /></button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL THÊM BẠN BÈ */}
            {showAddFriendModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${bgPanel}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Thêm bạn bè</h2>
                            <button onClick={() => setShowAddFriendModal(false)} className="text-gray-500 hover:text-red-500 font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSearchAddFriend} className="flex gap-2 mb-4">
                            <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} placeholder="Nhập email cần tìm..." className={`flex-1 px-4 py-2 rounded-lg outline-none border transition-colors ${theme==='dark'?'bg-gray-700 border-gray-600 text-white':'bg-gray-50 border-gray-200 text-black'}`} required />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Search size={20}/></button>
                        </form>
                        {searchResult && (
                            <div className={`p-4 rounded-xl flex items-center justify-between border ${theme==='dark'?'border-gray-600 bg-gray-700':'border-blue-100 bg-blue-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden font-bold text-blue-600 shadow-sm border border-gray-200">
                                        {searchResult.avatar ? <img src={searchResult.avatar} className="w-full h-full object-cover" alt="avatar"/> : searchResult.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[15px]">{searchResult.fullName}</p>
                                        <p className="text-[13px] text-gray-500">{searchResult.email}</p>
                                    </div>
                                </div>
                                <button onClick={handleSendRequest} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Kết bạn</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CỘT 1: MENU */}
            <div className="w-[68px] bg-[#0068ff] flex flex-col items-center py-6 z-30 shrink-0 shadow-lg">
                <div className="relative mb-6">
                    <div className="w-12 h-12 rounded-full cursor-pointer border border-blue-400 overflow-hidden hover:opacity-80 transition-opacity bg-white text-[#0068ff] flex items-center justify-center font-bold" onClick={() => setShowUserMenu(!showUserMenu)}>
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="me" /> : user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    {showUserMenu && (
                        <>
                             <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                            <div className={`absolute top-0 left-16 w-64 rounded-xl shadow-2xl border py-2 z-50 ${bgPanel}`}>
                                <div className={`px-4 py-3 border-b ${theme==='dark'?'border-gray-700':'border-gray-100'}`}> <p className="font-bold text-[17px] truncate">{user?.fullName}</p> </div>
                                <div className="py-1">
                                     <Link to="/profile" className={`block px-4 py-2.5 text-[15px] ${hoverItem}`}>{t.profile}</Link>
                                    <div className={`block px-4 py-2.5 text-[15px] cursor-pointer ${hoverItem}`} onClick={() => {setShowUserMenu(false); setShowSettingsMenu(true);}}>{t.settings}</div>
                                </div>
                                <div className={`border-t my-1 ${theme==='dark'?'border-gray-700':'border-gray-100'}`}></div>
                                <button onClick={handleLogout} className={`w-full text-left px-4 py-2.5 text-[15px] text-red-500 ${hoverItem}`}>{t.logout}</button>
                            </div>
                        </>
                    )}
                 </div>
                <div className="flex flex-col gap-4 w-full items-center">
                    <div onClick={() => setActiveTab('messages')} className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${activeTab === 'messages' ? activeIcon : inactiveIcon}`} title="Tin nhắn"><MessageCircle size={26} fill={activeTab === 'messages' ? "currentColor" : "none"} /></div>
                    <div onClick={() => setActiveTab('contacts')} className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${activeTab === 'contacts' ? activeIcon : inactiveIcon}`} title="Danh bạ"><Contact size={26} /></div>
                </div>
                <div className="relative mt-auto mb-2 w-full flex justify-center">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${showSettingsMenu ? activeIcon : inactiveIcon}`} onClick={() => setShowSettingsMenu(!showSettingsMenu)}> <Settings size={26} /> </div>
                    {showSettingsMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)}></div>
                            <div className={`absolute bottom-0 left-16 w-56 rounded-xl shadow-2xl border py-2 z-50 ${bgPanel}`}>
                                <button onClick={toggleLang} className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] ${hoverItem}`}><Globe size={18} className="text-blue-500" /> <span>{t.langLabel}</span></button>
                                <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] ${hoverItem}`}>{theme === 'light' ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-orange-400" />} <span>{t.themeLabel}</span></button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CỘT 2: DANH SÁCH HỘI THOẠI & BẠN BÈ */}
            <div className={`hidden md:flex w-[340px] border-r flex-col z-10 ${bgPanel} transition-colors duration-300 relative`}>
                
                {/* THANH THÔNG BÁO CUỘC GỌI NHÓM ĐANG DIỄN RA */}
                {activeRoom.type === 'group' && activeGroupCalls.includes(activeRoom.id) && callState !== 'in-group-call' && (
                    <div className="absolute top-0 left-0 right-0 bg-green-500 text-white p-3 z-20 flex justify-between items-center shadow-md animate-pulse">
                        <div className="flex items-center gap-2">
                            <VideoIcon size={20} />
                            <span className="font-bold text-sm">Đang có cuộc gọi nhóm</span>
                        </div>
                        <button onClick={() => joinGroupCall(activeRoom.id, activeRoom.name)} className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-100 transition-colors">
                            Tham gia
                        </button>
                    </div>
                )}

                <div className={`p-4 border-b flex gap-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${(activeRoom.type === 'group' && activeGroupCalls.includes(activeRoom.id) && callState !== 'in-group-call') ? 'mt-12' : ''}`}>
                    <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`flex-1 px-4 py-2 text-[14px] rounded-lg outline-none transition-all border border-transparent ${theme==='dark'?'bg-gray-700 text-white placeholder-gray-400':'bg-gray-100 focus:bg-white focus:border focus:border-blue-400'}`} />
                    {activeTab === 'contacts' && ( <button onClick={() => setShowAddFriendModal(true)} title="Thêm bạn bè" className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${theme==='dark'?'bg-gray-700 text-blue-400 hover:bg-gray-600':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}> <UserPlus size={18}/> </button> )}
                    {activeTab === 'messages' && ( <button onClick={() => setShowCreateGroupModal(true)} title="Tạo nhóm mới" className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${theme==='dark'?'bg-gray-700 text-blue-400 hover:bg-gray-600':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}> <Users size={18}/> </button> )}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {activeTab === 'messages' && (
                        <>
                            <div className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>Gần đây</div>
                            {filteredConversations.map((conv) => (
                                <div key={conv.id} onClick={() => setActiveRoom(conv)} className={`group p-3 cursor-pointer rounded-xl flex gap-3 items-center relative ${activeRoom.id === conv.id ? (theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-50') : hoverItem}`}>
                                    <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 border border-gray-200">
                                        {conv.avatar ? <img src={conv.avatar} className="w-full h-full object-cover" alt="avatar"/> : (conv.type === 'group' ? <Users size={30} /> : <UserCircle2 size={30} />)}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-8">
                                        <div className="font-bold text-[15px] truncate flex justify-between items-center">
                                            <span className="truncate flex items-center gap-1">{pinnedConversations.includes(conv.id) && <Pin size={11} className="text-blue-400 shrink-0"/>}{conv.name}</span>
                                            {conv.unreadCount > 0 && ( <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2"> {conv.unreadCount > 5 ? '5+' : conv.unreadCount} </span> )}
                                        </div>
                                        <div className={`text-[12px] mt-1 flex items-center gap-1 ${theme==='dark'?'text-gray-400':'text-gray-400'}`}>
                                            <span>{formatConversationTime(conv.updatedAt)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* MENU 3 CHẤM Ở DANH SÁCH HỘI THOẠI */}
                                    <div className="hidden group-hover:flex" style={{position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 50}} onClick={(e) => e.stopPropagation()}>
                                        <button onClick={(e) => { e.stopPropagation(); setActiveConvMenu(activeConvMenu === conv.id ? null : conv.id); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors shadow-sm bg-white border border-gray-100">
                                            <MoreHorizontal size={18} />
                                        </button>
                                        {activeConvMenu === conv.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-2xl rounded-xl py-1.5 flex flex-col items-center gap-0.5 w-12" style={{zIndex: 9999}} onMouseLeave={() => setActiveConvMenu(null)}>
                                                <button onClick={(e) => handlePinConversation(e, conv.id)} title={pinnedConversations.includes(conv.id) ? 'Bỏ ghim' : 'Ghim'} className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors ${pinnedConversations.includes(conv.id) ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
                                                    <Pin size={17} />
                                                </button>
                                                <button onClick={(e) => handleDeleteConversation(e, conv.id, conv.name)} title="Ẩn trò chuyện" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                                                    <EyeOff size={17} />
                                                </button>
                                                <button onClick={(e) => handleHardDeleteConversation(e, conv.id, conv.name)} title="Xóa trò chuyện" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredConversations.length === 0 && searchTerm && ( <div className="px-3 py-4 text-center text-sm text-gray-500">Không tìm thấy kết quả nào.</div> )}
                        </>
                    )}

                    {activeTab === 'contacts' && (
                        <>
                            {!searchTerm && pendingRequests.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-3 py-2 text-[12px] font-bold uppercase text-orange-500 tracking-wider">Lời mời kết bạn ({pendingRequests.length})</div>
                                    {pendingRequests.map((req) => (
                                        <div key={req.friendshipId} className={`p-3 rounded-xl flex justify-between items-center ${hoverItem}`}>
                                            <div className="flex gap-3 items-center">
                                                <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex justify-center items-center font-bold overflow-hidden border border-gray-200"> {req.user.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" alt="avatar"/> : req.user.fullName.charAt(0).toUpperCase()} </div>
                                                <div className="font-bold text-[14px] truncate max-w-[100px]">{req.user.fullName}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={(e) => handleDeleteFriendship(e, req.friendshipId)} title="Từ chối" className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 shadow-sm"><X size={16}/></button>
                                                <button onClick={() => handleAcceptRequest(req.friendshipId)} title="Chấp nhận" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-sm"><Check size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!searchTerm && sentRequests.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-3 py-2 text-[12px] font-bold uppercase text-blue-500 tracking-wider">Đã gửi lời mời ({sentRequests.length})</div>
                                    {sentRequests.map((req) => (
                                        <div key={req.friendshipId} className={`p-3 rounded-xl flex justify-between items-center ${hoverItem}`}>
                                            <div className="flex gap-3 items-center">
                                                <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex justify-center items-center font-bold overflow-hidden border border-gray-200">
                                                    {req.user.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" alt="avatar"/> : req.user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-[14px] text-gray-500 truncate max-w-[100px]">Đến: {req.user.fullName}</div>
                                            </div>
                                            <button onClick={(e) => handleDeleteFriendship(e, req.friendshipId, `Hủy lời mời kết bạn?`)} title="Hủy lời mời" className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 shadow-sm"><X size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <div className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>{t.friends} ({filteredFriends.length})</div>
                                {filteredFriends.length === 0 ? ( <div className={`px-3 py-4 text-center text-sm ${theme==='dark'?'text-gray-500':'text-gray-400'}`}> {searchTerm ? "Không tìm thấy bạn bè nào." : "Chưa có bạn bè nào.\nHãy tìm kiếm và kết bạn nhé!"} </div> ) : (
                                    filteredFriends.map((friend) => (
                                        <div key={friend.friendshipId} onClick={() => startPrivateChat(friend.user)} className={`p-3 cursor-pointer rounded-xl flex justify-between items-center ${activeRoom.name === friend.user.fullName ? (theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-50') : hoverItem}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold overflow-hidden border border-gray-200 shrink-0"> {friend.user.avatar ? <img src={friend.user.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={30} />} </div>
                                                <div className="flex-1 min-w-0"> <div className="font-bold text-[15px] truncate max-w-[120px]">{friend.user.fullName}</div> </div>
                                            </div>
                                            <button onClick={(e) => handleDeleteFriendship(e, friend.friendshipId, `Bạn có chắc muốn hủy kết bạn với ${friend.user.fullName}?`)} title="Hủy kết bạn" className={`p-2 rounded-lg transition-colors ${theme==='dark'?'text-gray-500 hover:text-red-400 hover:bg-gray-700':'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}><UserMinus size={18}/></button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4">
                                <div className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>
                                    Nhóm đã tham gia ({conversations.filter(c => c.type === 'group').length})
                                </div>
                                {conversations.filter(c => c.type === 'group').length === 0 ? (
                                    <div className={`px-3 py-4 text-center text-sm ${theme==='dark'?'text-gray-500':'text-gray-400'}`}>Chưa tham gia nhóm nào.</div>
                                ) : (
                                    conversations.filter(c => c.type === 'group' && (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || !searchTerm)).map(group => (
                                        <div key={group.id} onClick={() => { setActiveRoom(group); setActiveTab('messages'); }} className={`p-3 cursor-pointer rounded-xl flex items-center gap-3 ${activeRoom.id === group.id ? (theme==='dark'?'bg-blue-900/40':'bg-blue-50') : hoverItem}`}>
                                            <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden">
                                                {group.avatar ? <img src={group.avatar} className="w-full h-full object-cover" alt="avatar"/> : <Users size={22}/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-[15px] truncate">{group.name}</div>
                                                <div className={`text-[12px] ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>{group.members?.length || 0} thành viên</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CỘT 3: KHUNG CHAT CHÍNH */}
            <div className={`flex-1 flex flex-col ${bgChatArea}`}>
                {activeRoom.id ? (
                    <>
                        <div className={`h-[68px] border-b flex items-center px-6 shadow-sm shrink-0 ${bgPanel}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    {activeRoom.type === '1-1' ? (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0 border border-gray-300"> {activeRoom.avatar ? <img src={activeRoom.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 className="text-gray-500"/>} </div>
                                    ) : ( 
                                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm overflow-hidden">
                                            {activeRoom.avatar ? <img src={activeRoom.avatar} className="w-full h-full object-cover" alt="avatar"/> : <Users size={20}/>}
                                        </div> 
                                    )}
                                    <div>
                                        <div className="font-bold text-[17px] flex items-center gap-2">{activeRoom.name} {activeRoom.type !== '1-1' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}</div>
                                        {activeRoom.type === '1-1' && ( <div className={`text-[12px] font-medium ${isPartnerOnline ? 'text-green-500' : 'text-gray-500'}`}> {isPartnerOnline ? t.online : "Ngoại tuyến"} </div> )}
                                        {activeRoom.type === 'group' && ( <div className={`text-[12px] font-medium ${theme==='dark'?'text-gray-400':'text-gray-500'}`}> {activeRoom.members?.length || 0} thành viên </div> )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-5 text-blue-500 mr-2 items-center">
                                    {activeRoom.type === '1-1' && (
                                        <>
                                            <Phone onClick={() => startCall(false)} className="cursor-pointer hover:text-blue-700 transition" size={24} />
                                            <Video onClick={() => startCall(true)} className="cursor-pointer hover:text-blue-700 transition" size={26} />
                                            <Info onClick={() => setShowInfoModal(true)} className="cursor-pointer text-gray-400 hover:text-blue-500 transition ml-2" size={26} />
                                        </>
                                    )}
                                    {activeRoom.type === 'group' && (
                                        <>
                                            {/* Nút Gọi Video Nhóm */}
                                            {!isKicked && <Video onClick={startGroupCall} className="cursor-pointer hover:text-blue-700 transition" size={26} title="Gọi Video Nhóm" />}
                                            <Info onClick={() => setShowGroupSettings(true)} className="cursor-pointer text-gray-400 hover:text-blue-500 transition ml-2" size={26} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* HIỂN THỊ BẢNG GHIM TIN NHẮN */}
                        {activeRoom.pinnedMessage && (
                            <div className="flex items-center justify-between bg-blue-50 p-3 border-b border-blue-100 shrink-0">
                                <div 
                                    className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80"
                                    onClick={() => scrollToMessage(activeRoom.pinnedMessage.id)}
                                >
                                    <Paperclip size={18} className="text-blue-600 shrink-0" />
                                    <div className="flex flex-col truncate">
                                        <span className="text-xs font-bold text-blue-700">Tin nhắn đã ghim</span>
                                        <span className="text-sm text-gray-700 truncate">
                                            <span className="font-semibold">{activeRoom.pinnedMessage.authorName}:</span> {activeRoom.pinnedMessage.text}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => api.post('/conversations/pin', { roomId: activeRoom.id, messageId: null })} className="text-gray-400 hover:text-red-500 p-1 shrink-0 font-bold">
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {isKicked && (
                            <div className="bg-red-50 text-red-600 text-center py-2 font-bold text-sm">
                                Bạn không còn là thành viên của nhóm này
                            </div>
                        )}
                        
                        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 relative">
                            <div className="flex justify-center my-2">
                                <span className={`text-xs px-4 py-1.5 rounded-full font-medium shadow-sm ${theme==='dark'?'bg-gray-800 text-gray-400':'bg-gray-200/80 text-gray-500'}`}>{t.today}</span>
                            </div>

                            {messages.map((msg, index) => {
                                const isMine = msg.authorId === user?.id;
                                if (msg.deletedFor && msg.deletedFor.includes(user?.id)) return null;
                                
                                // HIỂN THỊ TIN NHẮN HỆ THỐNG
                                if (msg.messageType === 'system') {
                                    return (
                                        <div key={msg.id || index} className="flex justify-center my-3">
                                            <span className="bg-gray-200/50 text-gray-500 text-[12px] px-4 py-1.5 rounded-full font-medium shadow-sm italic">
                                                {msg.text}
                                            </span>
                                        </div>
                                    );
                                }

                                const repliedMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
                                const renderMessageContent = () => {
                                    if (msg.isRecalled) return <span className="italic text-gray-400">Tin nhắn đã được thu hồi</span>;
                                    if (msg.messageType === 'call') { return ( <div className="flex items-center gap-3 py-1"> <div className={`p-2 rounded-full ${isMine ? 'bg-white/20' : 'bg-blue-100'}`}> <Phone size={16} className={isMine ? 'text-white' : 'text-blue-600'} /> </div> <span className="font-semibold text-[14px]">{msg.text}</span> </div> ); }
                                    let type = msg.messageType || 'text';
                                    if (!msg.messageType && msg.text && msg.text.startsWith('http')) {
                                        if (msg.text.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = 'image';
                                        else if (msg.text.match(/\.(mp4|webm|ogg)$/i)) type = 'video';
                                        else if (msg.text.match(/\.(mp3|wav|webm|ogg)$/i)) type = 'audio';
                                        else type = 'file';
                                    }
                                    const content = () => {
                                        if (type === 'image') return <img src={msg.text} alt="Ảnh" className="min-w-[200px] max-w-[350px] w-auto h-auto rounded-lg cursor-pointer hover:opacity-90 shadow-sm" onClick={() => window.open(msg.text, '_blank')} />;
                                        if (type === 'video') return <video src={msg.text} controls className="max-w-[280px] rounded-lg outline-none" />;
                                        if (type === 'audio') return <InlineAudioPlayer uri={msg.text} />;
                                        if (type === 'file') return ( <div className="flex items-center gap-3 bg-black/10 p-3 rounded-lg min-w-[220px]"> <FileText size={32} className={isMine ? "text-white" : "text-blue-500"} /> <div className="flex flex-col flex-1 overflow-hidden"> <span className="font-bold text-sm truncate max-w-[180px]" title={msg.fileName}>{msg.fileName || "Tài liệu đính kèm"}</span> <a href={msg.text} target="_blank" rel="noreferrer" className={`text-xs mt-1 hover:underline flex items-center gap-1 ${isMine ? 'text-blue-100' : 'text-blue-600'}`}><Download size={12}/> Tải xuống</a> </div> </div> );
                                        return <span>{msg.text}</span>;
                                    };
                                    return ( <div className="flex flex-col"> {repliedMsg && ( <div className={`mb-2 pl-3 border-l-4 py-1 text-xs rounded-r-md opacity-80 ${isMine ? 'border-blue-200 bg-black/10' : 'border-blue-500 bg-gray-100 text-gray-700'}`}> <div className="font-bold">{repliedMsg.authorName}</div> <div className="truncate max-w-[200px]">{repliedMsg.isRecalled ? "Tin nhắn đã thu hồi" : (repliedMsg.messageType !== 'text' ? "[Đính kèm]" : repliedMsg.text)}</div> </div> )} {content()} </div> );
                                };
                                return (
                                    <div key={msg.id || index} id={`msg-${msg.id}`} className={`group flex items-center relative rounded-xl ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        
                                        <div className={`hidden group-hover:flex items-center gap-1 mx-2 transition-all ${isMine ? 'order-1' : 'order-2'}`}>
                                            <button onClick={() => setReplyingTo(msg)} title="Trả lời" className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 shadow-sm"><CornerUpLeft size={14}/></button>
                                            <button onClick={() => { setForwardingMsg(msg); setShowForwardModal(true); }} title="Chuyển tiếp" className="p-1.5 bg-gray-100 hover:bg-blue-100 rounded-full text-gray-500 hover:text-blue-500 shadow-sm"><Forward size={14}/></button>
                                            <button onClick={() => handleDeleteForMe(msg.id)} title="Xóa phía tôi" className="p-1.5 bg-gray-100 hover:bg-red-100 rounded-full text-gray-500 hover:text-red-500 shadow-sm"><Trash2 size={14}/></button>
                                            {isMine && !msg.isRecalled && <button onClick={() => handleRecall(msg.id)} title="Thu hồi" className="p-1.5 bg-gray-100 hover:bg-orange-100 rounded-full text-gray-500 hover:text-orange-500 shadow-sm"><RotateCcw size={14}/></button>}
                                            <button onClick={() => api.post('/conversations/pin', { roomId: activeRoom.id, messageId: msg.id, messageText: msg.messageType==='text'? msg.text : '[Tệp đính kèm]', authorName: msg.authorName })} title="Ghim" className="p-1.5 bg-gray-100 hover:bg-green-100 rounded-full text-gray-500 hover:text-green-600 shadow-sm"><Paperclip size={14}/></button>
                                            
                                            <div className="relative inline-block group/emo">
                                                <button title="Thả cảm xúc" className="p-1.5 bg-gray-100 hover:bg-yellow-100 rounded-full text-gray-500 hover:text-yellow-600 shadow-sm"><Smile size={14}/></button>
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 pb-2 opacity-0 invisible group-hover/emo:opacity-100 group-hover/emo:visible transition-all z-[100]">
                                                    <div className="bg-white shadow-xl border border-gray-200 rounded-full p-1.5 flex gap-1">
                                                        {['👍', '❤️', '😂', '😮', '😥', '😡'].map(emo => (
                                                            <button key={emo} onClick={() => api.post('/messages/react', { messageId: msg.id, userId: user.id, reaction: emo, roomId: activeRoom.id })} className="hover:scale-125 transition-transform text-xl px-1">{emo}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex flex-col ${isMine ? 'items-end order-2' : 'items-start order-1'} max-w-[65%] relative`}>
                                            {!isMine && <span className={`text-[12px] mb-1 ml-1 font-medium ${theme==='dark'?'text-gray-400':'text-gray-500'}`}>{msg.authorName}</span>}
                                            <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] break-words relative ${msg.isRecalled ? (theme==='dark'?'bg-gray-800 text-gray-500':'bg-gray-100 text-gray-400 italic') : (isMine ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-[#e5efff] text-[#0068ff]') : (theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'))} ${isMine ? 'rounded-tr-none' : 'rounded-tl-none'}`}> 
                                                {renderMessageContent()} 
                                            </div>
                                            {/* HIỂN THỊ CẢM XÚC ĐÃ THẢ KIỂU XEM CHI TIẾT */}
                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div 
                                                    onClick={() => setReactionDetailMsg(msg)}
                                                    className={`absolute -bottom-3 ${isMine ? 'right-2' : 'left-2'} bg-white shadow-md rounded-full px-1.5 py-0.5 text-xs flex items-center border border-gray-200 z-10 cursor-pointer hover:bg-gray-50`}
                                                >
                                                    {Array.from(new Set(Object.values(msg.reactions))).join('')}
                                                    <span className="ml-1 text-gray-500 font-bold text-[10px]">
                                                        {Object.keys(msg.reactions).length > 1 ? Object.keys(msg.reactions).length : ''}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex items-center gap-1 text-[10px] mt-1 ${theme==='dark'?'text-gray-400':'text-gray-400'}`}>
                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                                {isMine && !msg.isRecalled && ( <> <span>•</span> <span className="flex items-center gap-0.5"> {msg.status === 'seen' ? <><CheckCheck size={12} className="text-blue-500"/> {t.seen}</> : <><Check size={12}/> {t.sent}</>} </span> </> )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* CHỈ HIỂN THỊ AI ĐÓ ĐANG GÕ TRONG ĐÚNG PHÒNG ĐÓ */}
                            {currentRoomTyping.length > 0 && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-2xl rounded-tl-none text-sm shadow-sm">
                                        <span className="italic">{currentRoomTyping.join(', ')} đang gõ...</span>
                                    </div>
                                </div>
                            )}

                            {isUploading && ( <div className="flex justify-end"> <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl rounded-tr-none shadow-sm"> <Loader2 size={16} className="animate-spin" /> <span className="text-sm font-medium">Đang xử lý...</span> </div> </div> )}
                            <div ref={scrollRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className={`border-t flex flex-col ${bgPanel}`}>
                            {replyingTo && ( <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 px-4 py-2 mx-4 mt-2 rounded-r-lg"> <div className="flex flex-col"> <span className="text-xs font-bold text-blue-600 truncate">Đang trả lời {replyingTo.authorName}</span> <span className="text-sm text-gray-600 truncate max-w-[250px]">{replyingTo.messageType !== 'text' ? "[Tệp đính kèm]" : replyingTo.text}</span> </div> <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-blue-100 rounded-full text-gray-500 hover:text-red-500"><X size={16}/></button> </div> )}
                            <div className={`flex items-center gap-2 px-4 py-2 border-b ${theme==='dark'?'border-gray-700 bg-gray-800':'border-gray-100 bg-gray-50'}`}>
                                <div className={toolbarIcon} onClick={() => { if(canSendMessage) setShowEmojiPicker(!showEmojiPicker) }}> <Smile size={22} strokeWidth={1.5}/> {showEmojiPicker && ( <div className="absolute bottom-12 left-0 z-50 shadow-2xl"> <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowEmojiPicker(false)}></div> <div className="relative z-50"> <EmojiPicker onEmojiClick={handleEmojiClick} theme={theme} lazyLoadEmojis={true} /> </div> </div> )} </div>
                                
                                <div className={toolbarIcon} onClick={() => { if(canSendMessage) imageInputRef.current.click() }}><ImageIcon size={22} strokeWidth={1.5}/>
                                    <input type="file" hidden ref={imageInputRef} accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'image')} />
                                </div>
                                <div className={toolbarIcon} onClick={() => { if(canSendMessage) videoInputRef.current.click() }}><Film size={22} strokeWidth={1.5}/>
                                    <input type="file" hidden ref={videoInputRef} accept="video/*" multiple onChange={(e) => handleFileUpload(e, 'video')} />
                                </div>
                                <div className={toolbarIcon} onClick={() => { if(canSendMessage) fileInputRef.current.click() }}><Paperclip size={22} strokeWidth={1.5}/>
                                    <input type="file" hidden ref={fileInputRef} accept="*" multiple onChange={(e) => handleFileUpload(e, 'file')} />
                                </div>

                                <div className={`${toolbarIcon} ${isRecording ? 'text-red-500' : ''}`} onClick={() => { if(canSendMessage) (isRecording ? cancelRecordingAction() : startRecording()) }}> <Mic size={22} strokeWidth={1.5}/> </div>
                            </div>
                            <div className="p-3 flex items-center gap-3">
                                {isRecording ? ( <div className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg border ${theme==='dark'?'bg-red-900/30 border-red-800 text-red-400':'bg-red-50 border-red-200 text-red-500'}`}> <div className="flex items-center gap-2 animate-pulse"> <div className="w-3 h-3 bg-red-500 rounded-full"></div> <span className="font-medium">Đang ghi âm... {formatTimeSeconds(recordingTime)}</span> </div> <div className="flex items-center gap-4"> <button type="button" onClick={cancelRecordingAction} className="hover:text-red-700 text-sm font-bold">Hủy</button> </div> </div> ) : ( <form onSubmit={handleSendMessage} className="flex-1 flex items-center"> 
                                    <input 
                                        type="text" 
                                        value={newMessage} 
                                        onChange={handleTyping} 
                                        placeholder={isUploading ? "Đang xử lý..." : inputPlaceholder} 
                                        disabled={!canSendMessage || isUploading} 
                                        className={`w-full px-4 py-3 text-[15px] outline-none transition-colors border border-transparent focus:border-blue-400 rounded-lg ${!canSendMessage ? 'bg-gray-100 cursor-not-allowed' : (theme==='dark'?'bg-gray-700 text-white placeholder-gray-400':'bg-white text-black')}`} 
                                    /> 
                                </form> )}
                                {isRecording ? ( <button type="button" onClick={stopAndSendRecording} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all flex shrink-0 shadow-md"> <Send size={20} /> </button> ) : ( <button type="submit" onClick={handleSendMessage} disabled={!canSendMessage || !newMessage.trim() || isUploading} className={`p-3 rounded-xl transition-all flex shrink-0 shadow-md ${!canSendMessage || !newMessage.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0068ff] text-white hover:bg-[#0054cc]'}`}> <Send size={20} /> </button> )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="flex flex-col items-center gap-4">
                            <MessageCircle size={64} className="text-gray-300" />
                            <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT CẢM XÚC */}
            {reactionDetailMsg && (
                <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setReactionDetailMsg(null)}>
                    <div className={`w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden ${bgPanel}`} onClick={e => e.stopPropagation()}>
                        <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                            <h2 className="text-[17px] font-bold">Biểu tượng cảm xúc</h2>
                            <button onClick={() => setReactionDetailMsg(null)} className="text-gray-500 hover:text-red-500 transition-colors"><X size={24}/></button>
                        </div>
                        <div className="p-2 max-h-[50vh] overflow-y-auto">
                            {Object.entries(reactionDetailMsg.reactions).map(([uid, emo]) => {
                                const u = getUserDetails(uid);
                                return (
                                    <div key={uid} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${hoverItem}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shrink-0 border border-gray-200">
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={40} className="text-gray-400"/>}
                                            </div>
                                            <span className="font-bold text-[15px]">{u.fullName} {uid === user.id && "(Bạn)"}</span>
                                        </div>
                                        <span className="text-2xl">{emo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÔNG TIN TÀI KHOẢN (1-1) */}
            {(() => {
                const partnerInfo = friends.find(f => f.user.id === partnerId)?.user || {};
                return showInfoModal && (
                    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                        <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col relative ${bgPanel}`}>
                            <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}> <h2 className="text-[17px] font-bold">Thông tin tài khoản</h2> <button onClick={() => setShowInfoModal(false)} className="text-gray-500 hover:text-red-500 transition-colors"> <X size={24}/> </button> </div>
                            <div className="p-5 flex flex-col">
                                <div className="w-16 h-16 bg-gray-200 rounded-full shadow-sm overflow-hidden mb-3"> {activeRoom.avatar ? <img src={activeRoom.avatar} alt="avatar" className="w-full h-full object-cover"/> : <UserCircle2 size={64} className="text-gray-400"/>} </div>
                                <div className="flex items-center gap-2 mb-4"> <h3 className="text-2xl font-bold">{activeRoom.name}</h3> {isPartnerOnline && <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1"></span>} </div>
                                <button onClick={() => setShowInfoModal(false)} className="w-full py-2.5 bg-[#e5efff] text-[#0068ff] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors mb-5"> <MessageCircle size={18}/> Nhắn tin </button>
                                <div className={`w-full h-1.5 -mx-5 px-5 mb-5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-[#f4f5f7]'}`}></div>
                                <h4 className="font-bold text-[16px] mb-4">Thông tin cá nhân</h4>
                                <div className="flex flex-col gap-4 text-[15px]">
                                    <div className="flex items-center"> <span className={`w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Giới tính</span> <span className="font-medium">{partnerInfo.gender || 'Nam'}</span> </div>
                                    <div className="flex items-center"> <span className={`w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ngày sinh</span> <span className="font-medium">{partnerInfo.dob ? new Date(partnerInfo.dob).toLocaleDateString('en-CA') : '2002-11-18'}</span> </div>
                                    <div className="flex items-start"> <span className={`w-24 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email</span> <span className="font-medium break-all">{partnerInfo.email || 'Chưa cập nhật'}</span> </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* MODAL QUẢN LÝ NHÓM (CHUẨN ZALO) */}
            {showGroupSettings && activeRoom.type === 'group' && (
                <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col ${bgPanel}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Thông tin nhóm</h2>
                            <button onClick={() => { setShowGroupSettings(false); setIsEditingGroupName(false); }} className="text-gray-500 hover:text-red-500"><X size={24}/></button>
                        </div>
                        
                        <div className="flex flex-col items-center mb-4">
                            {/* CHO PHÉP MỌI THÀNH VIÊN ĐỔI ẢNH NHÓM */}
                            <div className="relative group cursor-pointer mb-3" onClick={() => groupAvatarInputRef.current.click()}>
                                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                                    {activeRoom.avatar ? <img src={activeRoom.avatar} className="w-full h-full object-cover" alt="avatar"/> : <Users size={40} className="text-gray-400"/>}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center text-white">
                                    <CameraIcon size={20} />
                                </div>
                                <input type="file" hidden ref={groupAvatarInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'image', true)} />
                            </div>

                            {/* CHO PHÉP MỌI THÀNH VIÊN ĐỔI TÊN NHÓM */}
                            {isEditingGroupName ? (
                                <div className="flex gap-2 w-full">
                                    <input type="text" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="flex-1 p-2 border rounded-lg outline-none" autoFocus />
                                    <button onClick={() => handleUpdateGroupInfo(editGroupName, null)} className="p-2 bg-blue-600 text-white rounded-lg"><Check size={18}/></button>
                                    <button onClick={() => setIsEditingGroupName(false)} className="p-2 bg-gray-200 text-gray-600 rounded-lg"><X size={18}/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditGroupName(activeRoom.name); setIsEditingGroupName(true); }}>
                                    <h3 className="text-xl font-bold">{activeRoom.name}</h3>
                                    <Edit3 size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className={`h-1 w-full ${theme==='dark'?'bg-gray-700':'bg-gray-100'}`}></div>
                            
                            {/* CHẾ ĐỘ GỬI TIN NHẮN (RADIO BUTTONS) - CHỈ ADMIN */}
                            {isOwner && (
                                <div className="mb-4">
                                    <span className="font-bold text-sm block mb-2">Quyền gửi tin nhắn:</span>
                                    <div className="flex flex-col gap-2">
                                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${theme==='dark'?'hover:bg-gray-700 border-gray-600':'hover:bg-gray-50 border-gray-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="sendMode" 
                                                value="all_members" 
                                                checked={(activeRoom.sendMode || 'all_members') === 'all_members'} 
                                                onChange={(e) => handleUpdateSendMode(e.target.value)}
                                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                            />
                                            <span className="text-[14px] font-medium">Tất cả mọi người</span>
                                        </label>
                                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${theme==='dark'?'hover:bg-gray-700 border-gray-600':'hover:bg-gray-50 border-gray-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="sendMode" 
                                                value="leaders_only" 
                                                checked={activeRoom.sendMode === 'leaders_only'} 
                                                onChange={(e) => handleUpdateSendMode(e.target.value)}
                                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                            />
                                            <span className="text-[14px] font-medium">Chỉ Trưởng nhóm</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-500 text-xs uppercase">Thành viên ({activeRoom.members?.length || 0})</h3>
                                {/* TẤT CẢ MỌI NGƯỜI TRONG NHÓM ĐỀU CÓ QUYỀN THÊM THÀNH VIÊN */}
                                {!isKicked && (
                                    <button onClick={() => setShowAddMemberModal(true)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg flex items-center gap-1 text-sm font-medium"><UserPlus size={16}/> Thêm</button>
                                )}
                            </div>

                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                {activeRoom.members?.map(m => (
                                    <div key={m.id} className={`flex justify-between items-center p-2 rounded-lg ${theme==='dark'?'hover:bg-gray-700':'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" alt="avatar"/> : <UserCircle2 size={40} className="text-gray-400"/>}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[15px]">{m.fullName} {m.id === user?.id && "(Bạn)"}</span>
                                                {activeRoom.adminIds?.includes(m.id) && (
                                                    <span className="text-[11px] flex items-center gap-1 text-orange-500 font-bold"><Key size={10}/> Nhóm trưởng</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* CHỈ ADMIN MỚI ĐƯỢC XÓA NGƯỜI (KHÔNG ĐƯỢC TỰ XÓA MÌNH TẠI ĐÂY) */}
                                        {user?.id !== m.id && activeRoom.adminIds?.includes(user?.id) && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateGroupMember(m.id, 'remove')} title="Xóa khỏi nhóm" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><UserMinus size={16}/></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="h-1 w-full bg-gray-100 my-4"></div>

                            {!isKicked && (
                                <button onClick={handleLeaveGroup} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={20}/> <span className="font-bold">Rời nhóm</span></button>
                            )}

                            {activeRoom.adminIds?.includes(user?.id) && (
                                <button onClick={handleDisbandGroup} className="w-full flex items-center gap-3 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><ShieldAlert size={20}/> <span className="font-bold">Giải tán nhóm</span></button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CÁC MODALS CỤ THỂ */}
            <ConfirmModal 
                isOpen={confirmDialog.isOpen} 
                title={confirmDialog.title} 
                message={confirmDialog.message} 
                onConfirm={confirmDialog.onConfirm} 
                onClose={closeConfirm} 
                isAlert={confirmDialog.isAlert} 
                theme={theme} 
                bgPanel={bgPanel} 
            />

            {showAddMemberModal && (
                <CreateGroupModal 
                    friends={friends.filter(f => !activeRoom.members?.some(m => m.id === f.user.id))} 
                    theme={theme} bgPanel={bgPanel} mode='add'
                    onClose={() => setShowAddMemberModal(false)} 
                    onCreate={(dummyName, selectedIds) => handleUpdateGroupMember(null, 'add_members', selectedIds)} 
                />
            )}
            {showTransferOwnerModal && (
                <CreateGroupModal 
                    groupMembers={activeRoom.members?.filter(m => m.id !== user?.id)} 
                    theme={theme} bgPanel={bgPanel} mode='transfer'
                    onClose={() => setShowTransferOwnerModal(false)} 
                    onTransfer={handleTransferOwnership} 
                />
            )}
            {showCreateGroupModal && (
                <CreateGroupModal friends={friends} theme={theme} bgPanel={bgPanel} mode='create' onClose={() => setShowCreateGroupModal(false)} onCreate={handleCreateGroup} />
            )}

            {/* MODAL CHUYỂN TIẾP TIN NHẮN */}
            {showForwardModal && (
                <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
                    <div className={`w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden ${bgPanel}`}>
                        <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}> <h2 className="text-[17px] font-bold">Chuyển tiếp đến...</h2> <button onClick={() => { setShowForwardModal(false); setForwardingMsg(null); }} className="text-gray-400 hover:text-red-500 transition-colors"> <X size={24}/> </button> </div>
                        <div className="p-2 max-h-[60vh] overflow-y-auto">
                            {sortedConversations.map((conv) => ( <div key={conv.id} onClick={() => handleForwardMessage(conv.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${hoverItem}`}> <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0 border border-gray-200"> {conv.avatar ? <img src={conv.avatar} alt="avatar" className="w-full h-full object-cover"/> : (conv.type === 'group' ? <Users size={48} className="text-gray-400"/> : <UserCircle2 size={48} className="text-gray-400"/>)} </div> <span className="font-bold text-[15px] truncate">{conv.name}</span> </div> ))}
                            {sortedConversations.length === 0 && ( <div className="p-4 text-center text-gray-500 text-sm">Chưa có cuộc trò chuyện nào để chuyển tiếp.</div> )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;