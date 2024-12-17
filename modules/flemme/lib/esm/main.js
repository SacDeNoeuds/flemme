const e = (e = [], t = void 0, i = e.length) => [...e.slice(0, i), t, ...e.slice(i)],
  t = (e, t) => e?.filter((e, i) => i !== t)
function i({ get: e, set: t, isEqual: i, cloneDeep: a }) {
  return function ({ initial: r, validate: n = () => {}, validationTriggers: s = [], submit: o }) {
    let l = a(r),
      d = a(l)
    const c = new Map(),
      v = new Set(),
      u = new Set()
    let f,
      h,
      w = !1
    const g = { blur: new Set(), change: new Set(), focus: new Set(), reset: new Set(), validated: new Set() },
      E = (e, t) => {
        g[e].forEach((e) => e(t))
      },
      S = {
        initial: (t) => (void 0 === t ? l : e(l, t)),
        value: (t) => (void 0 === t ? d : e(d, t)),
        isDirty: (e) => !i(S.value(e), S.initial(e)),
        isActive: (e) => (e ? !!f?.startsWith(e) : !!f),
        isVisited: (e) =>
          e
            ? ((e, t) => {
                for (const i of e) if (t(i)) return !0
                return !1
              })(v, (t) => t.startsWith(e))
            : v.size > 0,
        change: (...e) => (1 === e.length ? b(e[0]) : m(e[0], e[1])),
        blur: (e) => {
          ;(f = void 0), E('blur', e)
        },
        focus: (e) => {
          ;(f = e), v.add(e), w && u.add(e), E('focus', e)
        },
        reset: (e = l) => {
          if (w) throw new Error('cannot reset form while submitting')
          ;(l = a(e)), (d = a(e)), v.clear(), (h = void 0), (f = void 0), E('reset', void 0)
        },
        resetAt: (...i) => {
          const [a, r] = i
          2 === i.length && t(l, a, r),
            t(d, a, e(l, a)),
            ((e, t) => {
              ;((e, t, i) => {
                for (const a of e) t(a) && i(a)
              })(e, t, (t) => e.delete(t))
            })(v, (e) => e.startsWith(a)),
            E('reset', a)
        },
        on: (...e) => (2 === e.length ? y(...e) : W(...e)),
        submit: async () => {
          if ((S.validate(), !S.isValid())) throw new Error('invalid form data')
          w = !0
          try {
            const e = await o(S.value())
            return (w = !1), S.reset(S.value()), e
          } finally {
            ;(w = !1), p()
          }
        },
        validate: () => {
          ;(h = n(d)), E('validated', void 0)
        },
        errors: () => h,
        isValid: () => void 0 === h,
      },
      b = (e) => {
        ;(d = a(e)), w && c.set('', e), E('change', void 0)
      },
      m = (e, i) => {
        t(d, e, i), w && c.set(e, i), E('change', e)
      },
      y = (e, t) => (g[e].add(t), () => g[e].delete(t)),
      W = (e, t, i) => {
        const a = (t) => {
          ;(t && !t.startsWith(e)) || i(e)
        }
        return g[t].add(a), () => g[t].delete(a)
      },
      p = () => {
        u.forEach((e) => v.add(e)), u.clear(), c.forEach((e, t) => S.change(t, e)), c.clear()
      }
    return (
      s.forEach((e) => {
        S.on(e, () => S.validate())
      }),
      S
    )
  }
}
export { e as addItem, i as makeLib, t as removeItem }
//# sourceMappingURL=main.js.map
