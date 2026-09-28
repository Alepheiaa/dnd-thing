const I = {
  dot: '<circle cx="12" cy="12" r="3.5"/>'
}


const S = `
:host{
  --card:#2a2e40;
  --pill:rgba(255,255,255,.16);
  --text:#e8eaf2;
  --radius:26px;
  --icon:20px;
  --art:300px;
  --art-radius:14px;
  --list:344px;
  display:block;
  color:var(--text);
  font:500 15px/1.2 "Segoe UI",Inter,system-ui,sans-serif;
}
.c{
  box-sizing:border-box;
  display:flex;
  gap:14px;
  width:min(92vw,calc(var(--list) + var(--art) + 42px));
  min-height:var(--min-h,0);
  max-height:min(82vh,560px);
  margin:0 auto;
  padding:14px;
  border-radius:var(--radius);
  background:var(--card);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),0 24px 60px rgba(0,0,0,.45);
}
.l{
  box-sizing:border-box;
  flex:1 1 auto;
  width:var(--list);
  min-width:0;
  max-width:100%;
  display:flex;
  flex-direction:column;
  gap:4px;
  margin:0;
  padding:26px 10px;
  list-style:none;
  overflow:auto;
  outline:none;
}
.r{
  display:flex;
  flex:0 0 auto;
  align-items:center;
  gap:14px;
  height:42px;
  padding:0 12px;
  border-radius:6px;
  cursor:pointer;
  transition:background .12s;
}
.r:hover{background:rgba(255,255,255,.07)}
.r.s{background:var(--pill)}
.l:focus-visible .r.s{background:var(--pill-on,rgba(255,255,255,.26))}
.g{flex:0 0 var(--icon);height:var(--icon);display:grid;place-items:center;opacity:.92}
.g svg{display:block;width:var(--icon);height:var(--icon)}
.t{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.w{
  flex:0 0 var(--art);
  display:grid;
  border-radius:var(--art-radius);
}
@media (max-width:640px){.w{display:none}.c{width:min(92vw,calc(var(--list) + 28px))}}
@media (prefers-reduced-motion:reduce){.r{transition:none}}
`

const q = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]))

const g = v => I[v]
  ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[v]}</svg>`
  : ''


class M extends HTMLElement {
  #e = []
  #i = 0
  #l
  #b = ''
  #t = 0

  constructor() {
    super()
    const d = this.attachShadow({mode: 'open'})
    d.innerHTML = `<style>${S}</style><div class="c"><ul class="l" role="menu" tabindex="0"></ul><div class="w"><slot></slot></div></div>`
    this.#l = d.querySelector('.l')
    this.#l.addEventListener('keydown', k => this.#k(k))
    this.#l.addEventListener('click', k => {
      const r = k.target.closest('.r')
      if (r) this.#p(+r.dataset.n)
    })
  }

  get entries() { return this.#e }

  set entries(v) {
    this.#e = Array.isArray(v) ? v : []
    this.#r()
  }

  get index() { return this.#i }

  set index(v) {
    this.#u(+v || 0)
  }

  #r() {
    const n = this.#e.length
    this.#i = Math.min(Math.max(this.#i, 0), Math.max(n - 1, 0))
    this.#l.innerHTML = this.#e.map((x, j) =>
      `<li class="r${j === this.#i ? ' s' : ''}" id="r${j}" role="menuitem" data-n="${j}"><span class="g">${g(x.icon)}</span><span class="t">${q(x.label ?? '')}</span></li>`
    ).join('')
    this.#l.setAttribute('aria-activedescendant', n ? `r${this.#i}` : '')
  }

  #u(j) {
    const a = this.#l.children
    if (!a.length) return
    j = (j % a.length + a.length) % a.length
    a[this.#i]?.classList.remove('s')
    this.#i = j
    a[j].classList.add('s')
    this.#l.setAttribute('aria-activedescendant', a[j].id)
    a[j].scrollIntoView({block: 'nearest'})
  }

  #p(j) {
    this.#u(j)
    const x = this.#e[this.#i]
    if (!x) return
    this.dispatchEvent(new CustomEvent('pick', {
      detail: {index: this.#i, entry: x},
      bubbles: true,
      cancelable: true
    }))
  }

  #k(k) {
    if (!this.#e.length) return
    const n = this.#e.length
    switch (k.key) {
      case 'ArrowDown': this.#u(this.#i + 1); break
      case 'ArrowUp': this.#u(this.#i - 1); break
      case 'Home': this.#u(0); break
      case 'End': this.#u(n - 1); break
      case 'Enter':
      case ' ': this.#p(this.#i); break
      default:
        if (k.key.length !== 1 || k.ctrlKey || k.metaKey || k.altKey) return
        this.#f(k.key)
    }
    k.preventDefault()
  }

  #f(c) {
    const t = Date.now()
    this.#b = t - this.#t > 700 ? c : this.#b + c
    this.#t = t
    const rp = [...this.#b].every(x => x === this.#b[0])
    const s = (rp ? this.#b[0] : this.#b).toLowerCase()
    const n = this.#e.length
    const st = rp ? this.#i + 1 : this.#i
    for (let j = 0; j < n; j++) {
      const m = (st + j) % n
      if ((this.#e[m].label || '').toLowerCase().startsWith(s)) return this.#u(m)
    }
  }
}

customElements.define('ethereal-menu', M)
