import { User } from "@supabase/supabase-js";

/**
 * Checks if a user has administrative privileges.
 * By default, it checks for a 'role' field in the user_metadata.
 * 
 * @param user The Supabase user object
 * @returns boolean True if the user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Check user_metadata for role
  const role = user.app_metadata?.role || user.user_metadata?.role;
  return role === "admin";
}

/**
 * Checks if a user has staff privileges.
 * 
 * @param user The Supabase user object
 * @returns boolean True if the user is a staff
 */
export function isStaff(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Check user_metadata for role
  const role = user.app_metadata?.role || user.user_metadata?.role;
  return role === "staff";
}

/**
 * Gets the user's full name from metadata.
 */
export function getUserName(user: User | null | undefined): string {
  if (!user) return "Guest";
  return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
}

/**
 * Gets the user's avatar URL from metadata.
 */
export function getUserAvatar(user: User | null | undefined): string | null {
  if (!user) return null;
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}
