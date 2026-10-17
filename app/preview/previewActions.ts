"use server";

// Stand-ins for the preview pages: nothing is saved.

const TAKEN = ["riffqueen", "keyskid", "lofi.lou"];

export async function previewCheckName(name: string): Promise<boolean | null> {
  return !TAKEN.includes(name.trim().replace(/^@+/, "").toLowerCase());
}

export async function previewClaim(input: { name: string }): Promise<{ ok: true } | { ok: false; error: string; field?: "name" | "age" }> {
  if (!(await previewCheckName(input.name))) return { ok: false, error: "That name's taken. Somebody's already printing it on T-shirts.", field: "name" };
  return { ok: false, error: "Preview only: nothing is saved here." };
}
