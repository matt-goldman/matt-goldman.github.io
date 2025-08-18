let scriptPrimed = false;

export async function mount(host, opts) {
  unmount(host); // clean any previous iframe/script

  const container = document.createElement('div');
  container.id = 'giscus_thread';
  host.innerHTML = '';
  host.appendChild(container);

  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';

  // Required
  s.setAttribute('data-repo', opts.repo);
  s.setAttribute('data-repo-id', opts.repoId);
  s.setAttribute('data-category', opts.category);
  s.setAttribute('data-category-id', opts.categoryId);
  s.setAttribute('data-mapping', opts.mapping);        // e.g. "pathname" | "title" | "specific"
  if (opts.term) s.setAttribute('data-term', opts.term); // when mapping = "specific"

  // Common
  s.setAttribute('data-strict', opts.strict ?? '0');
  s.setAttribute('data-reactions-enabled', opts.reactionsEnabled ?? '1');
  s.setAttribute('data-emit-metadata', opts.emitMetadata ?? '0');
  s.setAttribute('data-input-position', opts.inputPosition ?? 'bottom');
  s.setAttribute('data-theme', opts.theme ?? 'light');   // force site theme (light for now)
  s.setAttribute('data-lang', opts.lang ?? 'en');
  s.setAttribute('data-loading', 'lazy');

  container.appendChild(s);
}

export function unmount(host) {
  if (!host) return;
  try {
    const frame = host.querySelector?.('iframe.giscus-frame');
    frame?.parentNode?.remove();       // removes the wrapper div that holds the script+iframe
    host.innerHTML = '';                // idempotent
  } catch (e) {
    // swallow – unmount should be safe to call any time
  }
}


export function setTheme(host, theme) {
  const frame = host.querySelector('iframe.giscus-frame');
  if (!frame?.contentWindow) return;
  frame.contentWindow.postMessage(
    { giscus: { setConfig: { theme } } },
    'https://giscus.app'
  );
}
