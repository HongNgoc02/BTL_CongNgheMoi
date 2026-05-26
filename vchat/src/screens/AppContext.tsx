import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react-native';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView } from 'react-native-webrtc';

const translations = {
    vi: { chat: "Tin nhắn", contact: "Danh bạ", settings: "Cài đặt", lang: "Ngôn ngữ: Tiếng Việt", theme: "Giao diện: Tối", save: "Lưu hồ sơ", logout: "Đăng xuất", email: "Email", password: "Mật khẩu", forgotPass: "Quên mật khẩu?", login: "Đăng nhập", noAccount: "Chưa có tài khoản?", register: "Đăng ký ngay", search: "Tìm kiếm...", addFriend: "Thêm bạn", online: "Trực tuyến", offline: "Ngoại tuyến", friendRequests: "Lời mời kết bạn", searchFriend: "Nhập email tìm bạn...", searchBtn: "Tìm", friends: "BẠN BÈ", pending: "CHỜ XÁC NHẬN", sent: "ĐÃ GỬI", emptyList: "Danh sách trống.", editProfile: "Chỉnh sửa hồ sơ", language: "Ngôn ngữ", darkMode: "Chế độ tối", vietnamese: "Tiếng Việt", english: "English", forgotPassword: "Quên mật khẩu", sendOtp: "Gửi mã OTP", resetPassword: "Đặt lại mật khẩu", otpCode: "Mã OTP", newPassword: "Mật khẩu mới", confirmNewPassword: "Xác nhận mật khẩu mới" },
    en: { chat: "Messages", contact: "Contacts", settings: "Settings", lang: "Language: English", theme: "Theme: Dark", save: "Save Profile", logout: "Logout", email: "Email", password: "Password", forgotPass: "Forgot Password?", login: "Login", noAccount: "Don't have an account?", register: "Register now", search: "Search...", addFriend: "Add Friend", online: "Online", offline: "Offline", friendRequests: "Friend Requests", searchFriend: "Enter email to search...", searchBtn: "Search", friends: "FRIENDS", pending: "PENDING", sent: "SENT", emptyList: "List is empty.", editProfile: "Edit Profile", language: "Language", darkMode: "Dark Mode", vietnamese: "Tiếng Việt", english: "English", forgotPassword: "Forgot Password", sendOtp: "Send OTP", resetPassword: "Reset Password", otpCode: "OTP Code", newPassword: "New Password", confirmNewPassword: "Confirm New Password" }
};

// Cấu hình máy chủ trung gian STUN
const peerConstraints = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
    const [isDark, setIsDark] = useState(false);
    const [lang, setLang] = useState('vi');
    const [user, setUser] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);

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

                // THAY ĐỊA CHỈ IP WIFI CỦA BẠN VÀO ĐÂY
                socketRef.current = io('http://10.71.29.137:5000', { transports: ['websocket'], reconnectionAttempts: 5 });

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
                // 3. XỬ LÝ TÍN HIỆU WEBRTC (OFFER, ANSWER, ICE)
                // ----------------------------------------
                socketRef.current.on('webrtc_signal', async (signal: any) => {
                    if (!pcRef.current) return;
                    if (signal.type === 'offer') {
                        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                        const answer = await pcRef.current.createAnswer();
                        await pcRef.current.setLocalDescription(answer);
                        socketRef.current?.emit('webrtc_signal', { targetId: callStateRef.current?.partner?.id, signal: answer });
                    } else if (signal.type === 'answer') {
                        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                    } else if (signal.candidate) {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    }
                });

                socketRef.current.on('call_status', ({ status }: any) => {
                    if (status === 'failed' || status === 'busy' || status === 'rejected') {
                        cleanupCall();
                    }
                });

                socketRef.current.on('call_ended', () => { cleanupCall(); });
            }
        };
        initGlobal();
        return () => { socketRef.current?.disconnect(); cleanupCall(); };
    }, []);

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

            const pc = new RTCPeerConnection(peerConstraints);
            pcRef.current = pc;

            stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

            pc.ontrack = (event: any) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                }
            };

            pc.onicecandidate = (event: any) => {
                if (event.candidate) {
                    socketRef.current?.emit('webrtc_signal', {
                        targetId: callStateRef.current?.partner?.id,
                        signal: { candidate: event.candidate },
                    });
                }
            };
        } catch (e) {
            console.warn('setupWebrtc error:', e);
        }
    };

    // Tạo lời mời (Offer) gửi cho người nghe
    const createOffer = async () => {
        if (!pcRef.current) return;
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_signal', { targetId: callStateRef.current?.partner?.id, signal: offer });
    };

    const startCall = async (receiverId: string, receiverName: string, isVideo: boolean) => {
        setCallStateTracked({ status: 'calling', partner: { id: receiverId, fullName: receiverName }, isVideo, isCaller: true });
        await setupWebrtc(isVideo);
        socketRef.current?.emit('request_call', { caller: user, receiverId, isVideo });
    };

    const acceptCall = async () => {
        socketRef.current?.emit('accept_call', { callerId: callStateRef.current.partner.id, receiverId: user.id });
        setCallStateTracked((prev: any) => ({ ...prev, status: 'incall', startTime: Date.now() }));
        startTimer();
        await setupWebrtc(callStateRef.current.isVideo);
    };

    const cleanupCall = () => {
        if (localStream) {
            localStream.getTracks().forEach((track: any) => track.stop());
            setLocalStream(null);
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
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
        if (localStream) {
            localStream.getAudioTracks().forEach((track: any) => track.enabled = isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track: any) => track.enabled = isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}:${s.toString().padStart(2, '0')}`; };
    const toggleTheme = () => { setIsDark(!isDark); AsyncStorage.setItem('theme', !isDark ? 'dark' : 'light'); };
    const changeLanguage = (val: string) => { setLang(val); AsyncStorage.setItem('lang', val); };
    const t = (key: string) => (translations as any)[lang][key] || key;

    return (
        <AppContext.Provider value={{ isDark, toggleTheme, lang, changeLanguage, t, user, onlineUsers, socket: socketRef.current, startCall }}>
            {children}

            {callState && (
                <Modal animationType="slide" transparent={false} visible={!!callState}>
                    <View style={styles.callContainer}>
                        
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
    localVideo: { position: 'absolute', bottom: 140, right: 20, width: 100, height: 150, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#fff', backgroundColor: '#555' }
});

export const useApp = () => useContext(AppContext);