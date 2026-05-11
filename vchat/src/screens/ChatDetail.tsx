import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, 
    KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Linking, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ChevronLeft, Check, CheckCheck, X, CornerDownRight, Play, Square, FileText,
    MoreHorizontal, Reply, Trash2, Phone, Video as VideoIcon, Send, Mic, Info, Forward, Image as ImageIcon,
    Smile, Pin
} from 'lucide-react-native';

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio, Video, ResizeMode } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import EmojiPicker from 'rn-emoji-keyboard';
import { useApp } from './AppContext';
import api from '../services/api';

// =====================================
// FORMAT THỜI GIAN
// =====================================
const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const formatMessageTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// =====================================
// FORM XÁC NHẬN "XỊN SÒ"
// =====================================
const CustomConfirmModal = ({ visible, title, message, onConfirm, onCancel, isAlertOnly, isDark, isDestructive }: any) => (
    <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.alertOverlay}>
            <View style={[styles.alertBox, isDark && { backgroundColor: '#242526' }]}>
                <Text style={[styles.alertTitle, isDark && { color: '#fff' }]}>{title}</Text>
                <Text style={[styles.alertMessage, isDark && { color: '#ccc' }]}>{message}</Text>
                <View style={styles.alertBtnRow}>
                    {!isAlertOnly && (
                        <TouchableOpacity style={styles.alertBtnCancel} onPress={onCancel}>
                            <Text style={styles.alertBtnCancelTxt}>HỦY</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.alertBtnConfirm, isDestructive && { backgroundColor: '#ff3b30' }]} onPress={onConfirm}>
                        <Text style={styles.alertBtnConfirmTxt}>{isAlertOnly ? 'ĐÃ HIỂU' : 'XÁC NHẬN'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

// =====================================
// TRÌNH PHÁT GHI ÂM (VOICE MESSAGE)
// =====================================
const InlineAudioPlayer = ({ uri, isMine }: { uri: string, isMine: boolean }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState("0:00");
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused && isPlaying && sound) {
            sound.pauseAsync();
            setIsPlaying(false);
        }
    }, [isFocused]);

    useEffect(() => {
        let isMounted = true;
        let currentSound: Audio.Sound | null = null; 

        const loadAudio = async () => {
            try {
                const { sound: newSound, status } = await Audio.Sound.createAsync(
                    { uri }, { shouldPlay: false, isLooping: false } 
                );
                if (isMounted) {
                    currentSound = newSound;
                    setSound(newSound);
                    if (status.isLoaded && status.durationMillis) {
                        setDuration(formatTime(status.durationMillis));
                    }
                    newSound.setOnPlaybackStatusUpdate((playbackStatus: any) => {
                        if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
                            setIsPlaying(false);            
                            newSound.setPositionAsync(0);
                        }
                    });
                } else {
                    newSound.unloadAsync();
                }
            } catch (e) { console.log("Lỗi load Audio:", e); }
        };
        loadAudio();

        return () => { 
            isMounted = false;
            if (currentSound) {
                currentSound.stopAsync().catch(() => {});
                currentSound.unloadAsync().catch(() => {});
            }
        };
    }, [uri]);

    const togglePlay = async () => {
        if (!sound) return;
        if (isPlaying) { 
            await sound.pauseAsync(); 
            setIsPlaying(false);
        } else {
            await sound.playAsync(); 
            setIsPlaying(true);
        }
    };

    return (
        <TouchableOpacity style={styles.mediaBox} onPress={togglePlay}>
            {isPlaying ? <Square size={24} color={isMine ? "#fff" : "#0068ff"} /> : <Play size={24} color={isMine ? "#fff" : "#0068ff"} />}
            <Text style={{color: isMine ? '#fff' : '#0068ff', marginLeft: 10, fontWeight: '500'}}>
                {isPlaying ? "Đang phát..." : `Thoại (${duration})`}
            </Text>
        </TouchableOpacity>
    );
};

// =====================================
// ITEM BONG BÓNG TIN NHẮN (CẬP NHẬT HIỂN THỊ TÊN)
// =====================================
const MessageItem = React.memo(({ item, isMine, isDark, isGroup, onLongPress, onPress, onReactionPress }: any) => {
    const textStr = item.text || "";
    const isVideo = item.messageType === 'video' || textStr.match(/\.(mp4|mov|avi)$/i);
    const isAudio = item.messageType === 'audio' || textStr.match(/\.(webm|m4a|mp3)$/i);
    const isFile = item.messageType === 'file' || textStr.match(/\.(pdf|doc|docx|zip|rar)$/i);
    const isImage = item.messageType === 'image' || (!isVideo && !isAudio && !isFile && textStr.match(/\.(jpeg|jpg|gif|png)$/i));

    if (item.deletedFor && item.deletedFor.includes(isMine ? item.authorId : null)) return null;

    if (item.messageType === 'system') {
        return (
            <View style={styles.sysMsgContainer}>
                <Text style={styles.sysMsgText}>{item.text}</Text>
            </View>
        );
    }

    // Nếu tin nhắn bị thu hồi
    if (item.isRecalled) {
        return (
            <View style={[styles.msgWrapper, isMine ? styles.myMsg : styles.theirMsg]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    {!isMine && <Image source={{ uri: item.authorAvatar || 'https://via.placeholder.com/150' }} style={styles.miniAvatar} />}
                    <View style={[styles.bubble, isDark ? { backgroundColor: '#333' } : { backgroundColor: '#e4e6eb' }]}>
                        <Text style={{ color: '#888', fontStyle: 'italic' }}>Tin nhắn đã bị thu hồi</Text>
                        <Text style={[styles.msgTime, { color: '#aaa', marginTop: 4, textAlign: 'right' }]}>{formatMessageTime(item.createdAt)}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.msgWrapper, isMine ? styles.myMsg : styles.theirMsg]}>
            
            {/* ĐÃ SỬA LỖI: HIỂN THỊ TÊN NGƯỜI GỬI TRONG NHÓM */}
            {(!isMine && isGroup) && (
                <Text style={styles.msgAuthorName}>{item.authorName || item.senderName || 'Ẩn danh'}</Text>
            )}
            
            {/* Hàng ngang chứa Avatar và Bong bóng chat */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                
                {/* AVATAR NGƯỜI GỬI */}
                {!isMine && <Image source={{ uri: item.authorAvatar || 'https://via.placeholder.com/150' }} style={styles.miniAvatar} />}
                
                {/* NỘI DUNG TIN NHẮN */}
                <TouchableOpacity activeOpacity={0.9} onLongPress={() => onLongPress(item)} onPress={() => onPress(item, isVideo, isFile, isImage, textStr)}>
                    <View style={[styles.bubble, isMine ? styles.myBubble : (isDark ? styles.theirBubbleDark : styles.theirBubble)]}>
                        
                        {item.replyTo && (
                            <View style={[styles.replyBoxInBubble, isMine ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: isMine ? '#fff' : '#0068ff' }}>{item.replyTo.authorName}</Text>
                                <Text style={{ fontSize: 13, color: isMine ? '#eee' : '#555' }} numberOfLines={1}>{item.replyTo.messageType === 'image' ? '[Hình ảnh]' : item.replyTo.text}</Text>
                            </View>
                        )}

                        {isImage ? <Image source={{ uri: textStr }} style={styles.msgImage} />
                        : isVideo ? <Video source={{ uri: textStr }} style={styles.msgVideo} useNativeControls={true} resizeMode={ResizeMode.COVER} isLooping={false} />
                        : isAudio ? <InlineAudioPlayer uri={textStr} isMine={isMine} />
                        : isFile ? (
                            <View style={styles.mediaBox}>
                                <FileText size={24} color={isMine ? "#fff" : "#0068ff"} />
                                <Text style={{color: isMine ? '#fff' : '#0068ff', marginLeft:10, textDecorationLine:'underline', flex:1}} numberOfLines={1}>{item.fileName || 'Tài liệu'}</Text>
                            </View>
                        )
                        : item.messageType === 'call' ? <Text style={{ color: isMine ? '#fff' : '#ff3b30', fontWeight: 'bold' }}>📞 {textStr}</Text>
                        : <Text style={[styles.msgText, isMine ? {color: '#fff'} : (isDark && {color:'#fff'})]}>{textStr}</Text>}
                        
                        <View style={styles.timeAndStatusRow}>
                            <Text style={[styles.msgTime, isMine ? { color: 'rgba(255,255,255,0.7)' } : { color: '#888' }]}>{formatMessageTime(item.createdAt || new Date().toISOString())}</Text>
                            {isMine && (
                                <View style={styles.statusTick}>
                                    {item.status === 'seen' ? <CheckCheck size={13} color="#4cd137" /> : <Check size={13} color="rgba(255,255,255,0.7)" />}
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            {/* HIỂN THỊ REACTIONS */}
            {item.reactions && Object.keys(item.reactions).length > 0 && (
                <TouchableOpacity
                    onPress={() => onReactionPress(item)}
                    style={[styles.reactionRow, isMine ? { justifyContent: 'flex-end', marginRight: 10 } : { justifyContent: 'flex-start', marginLeft: 45 }]}
                >
                    {Object.entries(
                        Object.values(item.reactions as Record<string,string>).reduce((acc: Record<string,number>, emoji) => { acc[emoji] = (acc[emoji] || 0) + 1; return acc; }, {})
                    ).map(([emoji, count]) => (
                        <View key={emoji} style={styles.reactionBubble}>
                            <Text style={{ fontSize: 13 }}>{emoji}</Text>
                            {(count as number) > 1 && <Text style={styles.reactionCount}>{count as number}</Text>}
                        </View>
                    ))}
                </TouchableOpacity>
            )}
        </View>
    );
}, (prevProps, nextProps) => prevProps.item.status === nextProps.item.status && prevProps.item.isRecalled === nextProps.item.isRecalled && prevProps.item.reactions === nextProps.item.reactions);


// =====================================
// MÀN HÌNH CHÍNH: CHAT DETAIL
// =====================================
const ChatDetail = ({ route, navigation }: any) => {
    const { roomId, roomName } = route.params;
    const roomType = roomId.includes('GROUP_') ? 'group' : '1-1'; 

    const { isDark, user, socket, onlineUsers, startCall } = useApp();
    const partnerId = roomId.split('_').find((id: string) => id !== user?.id && id !== '1-1');
    const isActuallyOnline = onlineUsers.includes(partnerId);

    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null); 
    
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const recordTimerRef = useRef<any>(null);
    
    const [showAttachments, setShowAttachments] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [msgMenuVisible, setMsgMenuVisible] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<any>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [partnerInfo, setPartnerInfo] = useState<any>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [pinnedMsg, setPinnedMsg] = useState<any>(null);
    const [showReactionList, setShowReactionList] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false, title: '', message: '', isAlertOnly: true, isDestructive: false,
        onConfirm: () => {}, onCancel: () => setAlertConfig(prev => ({...prev, visible: false}))
    });

    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>(null);

    const showAlert = (title: string, message: string, isAlertOnly = true, onConfirm = () => {}, isDestructive = false) => {
        setAlertConfig({
            visible: true, title, message, isAlertOnly, isDestructive,
            onConfirm: () => { onConfirm(); setAlertConfig(prev => ({...prev, visible: false})); },
            onCancel: () => setAlertConfig(prev => ({...prev, visible: false}))
        });
    };

    useEffect(() => {
        const initChat = async () => {
            if (!socket || !user) return;
            socket.emit('join_room', roomId);
            socket.on('receive_message', (msg: any) => { 
                setMessages(prev => [...prev, msg]); 
                setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100); 
                if (msg.authorId !== user.id) socket.emit('mark_as_seen', { roomId, userId: user.id }); 
            });
            
            socket.on('user_typing', ({ isTyping }: any) => setPartnerTyping(isTyping));
            socket.on('message_recalled', (messageId: string) => setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRecalled: true } : m)));
            socket.on('messages_seen', () => setMessages(prev => prev.map(m => m.authorId === user.id ? { ...m, status: 'seen' } : m)));
            socket.on('message_reacted', ({ messageId, reactions }: any) => setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m)));

            try {
                const res = await api.get(`/messages/${roomId}`);
                setMessages(res.data);
                socket.emit('mark_as_seen', { roomId, userId: user.id });
            } catch (e) {
                console.log("Lỗi tải tin nhắn:", e);
            } finally { setLoading(false); }
        };
        initChat();

        return () => {
            if (socket) {
                socket.off('receive_message');
                socket.off('user_typing'); socket.off('message_recalled'); socket.off('messages_seen'); socket.off('message_reacted');
                socket.emit('typing', { roomId, userName: user?.fullName, isTyping: false });
            }
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            if (recording) recording.stopAndUnloadAsync().catch(()=> {});
        };
    }, [socket, user]);

    const handleTextChange = (text: string) => {
        setInputText(text);
        if (socket) {
            socket.emit('typing', { roomId, userName: user?.fullName, isTyping: text.length > 0 });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => socket.emit('typing', { roomId, userName: user?.fullName, isTyping: false }), 3000);
        }
    };

    const sendMessage = () => {
        if (!inputText.trim() || !socket || !socket.connected) return;
        socket.emit('send_message', { 
            roomId, senderId: user?.id, senderName: user?.fullName, 
            text: inputText, messageType: 'text', fileName: '', 
            replyTo: replyingTo ? replyingTo : null,
            createdAt: new Date().toISOString()
        });
        setInputText(''); setReplyingTo(null); setShowEmojis(false);
        socket.emit('typing', { roomId, userName: user?.fullName, isTyping: false });
    };

    const uploadAndSend = async (uri: string, type: string, name: string, mimeType: string) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            let fileUri = uri;
            if (Platform.OS === 'ios') fileUri = uri.replace('file://', '');
            else if (Platform.OS === 'android' && !uri.startsWith('file://')) fileUri = 'file://' + uri;

            // @ts-ignore
            formData.append('file', { uri: fileUri, name, type: mimeType });

            const response = await fetch(`${api.defaults.baseURL}/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            });

            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || "Lỗi server");

            if (socket && socket.connected) {
                socket.emit('send_message', { 
                    roomId, senderId: user?.id, senderName: user?.fullName, 
                    text: resData.url, messageType: type, fileName: name, 
                    replyTo: replyingTo ? replyingTo : null,
                    createdAt: new Date().toISOString() 
                });
            }
            setReplyingTo(null); setShowAttachments(false);
        } catch (e: any) { 
            console.log("Upload Error:", e);
            showAlert("Lỗi Upload", "Không thể gửi tệp. Vui lòng kiểm tra lại mạng!"); 
        } finally { setIsUploading(false); }
    };

    const handleVoiceRecord = async () => {
        if (isRecording && recording) {
            setIsRecording(false);
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            try {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                if (uri) {
                    const fileName = `voice_${Date.now()}.m4a`;
                    await uploadAndSend(uri, 'audio', fileName, 'audio/m4a');
                }
            } catch (err) { console.log("Lỗi lưu file ghi âm:", err); }
            
            setRecordDuration(0);
            setRecording(null); 
        } else {
            try {
                const permission = await Audio.requestPermissionsAsync();
                if (permission.status !== 'granted') {
                    showAlert("Lỗi", "Vui lòng cấp quyền Micro để thu âm.");
                    return;
                }
                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
                const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                setRecording(newRecording); 
                setIsRecording(true);
                setRecordDuration(0);
                
                if (recordTimerRef.current) clearInterval(recordTimerRef.current);
                recordTimerRef.current = setInterval(() => setRecordDuration(prev => prev + 1), 1000);
            } catch (err) { 
                showAlert("Lỗi", "Không thể bắt đầu thu âm."); 
            }
        }
    };

    const cancelRecordingAction = async () => {
        if (isRecording && recording) {
            setIsRecording(false);
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            try { await recording.stopAndUnloadAsync(); } catch (e) {}
            setRecording(null);
            setRecordDuration(0);
        }
    };

    const handleMessageLongPress = useCallback((item: any) => { if (item.isRecalled || item.messageType === 'system') return; setSelectedMsg(item); setMsgMenuVisible(true); }, []);
    const handleMessagePress = useCallback((_item: any, _isVideo: boolean, isFile: boolean, isImage: boolean, url: string) => {
        if (isImage) setFullScreenImage(url); 
        else if (isFile) Linking.openURL(url).catch(() => showAlert("Lỗi", "Không thể mở file này."));
    }, []);

    const openForwardModal = async () => {
        try {
            const res = await api.get(`/conversations/user/${user.id}`);
            const sorted = res.data.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
            setConversations(sorted);
            setShowForwardModal(true);
        } catch (error) { showAlert("Lỗi", "Không thể tải danh sách trò chuyện."); }
    };

    const sendReaction = async (emoji: string) => {
        if (!selectedMsg) return;
        setMsgMenuVisible(false);
        try {
            await api.post('/messages/react', { messageId: selectedMsg.id, userId: user.id, reaction: emoji, roomId });
        } catch (e) { console.log("Lỗi reaction:", e); }
    };

    const executeAction = (action: string) => {
        setMsgMenuVisible(false);
        setTimeout(() => {
            if (action === 'reply') {
                setReplyingTo(selectedMsg);
            } else if (action === 'pin') {
                setPinnedMsg(pinnedMsg?.id === selectedMsg?.id ? null : selectedMsg);
            } else if (action === 'forward') {
                openForwardModal();
            } else if (action === 'recall') {
                showAlert("Thu hồi", "Thu hồi tin nhắn này với mọi người?", false, () => {
                    socket?.emit('recall_message', { messageId: selectedMsg.id, roomId });
                });
            } else if (action === 'delete') {
                showAlert("Xóa tin nhắn", "Xóa tin nhắn này ở phía bạn?", false, () => {
                    socket?.emit('delete_message_for_me', { messageId: selectedMsg.id, userId: user.id, roomId });
                    setMessages(prev => prev.filter(m => m.id !== selectedMsg.id));
                }, true);
            }
        }, 300);
    };

    const handleForwardAction = (targetRoomId: string) => {
        if (!selectedMsg || !user) return;
        socket.emit("send_message", { 
            roomId: targetRoomId, 
            senderId: user.id, 
            senderName: user.fullName, 
            text: selectedMsg.text, 
            messageType: selectedMsg.messageType, 
            fileName: selectedMsg.fileName || "", 
            replyTo: null,
            createdAt: new Date().toISOString()
        });
        setShowForwardModal(false); 
        showAlert("Thành công", "Đã chuyển tiếp tin nhắn!");
    };

    const fetchPartnerInfo = async () => {
        try {
            const res = await api.get(`/users/${partnerId}`);
            setPartnerInfo(res.data);
            setShowInfoModal(true);
        } catch (e) { 
            showAlert("Lỗi", "Không thể tải thông tin tài khoản. Vui lòng thử lại sau."); 
        }
    };

    const pickImage = async () => { 
        let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 10, quality: 0.8 });
        if (!res.canceled) {
            setShowAttachments(false);
            for (const asset of res.assets) {
                await uploadAndSend(asset.uri, 'image', asset.fileName || `image_${Date.now()}.jpg`, 'image/jpeg');
            }
        } 
    };

    const pickVideo = async () => { 
        let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: false, quality: 0.8 });
        if (!res.canceled) uploadAndSend(res.assets[0].uri, 'video', res.assets[0].fileName || 'video.mp4', 'video/mp4'); 
    };
    
    const pickDocument = async () => { 
        let res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!res.canceled) uploadAndSend(res.assets[0].uri, 'file', res.assets[0].name, res.assets[0].mimeType || 'application/octet-stream'); 
    };

    // ĐÃ CẬP NHẬT TRUYỀN `isGroup` VÀO TRONG MỖI BONG BÓNG CHAT
    const handleReactionPress = useCallback((item: any) => {
        setSelectedMsg(item);
        setShowReactionList(true);
    }, []);

    const renderItem = useCallback(({item}: any) => (
        <MessageItem
            item={item}
            isMine={item.authorId === user?.id}
            isDark={isDark}
            isGroup={roomType === 'group'}
            onLongPress={handleMessageLongPress}
            onPress={handleMessagePress}
            onReactionPress={handleReactionPress}
        />
    ), [user?.id, isDark, roomType, handleMessageLongPress, handleMessagePress, handleReactionPress]);

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]} edges={['top', 'left', 'right']}>
            
            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color={isDark ? "#fff" : "#000"} size={28} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, isDark && { color: '#fff' }]} numberOfLines={1}>{roomName}</Text>
                    {roomType === '1-1' && <Text style={[styles.headerStatus, !isActuallyOnline && { color: '#888' }]}>{isActuallyOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}</Text>}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headBtn} onPress={() => startCall(partnerId, roomName, false)}>
                        <Phone size={22} color="#0068ff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headBtn} onPress={() => startCall(partnerId, roomName, true)}>
                        <VideoIcon size={22} color="#0068ff" />
                    </TouchableOpacity>
                    
                    {roomType === '1-1' && (
                        <TouchableOpacity style={styles.headBtn} onPress={fetchPartnerInfo}>
                            <Info size={24} color="#0068ff" />
                        </TouchableOpacity>
                    )}

                    {roomType === 'group' && (
                        <TouchableOpacity style={styles.headBtn} onPress={() => navigation.navigate('GroupSettingsScreen', { activeRoom: route.params })}>
                            <Info size={24} color="#0068ff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* GHIM TIN NHẮN */}
            {pinnedMsg && (
                <TouchableOpacity
                    style={[styles.pinnedBanner, isDark && { backgroundColor: '#1e2a3a', borderColor: '#0068ff55' }]}
                    onPress={() => {
                        const idx = [...messages].reverse().findIndex(m => m.id === pinnedMsg.id);
                        if (idx !== -1) flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
                    }}
                >
                    <Pin size={14} color="#0068ff" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: '#0068ff', fontWeight: 'bold' }}>Tin nhắn đã ghim</Text>
                        <Text style={{ fontSize: 13, color: isDark ? '#ccc' : '#333' }} numberOfLines={1}>{pinnedMsg.text}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setPinnedMsg(null)}>
                        <X size={16} color="#888" />
                    </TouchableOpacity>
                </TouchableOpacity>
            )}

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                
                <View style={{ flex: 1 }}>
                    {loading ? <ActivityIndicator size="large" color="#0068ff" style={{flex:1}} /> : (
                        <FlatList 
                            ref={flatListRef} 
                            data={[...messages].reverse()} 
                            inverted={true} 
                            keyExtractor={(i) => i.id} 
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 20 }} 
                            keyboardShouldPersistTaps="handled" 
                            keyboardDismissMode="on-drag" 
                            initialNumToRender={15} 
                            maxToRenderPerBatch={10} 
                            windowSize={10}
                            removeClippedSubviews={true} 
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>

                {isUploading && (
                    <View style={styles.uploadingBox}>
                        <ActivityIndicator size="small" color="#0068ff" />
                        <Text style={{ marginLeft: 10, color: '#0068ff', fontStyle: 'italic' }}>Đang tải tệp lên...</Text>
                    </View>
                )}
                {partnerTyping && <View style={styles.typingIndicator}><Text style={{ color: '#888', fontStyle: 'italic', fontSize: 12 }}>{roomName} đang gõ...</Text></View>}
                
                {replyingTo && (
                    <View style={[styles.replyPreview, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                        <CornerDownRight size={16} color="#0068ff" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Trả lời {replyingTo.authorName}</Text>
                            <Text style={{ fontSize: 13, color: '#888' }} numberOfLines={1}>{replyingTo.text}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}><X size={20} color="#888" /></TouchableOpacity>
                    </View>
                )}

                <View style={[styles.inputContainer, isDark && { backgroundColor: '#1e1e1e', borderTopColor: '#333' }]}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => { Keyboard.dismiss(); setShowAttachments(false); setShowEmojis(true); }}>
                        <Smile size={26} color={showEmojis ? "#0068ff" : (isDark ? "#aaa" : "#888")} />
                    </TouchableOpacity>
                    
                    {isRecording ? (
                        <View style={styles.recordingActiveBox}>
                            <View style={styles.redDotPulse} />
                            <Text style={styles.recordingTimeTxt}>Đang ghi âm... {formatTime(recordDuration * 1000)}</Text>
                            <TouchableOpacity onPress={cancelRecordingAction} style={{ marginLeft: 'auto', padding: 5 }}>
                                <Text style={{ color: '#ff3b30', fontWeight: 'bold' }}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TextInput 
                            style={[styles.input, isDark && { color: '#fff', backgroundColor: '#333' }]} 
                            placeholder="Nhập tin nhắn..." placeholderTextColor="#888" 
                            value={inputText} onChangeText={handleTextChange} multiline autoCorrect={false}
                            onFocus={() => { setShowAttachments(false); setShowEmojis(false); }}
                        />
                    )}

                    {inputText.trim().length > 0 ? (
                        <TouchableOpacity style={styles.sendBtnZalo} onPressIn={sendMessage}><Send size={20} color="#fff" /></TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {!isRecording && (
                                <TouchableOpacity style={styles.iconBtn} onPress={() => { Keyboard.dismiss(); setShowEmojis(false); setShowAttachments(!showAttachments); }}>
                                    <MoreHorizontal size={26} color={showAttachments ? "#0068ff" : (isDark ? "#aaa" : "#888")} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.iconBtn} onPress={handleVoiceRecord}>
                                {isRecording ? <Send size={24} color="#0068ff" /> : <Mic size={26} color={isDark ? "#aaa" : "#888"} />}
                            </TouchableOpacity>
                            {!isRecording && (
                                <TouchableOpacity style={styles.iconBtn} onPress={pickImage}><ImageIcon size={26} color={isDark ? "#aaa" : "#888"} /></TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {showAttachments && (
                    <View style={[styles.bottomPanel, isDark && { backgroundColor: '#121212' }]}>
                        <TouchableOpacity style={styles.panelItem} onPress={pickDocument}>
                            <View style={[styles.panelIconWrap, { backgroundColor: '#e3f2fd' }]}><FileText size={26} color="#0068ff" /></View>
                            <Text style={[styles.panelText, isDark && { color: '#fff' }]}>Tài liệu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.panelItem} onPress={pickVideo}>
                            <View style={[styles.panelIconWrap, { backgroundColor: '#fce4ec' }]}><VideoIcon size={26} color="#e91e63" /></View>
                            <Text style={[styles.panelText, isDark && { color: '#fff' }]}>Video</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>

            <EmojiPicker onEmojiSelected={(emoji) => setInputText(prev => prev + emoji.emoji)} open={showEmojis} onClose={() => setShowEmojis(false)} theme={{ backdrop: 'transparent', knob: '#ccc', container: isDark ? '#1e1e1e' : '#fff', header: isDark ? '#fff' : '#000' }} />

            <Modal animationType="fade" transparent={true} visible={msgMenuVisible} onRequestClose={() => setMsgMenuVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMsgMenuVisible(false)}>
                    <View style={[styles.zaloMenuSheet, isDark && { backgroundColor: '#222' }]}>
                        <View style={styles.swipeHandle} />
                        {/* REACTION BAR */}
                        <View style={styles.reactionBar}>
                            {['❤️','😆','😮','😢','😡','👍'].map(emoji => (
                                <TouchableOpacity key={emoji} onPress={() => sendReaction(emoji)} style={styles.reactionEmoji}>
                                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={[styles.dividerThin, isDark && { backgroundColor: '#444' }]} />
                        <View style={styles.zaloMenuGrid}>
                            <TouchableOpacity style={styles.zaloMenuItem} onPress={() => executeAction('reply')}><View style={[styles.zaloIconCircle, { backgroundColor: '#e3f2fd' }]}><Reply size={22} color="#0068ff" /></View><Text style={[styles.zaloMenuText, isDark && { color: '#fff' }]}>Trả lời</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.zaloMenuItem} onPress={() => executeAction('pin')}>
                                <View style={[styles.zaloIconCircle, { backgroundColor: '#fff8e1' }]}><Pin size={22} color="#f59e0b" /></View>
                                <Text style={[styles.zaloMenuText, isDark && { color: '#fff' }]}>{pinnedMsg?.id === selectedMsg?.id ? 'Bỏ ghim' : 'Ghim'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.zaloMenuItem} onPress={() => executeAction('forward')}>
                                <View style={[styles.zaloIconCircle, { backgroundColor: '#e8f5e9' }]}><Forward size={22} color="#4caf50" /></View>
                                <Text style={[styles.zaloMenuText, isDark && { color: '#fff' }]}>Chuyển tiếp</Text>
                            </TouchableOpacity>
                            {selectedMsg?.authorId === user?.id && <TouchableOpacity style={styles.zaloMenuItem} onPress={() => executeAction('recall')}><View style={[styles.zaloIconCircle, { backgroundColor: '#fff3e0' }]}><CornerDownRight size={22} color="#ff9800" /></View><Text style={[styles.zaloMenuText, isDark && { color: '#fff' }]}>Thu hồi</Text></TouchableOpacity>}
                            <TouchableOpacity style={styles.zaloMenuItem} onPress={() => executeAction('delete')}><View style={[styles.zaloIconCircle, { backgroundColor: '#ffebeb' }]}><Trash2 size={22} color="#ff3b30" /></View><Text style={[styles.zaloMenuText, isDark && { color: '#fff' }]}>Xóa</Text></TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={showInfoModal} onRequestClose={() => setShowInfoModal(false)}>
                <View style={styles.modalBg}>
                    <View style={[styles.modalContentForward, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Thông tin tài khoản</Text>
                            <TouchableOpacity onPress={() => setShowInfoModal(false)}><X size={24} color="gray" /></TouchableOpacity>
                        </View>
                        
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Image source={{ uri: partnerInfo?.avatar || 'https://via.placeholder.com/150' }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }} />
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>{partnerInfo?.fullName}</Text>
                            <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>{isActuallyOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}</Text>
                        </View>

                        <View style={{ gap: 15 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ width: 100, color: 'gray' }}>Email:</Text>
                                <Text style={{ flex: 1, color: isDark ? '#fff' : '#000' }}>{partnerInfo?.email || 'Chưa cập nhật'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ width: 100, color: 'gray' }}>Giới tính:</Text>
                                <Text style={{ flex: 1, color: isDark ? '#fff' : '#000' }}>{partnerInfo?.gender || 'Chưa cập nhật'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ width: 100, color: 'gray' }}>Ngày sinh:</Text>
                                <Text style={{ flex: 1, color: isDark ? '#fff' : '#000' }}>{partnerInfo?.dob || 'Chưa cập nhật'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showForwardModal} animationType="slide" transparent={true}>
                <View style={styles.modalBg}>
                    <View style={[styles.modalContentForward, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Chuyển tiếp đến...</Text>
                            <TouchableOpacity onPress={() => setShowForwardModal(false)}><X size={24} color="red" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={conversations}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleForwardAction(item.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: isDark ? '#333' : '#eee' }}>
                                    <Image source={{ uri: item.avatar || 'https://via.placeholder.com/50' }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 15 }} />
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#000' }}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>Chưa có cuộc trò chuyện nào.</Text>}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
                <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
                    <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }} onPress={() => setFullScreenImage(null)}><X color="#fff" size={32} /></TouchableOpacity>
                    {fullScreenImage && <Image source={{ uri: fullScreenImage }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />}
                </View>
            </Modal>

            <Modal visible={showReactionList} animationType="slide" transparent={true} onRequestClose={() => setShowReactionList(false)}>
                <View style={styles.modalBg}>
                    <View style={[styles.modalContentForward, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Cảm xúc</Text>
                            <TouchableOpacity onPress={() => setShowReactionList(false)}><X size={24} color="gray" /></TouchableOpacity>
                        </View>
                        {selectedMsg?.reactions && Object.entries(selectedMsg.reactions as Record<string, string>).length > 0 ? (
                            Object.entries(selectedMsg.reactions as Record<string, string>).map(([uid, emoji]) => {
                                // Tra tên từ danh sách tin nhắn hiện có trong phòng
                                const nameFromMessages = messages.find((m: any) => m.authorId === uid);
                                const displayName = uid === user?.id
                                    ? 'Bạn'
                                    : (nameFromMessages?.authorName || nameFromMessages?.senderName || uid);
                                return (
                                    <View key={uid} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: isDark ? '#333' : '#eee' }}>
                                        <Text style={{ fontSize: 24, marginRight: 15 }}>{emoji}</Text>
                                        <Text style={{ fontSize: 15, color: isDark ? '#fff' : '#333', flex: 1 }}>
                                            {displayName}
                                        </Text>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>Chưa có cảm xúc.</Text>
                        )}
                    </View>
                </View>
            </Modal>

            <CustomConfirmModal 
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                onCancel={alertConfig.onCancel}
                isAlertOnly={alertConfig.isAlertOnly}
                isDark={isDark}
                isDestructive={alertConfig.isDestructive}
            />

        </SafeAreaView>
    );
};

// =====================================
// BẢNG CSS ĐỊNH DẠNG ĐÃ THÊM msgWrapper và msgAuthorName
// =====================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e9f1' },
    header: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#eee' },
    headerInfo: { flex: 1, marginLeft: 15 },
    headerName: { fontSize: 18, fontWeight: 'bold' },
    headerStatus: { fontSize: 12, color: '#4cd137' },
    headerActions: { flexDirection: 'row' },
    headBtn: { marginLeft: 15 },
    
    // Đã thay thế msgContainer bằng msgWrapper cho đúng cấu trúc UI
    msgWrapper: { marginBottom: 15, maxWidth: '80%' },
    myMsg: { alignSelf: 'flex-end' },
    theirMsg: { alignSelf: 'flex-start' },
    
    // Tên người gửi hiển thị phía trên bong bóng
    msgAuthorName: { fontSize: 12, color: '#888', marginLeft: 40, marginBottom: 4, fontWeight: '500' },
    miniAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8, alignSelf: 'flex-end' },
    bubble: { padding: 12, borderRadius: 20, minWidth: 80 },
    myBubble: { backgroundColor: '#0068ff', borderBottomRightRadius: 2 },
    theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 2 },
    theirBubbleDark: { backgroundColor: '#2c2c2e', borderBottomLeftRadius: 2 },
    msgText: { fontSize: 16, color: '#000' },
    
    msgImage: { width: 220, height: 160, borderRadius: 8, resizeMode: 'cover' },
    msgVideo: { width: 220, height: 160, borderRadius: 8, backgroundColor: '#333' }, 
    mediaBox: { flexDirection: 'row', alignItems: 'center', width: 200, paddingVertical: 5 },
    timeAndStatusRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    msgTime: { fontSize: 11, marginRight: 4 },
    statusTick: { justifyContent: 'center' },
    
    typingIndicator: { paddingHorizontal: 20, paddingBottom: 10 },
    uploadingBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10 },
    replyBoxInBubble: { padding: 8, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderColor: '#fff' },
    replyPreview: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee' },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', paddingHorizontal: 5, paddingVertical: 10, borderTopWidth: 0.5, borderColor: '#ddd' },
    input: { flex: 1, minHeight: 40, maxHeight: 100, fontSize: 16, paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10 },
    iconBtn: { padding: 8, justifyContent: 'center', alignItems: 'center' },
    sendBtnZalo: { backgroundColor: '#0068ff', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, marginBottom: 2 },
    recordingActiveBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 40 },
    redDotPulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff3b30', marginRight: 10 },
    recordingTimeTxt: { color: '#ff3b30', fontSize: 16, fontWeight: 'bold' },
    bottomPanel: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#f1f2f6', height: 250, padding: 20, borderTopWidth: 1, borderColor: '#eee' },
    panelItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
    panelIconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    panelText: { fontSize: 13, color: '#333' },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    zaloMenuSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
    swipeHandle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    zaloMenuGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    zaloMenuItem: { alignItems: 'center' },
    zaloIconCircle: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    zaloMenuText: { fontSize: 14, color: '#333' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContentForward: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
    sysMsgContainer: { alignItems: 'center', marginVertical: 10 },
    sysMsgText: { backgroundColor: '#e1e1e1', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, fontSize: 12, color: 'gray', overflow: 'hidden' },
    
    alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    alertBox: { width: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    alertTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' },
    alertMessage: { fontSize: 15, color: '#555', marginBottom: 25 },
    alertBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
    alertBtnCancel: { paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
    alertBtnCancelTxt: { color: 'gray', fontWeight: 'bold', fontSize: 15 },
    alertBtnConfirm: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#0068ff', borderRadius: 8 },
    alertBtnConfirmTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    reactionBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingHorizontal: 5 },
    reactionEmoji: { padding: 6 },
    dividerThin: { height: 1, backgroundColor: '#eee', marginHorizontal: 10, marginBottom: 15 },
    reactionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: -4, marginBottom: 4 },
    reactionBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4, borderWidth: 0.5, borderColor: '#ddd', elevation: 1 },
    reactionCount: { fontSize: 11, color: '#555', marginLeft: 2, fontWeight: 'bold' },
    pinnedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4ff', borderBottomWidth: 1, borderColor: '#0068ff33', paddingHorizontal: 15, paddingVertical: 8 },
});

export default ChatDetail;