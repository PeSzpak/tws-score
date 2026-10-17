import imageCompression from 'browser-image-compression'
import { compressImage, ImageError } from './image'

vi.mock('browser-image-compression', () => ({ default: vi.fn() }))
const compress = vi.mocked(imageCompression)

const photo = () => new File(['x'], 'foto.jpg', { type: 'image/jpeg' })

test('recusa arquivo que não é imagem', async () => {
  await expect(compressImage(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).rejects.toBeInstanceOf(ImageError)
  expect(compress).not.toHaveBeenCalled()
})

test('comprime para 1600px em JPEG 0.8', async () => {
  const out = new Blob(['y'], { type: 'image/jpeg' })
  compress.mockResolvedValueOnce(out as File)
  await expect(compressImage(photo())).resolves.toBe(out)
  expect(compress).toHaveBeenCalledWith(
    expect.any(File),
    expect.objectContaining({ maxWidthOrHeight: 1600, initialQuality: 0.8, fileType: 'image/jpeg' }),
  )
})

test('falha na compressão vira ImageError', async () => {
  compress.mockRejectedValueOnce(new Error('formato não suportado'))
  await expect(compressImage(photo())).rejects.toBeInstanceOf(ImageError)
})
