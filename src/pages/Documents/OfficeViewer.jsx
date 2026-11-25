// sahil
import React, { useEffect, useRef, useState } from 'react';
import { init as initPptx } from 'pptx-preview';
import { renderAsync } from 'docx-preview';

const OfficeViewer = ({ url, type, fallbackText }) => {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !url) return;

    let cancelled = false;
    el.innerHTML = '';
    setStatus('loading');

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load the file (${res.status})`);
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        if (type === 'pptx') {
          // slides are drawn at the width of the panel, in 16:9
          const width = Math.max(320, el.clientWidth - 32);
          const height = Math.round((width * 9) / 16);
          const previewer = initPptx(el, { width, height });
          await previewer.preview(buffer);
        } else if (type === 'docx') {
          await renderAsync(buffer, el, undefined, { inWrapper: true });
        }

        if (!cancelled) setStatus('ready');
      } catch (err) {
        console.error('Office preview failed:', err);
        if (!cancelled) {
          setErrorMsg(err.message || 'Preview failed');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (el) el.innerHTML = '';
    };
  }, [url, type]);

  return (
    <div className="h-full overflow-y-auto bg-slate-100 p-4">
      {status === 'loading' && (
        <p className="text-center text-sm text-slate-500">Loading preview...</p>
      )}

      {status === 'error' && (
        <div className="rounded-lg bg-white p-4 text-sm">
          <p className="mb-3 text-red-600">Could not render the preview ({errorMsg}). Showing the text instead:</p>
          <div className="whitespace-pre-wrap text-slate-800">{fallbackText || 'No text available.'}</div>
        </div>
      )}

      {/* the library draws the slides / pages into this div */}
      <div ref={containerRef} className={status === 'error' ? 'hidden' : ''} />
    </div>
  );
};

export default OfficeViewer;