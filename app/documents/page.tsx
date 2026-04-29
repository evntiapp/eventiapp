'use client'
export const dynamic = 'force-dynamic'

// -- Setup required in Supabase before using this page --
//
// 1. Create a storage bucket named 'documents' (private)
//    Supabase Dashboard > Storage > New bucket > name: documents > uncheck Public
//
// 2. Run in Supabase SQL editor:
//
// CREATE TABLE public.documents (
//   id uuid default gen_random_uuid() primary key,
//   event_id uuid references public.events(id) on delete cascade,
//   client_id uuid references auth.users(id),
//   name text not null,
//   type text default 'other',
//   file_url text,
//   file_size integer,
//   vendor_name text,
//   notes text,
//   created_at timestamp with time zone default now()
// );
//
// ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "Clients manage own documents"
//   ON public.documents FOR ALL
//   USING (auth.uid() = client_id)
//   WITH CHECK (auth.uid() = client_id);

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import type { DragEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'
import { useLogoHref } from '@/app/hooks/useLogoHref'
import { ArrowLeft } from 'lucide-react'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-dv',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-dv',
})

// ── Types ──────────────────────────────────────────────────────────────────────

interface EventData {
  id: string
  event_type: string | null
  event_date: string | null
}

interface Doc {
  id: string
  event_id: string
  client_id: string
  name: string
  type: string
  file_url: string | null   // stores the storage path
  file_size: number | null
  vendor_name: string | null
  notes: string | null
  created_at: string
}

type DocType    = 'contract' | 'receipt' | 'invoice' | 'insurance' | 'permit' | 'photo' | 'other'
type FilterTab  = 'all' | 'contract' | 'receipt' | 'invoice' | 'other'

// ── Constants ──────────────────────────────────────────────────────────────────

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'contract',  label: 'Contract' },
  { value: 'receipt',   label: 'Receipt' },
  { value: 'invoice',   label: 'Invoice' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'permit',    label: 'Permit' },
  { value: 'photo',     label: 'Photo' },
  { value: 'other',     label: 'Other' },
]

const TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  contract:  { bg: '#F3E8FF', color: '#4A0E6E', label: 'Contract' },
  receipt:   { bg: '#E6F7F2', color: '#0D9B6A', label: 'Receipt' },
  invoice:   { bg: '#FEF3E2', color: '#E67E22', label: 'Invoice' },
  insurance: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Insurance' },
  permit:    { bg: '#FDEDEC', color: '#C0392B', label: 'Permit' },
  photo:     { bg: '#F5F3FF', color: '#6B1F9A', label: 'Photo' },
  other:     { bg: '#F3F4F6', color: '#7C6B8A', label: 'Other' },
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'contract', label: 'Contracts' },
  { key: 'receipt',  label: 'Receipts' },
  { key: 'invoice',  label: 'Invoices' },
  { key: 'other',    label: 'Other' },
]

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.docx'
const MAX_BYTES = 10 * 1024 * 1024

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function guessType(filename: string): DocType {
  const l = filename.toLowerCase()
  if (l.includes('contract') || l.includes('agreement')) return 'contract'
  if (l.includes('receipt'))                               return 'receipt'
  if (l.includes('invoice') || l.includes('bill'))        return 'invoice'
  if (l.includes('insurance'))                             return 'insurance'
  if (l.includes('permit') || l.includes('license'))      return 'permit'
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(l))               return 'photo'
  return 'other'
}

function extIcon(name: string): { bg: string; label: string; color: string } {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf')                          return { bg: '#FDEDEC', label: 'PDF', color: '#C0392B' }
  if (['jpg', 'jpeg', 'png'].includes(ext))  return { bg: '#EFF6FF', label: ext.toUpperCase(), color: '#1D4ED8' }
  if (['doc', 'docx'].includes(ext))         return { bg: '#E6F7F2', label: 'DOC', color: '#0D9B6A' }
  return { bg: '#F3F4F6', label: (ext.toUpperCase() || 'FILE'), color: '#7C6B8A' }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="bg-[#1A1A2E] px-6 pt-0 pb-20">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto space-y-4 pt-8">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="flex gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 w-28 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 -mt-6 space-y-4">
        <div className="h-36 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-40 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── File icon ──────────────────────────────────────────────────────────────────

function FileIcon({ name, size = 44 }: { name: string; size?: number }) {
  const { bg, label, color } = extIcon(name)
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: bg }}
    >
      <span
        className="text-[10px] font-bold leading-none"
        style={{ fontFamily: 'var(--font-syne-dv)', color }}
      >
        {label}
      </span>
    </div>
  )
}

// ── Type badge ─────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const s = TYPE_STYLES[type] ?? TYPE_STYLES.other
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-syne-dv)' }}
    >
      {s.label}
    </span>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

function DocumentsInner() {
  const logoHref     = useLogoHref()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const eventId      = searchParams.get('eventId')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading,      setLoading]      = useState(true)
  const [event,        setEvent]        = useState<EventData | null>(null)
  const [documents,    setDocuments]    = useState<Doc[]>([])
  const [userId,       setUserId]       = useState('')

  // upload
  const [dragging,     setDragging]     = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'other' as DocType, vendor_name: '', notes: '',
  })

  // list
  const [filter,      setFilter]      = useState<FilterTab>('all')
  const [search,      setSearch]      = useState('')
  const [deleting,    setDeleting]    = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    setUserId(user.id)

    let q = supabase
      .from('events')
      .select('id, event_type, event_date')
      .eq('client_id', user.id)

    if (eventId) {
      q = q.eq('id', eventId)
    } else {
      q = q.order('created_at', { ascending: false }).limit(1)
    }

    const { data: evData } = await q
    const ev = evData?.[0] ?? null
    setEvent(ev)

    if (ev) {
      const { data: docData } = await supabase
        .from('documents')
        .select('*')
        .eq('event_id', ev.id)
        .order('created_at', { ascending: false })
      setDocuments((docData ?? []) as Doc[])
    }

    setLoading(false)
  }, [router, eventId])

  useEffect(() => { loadData() }, [loadData])

  // ── File selection ─────────────────────────────────────────────────────────

  function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      setUploadError('File exceeds the 10 MB limit.')
      return
    }
    setUploadError(null)
    setSelectedFile(file)
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
    setForm(f => ({ ...f, name: baseName, type: guessType(file.name) }))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function clearSelection() {
    setSelectedFile(null)
    setUploadError(null)
    setForm({ name: '', type: 'other', vendor_name: '', notes: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !event || !form.name.trim()) return
    setUploading(true)
    setUploadError(null)

    const supabase = getSupabaseClient()
    const safeName = selectedFile.name.replace(/\s+/g, '_')
    const storagePath = `${userId}/${event.id}/${Date.now()}-${safeName}`

    const { data: storageData, error: storageErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, selectedFile, { upsert: false })

    if (storageErr) {
      setUploadError(storageErr.message)
      setUploading(false)
      return
    }

    await supabase.from('documents').insert({
      event_id:    event.id,
      client_id:   userId,
      name:        form.name.trim(),
      type:        form.type,
      file_url:    storageData.path,
      file_size:   selectedFile.size,
      vendor_name: form.vendor_name.trim() || null,
      notes:       form.notes.trim()       || null,
    })

    clearSelection()
    setUploading(false)
    await loadData()
  }

  // ── Download (signed URL for private bucket) ───────────────────────────────

  async function downloadDoc(doc: Doc) {
    if (!doc.file_url) return
    setDownloading(doc.id)
    const supabase = getSupabaseClient()
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_url, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    setDownloading(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function deleteDoc(doc: Doc) {
    setDeleting(doc.id)
    const supabase = getSupabaseClient()
    if (doc.file_url) {
      await supabase.storage.from('documents').remove([doc.file_url])
    }
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocuments(prev => prev.filter(d => d.id !== doc.id))
    setDeleting(null)
  }

  if (loading) return <PageSkeleton />

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalDocs     = documents.length
  const contractCount = documents.filter(d => d.type === 'contract').length
  const receiptCount  = documents.filter(d => d.type === 'receipt').length

  const filteredDocs = documents.filter(d => {
    const matchesTab =
      filter === 'all' ? true :
      filter === 'other' ? !['contract', 'receipt', 'invoice'].includes(d.type) :
      d.type === filter
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      d.name.toLowerCase().includes(q) ||
      (d.vendor_name ?? '').toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const eventLabel = event?.event_type ?? 'Your Event'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-dv), system-ui, sans-serif' }}
    >

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-30" style={{ background: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <Link
              href={logoHref}
              className="text-xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-syne-dv)', letterSpacing: '-0.03em' }}
            >
              evnti<span style={{ color: '#DDB8F5' }}>.</span>
            </Link>
          </div>

          <span
            className="hidden sm:block text-sm font-semibold truncate max-w-[200px] text-center"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-syne-dv)' }}
          >
            {eventLabel}
          </span>

          <Link
            href="/dashboard"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-colors flex-shrink-0"
            style={{ fontFamily: 'var(--font-space-dv)' }}
          >
            My Dashboard
          </Link>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="relative">
        <img
          src="/images/feature.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(26,26,46,0.85)' }} />

        <div className="relative z-10">

          {/* Heading + stat pills */}
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
            <h1
              className="text-3xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-syne-dv)', letterSpacing: '-0.025em' }}
            >
              Document Vault
            </h1>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Total docs', value: totalDocs,     color: 'white' },
                { label: 'Contracts',  value: contractCount, color: '#DDB8F5' },
                { label: 'Receipts',   value: receiptCount,  color: '#4ECDC4' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="px-5 py-3 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minWidth: 96,
                  }}
                >
                  <p
                    className="text-2xl font-bold leading-none"
                    style={{ fontFamily: 'var(--font-syne-dv)', color }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-[10px] mt-1 uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.38)' }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 -mt-6 pb-16 space-y-6">

        {/* ── Upload section ── */}
        <div
          className="bg-white rounded-2xl"
          style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.09)' }}
        >
          {!selectedFile ? (
            /* Drop zone */
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 px-8 py-10 rounded-2xl cursor-pointer transition-colors"
              style={{
                border: `2px dashed ${dragging ? '#4A0E6E' : '#DDB8F5'}`,
                background: dragging ? '#F3E8FF' : 'transparent',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: '#F3E8FF' }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M11 14V4M11 4L8 7M11 4l3 3" stroke="#4A0E6E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#4A0E6E" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-bold text-[#4A0E6E]"
                  style={{ fontFamily: 'var(--font-syne-dv)' }}
                >
                  Drag and drop, or click to upload
                </p>
                <p
                  className="text-xs text-[#7C6B8A] mt-1"
                  style={{ fontFamily: 'var(--font-space-dv)' }}
                >
                  PDF, JPG, PNG, DOCX — max 10 MB
                </p>
              </div>
              {uploadError && (
                <p
                  className="text-xs text-[#C0392B]"
                  style={{ fontFamily: 'var(--font-space-dv)' }}
                >
                  {uploadError}
                </p>
              )}
            </div>
          ) : (
            /* Metadata form */
            <form onSubmit={handleUpload} className="p-6">
              {/* Selected file header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE5F7]">
                <FileIcon name={selectedFile.name} size={44} />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold text-[#1A1A2E] truncate"
                    style={{ fontFamily: 'var(--font-syne-dv)' }}
                  >
                    {selectedFile.name}
                  </p>
                  <p
                    className="text-xs text-[#7C6B8A] mt-0.5"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FDEDEC] transition-colors flex-shrink-0"
                  aria-label="Remove selected file"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M1 1l9 9M10 1l-9 9" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Document name */}
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    Document name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  />
                </div>

                {/* Document type */}
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    Document type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as DocType }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    {DOC_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Related vendor */}
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    Related vendor (optional)
                  </label>
                  <input
                    type="text"
                    value={form.vendor_name}
                    onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))}
                    placeholder="e.g. Bloom & Co"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any notes about this document"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  />
                </div>
              </div>

              {uploadError && (
                <p
                  className="text-xs text-[#C0392B] mt-3"
                  style={{ fontFamily: 'var(--font-space-dv)' }}
                >
                  {uploadError}
                </p>
              )}

              {uploading && (
                <div className="mt-4">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F3E8FF' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #4A0E6E, #DDB8F5)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#7C6B8A] mt-1.5" style={{ fontFamily: 'var(--font-space-dv)' }}>
                    Uploading...
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  disabled={uploading || !form.name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                  style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-dv)' }}
                >
                  {uploading ? 'Uploading...' : 'Upload document'}
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#DDB8F5] text-[#7C6B8A] hover:bg-[#F3E8FF] transition-colors"
                  style={{ fontFamily: 'var(--font-space-dv)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleInputChange}
            className="sr-only"
          />
        </div>

        {/* ── Filter + Search ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div
            className="flex gap-1 bg-white rounded-xl p-1 flex-shrink-0"
            style={{ boxShadow: '0 1px 4px rgba(74,14,110,0.07)' }}
          >
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  background: filter === tab.key ? '#4A0E6E' : 'transparent',
                  color: filter === tab.key ? 'white' : '#7C6B8A',
                  fontFamily: 'var(--font-space-dv)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-1 px-4 py-2.5 rounded-xl border border-[#DDB8F5] bg-white focus-within:border-[#4A0E6E] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="#7C6B8A" strokeWidth="1.4" />
              <path d="M9.5 9.5l2.5 2.5" stroke="#7C6B8A" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or vendor..."
              className="flex-1 bg-transparent text-sm text-[#1A1A2E] outline-none"
              style={{ fontFamily: 'var(--font-space-dv)' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors"
                style={{ fontFamily: 'var(--font-space-dv)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Document grid ── */}
        {filteredDocs.length === 0 ? (
          <div
            className="bg-white rounded-2xl px-6 py-16 flex flex-col items-center text-center"
            style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.09)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#F3E8FF' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4A0E6E" strokeWidth="1.5" strokeLinejoin="round" />
                <polyline points="14,2 14,8 20,8" stroke="#4A0E6E" strokeWidth="1.5" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p
              className="text-base font-bold text-[#1A1A2E] mb-2"
              style={{ fontFamily: 'var(--font-syne-dv)' }}
            >
              {documents.length === 0
                ? 'No documents yet.'
                : 'No documents match your filter.'}
            </p>
            <p
              className="text-sm text-[#7C6B8A]"
              style={{ fontFamily: 'var(--font-space-dv)' }}
            >
              {documents.length === 0
                ? 'Upload your first contract or receipt.'
                : 'Try a different filter or search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 flex flex-col gap-3"
                style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.07)' }}
              >
                {/* Top row: icon + name + badge */}
                <div className="flex items-start gap-3">
                  <FileIcon name={doc.name} size={44} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold text-[#1A1A2E] leading-snug"
                      style={{
                        fontFamily: 'var(--font-syne-dv)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {doc.name}
                    </p>
                    <div className="mt-1.5">
                      <TypeBadge type={doc.type} />
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-1 flex-1">
                  {doc.vendor_name && (
                    <p
                      className="text-xs text-[#7C6B8A] truncate"
                      style={{ fontFamily: 'var(--font-space-dv)' }}
                    >
                      {doc.vendor_name}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs text-[#7C6B8A]"
                      style={{ fontFamily: 'var(--font-space-dv)' }}
                    >
                      {formatDate(doc.created_at)}
                    </span>
                    {doc.file_size != null && (
                      <span
                        className="text-xs text-[#7C6B8A]"
                        style={{ fontFamily: 'var(--font-space-dv)' }}
                      >
                        {formatBytes(doc.file_size)}
                      </span>
                    )}
                  </div>
                  {doc.notes && (
                    <p
                      className="text-xs text-[#7C6B8A] truncate"
                      style={{ fontFamily: 'var(--font-space-dv)' }}
                    >
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-[#F3E8FF]">
                  <button
                    type="button"
                    onClick={() => downloadDoc(doc)}
                    disabled={!doc.file_url || downloading === doc.id}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-[#DDB8F5] text-[#4A0E6E] hover:bg-[#F3E8FF] transition-colors disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    {downloading === doc.id ? 'Opening...' : 'Download'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDoc(doc)}
                    disabled={deleting === doc.id}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#FDEDEC] text-[#C0392B] hover:bg-[#FDEDEC] transition-colors disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-space-dv)' }}
                  >
                    {deleting === doc.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default function DocumentsPage() {
  return <Suspense><DocumentsInner /></Suspense>
}
