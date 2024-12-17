'use strict'
;(exports.registerCheckbox = function (e, t, n) {
  if ('checkbox' !== e.type) throw new Error('input must be a checkbox')
  e.addEventListener('change', () => t.change(n, e.checked))
}),
  (exports.registerTextInput = function (e, t, n) {
    e.addEventListener('input', () => t.change(n, e.value)),
      e.addEventListener('focus', () => t.focus(n)),
      e.addEventListener('blur', () => t.blur(n))
  })
//# sourceMappingURL=main.js.map
