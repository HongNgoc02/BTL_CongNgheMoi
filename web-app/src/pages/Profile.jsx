import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, User as UserIcon, Lock, Trash2, Save, Camera, CheckCircle, XCircle, LogOut,
} from "lucide-react";
import api from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: "", dob: "", gender: "Khác", avatar: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMsg({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const syncUser = (nextUser) => {
    setUser(nextUser);
    setProfileData({
      fullName: nextUser.fullName || "",
      dob: nextUser.dob || "",
      gender: nextUser.gender || "Khác",
      avatar: nextUser.avatar || "",
    });
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  // SỬA LỖI 1: Không gọi API /users/me vì Backend chưa có. Dùng luôn dữ liệu trong localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return navigate("/login");
    }
    const parsedUser = JSON.parse(storedUser);
    syncUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // SỬA LỖI 3: Chuyển ảnh thành chuỗi Base64 để lưu chung vào Backend
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return showMessage("error", "Ảnh quá lớn! Vui lòng chọn file dưới 2MB.");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewAvatar(base64String);
        // Lưu tạm vào profileData, chờ bấm nút "Lưu hồ sơ" mới đưa lên Server
        setProfileData(prev => ({ ...prev, avatar: base64String }));
    };
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileData.fullName.trim()) return showMessage("error", "Họ tên không được để trống!");
    
    const selectedDate = new Date(profileData.dob);
    if (profileData.dob && selectedDate > new Date()) {
      return showMessage("error", "Ngày sinh không thể lớn hơn ngày hiện tại!");
    }

    setIsLoading(true);
    try {
      // SỬA LỖI 2: Thêm userId vào request
      await api.put("/users/update", {
        userId: user.id, 
        fullName: profileData.fullName,
        dob: profileData.dob,
        gender: profileData.gender,
        avatar: profileData.avatar
      });

      // Backend trả về message, nên ta tự cập nhật local state
      const updatedUser = { ...user, ...profileData };
      syncUser(updatedUser);
      showMessage("success", "Đã lưu thay đổi hồ sơ!");
    } catch (error) {
      showMessage("error", error.response?.data?.error || "Không thể cập nhật hồ sơ!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!passwordRegex.test(passwordData.newPassword)) return showMessage("error", "Mật khẩu mới không đủ mạnh!");
    if (passwordData.newPassword !== passwordData.confirmPassword) return showMessage("error", "Mật khẩu xác nhận không khớp!");
    if (passwordData.oldPassword === passwordData.newPassword) return showMessage("error", "Mật khẩu mới không được trùng mật khẩu cũ!");

    setIsLoading(true);
    try {
      // SỬA LỖI 2: Thêm userId vào request
      const { data } = await api.post("/users/change-password", {
          userId: user.id,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
      });
      showMessage("success", data.message || "Đổi mật khẩu thành công!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showMessage("error", error.response?.data?.error || "Lỗi đổi mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmDelete = window.confirm("CẢNH BÁO: Bạn sẽ không thể đăng nhập lại sau khi xóa tài khoản. Tiếp tục?");
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      // SỬA LỖI 2: Thêm userId vào request
      const { data } = await api.post("/users/delete", {
        userId: user.id,
        password: deletePassword,
      });

      alert(data.message || "Tài khoản đã được xóa.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      showMessage("error", error.response?.data?.error || "Mật khẩu không đúng!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8 flex justify-center font-sans">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link to="/chat" className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-all">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Cài đặt tài khoản</h1>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        {/* Thông báo nổi */}
        {msg.text && (
          <div className={`flex items-center gap-3 p-4 mb-6 rounded-2xl shadow-md border ${msg.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}>
            {msg.type === "error" ? <XCircle size={20} /> : <CheckCircle size={20} />}
            <span className="font-medium">{msg.text}</span>
          </div>
        )}

        {/* VÙNG 1: AVATAR VÀ THÔNG TIN CHUNG */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
          <div className="px-6 pb-6">
            <div className="relative flex justify-center -mt-16 mb-4">
              <div className="relative group">
                <img
                  src={previewAvatar || profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || user.fullName)}&background=0D8ABC&color=fff`}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                  alt="Avatar"
                />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </button>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{profileData.fullName}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* VÙNG 2: CHỈNH SỬA THÔNG TIN */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-blue-600" /> Thông tin cá nhân
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Họ và tên</label>
                <input type="text" value={profileData.fullName} onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ngày sinh</label>
                  <input type="date" value={profileData.dob} onChange={(e) => setProfileData((prev) => ({ ...prev, dob: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Giới tính</label>
                  <select value={profileData.gender} onChange={(e) => setProfileData((prev) => ({ ...prev, gender: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:bg-gray-400">
                <Save size={18} /> {isLoading ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </form>
          </section>

          {/* VÙNG 3: ĐỔI MẬT KHẨU */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Lock size={20} className="text-orange-500" /> Bảo mật
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="password" placeholder="Mật khẩu hiện tại" value={passwordData.oldPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" placeholder="Mật khẩu mới" value={passwordData.newPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all" />
                <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all" />
              </div>
              <button type="submit" disabled={isLoading} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all">
                Cập nhật mật khẩu
              </button>
            </form>
          </section>

          {/* VÙNG 4: XÓA TÀI KHOẢN */}
          <section className="bg-red-50 p-6 rounded-3xl shadow-sm border border-red-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600"><Trash2 size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-red-700">Vùng nguy hiểm</h3>
                <p className="text-sm text-red-600/80">Xóa tài khoản sẽ khiến bạn không thể đăng nhập lại.</p>
              </div>
            </div>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input type="password" placeholder="Nhập mật khẩu hiện tại để xác nhận" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required className="w-full p-3 bg-white border border-red-200 rounded-xl focus:border-red-500 outline-none transition-all" />
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all">
                Xác nhận xóa tài khoản
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;