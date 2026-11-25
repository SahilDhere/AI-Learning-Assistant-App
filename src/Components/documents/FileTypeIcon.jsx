// sahil
import React from 'react'

const TYPES = {
  pdf:  { label: 'PDF', box: 'bg-red-500' },
  docx: { label: 'DOC', box: 'bg-blue-600' },
  pptx: { label: 'PPT', box: 'bg-orange-500' },
  txt:  { label: 'TXT', box: 'bg-slate-500' },
}

const SIZES = {
  sm: 'h-8 w-8 rounded-lg text-[10px]',
  md: 'h-11 w-11 rounded-xl text-xs',
  lg: 'h-14 w-14 rounded-2xl text-sm',
}

const has = (key) => Object.prototype.hasOwnProperty.call(TYPES, key)

// the file extension is checked first, because it is always correct
export const resolveFileType = (doc) => {
  const ext = (doc?.filename || '').split('.').pop().toLowerCase()
  if (ext === 'md') return 'txt'
  if (has(ext)) return ext
  if (doc?.sourceType && has(doc.sourceType)) return doc.sourceType
  return 'pdf'
}

const FileTypeIcon = ({ type = 'pdf', size = 'md' }) => {
  const config = has(type) ? TYPES[type] : TYPES.pdf

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold tracking-wide text-white shadow-sm ${SIZES[size] || SIZES.md} ${config.box}`}
    >
      {config.label}
    </div>
  )
}

export default FileTypeIcon