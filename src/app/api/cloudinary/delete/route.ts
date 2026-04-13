import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CloudinaryService } from "@/services/cloudinaryService";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase configuration error" }, { status: 500 });

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check if user is Admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || (profile?.role !== "admin" && profile?.role !== "staff")) {
      return NextResponse.json({ error: "Forbidden: Admin or Staff access required" }, { status: 403 });
    }

    // 3. Extract publicIds from body
    const { publicIds } = await req.json();

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json({ error: "No publicIds provided" }, { status: 400 });
    }

    // 4. Delete from Cloudinary
    const result = await CloudinaryService.deleteImages(publicIds);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("API Error [cloudinary/delete]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
