import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Globe, Moon, LogOut, ChevronRight, MessageSquare, Users, Settings } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import AppContext cùng thư mục
import { useApp } from './AppContext'; 

const SettingsScreen = ({ navigation }: any) => {
    // Lấy trạng thái Sáng/Tối và Ngôn ngữ từ Global
    const { isDark, toggleTheme, lang, changeLanguage } = useApp();

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]} edges={['top']}>
            {/* HEADER */}
            <View style={[styles.header, isDark && { backgroundColor: '#1e1e1e', borderBottomColor: '#333' }]}>
                <Text style={[styles.headerTitle, isDark && { color: '#fff' }]}>Cài đặt</Text>
            </View>

            {/* NỘI DUNG CHÍNH */}
            <View style={{ flex: 1 }}>
                <View style={[styles.section, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                    
                    {/* Mục Chỉnh sửa hồ sơ */}
                    <TouchableOpacity style={[styles.row, isDark && { borderBottomColor: '#333' }]} onPress={() => navigation.navigate('EditProfile')}>
                        <View style={[styles.iconWrap, { backgroundColor: '#e3f2fd' }]}><User size={20} color="#0068ff" /></View>
                        <Text style={[styles.rowTxt, isDark && { color: '#fff' }]}>Chỉnh sửa hồ sơ</Text>
                        <ChevronRight size={20} color="#ccc" />
                    </TouchableOpacity>

                    {/* Mục Đổi Ngôn ngữ */}
                    <TouchableOpacity style={[styles.row, isDark && { borderBottomColor: '#333' }]} onPress={() => changeLanguage(lang === 'vi' ? 'en' : 'vi')}>
                        <View style={[styles.iconWrap, { backgroundColor: '#f3e5f5' }]}><Globe size={20} color="#9c27b0" /></View>
                        <View style={{ flex: 1 }}><Text style={[styles.rowTxt, isDark && { color: '#fff' }]}>Ngôn ngữ</Text></View>
                        <Text style={styles.valTxt}>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
                    </TouchableOpacity>

                    {/* Mục Chế độ tối (Dark Mode) */}
                    <View style={styles.row}>
                        <View style={[styles.iconWrap, { backgroundColor: '#fff3e0' }]}><Moon size={20} color="#ff9800" /></View>
                        <Text style={[styles.rowTxt, isDark && { color: '#fff' }]}>Chế độ tối</Text>
                        <Switch 
                            value={isDark} 
                            onValueChange={toggleTheme} 
                            trackColor={{ false: "#767577", true: "#0068ff" }} 
                            thumbColor={"#fff"}
                        />
                    </View>
                </View>

                {/* Nút Đăng xuất */}
                <TouchableOpacity style={[styles.logoutBtn, isDark && { backgroundColor: '#1e1e1e' }]} onPress={handleLogout}>
                    <LogOut size={20} color="#ff3b30" />
                    <Text style={styles.logoutTxt}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            {/* FOOTER ĐIỀU HƯỚNG */}
            <View style={[styles.footer, isDark && { backgroundColor: '#1e1e1e', borderTopColor: '#333' }]}>
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Home')}>
                    <MessageSquare size={24} color="#888" />
                    <Text style={{color:'#888', fontSize:11, marginTop: 4}}>Tin nhắn</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Contact')}>
                    <Users size={24} color="#888" />
                    <Text style={{color:'#888', fontSize:11, marginTop: 4}}>Danh bạ</Text>
                </TouchableOpacity>

                {/* Tab Cài đặt đang Active nên có màu xanh */}
                <TouchableOpacity style={styles.tab}>
                    <Settings size={24} color="#0068ff" />
                    <Text style={{color:'#0068ff', fontSize:11, marginTop: 4}}>Cài đặt</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 0.5, borderColor: '#eee' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    section: { marginTop: 15, backgroundColor: '#fff', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#eee' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
    iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowTxt: { flex: 1, fontSize: 16, fontWeight: '500' },
    valTxt: { color: '#888', marginRight: 10 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 15, backgroundColor: '#fff' },
    logoutTxt: { marginLeft: 10, color: '#ff3b30', fontWeight: 'bold', fontSize: 16 },
    footer: { flexDirection: 'row', borderTopWidth: 0.5, borderColor: '#eee', paddingVertical: 10, backgroundColor: '#fff' },
    tab: { flex: 1, alignItems: 'center' }
});

export default SettingsScreen;