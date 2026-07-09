// -- Bộ nhận diện & tạo URL nhúng (embed) cho các nền tảng phổ biến --
// resolveEmbed(url) trả về: { provider, kind, embedUrl, canEmbed }
//   kind: 'iframe' | 'video' | 'image' | 'none'

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i
const PDF_EXT = /\.pdf(\?.*)?$/i
const OFFICE_EXT = /\.(pptx?|docx?|xlsx?)(\?.*)?$/i

// Lấy ID file/tài liệu từ URL Google (Drive, Docs, Slides...).
function googleId(url) {
  const m = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)
  return m ? m[1] : null
}

// resolveEmbed -- phân tích 1 URL và trả về cách nhúng phù hợp nhất.
export function resolveEmbed(rawUrl) {
  const none = { provider: 'Không xác định', kind: 'none', embedUrl: null, canEmbed: false }
  if (!rawUrl || typeof rawUrl !== 'string') return none
  const url = rawUrl.trim()

  // YouTube
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (m) return { provider: 'YouTube', kind: 'iframe', embedUrl: 'https://www.youtube.com/embed/' + m[1], canEmbed: true }

  // Vimeo
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (m) return { provider: 'Vimeo', kind: 'iframe', embedUrl: 'https://player.vimeo.com/video/' + m[1], canEmbed: true }

  // Google Slides / Docs / Sheets
  m = url.match(/docs\.google\.com\/presentation\/d\/([^/]+)/)
  if (m) return { provider: 'Google Slides', kind: 'iframe', embedUrl: 'https://docs.google.com/presentation/d/' + m[1] + '/embed', canEmbed: true }
  m = url.match(/docs\.google\.com\/document\/d\/([^/]+)/)
  if (m) return { provider: 'Google Docs', kind: 'iframe', embedUrl: 'https://docs.google.com/document/d/' + m[1] + '/preview', canEmbed: true }
  m = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/)
  if (m) return { provider: 'Google Sheets', kind: 'iframe', embedUrl: 'https://docs.google.com/spreadsheets/d/' + m[1] + '/preview', canEmbed: true }

  // Google Drive (file bất kỳ)
  if (/drive\.google\.com/.test(url)) {
    const id = googleId(url)
    if (id) return { provider: 'Google Drive', kind: 'iframe', embedUrl: 'https://drive.google.com/file/d/' + id + '/preview', canEmbed: true }
  }

  // Canva
  m = url.match(/canva\.com\/design\/([\w-]+)/)
  if (m) return { provider: 'Canva', kind: 'iframe', embedUrl: 'https://www.canva.com/design/' + m[1] + '/view?embed', canEmbed: true }

  // Figma
  if (/figma\.com\/(file|proto|design|slides)\//.test(url)) {
    return { provider: 'Figma', kind: 'iframe', embedUrl: 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent(url), canEmbed: true }
  }

  // Cloudinary / file trực tiếp theo đuôi
  const isCloudinary = /res\.cloudinary\.com/.test(url)
  if (VIDEO_EXT.test(url)) return { provider: isCloudinary ? 'Cloudinary' : 'Video', kind: 'video', embedUrl: url, canEmbed: true }
  if (IMAGE_EXT.test(url)) return { provider: isCloudinary ? 'Cloudinary' : 'Ảnh', kind: 'image', embedUrl: url, canEmbed: true }
  if (PDF_EXT.test(url)) return { provider: isCloudinary ? 'Cloudinary' : 'PDF', kind: 'iframe', embedUrl: url, canEmbed: true }

  // Office Online (pptx/docx/xlsx công khai)
  if (OFFICE_EXT.test(url)) {
    return { provider: 'Office Online', kind: 'iframe', embedUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url), canEmbed: true }
  }

  return none
}

// Ưu tiên file (đã up cloudinary) trước, rồi tới link do thí sinh dẫn.
export function pickSource(resource) {
  if (!resource) return null
  return resource.fileUrl || resource.url || null
}
