import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { User, Mail, Lock, ChevronLeft, ShieldCheck, Eye, EyeOff, Calendar, CheckSquare, Square } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import thư viện Lịch
import api from '../services/api';

const RegisterScreen = ({ navigation }: any) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Khác');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [otp, setOtp] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // State cho Lịch
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Xử lý khi chọn ngày trên Lịch
    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios'); // Đóng lịch trên Android
        setDate(currentDate);

        // Chuyển format sang dd/mm/yyyy
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        setDob(`${day}/${month}/${year}`);
    };

    // Kiểm tra xem đã điền đủ thông tin chưa để đổi màu nút
    const isStep1Valid = name && email && password && confirmPassword && dob && agreeTerms;
    const isStep2Valid = otp.length === 6;

    const handleRegister = async () => {
        if (!isStep1Valid) return; // Nút đã bị disable nhưng cứ chặn cho chắc
        if (password !== confirmPassword) {
            return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            return Alert.alert("Lỗi", "Mật khẩu phải > 6 ký tự, gồm chữ hoa, thường và số!");
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { 
                fullName: name, 
                email: email, 
                password: password,
                dob: dob,
                gender: gender
            });
            Alert.alert("Thành công", "Mã OTP đã được gửi đến Email của bạn!");
            setStep(2);
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.error || "Lỗi đăng ký!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!isStep2Valid) return;
        setLoading(true);
        try {
            await api.post('/auth/verify', { email, otp });
            Alert.alert("Chào mừng!", "Đăng ký thành công. Đăng nhập ngay!");
            navigation.replace('Login');
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.error || "Mã OTP sai hoặc hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
                    <ChevronLeft color="#000" size={28} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>{step === 1 ? 'OTT CHAT' : 'Xác thực Email'}</Text>
                <Text style={styles.subTitle}>
                    {step === 1 ? 'Đăng ký tài khoản mới' : `Nhập mã 6 số được gửi đến ${email}`}
                </Text>

                {step === 1 ? (
                    <View style={styles.form}>
                        <View style={styles.inputWrap}>
                            <User size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Họ và tên" value={name} onChangeText={setName} />
                        </View>
                        <View style={styles.inputWrap}>
                            <Mail size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                        </View>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                            {/* NÚT CHỌN NGÀY SINH CÓ LỊCH */}
                            <TouchableOpacity 
                                style={[styles.inputWrap, { flex: 1, marginBottom: 0, marginRight: 10 }]} 
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Calendar size={20} color="#888" />
                                <Text style={[styles.input, { color: dob ? '#000' : '#888', paddingTop: 14 }]}>
                                    {dob || "dd/mm/yyyy"}
                                </Text>
                            </TouchableOpacity>

                            {/* HIỂN THỊ LỊCH */}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                    maximumDate={new Date()} // Không cho chọn ngày ở tương lai
                                />
                            )}
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {['Nam', 'Nữ', 'Khác'].map((g) => (
                                    <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)}>
                                        <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputWrap}>
                            <Lock size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Mật khẩu (>6 ký tự, Hoa, thường, số)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} color="#0068ff" /> : <Eye size={20} color="#888" />}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrap}>
                            <ShieldCheck size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                        </View>

                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity onPress={() => setAgreeTerms(!agreeTerms)} style={{ marginRight: 8 }}>
                                {agreeTerms ? <CheckSquare size={22} color="#0068ff" /> : <Square size={22} color="#888" />}
                            </TouchableOpacity>
                            <Text style={styles.checkboxText}>
                                Tôi đồng ý với <Text style={styles.linkText}>Điều khoản sử dụng</Text>.
                            </Text>
                        </View>

                        {/* NÚT ĐĂNG KÝ (Đổi màu theo biến isStep1Valid) */}
                        <TouchableOpacity 
                            style={[styles.btn, isStep1Valid ? styles.btnActive : styles.btnInactive]} 
                            onPress={handleRegister} 
                            disabled={!isStep1Valid || loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ĐĂNG KÝ TÀI KHOẢN</Text>}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.signInLink}>Đăng nhập ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <View style={styles.inputWrap}>
                            <ShieldCheck size={20} color="#888" />
                            <TextInput 
                                style={[styles.input, { fontSize: 20, textAlign: 'center', letterSpacing: 5 }]} 
                                placeholder="------" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6}
                            />
                        </View>
                        
                        {/* NÚT XÁC NHẬN OTP (Đổi màu theo biến isStep2Valid) */}
                        <TouchableOpacity 
                            style={[styles.btn, isStep2Valid ? styles.btnActive : styles.btnInactive]} 
                            onPress={handleVerifyOTP} 
                            disabled={!isStep2Valid || loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Xác nhận OTP</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { padding: 15 },
    content: { paddingHorizontal: 25, paddingBottom: 50 },
    title: { fontSize: 36, fontWeight: 'bold', color: '#0068ff', textAlign: 'center', marginBottom: 5 },
    subTitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30 },
    form: { marginTop: 10 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    input: { flex: 1, paddingVertical: 12, fontSize: 15 },
    genderBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginLeft: 5 },
    genderBtnActive: { backgroundColor: '#0068ff', borderColor: '#0068ff' },
    genderText: { color: '#666', fontSize: 13 },
    genderTextActive: { color: '#fff', fontWeight: 'bold' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
    checkboxText: { fontSize: 14, color: '#666' },
    linkText: { color: '#0068ff', fontWeight: 'bold' },
    
    // CSS CHO MÀU NÚT BẤM
    btn: { padding: 16, borderRadius: 8, alignItems: 'center' },
    btnActive: { backgroundColor: '#0068ff' }, // Đủ thông tin -> Nút sáng lên màu xanh đậm
    btnInactive: { backgroundColor: '#82bcf9' }, // Chưa đủ -> Nút mờ đi màu xanh nhạt
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
    footerText: { color: '#666', fontSize: 14 },
    signInLink: { color: '#0068ff', fontSize: 14, fontWeight: 'bold' }
});

export default RegisterScreen;