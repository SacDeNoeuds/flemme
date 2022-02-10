import{m as V,a as x,f as C,c as I,o as B,s as W,b as q}from"./vendor.6a681271.js";const K=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const m of a.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&n(m)}).observe(document,{childList:!0,subtree:!0});function i(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerpolicy&&(a.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?a.credentials="include":s.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=i(s);fetch(s.href,a)}};K();const k=(t,o)=>((i,n,s)=>{for(const a of i)n(a)&&s(a)})(t,o,i=>t.delete(i)),j=(t,o)=>{for(const i of t)if(o(i))return!0;return!1},R=({get:t,set:o,isEqual:i,cloneDeep:n})=>({initial:s,validate:a=()=>{},validationTriggers:m=[]})=>{let d=n(s),f=n(d);const g=new Set,S=new Map,y=new Set,M=new Set;let l,w,p=!1;const b={blur:[],change:[],focus:[],reset:[],validated:[]},L=new WeakMap,v=(e,r)=>b[e].forEach(c=>c(r)),u={initial:e=>e===void 0?d:t(d,e),value:e=>e===void 0?f:t(f,e),isDirty:e=>!i(u.value(e),u.initial(e)),isActive:e=>e?!!(l==null?void 0:l.startsWith(e)):!!l,isModified:e=>!!p||(e?j(g,r=>r.startsWith(e)):g.size>0),isVisited:e=>!!p||(e?j(y,r=>r.startsWith(e)):y.size>0),change:(...e)=>e.length===1?A(e[0]):F(e[0],e[1]),blur:e=>{l=void 0,v("blur",e)},focus:e=>{l=e,y.add(e),p&&M.add(e),v("focus",e)},reset:(e=d)=>{d=n(e),f=n(e),p=!1,g.clear(),y.clear(),w=void 0,l=void 0,v("reset",void 0)},resetAt:(...e)=>{const[r,c]=e;e.length===2&&o(d,r,c),o(f,r,t(d,r)),k(g,h=>h.startsWith(r)),k(y,h=>h.startsWith(r)),p=!1,(l==null?void 0:l.startsWith(r))&&(l=void 0),v("reset",r)},on:(e,r,c)=>c===void 0?N(e,r):O(e,r,c),off:(e,r)=>P(e,r),submit:async e=>{if(p=!0,u.validate(),!u.isValid())throw new Error("invalid form data");return e(u.value()).then(()=>u.reset(u.value())).finally(()=>T())},validate:()=>{w=a(f),v("validated",void 0)},errors:()=>w,isValid:()=>w===void 0},A=e=>{f=n(e),g.add(""),v("change",void 0)},F=(e,r)=>{o(f,e,r),g.add(e),p&&S.set(e,r),v("change",e)},N=(e,r)=>{const c=()=>r();L.set(r,c),b[e].push(c)},O=(e,r,c)=>{const h=$=>{$&&!$.startsWith(e)||c()};L.set(c,h),b[r].push(h)},P=(e,r)=>{const c=L.get(r);b[e]=b[e].filter(h=>h!==c)},T=()=>{M.forEach(e=>y.add(e)),M.clear(),S.forEach((e,r)=>u.change(r,e)),S.clear()};return m.forEach(e=>{u.on(e,()=>u.validate())}),u},_=R({get:V,set:x,isEqual:C,cloneDeep:I}),G=t=>t==null,E=(t,o="Expected value to be defined")=>{if(G(t))throw new Error(o);return t},H=t=>new Promise(o=>setTimeout(o,t)),z=B({username:W(q(),4,233),password:W(q(),4,233),confirmation:W(q(),4,233)}),J={passwordMismatch:"passwordMismatch"},Q=t=>{const[o]=z.validate(t);if(o)return o.failures().map(n=>{var s;return{code:(s=n.refinement)!=null?s:n.type,path:n.path.join("."),failure:n}});z.assert(t);const i=[];return t.password!==t.confirmation&&i.push({code:J.passwordMismatch,path:"confirmation"}),i.length===0?void 0:i},U=()=>_({initial:{},validate:Q,validationTriggers:["change"]}),X=async t=>{await H(750),console.info("Submitted:",t)},Y={passwordMismatch:"Passwords must match"},D=(t,o)=>{const i=E(document.querySelector(`input[name=${o}]`),`input "${o}" should be defined`),n=E(document.querySelector(`small#${o}-error`),`feedback "${o}" should be defined`);i.addEventListener("input",()=>t.change(o,i.value||void 0)),i.addEventListener("focus",()=>t.focus(o)),i.addEventListener("blur",()=>t.blur(o)),t.on("validated",()=>{var m;const a=((m=t.errors())!=null?m:[]).filter(({path:d})=>d===o).map(({code:d})=>{var f;return(f=Y[d.toString()])!=null?f:`Received error code "${d}"`});n.innerText=a.join(`
`)})};async function Z(){const t=U();D(t,"username"),D(t,"password"),D(t,"confirmation");const o=E(document.querySelector("form"),"Form should be defined"),i=E(document.querySelector(".dimmer"),"Dimmer should be defined");o.addEventListener("submit",n=>{n.preventDefault(),i.style.display="block",t.submit(X).catch(s=>{console.error(s),alert("Submit failed")}).finally(()=>{i.style.display="none"})})}Z().catch(t=>{console.error(t)});
