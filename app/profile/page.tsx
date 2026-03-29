"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ProfileFormData = {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
};

type ProfileRecord = ProfileFormData & {
  id: string;
  created_at?: string;
};

const emptyProfile: ProfileFormData = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  postal_code: "",
  country: "",
};

const phonePattern = /^[0-9+\-()\s]{7,20}$/;

function isProfileComplete(profile: ProfileFormData | null) {
  if (!profile) return false;

  return Boolean(
    profile.full_name.trim() &&
      profile.phone.trim() &&
      profile.address_line1.trim() &&
      profile.city.trim() &&
      profile.postal_code.trim()
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 6 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileSkeleton() {
  return (
    <div className="bg-[var(--background)]">
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:py-20">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <div className="h-3 w-28 rounded-full bg-[var(--card-tint)]" />
            <div className="mt-4 h-10 w-64 rounded-[1.5rem] bg-[var(--card-tint)]" />
            <div className="mt-3 h-5 w-full max-w-2xl rounded-full bg-[var(--card-tint)]" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-4 w-28 rounded-full bg-[var(--card-tint)]" />
                  <div className="h-12 rounded-[1.25rem] bg-[var(--card-tint)]" />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-4 w-28 rounded-full bg-[var(--card-tint)]" />
              <div className="h-12 rounded-[1.25rem] bg-[var(--card-tint)]" />
            </div>
            <div className="mt-8 h-12 w-40 rounded-full bg-[var(--card-tint)]" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(emptyProfile);
  const [profileData, setProfileData] = useState<ProfileRecord | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setErrorMessage("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError) {
        setErrorMessage(userError.message);
        setIsLoadingProfile(false);
        return;
      }

      if (!currentUser) {
        router.replace("/auth");
        return;
      }

      setUser(currentUser);

      // Checkout reuse:
      // When a logged-in user opens checkout, fetch this same profile row by `id = user.id`
      // and pre-fill the checkout form with:
      // profile.full_name, profile.phone, profile.address_line1, profile.address_line2,
      // profile.city, profile.postal_code, and profile.country.
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address_line1, address_line2, city, postal_code, country, created_at")
        .eq("id", currentUser.id)
        .maybeSingle<ProfileRecord>();

      if (!isMounted) return;

      if (error) {
        setErrorMessage(error.message);
        setIsLoadingProfile(false);
        return;
      }

      if (data) {
        setProfileData(data);
        setFormData({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          address_line1: data.address_line1 ?? "",
          address_line2: data.address_line2 ?? "",
          city: data.city ?? "",
          postal_code: data.postal_code ?? "",
          country: data.country ?? "",
        });
        setProfileExists(true);
        setIsEditing(!isProfileComplete(data));
        setIsLoadingProfile(false);
        return;
      }

      // Optional first-login behavior: create a profile row immediately so checkout and
      // account screens can safely update the same record without asking for setup later.
      const { error: insertError } = await supabase.from("profiles").insert({ id: currentUser.id });

      if (!isMounted) return;

      if (insertError) {
        setErrorMessage(insertError.message);
      } else {
        setProfileData({
          id: currentUser.id,
          ...emptyProfile,
        });
        setProfileExists(true);
        setIsEditing(true);
      }

      setFormData(emptyProfile);
      setIsLoadingProfile(false);
    };

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        router.replace("/auth");
        return;
      }

      setUser(session.user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) return "Name is required.";
    if (!formData.phone.trim()) return "Phone number is required.";
    if (!phonePattern.test(formData.phone.trim())) return "Enter a valid phone number.";
    if (!formData.address_line1.trim()) return "Address is required.";
    if (!formData.city.trim()) return "City is required.";
    if (!formData.postal_code.trim()) return "Postal code is required.";
    return "";
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || isSaving) return;

    const validationError = validateForm();
    if (validationError) {
      setSuccessMessage("");
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      id: user.id,
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      address_line1: formData.address_line1.trim(),
      address_line2: formData.address_line2.trim(),
      city: formData.city.trim(),
      postal_code: formData.postal_code.trim(),
      country: formData.country.trim(),
    };

    const query = profileExists
      ? supabase.from("profiles").update(payload).eq("id", user.id).select()
      : supabase.from("profiles").insert(payload).select();

    const { data, error } = await query;

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    const savedProfile = data?.[0] as ProfileRecord | undefined;

    if (savedProfile) {
      setProfileData(savedProfile);
      setFormData({
        full_name: savedProfile.full_name ?? "",
        phone: savedProfile.phone ?? "",
        address_line1: savedProfile.address_line1 ?? "",
        address_line2: savedProfile.address_line2 ?? "",
        city: savedProfile.city ?? "",
        postal_code: savedProfile.postal_code ?? "",
        country: savedProfile.country ?? "",
      });
    }

    setProfileExists((data?.length ?? 0) > 0 || profileExists);
    setSuccessMessage("Profile saved");
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  const savedAddress = [profileData?.address_line1, profileData?.address_line2]
    .filter((value) => value && value.trim().length > 0)
    .join(", ");

  if (isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="bg-[var(--background)]">
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.96))] p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Profile</p>
              <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
                Save your checkout details once.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Store your shipping information in your account so checkout can pre-fill your details automatically on
                future orders.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Account</p>
                  <p className="mt-2 break-all text-sm font-semibold leading-6 text-[var(--foreground)]">
                    {user?.email ?? "Signed in"}
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Security</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    Row-level security keeps every profile scoped to its owner.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-4 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Checkout</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    Reuse the same saved name, phone, and address fields during checkout.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-6 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Saved profile</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {profileData?.full_name?.trim() || "Complete your profile"}
              </h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.5rem] bg-[var(--card-tint)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Phone Number</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {profileData?.phone?.trim() || "No phone number saved yet."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--card-tint)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Address</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {savedAddress || "No address saved yet."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--card-tint)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">City</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {profileData?.city?.trim() || "No city saved yet."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--card-tint)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Postal Code</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {profileData?.postal_code?.trim() || "No postal code saved yet."}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage("");
                    setErrorMessage("");
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
                >
                  <EditIcon />
                  Edit profile
                </button>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
                >
                  Go to cart
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
                >
                  Back to dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSigningOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="mx-auto mt-8 max-w-6xl rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)] sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Edit mode</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                  {isProfileComplete(profileData) ? "Update your profile" : "Create your profile"}
                </h3>
              </div>
              {isProfileComplete(profileData) ? (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      full_name: profileData?.full_name ?? "",
                      phone: profileData?.phone ?? "",
                      address_line1: profileData?.address_line1 ?? "",
                      address_line2: profileData?.address_line2 ?? "",
                      city: profileData?.city ?? "",
                      postal_code: profileData?.postal_code ?? "",
                      country: profileData?.country ?? "",
                    });
                    setErrorMessage("");
                    setSuccessMessage("");
                    setIsEditing(false);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form className="space-y-6" onSubmit={handleSaveProfile}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-[var(--foreground)]">
                  Name
                  <input
                    value={formData.full_name}
                    onChange={(event) => updateField("full_name", event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    disabled={isSaving}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--foreground)]">
                  Phone Number
                  <input
                    value={formData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                    placeholder="+1 555 123 4567"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    disabled={isSaving}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--foreground)] md:col-span-2">
                  Address
                  <input
                    value={formData.address_line1}
                    onChange={(event) => updateField("address_line1", event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                    placeholder="Street address"
                    autoComplete="address-line1"
                    required
                    disabled={isSaving}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--foreground)]">
                  City
                  <input
                    value={formData.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                    placeholder="City"
                    autoComplete="address-level2"
                    required
                    disabled={isSaving}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--foreground)]">
                  Postal Code
                  <input
                    value={formData.postal_code}
                    onChange={(event) => updateField("postal_code", event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                    placeholder="Postal code"
                    autoComplete="postal-code"
                    required
                    disabled={isSaving}
                  />
                </label>
              </div>

              {errorMessage ? (
                <p className="rounded-[1.5rem] border border-[#d9b6ac] bg-[#fff3ef] px-4 py-3 text-sm text-[#8a3f29]">
                  {errorMessage}
                </p>
              ) : null}

              {successMessage ? (
                <p className="rounded-[1.5rem] border border-[#bfd2b9] bg-[#f4fbf2] px-4 py-3 text-sm text-[#365b2f]">
                  {successMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-[var(--foreground)]"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </section>
    </div>
  );
}
