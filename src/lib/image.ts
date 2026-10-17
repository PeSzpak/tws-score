import imageCompression from 'browser-image-compression'

export class ImageError extends Error {}

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new ImageError(`${file.name} não é uma imagem`)
  try {
    return await imageCompression(file, {
      maxWidthOrHeight: 1600,
      initialQuality: 0.8,
      fileType: 'image/jpeg',
      useWebWorker: true,
    })
  } catch (cause) {
    throw new ImageError(`Não deu pra preparar ${file.name}`, { cause })
  }
}
