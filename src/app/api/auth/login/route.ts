import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getAuthMessage } from '@/utils/auth-messages';

export async function POST(request: Request) {
  try {
    let email = '';
    let password = '';

    // Kiểm tra content-type để lấy dữ liệu đúng cách
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Không thể khởi tạo kết nối cơ sở dữ liệu' },
        { status: 500 }
      );
    }

    // Thực hiện đăng nhập bằng Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: getAuthMessage(error.message) },
        { status: 401 }
      );
    }

    // 3. Đăng nhập thành công - Tiến hành kiểm tra và Tự phục hồi Profile
    const { user } = data;
    
    // Kiểm tra Profile hiện tại
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active, avatar_url')
      .eq('id', user.id)
      .single();

    if (!profile || (profile && !profile.avatar_url)) {
      console.log("API Login: Profile sync triggered...");
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Người dùng";
      const phone = user.user_metadata?.phone || "";
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: user.email,
          phone: phone,
          avatar_url: avatarUrl,
          role: profile?.role || "user",
          is_active: profile?.is_active ?? true,
          updated_at: new Date().toISOString()
        });
    } else if (profile.is_active === false) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Tài khoản của bạn đã bị khóa' },
        { status: 403 }
      );
    }

    // Trả về thông tin đăng nhập thành công
    return NextResponse.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
      },
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Yêu cầu không hợp lệ' },
      { status: 500 }
    );
  }
}
