export type CivicNotice = {
  id: string
  text: string
  level?: 'info' | 'warning' | 'urgent'
}

export type CivicNoticeStripProps = {
  notices: CivicNotice[]
  emptyText?: string
}

export function CivicNoticeStrip({ notices, emptyText = '暂无新的社区告示。' }: CivicNoticeStripProps) {
  return (
    <section className="civic-notice-strip" aria-label="社区告示">
      {notices.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        notices.map((notice) => (
          <p key={notice.id} data-level={notice.level ?? 'info'}>
            {notice.text}
          </p>
        ))
      )}
    </section>
  )
}
