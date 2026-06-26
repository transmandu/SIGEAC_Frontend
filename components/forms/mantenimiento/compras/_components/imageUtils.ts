// Backend image URLs look like `{APP_URL}/storage/images/123.jpg`. The
// `public` disk's relative path (what the backend expects back as
// `existing_image_path` to reuse a file instead of re-uploading it) is
// everything after `/storage/`.
export function getStoragePathFromUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const marker = "/storage/";
  const index = url.indexOf(marker);
  if (index === -1) return undefined;
  return url.slice(index + marker.length);
}
