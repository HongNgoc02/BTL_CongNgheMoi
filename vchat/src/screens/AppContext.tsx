import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react-native';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView } from 'react-native-webrtc';
import { SERVER_URL } from '../services/api';

const translations = {
    vi: { chat: "Tin nhắn", contact: "Danh bạ", settings: "Cài đặt", lang: "Ngôn ngữ: Tiếng Việt", theme: "Giao diện: Tối", save: "Lưu hồ sơ", logout: "Đăng xuất", email: "Email", password: "Mật khẩu", forgotPass: "Quên mật khẩu?", login: "Đăng nhập", noAccount: "Chưa có tài khoản?", register: "Đăng ký ngay", search: "Tìm kiếm...", addFriend: "Thêm bạn", online: "Trực tuyến", offline: "Ngoại tuyến", friendRequests: "Lời mời kết bạn", searchFriend: "Nhập email tìm bạn...", searchBtn: "Tìm", friends: "BẠN BÈ", pending: "CHỜ XÁC NHẬN", sent: "ĐÃ GỬI", emptyList: "Danh sách trống.", editProfile: "Chỉnh sửa hồ sơ", language: "Ngôn ngữ", darkMode: "Chế độ tối", vietnamese: "Tiếng Việt", english: "English", forgotPassword: "Quên mật khẩu", sendOtp: "Gửi mã OTP", resetPassword: "Đặt lại mật khẩu", otpCode: "Mã OTP", newPassword: "Mật khẩu mới", confirmNewPassword: "Xác nhận mật khẩu mới" },
    en: { chat: "Messages", contact: "Contacts", settings: "Settings", lang: "Language: English", theme: "Theme: Dark", save: "Save Profile", logout: "Logout", email: "Email", password: "Password", forgotPass: "Forgot Password?", login: "Login", noAccount: "Don't have an account?", register: "Register now", search: "Search...", addFriend: "Add Friend", online: "Online", offline: "Offline", friendRequests: "Friend Requests", searchFriend: "Enter email to search...", searchBtn: "Search", friends: "FRIENDS", pending: "PENDING", sent: "SENT", emptyList: "List is empty.", editProfile: "Edit Profile", language: "Language", darkMode: "Dark Mode", vietnamese: "Tiếng Việt", english: "English", forgotPassword: "Forgot Password", sendOtp: "Send OTP", resetPassword: "Reset Password", otpCode: "OTP Code", newPassword: "New Password", confirmNewPassword: "Confirm New Password" }
};

// Cấu hình STUN + TURN (OpenRelay free) để gọi được kể cả khi 2 máy khác mạng/NAT
const peerConstraints = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:openrelay.metered.ca:80' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
    ]
};

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
    const [isDark, setIsDark] = useState(false);
    const [lang, setLang] = useState('vi');
    const [user, setUser] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [socketObj, setSocketObj] = useState<any>(null);
    // ==========================================
    // STATE QUẢN LÝ WEBRTC (CUỘC GỌI)
    // ==========================================
    const [callState, setCallState] = useState<any>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const setCallStateTracked = (val: any) => {
        const resolved = typeof val === 'function' ? val(callStateRef.current) : val;
        callStateRef.current = resolved;
        setCallState(resolved);
    };
    
    // Luồng dữ liệu thực tế
    const [localStream, setLocalStream] = useState<any>(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    
    const pcRef = useRef<any>(null);
    const timerRef = useRef<any>(null);
    const callStateRef = useRef<any>(null);

    // ==========================================
    // STATE / REF QUẢN LÝ GỌI NHÓM (MESH)
    // ==========================================
    const [groupStreams, setGroupStreams] = useState<{ [id: string]: any }>({});        // userId -> MediaStream
    const [groupMediaState, setGroupMediaState] = useState<{ [id: string]: { audio?: boolean; video?: boolean } }>({});
    const [activeGroupCalls, setActiveGroupCalls] = useState<string[]>([]);
    const groupPeersRef = useRef<{ [id: string]: any }>({});   // userId -> RTCPeerConnection
    const localStreamRef = useRef<any>(null);                  // stream dùng chung cho mọi pc
    const userRef = useRef<any>(null);                         // user mới nhất, tránh stale closure trong listener

    useEffect(() => {
        const initGlobal = async () => {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedLang = await AsyncStorage.getItem('lang');
            if (savedTheme) setIsDark(savedTheme === 'dark');
            if (savedLang) setLang(savedLang);

            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const currUser = JSON.parse(userData);
                setUser(currUser);
                userRef.current = currUser;

                // THAY ĐỊA CHỈ IP WIFI CỦA BẠN VÀO ĐÂY
                socketRef.current = io(SERVER_URL, { transports: ['websocket'], reconnectionAttempts: 5 });

                setSocketObj(socketRef.current);

                socketRef.current.on('connect', () => {
                    socketRef.current?.emit('register_user', currUser.id);
                    socketRef.current?.emit('get_online_users');
                });

                socketRef.current.on('online_users_list', (list) => setOnlineUsers(list));
                socketRef.current.on('user_online', (uid) => setOnlineUsers(prev => [...new Set([...prev, uid])]));
                socketRef.current.on('user_offline', (uid) => setOnlineUsers(prev => prev.filter(id => id !== uid)));

                // ----------------------------------------
                // 1. NHẬN CUỘC GỌI TỚI
                // ----------------------------------------
                socketRef.current.on('incoming_call', ({ caller, isVideo }) => {
                    setCallStateTracked({ status: 'ringing', partner: caller, isVideo, isCaller: false });
                });

                // ----------------------------------------
                // 2. NGƯỜI KIA ĐÃ BẮT MÁY -> TẠO OFFER KẾT NỐI
                // ----------------------------------------
                socketRef.current.on('call_accepted', async () => {
                    setCallStateTracked((prev: any) => ({ ...prev, status: 'incall', startTime: Date.now() }));
                    startTimer();
                    await createOffer();
                });

                // ----------------------------------------
                // 3. XỬ LÝ TÍN HIỆU WEBRTC (OFFER, ANSWER, ICE) - dùng chung 1-1 & NHÓM
                // ----------------------------------------
                socketRef.current.on('webrtc_signal', async ({ signal, senderId, isGroup }: any) => {
                    if (!signal) return;

                    // a) Bật/tắt mic-cam của đối phương
                    if (signal.customType === 'media_toggle') {
                        if (isGroup) {
                            setGroupMediaState(prev => ({
                                ...prev,
                                [senderId]: { ...prev[senderId], [signal.media]: signal.isEnabled },
                            }));
                        }
                        return;
                    }

                    // b) Chọn đúng peer connection
                    let pc = isGroup ? groupPeersRef.current[senderId] : pcRef.current;
                    if (!pc && isGroup) {
                        pc = createGroupPeerConnection(senderId, false); // người mới nhận offer
                    }
                    if (!pc) return;

                    // c) Offer / Answer / ICE candidate
                    if (signal.type === 'offer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        const target = isGroup ? senderId : callStateRef.current?.partner?.id;
                        socketRef.current?.emit('webrtc_signal', { targetId: target, senderId: userRef.current?.id, signal: answer, isGroup: !!isGroup });
                    } else if (signal.type === 'answer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal));
                    } else if (signal.candidate) {
                        await pc.addIceCandidate(new RTCIceCandidate(signal));
                    }
                });

                socketRef.current.on('call_status', ({ status }: any) => {
                    if (status === 'failed' || status === 'busy' || status === 'rejected') {
                        cleanupCall();
                    }
                });

                socketRef.current.on('call_ended', () => { cleanupCall(); });

                // ----------------------------------------
                // 4. CUỘC GỌI NHÓM (MESH)
                // ----------------------------------------
                // Được mời vào cuộc gọi nhóm
                socketRef.current.on('incoming_group_call', ({ roomId, caller, roomName }: any) => {
                    if (callStateRef.current) return; // đang bận thì bỏ qua
                    setCallStateTracked({ status: 'group-ringing', isGroup: true, roomId, name: roomName, caller, isVideo: true });
                });

                // Có người mới vào -> mình (đang trong phòng) chủ động tạo offer tới họ
                socketRef.current.on('user_joined_group_call', (newUser: any) => {
                    if (callStateRef.current?.status === 'in-group-call' && newUser?.id && newUser.id !== userRef.current?.id) {
                        createGroupPeerConnection(newUser.id, true);
                    }
                });

                // Có người rời cuộc gọi
                socketRef.current.on('user_left_group_call', (userIdLeave: any) => {
                    const pc = groupPeersRef.current[userIdLeave];
                    if (pc) { pc.close(); delete groupPeersRef.current[userIdLeave]; }
                    setGroupStreams(prev => { const n = { ...prev }; delete n[userIdLeave]; return n; });
                    setGroupMediaState(prev => { const n = { ...prev }; delete n[userIdLeave]; return n; });
                });

                // Danh sách phòng đang có cuộc gọi
                socketRef.current.on('active_group_calls', (calls: any) => setActiveGroupCalls(calls || []));
            }
        };
        initGlobal();
        return () => { socketRef.current?.disconnect(); cleanupCall(); };
    }, []);

    // Luôn giữ userRef mới nhất để listener (đăng ký 1 lần) không bị stale
    useEffect(() => { userRef.current = user; }, [user]);

    const startTimer = () => { setCallDuration(0); timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000); };
    const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); setCallDuration(0); };

    // ==========================================
    // KHỞI TẠO WEBRTC VÀ XIN QUYỀN THIẾT BỊ
    // ==========================================
    const setupWebrtc = async (isVideoCall: boolean) => {
        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: isVideoCall ? { facingMode: 'user' } : false,
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            const pc = new RTCPeerConnection(peerConstraints);
            pcRef.current = pc;

            stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

            (pc as any).addEventListener('track', (event: any) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                }
            });

            (pc as any).addEventListener('icecandidate', (event: any) => {
                if (event.candidate) {
                    socketRef.current?.emit('webrtc_signal', {
                        targetId: callStateRef.current?.partner?.id,
                        senderId: user.id,
                        signal: event.candidate,
                        isGroup: false,
                    });
                }
            });
        } catch (e) {
            console.warn('setupWebrtc error:', e);
        }
    };

    // Tạo lời mời (Offer) gửi cho người nghe
    const createOffer = async () => {
        if (!pcRef.current) return;
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_signal', { targetId: callStateRef.current?.partner?.id, senderId: user.id, signal: offer, isGroup: false });
    };

    // ==========================================
    // GỌI NHÓM (MESH)
    // ==========================================
    // Lấy media dùng chung cho mọi peer trong nhóm
    const getLocalMedia = async (isVideo = true) => {
        if (localStreamRef.current) return localStreamRef.current;
        const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: isVideo ? { facingMode: 'user' } : false,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
    };

    // Tạo 1 peer connection tới 1 thành viên trong nhóm
    const createGroupPeerConnection = (partnerId: string, isInitiator: boolean) => {
        const pc = new RTCPeerConnection(peerConstraints);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: any) => pc.addTrack(track, localStreamRef.current));
        }
        (pc as any).addEventListener('track', (event: any) => {
            if (event.streams && event.streams[0]) {
                setGroupStreams(prev => ({ ...prev, [partnerId]: event.streams[0] }));
            }
        });
        (pc as any).addEventListener('icecandidate', (event: any) => {
            if (event.candidate) {
                socketRef.current?.emit('webrtc_signal', {
                    targetId: partnerId,
                    senderId: userRef.current?.id,
                    signal: event.candidate,
                    isGroup: true,
                });
            }
        });
        groupPeersRef.current[partnerId] = pc;
        if (isInitiator) {
            (async () => {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socketRef.current?.emit('webrtc_signal', { targetId: partnerId, senderId: userRef.current?.id, signal: offer, isGroup: true });
                } catch (e) { console.warn('createGroupPeerConnection offer error:', e); }
            })();
        }
        return pc;
    };

    // Bắt đầu cuộc gọi nhóm (người khởi xướng)
    const startGroupCall = async (roomId: string, roomName: string) => {
        if (callStateRef.current) return; // chặn double
        setCallStateTracked({ status: 'in-group-call', isGroup: true, roomId, name: roomName, isVideo: true, startTime: Date.now() });
        try {
            await getLocalMedia(true);
            socketRef.current?.emit('start_group_call', { roomId, caller: userRef.current, roomName });
            socketRef.current?.emit('join_group_call', { roomId, user: userRef.current });
            startTimer();
        } catch (e) {
            console.warn('startGroupCall error:', e);
            cleanupCall();
        }
    };

    // Tham gia cuộc gọi nhóm (người được mời / vào sau)
    const joinGroupCall = async (roomId: string, roomName: string) => {
        if (callStateRef.current?.status === 'in-group-call') return;
        setCallStateTracked({ status: 'in-group-call', isGroup: true, roomId, name: roomName, isVideo: true, startTime: Date.now() });
        try {
            await getLocalMedia(true);
            socketRef.current?.emit('join_group_call', { roomId, user: userRef.current });
            startTimer();
        } catch (e) {
            console.warn('joinGroupCall error:', e);
            cleanupCall();
        }
    };

    // Rời cuộc gọi nhóm
    const endGroupCall = () => {
        const cs = callStateRef.current;
        if (cs?.roomId) {
            socketRef.current?.emit('leave_group_call', { roomId: cs.roomId, userId: userRef.current?.id });
        }
        cleanupCall();
    };

    const startCall = async (receiverId: string, receiverName: string, isVideo: boolean) => {
        setCallStateTracked({ status: 'calling', partner: { id: receiverId, fullName: receiverName }, isVideo, isCaller: true });
        await setupWebrtc(isVideo);
        socketRef.current?.emit('request_call', { caller: user, receiverId, isVideo });
    };

    const acceptCall = async () => {
        // Khởi tạo WebRTC TRƯỚC để pcRef sẵn sàng nhận offer, tránh race condition
        await setupWebrtc(callStateRef.current.isVideo);
        setCallStateTracked((prev: any) => ({ ...prev, status: 'incall', startTime: Date.now() }));
        startTimer();
        // Báo cho người gọi biết đã bắt máy -> họ sẽ tạo offer
        socketRef.current?.emit('accept_call', { callerId: callStateRef.current.partner.id, receiverId: user.id });
    };

    const cleanupCall = () => {
        if (localStream) {
            localStream.getTracks().forEach((track: any) => track.stop());
            setLocalStream(null);
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: any) => track.stop());
            localStreamRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        // Dọn dẹp toàn bộ peer của cuộc gọi nhóm
        Object.values(groupPeersRef.current).forEach((pc: any) => { try { pc.close(); } catch {} });
        groupPeersRef.current = {};
        setGroupStreams({});
        setGroupMediaState({});
        setRemoteStream(null);
        setCallStateTracked(null);
        stopTimer();
        setIsMuted(false);
        setIsVideoOff(false);
    };

    const endCall = () => {
        const cs = callStateRef.current;
        if (!cs) return;
        const duration = cs.startTime ? Math.floor((Date.now() - cs.startTime) / 1000) : 0;
        const roomId = `1-1_${[user.id, cs.partner.id].sort().join('_')}`;

        socketRef.current?.emit('end_call', {
            callerId: cs.isCaller ? user.id : cs.partner.id,
            receiverId: cs.isCaller ? cs.partner.id : user.id,
            callData: {
                callerId: cs.isCaller ? user.id : cs.partner.id,
                receiverId: cs.isCaller ? cs.partner.id : user.id,
                startTime: new Date(cs.startTime || Date.now()).toISOString(),
                duration, status: cs.startTime ? 'completed' : 'missed'
            }
        });

        socketRef.current?.emit('send_message', { roomId, senderId: user.id, senderName: user.fullName, text: `Cuộc gọi ${cs.isVideo ? 'Video' : 'Thoại'} ${cs.startTime ? `(${formatTime(duration)})` : 'Nhỡ'}`, messageType: 'call' });
        cleanupCall();
    };

    const toggleMute = () => {
        const stream = localStreamRef.current || localStream;
        if (!stream) return;
        const newEnabled = isMuted; // đang mute -> bật lại; đang bật -> tắt
        stream.getAudioTracks().forEach((track: any) => track.enabled = newEnabled);
        setIsMuted(!isMuted);
        const payload = { customType: 'media_toggle', media: 'audio', isEnabled: newEnabled };
        if (callStateRef.current?.isGroup) {
            Object.keys(groupPeersRef.current).forEach((peerId) => {
                socketRef.current?.emit('webrtc_signal', { targetId: peerId, senderId: userRef.current?.id, signal: payload, isGroup: true });
            });
        } else {
            socketRef.current?.emit('webrtc_signal', { targetId: callStateRef.current?.partner?.id, senderId: userRef.current?.id, signal: payload, isGroup: false });
        }
    };

    const toggleVideo = () => {
        const stream = localStreamRef.current || localStream;
        if (!stream) return;
        const newEnabled = isVideoOff; // đang tắt cam -> bật lại; đang bật -> tắt
        stream.getVideoTracks().forEach((track: any) => track.enabled = newEnabled);
        setIsVideoOff(!isVideoOff);
        const payload = { customType: 'media_toggle', media: 'video', isEnabled: newEnabled };
        if (callStateRef.current?.isGroup) {
            Object.keys(groupPeersRef.current).forEach((peerId) => {
                socketRef.current?.emit('webrtc_signal', { targetId: peerId, senderId: userRef.current?.id, signal: payload, isGroup: true });
            });
        } else {
            socketRef.current?.emit('webrtc_signal', { targetId: callStateRef.current?.partner?.id, senderId: userRef.current?.id, signal: payload, isGroup: false });
        }
    };

    const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}:${s.toString().padStart(2, '0')}`; };
    const toggleTheme = () => { setIsDark(!isDark); AsyncStorage.setItem('theme', !isDark ? 'dark' : 'light'); };
    const changeLanguage = (val: string) => { setLang(val); AsyncStorage.setItem('lang', val); };
    const t = (key: string) => (translations as any)[lang][key] || key;

    // Cập nhật user trong context + AsyncStorage (dùng cho ghim, đổi avatar...)
    const updateUser = async (patch: any) => {
        setUser((prev: any) => {
            const merged = { ...(prev || {}), ...patch };
            AsyncStorage.setItem('user', JSON.stringify(merged));
            return merged;
        });
    };

    return (
        <AppContext.Provider value={{ isDark, toggleTheme, lang, changeLanguage, t, user, updateUser, onlineUsers, socket: socketObj, startCall, startGroupCall, joinGroupCall, endGroupCall, activeGroupCalls, groupStreams, groupMediaState }}>
            {children}

            {callState && (
                <Modal animationType="slide" transparent={false} visible={!!callState}>
                    <View style={styles.callContainer}>

                      {callState.isGroup ? (
                        <>
                          {callState.status === 'group-ringing' ? (
                            <View style={styles.avatarWrap}>
                                <View style={styles.pulseCircle} />
                                <View style={[styles.callAvatar, { backgroundColor: '#0068ff', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ fontSize: 60, color: '#fff' }}>{(callState.name || '#').charAt(0)}</Text>
                                </View>
                            </View>
                          ) : (
                            <ScrollView contentContainerStyle={styles.groupGrid}>
                                {/* Ô của mình */}
                                <View style={styles.groupTile}>
                                    {!isVideoOff && localStream ? (
                                        <RTCView streamURL={localStream.toURL()} style={styles.groupVideo} objectFit="cover" mirror />
                                    ) : (
                                        <View style={styles.groupVideoOff}><Text style={styles.tileLabel}>Camera tắt</Text></View>
                                    )}
                                    <Text style={styles.tileName}>Bạn</Text>
                                </View>
                                {/* Ô của các thành viên khác */}
                                {Object.entries(groupStreams).map(([peerId, stream]: any) => (
                                    <View key={peerId} style={styles.groupTile}>
                                        {groupMediaState[peerId]?.video === false ? (
                                            <View style={styles.groupVideoOff}><Text style={styles.tileLabel}>Camera tắt</Text></View>
                                        ) : (
                                            <RTCView streamURL={stream.toURL()} style={styles.groupVideo} objectFit="cover" />
                                        )}
                                        <Text style={styles.tileName}>Thành viên</Text>
                                        {groupMediaState[peerId]?.audio === false && <MicOff size={16} color="#fff" style={styles.tileMutedIcon} />}
                                    </View>
                                ))}
                            </ScrollView>
                          )}

                          <View style={styles.callHeaderOverlay}>
                              <Text style={styles.callName}>{callState.name}</Text>
                              <Text style={styles.callStatus}>
                                  {callState.status === 'group-ringing'
                                      ? `${callState.caller?.fullName || 'Ai đó'} mời bạn vào cuộc gọi nhóm…`
                                      : formatTime(callDuration)}
                              </Text>
                          </View>

                          <View style={styles.callActions}>
                              {callState.status === 'in-group-call' && (
                                  <>
                                      <TouchableOpacity style={[styles.actionBtn, isMuted && { backgroundColor: '#fff' }]} onPress={toggleMute}>
                                          {isMuted ? <MicOff size={30} color="#000" /> : <Mic size={30} color="#fff" />}
                                      </TouchableOpacity>
                                      <TouchableOpacity style={[styles.actionBtn, isVideoOff && { backgroundColor: '#fff' }]} onPress={toggleVideo}>
                                          {isVideoOff ? <VideoOff size={30} color="#000" /> : <VideoIcon size={30} color="#fff" />}
                                      </TouchableOpacity>
                                  </>
                              )}
                              {callState.status === 'group-ringing' && (
                                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4cd137', width: 70, height: 70, borderRadius: 35 }]} onPress={() => joinGroupCall(callState.roomId, callState.name)}>
                                      <Phone size={35} color="#fff" />
                                  </TouchableOpacity>
                              )}
                              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff3b30', width: 70, height: 70, borderRadius: 35 }]} onPress={endGroupCall}>
                                  <PhoneOff size={35} color="#fff" />
                              </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <>
                        {/* HIỂN THỊ ĐỐI PHƯƠNG */}
                        {callState.isVideo && remoteStream ? (
                            <RTCView
                                streamURL={remoteStream.toURL()}
                                style={styles.remoteVideo}
                                objectFit="cover"
                            />
                        ) : (
                            <View style={styles.avatarWrap}>
                                {callState.status !== 'incall' && <View style={styles.pulseCircle} />}
                                <View style={[styles.callAvatar, { backgroundColor: '#0068ff', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{fontSize: 60, color: '#fff'}}>{callState.partner.fullName.charAt(0)}</Text>
                                </View>
                            </View>
                        )}

                        {/* CAMERA CỦA MÌNH (góc nhỏ) */}
                        {callState.isVideo && localStream && (
                            <RTCView
                                streamURL={localStream.toURL()}
                                style={styles.localVideo}
                                objectFit="cover"
                                mirror
                            />
                        )}

                        {/* OVERLAY THÔNG TIN TRÊN CÙNG */}
                        <View style={styles.callHeaderOverlay}>
                            <Text style={styles.callName}>{callState.partner.fullName}</Text>
                            <Text style={styles.callStatus}>
                                {callState.status === 'ringing' ? (callState.isCaller ? 'Đang gọi...' : 'Đang đổ chuông...') 
                                 : callState.status === 'calling' ? 'Đang kết nối...' 
                                 : formatTime(callDuration)}
                            </Text>
                        </View>

                        {/* THANH CÔNG CỤ */}
                        <View style={styles.callActions}>
                            {callState.status === 'incall' && (
                                <>
                                    <TouchableOpacity style={[styles.actionBtn, isMuted && { backgroundColor: '#fff' }]} onPress={toggleMute}>
                                        {isMuted ? <MicOff size={30} color="#000" /> : <Mic size={30} color="#fff" />}
                                    </TouchableOpacity>
                                    {callState.isVideo && (
                                        <TouchableOpacity style={[styles.actionBtn, isVideoOff && { backgroundColor: '#fff' }]} onPress={toggleVideo}>
                                            {isVideoOff ? <VideoOff size={30} color="#000" /> : <VideoIcon size={30} color="#fff" />}
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                            
                            {callState.status === 'ringing' && !callState.isCaller && (
                                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4cd137', width: 70, height: 70, borderRadius: 35 }]} onPress={acceptCall}>
                                    <Phone size={35} color="#fff" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff3b30', width: 70, height: 70, borderRadius: 35 }]} onPress={endCall}>
                                <PhoneOff size={35} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        </>
                      )}
                    </View>
                </Modal>
            )}
        </AppContext.Provider>
    );
};

const styles = StyleSheet.create({
    callContainer: { flex: 1, backgroundColor: '#1e1e1e', justifyContent: 'center', alignItems: 'center' },
    callHeaderOverlay: { position: 'absolute', top: 60, width: '100%', alignItems: 'center', zIndex: 10 },
    callName: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
    callStatus: { fontSize: 18, color: '#ddd' },
    avatarWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pulseCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(0,104,255,0.2)' },
    callAvatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#0068ff' },
    callActions: { position: 'absolute', bottom: 50, flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 30, zIndex: 10 },
    actionBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    
    // Giao diện RTC (Camera)
    remoteVideo: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#333' },
    localVideo: { position: 'absolute', bottom: 140, right: 20, width: 100, height: 150, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#fff', backgroundColor: '#555' },

    // Giao diện gọi NHÓM (lưới)
    groupGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', paddingTop: 110, paddingBottom: 130, width: '100%' },
    groupTile: { width: '46%', aspectRatio: 3 / 4, margin: '2%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', borderWidth: 1, borderColor: '#444' },
    groupVideo: { width: '100%', height: '100%' },
    groupVideoOff: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c2c2e' },
    tileName: { position: 'absolute', bottom: 6, left: 6, color: '#fff', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    tileLabel: { color: '#aaa', fontSize: 13 },
    tileMutedIcon: { position: 'absolute', top: 6, right: 6 }
});

export const useApp = () => useContext(AppContext);