function setPageQuery(pageIndexZeroBased, replace) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', (pageIndexZeroBased + 1).toString());
  if (replace) {
    history.replaceState(history.state, '', url);
  } else {
    history.pushState(history.state, '', url);
  }
}

// Returns true if the given CSS media query currently matches.
// Used by Blazor components that need a one-off viewport check.
function mediaMatches(query) {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;
}
