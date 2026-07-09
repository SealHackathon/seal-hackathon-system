import { ArrowSquareOut, Warning, FileArrowUp, LinkSimple } from '@phosphor-icons/react'
import { resolveEmbed, pickSource } from '../../../utils/embed'
import Button from '../../shared/Button'
import styles from './EmbedPreview.module.css'

const LABEL = {
  slide: 'slide thuyết trình',
  video: 'video demo',
}

/**
 * EmbedPreview — nhúng preview cho Slide hoặc Video (link hoặc file cloudinary).
 * Luôn có nút "Mở link gốc". Nếu không nhúng được thì hiện gợi ý mở ngoài.
 *
 * @param {'slide'|'video'} kind
 * @param {object} resource  — { url, fileUrl }
 */
function EmbedPreview({ kind, resource }) {
  const src = pickSource(resource)

  if (!src) {
    return (
      <div className={styles.empty}>
        <FileArrowUp size={30} weight="duotone" />
        <p>Đội này chưa nộp {LABEL[kind] ?? 'nội dung'}.</p>
      </div>
    )
  }

  const info = resolveEmbed(src)
  const isFile = !!(resource.fileUrl && !resource.url) || src === resource.fileUrl

  return (
    <div className={styles.wrap}>
      {/* Thanh thông tin nguồn + mở link gốc */}
      <div className={styles.bar}>
        <span className={styles.provider}>
          {isFile ? <FileArrowUp size={24} weight="fill" /> : <LinkSimple size={24} weight="bold" />}
          {info.provider}
        </span>
        <Button
          label="Mở link gốc"
          icon={ArrowSquareOut}
          iconWeight="bold"
          iconPosition="left"
          variant="outline"
          color="blue"
          onClick={() => window.open(src, '_blank', 'noopener')}
        />
      </div>

      {/* Khung preview */}
      <div className={styles.stage}>
        {info.kind === 'iframe' && (
          <iframe
            className={styles.frame}
            src={info.embedUrl}
            title={LABEL[kind] ?? 'preview'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}

        {info.kind === 'video' && (
          <video className={styles.video} src={info.embedUrl} controls preload="metadata" />
        )}

        {info.kind === 'image' && (
          <img className={styles.image} src={info.embedUrl} alt={LABEL[kind] ?? 'preview'} />
        )}

        {info.kind === 'none' && (
          <div className={styles.fallback}>
            <Warning size={26} weight="fill" />
            <p>Không nhúng trực tiếp được nguồn này.</p>
            <Button
              label="Mở trong tab mới"
              icon={ArrowSquareOut}
              iconWeight="bold"
              iconPosition="left"
              variant="outline"
              color="blue"
              onClick={() => window.open(src, '_blank', 'noopener')}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default EmbedPreview
