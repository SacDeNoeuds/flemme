function e(e, n, t) {
  e.addEventListener('input', () => n.change(t, e.value)),
    e.addEventListener('focus', () => n.focus(t)),
    e.addEventListener('blur', () => n.blur(t))
}
function n(e, n, t) {
  if ('checkbox' !== e.type) throw new Error('input must be a checkbox')
  e.addEventListener('change', () => n.change(t, e.checked))
}
export { n as registerCheckbox, e as registerTextInput }
//# sourceMappingURL=main.js.map
