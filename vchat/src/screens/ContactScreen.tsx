import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Search, UserPlus, UserCheck, UserX, UserMinus, Clock, MessageSquare, Users, Settings, X } from 'lucide-react-native';
import api from '../services/api';
import { useApp } from './AppContext';

const ContactScreen = ({ navigation }: any) => {
    const { isDark, t } = useApp();

    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('FRIENDS');
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<any>(null);

    const loadData = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;
        const curr = JSON.parse(userData);
        setUser(curr);
        try {
            const [friendRes, convRes] = await Promise.all([
                api.get(`/friends/${curr.id}`),
                api.get(`/conversations/user/${curr.id}`)
            ]);
            setFriends(friendRes.data.acceptedFriends || []);
            setPendingRequests(friendRes.data.pendingRequests || []);
            setSentRequests(friendRes.data.sentRequests || []);
            setMyGroups((convRes.data || []).filter((c: any) => c.id?.startsWith('GROUP_')));
        } catch (error) { console.error(error); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const handleSearch = async () => {
        if (!searchEmail.trim()) return Alert.alert("Thông báo", "Vui lòng nhập email!");
        if (user && searchEmail.trim().toLowerCase() === user.email.toLowerCase()) {
            return Alert.alert("Thông báo", "Bạn không thể tự kết bạn với chính mình!");
        }

        try {
            const res = await api.post('/friends/search', { email: searchEmail });
            setSearchResult(res.data);
        } catch (e) {
            Alert.alert("Lỗi", "Không tìm thấy user!");
            setSearchResult(null);
        }
    };

    const sendRequest = async (rid: string) => {
        await api.post('/friends/request', { senderId: user.id, receiverId: rid });
        Alert.alert("Thành công", "Đã gửi lời mời!");
        setSearchResult(null);
        loadData();
    };

    const handleUnfriend = (friendshipId: string, friendName: string) => {
        Alert.alert(
            "Hủy kết bạn",
            `Bạn có chắc chắn muốn hủy kết bạn với ${friendName}?`,
            [
                { text: "Đóng", style: "cancel" },
                {
                    text: "Hủy kết bạn",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.post('/friends/delete', { friendshipId });
                            loadData();
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể hủy kết bạn lúc này.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]} edges={['top']}>

            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e' }]}>
                <View style={[styles.searchBar, isDark && { backgroundColor: '#333' }]}>
                    <Search size={18} color={isDark ? "#aaa" : "#888"} />
                    <TextInput
                        placeholder={t('searchFriend')}
                        placeholderTextColor={isDark ? "#aaa" : "#888"}
                        style={[styles.input, isDark && { color: '#fff' }]}
                        value={searchEmail}
                        onChangeText={setSearchEmail}
                    />
                    <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                        <Text style={{color:'#fff'}}>{t('searchBtn')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {searchResult && (
                <View style={[styles.listItem, isDark && { borderBottomColor: '#333' }]}>
                    <Image source={{ uri: searchResult.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                    <Text style={[{flex:1, marginLeft:10}, isDark && { color: '#fff' }]}>{searchResult.fullName}</Text>
                    <TouchableOpacity onPress={() => sendRequest(searchResult.id)}><UserPlus color="#0068ff" /></TouchableOpacity>
                </View>
            )}

            <View style={[styles.tabBar, isDark && { borderBottomColor: '#333' }]}>
                {['FRIENDS', 'PENDING', 'SENT', 'GROUPS'].map(tab => (
                    <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabTxt, activeTab === tab && {color: '#0068ff'}]}>
                            {tab === 'FRIENDS' ? t('friends') : tab === 'PENDING' ? t('pending') : tab === 'SENT' ? t('sent') : 'NHÓM'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'GROUPS' ? (
                <FlatList
                    data={myGroups}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.listItem, isDark && { borderBottomColor: '#333' }]}
                            onPress={() => navigation.navigate('ChatDetail', { roomId: item.id, roomName: item.name, isOnline: false })}
                        >
                            {item.avatar
                                ? <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                : <View style={[styles.avatar, { backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center' }]}><Users size={26} color="#0068ff" /></View>
                            }
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={[{ fontWeight: 'bold', fontSize: 16 }, isDark && { color: '#fff' }]}>{item.name}</Text>
                                <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{item.members?.length || 0} thành viên</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('GroupSettingsScreen', { activeRoom: { roomId: item.id, ...item } })} style={{ padding: 8 }}>
                                <Settings size={20} color="#888" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>Chưa tham gia nhóm nào.</Text>}
                />
            ) : (
                <FlatList
                    data={activeTab === 'FRIENDS' ? friends : activeTab === 'PENDING' ? pendingRequests : sentRequests}
                    keyExtractor={(item) => item.friendshipId}
                    renderItem={({ item }) => (
                        <View style={[styles.listItem, isDark && { borderBottomColor: '#333' }]}>

                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                disabled={activeTab !== 'FRIENDS'}
                                onPress={async () => {
                                    try {
                                        const res = await api.post('/conversations/1-1', { senderId: user.id, receiverId: item.user.id });
                                        navigation.navigate('ChatDetail', { roomId: res.data.id, roomName: item.user.fullName, isOnline: false });
                                    } catch (error) { Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện"); }
                                }}
                            >
                                <Image source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                                <View style={{flex:1, marginLeft:15}}>
                                    <Text style={[{fontWeight:'bold', fontSize: 16}, isDark && { color: '#fff' }]}>{item.user.fullName}</Text>
                                </View>
                            </TouchableOpacity>

                            {activeTab === 'PENDING' && (
                                <View style={{flexDirection:'row'}}>
                                    <TouchableOpacity onPress={() => api.post('/friends/accept', {friendshipId: item.friendshipId}).then(loadData)} style={styles.iconBtn}><UserCheck color="#4cd137" /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => api.post('/friends/delete', {friendshipId: item.friendshipId}).then(loadData)} style={styles.iconBtn}><UserX color="#ff3b30" /></TouchableOpacity>
                                </View>
                            )}

                            {activeTab === 'SENT' && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Clock color={isDark ? "#aaa" : "#888"} size={20} style={{ marginRight: 15 }} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert("Xác nhận", "Bạn muốn hủy lời mời kết bạn này?", [
                                                { text: "Đóng", style: "cancel" },
                                                {
                                                    text: "Hủy lời mời",
                                                    style: "destructive",
                                                    onPress: async () => {
                                                        try {
                                                            await api.post('/friends/delete', { friendshipId: item.friendshipId });
                                                            loadData();
                                                        } catch (error) { Alert.alert("Lỗi", "Không thể hủy lời mời."); }
                                                    }
                                                }
                                            ]);
                                        }}
                                    >
                                        <X color="#ff3b30" size={24} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {activeTab === 'FRIENDS' && (
                                <TouchableOpacity onPress={() => handleUnfriend(item.friendshipId, item.user.fullName)}>
                                    <UserMinus color="#ff3b30" size={24} style={{ paddingLeft: 15, paddingVertical: 10 }} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>{t('emptyList')}</Text>}
                />
            )}

            <View style={[styles.footer, isDark && { backgroundColor: '#1e1e1e', borderTopColor: '#333' }]}>
                <TouchableOpacity style={styles.fTab} onPress={() => navigation.navigate('Home')}><MessageSquare size={24} color="#888" /><Text style={styles.fTxt}>{t('chat')}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.fTab}><Users size={24} color="#0068ff" /><Text style={[styles.fTxt, {color:'#0068ff'}]}>{t('contact')}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.fTab} onPress={() => navigation.navigate('Settings')}><Settings size={24} color="#888" /><Text style={styles.fTxt}>{t('settings')}</Text></TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 15 },
    searchBar: { flexDirection: 'row', backgroundColor: '#f1f2f6', borderRadius: 10, alignItems: 'center', paddingLeft: 10 },
    input: { flex: 1, padding: 10 },
    searchBtn: { backgroundColor: '#0068ff', padding: 10, borderRadius: 8, marginRight: 5 },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
    tab: { flex: 1, padding: 15, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderColor: '#0068ff' },
    tabTxt: { fontWeight: 'bold', color: '#888' },
    listItem: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#eee' },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    iconBtn: { marginLeft: 15 },
    footer: { flexDirection: 'row', borderTopWidth: 0.5, borderColor: '#eee', paddingVertical: 10, backgroundColor: '#fff' },
    fTab: { flex: 1, alignItems: 'center' },
    fTxt: { fontSize: 11, marginTop: 4, color: '#888' }
});

export default ContactScreen;
