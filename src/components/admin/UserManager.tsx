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
  Phone
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import AdminManagerShell from "./AdminManagerShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { Pagination } from "../ui/Pagination";
import { formatDate } from "@/utils/format";

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
        setNotification({ isOpen: true, title: "Lỗi", message: result.error, type: "error" });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: "Cập nhật thông tin người dùng thành công.",
          type: "success"
        });
        setIsModalOpen(false);
        fetchUsers();
      }
    }
    setIsSubmitting(false);
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

        {/* User Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Người dùng</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Liên hệ</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vai trò</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày tạo</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-200/50">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-[15px] flex items-center gap-2">
                          {user.full_name || "Chưa cập nhật"}
                          {user.id === currentAdminId && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[8px] font-black uppercase tracking-tighter">Bạn</span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">ID: ...{user.id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                        <Mail size={12} className="text-slate-300" />
                        {user.email || "---"}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                          <Phone size={12} className="text-slate-300" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-tighter ${
                      user.role === "admin" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {user.role === "admin" ? <ShieldCheck size={12} /> : <User size={12} />}
                      {user.role === "admin" ? "Quản trị" : "Khách"}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-tighter ${
                      user.is_active 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-rose-50 text-rose-600"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-600 animate-pulse" : "bg-rose-600"}`} />
                      {user.is_active ? "Hoạt động" : "Bị khóa"}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-500 text-[13px] font-medium">
                      <Clock size={12} className="text-slate-300" />
                      {user.created_at ? formatDate(user.created_at) : "---"}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Change Role Button */}
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-xl h-9 w-9 p-0"
                        title="Đổi vai trò"
                        onClick={() => handleActionClick("role", user)}
                      >
                        <Shield size={16} />
                      </Button>

                      {/* Block/Unblock Button */}
                      {user.is_active ? (
                        <Button
                          variant="lightDanger"
                          size="sm"
                          className={`rounded-xl h-9 w-9 p-0 ${
                            (user.role === "admin" || user.id === currentAdminId) ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          title="Khóa tài khoản"
                          onClick={() => handleActionClick("block", user)}
                        >
                          <UserMinus size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl h-9 w-9 p-0 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          title="Mở khóa"
                          onClick={() => handleActionClick("unblock", user)}
                        >
                          <UserCheck size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
