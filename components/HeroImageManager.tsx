"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type HeroImageRecord = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
};

type HeroImageForm = {
  imageUrl: string;
  altText: string;
  sortOrder: string;
};

const emptyForm: HeroImageForm = {
  imageUrl: "",
  altText: "",
  sortOrder: "",
};

export default function HeroImageManager() {
  const [heroImages, setHeroImages] = useState<HeroImageRecord[]>([]);
  const [formData, setFormData] = useState<HeroImageForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("hero_images")
      .select("id, image_url, alt_text, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true, nullsFirst: false });

    if (error) {
      const missingTable = error.code === "42P01" || error.message?.toLowerCase().includes("does not exist");
      setMessage({
        type: "error",
        text: missingTable
          ? "Hero images table is missing. Run add-hero-images.sql in Supabase, then refresh this tab."
          : error.message || "Failed to load hero images.",
      });
      setHeroImages([]);
      setLoading(false);
      return;
    }

    setHeroImages(data ?? []);
    setMessage(null);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        image_url: formData.imageUrl.trim(),
        alt_text: formData.altText.trim() || null,
        sort_order: formData.sortOrder.trim() ? Number(formData.sortOrder) : null,
      };

      if (!payload.image_url) {
        throw new Error("Image link is required.");
      }

      if (editingId) {
        const { error } = await supabase.from("hero_images").update(payload).eq("id", editingId);
        if (error) throw error;
        setMessage({ type: "success", text: "Hero image updated successfully." });
      } else {
        const { error } = await supabase.from("hero_images").insert(payload);
        if (error) throw error;
        setMessage({ type: "success", text: "Hero image added successfully." });
      }

      resetForm();
      await loadHeroImages();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save hero image.",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (image: HeroImageRecord) => {
    setEditingId(image.id);
    setFormData({
      imageUrl: image.image_url,
      altText: image.alt_text ?? "",
      sortOrder: image.sort_order !== null && image.sort_order !== undefined ? String(image.sort_order) : "",
    });
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this hero image?");
    if (!confirmed) return;

    setDeletingId(id);
    setMessage(null);

    try {
      const { error } = await supabase.from("hero_images").delete().eq("id", id);
      if (error) throw error;
      if (editingId === id) {
        resetForm();
      }
      setMessage({ type: "success", text: "Hero image deleted successfully." });
      await loadHeroImages();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete hero image.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Hero images</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          {editingId ? "Edit hero slide" : "Add hero slide"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Add, replace, or remove homepage carousel images by pasting a direct image link.
        </p>

        <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card-tint)] p-4 text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">Recommended sizes</p>
          <p className="mt-2">Desktop: 1800 x 900 px or 1920 x 960 px</p>
          <p className="mt-1">Mobile safe crop: keep the subject centered. Dedicated mobile version: 900 x 1200 px</p>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-[1rem] border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-[var(--border)] bg-[var(--card-tint)] text-[var(--foreground)]"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label htmlFor="hero-image-url" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Image link
            </label>
            <input
              id="hero-image-url"
              type="url"
              value={formData.imageUrl}
              onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="https://example.com/hero-image.jpg"
              className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
              required
            />
          </div>

          <div>
            <label htmlFor="hero-alt-text" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Alt text
            </label>
            <input
              id="hero-alt-text"
              type="text"
              value={formData.altText}
              onChange={(event) => setFormData((prev) => ({ ...prev, altText: event.target.value }))}
              placeholder="Describe the image for accessibility"
              className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            />
          </div>

          <div>
            <label htmlFor="hero-sort-order" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Slide order
            </label>
            <input
              id="hero-sort-order"
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={(event) => setFormData((prev) => ({ ...prev, sortOrder: event.target.value }))}
              placeholder="0"
              className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update hero image" : "Add hero image"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Current slides</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{heroImages.length}</h2>
          </div>
          <button
            type="button"
            onClick={() => void loadHeroImages()}
            className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[var(--card-tint)] px-5 py-8 text-center text-sm text-[var(--muted)]">
              Loading hero images...
            </div>
          ) : heroImages.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[var(--card-tint)] px-5 py-8 text-center text-sm text-[var(--muted)]">
              No hero images added yet.
            </div>
          ) : (
            heroImages.map((image) => (
              <article key={image.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)]">
                <div className="aspect-[16/9] bg-[var(--card-tint)]">
                  <img src={image.image_url} alt={image.alt_text ?? "Hero image preview"} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[var(--card-tint)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
                      Order {image.sort_order ?? 0}
                    </span>
                  </div>
                  <p className="break-all text-sm leading-6 text-[var(--muted)]">{image.image_url}</p>
                  <p className="text-sm text-[var(--foreground)]">{image.alt_text?.trim() || "No alt text added."}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(image)}
                      className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(image.id)}
                      disabled={deletingId === image.id}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === image.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
