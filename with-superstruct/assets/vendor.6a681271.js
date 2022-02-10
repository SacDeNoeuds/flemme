var q=Object.defineProperty,x=Object.defineProperties;var F=Object.getOwnPropertyDescriptors;var y=Object.getOwnPropertySymbols;var m=Object.prototype.hasOwnProperty,v=Object.prototype.propertyIsEnumerable;var E=(e,t,r)=>t in e?q(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,l=(e,t)=>{for(var r in t||(t={}))m.call(t,r)&&E(e,r,t[r]);if(y)for(var r of y(t))v.call(t,r)&&E(e,r,t[r]);return e},p=(e,t)=>x(e,F(t));var A=(e,t)=>{var r={};for(var n in e)m.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(e!=null&&y)for(var n of y(e))t.indexOf(n)<0&&v.call(e,n)&&(r[n]=e[n]);return r};class I extends TypeError{constructor(t,r){let n;const c=t,{message:i}=c,s=A(c,["message"]),{path:o}=t,u=o.length===0?i:"At path: "+o.join(".")+" -- "+i;super(u);this.value=void 0,this.key=void 0,this.type=void 0,this.refinement=void 0,this.path=void 0,this.branch=void 0,this.failures=void 0,Object.assign(this,s),this.name=this.constructor.name,this.failures=()=>{var f;return(f=n)!=null?f:n=[t,...r()]}}}function M(e){return a(e)&&typeof e[Symbol.iterator]=="function"}function a(e){return typeof e=="object"&&e!=null}function O(e){return typeof e=="string"?JSON.stringify(e):""+e}function N(e){const{done:t,value:r}=e.next();return t?void 0:r}function T(e,t,r,n){if(e===!0)return;e===!1?e={}:typeof e=="string"&&(e={message:e});const{path:i,branch:s}=t,{type:o}=r,{refinement:u,message:c="Expected a value of type `"+o+"`"+(u?" with refinement `"+u+"`":"")+", but received: `"+O(n)+"`"}=e;return p(l({value:n,type:o,refinement:u,key:i[i.length-1],path:i,branch:s},e),{message:c})}function*w(e,t,r,n){M(e)||(e=[e]);for(const i of e){const s=T(i,t,r,n);s&&(yield s)}}function*_(e,t,r={}){const{path:n=[],branch:i=[e],coerce:s=!1,mask:o=!1}=r,u={path:n,branch:i};if(s&&(e=t.coercer(e,u),o&&t.type!=="type"&&a(t.schema)&&a(e)&&!Array.isArray(e)))for(const f in e)t.schema[f]===void 0&&delete e[f];let c=!0;for(const f of t.validator(e,u))c=!1,yield[f,void 0];for(let[f,d,R]of t.entries(e,u)){const $=_(d,R,{path:f===void 0?n:[...n,f],branch:f===void 0?i:[...i,d],coerce:s,mask:o});for(const g of $)g[0]?(c=!1,yield[g[0],void 0]):s&&(d=g[1],f===void 0?e=d:e instanceof Map?e.set(f,d):e instanceof Set?e.add(d):a(e)&&(e[f]=d))}if(c)for(const f of t.refiner(e,u))c=!1,yield[f,void 0];c&&(yield[void 0,e])}class S{constructor(t){this.TYPE=void 0,this.type=void 0,this.schema=void 0,this.coercer=void 0,this.validator=void 0,this.refiner=void 0,this.entries=void 0;const{type:r,schema:n,validator:i,refiner:s,coercer:o=c=>c,entries:u=function*(){}}=t;this.type=r,this.schema=n,this.entries=u,this.coercer=o,i?this.validator=(c,f)=>{const d=i(c,f);return w(d,f,this,c)}:this.validator=()=>[],s?this.refiner=(c,f)=>{const d=s(c,f);return w(d,f,this,c)}:this.refiner=()=>[]}assert(t){return J(t,this)}create(t){return Y(t,this)}is(t){return C(t,this)}mask(t){return B(t,this)}validate(t,r={}){return h(t,this,r)}}function J(e,t){const r=h(e,t);if(r[0])throw r[0]}function Y(e,t){const r=h(e,t,{coerce:!0});if(r[0])throw r[0];return r[1]}function B(e,t){const r=h(e,t,{coerce:!0,mask:!0});if(r[0])throw r[0];return r[1]}function C(e,t){return!h(e,t)[0]}function h(e,t,r={}){const n=_(e,t,r),i=N(n);if(i[0])return[new I(i[0],function*(){for(const o of n)o[0]&&(yield o[0])}),void 0];{const s=i[1];return[void 0,s]}}function z(e,t){return new S({type:e,schema:null,validator:t})}function G(){return z("never",()=>!1)}function V(e){const t=e?Object.keys(e):[],r=G();return new S({type:"object",schema:e||null,*entries(n){if(e&&a(n)){const i=new Set(Object.keys(n));for(const s of t)i.delete(s),yield[s,n[s],e[s]];for(const s of i)yield[s,n[s],r]}},validator(n){return a(n)||"Expected an object, but received: "+O(n)},coercer(n){return a(n)?l({},n):n}})}function W(){return z("string",e=>typeof e=="string"||"Expected a string, but received: "+O(e))}function X(e,t,r=t){const n="Expected a "+e.type,i=t===r?"of `"+t+"`":"between `"+t+"` and `"+r+"`";return H(e,"size",s=>{if(typeof s=="number"||s instanceof Date)return t<=s&&s<=r||n+" "+i+" but received `"+s+"`";if(s instanceof Map||s instanceof Set){const{size:o}=s;return t<=o&&o<=r||n+" with a size "+i+" but received one with a size of `"+o+"`"}else{const{length:o}=s;return t<=o&&o<=r||n+" with a length "+i+" but received one with a length of `"+o+"`"}})}function H(e,t,r){return new S(p(l({},e),{*refiner(n,i){yield*e.refiner(n,i);const s=r(n,i),o=w(s,i,e,n);for(const u of o)yield p(l({},u),{refinement:t})}}))}var Z=function e(t,r){if(t===r)return!0;if(t&&r&&typeof t=="object"&&typeof r=="object"){if(t.constructor!==r.constructor)return!1;var n,i,s;if(Array.isArray(t)){if(n=t.length,n!=r.length)return!1;for(i=n;i--!=0;)if(!e(t[i],r[i]))return!1;return!0}if(t.constructor===RegExp)return t.source===r.source&&t.flags===r.flags;if(t.valueOf!==Object.prototype.valueOf)return t.valueOf()===r.valueOf();if(t.toString!==Object.prototype.toString)return t.toString()===r.toString();if(s=Object.keys(t),n=s.length,n!==Object.keys(r).length)return!1;for(i=n;i--!=0;)if(!Object.prototype.hasOwnProperty.call(r,s[i]))return!1;for(i=n;i--!=0;){var o=s[i];if(!e(t[o],r[o]))return!1}return!0}return t!==t&&r!==r},k=function(e){var t;if(e===null||typeof e!="object")return e;if(e instanceof Array){t=[];for(var r=0;r<e.length;r++)t[r]=k(e[r]);return t}if(e instanceof Date)return t=new Date(e.valueOf()),t;if(e instanceof RegExp)return t=RegExp(e.source,e.flags),t;if(e instanceof Object){t=new e.constructor;for(var n in e)e.hasOwnProperty(n)&&(t[n]=k(e[n]));return t}throw new Error("Object not cloned")},b=k;const K=e=>Object.prototype.toString.call(e)==="[object Object]",L=(e,t,r)=>{for(let n=0;n<r;n++){if(e===null)return;const i=e[t[n]];if(i===void 0)return;e=i}return e};var j=(e,t,r=".")=>{if(!K(e)||!t)return e;const n=Array.isArray(t)?t:String(t).split(r),{length:i}=n;return i<2?e[n[0]]:L(e,n,i)};const D=e=>typeof e=="object"||typeof e=="function",P=(e,t)=>e=="__proto__"||e=="constructor"&&typeof t.constructor=="function",Q=(e,t,r,n)=>{let i=e,s=0;for(;s<r-1;s++){const o=t[s];P(o,i)||(i=D(i[o])?i[o]:i[o]={})}return i[t[s]]=n,e};var ee=(e,t,r,n=".")=>{if(!D(e)||!t||!t.length)return e;const i=Array.isArray(t)?t:String(t).split(n);if(P(i[0],e))return e;const{length:s}=i;return s===1?(e[i[0]]=r,e):Q(e,i,s,r)};export{ee as a,W as b,b as c,Z as f,j as m,V as o,X as s};
