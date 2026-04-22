/**
 * Cloudinary unsigned upload helpers (images + videos).
 *
 * Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET
 * (an "unsigned" upload preset created in Cloudinary settings).
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const IMG_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: "image" | "video";
}

async function uploadTo(
  resourceType: "image" | "video",
  file: File,
  folder?: string,
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary n'est pas configuré. Ajoutez VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans le fichier .env.",
    );
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET as string);
  if (folder) form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body?.error?.message ?? "";
    } catch { /* ignore */ }
    throw new Error(detail ? `Échec upload Cloudinary : ${detail}` : `Échec upload Cloudinary (${res.status}).`);
  }

  const data = (await res.json()) as {
    secure_url: string; public_id: string; width: number; height: number; format: string; bytes: number;
  };

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    resourceType,
  };
}

export async function uploadImage(
  file: File,
  opts: { folder?: string } = {},
): Promise<CloudinaryUploadResult> {
  if (!IMG_TYPES.includes(file.type)) {
    throw new Error("Format non supporté. Utilisez JPG, PNG, WEBP ou AVIF.");
  }
  if (file.size > IMG_MAX_BYTES) {
    throw new Error("Image trop volumineuse (max 8 MB).");
  }
  return uploadTo("image", file, opts.folder);
}

export async function uploadVideo(
  file: File,
  opts: { folder?: string } = {},
): Promise<CloudinaryUploadResult> {
  if (!VIDEO_TYPES.includes(file.type)) {
    throw new Error("Format vidéo non supporté. Utilisez MP4, WEBM ou MOV.");
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error("Vidéo trop volumineuse (max 50 MB).");
  }
  return uploadTo("video", file, opts.folder);
}

/** Auto-detects image vs video from MIME type. */
export async function uploadMedia(
  file: File,
  opts: { folder?: string } = {},
): Promise<CloudinaryUploadResult> {
  if (file.type.startsWith("video/")) return uploadVideo(file, opts);
  return uploadImage(file, opts);
}
