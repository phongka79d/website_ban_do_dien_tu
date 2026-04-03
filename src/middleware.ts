import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/utils/auth-helpers";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  // Real-time Lock & Role Check: If user is logged in, check if they are still active and get their latest role
  let userProfile = null;
  if (user) {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("is_active, role")
        .eq("id", user.id);

      userProfile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (userProfile && userProfile.is_active === false) {
        // Account is locked, sign out and redirect
        await supabase.auth.signOut();
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("error", "blocked");
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      console.error("Middleware profile fetch error:", err);
    }
  }

  // RBAC: Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isActuallyAdmin = userProfile?.role === "admin" || (user && isAdmin(user));
    
    if (!user || !isActuallyAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect User Profiles
  if (request.nextUrl.pathname.startsWith("/profile")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth: Redirect logged-in and confirmed users away from auth pages
  if (user && user.email_confirmed_at && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
