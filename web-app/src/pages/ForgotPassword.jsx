// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';
// import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// const ForgotPassword = () => {
//     const navigate = useNavigate();
    
//     // Quản lý các bước (Step 1: Nhập Email, Step 2: Nhập OTP & Mật khẩu mới)
//     const [step, setStep] = useState(1);
    
//     // Dữ liệu form
//     const [email, setEmail] = useState('');
//     const [otp, setOtp] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
    
//     // UI States
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [errorMsg, setErrorMsg] = useState('');
//     const [successMsg, setSuccessMsg] = useState('');

//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

//     // XỬ LÝ BƯỚC 1: GỬI YÊU CẦU LẤY OTP
//     const handleSendOTP = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setErrorMsg('');
//         try {
//             const res = await api.post('/auth/forgot-password', { email });
//             setSuccessMsg(res.data.message);
//             setStep(2); // Chuyển sang bước 2
//         } catch (error) {
//             setErrorMsg(error.response?.data?.error || "Không thể gửi OTP!");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // XỬ LÝ BƯỚC 2: ĐẶT LẠI MẬT KHẨU
//     const handleResetPassword = async (e) => {
//         e.preventDefault();
//         if (newPassword !== confirmPassword) return setErrorMsg("Mật khẩu xác nhận không khớp!");
//         if (!passwordRegex.test(newPassword)) return setErrorMsg("Mật khẩu phải từ 6 ký tự, gồm chữ Hoa, thường và số!");

//         setIsLoading(true);
//         setErrorMsg('');
//         try {
//             await api.post('/auth/reset-password', { email, otp, newPassword });
//             alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
//             navigate('/login'); // Đá về trang đăng nhập
//         } catch (error) {
//             setErrorMsg(error.response?.data?.error || "Mã OTP không đúng hoặc đã hết hạn!");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
//             <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl relative">
//                 {/* Nút quay lại */}
//                 <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-[#0068ff] transition-colors">
//                     <ArrowLeft size={24} />
//                 </Link>

//                 <h2 className="text-3xl font-black text-[#0068ff] text-center mb-2 mt-4">Khôi Phục</h2>
//                 <p className="text-center text-gray-500 text-sm mb-6">
//                     {step === 1 ? "Nhập email để nhận mã xác thực" : "Tạo mật khẩu mới cho tài khoản"}
//                 </p>

//                 {errorMsg && <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 text-center">{errorMsg}</div>}
//                 {successMsg && <div className="bg-green-100 text-green-600 p-3 rounded-xl text-sm font-semibold mb-4 text-center">{successMsg}</div>}

//                 {step === 1 ? (
//                     /* FORM 1: NHẬP EMAIL */
//                     <form onSubmit={handleSendOTP} className="space-y-4">
//                         <input 
//                             type="email" placeholder="Nhập Email của bạn" required 
//                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" 
//                             value={email} onChange={(e) => {setEmail(e.target.value); setErrorMsg('');}} 
//                         />
//                         <button type="submit" disabled={isLoading} className="w-full bg-[#0068ff] hover:bg-[#0054cc] text-white py-3.5 rounded-xl font-bold shadow-md transition-all">
//                             {isLoading ? "ĐANG GỬI MÃ..." : "NHẬN MÃ OTP"}
//                         </button>
//                     </form>
//                 ) : (
//                     /* FORM 2: NHẬP OTP VÀ MẬT KHẨU MỚI */
//                     <form onSubmit={handleResetPassword} className="space-y-4">
//                         <input 
//                             type="text" maxLength="6" placeholder="Nhập 6 số OTP từ Email" required 
//                             className="w-full text-center tracking-widest font-bold text-lg p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" 
//                             value={otp} onChange={(e) => {setOtp(e.target.value); setErrorMsg('');}} 
//                         />
                        
//                         <div className="relative">
//                             <input 
//                                 type={showPassword ? "text" : "password"} placeholder="Mật khẩu mới" required 
//                                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" 
//                                 value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
//                             />
//                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500">
//                                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                             </button>
//                         </div>

//                         <input 
//                             type={showPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu mới" required 
//                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" 
//                             value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
//                         />

//                         <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-all">
//                             {isLoading ? "ĐANG XỬ LÝ..." : "ĐỔI MẬT KHẨU"}
//                         </button>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ForgotPassword;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccessMsg(res.data.message);
      setStep(2);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Không thể gửi OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setErrorMsg("Mật khẩu xác nhận không khớp!");
    }

    if (!passwordRegex.test(newPassword)) {
      return setErrorMsg("Mật khẩu phải từ 6 ký tự, gồm chữ Hoa, thường và số!");
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      setSuccessMsg(res.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl relative">
        <Link
          to="/login"
          className="absolute top-6 left-6 text-gray-400 hover:text-[#0068ff] transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>

        <h2 className="text-3xl font-black text-[#0068ff] text-center mb-2 mt-4">Khôi Phục</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          {step === 1 ? "Nhập email để nhận mã xác thực" : "Tạo mật khẩu mới cho tài khoản"}
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm font-semibold mb-4 text-center">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input
              type="email"
              placeholder="Nhập Email của bạn"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0068ff] hover:bg-[#0054cc] text-white py-3.5 rounded-xl font-bold shadow-md transition-all"
            >
              {isLoading ? "ĐANG GỬI MÃ..." : "NHẬN MÃ OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              maxLength="6"
              placeholder="Nhập 6 số OTP từ Email"
              required
              className="w-full text-center tracking-widest font-bold text-lg p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrorMsg("");
              }}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-all"
            >
              {isLoading ? "ĐANG XỬ LÝ..." : "ĐỔI MẬT KHẨU"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;