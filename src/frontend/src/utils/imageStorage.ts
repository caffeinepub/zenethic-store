export function getExtraImages(productId: bigint): string[] {
  try {
    const raw = localStorage.getItem(`zenethic_extra_images_${productId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setExtraImages(productId: bigint, images: string[]) {
  if (images.length === 0) {
    localStorage.removeItem(`zenethic_extra_images_${productId}`);
  } else {
    localStorage.setItem(
      `zenethic_extra_images_${productId}`,
      JSON.stringify(images),
    );
  }
}
