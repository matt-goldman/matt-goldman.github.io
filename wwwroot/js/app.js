function setPageQuery(pageIndexZeroBased, replace) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', (pageIndexZeroBased + 1).toString());
  if (replace) {
    history.replaceState(history.state, '', url);
  } else {
    history.pushState(history.state, '', url);
  }
}
