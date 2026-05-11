import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Mail, ShieldCheck, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import api from '../services/api';

const ForgotPasswordScreen = ({ navigation }: any) => {
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Reset mật khẩu
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email) return Alert.alert("Thông báo", "Vui lòng nhập Email!");
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            Alert.alert("Thành công", "Mã OTP khôi phục đã được gửi vào Email của bạn.");
            setStep(2);
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.error || "Email không tồn tại!");
        } finally { setLoading(false); }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) return Alert.alert("Thông báo", "Vui lòng điền đủ mã OTP và mật khẩu mới!");
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            Alert.alert("Thành công", "Mật khẩu đã được thay đổi. Hãy đăng nhập lại.");
            navigation.navigate('Login');
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.error || "Mã OTP không đúng hoặc hết hạn.");
        } finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
                <ChevronLeft color="#000" size={28} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>{step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}</Text>
                <Text style={styles.subTitle}>
                    {step === 1 ? "Nhập email tài khoản VChat để nhận mã khôi phục." : "Nhập mã OTP từ Email và mật khẩu mới của bạn."}
                </Text>

                {step === 1 ? (
                    <View>
                        <View style={styles.inputWrap}>
                            <Mail size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                        </View>
                        <TouchableOpacity style={[styles.btn, email ? styles.btnActive : styles.btnInactive]} onPress={handleSendOTP} disabled={loading || !email}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Gửi mã xác nhận</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <View style={styles.inputWrap}>
                            <ShieldCheck size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Mã OTP 6 số" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
                        </View>
                        <View style={styles.inputWrap}>
                            <Lock size={20} color="#888" />
                            <TextInput style={styles.input} placeholder="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} color="#0068ff" /> : <Eye size={20} color="#888" />}
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.btn, (otp && newPassword) ? styles.btnActive : styles.btnInactive]} onPress={handleResetPassword} disabled={loading}>
                            <Text style={styles.btnText}>Xác nhận đổi mật khẩu</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    backBtn: { padding: 15 },
    content: { paddingHorizontal: 25, marginTop: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#0068ff', marginBottom: 10 },
    subTitle: { fontSize: 15, color: '#666', marginBottom: 30 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
    input: { flex: 1, padding: 15, fontSize: 16 },
    btn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnActive: { backgroundColor: '#0068ff' },
    btnInactive: { backgroundColor: '#82bcf9' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ForgotPasswordScreen;