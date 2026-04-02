"use client";

import React, { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserService } from "@/services/userService";
import { Profile } from "@/types/database";
import { 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  MoreVertical,
  UserCheck,
  UserMinus,
  Shield,
  Clock,
  Mail,
  Phone,
  Hash
} from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import AdminManagerShell from "./AdminManagerShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { Pagination } from "../ui/Pagination";
import { formatDate } from "@/utils/format";
import { CldImage } from "next-cloudinary";

interface UserManagerProps {
  currentAdminId: string;
}

export default function UserManager({ currentAdminId }: UserManagerProps) {
  const [roleFilter, setRoleFilter] = useState("all");
  
  const searchFn = useCallback((supabase: any, query: string, page: number, pageSize: number) => 
    UserService.fetchUsers(supabase, page, pageSize, query, roleFilter), [roleFilter]);

  const {
    searchTerm,
    setSearchTerm,
    results: users,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    refresh: fetchUsers
  } = useAdminSearch<Profile>({
    searchFn,
    initialPageSize: 10,
    storageKey: "admin-users-pageSize"
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "block" | "unblock" | "role";
    user: Profile | null;
  }>({ type: "block", user: null });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  const handleActionClick = (type: "block" | "unblock" | "role", user: Profile) => {
    // Ràng buộc bảo mật ngay tại UI: Admin không thể khóa Admin hoặc chính mình. 2.0
    if ((type === "block") && (user.role === "admin" || user.id === currentAdminId)) {
      setNotification({
        isOpen: true,
        title: "Hành động bị chặn",
        message: "Bạn không thể khóa tài khoản của quản trị viên khác hoặc chính mình.",
        type: "error"
      });
      return;
    }

    setModalConfig({ type, user });
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!modalConfig.user) return;
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      if (supabase) {
        let result;
        if (modalConfig.type === "block") {
          result = await UserService.updateStatus(supabase, modalConfig.user.id, false, currentAdminId);
        } else if (modalConfig.type === "unblock") {
          result = await UserService.updateStatus(supabase, modalConfig.user.id, true, currentAdminId);
        } else if (modalConfig.type === "role") {
          const newRole = modalConfig.user.role === "admin" ? "user" : "admin";
          result = await UserService.updateRole(supabase, modalConfig.user.id, newRole, currentAdminId);
        }

        if (result?.error) {
          setNotification({ 
            isOpen: true, 
            title: "Trạng thái hệ thống", 
            message: result.error, 
            type: "error" 
          });
        } else {
          setNotification({
            isOpen: true,
            title: "Thành công",
            message: "Cập nhật dữ liệu người dùng hoàn tất.",
            type: "success"
          });
          setIsModalOpen(false);
          // Ép buộc tải lại dữ liệu từ Server để vượt qua cache Next.js 3.0
          fetchUsers();
          window.location.reload(); // Cách triệt để nhất để thấy trạng thái Mở khóa
        }
      }
    } catch (err: any) {
      console.error("Critical Admin User Error:", err);
      setNotification({
        isOpen: true,
        title: "Lỗi kết nối",
        message: "Không thể kết nối với dịch vụ dữ liệu Cloud. Vui lòng kiểm tra mạng hoặc thử lại sau.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminManagerShell
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm tên, email hoặc số điện thoại..."
        loading={loading}
        isEmpty={users.length === 0}
        emptyIcon={<User size={48} />}
        emptyText="Không tìm thấy người dùng nào"
      >
        {/* Role Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={roleFilter === "all" ? "primary" : "light"} 
            size="sm" 
            onClick={() => { setRoleFilter("all"); setPage(1); }}
            className="rounded-xl px-6"
          >
            Tất cả
          </Button>
          <Button 
            variant={roleFilter === "admin" ? "primary" : "light"} 
            size="sm" 
            onClick={() => { setRoleFilter("admin"); setPage(1); }}
            className="rounded-xl px-6"
          >
            Quản trị viên
          </Button>
          <Button 
            variant={roleFilter === "user" ? "primary" : "light"} 
            size="sm" 
            onClick={() => { setRoleFilter("user"); setPage(1); }}
            className="rounded-xl px-6"
          >
            Khách hàng
          </Button>
        </div>

        {/* User Rows List 3.0 */}
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
            >
              {/* Profile Section */}
              <div className="flex items-center gap-4 w-full md:w-[30%] shrink-0 min-w-0">
                <Avatar 
                  src={user.avatar_url} 
                  fallbackName={user.full_name}
                  size={56}
                  className="shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-slate-900 text-[16px] truncate">
                      {user.full_name || "Chưa cập nhật"}
                    </p>
                    {user.id === currentAdminId && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-tighter ring-1 ring-indigo-100 shrink-0">Bạn</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate">
                    <Hash size={10} /> {user.id.slice(0, 8)}...{user.id.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Contact Section 3.0: Thêm truncate và min-w-0 để tránh đè badge */}
              <div className="hidden md:flex flex-col gap-1 w-[25%] shrink-0 min-w-0 px-2 text-center items-center">
                <div className="flex items-center gap-2 text-[13px] text-slate-600 font-bold bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100 w-full justify-center">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{user.email || "---"}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium px-3 truncate">
                    <Phone size={12} className="text-slate-300 shrink-0" />
                    {user.phone}
                  </div>
                )}
              </div>

              {/* Status & Role Section */}
              <div className="hidden lg:flex items-center justify-center gap-3 w-[25%] shrink-0">
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors shrink-0 ${
                  user.role === "admin" 
                    ? "bg-indigo-100/50 text-indigo-700 border-indigo-200" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {user.role === "admin" ? <ShieldCheck size={14} /> : <User size={14} />}
                  {user.role === "admin" ? "Quản trị" : "Khách"}
                </div>

                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors shrink-0 ${
                  user.is_active 
                    ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" 
                    : "bg-rose-100/50 text-rose-700 border-rose-200"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {user.is_active ? "Hoạt động" : "Bị khóa"}
                </div>
              </div>

              {/* Meta Section (Desktop only) */}
              <div className="hidden md:block w-[15%] text-right pr-6">
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-tighter">Ngày tham gia</p>
                  <p className="text-[13px] font-bold text-slate-500">
                    {user.created_at ? formatDate(user.created_at) : "---"}
                  </p>
                </div>
              </div>

              {/* Actions Section Tooltip Style 3.0 */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-2xl h-11 w-11 p-0 hover:bg-slate-100 border border-slate-100 shadow-sm"
                  title="Đổi vai trò"
                  onClick={() => handleActionClick("role", user)}
                >
                  <Shield size={20} className="text-slate-500" />
                </Button>

                {user.is_active ? (
                  <Button
                    variant="lightDanger"
                    size="sm"
                    className={`rounded-2xl h-11 w-11 p-0 border border-rose-50 shadow-sm ${
                      (user.role === "admin" || user.id === currentAdminId) ? "opacity-30 cursor-not-allowed grayscale" : "hover:bg-rose-100"
                    }`}
                    title="Khóa tài khoản"
                    disabled={user.role === "admin" || user.id === currentAdminId}
                    onClick={() => handleActionClick("block", user)}
                  >
                    <UserMinus size={20} className="text-rose-500" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-2xl h-11 w-11 p-0 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 shadow-sm transition-all"
                    title="Mở khóa"
                    onClick={() => handleActionClick("unblock", user)}
                  >
                    <UserCheck size={20} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Pagination
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalCount={totalCount}
          className="mt-8"
        />
      </AdminManagerShell>

      {/* Confirmation Modals */}
      <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={confirmAction} 
        title={
          modalConfig.type === "block" ? "Khóa tài khoản" : 
          modalConfig.type === "unblock" ? "Mở khóa tài khoản" : 
          "Thay đổi quyền hạn"
        } 
        message={
          modalConfig.type === "block" ? `Bạn có chắc chắn muốn khóa tài khoản của "${modalConfig.user?.full_name}"? Người dùng này sẽ không thể đăng nhập vào hệ thống.` : 
          modalConfig.type === "unblock" ? `Phục hồi quyền truy cập cho "${modalConfig.user?.full_name}"?` : 
          `Bạn muốn ${modalConfig.user?.role === "admin" ? "HẠ QUYỀN" : "NÂNG QUYỀN"} cho "${modalConfig.user?.full_name}"?`
        } 
        confirmText="Xác nhận"
        type={modalConfig.type === "block" ? "danger" : "info"} 
        loading={isSubmitting} 
      />
      
      <NotificationModal 
        isOpen={notification.isOpen} 
        onClose={() => setNotification({ ...notification, isOpen: false })} 
        title={notification.title} 
        message={notification.message} 
        type={notification.type} 
      />
    </>
  );
}
