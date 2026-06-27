"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveRoles } from "@/lib/supabase/admin";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const roles = await getEffectiveRoles(userData.user.id, userData.user.email);
    redirect(roles.includes("admin") ? "/admin" : "/dashboard");
  }
  redirect("/login");
}

export async function adminSignInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin-login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const roles = await getEffectiveRoles(userData.user.id, userData.user.email);
    if (roles.includes("admin")) {
      redirect("/admin");
    }
    // Signed in but not an admin — sign back out and report it.
    await supabase.auth.signOut();
    redirect(`/admin-login?error=${encodeURIComponent("This account does not have admin access.")}`);
  }
  redirect("/admin-login");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });
  redirect("/forgot-password?sent=1");
}
