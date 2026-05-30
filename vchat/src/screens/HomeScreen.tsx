import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MessageSquare, Users, Settings, UserPlus, Users as UsersIcon, X, User, Pin, EyeOff, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import api from '../services/api';

const HomeScreen = ({ navigation }: any) => {
    const { isDark, user, updateUser, onlineUsers, socket, t } = useApp();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [hiddenConvs, setHiddenConvs] = useState<string[]>([]);
    const pinnedConvs: string[] = Array.isArray(user?.pinnedConvs) ? user.pinnedConvs : [];

    // MODAL STATE
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [optionModalVisible, setOptionModalVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState<any>(null);

    const loadData = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/conversations/user/${user.id}`);
            const sorted = res.data.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
            setConversations(sorted);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const loadLocalPrefs = async () => {
        try {
            const h = await AsyncStorage.getItem('hiddenConvs'); if (h) setHiddenConvs(JSON.parse(h));
        } catch {}
    };

    useFocusEffect(useCallback(() => { loadData(); loadLocalPrefs(); }, [user]));

    useEffect(() => {
        if (socket) {
            const onMsg = (msg: any) => {
                // Bỏ ẩn khi có tin nhắn mới
                if (msg.conversationId) {
                    setHiddenConvs(prev => {
                        if (!prev.includes(msg.conversationId)) return prev;
                        const updated = prev.filter((id: string) => id !== msg.conversationId);
                        AsyncStorage.setItem('hiddenConvs', JSON.stringify(updated));
                        return updated;
                    });
                }
                loadData();
            };
            socket.on('receive_message', onMsg);
            return () => { socket.off('receive_message', onMsg); };
        }
    }, [socket]);

    const handleHideConversation = (roomId: string, roomName: string) => {
        Alert.alert("Ẩn cuộc trò chuyện", `Ẩn "${roomName}" khỏi danh sách? Tin nhắn mới sẽ hiển thị lại.`, [
            { text: "Hủy", style: "cancel" },
            { text: "Ẩn", onPress: async () => {
                const updated = hiddenConvs.includes(roomId) ? hiddenConvs : [...hiddenConvs, roomId];
                setHiddenConvs(updated);
                await AsyncStorage.setItem('hiddenConvs', JSON.stringify(updated));
                setOptionModalVisible(false);
            }}
        ]);
    };

    const handleDeleteConversation = (roomId: string, roomName: string) => {
        Alert.alert("Xóa cuộc trò chuyện", `Xóa "${roomName}"? Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.`, [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: async () => {
                try {
                    await api.delete(`/conversations/${roomId}?userId=${user?.id}`);
                    setConversations(prev => prev.filter((c: any) => c.id !== roomId));
                } catch (e) {
                    Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện lúc này.");
                }
                setOptionModalVisible(false);
            }}
        ]);
    };

    const handlePinConversation = async (roomId: string) => {
        if (!user) return;
        if (!pinnedConvs.includes(roomId) && pinnedConvs.length >= 3) {
            Alert.alert("Đã đạt giới hạn", "Chỉ được ghim tối đa 3 cuộc trò chuyện.");
            return;
        }
        setOptionModalVisible(false);
        try {
            const res = await api.post('/users/pin-conversation', { userId: user.id, roomId });
            await updateUser({ pinnedConvs: res.data.pinnedConvs });
        } catch (e: any) {
            Alert.alert("Lỗi", e.response?.data?.error || "Không thể ghim. Thử lại sau.");
        }
    };

    const showContextMenu = (item: any, partnerId: string, isOnline: boolean) => {
        setSelectedChat({ ...item, partnerId, isOnline });
        setOptionModalVisible(true);
    };

    // HÀM MỚI: LẤY THÔNG TIN THẬT TỪ DATABASE
    const fetchAndShowProfile = async () => {
        setOptionModalVisible(false);
        try {
            const res = await api.get(`/users/${selectedChat.partnerId}`);
            setSelectedProfile({
                roomId: selectedChat.id,
                partnerId: selectedChat.partnerId,
                name: res.data.fullName || selectedChat.name,
                avatar: res.data.avatar || selectedChat.avatar,
                isOnline: selectedChat.isOnline,
                email: res.data.email || 'Không có email',
                gender: res.data.gender || 'Chưa cập nhật',
                dob: res.data.dob || 'Chưa cập nhật',
            });
            setProfileModalVisible(true);
        } catch (error) {
            Alert.alert("Lỗi", "Hãy chắc chắn bạn đã thêm API /api/users/:id ở Backend Node.js nhé!");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1e1e1e' : '#0068ff' }} edges={['top']}>
            <View style={[styles.zaloHeader, { zIndex: 10 }]}>
                <Search size={22} color="#fff" style={{ marginLeft: 15 }} />
                <TextInput placeholder="Tìm kiếm..." placeholderTextColor="#cce0ff" style={styles.zaloSearchInput} value={search} onChangeText={setSearch} />
                <TouchableOpacity style={{ padding: 15 }} onPress={() => setShowMenu(!showMenu)}><Plus size={28} color="#fff" /></TouchableOpacity>

                {showMenu && (
                    <View style={[styles.dropdownMenu, isDark && { backgroundColor: '#333' }]}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('Contact'); }}><UserPlus size={20} color={isDark ? "#fff" : "#333"} /><Text style={[styles.menuText, isDark && { color: '#fff' }]}>Thêm bạn</Text></TouchableOpacity>
                        <View style={[styles.divider, isDark && { backgroundColor: '#555' }]} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('CreateGroupScreen'); }}>
    <UsersIcon size={20} color={isDark ? "#fff" : "#333"} />
    <Text style={[styles.menuText, isDark && { color: '#fff' }]}>Tạo nhóm</Text>
</TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity activeOpacity={1} style={[styles.container, isDark && { backgroundColor: '#121212' }]} onPress={() => setShowMenu(false)}>
                {loading ? <ActivityIndicator size="large" color="#0068ff" style={{flex:1}} /> : (
                    <FlatList
                        data={conversations
                            .filter((c: any) => !hiddenConvs.includes(c.id))
                            .filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
                            .sort((a: any, b: any) => {
                                const ap = pinnedConvs.includes(a.id), bp = pinnedConvs.includes(b.id);
                                if (ap && !bp) return -1; if (!ap && bp) return 1;
                                return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
                            })}
                        keyExtractor={(item: any) => item.id}
                        renderItem={({ item }: any) => {
                            const partnerId = item.id.split('_').find((id: string) => id !== user?.id && id !== '1-1');
                            const isOnline = onlineUsers.includes(partnerId);
                            const isPinned = pinnedConvs.includes(item.id);

                            return (
                                <TouchableOpacity style={[styles.item, isDark && { borderBottomColor: '#333' }]} onPress={() => navigation.navigate('ChatDetail', { roomId: item.id, roomName: item.name, isOnline })} onLongPress={() => showContextMenu(item, partnerId, isOnline)} delayLongPress={400}>
                                    <View>
                                        <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                                        {isOnline && <View style={styles.onlineBadge} />}
                                    </View>
                                    <View style={styles.content}>
                                        <View style={styles.row}>
                                            <Text style={[styles.name, isDark && { color: '#fff' }]}>{isPinned ? '📌 ' : ''}{item.name}</Text>
                                            <Text style={styles.time}>{item.lastMessageTime || 'Vừa xong'}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={[styles.msg, isOnline && { color: '#4cd137' }]} numberOfLines={1}>{item.lastMsg || (isOnline ? "Đang trực tuyến" : "Ngoại tuyến")}</Text>
                                            {item.unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{item.unreadCount}</Text></View>}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>Trống.</Text>}
                    />
                )}

                <View style={[styles.footer, isDark && { backgroundColor: '#1e1e1e', borderTopColor: '#333' }]}>
                    <TouchableOpacity style={styles.tab}><MessageSquare size={24} color="#0068ff" /><Text style={{color:'#0068ff', fontSize:11, marginTop: 4}}>{t('chat')}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Contact')}><Users size={24} color="#888" /><Text style={{color:'#888', fontSize:11, marginTop: 4}}>{t('contact')}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Settings')}><Settings size={24} color="#888" /><Text style={{color:'#888', fontSize:11, marginTop: 4}}>{t('settings')}</Text></TouchableOpacity>
                </View>
            </TouchableOpacity>

            <Modal animationType="fade" transparent={true} visible={optionModalVisible} onRequestClose={() => setOptionModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionModalVisible(false)}>
                    <View style={[styles.bottomSheet, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={styles.swipeHandle} />
                        <View style={[styles.sheetHeader, isDark && { borderBottomColor: '#333' }]}>
                            <Image source={{ uri: selectedChat?.avatar || 'https://via.placeholder.com/150' }} style={styles.sheetAvatar} />
                            <Text style={[styles.sheetName, isDark && { color: '#fff' }]} numberOfLines={1}>{selectedChat?.name}</Text>
                        </View>
                        {!selectedChat?.id?.startsWith('GROUP_') && (
                            <TouchableOpacity style={styles.sheetAction} onPress={fetchAndShowProfile}>
                                <View style={[styles.iconCircle, { backgroundColor: '#e3f2fd' }]}><User size={20} color="#0068ff" /></View>
                                <Text style={[styles.sheetActionText, isDark && { color: '#fff' }]}>Xem thông tin</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.sheetAction} onPress={() => handlePinConversation(selectedChat?.id)}>
                            <View style={[styles.iconCircle, { backgroundColor: '#fff8e1' }]}><Pin size={20} color="#f59e0b" /></View>
                            <Text style={[styles.sheetActionText, isDark && { color: '#fff' }]}>{pinnedConvs.includes(selectedChat?.id) ? 'Bỏ ghim' : 'Ghim trò chuyện'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetAction} onPress={() => { setOptionModalVisible(false); setTimeout(() => handleHideConversation(selectedChat?.id, selectedChat?.name), 300); }}>
                            <View style={[styles.iconCircle, { backgroundColor: '#f3f4f6' }]}><EyeOff size={20} color="#6b7280" /></View>
                            <Text style={[styles.sheetActionText, isDark && { color: '#fff' }]}>Ẩn trò chuyện</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetAction} onPress={() => { setOptionModalVisible(false); setTimeout(() => handleDeleteConversation(selectedChat?.id, selectedChat?.name), 300); }}>
                            <View style={[styles.iconCircle, { backgroundColor: '#ffebeb' }]}><Trash2 size={20} color="#ff3b30" /></View>
                            <Text style={[styles.sheetActionText, { color: '#ff3b30' }]}>Xóa cuộc trò chuyện</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={profileModalVisible} onRequestClose={() => setProfileModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#121212' }]}>
                        <View style={[styles.modalHeader, isDark && { borderBottomColor: '#333' }]}>
                            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>Thông tin tài khoản</Text>
                            <TouchableOpacity onPress={() => setProfileModalVisible(false)}><X size={26} color={isDark ? "#fff" : "#000"} /></TouchableOpacity>
                        </View>
                        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 30 }}>
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1506744626753-f43dd6ccb6b9?q=80&w=1000' }} style={styles.modalBanner} />
                            <View style={styles.modalProfileSection}>
                                <Image source={{ uri: selectedProfile?.avatar || 'https://via.placeholder.com/150' }} style={styles.modalAvatar} />
                                <View style={styles.modalNameRow}>
                                    <Text style={[styles.modalName, isDark && { color: '#fff' }]}>{selectedProfile?.name}</Text>
                                    {selectedProfile?.isOnline && <View style={styles.modalOnlineDot} />}
                                </View>
                            </View>
                            <View style={styles.modalActionRow}>
                                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => { setProfileModalVisible(false); navigation.navigate('ChatDetail', { roomId: selectedProfile.roomId, roomName: selectedProfile.name, isOnline: selectedProfile.isOnline }); }}>
                                    <MessageSquare size={18} color="#0068ff" />
                                    <Text style={[styles.modalBtnText, { color: '#0068ff' }]}>Nhắn tin</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.infoBlock, isDark && { borderTopColor: '#333' }]}>
                                <Text style={[styles.infoTitle, isDark && { color: '#fff' }]}>Thông tin cá nhân</Text>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Giới tính</Text><Text style={[styles.infoValue, isDark && { color: '#ccc' }]}>{selectedProfile?.gender}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Ngày sinh</Text><Text style={[styles.infoValue, isDark && { color: '#ccc' }]}>{selectedProfile?.dob}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={[styles.infoValue, isDark && { color: '#ccc' }]}>{selectedProfile?.email}</Text></View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    zaloHeader: { flexDirection: 'row', alignItems: 'center', height: 60, paddingBottom: 5 },
    zaloSearchInput: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
    dropdownMenu: { position: 'absolute', top: 55, right: 10, backgroundColor: '#fff', borderRadius: 8, padding: 5, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, minWidth: 150 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
    menuText: { fontSize: 16, marginLeft: 12, color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 10 },
    item: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#eee' },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4cd137', borderWidth: 2, borderColor: '#fff' },
    content: { flex: 1, marginLeft: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    name: { fontSize: 17, fontWeight: '600' },
    time: { fontSize: 13, color: '#888' },
    msg: { fontSize: 14, color: '#888', flex: 1, marginRight: 10 },
    badge: { backgroundColor: '#ff3b30', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    badgeTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    footer: { flexDirection: 'row', borderTopWidth: 0.5, borderColor: '#eee', paddingVertical: 10, backgroundColor: '#fff' },
    tab: { flex: 1, alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
    swipeHandle: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 0.5, borderColor: '#eee', marginBottom: 10 },
    sheetAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
    sheetName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    sheetAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    sheetActionText: { fontSize: 16, fontWeight: '500' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15, height: '85%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalBanner: { width: '100%', height: 180, backgroundColor: '#ccc' },
    modalProfileSection: { paddingHorizontal: 20, marginTop: -40 },
    modalAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff', backgroundColor: '#f0f0f0' },
    modalNameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    modalName: { fontSize: 22, fontWeight: 'bold' },
    modalOnlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4cd137', marginLeft: 8, marginTop: 4 },
    modalActionRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 10 },
    modalBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#f1f2f6', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
    modalBtnText: { fontSize: 15, fontWeight: '600' },
    infoBlock: { marginTop: 25, paddingHorizontal: 20, borderTopWidth: 8, borderColor: '#f1f2f6', paddingTop: 20 },
    infoTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    infoRow: { flexDirection: 'row', marginBottom: 15 },
    infoLabel: { width: 100, fontSize: 15, color: '#888' },
    infoValue: { flex: 1, fontSize: 15, color: '#333' }
});

export default HomeScreen;