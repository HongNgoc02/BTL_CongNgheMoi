import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, Users } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useApp } from './AppContext';

const CreateGroupScreen = ({ navigation }: any) => {
    const { isDark, user } = useApp();
    const [friends, setFriends] = useState<any[]>([]);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách bạn bè khi vào màn hình
    useFocusEffect(useCallback(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get(`/friends/${user.id}`);
                setFriends(res.data.acceptedFriends || []);
            } catch (e) { console.error(e); }
        };
        fetchFriends();
    }, [user]));

    const toggleMember = (id: string) => {
        setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên nhóm!");
        if (selectedMembers.length < 2) return Alert.alert("Lỗi", "Cần ít nhất 2 thành viên (ngoài bạn) để tạo nhóm!");

        setLoading(true);
        try {
            await api.post('/conversations/group', {
                name: groupName,
                creatorId: user.id,
                memberIds: [...selectedMembers, user.id]
            });
            Alert.alert("Thành công", "Tạo nhóm thành công!");
            navigation.goBack(); // Quay lại màn hình Home
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tạo nhóm lúc này.");
        } finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]} edges={['top']}>
            {/* HEADER */}
            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color={isDark ? "#fff" : "#000"} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#fff' }]}>Tạo nhóm mới</Text>
                <TouchableOpacity onPress={handleCreateGroup} disabled={selectedMembers.length < 2 || !groupName || loading}>
                    {loading ? <ActivityIndicator color="#0068ff" /> : <Text style={[styles.createBtn, (selectedMembers.length < 2 || !groupName) && { color: 'gray' }]}>Tạo</Text>}
                </TouchableOpacity>
            </View>

            <View style={{ padding: 15 }}>
                <View style={[styles.inputWrap, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                    <Users color={isDark ? "#aaa" : "#888"} size={20} />
                    <TextInput 
                        style={[styles.input, isDark && { color: '#fff' }]} 
                        placeholder="Đặt tên nhóm..." placeholderTextColor="#888"
                        value={groupName} onChangeText={setGroupName}
                    />
                </View>
                <Text style={{ fontWeight: 'bold', color: 'gray', marginBottom: 10, marginTop: 10 }}>
                    CHỌN BẠN BÈ ({selectedMembers.length})
                </Text>
            </View>

            <FlatList
                data={friends}
                keyExtractor={(item) => item.user.id}
                renderItem={({ item }) => {
                    const isSelected = selectedMembers.includes(item.user.id);
                    return (
                        <TouchableOpacity style={[styles.friendItem, isDark && { borderBottomColor: '#333' }]} onPress={() => toggleMember(item.user.id)}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                {isSelected && <Check size={16} color="#fff" />}
                            </View>
                            <Image source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                            <Text style={[styles.name, isDark && { color: '#fff' }]}>{item.user.fullName}</Text>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>Chưa có bạn bè nào.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    createBtn: { fontSize: 16, fontWeight: 'bold', color: '#0068ff' },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
    input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16 },
    friendItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'transparent', borderBottomWidth: 0.5, borderColor: '#eee' },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    checkboxActive: { backgroundColor: '#0068ff', borderColor: '#0068ff' },
    avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 15 },
    name: { fontSize: 16, fontWeight: '500' }
});

export default CreateGroupScreen;