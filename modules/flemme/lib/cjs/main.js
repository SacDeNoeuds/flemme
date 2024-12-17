'use strict'
;(exports.addItem = (e = [], t = void 0, i = e.length) => [...e.slice(0, i), t, ...e.slice(i)]),
  (exports.makeLib = function ({ get: e, set: t, isEqual: i, cloneDeep: r }) {
    return function ({ initial: a, validate: n = () => {}, validationTriggers: s = [], submit: o }) {
      let l = r(a),
        d = r(l)
      const c = new Map(),
        v = new Set(),
        u = new Set()
      let f,
        h,
        w = !1
      const g = { blur: new Set(), change: new Set(), focus: new Set(), reset: new Set(), validated: new Set() },
        m = (e, t) => {
          g[e].forEach((e) => e(t))
        },
        b = {
          initial: (t) => (void 0 === t ? l : e(l, t)),
          value: (t) => (void 0 === t ? d : e(d, t)),
          isDirty: (e) => !i(b.value(e), b.initial(e)),
          isActive: (e) => (e ? !!f?.startsWith(e) : !!f),
          isVisited: (e) =>
            e
              ? ((e, t) => {
                  for (const i of e) if (t(i)) return !0
                  return !1
                })(v, (t) => t.startsWith(e))
              : v.size > 0,
          change: (...e) => (1 === e.length ? E(e[0]) : S(e[0], e[1])),
          blur: (e) => {
            ;(f = void 0), m('blur', e)
          },
          focus: (e) => {
            ;(f = e), v.add(e), w && u.add(e), m('focus', e)
          },
          reset: (e = l) => {
            if (w) throw new Error('cannot reset form while submitting')
            ;(l = r(e)), (d = r(e)), v.clear(), (h = void 0), (f = void 0), m('reset', void 0)
          },
          resetAt: (...i) => {
            const [r, a] = i
            2 === i.length && t(l, r, a),
              t(d, r, e(l, r)),
              ((e, t) => {
                ;((e, t, i) => {
                  for (const r of e) t(r) && i(r)
                })(e, t, (t) => e.delete(t))
              })(v, (e) => e.startsWith(r)),
              m('reset', r)
          },
          on: (...e) => (2 === e.length ? p(...e) : y(...e)),
          submit: async () => {
            if ((b.validate(), !b.isValid())) throw new Error('invalid form data')
            w = !0
            try {
              const e = await o(b.value())
              return (w = !1), b.reset(b.value()), e
            } finally {
              ;(w = !1), W()
            }
          },
          validate: () => {
            ;(h = n(d)), m('validated', void 0)
          },
          errors: () => h,
          isValid: () => void 0 === h,
        },
        E = (e) => {
          ;(d = r(e)), w && c.set('', e), m('change', void 0)
        },
        S = (e, i) => {
          t(d, e, i), w && c.set(e, i), m('change', e)
        },
        p = (e, t) => (g[e].add(t), () => g[e].delete(t)),
        y = (e, t, i) => {
          const r = (t) => {
            ;(t && !t.startsWith(e)) || i(e)
          }
          return g[t].add(r), () => g[t].delete(r)
        },
        W = () => {
          u.forEach((e) => v.add(e)), u.clear(), c.forEach((e, t) => b.change(t, e)), c.clear()
        }
      return (
        s.forEach((e) => {
          b.on(e, () => b.validate())
        }),
        b
      )
    }
  }),
  (exports.removeItem = (e, t) => e?.filter((e, i) => i !== t))
//# sourceMappingURL=main.js.map
