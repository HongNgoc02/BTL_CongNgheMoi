// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as ImagePicker from 'expo-image-picker';
// import { Camera, User, Calendar, Lock, Trash2, ChevronLeft, Globe, Moon } from 'lucide-react-native';
// import api from '../services/api';
// import { useApp } from '../screens/AppContext';

// const EditProfileScreen = ({ navigation }: any) => {
//     const { isDark, toggleTheme, lang, changeLanguage, t } = useApp();
//     const [user, setUser] = useState<any>(null);
//     const [loading, setLoading] = useState(false);

//     // Form Thông tin cá nhân
//     const [fullName, setFullName] = useState('');
//     const [dob, setDob] = useState('');
//     const [gender, setGender] = useState('Khác');
//     const [avatar, setAvatar] = useState('');

//     // Form Đổi mật khẩu
//     const [oldPassword, setOldPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');

//     // Form Xóa tài khoản
//     const [deletePass, setDeletePass] = useState('');

//     useEffect(() => {
//         const loadUser = async () => {
//             const data = await AsyncStorage.getItem('user');
//             if (data) {
//                 const curr = JSON.parse(data);
//                 setUser(curr);
//                 setFullName(curr.fullName || '');
//                 setDob(curr.dob || '');
//                 setGender(curr.gender || 'Khác');
//                 setAvatar(curr.avatar || '');
//             }
//         };
//         loadUser();
//     }, []);

//     // 1. CẬP NHẬT THÔNG TIN CÁ NHÂN
//     const handleUpdateInfo = async () => {
//         setLoading(true);
//         try {
//             await api.put('/users/update', { userId: user.id, fullName, dob, gender, avatar });
//             const updatedUser = { ...user, fullName, dob, gender, avatar };
//             await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
//             Alert.alert("Thành công", "Đã lưu hồ sơ!");
//         } catch (e) { Alert.alert("Lỗi", "Không thể cập nhật!"); }
//         finally { setLoading(false); }
//     };

//     // 2. ĐỔI MẬT KHẨU (Khớp Chương 3 Backend)
//     const handleChangePassword = async () => {
//         if (newPassword !== confirmPassword) return Alert.alert("Lỗi", "Mật khẩu mới không khớp!");
//         setLoading(true);
//         try {
//             await api.post('/users/change-password', { userId: user.id, oldPassword, newPassword });
//             Alert.alert("Thành công", "Đã đổi mật khẩu!");
//             setOldPassword(''); setNewPassword(''); setConfirmPassword('');
//         } catch (error: any) {
//             Alert.alert("Lỗi", error.response?.data?.error || "Mật khẩu hiện tại không đúng!");
//         } finally { setLoading(false); }
//     };

//     // 3. XÓA TÀI KHỎAN (Khớp Chương 4 Backend)
//     const handleDeleteAccount = () => {
//         Alert.alert("Cảnh báo", "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!", [
//             { text: "Hủy" },
//             { text: "Xác nhận xóa", style: 'destructive', onPress: async () => {
//                 try {
//                     await api.post('/users/delete', { userId: user.id, password: deletePass });
//                     await AsyncStorage.clear();
//                     navigation.replace('Login');
//                 } catch (error: any) {
//                     Alert.alert("Lỗi", error.response?.data?.error || "Mật khẩu xác nhận không đúng!");
//                 }
//             }}
//         ]);
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" /></TouchableOpacity>
//                 <Text style={styles.headerTitle}>Cài đặt tài khoản</Text>
//                 <View style={{ width: 24 }} />
//             </View>

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 {/* Banner & Avatar (Giống ảnh Web 1) */}
//                 <View style={styles.profileHeader}>
//                     <View style={styles.banner} />
//                     <View style={styles.avatarContainer}>
//                         <Image source={{ uri: avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
//                         <TouchableOpacity style={styles.camBtn} onPress={async () => {
//                              let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] });
//                              if (!result.canceled) {
//                                 const formData = new FormData();
//                                 // @ts-ignore
//                                 formData.append('file', { uri: result.assets[0].uri, name: 'avt.jpg', type: 'image/jpeg' });
//                                 const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
//                                 setAvatar(res.data.url);
//                              }
//                         }}><Camera size={16} color="#fff" /></TouchableOpacity>
//                     </View>
//                     <Text style={styles.profileName}>{fullName}</Text>
//                     <Text style={styles.profileEmail}>{user?.email}</Text>
//                 </View>

//                 {/* Phần 1: Thông tin cá nhân */}
//                 <View style={styles.card}>
//                     <View style={styles.cardHeader}><User size={20} color="#0068ff" /><Text style={styles.cardTitle}>Thông tin cá nhân</Text></View>
//                     <Text style={styles.label}>HỌ VÀ TÊN</Text>
//                     <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
                    
//                     <View style={{ flexDirection: 'row', gap: 10 }}>
//                         <View style={{ flex: 1 }}><Text style={styles.label}>NGÀY SINH</Text><TextInput style={styles.input} value={dob} onChangeText={setDob} /></View>
//                         <View style={{ flex: 1 }}><Text style={styles.label}>GIỚI TÍNH</Text>
//                             <TouchableOpacity style={styles.input} onPress={() => setGender(gender === 'Nam' ? 'Nữ' : 'Nam')}>
//                                 <Text>{gender}</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                     <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateInfo}><Text style={styles.btnText}>Lưu hồ sơ</Text></TouchableOpacity>
//                 </View>

//                 {/* Phần 2: Bảo mật (Giống ảnh Web 2) */}
//                 <View style={styles.card}>
//                     <View style={styles.cardHeader}><Lock size={20} color="#ff7f0e" /><Text style={styles.cardTitle}>Bảo mật</Text></View>
//                     <TextInput style={styles.input} placeholder="Mật khẩu hiện tại" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
//                     <View style={{ flexDirection: 'row', gap: 10 }}>
//                         <TextInput style={[styles.input, { flex: 1 }]} placeholder="Mật khẩu mới" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
//                         <TextInput style={[styles.input, { flex: 1 }]} placeholder="Xác nhận mật khẩu mới" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
//                     </View>
//                     <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#ff7f0e' }]} onPress={handleChangePassword}><Text style={styles.btnText}>Cập nhật mật khẩu</Text></TouchableOpacity>
//                 </View>

//                 {/* Phần 3: Vùng nguy hiểm (Giống ảnh Web 2) */}
//                 <View style={[styles.card, { borderColor: '#ffebeb', backgroundColor: '#fff8f8' }]}>
//                     <View style={styles.cardHeader}><Trash2 size={20} color="#d63031" /><Text style={[styles.cardTitle, { color: '#d63031' }]}>Vùng nguy hiểm</Text></View>
//                     <Text style={{ color: '#d63031', fontSize: 13, marginBottom: 10 }}>Xóa tài khoản sẽ khiến bạn không thể đăng nhập lại.</Text>
//                     <TextInput style={styles.input} placeholder="Nhập mật khẩu để xác nhận" secureTextEntry value={deletePass} onChangeText={setDeletePass} />
//                     <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#d63031' }]} onPress={handleDeleteAccount}><Text style={styles.btnText}>Xác nhận xóa tài khoản</Text></TouchableOpacity>
//                 </View>

//                 {/* Phần 4: Cài đặt hệ thống (Giống ảnh Web 3) */}
//                 {/* <View style={[styles.card, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
//                     {/* NÚT ĐỔI NGÔN NGỮ */}
//                 {/* <TouchableOpacity 
//                     style={styles.settingRow} 
//                     onPress={() => changeLanguage(lang === 'vi' ? 'en' : 'vi')}
//                 >
//                     <Globe size={20} color="#0068ff" />
//                     <Text style={[styles.settingTxt, isDark && { color: '#fff' }]}>
//                         {t('lang')}
//                     </Text>
//                 </TouchableOpacity> */}

//                 {/* NÚT ĐỔI GIAO DIỆN */}
//                 {/* <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
//                     <Moon size={20} color="#6c5ce7" />
//                     <Text style={[styles.settingTxt, isDark && { color: '#fff' }]}>
//                         {isDark ? "Giao diện: Tối" : "Giao diện: Sáng"}
//                     </Text>
//                 </TouchableOpacity>
//                 </View> */}

//                 {loading && <ActivityIndicator size="large" color="#0068ff" />}
//             </ScrollView>
            
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f5f6fa' },
//     header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
//     headerTitle: { fontSize: 18, fontWeight: 'bold' },
//     scrollContent: { paddingBottom: 40 },
//     profileHeader: { alignItems: 'center', backgroundColor: '#fff', paddingBottom: 20, marginBottom: 10 },
//     banner: { width: '100%', height: 100, backgroundColor: '#3742fa' },
//     avatarContainer: { marginTop: -50, position: 'relative' },
//     avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
//     camBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0068ff', borderRadius: 15, padding: 6, borderWidth: 2, borderColor: '#fff' },
//     profileName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
//     profileEmail: { color: '#888', fontSize: 14 },
//     card: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#eee' },
//     cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
//     cardTitle: { fontSize: 17, fontWeight: 'bold' },
//     label: { fontSize: 11, color: '#a0a0a0', fontWeight: 'bold', marginBottom: 5 },
//     input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 15, fontSize: 15 },
//     saveBtn: { padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#0068ff', marginTop: 5 },
//     btnText: { color: '#fff', fontWeight: 'bold' },
//     settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
//     settingTxt: { fontSize: 16, color: '#2d3436' }
// });

// export default EditProfileScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, Lock, Trash2, ChevronLeft } from 'lucide-react-native';
import api from '../services/api';
import { useApp } from './AppContext'; 

const EditProfileScreen = ({ navigation }: any) => {
    const { isDark, t } = useApp(); 
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Khác');
    const [avatar, setAvatar] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePass, setDeletePass] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const data = await AsyncStorage.getItem('user');
            if (data) {
                const curr = JSON.parse(data);
                setUser(curr);
                setFullName(curr.fullName || '');
                setDob(curr.dob || '');
                setGender(curr.gender || 'Khác');
                setAvatar(curr.avatar || '');
            }
        };
        loadUser();
    }, []);

    const handleUpdateInfo = async () => {
        setLoading(true);
        try {
            await api.put('/users/update', { userId: user.id, fullName, dob, gender, avatar });
            const updatedUser = { ...user, fullName, dob, gender, avatar };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            Alert.alert("Thành công", "Đã lưu hồ sơ!");
        } catch (e) {
            Alert.alert("Lỗi", "Không thể cập nhật!");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword)
            return Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
        if (newPassword !== confirmPassword)
            return Alert.alert("Lỗi", "Mật khẩu mới không khớp!");
        setLoading(true);
        try {
            await api.post('/users/change-password', { userId: user.id, oldPassword, newPassword });
            Alert.alert("Thành công", "Đã đổi mật khẩu!");
            setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.error || "Mật khẩu hiện tại không đúng!");
        } finally { setLoading(false); }
    };

    const handleDeleteAccount = () => {
        Alert.alert("Xóa tài khoản", "Tính năng đang được cập nhật.");
    };

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]} edges={['top']}>
            
            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e', borderBottomColor: '#333' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#fff' }]}>Thiết lập tài khoản</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={[styles.profileHeader, isDark && { backgroundColor: '#121212' }]}>
                    <View style={styles.banner} />
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                        <TouchableOpacity style={styles.camBtn} onPress={async () => {
                             let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false });
                             if (!result.canceled) {
                                const formData = new FormData();
                                // @ts-ignore
                                formData.append('file', { uri: result.assets[0].uri, name: 'avt.jpg', type: 'image/jpeg' });
                                const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                setAvatar(res.data.url);
                             }
                        }}><Camera size={16} color="#fff" /></TouchableOpacity>
                    </View>
                    <Text style={[styles.profileName, isDark && { color: '#fff' }]}>{fullName}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                
                <View style={[styles.card, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                    <View style={styles.cardHeader}>
                        <User size={20} color="#0068ff" />
                        <Text style={[styles.cardTitle, isDark && { color: '#fff' }]}>Thông tin cá nhân</Text>
                    </View>
                    
                    <Text style={styles.label}>HỌ VÀ TÊN</Text>
                    <TextInput 
                        style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#fff' }]} 
                        value={fullName} 
                        onChangeText={setFullName} 
                    />
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>NGÀY SINH</Text>
                            <TextInput 
                                style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#fff' }]} 
                                value={dob} 
                                onChangeText={setDob} 
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>GIỚI TÍNH</Text>
                            <TouchableOpacity 
                                style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444' }]} 
                                onPress={() => setGender(gender === 'Nam' ? 'Nữ' : 'Nam')}
                            >
                                <Text style={isDark && { color: '#fff' }}>{gender}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateInfo}>
                        <Text style={styles.btnText}>{t('save')}</Text>
                    </TouchableOpacity>
                </View>

                
                <View style={[styles.card, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                    <View style={styles.cardHeader}>
                        <Lock size={20} color="#ff7f0e" />
                        <Text style={[styles.cardTitle, isDark && { color: '#fff' }]}>Bảo mật</Text>
                    </View>
                    <TextInput
                        placeholder="Mật khẩu hiện tại"
                        placeholderTextColor="#888"
                        style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#fff' }]}
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <TextInput
                        placeholder="Mật khẩu mới"
                        placeholderTextColor="#888"
                        style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#fff' }]}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TextInput
                        placeholder="Xác nhận mật khẩu mới"
                        placeholderTextColor="#888"
                        style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#fff' }]}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#ff7f0e' }]} onPress={handleChangePassword}>
                        <Text style={styles.btnText}>Cập nhật mật khẩu</Text>
                    </TouchableOpacity>
                </View>

                
                <View style={[styles.card, { borderColor: '#ffebeb', backgroundColor: isDark ? '#2a1a1a' : '#fff8f8' }]}>
                    <View style={styles.cardHeader}>
                        <Trash2 size={20} color="#d63031" />
                        <Text style={[styles.cardTitle, { color: '#d63031' }]}>Vùng nguy hiểm</Text>
                    </View>
                    <TextInput 
                        placeholder="Nhập mật khẩu xác nhận" 
                        placeholderTextColor="#888"
                        style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#fff' }]} 
                        secureTextEntry 
                        value={deletePass} 
                        onChangeText={setDeletePass} 
                    />
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#d63031' }]} onPress={handleDeleteAccount}>
                        <Text style={styles.btnText}>Xác nhận xóa tài khoản</Text>
                    </TouchableOpacity>
                </View>

                {loading && <ActivityIndicator size="large" color="#0068ff" style={{ marginTop: 10 }} />}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6fa' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 40 },
    profileHeader: { alignItems: 'center', backgroundColor: '#fff', paddingBottom: 20 },
    banner: { width: '100%', height: 100, backgroundColor: '#0068ff' },
    avatarContainer: { marginTop: -50, position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
    camBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0068ff', borderRadius: 15, padding: 6, borderWidth: 2, borderColor: '#fff' },
    profileName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    profileEmail: { color: '#888', fontSize: 14 },
    card: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#eee' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
    cardTitle: { fontSize: 17, fontWeight: 'bold' },
    label: { fontSize: 11, color: '#a0a0a0', fontWeight: 'bold', marginBottom: 5 },
    input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 15, fontSize: 15 },
    saveBtn: { padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#0068ff', marginTop: 5 },
    btnText: { color: '#fff', fontWeight: 'bold' }
});

export default EditProfileScreen;