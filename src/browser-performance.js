// Safari and iOS browsers use WebKit; native scrolling avoids a second scroll loop.
export const isWebKit = /AppleWebKit/.test(navigator.userAgent) &&
  (!/Chrome|Chromium|Edg|OPR|Android/.test(navigator.userAgent) || /iPad|iPhone|iPod/.test(navigator.userAgent));
