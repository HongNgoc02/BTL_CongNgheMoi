// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';
// import { Eye, EyeOff } from 'lucide-react';

// const Login = () => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({ email: '', password: '' });
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [errorMsg, setErrorMsg] = useState('');

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//         setErrorMsg('');
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         try {
//             const res = await api.post('/auth/login', formData);
            
//             // Lưu thông tin user vào trình duyệt để các trang khác có thể dùng
//             localStorage.setItem('user', JSON.stringify(res.data.user));
            
//             alert(res.data.message);
//             // Đăng nhập xong thì chuyển hướng vào trang Chat (lát nữa mình làm)
//             navigate('/chat'); 
//         } catch (error) {
//             setErrorMsg(error.response?.data?.error || "Sai email hoặc mật khẩu!");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
//             <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
//                 <h2 className="text-3xl font-black text-[#0068ff] text-center mb-2">OTT CHAT</h2>
//                 <p className="text-center text-gray-500 text-sm mb-6">Đăng nhập để kết nối với bạn bè</p>

//                 {errorMsg && <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 text-center">{errorMsg}</div>}

//                 <form onSubmit={handleLogin} className="space-y-4">
//                     <input 
//                         name="email" type="email" placeholder="Email của bạn" required 
//                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" 
//                         onChange={handleChange} 
//                     />
                    
//                     <div className="relative">
//                         <input 
//                             name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu" required 
//                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]" 
//                             onChange={handleChange} 
//                         />
//                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500">
//                             {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                         </button>
//                     </div>

//                     <div className="flex justify-end">
//                         <Link to="/forgot-password" className="text-sm text-[#0068ff] hover:underline font-semibold">
//                             Quên mật khẩu?
//                         </Link>
//                     </div>

//                     <button type="submit" disabled={isLoading} className="w-full bg-[#0068ff] hover:bg-[#0054cc] text-white py-3.5 rounded-xl font-bold shadow-md transition-all">
//                         {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
//                     </button>
//                 </form>

//                 <p className="mt-8 text-center text-gray-500 text-sm">
//                     Chưa có tài khoản? <Link to="/register" className="text-[#0068ff] font-bold hover:underline">Đăng ký ngay</Link>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default Login;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Sai email hoặc mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-black text-[#0068ff] text-center mb-2">OTT CHAT</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Đăng nhập để kết nối với bạn bè
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email của bạn"
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0068ff]"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-[#0068ff] hover:underline font-semibold"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0068ff] hover:bg-[#0054cc] text-white py-3.5 rounded-xl font-bold shadow-md transition-all"
          >
            {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-[#0068ff] font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;