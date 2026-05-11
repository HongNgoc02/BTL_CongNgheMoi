// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';
// import { Eye, EyeOff } from 'lucide-react'; // Icon con mắt (Chạy lệnh: npm install lucide-react)

// const Register = () => {
//     const navigate = useNavigate();
    
//     // States lưu dữ liệu form
//     const [formData, setFormData] = useState({
//         fullName: '', email: '', password: '', confirmPassword: '', dob: '', gender: 'Khác'
//     });
    
//     // States quản lý UI
//     const [agreeTerms, setAgreeTerms] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [errorMsg, setErrorMsg] = useState('');

//     // States cho bước OTP
//     const [isStepOTP, setIsStepOTP] = useState(false);
//     const [otp, setOtp] = useState('');

//     // Regex kiểm tra mật khẩu (>6 ký tự, hoa, thường, số)
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//         setErrorMsg(''); // Xóa lỗi khi người dùng gõ lại
//     };

//     // XỬ LÝ ĐĂNG KÝ (BƯỚC 1)
//     const handleRegister = async (e) => {
//         e.preventDefault();
        
//         if (!agreeTerms) return setErrorMsg("Bạn phải đồng ý với Điều khoản sử dụng!");
//         if (formData.password !== formData.confirmPassword) return setErrorMsg("Mật khẩu xác nhận không khớp!");
//         if (!passwordRegex.test(formData.password)) return setErrorMsg("Mật khẩu phải từ 6 ký tự, gồm chữ Hoa, thường và số!");

//         setIsLoading(true);
//         try {
//             const res = await api.post('/auth/register', formData);
//             alert(res.data.message);
//             setIsStepOTP(true); // Chuyển sang màn hình nhập OTP
//         } catch (error) {
//             setErrorMsg(error.response?.data?.error || "Đăng ký thất bại");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // XỬ LÝ XÁC THỰC OTP (BƯỚC 2)
//     const handleVerifyOTP = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         try {
//             await api.post('/auth/verify', { email: formData.email, otp });
//             alert("Xác thực thành công! Tài khoản đã được kích hoạt.");
//             navigate('/login'); // Chuyển về trang đăng nhập
//         } catch (error) {
//             setErrorMsg(error.response?.data?.error || "Mã OTP không đúng!");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
//             <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
//                 <h2 className="text-3xl font-black text-[#0068ff] text-center mb-2">OTT CHAT</h2>
//                 <p className="text-center text-gray-500 text-sm mb-6">
//                     {!isStepOTP ? "Đăng ký tài khoản mới" : `Nhập mã OTP đã gửi đến ${formData.email}`}
//                 </p>

//                 {/* HIỂN THỊ LỖI */}
//                 {errorMsg && <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 text-center">{errorMsg}</div>}

//                 {!isStepOTP ? (
//                     /* FORM 1: NHẬP THÔNG TIN ĐĂNG KÝ */
//                     <form onSubmit={handleRegister} className="space-y-4">
//                         <input name="fullName" type="text" placeholder="Họ và tên" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" onChange={handleChange} />
//                         <input name="email" type="email" placeholder="Email" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" onChange={handleChange} />
                        
//                         <div className="grid grid-cols-2 gap-4">
//                             <input name="dob" type="date" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-500" onChange={handleChange} />
//                             <select name="gender" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-500" onChange={handleChange}>
//                                 <option value="Nam">Nam</option>
//                                 <option value="Nữ">Nữ</option>
//                                 <option value="Khác">Khác</option>
//                             </select>
//                         </div>

//                         {/* Ô nhập mật khẩu có Icon con mắt */}
//                         <div className="relative">
//                             <input name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu (>6 ký tự, Hoa, thường, số)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" onChange={handleChange} />
//                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
//                                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                             </button>
//                         </div>

//                         <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Nhập lại mật khẩu" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" onChange={handleChange} />

//                         {/* CHECKBOX ĐIỀU KHOẢN */}
//                         <div className="flex items-start gap-2 pt-2">
//                             <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer" />
//                             <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
//                                 Tôi đồng ý với <span className="text-[#0068ff] font-bold">Điều khoản sử dụng</span>. Nếu vi phạm, tài khoản có thể bị khóa hoặc xóa.
//                             </label>
//                         </div>

//                         <button type="submit" disabled={isLoading} className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${agreeTerms ? 'bg-[#0068ff] hover:bg-[#0054cc] shadow-md' : 'bg-blue-300 cursor-not-allowed'}`}>
//                             {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ TÀI KHOẢN"}
//                         </button>
//                     </form>
//                 ) : (
//                     /* FORM 2: NHẬP OTP */
//                     <form onSubmit={handleVerifyOTP} className="space-y-6">
//                         <input 
//                             type="text" maxLength="6" placeholder="Nhập 6 số OTP" required
//                             className="w-full text-center text-3xl font-bold tracking-[10px] p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0068ff]"
//                             value={otp} onChange={(e) => setOtp(e.target.value)}
//                         />
//                         <button type="submit" disabled={isLoading} className="w-full bg-[#0068ff] hover:bg-[#0054cc] text-white py-3.5 rounded-xl font-bold shadow-md">
//                             {isLoading ? "ĐANG KIỂM TRA..." : "KÍCH HOẠT TÀI KHOẢN"}
//                         </button>
//                     </form>
//                 )}

//                 <p className="mt-8 text-center text-gray-500 text-sm">
//                     Đã có tài khoản? <Link to="/login" className="text-[#0068ff] font-bold hover:underline">Đăng nhập ngay</Link>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default Register;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "Khác",
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isStepOTP, setIsStepOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      return setErrorMsg("Bạn phải đồng ý với Điều khoản sử dụng!");
    }

    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg("Mật khẩu xác nhận không khớp!");
    }

    if (!passwordRegex.test(formData.password)) {
      return setErrorMsg("Mật khẩu phải từ 6 ký tự, gồm chữ Hoa, thường và số!");
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/register", {
        ...formData,
        agreeTerms,
      });

      setSuccessMsg(res.data.message);
      setIsStepOTP(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/verify", {
        email: formData.email,
        otp,
      });

      setSuccessMsg(res.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Mã OTP không đúng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/resend-verification", {
        email: formData.email,
      });
      setSuccessMsg(res.data.message);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Không thể gửi lại OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-black text-[#0068ff] text-center mb-2">OTT CHAT</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          {!isStepOTP ? "Đăng ký tài khoản mới" : `Nhập mã OTP đã gửi đến ${formData.email}`}
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

        {!isStepOTP ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              name="fullName"
              type="text"
              placeholder="Họ và tên"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={formData.fullName}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="dob"
                type="date"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-500"
                value={formData.dob}
                onChange={handleChange}
              />

              <select
                name="gender"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-500"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu (>6 ký tự, Hoa, thường, số)"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                Tôi đồng ý với <span className="text-[#0068ff] font-bold">Điều khoản sử dụng</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                agreeTerms
                  ? "bg-[#0068ff] hover:bg-[#0054cc] shadow-md"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ TÀI KHOẢN"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <input
              type="text"
              maxLength="6"
              placeholder="Nhập 6 số OTP"
              required
              className="w-full text-center text-3xl font-bold tracking-[10px] p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0068ff]"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrorMsg("");
              }}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0068ff] hover:bg-[#0054cc] text-white py-3.5 rounded-xl font-bold shadow-md"
            >
              {isLoading ? "ĐANG KIỂM TRA..." : "KÍCH HOẠT TÀI KHOẢN"}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleResendOTP}
              className="w-full border border-[#0068ff] text-[#0068ff] py-3 rounded-xl font-bold hover:bg-blue-50"
            >
              Gửi lại OTP
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-gray-500 text-sm">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-[#0068ff] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;