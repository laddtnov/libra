// Password-reset redirects land on /?reset=1. This runs as a classic script
// before the deferred module graph, so ui-auth.js finds the flag already set
// and opens the reset screen instead of the normal app.
//
// External rather than inline: the CSP is script-src 'self' with no
// unsafe-inline, which silently blocked this when it lived in index.html.
if (new URLSearchParams(location.search).get('reset') === '1') {
  sessionStorage.setItem('libra-recovery', '1');
}
