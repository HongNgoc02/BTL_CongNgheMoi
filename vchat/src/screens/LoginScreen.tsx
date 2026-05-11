// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
// import api from '../services/api';

// const LoginScreen = ({ navigation }: any) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const handleLogin = async () => {
//         if (!email || !password) return Alert.alert("Thông báo", "Vui lòng nhập đủ thông tin");
//         setLoading(true);
//         try {
//             const res = await api.post('/auth/login', { email, password });
//             await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
//             navigation.replace('Home');
//         } catch (error: any) {
//             Alert.alert("Lỗi", error.response?.data?.error || "Sai email hoặc mật khẩu!");
//         } finally { setLoading(false); }
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.logo}>VChat</Text>
            
//             <View style={styles.inputWrap}>
//                 <Mail size={20} color="#888" />
//                 <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
//             </View>
            
//             <View style={styles.inputWrap}>
//                 <Lock size={20} color="#888" />
//                 <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
//                 <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                     {showPassword ? <EyeOff size={20} color="#0068ff" /> : <Eye size={20} color="#888" />}
//                 </TouchableOpacity>
//             </View>

//             {/* NÚT QUÊN MẬT KHẨU */}
//             <TouchableOpacity 
//     style={styles.forgotBtn} 
//     onPress={() => navigation.navigate('ForgotPassword')} 
// >
//     <Text style={styles.forgotText}>Quên mật khẩu?</Text>
// </TouchableOpacity>

//             <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
//                 {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Đăng nhập</Text>}
//             </TouchableOpacity>

//             {/* KHU VỰC ĐĂNG KÝ */}
//             <View style={styles.footer}>
//                 <Text style={styles.footerText}>Chưa có tài khoản? </Text>
//                 <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//                     <Text style={styles.signUpLink}>Đăng ký ngay</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
//     logo: { fontSize: 45, fontWeight: 'bold', color: '#0068ff', textAlign: 'center', marginBottom: 40 },
//     inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
//     input: { flex: 1, padding: 15, fontSize: 16 },
//     btn: { backgroundColor: '#0068ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
//     btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    
//     // CSS Mới cho 2 nút vừa thêm
//     forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
//     forgotText: { color: '#0068ff', fontSize: 14, fontWeight: '600' },
//     footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
//     footerText: { color: '#666', fontSize: 15 },
//     signUpLink: { color: '#0068ff', fontSize: 15, fontWeight: 'bold' }
// });

// export default LoginScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import api from '../services/api';

// IMPORT USEAPP ĐỂ LẤY THEME VÀ NGÔN NGỮ
import { useApp } from './AppContext'; 

const LoginScreen = ({ navigation }: any) => {
    const { isDark, t } = useApp(); // Lấy isDark và hàm dịch t() ra
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Thông báo", "Vui lòng nhập đủ thông tin");
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            navigation.replace('Home');
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.error || "Sai email hoặc mật khẩu!");
        } finally { setLoading(false); }
    };

    return (
        // Đổi màu nền chính
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
            <Text style={styles.logo}>VChat</Text>
            
            {/* Đổi màu ô nhập liệu */}
            <View style={[styles.inputWrap, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                <Mail size={20} color={isDark ? "#ccc" : "#888"} />
                <TextInput 
                    style={[styles.input, isDark && { color: '#fff' }]} 
                    placeholder={t('email')} // Dùng hàm t() để đổi ngôn ngữ
                    placeholderTextColor={isDark ? "#888" : "#ccc"}
                    value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" 
                />
            </View>
            
            <View style={[styles.inputWrap, isDark && { backgroundColor: '#1e1e1e', borderColor: '#333' }]}>
                <Lock size={20} color={isDark ? "#ccc" : "#888"} />
                <TextInput 
                    style={[styles.input, isDark && { color: '#fff' }]} 
                    placeholder={t('password')} 
                    placeholderTextColor={isDark ? "#888" : "#ccc"}
                    value={password} onChangeText={setPassword} secureTextEntry={!showPassword} 
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="#0068ff" /> : <Eye size={20} color={isDark ? "#ccc" : "#888"} />}
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')} >
                <Text style={styles.forgotText}>{t('forgotPass')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('login')}</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.footerText, isDark && { color: '#aaa' }]}>{t('noAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.signUpLink}>{t('register')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
    logo: { fontSize: 45, fontWeight: 'bold', color: '#0068ff', textAlign: 'center', marginBottom: 40 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    input: { flex: 1, padding: 15, fontSize: 16 },
    btn: { backgroundColor: '#0068ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: '#0068ff', fontSize: 14, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#666', fontSize: 15 },
    signUpLink: { color: '#0068ff', fontSize: 15, fontWeight: 'bold' }
});

export default LoginScreen;