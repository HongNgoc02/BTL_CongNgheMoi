import React, { useState, useCallback } from 'react';
import { 
    View, Text, TouchableOpacity, FlatList, Image, StyleSheet, 
    Alert, ScrollView, ActivityIndicator, TextInput, Modal, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ChevronLeft, LogOut, ShieldAlert, UserMinus, Key,
    Edit3, Camera as CameraIcon, UserPlus, Check, X, Users
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useApp } from './AppContext';

const GroupSettingsScreen = ({ navigation, route }: any) => {
    // Nhận dữ liệu an toàn tránh sập App khi Hot Reload
    const activeRoom = route?.params?.activeRoom || route?.params || {};
    const initialRoomId = activeRoom?.roomId || activeRoom?.id || '';

    const { isDark, user, socket } = useApp();
    
    const [roomData, setRoomData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // States Chỉnh sửa
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // States Thêm thành viên
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [friends, setFriends] = useState<any[]>([]);
    const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

    // State Chuyển quyền và Modal
    const [showTransferModal, setShowTransferModal] = useState(false);

    // =====================================
    // TẢI TOÀN BỘ DỮ LIỆU
    // =====================================
    const fetchAllData = async () => {
        if (!user?.id || !initialRoomId) {
            setLoading(false);
            return;
        }
        try {
            const [convRes, friendRes] = await Promise.all([
                api.get(`/conversations/user/${user.id}`),
                api.get(`/friends/${user.id}`)
            ]);
            const currentGroup = convRes.data.find((c: any) => c.id === initialRoomId);
            if (currentGroup) {
                setRoomData(currentGroup);
                setEditNameValue(currentGroup.name);
            }
            setFriends(friendRes.data.acceptedFriends || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchAllData(); }, [user?.id, initialRoomId]));

    const isOwner = roomData?.adminIds?.includes(user?.id);

    // =====================================
    // CẬP NHẬT QUYỀN GỬI TIN
    // =====================================
    const handleUpdateSendMode = async (mode: 'all_members' | 'leaders_only') => {
        if (!isOwner) return;
        try {
            await api.post('/conversations/group/update_info', { roomId: roomData.id, userId: user?.id, sendMode: mode });
            setRoomData((prev: any) => ({ ...prev, sendMode: mode }));
            const txt = mode === 'all_members' ? "Tất cả mọi người" : "Chỉ Trưởng nhóm";
            socket?.emit("send_message", { roomId: roomData.id, senderId: "system", senderName: "Hệ thống", text: `${user?.fullName} đã đổi quyền gửi tin: ${txt}.`, messageType: 'system' });
        } catch (error) { Alert.alert("Lỗi", "Không thể cập nhật quyền."); }
    };

    // =====================================
    // CẬP NHẬT TÊN & AVATAR
    // =====================================
    const handleUpdateInfo = async (newName: string | null, newAvatar: string | null) => {
        try {
            await api.post('/conversations/group/update_info', { roomId: roomData.id, userId: user?.id, name: newName, avatar: newAvatar });
            setRoomData((prev: any) => ({ ...prev, name: newName || prev.name, avatar: newAvatar || prev.avatar }));
            setIsEditingName(false);
            if (newName) socket?.emit("send_message", { roomId: roomData.id, senderId: "system", senderName: "Hệ thống", text: `${user?.fullName} đổi tên nhóm: ${newName}`, messageType: 'system' });
        } catch (error) { Alert.alert("Lỗi", "Cập nhật thất bại."); }
    };

    const pickGroupAvatar = async () => {
        let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!res.canceled) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                let fileUri = Platform.OS === 'ios' ? res.assets[0].uri.replace('file://', '') : res.assets[0].uri;
                // @ts-ignore
                formData.append('file', { uri: fileUri, name: 'group_avatar.jpg', type: 'image/jpeg' });
                const uploadRes = await fetch(`${api.defaults.baseURL}/upload`, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
                const resData = await uploadRes.json();
                if (uploadRes.ok) await handleUpdateInfo(null, resData.url);
            } catch (err) { Alert.alert("Lỗi", "Tải ảnh thất bại."); } finally { setIsUploading(false); }
        }
    };

    // =====================================
    // QUẢN LÝ THÀNH VIÊN
    // =====================================
    const friendsNotInGroup = friends.filter(f => !roomData?.members?.some((m: any) => m.id === f.user.id));

    const toggleNewMember = (id: string) => {
        setSelectedNewMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const handleAddMembersSubmit = async () => {
        try {
            await api.post('/conversations/group/add_members', { roomId: roomData.id, userId: user?.id, newMembers: selectedNewMembers });
            socket?.emit("send_message", { roomId: roomData.id, senderId: "system", senderName: "Hệ thống", text: `${user?.fullName} đã thêm thành viên.`, messageType: 'system' });
            setShowAddMemberModal(false); setSelectedNewMembers([]); fetchAllData();
        } catch (error) { Alert.alert("Lỗi", "Thêm thất bại."); }
    };

    const handleRemoveMember = (id: string, name: string) => {
        Alert.alert("Xác nhận", `Xóa ${name} khỏi nhóm?`, [
            { text: "Hủy" },
            { text: "Xóa", style: "destructive", onPress: async () => {
                try {
                    await api.post(`/conversations/group/remove`, { roomId: roomData.id, adminId: user?.id, userId: user?.id, targetUserId: id });
                    setRoomData((prev: any) => ({ ...prev, members: prev.members.filter((m: any) => m.id !== id) }));
                    socket?.emit("group_event", { roomId: roomData.id, action: "member_removed", data: { targetUserId: id } });
                } catch (e) { Alert.alert("Lỗi", "Xóa thất bại."); }
            }}
        ]);
    };

    const handleTransferOwnership = (id: string, name: string) => {
        Alert.alert("Chuyển quyền", `Chuyển chức Nhóm trưởng cho ${name}?`, [
            { text: "Hủy" },
            { text: "Xác nhận", onPress: async () => {
                try {
                    await api.post(`/conversations/group/transfer_owner`, { roomId: roomData.id, adminId: user?.id, newAdminId: id });
                    socket?.emit("send_message", { roomId: roomData.id, senderId: "system", senderName: "Hệ thống", text: `Đã chuyển quyền trưởng nhóm cho ${name}`, messageType: 'system' });
                    setShowTransferModal(false); fetchAllData();
                } catch (e) { Alert.alert("Lỗi", "Chuyển quyền thất bại."); }
            }}
        ]);
    };

    // =====================================
    // RỜI / GIẢI TÁN
    // =====================================
    const handleLeaveGroup = () => {
        if (isOwner && (roomData?.members?.length > 1)) {
            Alert.alert("Chú ý", "Bạn là Nhóm trưởng. Hãy chuyển quyền trước khi rời!", [
                { text: "Đóng" }, { text: "Chuyển quyền", onPress: () => setShowTransferModal(true) }
            ]);
            return;
        }
        Alert.alert("Rời nhóm", "Bạn chắc chắn muốn rời?", [
            { text: "Hủy" },
            { text: "Rời", style: "destructive", onPress: async () => {
                try {
                    await api.post(`/conversations/group/leave`, { roomId: roomData.id, userId: user?.id });
                    socket?.emit("group_event", { roomId: roomData.id, action: "member_removed", data: { targetUserId: user?.id } });
                    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                } catch (e) { Alert.alert("Lỗi", "Không thể rời nhóm."); }
            }}
        ]);
    };

    if (loading) return <SafeAreaView style={[styles.container, isDark && {backgroundColor: '#121212'}, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color="#0068ff" /></SafeAreaView>;

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]} edges={['top']}>
            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color={isDark ? "#fff" : "#000"} size={28} /></TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#fff' }]}>Tùy chọn nhóm</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView bounces={false}>
                {/* 1. THÔNG TIN CƠ BẢN */}
                <View style={[styles.profileSection, isDark && { backgroundColor: '#1e1e1e' }]}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={pickGroupAvatar} disabled={isUploading}>
                        {roomData?.avatar ? <Image source={{ uri: roomData.avatar }} style={styles.avatar} /> : 
                        <View style={[styles.avatar, { backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center' }]}><Users size={50} color="#888" /></View>}
                        <View style={styles.camBadge}><CameraIcon size={16} color="#fff" /></View>
                        {isUploading && <View style={[StyleSheet.absoluteFill, styles.uploadOverlay]}><ActivityIndicator color="#fff" /></View>}
                    </TouchableOpacity>
                    {isEditingName ? (
                        <View style={styles.editNameRow}>
                            <TextInput style={[styles.editInput, isDark && { color: '#fff' }]} value={editNameValue} onChangeText={setEditNameValue} autoFocus />
                            <TouchableOpacity onPress={() => handleUpdateInfo(editNameValue, null)} style={styles.editBtnOk}><Check size={20} color="#fff" /></TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.nameRow} onPress={() => setIsEditingName(true)}>
                            <Text style={[styles.name, isDark && { color: '#fff' }]}>{roomData?.name}</Text>
                            <Edit3 size={18} color="#888" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    )}
                    <Text style={{ color: 'gray', marginTop: 5 }}>{roomData?.members?.length || 0} thành viên</Text>
                </View>

                {/* 2. CÀI ĐẶT QUYỀN */}
                {isOwner && (
                    <View style={[styles.settingSection, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <Text style={styles.sectionTitle}>QUYỀN GỬI TIN NHẮN</Text>
                        <TouchableOpacity style={styles.radioItem} onPress={() => handleUpdateSendMode('all_members')}>
                            <View style={[styles.radioCircle, roomData?.sendMode !== 'leaders_only' && styles.radioActive]}>{roomData?.sendMode !== 'leaders_only' && <View style={styles.radioInner} />}</View>
                            <View style={{ marginLeft: 15 }}><Text style={[styles.radioLabel, isDark && { color: '#fff' }]}>Tất cả mọi người</Text></View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioItem} onPress={() => handleUpdateSendMode('leaders_only')}>
                            <View style={[styles.radioCircle, roomData?.sendMode === 'leaders_only' && styles.radioActive]}>{roomData?.sendMode === 'leaders_only' && <View style={styles.radioInner} />}</View>
                            <View style={{ marginLeft: 15 }}><Text style={[styles.radioLabel, isDark && { color: '#fff' }]}>Chỉ Trưởng nhóm</Text></View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 3. THÀNH VIÊN */}
                <View style={[styles.memberSection, isDark && { backgroundColor: '#1e1e1e' }]}>
                    <View style={styles.memberHeaderRow}>
                        <Text style={styles.sectionTitle}>THÀNH VIÊN</Text>
                        <TouchableOpacity style={styles.addMemberBtn} onPress={() => setShowAddMemberModal(true)}>
                            <UserPlus size={18} color="#0068ff" /><Text style={{ color: '#0068ff', fontWeight: 'bold', marginLeft: 5 }}>Thêm</Text>
                        </TouchableOpacity>
                    </View>
                    {roomData?.members?.map((m: any) => (
                        <View key={m.id} style={styles.memberItem}>
                            <Image source={{ uri: m.avatar || 'https://via.placeholder.com/150' }} style={styles.memberAvatar} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.memberName, isDark && { color: '#fff' }]}>{m.fullName} {m.id === user?.id && "(Bạn)"}</Text>
                                {roomData.adminIds?.includes(m.id) && <Text style={{ color: '#ff9800', fontSize: 12, fontWeight: 'bold' }}><Key size={12}/> Trưởng nhóm</Text>}
                            </View>
                            {isOwner && m.id !== user?.id && (
                                <TouchableOpacity onPress={() => handleRemoveMember(m.id, m.fullName)} style={{ padding: 10 }}><UserMinus color="#ff3b30" size={20} /></TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* 4. HÀNH ĐỘNG */}
                <View style={{ padding: 15, marginTop: 10, paddingBottom: 40 }}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleLeaveGroup}><LogOut color="#ff3b30" size={24} /><Text style={styles.actionTxt}>Rời nhóm</Text></TouchableOpacity>
                    {isOwner && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { marginTop: 15 }]}
                            onPress={() => {
                                Alert.alert(
                                    "Giải tán nhóm",
                                    `Bạn chắc chắn muốn giải tán nhóm "${roomData?.name}"? Hành động này không thể hoàn tác.`,
                                    [
                                        { text: "Hủy", style: "cancel" },
                                        {
                                            text: "Giải tán",
                                            style: "destructive",
                                            onPress: async () => {
                                                try {
                                                    await api.delete(`/conversations/group/${roomData.id}?adminId=${user?.id}`);
                                                    socket?.emit("group_event", { roomId: roomData.id, action: "group_disbanded", data: {} });
                                                    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                                                } catch (e) {
                                                    Alert.alert("Lỗi", "Không thể giải tán nhóm lúc này.");
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <ShieldAlert color="#ff3b30" size={24} />
                            <Text style={styles.actionTxt}>Giải tán nhóm</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* MODAL THÊM THÀNH VIÊN (ĐÃ KHÔI PHỤC) */}
            <Modal visible={showAddMemberModal} animationType="slide" transparent={true}>
                <View style={styles.modalBg}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>Thêm vào nhóm</Text>
                            <TouchableOpacity onPress={() => setShowAddMemberModal(false)}><X size={24} color="red" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={friendsNotInGroup}
                            keyExtractor={(item) => item.user.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.friendItem} onPress={() => toggleNewMember(item.user.id)}>
                                    <View style={[styles.checkbox, selectedNewMembers.includes(item.user.id) && styles.checkboxActive]}>{selectedNewMembers.includes(item.user.id) && <Check size={14} color="#fff" />}</View>
                                    <Image source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} style={styles.memberAvatar} />
                                    <Text style={[styles.memberName, isDark && { color: '#fff' }]}>{item.user.fullName}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>Không có bạn bè để thêm.</Text>}
                        />
                        <TouchableOpacity style={[styles.confirmAddBtn, selectedNewMembers.length === 0 && { backgroundColor: 'gray' }]} disabled={selectedNewMembers.length === 0} onPress={handleAddMembersSubmit}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Xác nhận thêm ({selectedNewMembers.length})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL CHUYỂN QUYỀN (ĐÃ KHÔI PHỤC) */}
            <Modal visible={showTransferModal} animationType="slide" transparent={true}>
                <View style={styles.modalBg}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#1e1e1e' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>Chọn Nhóm trưởng mới</Text>
                            <TouchableOpacity onPress={() => setShowTransferModal(false)}><X size={24} color="red" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={roomData?.members?.filter((m: any) => m.id !== user?.id)}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.friendItem} onPress={() => handleTransferOwnership(item.id, item.fullName)}>
                                    <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} style={styles.memberAvatar} />
                                    <Text style={[styles.memberName, isDark && { color: '#fff' }]}>{item.fullName}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    profileSection: { alignItems: 'center', backgroundColor: '#fff', paddingVertical: 25, marginBottom: 10 },
    avatarWrapper: { position: 'relative', marginBottom: 15 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    camBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0068ff', padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff' },
    uploadOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 22, fontWeight: 'bold' },
    editNameRow: { flexDirection: 'row', alignItems: 'center' },
    editInput: { borderBottomWidth: 1, borderColor: '#ccc', fontSize: 20, width: 200, textAlign: 'center' },
    editBtnOk: { backgroundColor: '#4cd137', padding: 8, borderRadius: 20, marginLeft: 10 },
    settingSection: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
    radioItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: '#0068ff' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0068ff' },
    radioLabel: { fontSize: 16, fontWeight: '600' },
    memberSection: { backgroundColor: '#fff', padding: 15 },
    memberHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { color: 'gray', fontWeight: 'bold', fontSize: 13 },
    addMemberBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f2ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
    memberItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    memberAvatar: { width: 46, height: 46, borderRadius: 23, marginRight: 15 },
    memberName: { fontSize: 16, fontWeight: '500' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebeb', padding: 15, borderRadius: 10, justifyContent: 'center' },
    actionTxt: { color: '#ff3b30', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#eee' },
    checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    checkboxActive: { backgroundColor: '#0068ff', borderColor: '#0068ff' },
    confirmAddBtn: { backgroundColor: '#0068ff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 }
});

export default GroupSettingsScreen;