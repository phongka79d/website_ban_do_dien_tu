"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthMessage } from "@/utils/auth-messages";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase connection failed" };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  // Check if email already exists using RPC (to bypass RLS for non-authenticated users)
  const { data: emailExists, error: rpcError } = await supabase
    .rpc("check_email_exists", { email_to_check: email });

  if (rpcError) {
    console.error("RPC Error checking email:", rpcError);
  }

  if (emailExists) {
    return { error: getAuthMessage("email-in-use") };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role: "user",
      },
    },
  });

  if (error) {
    return { error: getAuthMessage(error.message) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  const isPhone = /^\+?[0-9]{10,15}$/.test(identifier);
  let signInResponse;

  if (isPhone) {
    // Lookup if profile exists with this phone
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", identifier)
      .single();

    if (profileError || !profileData) {
      return { error: getAuthMessage("phone-not-found") };
    }

    signInResponse = await supabase.auth.signInWithPassword({
      phone: identifier,
      password,
    });
  } else {
    signInResponse = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
  }

  if (signInResponse.error) {
    return { error: getAuthMessage(signInResponse.error.message) };
  }

  // Check if account is active
  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", signInResponse.data.user?.id)
    .single();

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    return { error: getAuthMessage("account-blocked") };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function verifyOtpCode(email: string, token: string) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return { error: getAuthMessage(error.message) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function resendOtpCode(email: string) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: getAuthMessage(error.message) };
  }

  return { success: true };
}
