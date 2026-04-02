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
      email = formData.get('email') as string || formData.get('1_email') as string;
      password = formData.get('password') as string || formData.get('1_password') as string;
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

    // Đăng nhập thành công
    return NextResponse.json({
      message: 'Đăng nhập thành công',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.app_metadata?.role || 'user',
      },
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Yêu cầu không hợp lệ' },
      { status: 500 }
    );
  }
}
