function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  shareTitle: string
): Promise<"shared" | "downloaded"> {
  if (isTouchDevice() && navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type || "image/png" });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: shareTitle });
      return "shared";
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
