import React, { useState } from 'react';
import { X, Check, Search, Users } from 'lucide-react';

const CreateGroupModal = ({ friends, onClose, onCreate, theme, bgPanel }) => {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Lọc danh sách bạn bè theo ô tìm kiếm
    const filteredFriends = friends.filter(f => 
        f.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMember = (userId) => {
        setSelectedMembers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleCreate = () => {
        if (!groupName.trim()) return alert("Vui lòng nhập tên nhóm!");
        if (selectedMembers.length < 2) return alert("Chọn ít nhất 2 thành viên để tạo nhóm!");
        
        onCreate(groupName, selectedMembers);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${bgPanel}`}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-blue-500" /> Tạo nhóm mới
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Nội dung */}
                <div className="p-5">
                    <label className="block text-sm font-bold mb-2">Tên nhóm</label>
                    <input 
                        type="text" 
                        placeholder="Ví dụ: Nhóm Học Tập..." 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className={`w-full p-3 rounded-xl mb-4 outline-none border focus:border-blue-500 transition-all ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                    />

                    <label className="block text-sm font-bold mb-2">Thêm thành viên ({selectedMembers.length})</label>
                    <div className={`flex items-center gap-2 p-2 rounded-xl mb-3 border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <Search size={18} className="text-gray-400 ml-2" />
                        <input 
                            type="text" 
                            placeholder="Tìm tên bạn bè..." 
                            className="bg-transparent outline-none w-full p-1"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredFriends.length > 0 ? (
                            filteredFriends.map(f => (
                                <div 
                                    key={f.user.id} 
                                    onClick={() => toggleMember(f.user.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all ${
                                        selectedMembers.includes(f.user.id) 
                                        ? 'bg-blue-50 border-blue-100 border' 
                                        : 'hover:bg-gray-100 border border-transparent'
                                    }`}
                                >
                                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all ${
                                        selectedMembers.includes(f.user.id) 
                                        ? 'bg-blue-500 border-blue-500' 
                                        : 'border-gray-300'
                                    }`}>
                                        {selectedMembers.includes(f.user.id) && <Check size={14} className="text-white"/>}
                                    </div>
                                    <img 
                                        src={f.user.avatar || 'https://via.placeholder.com/40'} 
                                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                                        alt="avatar"
                                    />
                                    <span className="font-semibold flex-1">{f.user.fullName}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">Không tìm thấy bạn bè nào</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleCreate}
                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                            selectedMembers.length >= 2 ? 'bg-[#0068ff] hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        Tạo nhóm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;