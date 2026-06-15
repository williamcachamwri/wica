import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SEO } from '../components/SEO'

interface CommitFile {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  patch?: string
}

interface CommitData {
  sha: string
  message: string
  author: string
  date: string
  files: CommitFile[]
  totalAdditions: number
  totalDeletions: number
}

const STATUS_LABEL: Record<string, string> = {
  added: 'added',
  modified: 'modified',
  removed: 'removed',
  renamed: 'renamed',
}

function renderDiff(patch: string) {
  const lines = patch.split('\n')
  return lines.map((line, i) => {
    const cls = line.startsWith('+')
      ? 'diff-line--add'
      : line.startsWith('-')
        ? 'diff-line--del'
        : line.startsWith('@@')
          ? 'diff-line--hunk'
          : ''
    return (
      <div key={i} className={`diff-line ${cls}`}>
        <span className="diff-line__num">{i + 1}</span>
        <span className="diff-line__content">{line}</span>
      </div>
    )
  })
}

export default function Changelog() {
  const { sha } = useParams<{ sha: string }>()
  const [data, setData] = useState<CommitData | null>(null)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!sha) return
    let mounted = true

    async function fetchCommit() {
      try {
        const res = await fetch(`https://api.github.com/repos/williamcachamwri/wica/commits/${sha}`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!mounted) return

        const files: CommitFile[] = json.files?.map((f: any) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch || undefined,
        })) || []

        setData({
          sha: json.sha.slice(0, 7),
          message: json.commit?.message || '',
          author: json.commit?.author?.name || '',
          date: json.commit?.author?.date || '',
          files,
          totalAdditions: files.reduce((s: number, f: CommitFile) => s + f.additions, 0),
          totalDeletions: files.reduce((s: number, f: CommitFile) => s + f.deletions, 0),
        })
        setError(false)
      } catch {
        if (mounted) setError(true)
      }
    }

    fetchCommit()
    return () => { mounted = false }
  }, [sha])

  const toggleFile = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (error) {
    return (
      <div className="app-shell app-shell--in">
        <main className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Commit not found</h1>
          <Link to="/" className="inline-link">‹ back home</Link>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="app-shell app-shell--in">
        <main className="max-w-[760px] mx-auto px-6 pt-16 md:pt-24 pb-20">
          <Link to="/" className="inline-link text-sm mb-6 inline-block">‹ back home</Link>
          <div className="changelog-skeleton" aria-busy="true" aria-label="Loading changelog">
            <div className="changelog-skeleton__header">
              <div className="changelog-skeleton__badge" />
              <div className="changelog-skeleton__line changelog-skeleton__line--short" />
              <div className="changelog-skeleton__line changelog-skeleton__line--short" />
            </div>
            <div className="changelog-skeleton__stats">
              <div className="changelog-skeleton__stat" />
              <div className="changelog-skeleton__stat" />
              <div className="changelog-skeleton__stat" />
            </div>
            <div className="changelog-skeleton__message">
              <div className="changelog-skeleton__line" />
              <div className="changelog-skeleton__line" />
              <div className="changelog-skeleton__line changelog-skeleton__line--short" />
            </div>
            <div className="changelog-skeleton__files">
              <div className="changelog-skeleton__file">
                <div className="changelog-skeleton__file-head">
                  <div className="changelog-skeleton__file-status" />
                  <div className="changelog-skeleton__line" />
                </div>
                <div className="changelog-skeleton__bars">
                  <div className="changelog-skeleton__bar" />
                </div>
              </div>
              <div className="changelog-skeleton__file">
                <div className="changelog-skeleton__file-head">
                  <div className="changelog-skeleton__file-status" />
                  <div className="changelog-skeleton__line" />
                </div>
                <div className="changelog-skeleton__bars">
                  <div className="changelog-skeleton__bar" />
                </div>
              </div>
              <div className="changelog-skeleton__file">
                <div className="changelog-skeleton__file-head">
                  <div className="changelog-skeleton__file-status" />
                  <div className="changelog-skeleton__line" />
                </div>
                <div className="changelog-skeleton__bars">
                  <div className="changelog-skeleton__bar" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell app-shell--in">
      <SEO
        title={`${data.sha} — Changelog`}
        description={data.message.split('\n')[0]}
        pathname={`/changelog/${sha}`}
      />
      <div className="grain" aria-hidden="true" />

      <main id="main" className="max-w-[760px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <Link to="/" className="inline-link text-sm mb-6 inline-block">‹ back home</Link>

        <div className="changelog-header">
          <div className="changelog-header__row">
            <span className="changelog-badge">{data.sha}</span>
            <span className="changelog-author">{data.author}</span>
            <span className="changelog-date">{new Date(data.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}</span>
          </div>
          <div className="changelog-stats">
            <span className="changelog-stat changelog-stat--add">+{data.totalAdditions}</span>
            <span className="changelog-stat changelog-stat--del">-{data.totalDeletions}</span>
            <span className="changelog-stat changelog-stat--files">{data.files.length} {data.files.length === 1 ? 'file' : 'files'}</span>
          </div>
        </div>

        <pre className="changelog-message">{data.message}</pre>

        <div className="changelog-files">
          {data.files.map((file, i) => (
            <div key={file.filename} className="changelog-file" style={{ '--i': i } as React.CSSProperties}>
              <button
                type="button"
                className="changelog-file__head"
                onClick={() => toggleFile(i)}
              >
                <span className={`changelog-file__status changelog-file__status--${file.status}`}>
                  {STATUS_LABEL[file.status] || file.status}
                </span>
                <code className="changelog-file__path">{file.filename}</code>
                <span className="changelog-file__expand">
                  {file.patch && (
                    <motion.svg
                      width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      animate={{ rotate: expanded.has(i) ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </motion.svg>
                  )}
                </span>
              </button>
              {(file.additions > 0 || file.deletions > 0) && !file.patch && (
                <div className="changelog-file__bars">
                  {file.additions > 0 && (
                    <span
                      className="changelog-bar changelog-bar--add"
                      style={{ width: `${Math.max(4, (file.additions / Math.max(file.changes, 1)) * 100)}%` }}
                      title={`+${file.additions}`}
                    />
                  )}
                  {file.deletions > 0 && (
                    <span
                      className="changelog-bar changelog-bar--del"
                      style={{ width: `${Math.max(4, (file.deletions / Math.max(file.changes, 1)) * 100)}%` }}
                      title={`-${file.deletions}`}
                    />
                  )}
                </div>
              )}
              <AnimatePresence initial={false}>
                {file.patch && expanded.has(i) && (
                  <motion.div
                    key="diff"
                    className="changelog-file__diff"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26, mass: 0.7 }}
                  >
                    {renderDiff(file.patch)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
