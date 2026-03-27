"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  CreditCard 
} from "lucide-react";

/**
 * Professional Footer component for QuizLM.Store.
 * Features 4 columns: Contact, Support, Information, and Payment/Social.
 */
export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Top Benefits Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 pb-12 border-b border-slate-50">
          <BenefitItem 
            icon={<Truck className="text-primary" size={24} />} 
            title="Giao hàng nhanh" 
            desc="Miễn phí trên toàn quốc" 
          />
          <BenefitItem 
            icon={<ShieldCheck className="text-secondary" size={24} />} 
            title="Chính hãng" 
            desc="Bảo hành 12-24 tháng" 
          />
          <BenefitItem 
            icon={<RotateCcw className="text-emerald-500" size={24} />} 
            title="Đổi trả 30 ngày" 
            desc="Lỗi là đổi mới ngay" 
          />
          <BenefitItem 
            icon={<CreditCard className="text-amber-500" size={24} />} 
            title="Trả góp 0%" 
            desc="Hỗ trợ qua thẻ & công ty TC" 
          />
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <div className="text-2xl font-black tracking-tighter text-primary">
              QuizLM<span className="text-secondary italic">.Store</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Hệ thống bán lẻ điện thoại, laptop, phụ kiện chính hãng với giá tốt nhất thị trường. 
              Trải nghiệm mua sắm công nghệ hiện đại.
            </p>
            <div className="space-y-3">
              <ContactLink icon={<Phone size={18} />} text="1800.2097" subText="(Miễn phí)" />
              <ContactLink icon={<Mail size={18} />} text="contact@quizlm.store" />
              <ContactLink icon={<MapPin size={18} />} text="123 Ba Tháng Hai, Quận 10, TP.HCM" />
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Hỗ trợ khách hàng</h4>
            <ul className="space-y-4">
              <FooterLink text="Mua hàng và thanh toán Online" />
              <FooterLink text="Tra cứu thông tin đơn hàng" />
              <FooterLink text="Trung tâm bảo hành chính hãng" />
              <FooterLink text="Quy định về việc sao lưu dữ liệu" />
              <FooterLink text="Dịch vụ bảo hành mở rộng" />
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Thông tin chính sách</h4>
            <ul className="space-y-4">
              <FooterLink text="Chính sách bảo hành" />
              <FooterLink text="Chính sách đổi trả" />
              <FooterLink text="Chính sách giao hàng" />
              <FooterLink text="Điều khoản sử dụng" />
              <FooterLink text="Chính sách bảo mật" />
            </ul>
          </div>

          {/* Social & Payment */}
          <div className="space-y-8">
            <div>
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Kết nối với chúng tôi</h4>
              <div className="flex gap-4">
                <SocialIcon 
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>} 
                  color="bg-[#1877F2]" 
                />
                <SocialIcon 
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>} 
                  color="bg-[#FF0000]" 
                />
                <SocialIcon 
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>} 
                  color="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" 
                />
              </div>
            </div>
            <div>
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Phương thức thanh toán</h4>
              <div className="flex flex-wrap gap-2">
                <PaymentBadge src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" />
                <PaymentBadge src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" />
                <PaymentBadge src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[12px] font-medium">
          <p>© 2026 QuizLM Store. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-8">
            <span className="hover:text-primary cursor-pointer transition-colors">Điều khoản</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Bảo mật</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode; title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl">
        {icon}
      </div>
      <div>
        <h5 className="text-slate-900 font-bold text-sm tracking-tight">{title}</h5>
        <p className="text-slate-400 text-[12px]">{desc}</p>
      </div>
    </div>
  );
}

function FooterLink({ text }: { text: string }) {
  return (
    <li>
      <button className="text-slate-500 hover:text-primary transition-colors text-sm font-medium cursor-pointer">
        {text}
      </button>
    </li>
  );
}

function ContactLink({ icon, text, subText }: { icon: React.ReactNode; text: string, subText?: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors cursor-pointer">
      <div className="text-slate-400">{icon}</div>
      <span className="text-sm font-bold">
        {text} {subText && <span className="text-slate-400 font-medium">{subText}</span>}
      </span>
    </div>
  );
}

function SocialIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <button className={`p-2.5 rounded-xl text-white ${color} hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer`}>
      {icon}
    </button>
  );
}

function PaymentBadge({ src }: { src: string }) {
  return (
    <div className="h-8 px-2 py-1 bg-white border border-slate-100 rounded-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
      <img src={src} alt="Payment" className="h-full object-contain" />
    </div>
  );
}
