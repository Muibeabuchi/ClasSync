var ps=Object.defineProperty;var ws=(e,t,n)=>t in e?ps(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var qe=(e,t,n)=>ws(e,typeof t!="symbol"?t+"":t,n);import{aC as we,aD as z,aE as At,aF as H,aG as D,aH as v,aI as Po,aJ as B,aK as q,aL as k,aM as V,aN as F,aO as xs,aP as or,aQ as xe,aR as G,aS as Vn,aT as Gn,aU as dt,aV as M,aW as $s,aX as An,aY as Ne,aZ as Cs,a_ as Pt,a$ as Rt,b0 as Ss,b1 as ks,b2 as wn,b3 as Es,b4 as zr,b5 as zt,b6 as qo,b7 as Ds,b8 as As,b9 as W,ba as Kr,bb as Ms,bc as Ts,bd as ir,be as Fs,bf as Is,bg as zn,bh as Os,bi as Ls,bj as oe,bk as Ps,bl as qs,bm as _s}from"./index-CecvFVSM.js";var Rs=e=>e!=null,zs=e=>e.filter(Rs);function Ks(e){return(...t)=>{for(const n of e)n&&n(...t)}}var E=e=>typeof e=="function"&&!e.length?e():e,jn=e=>Array.isArray(e)?e:e?[e]:[];function Bs(e,...t){return typeof e=="function"?e(...t):e}var Ns=G;function Hs(e,t,n,r){const o=e.length,s=t.length;let a=0;if(!s){for(;a<o;a++)n(e[a]);return}if(!o){for(;a<s;a++)r(t[a]);return}for(;a<s&&t[a]===e[a];a++);let l,i;t=t.slice(a),e=e.slice(a);for(l of t)e.includes(l)||r(l);for(i of e)t.includes(i)||n(i)}function Us(e){const[t,n]=z(),r=e!=null&&e.throw?(c,g)=>{throw n(c instanceof Error?c:new Error(g)),c}:(c,g)=>{n(c instanceof Error?c:new Error(g))},o=e!=null&&e.api?Array.isArray(e.api)?e.api:[e.api]:[globalThis.localStorage].filter(Boolean),s=e!=null&&e.prefix?`${e.prefix}.`:"",a=new Map,l=new Proxy({},{get(c,g){let d=a.get(g);d||(d=z(void 0,{equals:!1}),a.set(g,d)),d[0]();const y=o.reduce((b,m)=>{if(b!==null||!m)return b;try{return m.getItem(`${s}${g}`)}catch(p){return r(p,`Error reading ${s}${g} from ${m.name}`),null}},null);return y!==null&&(e!=null&&e.deserializer)?e.deserializer(y,g,e.options):y}}),i=(c,g,d)=>{const y=e!=null&&e.serializer?e.serializer(g,c,d??e.options):g,b=`${s}${c}`;o.forEach(p=>{try{p.getItem(b)!==y&&p.setItem(b,y)}catch(w){r(w,`Error setting ${s}${c} to ${y} in ${p.name}`)}});const m=a.get(c);m&&m[1]()},u=c=>o.forEach(g=>{try{g.removeItem(`${s}${c}`)}catch(d){r(d,`Error removing ${s}${c} from ${g.name}`)}}),h=()=>o.forEach(c=>{try{c.clear()}catch(g){r(g,`Error clearing ${c.name}`)}}),f=()=>{const c={},g=(d,y)=>{if(!c.hasOwnProperty(d)){const b=y&&(e!=null&&e.deserializer)?e.deserializer(y,d,e.options):y;b&&(c[d]=b)}};return o.forEach(d=>{if(typeof d.getAll=="function"){let y;try{y=d.getAll()}catch(b){r(b,`Error getting all values from in ${d.name}`)}for(const b of y)g(b,y[b])}else{let y=0,b;try{for(;b=d.key(y++);)c.hasOwnProperty(b)||g(b,d.getItem(b))}catch(m){r(m,`Error getting all values from ${d.name}`)}}}),c};return(e==null?void 0:e.sync)!==!1&&At(()=>{const c=g=>{var y;let d=!1;o.forEach(b=>{try{b!==g.storageArea&&g.key&&g.newValue!==b.getItem(g.key)&&(g.newValue?b.setItem(g.key,g.newValue):b.removeItem(g.key),d=!0)}catch(m){r(m,`Error synching api ${b.name} from storage event (${g.key}=${g.newValue})`)}}),d&&g.key&&((y=a.get(g.key))==null||y[1]())};"addEventListener"in globalThis?(globalThis.addEventListener("storage",c),G(()=>globalThis.removeEventListener("storage",c))):(o.forEach(g=>{var d;return(d=g.addEventListener)==null?void 0:d.call(g,"storage",c)}),G(()=>o.forEach(g=>{var d;return(d=g.removeEventListener)==null?void 0:d.call(g,"storage",c)})))}),[l,i,{clear:h,error:t,remove:u,toJSON:f}]}var Vs=Us,Gs=e=>(typeof e.clear=="function"||(e.clear=()=>{let t;for(;t=e.key(0);)e.removeItem(t)}),e),Br=e=>{if(!e)return"";let t="";for(const n in e){if(!e.hasOwnProperty(n))continue;const r=e[n];t+=r instanceof Date?`; ${n}=${r.toUTCString()}`:typeof r=="boolean"?`; ${n}`:`; ${n}=${r}`}return t},_e=Gs({_cookies:[globalThis.document,"cookie"],getItem:e=>{var t;return((t=_e._cookies[0][_e._cookies[1]].match("(^|;)\\s*"+e+"\\s*=\\s*([^;]+)"))==null?void 0:t.pop())??null},setItem:(e,t,n)=>{const r=_e.getItem(e);_e._cookies[0][_e._cookies[1]]=`${e}=${t}${Br(n)}`;const o=Object.assign(new Event("storage"),{key:e,oldValue:r,newValue:t,url:globalThis.document.URL,storageArea:_e});window.dispatchEvent(o)},removeItem:e=>{_e._cookies[0][_e._cookies[1]]=`${e}=deleted${Br({expires:new Date(0)})}`},key:e=>{let t=null,n=0;return _e._cookies[0][_e._cookies[1]].replace(/(?:^|;)\s*(.+?)\s*=\s*[^;]+/g,(r,o)=>(!t&&o&&n++===e&&(t=o),"")),t},get length(){let e=0;return _e._cookies[0][_e._cookies[1]].replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g,t=>(e+=t?1:0,"")),e}}),js=1024,Bt=796,_o=700,Ws="bottom-right",Wn="bottom",Qs="system",Ys=!1,Ro=500,Xs=500,zo=500,Zs=Object.keys(Vn)[0],Nr=1,Js=Object.keys(Gn)[0],Ko=we({client:void 0,onlineManager:void 0,queryFlavor:"",version:"",shadowDOMTarget:void 0});function N(){return xe(Ko)}var Bo=we(void 0),ea=e=>{const[t,n]=z(null),r=()=>{const a=t();a!=null&&(a.close(),n(null))},o=(a,l)=>{if(t()!=null)return;const i=window.open("","TSQD-Devtools-Panel",`width=${a},height=${l},popup`);if(!i)throw new Error("Failed to open popup. Please allow popups for this site to view the devtools in picture-in-picture mode.");i.document.head.innerHTML="",i.document.body.innerHTML="",xs(i.document),i.document.title="TanStack Query Devtools",i.document.body.style.margin="0",i.addEventListener("pagehide",()=>{e.setLocalStore("pip_open","false"),n(null)}),[...(N().shadowDOMTarget||document).styleSheets].forEach(u=>{try{const h=[...u.cssRules].map(d=>d.cssText).join(""),f=document.createElement("style"),c=u.ownerNode;let g="";c&&"id"in c&&(g=c.id),g&&f.setAttribute("id",g),f.textContent=h,i.document.head.appendChild(f)}catch{const f=document.createElement("link");if(u.href==null)return;f.rel="stylesheet",f.type=u.type,f.media=u.media.toString(),f.href=u.href,i.document.head.appendChild(f)}}),or(["focusin","focusout","pointermove","keydown","pointerdown","pointerup","click","mousedown","input"],i.document),e.setLocalStore("pip_open","true"),n(i)};H(()=>{(e.localStore.pip_open??"false")==="true"&&!e.disabled&&o(Number(window.innerWidth),Number(e.localStore.height||Xs))}),H(()=>{const a=(N().shadowDOMTarget||document).querySelector("#_goober"),l=t();if(a&&l){const i=new MutationObserver(()=>{const u=(N().shadowDOMTarget||l.document).querySelector("#_goober");u&&(u.textContent=a.textContent)});i.observe(a,{childList:!0,subtree:!0,characterDataOldValue:!0}),G(()=>{i.disconnect()})}});const s=D(()=>({pipWindow:t(),requestPipWindow:o,closePipWindow:r,disabled:e.disabled??!1}));return v(Bo.Provider,{value:s,get children(){return e.children}})},sr=()=>D(()=>{const t=xe(Bo);if(!t)throw new Error("usePiPWindow must be used within a PiPProvider");return t()}),No=we(()=>"dark");function $e(){return xe(No)}var Ho={À:"A",Á:"A",Â:"A",Ã:"A",Ä:"A",Å:"A",Ấ:"A",Ắ:"A",Ẳ:"A",Ẵ:"A",Ặ:"A",Æ:"AE",Ầ:"A",Ằ:"A",Ȃ:"A",Ç:"C",Ḉ:"C",È:"E",É:"E",Ê:"E",Ë:"E",Ế:"E",Ḗ:"E",Ề:"E",Ḕ:"E",Ḝ:"E",Ȇ:"E",Ì:"I",Í:"I",Î:"I",Ï:"I",Ḯ:"I",Ȋ:"I",Ð:"D",Ñ:"N",Ò:"O",Ó:"O",Ô:"O",Õ:"O",Ö:"O",Ø:"O",Ố:"O",Ṍ:"O",Ṓ:"O",Ȏ:"O",Ù:"U",Ú:"U",Û:"U",Ü:"U",Ý:"Y",à:"a",á:"a",â:"a",ã:"a",ä:"a",å:"a",ấ:"a",ắ:"a",ẳ:"a",ẵ:"a",ặ:"a",æ:"ae",ầ:"a",ằ:"a",ȃ:"a",ç:"c",ḉ:"c",è:"e",é:"e",ê:"e",ë:"e",ế:"e",ḗ:"e",ề:"e",ḕ:"e",ḝ:"e",ȇ:"e",ì:"i",í:"i",î:"i",ï:"i",ḯ:"i",ȋ:"i",ð:"d",ñ:"n",ò:"o",ó:"o",ô:"o",õ:"o",ö:"o",ø:"o",ố:"o",ṍ:"o",ṓ:"o",ȏ:"o",ù:"u",ú:"u",û:"u",ü:"u",ý:"y",ÿ:"y",Ā:"A",ā:"a",Ă:"A",ă:"a",Ą:"A",ą:"a",Ć:"C",ć:"c",Ĉ:"C",ĉ:"c",Ċ:"C",ċ:"c",Č:"C",č:"c",C̆:"C",c̆:"c",Ď:"D",ď:"d",Đ:"D",đ:"d",Ē:"E",ē:"e",Ĕ:"E",ĕ:"e",Ė:"E",ė:"e",Ę:"E",ę:"e",Ě:"E",ě:"e",Ĝ:"G",Ǵ:"G",ĝ:"g",ǵ:"g",Ğ:"G",ğ:"g",Ġ:"G",ġ:"g",Ģ:"G",ģ:"g",Ĥ:"H",ĥ:"h",Ħ:"H",ħ:"h",Ḫ:"H",ḫ:"h",Ĩ:"I",ĩ:"i",Ī:"I",ī:"i",Ĭ:"I",ĭ:"i",Į:"I",į:"i",İ:"I",ı:"i",Ĳ:"IJ",ĳ:"ij",Ĵ:"J",ĵ:"j",Ķ:"K",ķ:"k",Ḱ:"K",ḱ:"k",K̆:"K",k̆:"k",Ĺ:"L",ĺ:"l",Ļ:"L",ļ:"l",Ľ:"L",ľ:"l",Ŀ:"L",ŀ:"l",Ł:"l",ł:"l",Ḿ:"M",ḿ:"m",M̆:"M",m̆:"m",Ń:"N",ń:"n",Ņ:"N",ņ:"n",Ň:"N",ň:"n",ŉ:"n",N̆:"N",n̆:"n",Ō:"O",ō:"o",Ŏ:"O",ŏ:"o",Ő:"O",ő:"o",Œ:"OE",œ:"oe",P̆:"P",p̆:"p",Ŕ:"R",ŕ:"r",Ŗ:"R",ŗ:"r",Ř:"R",ř:"r",R̆:"R",r̆:"r",Ȓ:"R",ȓ:"r",Ś:"S",ś:"s",Ŝ:"S",ŝ:"s",Ş:"S",Ș:"S",ș:"s",ş:"s",Š:"S",š:"s",Ţ:"T",ţ:"t",ț:"t",Ț:"T",Ť:"T",ť:"t",Ŧ:"T",ŧ:"t",T̆:"T",t̆:"t",Ũ:"U",ũ:"u",Ū:"U",ū:"u",Ŭ:"U",ŭ:"u",Ů:"U",ů:"u",Ű:"U",ű:"u",Ų:"U",ų:"u",Ȗ:"U",ȗ:"u",V̆:"V",v̆:"v",Ŵ:"W",ŵ:"w",Ẃ:"W",ẃ:"w",X̆:"X",x̆:"x",Ŷ:"Y",ŷ:"y",Ÿ:"Y",Y̆:"Y",y̆:"y",Ź:"Z",ź:"z",Ż:"Z",ż:"z",Ž:"Z",ž:"z",ſ:"s",ƒ:"f",Ơ:"O",ơ:"o",Ư:"U",ư:"u",Ǎ:"A",ǎ:"a",Ǐ:"I",ǐ:"i",Ǒ:"O",ǒ:"o",Ǔ:"U",ǔ:"u",Ǖ:"U",ǖ:"u",Ǘ:"U",ǘ:"u",Ǚ:"U",ǚ:"u",Ǜ:"U",ǜ:"u",Ứ:"U",ứ:"u",Ṹ:"U",ṹ:"u",Ǻ:"A",ǻ:"a",Ǽ:"AE",ǽ:"ae",Ǿ:"O",ǿ:"o",Þ:"TH",þ:"th",Ṕ:"P",ṕ:"p",Ṥ:"S",ṥ:"s",X́:"X",x́:"x",Ѓ:"Г",ѓ:"г",Ќ:"К",ќ:"к",A̋:"A",a̋:"a",E̋:"E",e̋:"e",I̋:"I",i̋:"i",Ǹ:"N",ǹ:"n",Ồ:"O",ồ:"o",Ṑ:"O",ṑ:"o",Ừ:"U",ừ:"u",Ẁ:"W",ẁ:"w",Ỳ:"Y",ỳ:"y",Ȁ:"A",ȁ:"a",Ȅ:"E",ȅ:"e",Ȉ:"I",ȉ:"i",Ȍ:"O",ȍ:"o",Ȑ:"R",ȑ:"r",Ȕ:"U",ȕ:"u",B̌:"B",b̌:"b",Č̣:"C",č̣:"c",Ê̌:"E",ê̌:"e",F̌:"F",f̌:"f",Ǧ:"G",ǧ:"g",Ȟ:"H",ȟ:"h",J̌:"J",ǰ:"j",Ǩ:"K",ǩ:"k",M̌:"M",m̌:"m",P̌:"P",p̌:"p",Q̌:"Q",q̌:"q",Ř̩:"R",ř̩:"r",Ṧ:"S",ṧ:"s",V̌:"V",v̌:"v",W̌:"W",w̌:"w",X̌:"X",x̌:"x",Y̌:"Y",y̌:"y",A̧:"A",a̧:"a",B̧:"B",b̧:"b",Ḑ:"D",ḑ:"d",Ȩ:"E",ȩ:"e",Ɛ̧:"E",ɛ̧:"e",Ḩ:"H",ḩ:"h",I̧:"I",i̧:"i",Ɨ̧:"I",ɨ̧:"i",M̧:"M",m̧:"m",O̧:"O",o̧:"o",Q̧:"Q",q̧:"q",U̧:"U",u̧:"u",X̧:"X",x̧:"x",Z̧:"Z",z̧:"z"},ta=Object.keys(Ho).join("|"),na=new RegExp(ta,"g");function ra(e){return e.replace(na,t=>Ho[t])}var Te={CASE_SENSITIVE_EQUAL:7,EQUAL:6,STARTS_WITH:5,WORD_STARTS_WITH:4,CONTAINS:3,ACRONYM:2,MATCHES:1,NO_MATCH:0};function Hr(e,t,n){var r;if(n=n||{},n.threshold=(r=n.threshold)!=null?r:Te.MATCHES,!n.accessors){const a=Ur(e,t,n);return{rankedValue:e,rank:a,accessorIndex:-1,accessorThreshold:n.threshold,passed:a>=n.threshold}}const o=aa(e,n.accessors),s={rankedValue:e,rank:Te.NO_MATCH,accessorIndex:-1,accessorThreshold:n.threshold,passed:!1};for(let a=0;a<o.length;a++){const l=o[a];let i=Ur(l.itemValue,t,n);const{minRanking:u,maxRanking:h,threshold:f=n.threshold}=l.attributes;i<u&&i>=Te.MATCHES?i=u:i>h&&(i=h),i=Math.min(i,h),i>=f&&i>s.rank&&(s.rank=i,s.passed=!0,s.accessorIndex=a,s.accessorThreshold=f,s.rankedValue=l.itemValue)}return s}function Ur(e,t,n){return e=Vr(e,n),t=Vr(t,n),t.length>e.length?Te.NO_MATCH:e===t?Te.CASE_SENSITIVE_EQUAL:(e=e.toLowerCase(),t=t.toLowerCase(),e===t?Te.EQUAL:e.startsWith(t)?Te.STARTS_WITH:e.includes(` ${t}`)?Te.WORD_STARTS_WITH:e.includes(t)?Te.CONTAINS:t.length===1?Te.NO_MATCH:oa(e).includes(t)?Te.ACRONYM:ia(e,t))}function oa(e){let t="";return e.split(" ").forEach(r=>{r.split("-").forEach(s=>{t+=s.substr(0,1)})}),t}function ia(e,t){let n=0,r=0;function o(i,u,h){for(let f=h,c=u.length;f<c;f++)if(u[f]===i)return n+=1,f+1;return-1}function s(i){const u=1/i,h=n/t.length;return Te.MATCHES+h*u}const a=o(t[0],e,0);if(a<0)return Te.NO_MATCH;r=a;for(let i=1,u=t.length;i<u;i++){const h=t[i];if(r=o(h,e,r),!(r>-1))return Te.NO_MATCH}const l=r-a;return s(l)}function Vr(e,t){let{keepDiacritics:n}=t;return e=`${e}`,n||(e=ra(e)),e}function sa(e,t){let n=t;typeof t=="object"&&(n=t.accessor);const r=n(e);return r==null?[]:Array.isArray(r)?r:[String(r)]}function aa(e,t){const n=[];for(let r=0,o=t.length;r<o;r++){const s=t[r],a=la(s),l=sa(e,s);for(let i=0,u=l.length;i<u;i++)n.push({itemValue:l[i],attributes:a})}return n}var Gr={maxRanking:1/0,minRanking:-1/0};function la(e){return typeof e=="function"?Gr:{...Gr,...e}}var ca={data:""},ua=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||ca,da=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,fa=/\/\*[^]*?\*\/|  +/g,jr=/\n+/g,Dt=(e,t)=>{let n="",r="",o="";for(let s in e){let a=e[s];s[0]=="@"?s[1]=="i"?n=s+" "+a+";":r+=s[1]=="f"?Dt(a,s):s+"{"+Dt(a,s[1]=="k"?"":t)+"}":typeof a=="object"?r+=Dt(a,t?t.replace(/([^,])+/g,l=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,i=>/&/.test(i)?i.replace(/&/g,l):l?l+" "+i:i)):s):a!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=Dt.p?Dt.p(s,a):s+":"+a+";")}return n+(t&&o?t+"{"+o+"}":o)+r},at={},Uo=e=>{if(typeof e=="object"){let t="";for(let n in e)t+=n+Uo(e[n]);return t}return e},ga=(e,t,n,r,o)=>{let s=Uo(e),a=at[s]||(at[s]=(i=>{let u=0,h=11;for(;u<i.length;)h=101*h+i.charCodeAt(u++)>>>0;return"go"+h})(s));if(!at[a]){let i=s!==e?e:(u=>{let h,f,c=[{}];for(;h=da.exec(u.replace(fa,""));)h[4]?c.shift():h[3]?(f=h[3].replace(jr," ").trim(),c.unshift(c[0][f]=c[0][f]||{})):c[0][h[1]]=h[2].replace(jr," ").trim();return c[0]})(e);at[a]=Dt(o?{["@keyframes "+a]:i}:i,n?"":"."+a)}let l=n&&at.g?at.g:null;return n&&(at.g=at[a]),((i,u,h,f)=>{f?u.data=u.data.replace(f,i):u.data.indexOf(i)===-1&&(u.data=h?i+u.data:u.data+i)})(at[a],t,r,l),a},ha=(e,t,n)=>e.reduce((r,o,s)=>{let a=t[s];if(a&&a.call){let l=a(n),i=l&&l.props&&l.props.className||/^go/.test(l)&&l;a=i?"."+i:l&&typeof l=="object"?l.props?"":Dt(l,""):l===!1?"":l}return r+o+(a??"")},"");function Y(e){let t=this||{},n=e.call?e(t.p):e;return ga(n.unshift?n.raw?ha(n,[].slice.call(arguments,1),t.p):n.reduce((r,o)=>Object.assign(r,o&&o.call?o(t.p):o),{}):n,ua(t.target),t.g,t.o,t.k)}Y.bind({g:1});Y.bind({k:1});function Vo(e){var t,n,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(n=Vo(e[t]))&&(r&&(r+=" "),r+=n)}else for(n in e)e[n]&&(r&&(r+=" "),r+=n);return r}function L(){for(var e,t,n=0,r="",o=arguments.length;n<o;n++)(e=arguments[n])&&(t=Vo(e))&&(r&&(r+=" "),r+=t);return r}function ya(e,t){const n=zt(e),{onChange:r}=t;let o=new Set(t.appear?void 0:n);const s=new WeakSet,[a,l]=z([],{equals:!1}),[i]=Ds(),u=f=>{l(c=>(c.push.apply(c,f),c));for(const c of f)s.delete(c)},h=(f,c,g)=>f.splice(g,0,c);return D(f=>{const c=a(),g=e();if(g[qo],zt(i))return i(),f;if(c.length){const d=f.filter(y=>!c.includes(y));return c.length=0,r({list:d,added:[],removed:[],unchanged:d,finishRemoved:u}),d}return zt(()=>{const d=new Set(g),y=g.slice(),b=[],m=[],p=[];for(const x of g)(o.has(x)?p:b).push(x);let w=!b.length;for(let x=0;x<f.length;x++){const $=f[x];d.has($)||(s.has($)||(m.push($),s.add($)),h(y,$,x)),w&&$!==y[x]&&(w=!1)}return!m.length&&w?f:(r({list:y,added:b,removed:m,unchanged:p,finishRemoved:u}),o=d,y)})},t.appear?[]:n.slice())}function Ae(...e){return Ks(e)}var Wr=e=>e instanceof Element;function Qn(e,t){if(t(e))return e;if(typeof e=="function"&&!e.length)return Qn(e(),t);if(Array.isArray(e)){const n=[];for(const r of e){const o=Qn(r,t);o&&(Array.isArray(o)?n.push.apply(n,o):n.push(o))}return n.length?n:null}return null}function va(e,t=Wr,n=Wr){const r=D(e),o=D(()=>Qn(r(),t));return o.toArray=()=>{const s=o();return Array.isArray(s)?s:s?[s]:[]},o}function ma(e){return D(()=>{const t=e.name||"s";return{enterActive:(e.enterActiveClass||t+"-enter-active").split(" "),enter:(e.enterClass||t+"-enter").split(" "),enterTo:(e.enterToClass||t+"-enter-to").split(" "),exitActive:(e.exitActiveClass||t+"-exit-active").split(" "),exit:(e.exitClass||t+"-exit").split(" "),exitTo:(e.exitToClass||t+"-exit-to").split(" "),move:(e.moveClass||t+"-move").split(" ")}})}function Go(e){requestAnimationFrame(()=>requestAnimationFrame(e))}function ba(e,t,n,r){const{onBeforeEnter:o,onEnter:s,onAfterEnter:a}=t;o==null||o(n),n.classList.add(...e.enter),n.classList.add(...e.enterActive),queueMicrotask(()=>{if(!n.parentNode)return r==null?void 0:r();s==null||s(n,()=>l())}),Go(()=>{n.classList.remove(...e.enter),n.classList.add(...e.enterTo),(!s||s.length<2)&&(n.addEventListener("transitionend",l),n.addEventListener("animationend",l))});function l(i){(!i||i.target===n)&&(n.removeEventListener("transitionend",l),n.removeEventListener("animationend",l),n.classList.remove(...e.enterActive),n.classList.remove(...e.enterTo),a==null||a(n))}}function pa(e,t,n,r){const{onBeforeExit:o,onExit:s,onAfterExit:a}=t;if(!n.parentNode)return r==null?void 0:r();o==null||o(n),n.classList.add(...e.exit),n.classList.add(...e.exitActive),s==null||s(n,()=>l()),Go(()=>{n.classList.remove(...e.exit),n.classList.add(...e.exitTo),(!s||s.length<2)&&(n.addEventListener("transitionend",l),n.addEventListener("animationend",l))});function l(i){(!i||i.target===n)&&(r==null||r(),n.removeEventListener("transitionend",l),n.removeEventListener("animationend",l),n.classList.remove(...e.exitActive),n.classList.remove(...e.exitTo),a==null||a(n))}}var Qr=e=>{const t=ma(e);return ya(va(()=>e.children).toArray,{appear:e.appear,onChange({added:n,removed:r,finishRemoved:o,list:s}){const a=t();for(const i of n)ba(a,e,i);const l=[];for(const i of s)i.isConnected&&(i instanceof HTMLElement||i instanceof SVGElement)&&l.push({el:i,rect:i.getBoundingClientRect()});queueMicrotask(()=>{const i=[];for(const{el:u,rect:h}of l)if(u.isConnected){const f=u.getBoundingClientRect(),c=h.left-f.left,g=h.top-f.top;(c||g)&&(u.style.transform=`translate(${c}px, ${g}px)`,u.style.transitionDuration="0s",i.push(u))}document.body.offsetHeight;for(const u of i){let h=function(f){(f.target===u||/transform$/.test(f.propertyName))&&(u.removeEventListener("transitionend",h),u.classList.remove(...a.move))};u.classList.add(...a.move),u.style.transform=u.style.transitionDuration="",u.addEventListener("transitionend",h)}});for(const i of r)pa(a,e,i,()=>o([i]))}})},Kn=Symbol("fallback");function Yr(e){for(const t of e)t.dispose()}function wa(e,t,n,r={}){const o=new Map;return G(()=>Yr(o.values())),()=>{const a=e()||[];return a[qo],zt(()=>{var h,f;if(!a.length)return Yr(o.values()),o.clear(),r.fallback?[Kr(g=>(o.set(Kn,{dispose:g}),r.fallback()))]:[];const l=new Array(a.length),i=o.get(Kn);if(!o.size||i){i==null||i.dispose(),o.delete(Kn);for(let c=0;c<a.length;c++){const g=a[c],d=t(g,c);s(l,g,c,d)}return l}const u=new Set(o.keys());for(let c=0;c<a.length;c++){const g=a[c],d=t(g,c);u.delete(d);const y=o.get(d);y?(l[c]=y.mapped,(h=y.setIndex)==null||h.call(y,c),y.setItem(()=>g)):s(l,g,c,d)}for(const c of u)(f=o.get(c))==null||f.dispose(),o.delete(c);return l})};function s(a,l,i,u){Kr(h=>{const[f,c]=z(l),g={setItem:c,dispose:h};if(n.length>1){const[d,y]=z(i);g.setIndex=y,g.mapped=n(f,d)}else g.mapped=n(f);o.set(u,g),a[i]=g.mapped})}}function xn(e){const{by:t}=e;return D(wa(()=>e.each,typeof t=="function"?t:n=>n[t],e.children,"fallback"in e?{fallback:()=>e.fallback}:void 0))}function xa(e,t,n,r){return e.addEventListener(t,n,r),Ns(e.removeEventListener.bind(e,t,n,r))}function $a(e,t,n,r){const o=()=>{jn(E(e)).forEach(s=>{s&&jn(E(t)).forEach(a=>xa(s,a,n,r))})};typeof e=="function"?H(o):V(o)}function Ca(e,t){const n=new ResizeObserver(e);return G(n.disconnect.bind(n)),{observe:r=>n.observe(r,t),unobserve:n.unobserve.bind(n)}}function Sa(e,t,n){const r=new WeakMap,{observe:o,unobserve:s}=Ca(a=>{for(const l of a){const{contentRect:i,target:u}=l,h=Math.round(i.width),f=Math.round(i.height),c=r.get(u);(!c||c.width!==h||c.height!==f)&&(t(i,u,l),r.set(u,{width:h,height:f}))}},n);H(a=>{const l=zs(jn(E(e)));return Hs(l,a,o,s),l},[])}var ka=/((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;function Xr(e){const t={};let n;for(;n=ka.exec(e);)t[n[1]]=n[2];return t}function Mn(e,t){if(typeof e=="string"){if(typeof t=="string")return`${e};${t}`;e=Xr(e)}else typeof t=="string"&&(t=Xr(t));return{...e,...t}}function Ea(e,t,n=-1){return n in e?[...e.slice(0,n),t,...e.slice(n)]:[...e,t]}function Yn(e,t){const n=[...e],r=n.indexOf(t);return r!==-1&&n.splice(r,1),n}function Da(e){return typeof e=="number"}function qt(e){return Object.prototype.toString.call(e)==="[object String]"}function Aa(e){return typeof e=="function"}function cn(e){return t=>`${e()}-${t}`}function Ke(e,t){return e?e===t||e.contains(t):!1}function tn(e,t=!1){const{activeElement:n}=Ze(e);if(!(n!=null&&n.nodeName))return null;if(jo(n)&&n.contentDocument)return tn(n.contentDocument.body,t);if(t){const r=n.getAttribute("aria-activedescendant");if(r){const o=Ze(n).getElementById(r);if(o)return o}}return n}function Ma(e){return Ze(e).defaultView||window}function Ze(e){return e?e.ownerDocument||e:document}function jo(e){return e.tagName==="IFRAME"}var ar=(e=>(e.Escape="Escape",e.Enter="Enter",e.Tab="Tab",e.Space=" ",e.ArrowDown="ArrowDown",e.ArrowLeft="ArrowLeft",e.ArrowRight="ArrowRight",e.ArrowUp="ArrowUp",e.End="End",e.Home="Home",e.PageDown="PageDown",e.PageUp="PageUp",e))(ar||{});function lr(e){var t;return typeof window<"u"&&window.navigator!=null?e.test(((t=window.navigator.userAgentData)==null?void 0:t.platform)||window.navigator.platform):!1}function Tn(){return lr(/^Mac/i)}function Ta(){return lr(/^iPhone/i)}function Fa(){return lr(/^iPad/i)||Tn()&&navigator.maxTouchPoints>1}function Ia(){return Ta()||Fa()}function Oa(){return Tn()||Ia()}function ue(e,t){return t&&(Aa(t)?t(e):t[0](t[1],e)),e==null?void 0:e.defaultPrevented}function pe(e){return t=>{for(const n of e)ue(t,n)}}function La(e){return Tn()?e.metaKey&&!e.ctrlKey:e.ctrlKey&&!e.metaKey}function Ee(e){if(e)if(Pa())e.focus({preventScroll:!0});else{const t=qa(e);e.focus(),_a(t)}}var mn=null;function Pa(){if(mn==null){mn=!1;try{document.createElement("div").focus({get preventScroll(){return mn=!0,!0}})}catch{}}return mn}function qa(e){let t=e.parentNode;const n=[],r=document.scrollingElement||document.documentElement;for(;t instanceof HTMLElement&&t!==r;)(t.offsetHeight<t.scrollHeight||t.offsetWidth<t.scrollWidth)&&n.push({element:t,scrollTop:t.scrollTop,scrollLeft:t.scrollLeft}),t=t.parentNode;return r instanceof HTMLElement&&n.push({element:r,scrollTop:r.scrollTop,scrollLeft:r.scrollLeft}),n}function _a(e){for(const{element:t,scrollTop:n,scrollLeft:r}of e)t.scrollTop=n,t.scrollLeft=r}var Wo=["input:not([type='hidden']):not([disabled])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])","a[href]","area[href]","[tabindex]","iframe","object","embed","audio[controls]","video[controls]","[contenteditable]:not([contenteditable='false'])"],Ra=[...Wo,'[tabindex]:not([tabindex="-1"]):not([disabled])'],cr=Wo.join(":not([hidden]),")+",[tabindex]:not([disabled]):not([hidden])",za=Ra.join(':not([hidden]):not([tabindex="-1"]),');function Qo(e,t){const r=Array.from(e.querySelectorAll(cr)).filter(Zr);return t&&Zr(e)&&r.unshift(e),r.forEach((o,s)=>{if(jo(o)&&o.contentDocument){const a=o.contentDocument.body,l=Qo(a,!1);r.splice(s,1,...l)}}),r}function Zr(e){return Yo(e)&&!Ka(e)}function Yo(e){return e.matches(cr)&&ur(e)}function Ka(e){return parseInt(e.getAttribute("tabindex")||"0",10)<0}function ur(e,t){return e.nodeName!=="#comment"&&Ba(e)&&Na(e,t)&&(!e.parentElement||ur(e.parentElement,e))}function Ba(e){if(!(e instanceof HTMLElement)&&!(e instanceof SVGElement))return!1;const{display:t,visibility:n}=e.style;let r=t!=="none"&&n!=="hidden"&&n!=="collapse";if(r){if(!e.ownerDocument.defaultView)return r;const{getComputedStyle:o}=e.ownerDocument.defaultView,{display:s,visibility:a}=o(e);r=s!=="none"&&a!=="hidden"&&a!=="collapse"}return r}function Na(e,t){return!e.hasAttribute("hidden")&&(e.nodeName==="DETAILS"&&t&&t.nodeName!=="SUMMARY"?e.hasAttribute("open"):!0)}function Ha(e,t,n){const r=t!=null&&t.tabbable?za:cr,o=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode(s){var a;return(a=t==null?void 0:t.from)!=null&&a.contains(s)?NodeFilter.FILTER_REJECT:s.matches(r)&&ur(s)&&(!(t!=null&&t.accept)||t.accept(s))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});return t!=null&&t.from&&(o.currentNode=t.from),o}function Jr(e){for(;e&&!Ua(e);)e=e.parentElement;return e||document.scrollingElement||document.documentElement}function Ua(e){const t=window.getComputedStyle(e);return/(auto|scroll)/.test(t.overflow+t.overflowX+t.overflowY)}function Va(){}function Ga(e,t){const[n,r]=e;let o=!1;const s=t.length;for(let a=s,l=0,i=a-1;l<a;i=l++){const[u,h]=t[l],[f,c]=t[i],[,g]=t[i===0?a-1:i-1]||[0,0],d=(h-c)*(n-u)-(u-f)*(r-h);if(c<h){if(r>=c&&r<h){if(d===0)return!0;d>0&&(r===c?r>g&&(o=!o):o=!o)}}else if(h<c){if(r>h&&r<=c){if(d===0)return!0;d<0&&(r===c?r<g&&(o=!o):o=!o)}}else if(r==h&&(n>=f&&n<=u||n>=u&&n<=f))return!0}return o}function X(e,t){return W(e,t)}var Xt=new Map,eo=new Set;function to(){if(typeof window>"u")return;const e=n=>{if(!n.target)return;let r=Xt.get(n.target);r||(r=new Set,Xt.set(n.target,r),n.target.addEventListener("transitioncancel",t)),r.add(n.propertyName)},t=n=>{if(!n.target)return;const r=Xt.get(n.target);if(r&&(r.delete(n.propertyName),r.size===0&&(n.target.removeEventListener("transitioncancel",t),Xt.delete(n.target)),Xt.size===0)){for(const o of eo)o();eo.clear()}};document.body.addEventListener("transitionrun",e),document.body.addEventListener("transitionend",t)}typeof document<"u"&&(document.readyState!=="loading"?to():document.addEventListener("DOMContentLoaded",to));function Xn(e,t){const n=no(e,t,"left"),r=no(e,t,"top"),o=t.offsetWidth,s=t.offsetHeight;let a=e.scrollLeft,l=e.scrollTop;const i=a+e.offsetWidth,u=l+e.offsetHeight;n<=a?a=n:n+o>i&&(a+=n+o-i),r<=l?l=r:r+s>u&&(l+=r+s-u),e.scrollLeft=a,e.scrollTop=l}function no(e,t,n){const r=n==="left"?"offsetLeft":"offsetTop";let o=0;for(;t.offsetParent&&(o+=t[r],t.offsetParent!==e);){if(t.offsetParent.contains(e)){o-=e[r];break}t=t.offsetParent}return o}function ja(e,t){var n,r;if(document.contains(e)){const o=document.scrollingElement||document.documentElement;if(window.getComputedStyle(o).overflow==="hidden"){let a=Jr(e);for(;e&&a&&e!==o&&a!==o;)Xn(a,e),e=a,a=Jr(e)}else{const{left:a,top:l}=e.getBoundingClientRect();(n=e==null?void 0:e.scrollIntoView)==null||n.call(e,{block:"nearest"});const{left:i,top:u}=e.getBoundingClientRect();(Math.abs(a-i)>1||Math.abs(l-u)>1)&&((r=e.scrollIntoView)==null||r.call(e,{block:"nearest"}))}}}var Xo={border:"0",clip:"rect(0 0 0 0)","clip-path":"inset(50%)",height:"1px",margin:"0 -1px -1px 0",overflow:"hidden",padding:"0",position:"absolute",width:"1px","white-space":"nowrap"};function Be(e){return t=>(e(t),()=>e(void 0))}function Fn(e,t){const[n,r]=z(ro(t==null?void 0:t()));return H(()=>{var o;r(((o=e())==null?void 0:o.tagName.toLowerCase())||ro(t==null?void 0:t()))}),n}function ro(e){return qt(e)?e:void 0}function de(e){const[t,n]=oe(e,["as"]);if(!t.as)throw new Error("[kobalte]: Polymorphic is missing the required `as` prop.");return v(Ps,W(n,{get component(){return t.as}}))}var Wa=["id","name","validationState","required","disabled","readOnly"];function Qa(e){const t=`form-control-${Ne()}`,n=X({id:t},e),[r,o]=z(),[s,a]=z(),[l,i]=z(),[u,h]=z(),f=(y,b,m)=>{const p=m!=null||r()!=null;return[m,r(),p&&b!=null?y:void 0].filter(Boolean).join(" ")||void 0},c=y=>[l(),u(),y].filter(Boolean).join(" ")||void 0,g=D(()=>({"data-valid":E(n.validationState)==="valid"?"":void 0,"data-invalid":E(n.validationState)==="invalid"?"":void 0,"data-required":E(n.required)?"":void 0,"data-disabled":E(n.disabled)?"":void 0,"data-readonly":E(n.readOnly)?"":void 0}));return{formControlContext:{name:()=>E(n.name)??E(n.id),dataset:g,validationState:()=>E(n.validationState),isRequired:()=>E(n.required),isDisabled:()=>E(n.disabled),isReadOnly:()=>E(n.readOnly),labelId:r,fieldId:s,descriptionId:l,errorMessageId:u,getAriaLabelledBy:f,getAriaDescribedBy:c,generateId:cn(()=>E(n.id)),registerLabel:Be(o),registerField:Be(a),registerDescription:Be(i),registerErrorMessage:Be(h)}}}var Zo=we();function un(){const e=xe(Zo);if(e===void 0)throw new Error("[kobalte]: `useFormControlContext` must be used within a `FormControlContext.Provider` component");return e}function Jo(e){const t=un(),n=X({id:t.generateId("description")},e);return H(()=>G(t.registerDescription(n.id))),v(de,W({as:"div"},()=>t.dataset(),n))}function ei(e){const t=un(),n=X({id:t.generateId("error-message")},e),[r,o]=oe(n,["forceMount"]),s=()=>t.validationState()==="invalid";return H(()=>{s()&&G(t.registerErrorMessage(o.id))}),v(B,{get when(){return r.forceMount||s()},get children(){return v(de,W({as:"div"},()=>t.dataset(),o))}})}function Ya(e){let t;const n=un(),r=X({id:n.generateId("label")},e),[o,s]=oe(r,["ref"]),a=Fn(()=>t,()=>"label");return H(()=>G(n.registerLabel(s.id))),v(de,W({as:"label",ref(l){const i=Ae(u=>t=u,o.ref);typeof i=="function"&&i(l)},get for(){return D(()=>a()==="label")()?n.fieldId():void 0}},()=>n.dataset(),s))}function Xa(e,t){H(dt(e,n=>{if(n==null)return;const r=Za(n);r!=null&&(r.addEventListener("reset",t,{passive:!0}),G(()=>{r.removeEventListener("reset",t)}))}))}function Za(e){return Ja(e)?e.form:e.closest("form")}function Ja(e){return e.matches("textarea, input, select, button")}function dn(e){var a;const[t,n]=z((a=e.defaultValue)==null?void 0:a.call(e)),r=D(()=>{var l;return((l=e.value)==null?void 0:l.call(e))!==void 0}),o=D(()=>{var l;return r()?(l=e.value)==null?void 0:l.call(e):t()});return[o,l=>{zt(()=>{var u;const i=Bs(l,o());return Object.is(i,o())||(r()||n(i),(u=e.onChange)==null||u.call(e,i)),i})}]}function ti(e){const[t,n]=dn(e);return[()=>t()??!1,n]}function el(e){const[t,n]=dn(e);return[()=>t()??[],n]}function tl(e={}){const[t,n]=ti({value:()=>E(e.isSelected),defaultValue:()=>!!E(e.defaultIsSelected),onChange:s=>{var a;return(a=e.onSelectedChange)==null?void 0:a.call(e,s)}});return{isSelected:t,setIsSelected:s=>{!E(e.isReadOnly)&&!E(e.isDisabled)&&n(s)},toggle:()=>{!E(e.isReadOnly)&&!E(e.isDisabled)&&n(!t())}}}var nl=Object.defineProperty,In=(e,t)=>{for(var n in t)nl(e,n,{get:t[n],enumerable:!0})},ni=we();function ri(){return xe(ni)}function rl(){const e=ri();if(e===void 0)throw new Error("[kobalte]: `useDomCollectionContext` must be used within a `DomCollectionProvider` component");return e}function oi(e,t){return!!(t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING)}function ol(e,t){var o;const n=t.ref();if(!n)return-1;let r=e.length;if(!r)return-1;for(;r--;){const s=(o=e[r])==null?void 0:o.ref();if(s&&oi(s,n))return r+1}return 0}function il(e){const t=e.map((r,o)=>[o,r]);let n=!1;return t.sort(([r,o],[s,a])=>{const l=o.ref(),i=a.ref();return l===i||!l||!i?0:oi(l,i)?(r>s&&(n=!0),-1):(r<s&&(n=!0),1)}),n?t.map(([r,o])=>o):e}function ii(e,t){const n=il(e);e!==n&&t(n)}function sl(e){var o,s;const t=e[0],n=(o=e[e.length-1])==null?void 0:o.ref();let r=(s=t==null?void 0:t.ref())==null?void 0:s.parentElement;for(;r;){if(n&&r.contains(n))return r;r=r.parentElement}return Ze(r).body}function al(e,t){H(()=>{const n=setTimeout(()=>{ii(e(),t)});G(()=>clearTimeout(n))})}function ll(e,t){if(typeof IntersectionObserver!="function"){al(e,t);return}let n=[];H(()=>{const r=()=>{const a=!!n.length;n=e(),a&&ii(e(),t)},o=sl(e()),s=new IntersectionObserver(r,{root:o});for(const a of e()){const l=a.ref();l&&s.observe(l)}G(()=>s.disconnect())})}function cl(e={}){const[t,n]=el({value:()=>E(e.items),onChange:s=>{var a;return(a=e.onItemsChange)==null?void 0:a.call(e,s)}});ll(t,n);const r=s=>(n(a=>{const l=ol(a,s);return Ea(a,s,l)}),()=>{n(a=>{const l=a.filter(i=>i.ref()!==s.ref());return a.length===l.length?a:l})});return{DomCollectionProvider:s=>v(ni.Provider,{value:{registerItem:r},get children(){return s.children}})}}function ul(e){const t=rl(),n=X({shouldRegisterItem:!0},e);H(()=>{if(!n.shouldRegisterItem)return;const r=t.registerItem(n.getItem());G(r)})}function si(e){let t=e.startIndex??0;const n=e.startLevel??0,r=[],o=i=>{if(i==null)return"";const u=e.getKey??"key",h=qt(u)?i[u]:u(i);return h!=null?String(h):""},s=i=>{if(i==null)return"";const u=e.getTextValue??"textValue",h=qt(u)?i[u]:u(i);return h!=null?String(h):""},a=i=>{if(i==null)return!1;const u=e.getDisabled??"disabled";return(qt(u)?i[u]:u(i))??!1},l=i=>{var u;if(i!=null)return qt(e.getSectionChildren)?i[e.getSectionChildren]:(u=e.getSectionChildren)==null?void 0:u.call(e,i)};for(const i of e.dataSource){if(qt(i)||Da(i)){r.push({type:"item",rawValue:i,key:String(i),textValue:String(i),disabled:a(i),level:n,index:t}),t++;continue}if(l(i)!=null){r.push({type:"section",rawValue:i,key:"",textValue:"",disabled:!1,level:n,index:t}),t++;const u=l(i)??[];if(u.length>0){const h=si({dataSource:u,getKey:e.getKey,getTextValue:e.getTextValue,getDisabled:e.getDisabled,getSectionChildren:e.getSectionChildren,startIndex:t,startLevel:n+1});r.push(...h),t+=h.length}}else r.push({type:"item",rawValue:i,key:o(i),textValue:s(i),disabled:a(i),level:n,index:t}),t++}return r}function dl(e,t=[]){return D(()=>{const n=si({dataSource:E(e.dataSource),getKey:E(e.getKey),getTextValue:E(e.getTextValue),getDisabled:E(e.getDisabled),getSectionChildren:E(e.getSectionChildren)});for(let r=0;r<t.length;r++)t[r]();return e.factory(n)})}var fl=new Set(["Avst","Arab","Armi","Syrc","Samr","Mand","Thaa","Mend","Nkoo","Adlm","Rohg","Hebr"]),gl=new Set(["ae","ar","arc","bcc","bqi","ckb","dv","fa","glk","he","ku","mzn","nqo","pnb","ps","sd","ug","ur","yi"]);function hl(e){if(Intl.Locale){const n=new Intl.Locale(e).maximize().script??"";return fl.has(n)}const t=e.split("-")[0];return gl.has(t)}function yl(e){return hl(e)?"rtl":"ltr"}function ai(){let e=typeof navigator<"u"&&(navigator.language||navigator.userLanguage)||"en-US";return{locale:e,direction:yl(e)}}var Zn=ai(),nn=new Set;function oo(){Zn=ai();for(const e of nn)e(Zn)}function vl(){const[e,t]=z(Zn),n=D(()=>e());return At(()=>{nn.size===0&&window.addEventListener("languagechange",oo),nn.add(t),G(()=>{nn.delete(t),nn.size===0&&window.removeEventListener("languagechange",oo)})}),{locale:()=>n().locale,direction:()=>n().direction}}var ml=we();function Ct(){const e=vl();return xe(ml)||e}var Bn=new Map;function bl(e){const{locale:t}=Ct(),n=D(()=>t()+(e?Object.entries(e).sort((r,o)=>r[0]<o[0]?-1:1).join():""));return D(()=>{const r=n();let o;return Bn.has(r)&&(o=Bn.get(r)),o||(o=new Intl.Collator(t(),e),Bn.set(r,o)),o})}var lt=class li extends Set{constructor(n,r,o){super(n);qe(this,"anchorKey");qe(this,"currentKey");n instanceof li?(this.anchorKey=r||n.anchorKey,this.currentKey=o||n.currentKey):(this.anchorKey=r,this.currentKey=o)}};function pl(e){const[t,n]=dn(e);return[()=>t()??new lt,n]}function ci(e){return Oa()?e.altKey:e.ctrlKey}function _t(e){return Tn()?e.metaKey:e.ctrlKey}function io(e){return new lt(e)}function wl(e,t){if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;return!0}function xl(e){const t=X({selectionMode:"none",selectionBehavior:"toggle"},e),[n,r]=z(!1),[o,s]=z(),a=D(()=>{const y=E(t.selectedKeys);return y!=null?io(y):y}),l=D(()=>{const y=E(t.defaultSelectedKeys);return y!=null?io(y):new lt}),[i,u]=pl({value:a,defaultValue:l,onChange:y=>{var b;return(b=t.onSelectionChange)==null?void 0:b.call(t,y)}}),[h,f]=z(E(t.selectionBehavior)),c=()=>E(t.selectionMode),g=()=>E(t.disallowEmptySelection)??!1,d=y=>{(E(t.allowDuplicateSelectionEvents)||!wl(y,i()))&&u(y)};return H(()=>{const y=i();E(t.selectionBehavior)==="replace"&&h()==="toggle"&&typeof y=="object"&&y.size===0&&f("replace")}),H(()=>{f(E(t.selectionBehavior)??"toggle")}),{selectionMode:c,disallowEmptySelection:g,selectionBehavior:h,setSelectionBehavior:f,isFocused:n,setFocused:r,focusedKey:o,setFocusedKey:s,selectedKeys:i,setSelectedKeys:d}}function $l(e){const[t,n]=z(""),[r,o]=z(-1);return{typeSelectHandlers:{onKeyDown:a=>{var c;if(E(e.isDisabled))return;const l=E(e.keyboardDelegate),i=E(e.selectionManager);if(!l.getKeyForSearch)return;const u=Cl(a.key);if(!u||a.ctrlKey||a.metaKey)return;u===" "&&t().trim().length>0&&(a.preventDefault(),a.stopPropagation());let h=n(g=>g+u),f=l.getKeyForSearch(h,i.focusedKey())??l.getKeyForSearch(h);f==null&&Sl(h)&&(h=h[0],f=l.getKeyForSearch(h,i.focusedKey())??l.getKeyForSearch(h)),f!=null&&(i.setFocusedKey(f),(c=e.onTypeSelect)==null||c.call(e,f)),clearTimeout(r()),o(window.setTimeout(()=>n(""),500))}}}}function Cl(e){return e.length===1||!/^[A-Z]/i.test(e)?e:""}function Sl(e){return e.split("").every(t=>t===e[0])}function kl(e,t,n){const o=W({selectOnFocus:()=>E(e.selectionManager).selectionBehavior()==="replace"},e),s=()=>t(),{direction:a}=Ct();let l={top:0,left:0};$a(()=>E(o.isVirtualized)?void 0:s(),"scroll",()=>{const b=s();b&&(l={top:b.scrollTop,left:b.scrollLeft})});const{typeSelectHandlers:i}=$l({isDisabled:()=>E(o.disallowTypeAhead),keyboardDelegate:()=>E(o.keyboardDelegate),selectionManager:()=>E(o.selectionManager)}),u=()=>E(o.orientation)??"vertical",h=b=>{var _,C,T,K,U,ne,Z,se;ue(b,i.onKeyDown),b.altKey&&b.key==="Tab"&&b.preventDefault();const m=t();if(!(m!=null&&m.contains(b.target)))return;const p=E(o.selectionManager),w=E(o.selectOnFocus),x=R=>{R!=null&&(p.setFocusedKey(R),b.shiftKey&&p.selectionMode()==="multiple"?p.extendSelection(R):w&&!ci(b)&&p.replaceSelection(R))},$=E(o.keyboardDelegate),P=E(o.shouldFocusWrap),I=p.focusedKey();switch(b.key){case(u()==="vertical"?"ArrowDown":"ArrowRight"):{if($.getKeyBelow){b.preventDefault();let R;I!=null?R=$.getKeyBelow(I):R=(_=$.getFirstKey)==null?void 0:_.call($),R==null&&P&&(R=(C=$.getFirstKey)==null?void 0:C.call($,I)),x(R)}break}case(u()==="vertical"?"ArrowUp":"ArrowLeft"):{if($.getKeyAbove){b.preventDefault();let R;I!=null?R=$.getKeyAbove(I):R=(T=$.getLastKey)==null?void 0:T.call($),R==null&&P&&(R=(K=$.getLastKey)==null?void 0:K.call($,I)),x(R)}break}case(u()==="vertical"?"ArrowLeft":"ArrowUp"):{if($.getKeyLeftOf){b.preventDefault();const R=a()==="rtl";let Q;I!=null?Q=$.getKeyLeftOf(I):Q=R?(U=$.getFirstKey)==null?void 0:U.call($):(ne=$.getLastKey)==null?void 0:ne.call($),x(Q)}break}case(u()==="vertical"?"ArrowRight":"ArrowDown"):{if($.getKeyRightOf){b.preventDefault();const R=a()==="rtl";let Q;I!=null?Q=$.getKeyRightOf(I):Q=R?(Z=$.getLastKey)==null?void 0:Z.call($):(se=$.getFirstKey)==null?void 0:se.call($),x(Q)}break}case"Home":if($.getFirstKey){b.preventDefault();const R=$.getFirstKey(I,_t(b));R!=null&&(p.setFocusedKey(R),_t(b)&&b.shiftKey&&p.selectionMode()==="multiple"?p.extendSelection(R):w&&p.replaceSelection(R))}break;case"End":if($.getLastKey){b.preventDefault();const R=$.getLastKey(I,_t(b));R!=null&&(p.setFocusedKey(R),_t(b)&&b.shiftKey&&p.selectionMode()==="multiple"?p.extendSelection(R):w&&p.replaceSelection(R))}break;case"PageDown":if($.getKeyPageBelow&&I!=null){b.preventDefault();const R=$.getKeyPageBelow(I);x(R)}break;case"PageUp":if($.getKeyPageAbove&&I!=null){b.preventDefault();const R=$.getKeyPageAbove(I);x(R)}break;case"a":_t(b)&&p.selectionMode()==="multiple"&&E(o.disallowSelectAll)!==!0&&(b.preventDefault(),p.selectAll());break;case"Escape":b.defaultPrevented||(b.preventDefault(),E(o.disallowEmptySelection)||p.clearSelection());break;case"Tab":if(!E(o.allowsTabNavigation)){if(b.shiftKey)m.focus();else{const R=Ha(m,{tabbable:!0});let Q,J;do J=R.lastChild(),J&&(Q=J);while(J);Q&&!Q.contains(document.activeElement)&&Ee(Q)}break}}},f=b=>{var x,$;const m=E(o.selectionManager),p=E(o.keyboardDelegate),w=E(o.selectOnFocus);if(m.isFocused()){b.currentTarget.contains(b.target)||m.setFocused(!1);return}if(b.currentTarget.contains(b.target)){if(m.setFocused(!0),m.focusedKey()==null){const P=_=>{_!=null&&(m.setFocusedKey(_),w&&m.replaceSelection(_))},I=b.relatedTarget;I&&b.currentTarget.compareDocumentPosition(I)&Node.DOCUMENT_POSITION_FOLLOWING?P(m.lastSelectedKey()??((x=p.getLastKey)==null?void 0:x.call(p))):P(m.firstSelectedKey()??(($=p.getFirstKey)==null?void 0:$.call(p)))}else if(!E(o.isVirtualized)){const P=s();if(P){P.scrollTop=l.top,P.scrollLeft=l.left;const I=P.querySelector(`[data-key="${m.focusedKey()}"]`);I&&(Ee(I),Xn(P,I))}}}},c=b=>{const m=E(o.selectionManager);b.currentTarget.contains(b.relatedTarget)||m.setFocused(!1)},g=b=>{s()===b.target&&b.preventDefault()},d=()=>{var P,I;const b=E(o.autoFocus);if(!b)return;const m=E(o.selectionManager),p=E(o.keyboardDelegate);let w;b==="first"&&(w=(P=p.getFirstKey)==null?void 0:P.call(p)),b==="last"&&(w=(I=p.getLastKey)==null?void 0:I.call(p));const x=m.selectedKeys();x.size&&(w=x.values().next().value),m.setFocused(!0),m.setFocusedKey(w);const $=t();$&&w==null&&!E(o.shouldUseVirtualFocus)&&Ee($)};return At(()=>{o.deferAutoFocus?setTimeout(d,0):d()}),H(dt([s,()=>E(o.isVirtualized),()=>E(o.selectionManager).focusedKey()],b=>{var x;const[m,p,w]=b;if(p)w&&((x=o.scrollToKey)==null||x.call(o,w));else if(w&&m){const $=m.querySelector(`[data-key="${w}"]`);$&&Xn(m,$)}})),{tabIndex:D(()=>{if(!E(o.shouldUseVirtualFocus))return E(o.selectionManager).focusedKey()==null?0:-1}),onKeyDown:h,onMouseDown:g,onFocusIn:f,onFocusOut:c}}function ui(e,t){const n=()=>E(e.selectionManager),r=()=>E(e.key),o=()=>E(e.shouldUseVirtualFocus),s=p=>{n().selectionMode()!=="none"&&(n().selectionMode()==="single"?n().isSelected(r())&&!n().disallowEmptySelection()?n().toggleSelection(r()):n().replaceSelection(r()):p!=null&&p.shiftKey?n().extendSelection(r()):n().selectionBehavior()==="toggle"||_t(p)||"pointerType"in p&&p.pointerType==="touch"?n().toggleSelection(r()):n().replaceSelection(r()))},a=()=>n().isSelected(r()),l=()=>E(e.disabled)||n().isDisabled(r()),i=()=>!l()&&n().canSelectItem(r());let u=null;const h=p=>{i()&&(u=p.pointerType,p.pointerType==="mouse"&&p.button===0&&!E(e.shouldSelectOnPressUp)&&s(p))},f=p=>{i()&&p.pointerType==="mouse"&&p.button===0&&E(e.shouldSelectOnPressUp)&&E(e.allowsDifferentPressOrigin)&&s(p)},c=p=>{i()&&(E(e.shouldSelectOnPressUp)&&!E(e.allowsDifferentPressOrigin)||u!=="mouse")&&s(p)},g=p=>{!i()||!["Enter"," "].includes(p.key)||(ci(p)?n().toggleSelection(r()):s(p))},d=p=>{l()&&p.preventDefault()},y=p=>{const w=t();o()||l()||!w||p.target===w&&n().setFocusedKey(r())},b=D(()=>{if(!(o()||l()))return r()===n().focusedKey()?0:-1}),m=D(()=>E(e.virtualized)?void 0:r());return H(dt([t,r,o,()=>n().focusedKey(),()=>n().isFocused()],([p,w,x,$,P])=>{p&&w===$&&P&&!x&&document.activeElement!==p&&(e.focus?e.focus():Ee(p))})),{isSelected:a,isDisabled:l,allowsSelection:i,tabIndex:b,dataKey:m,onPointerDown:h,onPointerUp:f,onClick:c,onKeyDown:g,onMouseDown:d,onFocus:y}}var El=class{constructor(e,t){qe(this,"collection");qe(this,"state");this.collection=e,this.state=t}selectionMode(){return this.state.selectionMode()}disallowEmptySelection(){return this.state.disallowEmptySelection()}selectionBehavior(){return this.state.selectionBehavior()}setSelectionBehavior(e){this.state.setSelectionBehavior(e)}isFocused(){return this.state.isFocused()}setFocused(e){this.state.setFocused(e)}focusedKey(){return this.state.focusedKey()}setFocusedKey(e){(e==null||this.collection().getItem(e))&&this.state.setFocusedKey(e)}selectedKeys(){return this.state.selectedKeys()}isSelected(e){if(this.state.selectionMode()==="none")return!1;const t=this.getKey(e);return t==null?!1:this.state.selectedKeys().has(t)}isEmpty(){return this.state.selectedKeys().size===0}isSelectAll(){if(this.isEmpty())return!1;const e=this.state.selectedKeys();return this.getAllSelectableKeys().every(t=>e.has(t))}firstSelectedKey(){let e;for(const t of this.state.selectedKeys()){const n=this.collection().getItem(t),r=(n==null?void 0:n.index)!=null&&(e==null?void 0:e.index)!=null&&n.index<e.index;(!e||r)&&(e=n)}return e==null?void 0:e.key}lastSelectedKey(){let e;for(const t of this.state.selectedKeys()){const n=this.collection().getItem(t),r=(n==null?void 0:n.index)!=null&&(e==null?void 0:e.index)!=null&&n.index>e.index;(!e||r)&&(e=n)}return e==null?void 0:e.key}extendSelection(e){if(this.selectionMode()==="none")return;if(this.selectionMode()==="single"){this.replaceSelection(e);return}const t=this.getKey(e);if(t==null)return;const n=this.state.selectedKeys(),r=n.anchorKey||t,o=new lt(n,r,t);for(const s of this.getKeyRange(r,n.currentKey||t))o.delete(s);for(const s of this.getKeyRange(t,r))this.canSelectItem(s)&&o.add(s);this.state.setSelectedKeys(o)}getKeyRange(e,t){const n=this.collection().getItem(e),r=this.collection().getItem(t);return n&&r?n.index!=null&&r.index!=null&&n.index<=r.index?this.getKeyRangeInternal(e,t):this.getKeyRangeInternal(t,e):[]}getKeyRangeInternal(e,t){const n=[];let r=e;for(;r!=null;){const o=this.collection().getItem(r);if(o&&o.type==="item"&&n.push(r),r===t)return n;r=this.collection().getKeyAfter(r)}return[]}getKey(e){const t=this.collection().getItem(e);return t?!t||t.type!=="item"?null:t.key:e}toggleSelection(e){if(this.selectionMode()==="none")return;if(this.selectionMode()==="single"&&!this.isSelected(e)){this.replaceSelection(e);return}const t=this.getKey(e);if(t==null)return;const n=new lt(this.state.selectedKeys());n.has(t)?n.delete(t):this.canSelectItem(t)&&(n.add(t),n.anchorKey=t,n.currentKey=t),!(this.disallowEmptySelection()&&n.size===0)&&this.state.setSelectedKeys(n)}replaceSelection(e){if(this.selectionMode()==="none")return;const t=this.getKey(e);if(t==null)return;const n=this.canSelectItem(t)?new lt([t],t,t):new lt;this.state.setSelectedKeys(n)}setSelectedKeys(e){if(this.selectionMode()==="none")return;const t=new lt;for(const n of e){const r=this.getKey(n);if(r!=null&&(t.add(r),this.selectionMode()==="single"))break}this.state.setSelectedKeys(t)}selectAll(){this.selectionMode()==="multiple"&&this.state.setSelectedKeys(new Set(this.getAllSelectableKeys()))}clearSelection(){const e=this.state.selectedKeys();!this.disallowEmptySelection()&&e.size>0&&this.state.setSelectedKeys(new lt)}toggleSelectAll(){this.isSelectAll()?this.clearSelection():this.selectAll()}select(e,t){this.selectionMode()!=="none"&&(this.selectionMode()==="single"?this.isSelected(e)&&!this.disallowEmptySelection()?this.toggleSelection(e):this.replaceSelection(e):this.selectionBehavior()==="toggle"||t&&t.pointerType==="touch"?this.toggleSelection(e):this.replaceSelection(e))}isSelectionEqual(e){if(e===this.state.selectedKeys())return!0;const t=this.selectedKeys();if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;for(const n of t)if(!e.has(n))return!1;return!0}canSelectItem(e){if(this.state.selectionMode()==="none")return!1;const t=this.collection().getItem(e);return t!=null&&!t.disabled}isDisabled(e){const t=this.collection().getItem(e);return!t||t.disabled}getAllSelectableKeys(){const e=[];return(n=>{for(;n!=null;){if(this.canSelectItem(n)){const r=this.collection().getItem(n);if(!r)continue;r.type==="item"&&e.push(n)}n=this.collection().getKeyAfter(n)}})(this.collection().getFirstKey()),e}},so=class{constructor(e){qe(this,"keyMap",new Map);qe(this,"iterable");qe(this,"firstKey");qe(this,"lastKey");this.iterable=e;for(const r of e)this.keyMap.set(r.key,r);if(this.keyMap.size===0)return;let t,n=0;for(const[r,o]of this.keyMap)t?(t.nextKey=r,o.prevKey=t.key):(this.firstKey=r,o.prevKey=void 0),o.type==="item"&&(o.index=n++),t=o,t.nextKey=void 0;this.lastKey=t.key}*[Symbol.iterator](){yield*this.iterable}getSize(){return this.keyMap.size}getKeys(){return this.keyMap.keys()}getKeyBefore(e){var t;return(t=this.keyMap.get(e))==null?void 0:t.prevKey}getKeyAfter(e){var t;return(t=this.keyMap.get(e))==null?void 0:t.nextKey}getFirstKey(){return this.firstKey}getLastKey(){return this.lastKey}getItem(e){return this.keyMap.get(e)}at(e){const t=[...this.getKeys()];return this.getItem(t[e])}};function Dl(e){const t=xl(e),r=dl({dataSource:()=>E(e.dataSource),getKey:()=>E(e.getKey),getTextValue:()=>E(e.getTextValue),getDisabled:()=>E(e.getDisabled),getSectionChildren:()=>E(e.getSectionChildren),factory:s=>e.filter?new so(e.filter(s)):new so(s)},[()=>e.filter]),o=new El(r,t);return qs(()=>{const s=t.focusedKey();s!=null&&!r().getItem(s)&&t.setFocusedKey(void 0)}),{collection:r,selectionManager:()=>o}}var ke=e=>typeof e=="function"?e():e,Al=e=>{const t=D(()=>{const a=ke(e.element);if(a)return getComputedStyle(a)}),n=()=>{var a;return((a=t())==null?void 0:a.animationName)??"none"},[r,o]=z(ke(e.show)?"present":"hidden");let s="none";return H(a=>{const l=ke(e.show);return zt(()=>{var h;if(a===l)return l;const i=s,u=n();l?o("present"):u==="none"||((h=t())==null?void 0:h.display)==="none"?o("hidden"):o(a===!0&&i!==u?"hiding":"hidden")}),l}),H(()=>{const a=ke(e.element);if(!a)return;const l=u=>{u.target===a&&(s=n())},i=u=>{const f=n().includes(u.animationName);u.target===a&&f&&r()==="hiding"&&o("hidden")};a.addEventListener("animationstart",l),a.addEventListener("animationcancel",i),a.addEventListener("animationend",i),G(()=>{a.removeEventListener("animationstart",l),a.removeEventListener("animationcancel",i),a.removeEventListener("animationend",i)})}),{present:()=>r()==="present"||r()==="hiding",state:r}},Ml=Al,di=Ml,$n="data-kb-top-layer",fi,Jn=!1,ft=[];function on(e){return ft.findIndex(t=>t.node===e)}function Tl(e){return ft[on(e)]}function Fl(e){return ft[ft.length-1].node===e}function gi(){return ft.filter(e=>e.isPointerBlocking)}function Il(){return[...gi()].slice(-1)[0]}function dr(){return gi().length>0}function hi(e){var n;const t=on((n=Il())==null?void 0:n.node);return on(e)<t}function Ol(e){ft.push(e)}function Ll(e){const t=on(e);t<0||ft.splice(t,1)}function Pl(){for(const{node:e}of ft)e.style.pointerEvents=hi(e)?"none":"auto"}function ql(e){if(dr()&&!Jn){const t=Ze(e);fi=document.body.style.pointerEvents,t.body.style.pointerEvents="none",Jn=!0}}function _l(e){if(dr())return;const t=Ze(e);t.body.style.pointerEvents=fi,t.body.style.length===0&&t.body.removeAttribute("style"),Jn=!1}var Fe={layers:ft,isTopMostLayer:Fl,hasPointerBlockingLayer:dr,isBelowPointerBlockingLayer:hi,addLayer:Ol,removeLayer:Ll,indexOf:on,find:Tl,assignPointerEventToLayers:Pl,disableBodyPointerEvents:ql,restoreBodyPointerEvents:_l},Rl={};In(Rl,{Button:()=>Bl,Root:()=>fr});var zl=["button","color","file","image","reset","submit"];function Kl(e){const t=e.tagName.toLowerCase();return t==="button"?!0:t==="input"&&e.type?zl.indexOf(e.type)!==-1:!1}function fr(e){let t;const n=X({type:"button"},e),[r,o]=oe(n,["ref","type","disabled"]),s=Fn(()=>t,()=>"button"),a=D(()=>{const u=s();return u==null?!1:Kl({tagName:u,type:r.type})}),l=D(()=>s()==="input"),i=D(()=>s()==="a"&&(t==null?void 0:t.getAttribute("href"))!=null);return v(de,W({as:"button",ref(u){const h=Ae(f=>t=f,r.ref);typeof h=="function"&&h(u)},get type(){return a()||l()?r.type:void 0},get role(){return!a()&&!i()?"button":void 0},get tabIndex(){return!a()&&!i()&&!r.disabled?0:void 0},get disabled(){return a()||l()?r.disabled:void 0},get"aria-disabled"(){return!a()&&!l()&&r.disabled?!0:void 0},get"data-disabled"(){return r.disabled?"":void 0}},o))}var Bl=fr,Nl=["top","right","bottom","left"],Xe=Math.min,Oe=Math.max,Cn=Math.round,bn=Math.floor,wt=e=>({x:e,y:e}),Hl={left:"right",right:"left",bottom:"top",top:"bottom"},Ul={start:"end",end:"start"};function er(e,t,n){return Oe(e,Xe(t,n))}function Ft(e,t){return typeof e=="function"?e(t):e}function xt(e){return e.split("-")[0]}function Ht(e){return e.split("-")[1]}function yi(e){return e==="x"?"y":"x"}function gr(e){return e==="y"?"height":"width"}function Mt(e){return["top","bottom"].includes(xt(e))?"y":"x"}function hr(e){return yi(Mt(e))}function Vl(e,t,n){n===void 0&&(n=!1);const r=Ht(e),o=hr(e),s=gr(o);let a=o==="x"?r===(n?"end":"start")?"right":"left":r==="start"?"bottom":"top";return t.reference[s]>t.floating[s]&&(a=Sn(a)),[a,Sn(a)]}function Gl(e){const t=Sn(e);return[tr(e),t,tr(t)]}function tr(e){return e.replace(/start|end/g,t=>Ul[t])}function jl(e,t,n){const r=["left","right"],o=["right","left"],s=["top","bottom"],a=["bottom","top"];switch(e){case"top":case"bottom":return n?t?o:r:t?r:o;case"left":case"right":return t?s:a;default:return[]}}function Wl(e,t,n,r){const o=Ht(e);let s=jl(xt(e),n==="start",r);return o&&(s=s.map(a=>a+"-"+o),t&&(s=s.concat(s.map(tr)))),s}function Sn(e){return e.replace(/left|right|bottom|top/g,t=>Hl[t])}function Ql(e){return{top:0,right:0,bottom:0,left:0,...e}}function vi(e){return typeof e!="number"?Ql(e):{top:e,right:e,bottom:e,left:e}}function kn(e){const{x:t,y:n,width:r,height:o}=e;return{width:r,height:o,top:n,left:t,right:t+r,bottom:n+o,x:t,y:n}}function ao(e,t,n){let{reference:r,floating:o}=e;const s=Mt(t),a=hr(t),l=gr(a),i=xt(t),u=s==="y",h=r.x+r.width/2-o.width/2,f=r.y+r.height/2-o.height/2,c=r[l]/2-o[l]/2;let g;switch(i){case"top":g={x:h,y:r.y-o.height};break;case"bottom":g={x:h,y:r.y+r.height};break;case"right":g={x:r.x+r.width,y:f};break;case"left":g={x:r.x-o.width,y:f};break;default:g={x:r.x,y:r.y}}switch(Ht(t)){case"start":g[a]-=c*(n&&u?-1:1);break;case"end":g[a]+=c*(n&&u?-1:1);break}return g}var Yl=async(e,t,n)=>{const{placement:r="bottom",strategy:o="absolute",middleware:s=[],platform:a}=n,l=s.filter(Boolean),i=await(a.isRTL==null?void 0:a.isRTL(t));let u=await a.getElementRects({reference:e,floating:t,strategy:o}),{x:h,y:f}=ao(u,r,i),c=r,g={},d=0;for(let y=0;y<l.length;y++){const{name:b,fn:m}=l[y],{x:p,y:w,data:x,reset:$}=await m({x:h,y:f,initialPlacement:r,placement:c,strategy:o,middlewareData:g,rects:u,platform:a,elements:{reference:e,floating:t}});h=p??h,f=w??f,g={...g,[b]:{...g[b],...x}},$&&d<=50&&(d++,typeof $=="object"&&($.placement&&(c=$.placement),$.rects&&(u=$.rects===!0?await a.getElementRects({reference:e,floating:t,strategy:o}):$.rects),{x:h,y:f}=ao(u,c,i)),y=-1)}return{x:h,y:f,placement:c,strategy:o,middlewareData:g}};async function sn(e,t){var n;t===void 0&&(t={});const{x:r,y:o,platform:s,rects:a,elements:l,strategy:i}=e,{boundary:u="clippingAncestors",rootBoundary:h="viewport",elementContext:f="floating",altBoundary:c=!1,padding:g=0}=Ft(t,e),d=vi(g),b=l[c?f==="floating"?"reference":"floating":f],m=kn(await s.getClippingRect({element:(n=await(s.isElement==null?void 0:s.isElement(b)))==null||n?b:b.contextElement||await(s.getDocumentElement==null?void 0:s.getDocumentElement(l.floating)),boundary:u,rootBoundary:h,strategy:i})),p=f==="floating"?{x:r,y:o,width:a.floating.width,height:a.floating.height}:a.reference,w=await(s.getOffsetParent==null?void 0:s.getOffsetParent(l.floating)),x=await(s.isElement==null?void 0:s.isElement(w))?await(s.getScale==null?void 0:s.getScale(w))||{x:1,y:1}:{x:1,y:1},$=kn(s.convertOffsetParentRelativeRectToViewportRelativeRect?await s.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:p,offsetParent:w,strategy:i}):p);return{top:(m.top-$.top+d.top)/x.y,bottom:($.bottom-m.bottom+d.bottom)/x.y,left:(m.left-$.left+d.left)/x.x,right:($.right-m.right+d.right)/x.x}}var Xl=e=>({name:"arrow",options:e,async fn(t){const{x:n,y:r,placement:o,rects:s,platform:a,elements:l,middlewareData:i}=t,{element:u,padding:h=0}=Ft(e,t)||{};if(u==null)return{};const f=vi(h),c={x:n,y:r},g=hr(o),d=gr(g),y=await a.getDimensions(u),b=g==="y",m=b?"top":"left",p=b?"bottom":"right",w=b?"clientHeight":"clientWidth",x=s.reference[d]+s.reference[g]-c[g]-s.floating[d],$=c[g]-s.reference[g],P=await(a.getOffsetParent==null?void 0:a.getOffsetParent(u));let I=P?P[w]:0;(!I||!await(a.isElement==null?void 0:a.isElement(P)))&&(I=l.floating[w]||s.floating[d]);const _=x/2-$/2,C=I/2-y[d]/2-1,T=Xe(f[m],C),K=Xe(f[p],C),U=T,ne=I-y[d]-K,Z=I/2-y[d]/2+_,se=er(U,Z,ne),R=!i.arrow&&Ht(o)!=null&&Z!==se&&s.reference[d]/2-(Z<U?T:K)-y[d]/2<0,Q=R?Z<U?Z-U:Z-ne:0;return{[g]:c[g]+Q,data:{[g]:se,centerOffset:Z-se-Q,...R&&{alignmentOffset:Q}},reset:R}}}),Zl=function(e){return e===void 0&&(e={}),{name:"flip",options:e,async fn(t){var n,r;const{placement:o,middlewareData:s,rects:a,initialPlacement:l,platform:i,elements:u}=t,{mainAxis:h=!0,crossAxis:f=!0,fallbackPlacements:c,fallbackStrategy:g="bestFit",fallbackAxisSideDirection:d="none",flipAlignment:y=!0,...b}=Ft(e,t);if((n=s.arrow)!=null&&n.alignmentOffset)return{};const m=xt(o),p=Mt(l),w=xt(l)===l,x=await(i.isRTL==null?void 0:i.isRTL(u.floating)),$=c||(w||!y?[Sn(l)]:Gl(l)),P=d!=="none";!c&&P&&$.push(...Wl(l,y,d,x));const I=[l,...$],_=await sn(t,b),C=[];let T=((r=s.flip)==null?void 0:r.overflows)||[];if(h&&C.push(_[m]),f){const Z=Vl(o,a,x);C.push(_[Z[0]],_[Z[1]])}if(T=[...T,{placement:o,overflows:C}],!C.every(Z=>Z<=0)){var K,U;const Z=(((K=s.flip)==null?void 0:K.index)||0)+1,se=I[Z];if(se)return{data:{index:Z,overflows:T},reset:{placement:se}};let R=(U=T.filter(Q=>Q.overflows[0]<=0).sort((Q,J)=>Q.overflows[1]-J.overflows[1])[0])==null?void 0:U.placement;if(!R)switch(g){case"bestFit":{var ne;const Q=(ne=T.filter(J=>{if(P){const le=Mt(J.placement);return le===p||le==="y"}return!0}).map(J=>[J.placement,J.overflows.filter(le=>le>0).reduce((le,ye)=>le+ye,0)]).sort((J,le)=>J[1]-le[1])[0])==null?void 0:ne[0];Q&&(R=Q);break}case"initialPlacement":R=l;break}if(o!==R)return{reset:{placement:R}}}return{}}}};function lo(e,t){return{top:e.top-t.height,right:e.right-t.width,bottom:e.bottom-t.height,left:e.left-t.width}}function co(e){return Nl.some(t=>e[t]>=0)}var Jl=function(e){return e===void 0&&(e={}),{name:"hide",options:e,async fn(t){const{rects:n}=t,{strategy:r="referenceHidden",...o}=Ft(e,t);switch(r){case"referenceHidden":{const s=await sn(t,{...o,elementContext:"reference"}),a=lo(s,n.reference);return{data:{referenceHiddenOffsets:a,referenceHidden:co(a)}}}case"escaped":{const s=await sn(t,{...o,altBoundary:!0}),a=lo(s,n.floating);return{data:{escapedOffsets:a,escaped:co(a)}}}default:return{}}}}};async function ec(e,t){const{placement:n,platform:r,elements:o}=e,s=await(r.isRTL==null?void 0:r.isRTL(o.floating)),a=xt(n),l=Ht(n),i=Mt(n)==="y",u=["left","top"].includes(a)?-1:1,h=s&&i?-1:1,f=Ft(t,e);let{mainAxis:c,crossAxis:g,alignmentAxis:d}=typeof f=="number"?{mainAxis:f,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...f};return l&&typeof d=="number"&&(g=l==="end"?d*-1:d),i?{x:g*h,y:c*u}:{x:c*u,y:g*h}}var tc=function(e){return e===void 0&&(e=0),{name:"offset",options:e,async fn(t){var n,r;const{x:o,y:s,placement:a,middlewareData:l}=t,i=await ec(t,e);return a===((n=l.offset)==null?void 0:n.placement)&&(r=l.arrow)!=null&&r.alignmentOffset?{}:{x:o+i.x,y:s+i.y,data:{...i,placement:a}}}}},nc=function(e){return e===void 0&&(e={}),{name:"shift",options:e,async fn(t){const{x:n,y:r,placement:o}=t,{mainAxis:s=!0,crossAxis:a=!1,limiter:l={fn:b=>{let{x:m,y:p}=b;return{x:m,y:p}}},...i}=Ft(e,t),u={x:n,y:r},h=await sn(t,i),f=Mt(xt(o)),c=yi(f);let g=u[c],d=u[f];if(s){const b=c==="y"?"top":"left",m=c==="y"?"bottom":"right",p=g+h[b],w=g-h[m];g=er(p,g,w)}if(a){const b=f==="y"?"top":"left",m=f==="y"?"bottom":"right",p=d+h[b],w=d-h[m];d=er(p,d,w)}const y=l.fn({...t,[c]:g,[f]:d});return{...y,data:{x:y.x-n,y:y.y-r}}}}},rc=function(e){return e===void 0&&(e={}),{name:"size",options:e,async fn(t){const{placement:n,rects:r,platform:o,elements:s}=t,{apply:a=()=>{},...l}=Ft(e,t),i=await sn(t,l),u=xt(n),h=Ht(n),f=Mt(n)==="y",{width:c,height:g}=r.floating;let d,y;u==="top"||u==="bottom"?(d=u,y=h===(await(o.isRTL==null?void 0:o.isRTL(s.floating))?"start":"end")?"left":"right"):(y=u,d=h==="end"?"top":"bottom");const b=g-i.top-i.bottom,m=c-i.left-i.right,p=Xe(g-i[d],b),w=Xe(c-i[y],m),x=!t.middlewareData.shift;let $=p,P=w;if(f?P=h||x?Xe(w,m):m:$=h||x?Xe(p,b):b,x&&!h){const _=Oe(i.left,0),C=Oe(i.right,0),T=Oe(i.top,0),K=Oe(i.bottom,0);f?P=c-2*(_!==0||C!==0?_+C:Oe(i.left,i.right)):$=g-2*(T!==0||K!==0?T+K:Oe(i.top,i.bottom))}await a({...t,availableWidth:P,availableHeight:$});const I=await o.getDimensions(s.floating);return c!==I.width||g!==I.height?{reset:{rects:!0}}:{}}}};function Ut(e){return mi(e)?(e.nodeName||"").toLowerCase():"#document"}function Le(e){var t;return(e==null||(t=e.ownerDocument)==null?void 0:t.defaultView)||window}function gt(e){var t;return(t=(mi(e)?e.ownerDocument:e.document)||window.document)==null?void 0:t.documentElement}function mi(e){return e instanceof Node||e instanceof Le(e).Node}function Ve(e){return e instanceof Element||e instanceof Le(e).Element}function Je(e){return e instanceof HTMLElement||e instanceof Le(e).HTMLElement}function uo(e){return typeof ShadowRoot>"u"?!1:e instanceof ShadowRoot||e instanceof Le(e).ShadowRoot}function fn(e){const{overflow:t,overflowX:n,overflowY:r,display:o}=Ge(e);return/auto|scroll|overlay|hidden|clip/.test(t+r+n)&&!["inline","contents"].includes(o)}function oc(e){return["table","td","th"].includes(Ut(e))}function On(e){return[":popover-open",":modal"].some(t=>{try{return e.matches(t)}catch{return!1}})}function yr(e){const t=vr(),n=Ve(e)?Ge(e):e;return n.transform!=="none"||n.perspective!=="none"||(n.containerType?n.containerType!=="normal":!1)||!t&&(n.backdropFilter?n.backdropFilter!=="none":!1)||!t&&(n.filter?n.filter!=="none":!1)||["transform","perspective","filter"].some(r=>(n.willChange||"").includes(r))||["paint","layout","strict","content"].some(r=>(n.contain||"").includes(r))}function ic(e){let t=$t(e);for(;Je(t)&&!Nt(t);){if(yr(t))return t;if(On(t))return null;t=$t(t)}return null}function vr(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function Nt(e){return["html","body","#document"].includes(Ut(e))}function Ge(e){return Le(e).getComputedStyle(e)}function Ln(e){return Ve(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:{scrollLeft:e.scrollX,scrollTop:e.scrollY}}function $t(e){if(Ut(e)==="html")return e;const t=e.assignedSlot||e.parentNode||uo(e)&&e.host||gt(e);return uo(t)?t.host:t}function bi(e){const t=$t(e);return Nt(t)?e.ownerDocument?e.ownerDocument.body:e.body:Je(t)&&fn(t)?t:bi(t)}function an(e,t,n){var r;t===void 0&&(t=[]),n===void 0&&(n=!0);const o=bi(e),s=o===((r=e.ownerDocument)==null?void 0:r.body),a=Le(o);return s?t.concat(a,a.visualViewport||[],fn(o)?o:[],a.frameElement&&n?an(a.frameElement):[]):t.concat(o,an(o,[],n))}function pi(e){const t=Ge(e);let n=parseFloat(t.width)||0,r=parseFloat(t.height)||0;const o=Je(e),s=o?e.offsetWidth:n,a=o?e.offsetHeight:r,l=Cn(n)!==s||Cn(r)!==a;return l&&(n=s,r=a),{width:n,height:r,$:l}}function mr(e){return Ve(e)?e:e.contextElement}function Kt(e){const t=mr(e);if(!Je(t))return wt(1);const n=t.getBoundingClientRect(),{width:r,height:o,$:s}=pi(t);let a=(s?Cn(n.width):n.width)/r,l=(s?Cn(n.height):n.height)/o;return(!a||!Number.isFinite(a))&&(a=1),(!l||!Number.isFinite(l))&&(l=1),{x:a,y:l}}var sc=wt(0);function wi(e){const t=Le(e);return!vr()||!t.visualViewport?sc:{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}}function ac(e,t,n){return t===void 0&&(t=!1),!n||t&&n!==Le(e)?!1:t}function Tt(e,t,n,r){t===void 0&&(t=!1),n===void 0&&(n=!1);const o=e.getBoundingClientRect(),s=mr(e);let a=wt(1);t&&(r?Ve(r)&&(a=Kt(r)):a=Kt(e));const l=ac(s,n,r)?wi(s):wt(0);let i=(o.left+l.x)/a.x,u=(o.top+l.y)/a.y,h=o.width/a.x,f=o.height/a.y;if(s){const c=Le(s),g=r&&Ve(r)?Le(r):r;let d=c,y=d.frameElement;for(;y&&r&&g!==d;){const b=Kt(y),m=y.getBoundingClientRect(),p=Ge(y),w=m.left+(y.clientLeft+parseFloat(p.paddingLeft))*b.x,x=m.top+(y.clientTop+parseFloat(p.paddingTop))*b.y;i*=b.x,u*=b.y,h*=b.x,f*=b.y,i+=w,u+=x,d=Le(y),y=d.frameElement}}return kn({width:h,height:f,x:i,y:u})}function lc(e){let{elements:t,rect:n,offsetParent:r,strategy:o}=e;const s=o==="fixed",a=gt(r),l=t?On(t.floating):!1;if(r===a||l&&s)return n;let i={scrollLeft:0,scrollTop:0},u=wt(1);const h=wt(0),f=Je(r);if((f||!f&&!s)&&((Ut(r)!=="body"||fn(a))&&(i=Ln(r)),Je(r))){const c=Tt(r);u=Kt(r),h.x=c.x+r.clientLeft,h.y=c.y+r.clientTop}return{width:n.width*u.x,height:n.height*u.y,x:n.x*u.x-i.scrollLeft*u.x+h.x,y:n.y*u.y-i.scrollTop*u.y+h.y}}function cc(e){return Array.from(e.getClientRects())}function xi(e){return Tt(gt(e)).left+Ln(e).scrollLeft}function uc(e){const t=gt(e),n=Ln(e),r=e.ownerDocument.body,o=Oe(t.scrollWidth,t.clientWidth,r.scrollWidth,r.clientWidth),s=Oe(t.scrollHeight,t.clientHeight,r.scrollHeight,r.clientHeight);let a=-n.scrollLeft+xi(e);const l=-n.scrollTop;return Ge(r).direction==="rtl"&&(a+=Oe(t.clientWidth,r.clientWidth)-o),{width:o,height:s,x:a,y:l}}function dc(e,t){const n=Le(e),r=gt(e),o=n.visualViewport;let s=r.clientWidth,a=r.clientHeight,l=0,i=0;if(o){s=o.width,a=o.height;const u=vr();(!u||u&&t==="fixed")&&(l=o.offsetLeft,i=o.offsetTop)}return{width:s,height:a,x:l,y:i}}function fc(e,t){const n=Tt(e,!0,t==="fixed"),r=n.top+e.clientTop,o=n.left+e.clientLeft,s=Je(e)?Kt(e):wt(1),a=e.clientWidth*s.x,l=e.clientHeight*s.y,i=o*s.x,u=r*s.y;return{width:a,height:l,x:i,y:u}}function fo(e,t,n){let r;if(t==="viewport")r=dc(e,n);else if(t==="document")r=uc(gt(e));else if(Ve(t))r=fc(t,n);else{const o=wi(e);r={...t,x:t.x-o.x,y:t.y-o.y}}return kn(r)}function $i(e,t){const n=$t(e);return n===t||!Ve(n)||Nt(n)?!1:Ge(n).position==="fixed"||$i(n,t)}function gc(e,t){const n=t.get(e);if(n)return n;let r=an(e,[],!1).filter(l=>Ve(l)&&Ut(l)!=="body"),o=null;const s=Ge(e).position==="fixed";let a=s?$t(e):e;for(;Ve(a)&&!Nt(a);){const l=Ge(a),i=yr(a);!i&&l.position==="fixed"&&(o=null),(s?!i&&!o:!i&&l.position==="static"&&!!o&&["absolute","fixed"].includes(o.position)||fn(a)&&!i&&$i(e,a))?r=r.filter(h=>h!==a):o=l,a=$t(a)}return t.set(e,r),r}function hc(e){let{element:t,boundary:n,rootBoundary:r,strategy:o}=e;const a=[...n==="clippingAncestors"?On(t)?[]:gc(t,this._c):[].concat(n),r],l=a[0],i=a.reduce((u,h)=>{const f=fo(t,h,o);return u.top=Oe(f.top,u.top),u.right=Xe(f.right,u.right),u.bottom=Xe(f.bottom,u.bottom),u.left=Oe(f.left,u.left),u},fo(t,l,o));return{width:i.right-i.left,height:i.bottom-i.top,x:i.left,y:i.top}}function yc(e){const{width:t,height:n}=pi(e);return{width:t,height:n}}function vc(e,t,n){const r=Je(t),o=gt(t),s=n==="fixed",a=Tt(e,!0,s,t);let l={scrollLeft:0,scrollTop:0};const i=wt(0);if(r||!r&&!s)if((Ut(t)!=="body"||fn(o))&&(l=Ln(t)),r){const f=Tt(t,!0,s,t);i.x=f.x+t.clientLeft,i.y=f.y+t.clientTop}else o&&(i.x=xi(o));const u=a.left+l.scrollLeft-i.x,h=a.top+l.scrollTop-i.y;return{x:u,y:h,width:a.width,height:a.height}}function Nn(e){return Ge(e).position==="static"}function go(e,t){return!Je(e)||Ge(e).position==="fixed"?null:t?t(e):e.offsetParent}function Ci(e,t){const n=Le(e);if(On(e))return n;if(!Je(e)){let o=$t(e);for(;o&&!Nt(o);){if(Ve(o)&&!Nn(o))return o;o=$t(o)}return n}let r=go(e,t);for(;r&&oc(r)&&Nn(r);)r=go(r,t);return r&&Nt(r)&&Nn(r)&&!yr(r)?n:r||ic(e)||n}var mc=async function(e){const t=this.getOffsetParent||Ci,n=this.getDimensions,r=await n(e.floating);return{reference:vc(e.reference,await t(e.floating),e.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function bc(e){return Ge(e).direction==="rtl"}var Si={convertOffsetParentRelativeRectToViewportRelativeRect:lc,getDocumentElement:gt,getClippingRect:hc,getOffsetParent:Ci,getElementRects:mc,getClientRects:cc,getDimensions:yc,getScale:Kt,isElement:Ve,isRTL:bc};function pc(e,t){let n=null,r;const o=gt(e);function s(){var l;clearTimeout(r),(l=n)==null||l.disconnect(),n=null}function a(l,i){l===void 0&&(l=!1),i===void 0&&(i=1),s();const{left:u,top:h,width:f,height:c}=e.getBoundingClientRect();if(l||t(),!f||!c)return;const g=bn(h),d=bn(o.clientWidth-(u+f)),y=bn(o.clientHeight-(h+c)),b=bn(u),p={rootMargin:-g+"px "+-d+"px "+-y+"px "+-b+"px",threshold:Oe(0,Xe(1,i))||1};let w=!0;function x($){const P=$[0].intersectionRatio;if(P!==i){if(!w)return a();P?a(!1,P):r=setTimeout(()=>{a(!1,1e-7)},1e3)}w=!1}try{n=new IntersectionObserver(x,{...p,root:o.ownerDocument})}catch{n=new IntersectionObserver(x,p)}n.observe(e)}return a(!0),s}function wc(e,t,n,r){r===void 0&&(r={});const{ancestorScroll:o=!0,ancestorResize:s=!0,elementResize:a=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:i=!1}=r,u=mr(e),h=o||s?[...u?an(u):[],...an(t)]:[];h.forEach(m=>{o&&m.addEventListener("scroll",n,{passive:!0}),s&&m.addEventListener("resize",n)});const f=u&&l?pc(u,n):null;let c=-1,g=null;a&&(g=new ResizeObserver(m=>{let[p]=m;p&&p.target===u&&g&&(g.unobserve(t),cancelAnimationFrame(c),c=requestAnimationFrame(()=>{var w;(w=g)==null||w.observe(t)})),n()}),u&&!i&&g.observe(u),g.observe(t));let d,y=i?Tt(e):null;i&&b();function b(){const m=Tt(e);y&&(m.x!==y.x||m.y!==y.y||m.width!==y.width||m.height!==y.height)&&n(),y=m,d=requestAnimationFrame(b)}return n(),()=>{var m;h.forEach(p=>{o&&p.removeEventListener("scroll",n),s&&p.removeEventListener("resize",n)}),f==null||f(),(m=g)==null||m.disconnect(),g=null,i&&cancelAnimationFrame(d)}}var xc=tc,$c=nc,Cc=Zl,Sc=rc,kc=Jl,Ec=Xl,Dc=(e,t,n)=>{const r=new Map,o={platform:Si,...n},s={...o.platform,_c:r};return Yl(e,t,{...o,platform:s})},br=we();function pr(){const e=xe(br);if(e===void 0)throw new Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");return e}var Ac=q('<svg display="block" viewBox="0 0 30 30" style="transform:scale(1.02)"><g><path fill="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"></path><path stroke="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z">'),nr=30,ho=nr/2,Mc={top:180,right:-90,bottom:0,left:90};function wr(e){const t=pr(),n=X({size:nr},e),[r,o]=oe(n,["ref","style","size"]),s=()=>t.currentPlacement().split("-")[0],a=Tc(t.contentRef),l=()=>{var c;return((c=a())==null?void 0:c.getPropertyValue("background-color"))||"none"},i=()=>{var c;return((c=a())==null?void 0:c.getPropertyValue(`border-${s()}-color`))||"none"},u=()=>{var c;return((c=a())==null?void 0:c.getPropertyValue(`border-${s()}-width`))||"0px"},h=()=>Number.parseInt(u())*2*(nr/r.size),f=()=>`rotate(${Mc[s()]} ${ho} ${ho}) translate(0 2)`;return v(de,W({as:"div",ref(c){const g=Ae(t.setArrowRef,r.ref);typeof g=="function"&&g(c)},"aria-hidden":"true",get style(){return Mn({position:"absolute","font-size":`${r.size}px`,width:"1em",height:"1em","pointer-events":"none",fill:l(),stroke:i(),"stroke-width":h()},r.style)}},o,{get children(){const c=Ac(),g=c.firstChild;return V(()=>M(g,"transform",f())),c}}))}function Tc(e){const[t,n]=z();return H(()=>{const r=e();r&&n(Ma(r).getComputedStyle(r))}),t}function Fc(e){const t=pr(),[n,r]=oe(e,["ref","style"]);return v(de,W({as:"div",ref(o){const s=Ae(t.setPositionerRef,n.ref);typeof s=="function"&&s(o)},"data-popper-positioner":"",get style(){return Mn({position:"absolute",top:0,left:0,"min-width":"max-content"},n.style)}},r))}function yo(e){const{x:t=0,y:n=0,width:r=0,height:o=0}=e??{};if(typeof DOMRect=="function")return new DOMRect(t,n,r,o);const s={x:t,y:n,width:r,height:o,top:n,right:t+r,bottom:n+o,left:t};return{...s,toJSON:()=>s}}function Ic(e,t){return{contextElement:e,getBoundingClientRect:()=>{const r=t(e);return r?yo(r):e?e.getBoundingClientRect():yo()}}}function Oc(e){return/^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(e)}var Lc={top:"bottom",right:"left",bottom:"top",left:"right"};function Pc(e,t){const[n,r]=e.split("-"),o=Lc[n];return r?n==="left"||n==="right"?`${o} ${r==="start"?"top":"bottom"}`:r==="start"?`${o} ${t==="rtl"?"right":"left"}`:`${o} ${t==="rtl"?"left":"right"}`:`${o} center`}function qc(e){const t=X({getAnchorRect:c=>c==null?void 0:c.getBoundingClientRect(),placement:"bottom",gutter:0,shift:0,flip:!0,slide:!0,overlap:!1,sameWidth:!1,fitViewport:!1,hideWhenDetached:!1,detachedPadding:0,arrowPadding:4,overflowPadding:8},e),[n,r]=z(),[o,s]=z(),[a,l]=z(t.placement),i=()=>{var c;return Ic((c=t.anchorRef)==null?void 0:c.call(t),t.getAnchorRect)},{direction:u}=Ct();async function h(){var P,I;const c=i(),g=n(),d=o();if(!c||!g)return;const y=((d==null?void 0:d.clientHeight)||0)/2,b=typeof t.gutter=="number"?t.gutter+y:t.gutter??y;g.style.setProperty("--kb-popper-content-overflow-padding",`${t.overflowPadding}px`),c.getBoundingClientRect();const m=[xc(({placement:_})=>{const C=!!_.split("-")[1];return{mainAxis:b,crossAxis:C?void 0:t.shift,alignmentAxis:t.shift}})];if(t.flip!==!1){const _=typeof t.flip=="string"?t.flip.split(" "):void 0;if(_!==void 0&&!_.every(Oc))throw new Error("`flip` expects a spaced-delimited list of placements");m.push(Cc({padding:t.overflowPadding,fallbackPlacements:_}))}(t.slide||t.overlap)&&m.push($c({mainAxis:t.slide,crossAxis:t.overlap,padding:t.overflowPadding})),m.push(Sc({padding:t.overflowPadding,apply({availableWidth:_,availableHeight:C,rects:T}){const K=Math.round(T.reference.width);_=Math.floor(_),C=Math.floor(C),g.style.setProperty("--kb-popper-anchor-width",`${K}px`),g.style.setProperty("--kb-popper-content-available-width",`${_}px`),g.style.setProperty("--kb-popper-content-available-height",`${C}px`),t.sameWidth&&(g.style.width=`${K}px`),t.fitViewport&&(g.style.maxWidth=`${_}px`,g.style.maxHeight=`${C}px`)}})),t.hideWhenDetached&&m.push(kc({padding:t.detachedPadding})),d&&m.push(Ec({element:d,padding:t.arrowPadding}));const p=await Dc(c,g,{placement:t.placement,strategy:"absolute",middleware:m,platform:{...Si,isRTL:()=>u()==="rtl"}});if(l(p.placement),(P=t.onCurrentPlacementChange)==null||P.call(t,p.placement),!g)return;g.style.setProperty("--kb-popper-content-transform-origin",Pc(p.placement,u()));const w=Math.round(p.x),x=Math.round(p.y);let $;if(t.hideWhenDetached&&($=(I=p.middlewareData.hide)!=null&&I.referenceHidden?"hidden":"visible"),Object.assign(g.style,{top:"0",left:"0",transform:`translate3d(${w}px, ${x}px, 0)`,visibility:$}),d&&p.middlewareData.arrow){const{x:_,y:C}=p.middlewareData.arrow,T=p.placement.split("-")[0];Object.assign(d.style,{left:_!=null?`${_}px`:"",top:C!=null?`${C}px`:"",[T]:"100%"})}}H(()=>{const c=i(),g=n();if(!c||!g)return;const d=wc(c,g,h,{elementResize:typeof ResizeObserver=="function"});G(d)}),H(()=>{var d;const c=n(),g=(d=t.contentRef)==null?void 0:d.call(t);!c||!g||queueMicrotask(()=>{c.style.zIndex=getComputedStyle(g).zIndex})});const f={currentPlacement:a,contentRef:()=>{var c;return(c=t.contentRef)==null?void 0:c.call(t)},setPositionerRef:r,setArrowRef:s};return v(br.Provider,{value:f,get children(){return t.children}})}var ki=Object.assign(qc,{Arrow:wr,Context:br,usePopperContext:pr,Positioner:Fc});function _c(e){const t=n=>{var r;n.key===ar.Escape&&((r=e.onEscapeKeyDown)==null||r.call(e,n))};H(()=>{var r;if(E(e.isDisabled))return;const n=((r=e.ownerDocument)==null?void 0:r.call(e))??Ze();n.addEventListener("keydown",t),G(()=>{n.removeEventListener("keydown",t)})})}var vo="interactOutside.pointerDownOutside",mo="interactOutside.focusOutside";function Rc(e,t){let n,r=Va;const o=()=>Ze(t()),s=f=>{var c;return(c=e.onPointerDownOutside)==null?void 0:c.call(e,f)},a=f=>{var c;return(c=e.onFocusOutside)==null?void 0:c.call(e,f)},l=f=>{var c;return(c=e.onInteractOutside)==null?void 0:c.call(e,f)},i=f=>{var g;const c=f.target;return!(c instanceof HTMLElement)||c.closest(`[${$n}]`)||!Ke(o(),c)||Ke(t(),c)?!1:!((g=e.shouldExcludeElement)!=null&&g.call(e,c))},u=f=>{function c(){const g=t(),d=f.target;if(!g||!d||!i(f))return;const y=pe([s,l]);d.addEventListener(vo,y,{once:!0});const b=new CustomEvent(vo,{bubbles:!1,cancelable:!0,detail:{originalEvent:f,isContextMenu:f.button===2||La(f)&&f.button===0}});d.dispatchEvent(b)}f.pointerType==="touch"?(o().removeEventListener("click",c),r=c,o().addEventListener("click",c,{once:!0})):c()},h=f=>{const c=t(),g=f.target;if(!c||!g||!i(f))return;const d=pe([a,l]);g.addEventListener(mo,d,{once:!0});const y=new CustomEvent(mo,{bubbles:!1,cancelable:!0,detail:{originalEvent:f,isContextMenu:!1}});g.dispatchEvent(y)};H(()=>{E(e.isDisabled)||(n=window.setTimeout(()=>{o().addEventListener("pointerdown",u,!0)},0),o().addEventListener("focusin",h,!0),G(()=>{window.clearTimeout(n),o().removeEventListener("click",r),o().removeEventListener("pointerdown",u,!0),o().removeEventListener("focusin",h,!0)}))})}var Ei=we();function zc(){return xe(Ei)}function Kc(e){let t;const n=zc(),[r,o]=oe(e,["ref","disableOutsidePointerEvents","excludedElements","onEscapeKeyDown","onPointerDownOutside","onFocusOutside","onInteractOutside","onDismiss","bypassTopMostLayerCheck"]),s=new Set([]),a=f=>{s.add(f);const c=n==null?void 0:n.registerNestedLayer(f);return()=>{s.delete(f),c==null||c()}};Rc({shouldExcludeElement:f=>{var c;return t?((c=r.excludedElements)==null?void 0:c.some(g=>Ke(g(),f)))||[...s].some(g=>Ke(g,f)):!1},onPointerDownOutside:f=>{var c,g,d;!t||Fe.isBelowPointerBlockingLayer(t)||!r.bypassTopMostLayerCheck&&!Fe.isTopMostLayer(t)||((c=r.onPointerDownOutside)==null||c.call(r,f),(g=r.onInteractOutside)==null||g.call(r,f),f.defaultPrevented||(d=r.onDismiss)==null||d.call(r))},onFocusOutside:f=>{var c,g,d;(c=r.onFocusOutside)==null||c.call(r,f),(g=r.onInteractOutside)==null||g.call(r,f),f.defaultPrevented||(d=r.onDismiss)==null||d.call(r)}},()=>t),_c({ownerDocument:()=>Ze(t),onEscapeKeyDown:f=>{var c;!t||!Fe.isTopMostLayer(t)||((c=r.onEscapeKeyDown)==null||c.call(r,f),!f.defaultPrevented&&r.onDismiss&&(f.preventDefault(),r.onDismiss()))}}),At(()=>{if(!t)return;Fe.addLayer({node:t,isPointerBlocking:r.disableOutsidePointerEvents,dismiss:r.onDismiss});const f=n==null?void 0:n.registerNestedLayer(t);Fe.assignPointerEventToLayers(),Fe.disableBodyPointerEvents(t),G(()=>{t&&(Fe.removeLayer(t),f==null||f(),Fe.assignPointerEventToLayers(),Fe.restoreBodyPointerEvents(t))})}),H(dt([()=>t,()=>r.disableOutsidePointerEvents],([f,c])=>{if(!f)return;const g=Fe.find(f);g&&g.isPointerBlocking!==c&&(g.isPointerBlocking=c,Fe.assignPointerEventToLayers()),c&&Fe.disableBodyPointerEvents(f),G(()=>{Fe.restoreBodyPointerEvents(f)})},{defer:!0}));const h={registerNestedLayer:a};return v(Ei.Provider,{value:h,get children(){return v(de,W({as:"div",ref(f){const c=Ae(g=>t=g,r.ref);typeof c=="function"&&c(f)}},o))}})}function Di(e={}){const[t,n]=ti({value:()=>E(e.open),defaultValue:()=>!!E(e.defaultOpen),onChange:a=>{var l;return(l=e.onOpenChange)==null?void 0:l.call(e,a)}}),r=()=>{n(!0)},o=()=>{n(!1)};return{isOpen:t,setIsOpen:n,open:r,close:o,toggle:()=>{t()?o():r()}}}var ze={};In(ze,{Description:()=>Jo,ErrorMessage:()=>ei,Item:()=>Fi,ItemControl:()=>Ii,ItemDescription:()=>Oi,ItemIndicator:()=>Li,ItemInput:()=>Pi,ItemLabel:()=>qi,Label:()=>_i,RadioGroup:()=>Bc,Root:()=>Ri});var Ai=we();function Mi(){const e=xe(Ai);if(e===void 0)throw new Error("[kobalte]: `useRadioGroupContext` must be used within a `RadioGroup` component");return e}var Ti=we();function gn(){const e=xe(Ti);if(e===void 0)throw new Error("[kobalte]: `useRadioGroupItemContext` must be used within a `RadioGroup.Item` component");return e}function Fi(e){const t=un(),n=Mi(),r=`${t.generateId("item")}-${Ne()}`,o=X({id:r},e),[s,a]=oe(o,["value","disabled","onPointerDown"]),[l,i]=z(),[u,h]=z(),[f,c]=z(),[g,d]=z(),[y,b]=z(!1),m=D(()=>n.isSelectedValue(s.value)),p=D(()=>s.disabled||t.isDisabled()||!1),w=P=>{ue(P,s.onPointerDown),y()&&P.preventDefault()},x=D(()=>({...t.dataset(),"data-disabled":p()?"":void 0,"data-checked":m()?"":void 0})),$={value:()=>s.value,dataset:x,isSelected:m,isDisabled:p,inputId:l,labelId:u,descriptionId:f,inputRef:g,select:()=>n.setSelectedValue(s.value),generateId:cn(()=>a.id),registerInput:Be(i),registerLabel:Be(h),registerDescription:Be(c),setIsFocused:b,setInputRef:d};return v(Ti.Provider,{value:$,get children(){return v(de,W({as:"div",role:"group",onPointerDown:w},x,a))}})}function Ii(e){const t=gn(),n=X({id:t.generateId("control")},e),[r,o]=oe(n,["onClick","onKeyDown"]);return v(de,W({as:"div",onClick:l=>{var i;ue(l,r.onClick),t.select(),(i=t.inputRef())==null||i.focus()},onKeyDown:l=>{var i;ue(l,r.onKeyDown),l.key===ar.Space&&(t.select(),(i=t.inputRef())==null||i.focus())}},()=>t.dataset(),o))}function Oi(e){const t=gn(),n=X({id:t.generateId("description")},e);return H(()=>G(t.registerDescription(n.id))),v(de,W({as:"div"},()=>t.dataset(),n))}function Li(e){const t=gn(),n=X({id:t.generateId("indicator")},e),[r,o]=oe(n,["ref","forceMount"]),[s,a]=z(),{present:l}=di({show:()=>r.forceMount||t.isSelected(),element:()=>s()??null});return v(B,{get when(){return l()},get children(){return v(de,W({as:"div",ref(i){const u=Ae(a,r.ref);typeof u=="function"&&u(i)}},()=>t.dataset(),o))}})}function Pi(e){const t=un(),n=Mi(),r=gn(),o=X({id:r.generateId("input")},e),[s,a]=oe(o,["ref","style","aria-labelledby","aria-describedby","onChange","onFocus","onBlur"]),l=()=>[s["aria-labelledby"],r.labelId(),s["aria-labelledby"]!=null&&a["aria-label"]!=null?a.id:void 0].filter(Boolean).join(" ")||void 0,i=()=>[s["aria-describedby"],r.descriptionId(),n.ariaDescribedBy()].filter(Boolean).join(" ")||void 0,[u,h]=z(!1),f=d=>{if(ue(d,s.onChange),d.stopPropagation(),!u()){n.setSelectedValue(r.value());const y=d.target;y.checked=r.isSelected()}h(!1)},c=d=>{ue(d,s.onFocus),r.setIsFocused(!0)},g=d=>{ue(d,s.onBlur),r.setIsFocused(!1)};return H(dt([()=>r.isSelected(),()=>r.value()],d=>{if(!d[0]&&d[1]===r.value())return;h(!0);const y=r.inputRef();y==null||y.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0})),y==null||y.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},{defer:!0})),H(()=>G(r.registerInput(a.id))),v(de,W({as:"input",ref(d){const y=Ae(r.setInputRef,s.ref);typeof y=="function"&&y(d)},type:"radio",get name(){return t.name()},get value(){return r.value()},get checked(){return r.isSelected()},get required(){return t.isRequired()},get disabled(){return r.isDisabled()},get readonly(){return t.isReadOnly()},get style(){return Mn({...Xo},s.style)},get"aria-labelledby"(){return l()},get"aria-describedby"(){return i()},onChange:f,onFocus:c,onBlur:g},()=>r.dataset(),a))}function qi(e){const t=gn(),n=X({id:t.generateId("label")},e);return H(()=>G(t.registerLabel(n.id))),v(de,W({as:"label",get for(){return t.inputId()}},()=>t.dataset(),n))}function _i(e){return v(Ya,W({as:"span"},e))}function Ri(e){let t;const n=`radiogroup-${Ne()}`,r=X({id:n,orientation:"vertical"},e),[o,s,a]=oe(r,["ref","value","defaultValue","onChange","orientation","aria-labelledby","aria-describedby"],Wa),[l,i]=dn({value:()=>o.value,defaultValue:()=>o.defaultValue,onChange:d=>{var y;return(y=o.onChange)==null?void 0:y.call(o,d)}}),{formControlContext:u}=Qa(s);Xa(()=>t,()=>i(o.defaultValue??""));const h=()=>u.getAriaLabelledBy(E(s.id),a["aria-label"],o["aria-labelledby"]),f=()=>u.getAriaDescribedBy(o["aria-describedby"]),c=d=>d===l(),g={ariaDescribedBy:f,isSelectedValue:c,setSelectedValue:d=>{if(!(u.isReadOnly()||u.isDisabled())&&(i(d),t))for(const y of t.querySelectorAll("[type='radio']")){const b=y;b.checked=c(b.value)}}};return v(Zo.Provider,{value:u,get children(){return v(Ai.Provider,{value:g,get children(){return v(de,W({as:"div",ref(d){const y=Ae(b=>t=b,o.ref);typeof y=="function"&&y(d)},role:"radiogroup",get id(){return E(s.id)},get"aria-invalid"(){return u.validationState()==="invalid"||void 0},get"aria-required"(){return u.isRequired()||void 0},get"aria-disabled"(){return u.isDisabled()||void 0},get"aria-readonly"(){return u.isReadOnly()||void 0},get"aria-orientation"(){return o.orientation},get"aria-labelledby"(){return h()},get"aria-describedby"(){return f()}},()=>u.dataset(),a))}})}})}var Bc=Object.assign(Ri,{Description:Jo,ErrorMessage:ei,Item:Fi,ItemControl:Ii,ItemDescription:Oi,ItemIndicator:Li,ItemInput:Pi,ItemLabel:qi,Label:_i}),Nc=class{constructor(e,t,n){qe(this,"collection");qe(this,"ref");qe(this,"collator");this.collection=e,this.ref=t,this.collator=n}getKeyBelow(e){let t=this.collection().getKeyAfter(e);for(;t!=null;){const n=this.collection().getItem(t);if(n&&n.type==="item"&&!n.disabled)return t;t=this.collection().getKeyAfter(t)}}getKeyAbove(e){let t=this.collection().getKeyBefore(e);for(;t!=null;){const n=this.collection().getItem(t);if(n&&n.type==="item"&&!n.disabled)return t;t=this.collection().getKeyBefore(t)}}getFirstKey(){let e=this.collection().getFirstKey();for(;e!=null;){const t=this.collection().getItem(e);if(t&&t.type==="item"&&!t.disabled)return e;e=this.collection().getKeyAfter(e)}}getLastKey(){let e=this.collection().getLastKey();for(;e!=null;){const t=this.collection().getItem(e);if(t&&t.type==="item"&&!t.disabled)return e;e=this.collection().getKeyBefore(e)}}getItem(e){var t,n;return((n=(t=this.ref)==null?void 0:t.call(this))==null?void 0:n.querySelector(`[data-key="${e}"]`))??null}getKeyPageAbove(e){var s;const t=(s=this.ref)==null?void 0:s.call(this);let n=this.getItem(e);if(!t||!n)return;const r=Math.max(0,n.offsetTop+n.offsetHeight-t.offsetHeight);let o=e;for(;o&&n&&n.offsetTop>r;)o=this.getKeyAbove(o),n=o!=null?this.getItem(o):null;return o}getKeyPageBelow(e){var s;const t=(s=this.ref)==null?void 0:s.call(this);let n=this.getItem(e);if(!t||!n)return;const r=Math.min(t.scrollHeight,n.offsetTop-n.offsetHeight+t.offsetHeight);let o=e;for(;o&&n&&n.offsetTop<r;)o=this.getKeyBelow(o),n=o!=null?this.getItem(o):null;return o}getKeyForSearch(e,t){var o;const n=(o=this.collator)==null?void 0:o.call(this);if(!n)return;let r=t!=null?this.getKeyBelow(t):this.getFirstKey();for(;r!=null;){const s=this.collection().getItem(r);if(s){const a=s.textValue.slice(0,e.length);if(s.textValue&&n.compare(a,e)===0)return r}r=this.getKeyBelow(r)}}};function Hc(e,t,n){const r=bl({usage:"search",sensitivity:"base"}),o=D(()=>{const s=E(e.keyboardDelegate);return s||new Nc(e.collection,t,r)});return kl({selectionManager:()=>E(e.selectionManager),keyboardDelegate:o,autoFocus:()=>E(e.autoFocus),deferAutoFocus:()=>E(e.deferAutoFocus),shouldFocusWrap:()=>E(e.shouldFocusWrap),disallowEmptySelection:()=>E(e.disallowEmptySelection),selectOnFocus:()=>E(e.selectOnFocus),disallowTypeAhead:()=>E(e.disallowTypeAhead),shouldUseVirtualFocus:()=>E(e.shouldUseVirtualFocus),allowsTabNavigation:()=>E(e.allowsTabNavigation),isVirtualized:()=>E(e.isVirtualized),scrollToKey:s=>{var a;return(a=E(e.scrollToKey))==null?void 0:a(s)},orientation:()=>E(e.orientation)},t)}var Hn="focusScope.autoFocusOnMount",Un="focusScope.autoFocusOnUnmount",bo={bubbles:!1,cancelable:!0},po={stack:[],active(){return this.stack[0]},add(e){var t;e!==this.active()&&((t=this.active())==null||t.pause()),this.stack=Yn(this.stack,e),this.stack.unshift(e)},remove(e){var t;this.stack=Yn(this.stack,e),(t=this.active())==null||t.resume()}};function Uc(e,t){const[n,r]=z(!1),o={pause(){r(!0)},resume(){r(!1)}};let s=null;const a=d=>{var y;return(y=e.onMountAutoFocus)==null?void 0:y.call(e,d)},l=d=>{var y;return(y=e.onUnmountAutoFocus)==null?void 0:y.call(e,d)},i=()=>Ze(t()),u=()=>{const d=i().createElement("span");return d.setAttribute("data-focus-trap",""),d.tabIndex=0,Object.assign(d.style,Xo),d},h=()=>{const d=t();return d?Qo(d,!0).filter(y=>!y.hasAttribute("data-focus-trap")):[]},f=()=>{const d=h();return d.length>0?d[0]:null},c=()=>{const d=h();return d.length>0?d[d.length-1]:null},g=()=>{const d=t();if(!d)return!1;const y=tn(d);return!y||Ke(d,y)?!1:Yo(y)};H(()=>{const d=t();if(!d)return;po.add(o);const y=tn(d);if(!Ke(d,y)){const m=new CustomEvent(Hn,bo);d.addEventListener(Hn,a),d.dispatchEvent(m),m.defaultPrevented||setTimeout(()=>{Ee(f()),tn(d)===y&&Ee(d)},0)}G(()=>{d.removeEventListener(Hn,a),setTimeout(()=>{const m=new CustomEvent(Un,bo);g()&&m.preventDefault(),d.addEventListener(Un,l),d.dispatchEvent(m),m.defaultPrevented||Ee(y??i().body),d.removeEventListener(Un,l),po.remove(o)},0)})}),H(()=>{const d=t();if(!d||!E(e.trapFocus)||n())return;const y=m=>{const p=m.target;p!=null&&p.closest(`[${$n}]`)||(Ke(d,p)?s=p:Ee(s))},b=m=>{const w=m.relatedTarget??tn(d);w!=null&&w.closest(`[${$n}]`)||Ke(d,w)||Ee(s)};i().addEventListener("focusin",y),i().addEventListener("focusout",b),G(()=>{i().removeEventListener("focusin",y),i().removeEventListener("focusout",b)})}),H(()=>{const d=t();if(!d||!E(e.trapFocus)||n())return;const y=u();d.insertAdjacentElement("afterbegin",y);const b=u();d.insertAdjacentElement("beforeend",b);function m(w){const x=f(),$=c();w.relatedTarget===x?Ee($):Ee(x)}y.addEventListener("focusin",m),b.addEventListener("focusin",m);const p=new MutationObserver(w=>{for(const x of w)x.previousSibling===b&&(b.remove(),d.insertAdjacentElement("beforeend",b)),x.nextSibling===y&&(y.remove(),d.insertAdjacentElement("afterbegin",y))});p.observe(d,{childList:!0,subtree:!1}),G(()=>{y.removeEventListener("focusin",m),b.removeEventListener("focusin",m),y.remove(),b.remove(),p.disconnect()})})}var Vc="data-live-announcer";function Gc(e){H(()=>{E(e.isDisabled)||G(jc(E(e.targets),E(e.root)))})}var Zt=new WeakMap,Re=[];function jc(e,t=document.body){const n=new Set(e),r=new Set,o=i=>{for(const c of i.querySelectorAll(`[${Vc}], [${$n}]`))n.add(c);const u=c=>{if(n.has(c)||c.parentElement&&r.has(c.parentElement)&&c.parentElement.getAttribute("role")!=="row")return NodeFilter.FILTER_REJECT;for(const g of n)if(c.contains(g))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_ACCEPT},h=document.createTreeWalker(i,NodeFilter.SHOW_ELEMENT,{acceptNode:u}),f=u(i);if(f===NodeFilter.FILTER_ACCEPT&&s(i),f!==NodeFilter.FILTER_REJECT){let c=h.nextNode();for(;c!=null;)s(c),c=h.nextNode()}},s=i=>{const u=Zt.get(i)??0;i.getAttribute("aria-hidden")==="true"&&u===0||(u===0&&i.setAttribute("aria-hidden","true"),r.add(i),Zt.set(i,u+1))};Re.length&&Re[Re.length-1].disconnect(),o(t);const a=new MutationObserver(i=>{for(const u of i)if(!(u.type!=="childList"||u.addedNodes.length===0)&&![...n,...r].some(h=>h.contains(u.target))){for(const h of u.removedNodes)h instanceof Element&&(n.delete(h),r.delete(h));for(const h of u.addedNodes)(h instanceof HTMLElement||h instanceof SVGElement)&&(h.dataset.liveAnnouncer==="true"||h.dataset.reactAriaTopLayer==="true")?n.add(h):h instanceof Element&&o(h)}});a.observe(t,{childList:!0,subtree:!0});const l={observe(){a.observe(t,{childList:!0,subtree:!0})},disconnect(){a.disconnect()}};return Re.push(l),()=>{a.disconnect();for(const i of r){const u=Zt.get(i);if(u==null)return;u===1?(i.removeAttribute("aria-hidden"),Zt.delete(i)):Zt.set(i,u-1)}l===Re[Re.length-1]?(Re.pop(),Re.length&&Re[Re.length-1].observe()):Re.splice(Re.indexOf(l),1)}}var pn=new Map,Wc=e=>{H(()=>{const t=ke(e.style)??{},n=ke(e.properties)??[],r={};for(const s in t)r[s]=e.element.style[s];const o=pn.get(e.key);o?o.activeCount++:pn.set(e.key,{activeCount:1,originalStyles:r,properties:n.map(s=>s.key)}),Object.assign(e.element.style,e.style);for(const s of n)e.element.style.setProperty(s.key,s.value);G(()=>{var a;const s=pn.get(e.key);if(s){if(s.activeCount!==1){s.activeCount--;return}pn.delete(e.key);for(const[l,i]of Object.entries(s.originalStyles))e.element.style[l]=i;for(const l of s.properties)e.element.style.removeProperty(l);e.element.style.length===0&&e.element.removeAttribute("style"),(a=e.cleanup)==null||a.call(e)}})})},wo=Wc,Qc=(e,t)=>{switch(t){case"x":return[e.clientWidth,e.scrollLeft,e.scrollWidth];case"y":return[e.clientHeight,e.scrollTop,e.scrollHeight]}},Yc=(e,t)=>{const n=getComputedStyle(e),r=t==="x"?n.overflowX:n.overflowY;return r==="auto"||r==="scroll"||e.tagName==="HTML"&&r==="visible"},Xc=(e,t,n)=>{const r=t==="x"&&window.getComputedStyle(e).direction==="rtl"?-1:1;let o=e,s=0,a=0,l=!1;do{const[i,u,h]=Qc(o,t),f=h-i-r*u;(u!==0||f!==0)&&Yc(o,t)&&(s+=f,a+=u),o===(n??document.documentElement)?l=!0:o=o._$host??o.parentElement}while(o&&!l);return[s,a]},[xo,$o]=z([]),Zc=e=>xo().indexOf(e)===xo().length-1,Jc=e=>{const t=W({element:null,enabled:!0,hideScrollbar:!0,preventScrollbarShift:!0,preventScrollbarShiftMode:"padding",restoreScrollPosition:!0,allowPinchZoom:!1},e),n=Ne();let r=[0,0],o=null,s=null;H(()=>{ke(t.enabled)&&($o(u=>[...u,n]),G(()=>{$o(u=>u.filter(h=>h!==n))}))}),H(()=>{if(!ke(t.enabled)||!ke(t.hideScrollbar))return;const{body:u}=document,h=window.innerWidth-u.offsetWidth;if(ke(t.preventScrollbarShift)){const f={overflow:"hidden"},c=[];h>0&&(ke(t.preventScrollbarShiftMode)==="padding"?f.paddingRight=`calc(${window.getComputedStyle(u).paddingRight} + ${h}px)`:f.marginRight=`calc(${window.getComputedStyle(u).marginRight} + ${h}px)`,c.push({key:"--scrollbar-width",value:`${h}px`}));const g=window.scrollY,d=window.scrollX;wo({key:"prevent-scroll",element:u,style:f,properties:c,cleanup:()=>{ke(t.restoreScrollPosition)&&h>0&&window.scrollTo(d,g)}})}else wo({key:"prevent-scroll",element:u,style:{overflow:"hidden"}})}),H(()=>{!Zc(n)||!ke(t.enabled)||(document.addEventListener("wheel",l,{passive:!1}),document.addEventListener("touchstart",a,{passive:!1}),document.addEventListener("touchmove",i,{passive:!1}),G(()=>{document.removeEventListener("wheel",l),document.removeEventListener("touchstart",a),document.removeEventListener("touchmove",i)}))});const a=u=>{r=Co(u),o=null,s=null},l=u=>{const h=u.target,f=ke(t.element),c=eu(u),g=Math.abs(c[0])>Math.abs(c[1])?"x":"y",d=g==="x"?c[0]:c[1],y=So(h,g,d,f);let b;f&&rr(f,h)?b=!y:b=!0,b&&u.cancelable&&u.preventDefault()},i=u=>{const h=ke(t.element),f=u.target;let c;if(u.touches.length===2)c=!ke(t.allowPinchZoom);else{if(o==null||s===null){const g=Co(u).map((y,b)=>r[b]-y),d=Math.abs(g[0])>Math.abs(g[1])?"x":"y";o=d,s=d==="x"?g[0]:g[1]}if(f.type==="range")c=!1;else{const g=So(f,o,s,h);h&&rr(h,f)?c=!g:c=!0}}c&&u.cancelable&&u.preventDefault()}},eu=e=>[e.deltaX,e.deltaY],Co=e=>e.changedTouches[0]?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0],So=(e,t,n,r)=>{const o=r!==null&&rr(r,e),[s,a]=Xc(e,t,o?r:void 0);return!(n>0&&Math.abs(s)<=1||n<0&&Math.abs(a)<1)},rr=(e,t)=>{if(e.contains(t))return!0;let n=t;for(;n;){if(n===e)return!0;n=n._$host??n.parentElement}return!1},tu=Jc,nu=tu,zi=we();function Ki(){return xe(zi)}function ht(){const e=Ki();if(e===void 0)throw new Error("[kobalte]: `useMenuContext` must be used within a `Menu` component");return e}var Bi=we();function xr(){const e=xe(Bi);if(e===void 0)throw new Error("[kobalte]: `useMenuItemContext` must be used within a `Menu.Item` component");return e}var Ni=we();function et(){const e=xe(Ni);if(e===void 0)throw new Error("[kobalte]: `useMenuRootContext` must be used within a `MenuRoot` component");return e}function $r(e){let t;const n=et(),r=ht(),o=X({id:n.generateId(`item-${Ne()}`)},e),[s,a]=oe(o,["ref","textValue","disabled","closeOnSelect","checked","indeterminate","onSelect","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]),[l,i]=z(),[u,h]=z(),[f,c]=z(),g=()=>r.listState().selectionManager(),d=()=>a.id,y=()=>g().focusedKey()===d(),b=()=>{var C;(C=s.onSelect)==null||C.call(s),s.closeOnSelect&&setTimeout(()=>{r.close(!0)})};ul({getItem:()=>{var C;return{ref:()=>t,type:"item",key:d(),textValue:s.textValue??((C=f())==null?void 0:C.textContent)??(t==null?void 0:t.textContent)??"",disabled:s.disabled??!1}}});const m=ui({key:d,selectionManager:g,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>s.disabled},()=>t),p=C=>{ue(C,s.onPointerMove),C.pointerType==="mouse"&&(s.disabled?r.onItemLeave(C):(r.onItemEnter(C),C.defaultPrevented||(Ee(C.currentTarget),r.listState().selectionManager().setFocused(!0),r.listState().selectionManager().setFocusedKey(d()))))},w=C=>{ue(C,s.onPointerLeave),C.pointerType==="mouse"&&r.onItemLeave(C)},x=C=>{ue(C,s.onPointerUp),!s.disabled&&C.button===0&&b()},$=C=>{if(ue(C,s.onKeyDown),!C.repeat&&!s.disabled)switch(C.key){case"Enter":case" ":b();break}},P=D(()=>{if(s.indeterminate)return"mixed";if(s.checked!=null)return s.checked}),I=D(()=>({"data-indeterminate":s.indeterminate?"":void 0,"data-checked":s.checked&&!s.indeterminate?"":void 0,"data-disabled":s.disabled?"":void 0,"data-highlighted":y()?"":void 0})),_={isChecked:()=>s.checked,dataset:I,setLabelRef:c,generateId:cn(()=>a.id),registerLabel:Be(i),registerDescription:Be(h)};return v(Bi.Provider,{value:_,get children(){return v(de,W({as:"div",ref(C){const T=Ae(K=>t=K,s.ref);typeof T=="function"&&T(C)},get tabIndex(){return m.tabIndex()},get"aria-checked"(){return P()},get"aria-disabled"(){return s.disabled},get"aria-labelledby"(){return l()},get"aria-describedby"(){return u()},get"data-key"(){return m.dataKey()},get onPointerDown(){return pe([s.onPointerDown,m.onPointerDown])},get onPointerUp(){return pe([x,m.onPointerUp])},get onClick(){return pe([s.onClick,m.onClick])},get onKeyDown(){return pe([$,m.onKeyDown])},get onMouseDown(){return pe([s.onMouseDown,m.onMouseDown])},get onFocus(){return pe([s.onFocus,m.onFocus])},onPointerMove:p,onPointerLeave:w},I,a))}})}function Hi(e){const t=X({closeOnSelect:!1},e),[n,r]=oe(t,["checked","defaultChecked","onChange","onSelect"]),o=tl({isSelected:()=>n.checked,defaultIsSelected:()=>n.defaultChecked,onSelectedChange:a=>{var l;return(l=n.onChange)==null?void 0:l.call(n,a)},isDisabled:()=>r.disabled});return v($r,W({role:"menuitemcheckbox",get checked(){return o.isSelected()},onSelect:()=>{var a;(a=n.onSelect)==null||a.call(n),o.toggle()}},r))}var ru=we();function Pn(){return xe(ru)}var ln={next:(e,t)=>e==="ltr"?t==="horizontal"?"ArrowRight":"ArrowDown":t==="horizontal"?"ArrowLeft":"ArrowUp",previous:(e,t)=>ln.next(e==="ltr"?"rtl":"ltr",t)},ko={first:e=>e==="horizontal"?"ArrowDown":"ArrowRight",last:e=>e==="horizontal"?"ArrowUp":"ArrowLeft"};function Ui(e){const t=et(),n=ht(),r=Pn(),{direction:o}=Ct(),s=X({id:t.generateId("trigger")},e),[a,l]=oe(s,["ref","id","disabled","onPointerDown","onClick","onKeyDown","onMouseOver","onFocus"]);let i=()=>t.value();r!==void 0&&(i=()=>t.value()??a.id,r.lastValue()===void 0&&r.setLastValue(i));const u=Fn(()=>n.triggerRef(),()=>"button"),h=D(()=>{var m;return u()==="a"&&((m=n.triggerRef())==null?void 0:m.getAttribute("href"))!=null});H(dt(()=>r==null?void 0:r.value(),m=>{var p;h()&&m===i()&&((p=n.triggerRef())==null||p.focus())}));const f=()=>{r!==void 0?n.isOpen()?r.value()===i()&&r.closeMenu():(r.autoFocusMenu()||r.setAutoFocusMenu(!0),n.open(!1)):n.toggle(!0)},c=m=>{ue(m,a.onPointerDown),m.currentTarget.dataset.pointerType=m.pointerType,!a.disabled&&m.pointerType!=="touch"&&m.button===0&&f()},g=m=>{ue(m,a.onClick),a.disabled||m.currentTarget.dataset.pointerType==="touch"&&f()},d=m=>{if(ue(m,a.onKeyDown),!a.disabled){if(h())switch(m.key){case"Enter":case" ":return}switch(m.key){case"Enter":case" ":case ko.first(t.orientation()):m.stopPropagation(),m.preventDefault(),ja(m.currentTarget),n.open("first"),r==null||r.setAutoFocusMenu(!0),r==null||r.setValue(i);break;case ko.last(t.orientation()):m.stopPropagation(),m.preventDefault(),n.open("last");break;case ln.next(o(),t.orientation()):if(r===void 0)break;m.stopPropagation(),m.preventDefault(),r.nextMenu();break;case ln.previous(o(),t.orientation()):if(r===void 0)break;m.stopPropagation(),m.preventDefault(),r.previousMenu();break}}},y=m=>{var p;ue(m,a.onMouseOver),((p=n.triggerRef())==null?void 0:p.dataset.pointerType)!=="touch"&&!a.disabled&&r!==void 0&&r.value()!==void 0&&r.setValue(i)},b=m=>{ue(m,a.onFocus),r!==void 0&&m.currentTarget.dataset.pointerType!=="touch"&&r.setValue(i)};return H(()=>G(n.registerTriggerId(a.id))),v(fr,W({ref(m){const p=Ae(n.setTriggerRef,a.ref);typeof p=="function"&&p(m)},get"data-kb-menu-value-trigger"(){return t.value()},get id(){return a.id},get disabled(){return a.disabled},"aria-haspopup":"true",get"aria-expanded"(){return n.isOpen()},get"aria-controls"(){return D(()=>!!n.isOpen())()?n.contentId():void 0},get"data-highlighted"(){return i()!==void 0&&(r==null?void 0:r.value())===i()?!0:void 0},get tabIndex(){return r!==void 0?r.value()===i()||r.lastValue()===i()?0:-1:void 0},onPointerDown:c,onMouseOver:y,onClick:g,onKeyDown:d,onFocus:b,role:r!==void 0?"menuitem":void 0},()=>n.dataset(),l))}var ou=we();function Vi(){return xe(ou)}function Gi(e){let t;const n=et(),r=ht(),o=Pn(),s=Vi(),{direction:a}=Ct(),l=X({id:n.generateId(`content-${Ne()}`)},e),[i,u]=oe(l,["ref","id","style","onOpenAutoFocus","onCloseAutoFocus","onEscapeKeyDown","onFocusOutside","onPointerEnter","onPointerMove","onKeyDown","onMouseDown","onFocusIn","onFocusOut"]);let h=0;const f=()=>r.parentMenuContext()==null&&o===void 0&&n.isModal(),c=Hc({selectionManager:r.listState().selectionManager,collection:r.listState().collection,autoFocus:r.autoFocus,deferAutoFocus:!0,shouldFocusWrap:!0,disallowTypeAhead:()=>!r.listState().selectionManager().isFocused(),orientation:()=>n.orientation()==="horizontal"?"vertical":"horizontal"},()=>t);Uc({trapFocus:()=>f()&&r.isOpen(),onMountAutoFocus:w=>{var x;o===void 0&&((x=i.onOpenAutoFocus)==null||x.call(i,w))},onUnmountAutoFocus:i.onCloseAutoFocus},()=>t);const g=w=>{if(Ke(w.currentTarget,w.target)&&(w.key==="Tab"&&r.isOpen()&&w.preventDefault(),o!==void 0&&w.currentTarget.getAttribute("aria-haspopup")!=="true"))switch(w.key){case ln.next(a(),n.orientation()):w.stopPropagation(),w.preventDefault(),r.close(!0),o.setAutoFocusMenu(!0),o.nextMenu();break;case ln.previous(a(),n.orientation()):if(w.currentTarget.hasAttribute("data-closed"))break;w.stopPropagation(),w.preventDefault(),r.close(!0),o.setAutoFocusMenu(!0),o.previousMenu();break}},d=w=>{var x;(x=i.onEscapeKeyDown)==null||x.call(i,w),o==null||o.setAutoFocusMenu(!1),r.close(!0)},y=w=>{var x;(x=i.onFocusOutside)==null||x.call(i,w),n.isModal()&&w.preventDefault()},b=w=>{var x,$;ue(w,i.onPointerEnter),r.isOpen()&&((x=r.parentMenuContext())==null||x.listState().selectionManager().setFocused(!1),($=r.parentMenuContext())==null||$.listState().selectionManager().setFocusedKey(void 0))},m=w=>{if(ue(w,i.onPointerMove),w.pointerType!=="mouse")return;const x=w.target,$=h!==w.clientX;Ke(w.currentTarget,x)&&$&&(r.setPointerDir(w.clientX>h?"right":"left"),h=w.clientX)};H(()=>G(r.registerContentId(i.id)));const p={ref:Ae(w=>{r.setContentRef(w),t=w},i.ref),role:"menu",get id(){return i.id},get tabIndex(){return c.tabIndex()},get"aria-labelledby"(){return r.triggerId()},onKeyDown:pe([i.onKeyDown,c.onKeyDown,g]),onMouseDown:pe([i.onMouseDown,c.onMouseDown]),onFocusIn:pe([i.onFocusIn,c.onFocusIn]),onFocusOut:pe([i.onFocusOut,c.onFocusOut]),onPointerEnter:b,onPointerMove:m,get"data-orientation"(){return n.orientation()}};return v(B,{get when(){return r.contentPresent()},get children(){return v(B,{get when(){return s===void 0||r.parentMenuContext()!=null},get fallback(){return v(de,W({as:"div"},()=>r.dataset(),p,u))},get children(){return v(ki.Positioner,{get children(){return v(Kc,W({get disableOutsidePointerEvents(){return D(()=>!!f())()&&r.isOpen()},get excludedElements(){return[r.triggerRef]},bypassTopMostLayerCheck:!0,get style(){return Mn({"--kb-menu-content-transform-origin":"var(--kb-popper-content-transform-origin)",position:"relative"},i.style)},onEscapeKeyDown:d,onFocusOutside:y,get onDismiss(){return r.close}},()=>r.dataset(),p,u))}})}})}})}function iu(e){let t;const n=et(),r=ht(),[o,s]=oe(e,["ref"]);return nu({element:()=>t??null,enabled:()=>r.contentPresent()&&n.preventScroll()}),v(Gi,W({ref(a){const l=Ae(i=>{t=i},o.ref);typeof l=="function"&&l(a)}},s))}var ji=we();function su(){const e=xe(ji);if(e===void 0)throw new Error("[kobalte]: `useMenuGroupContext` must be used within a `Menu.Group` component");return e}function Cr(e){const t=et(),n=X({id:t.generateId(`group-${Ne()}`)},e),[r,o]=z(),s={generateId:cn(()=>n.id),registerLabelId:Be(o)};return v(ji.Provider,{value:s,get children(){return v(de,W({as:"div",role:"group",get"aria-labelledby"(){return r()}},n))}})}function Wi(e){const t=su(),n=X({id:t.generateId("label")},e),[r,o]=oe(n,["id"]);return H(()=>G(t.registerLabelId(r.id))),v(de,W({as:"span",get id(){return r.id},"aria-hidden":"true"},o))}function Qi(e){const t=ht(),n=X({children:"▼"},e);return v(de,W({as:"span","aria-hidden":"true"},()=>t.dataset(),n))}function Yi(e){return v($r,W({role:"menuitem",closeOnSelect:!0},e))}function Xi(e){const t=xr(),n=X({id:t.generateId("description")},e),[r,o]=oe(n,["id"]);return H(()=>G(t.registerDescription(r.id))),v(de,W({as:"div",get id(){return r.id}},()=>t.dataset(),o))}function Zi(e){const t=xr(),n=X({id:t.generateId("indicator")},e),[r,o]=oe(n,["forceMount"]);return v(B,{get when(){return r.forceMount||t.isChecked()},get children(){return v(de,W({as:"div"},()=>t.dataset(),o))}})}function Ji(e){const t=xr(),n=X({id:t.generateId("label")},e),[r,o]=oe(n,["ref","id"]);return H(()=>G(t.registerLabel(r.id))),v(de,W({as:"div",ref(s){const a=Ae(t.setLabelRef,r.ref);typeof a=="function"&&a(s)},get id(){return r.id}},()=>t.dataset(),o))}function es(e){const t=ht();return v(B,{get when(){return t.contentPresent()},get children(){return v(Po,e)}})}var ts=we();function au(){const e=xe(ts);if(e===void 0)throw new Error("[kobalte]: `useMenuRadioGroupContext` must be used within a `Menu.RadioGroup` component");return e}function ns(e){const n=et().generateId(`radiogroup-${Ne()}`),r=X({id:n},e),[o,s]=oe(r,["value","defaultValue","onChange","disabled"]),[a,l]=dn({value:()=>o.value,defaultValue:()=>o.defaultValue,onChange:u=>{var h;return(h=o.onChange)==null?void 0:h.call(o,u)}}),i={isDisabled:()=>o.disabled,isSelectedValue:u=>u===a(),setSelectedValue:l};return v(ts.Provider,{value:i,get children(){return v(Cr,s)}})}function rs(e){const t=au(),n=X({closeOnSelect:!1},e),[r,o]=oe(n,["value","onSelect"]);return v($r,W({role:"menuitemradio",get checked(){return t.isSelectedValue(r.value)},onSelect:()=>{var a;(a=r.onSelect)==null||a.call(r),t.setSelectedValue(r.value)}},o))}function lu(e,t,n){const r=e.split("-")[0],o=n.getBoundingClientRect(),s=[],a=t.clientX,l=t.clientY;switch(r){case"top":s.push([a,l+5]),s.push([o.left,o.bottom]),s.push([o.left,o.top]),s.push([o.right,o.top]),s.push([o.right,o.bottom]);break;case"right":s.push([a-5,l]),s.push([o.left,o.top]),s.push([o.right,o.top]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]);break;case"bottom":s.push([a,l-5]),s.push([o.right,o.top]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]),s.push([o.left,o.top]);break;case"left":s.push([a+5,l]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]),s.push([o.left,o.top]),s.push([o.right,o.top]);break}return s}function cu(e,t){return t?Ga([e.clientX,e.clientY],t):!1}function os(e){const t=et(),n=ri(),r=Ki(),o=Pn(),s=Vi(),a=X({placement:t.orientation()==="horizontal"?"bottom-start":"right-start"},e),[l,i]=oe(a,["open","defaultOpen","onOpenChange"]);let u=0,h=null,f="right";const[c,g]=z(),[d,y]=z(),[b,m]=z(),[p,w]=z(),[x,$]=z(!0),[P,I]=z(i.placement),[_,C]=z([]),[T,K]=z([]),{DomCollectionProvider:U}=cl({items:T,onItemsChange:K}),ne=Di({open:()=>l.open,defaultOpen:()=>l.defaultOpen,onOpenChange:j=>{var Ce;return(Ce=l.onOpenChange)==null?void 0:Ce.call(l,j)}}),{present:Z}=di({show:()=>t.forceMount()||ne.isOpen(),element:()=>p()??null}),se=Dl({selectionMode:"none",dataSource:T}),R=j=>{$(j),ne.open()},Q=(j=!1)=>{ne.close(),j&&r&&r.close(!0)},J=j=>{$(j),ne.toggle()},le=()=>{const j=p();j&&(Ee(j),se.selectionManager().setFocused(!0),se.selectionManager().setFocusedKey(void 0))},ye=()=>{s!=null?setTimeout(()=>le()):le()},Me=j=>{C(Se=>[...Se,j]);const Ce=r==null?void 0:r.registerNestedMenu(j);return()=>{C(Se=>Yn(Se,j)),Ce==null||Ce()}},ge=j=>f===(h==null?void 0:h.side)&&cu(j,h==null?void 0:h.area),De=j=>{ge(j)&&j.preventDefault()},A=j=>{ge(j)||ye()},fe=j=>{ge(j)&&j.preventDefault()};Gc({isDisabled:()=>!(r==null&&ne.isOpen()&&t.isModal()),targets:()=>[p(),..._()].filter(Boolean)}),H(()=>{const j=p();if(!j||!r)return;const Ce=r.registerNestedMenu(j);G(()=>{Ce()})}),H(()=>{r===void 0&&(o==null||o.registerMenu(t.value(),[p(),..._()]))}),H(()=>{var j;r!==void 0||o===void 0||(o.value()===t.value()?((j=b())==null||j.focus(),o.autoFocusMenu()&&R(!0)):Q())}),H(()=>{r!==void 0||o===void 0||ne.isOpen()&&o.setValue(t.value())}),G(()=>{r===void 0&&(o==null||o.unregisterMenu(t.value()))});const yt={dataset:D(()=>({"data-expanded":ne.isOpen()?"":void 0,"data-closed":ne.isOpen()?void 0:""})),isOpen:ne.isOpen,contentPresent:Z,nestedMenus:_,currentPlacement:P,pointerGraceTimeoutId:()=>u,autoFocus:x,listState:()=>se,parentMenuContext:()=>r,triggerRef:b,contentRef:p,triggerId:c,contentId:d,setTriggerRef:m,setContentRef:w,open:R,close:Q,toggle:J,focusContent:ye,onItemEnter:De,onItemLeave:A,onTriggerLeave:fe,setPointerDir:j=>f=j,setPointerGraceTimeoutId:j=>u=j,setPointerGraceIntent:j=>h=j,registerNestedMenu:Me,registerItemToParentDomCollection:n==null?void 0:n.registerItem,registerTriggerId:Be(g),registerContentId:Be(y)};return v(U,{get children(){return v(zi.Provider,{value:yt,get children(){return v(B,{when:s===void 0,get fallback(){return i.children},get children(){return v(ki,W({anchorRef:b,contentRef:p,onCurrentPlacementChange:I},i))}})}})}})}function is(e){const{direction:t}=Ct();return v(os,W({get placement(){return t()==="rtl"?"left-start":"right-start"},flip:!0},e))}var uu={close:(e,t)=>e==="ltr"?[t==="horizontal"?"ArrowLeft":"ArrowUp"]:[t==="horizontal"?"ArrowRight":"ArrowDown"]};function ss(e){const t=ht(),n=et(),[r,o]=oe(e,["onFocusOutside","onKeyDown"]),{direction:s}=Ct();return v(Gi,W({onOpenAutoFocus:h=>{h.preventDefault()},onCloseAutoFocus:h=>{h.preventDefault()},onFocusOutside:h=>{var c;(c=r.onFocusOutside)==null||c.call(r,h);const f=h.target;Ke(t.triggerRef(),f)||t.close()},onKeyDown:h=>{ue(h,r.onKeyDown);const f=Ke(h.currentTarget,h.target),c=uu.close(s(),n.orientation()).includes(h.key),g=t.parentMenuContext()!=null;f&&c&&g&&(t.close(),Ee(t.triggerRef()))}},o))}var Eo=["Enter"," "],du={open:(e,t)=>e==="ltr"?[...Eo,t==="horizontal"?"ArrowRight":"ArrowDown"]:[...Eo,t==="horizontal"?"ArrowLeft":"ArrowUp"]};function as(e){let t;const n=et(),r=ht(),o=X({id:n.generateId(`sub-trigger-${Ne()}`)},e),[s,a]=oe(o,["ref","id","textValue","disabled","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]);let l=null;const i=()=>{l&&window.clearTimeout(l),l=null},{direction:u}=Ct(),h=()=>s.id,f=()=>{const w=r.parentMenuContext();if(w==null)throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");return w.listState().selectionManager()},c=()=>r.listState().collection(),g=()=>f().focusedKey()===h(),d=ui({key:h,selectionManager:f,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>s.disabled},()=>t),y=w=>{ue(w,s.onClick),!r.isOpen()&&!s.disabled&&r.open(!0)},b=w=>{var $;if(ue(w,s.onPointerMove),w.pointerType!=="mouse")return;const x=r.parentMenuContext();if(x==null||x.onItemEnter(w),!w.defaultPrevented){if(s.disabled){x==null||x.onItemLeave(w);return}!r.isOpen()&&!l&&(($=r.parentMenuContext())==null||$.setPointerGraceIntent(null),l=window.setTimeout(()=>{r.open(!1),i()},100)),x==null||x.onItemEnter(w),w.defaultPrevented||(r.listState().selectionManager().isFocused()&&(r.listState().selectionManager().setFocused(!1),r.listState().selectionManager().setFocusedKey(void 0)),Ee(w.currentTarget),x==null||x.listState().selectionManager().setFocused(!0),x==null||x.listState().selectionManager().setFocusedKey(h()))}},m=w=>{if(ue(w,s.onPointerLeave),w.pointerType!=="mouse")return;i();const x=r.parentMenuContext(),$=r.contentRef();if($){x==null||x.setPointerGraceIntent({area:lu(r.currentPlacement(),w,$),side:r.currentPlacement().split("-")[0]}),window.clearTimeout(x==null?void 0:x.pointerGraceTimeoutId());const P=window.setTimeout(()=>{x==null||x.setPointerGraceIntent(null)},300);x==null||x.setPointerGraceTimeoutId(P)}else{if(x==null||x.onTriggerLeave(w),w.defaultPrevented)return;x==null||x.setPointerGraceIntent(null)}x==null||x.onItemLeave(w)},p=w=>{ue(w,s.onKeyDown),!w.repeat&&(s.disabled||du.open(u(),n.orientation()).includes(w.key)&&(w.stopPropagation(),w.preventDefault(),f().setFocused(!1),f().setFocusedKey(void 0),r.isOpen()||r.open("first"),r.focusContent(),r.listState().selectionManager().setFocused(!0),r.listState().selectionManager().setFocusedKey(c().getFirstKey())))};return H(()=>{if(r.registerItemToParentDomCollection==null)throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");const w=r.registerItemToParentDomCollection({ref:()=>t,type:"item",key:h(),textValue:s.textValue??(t==null?void 0:t.textContent)??"",disabled:s.disabled??!1});G(w)}),H(dt(()=>{var w;return(w=r.parentMenuContext())==null?void 0:w.pointerGraceTimeoutId()},w=>{G(()=>{var x;window.clearTimeout(w),(x=r.parentMenuContext())==null||x.setPointerGraceIntent(null)})})),H(()=>G(r.registerTriggerId(s.id))),G(()=>{i()}),v(de,W({as:"div",ref(w){const x=Ae($=>{r.setTriggerRef($),t=$},s.ref);typeof x=="function"&&x(w)},get id(){return s.id},role:"menuitem",get tabIndex(){return d.tabIndex()},"aria-haspopup":"true",get"aria-expanded"(){return r.isOpen()},get"aria-controls"(){return D(()=>!!r.isOpen())()?r.contentId():void 0},get"aria-disabled"(){return s.disabled},get"data-key"(){return d.dataKey()},get"data-highlighted"(){return g()?"":void 0},get"data-disabled"(){return s.disabled?"":void 0},get onPointerDown(){return pe([s.onPointerDown,d.onPointerDown])},get onPointerUp(){return pe([s.onPointerUp,d.onPointerUp])},get onClick(){return pe([y,d.onClick])},get onKeyDown(){return pe([p,d.onKeyDown])},get onMouseDown(){return pe([s.onMouseDown,d.onMouseDown])},get onFocus(){return pe([s.onFocus,d.onFocus])},onPointerMove:b,onPointerLeave:m},()=>r.dataset(),a))}function fu(e){const t=Pn(),n=`menu-${Ne()}`,r=X({id:n,modal:!0},e),[o,s]=oe(r,["id","modal","preventScroll","forceMount","open","defaultOpen","onOpenChange","value","orientation"]),a=Di({open:()=>o.open,defaultOpen:()=>o.defaultOpen,onOpenChange:i=>{var u;return(u=o.onOpenChange)==null?void 0:u.call(o,i)}}),l={isModal:()=>o.modal??!0,preventScroll:()=>o.preventScroll??l.isModal(),forceMount:()=>o.forceMount??!1,generateId:cn(()=>o.id),value:()=>o.value,orientation:()=>o.orientation??(t==null?void 0:t.orientation())??"horizontal"};return v(Ni.Provider,{value:l,get children(){return v(os,W({get open(){return a.isOpen()},get onOpenChange(){return a.setIsOpen}},s))}})}var gu={};In(gu,{Root:()=>qn,Separator:()=>hu});function qn(e){let t;const n=X({orientation:"horizontal"},e),[r,o]=oe(n,["ref","orientation"]),s=Fn(()=>t,()=>"hr");return v(de,W({as:"hr",ref(a){const l=Ae(i=>t=i,r.ref);typeof l=="function"&&l(a)},get role(){return s()!=="hr"?"separator":void 0},get"aria-orientation"(){return r.orientation==="vertical"?"vertical":void 0},get"data-orientation"(){return r.orientation}},o))}var hu=qn,he={};In(he,{Arrow:()=>wr,CheckboxItem:()=>Hi,Content:()=>ls,DropdownMenu:()=>yu,Group:()=>Cr,GroupLabel:()=>Wi,Icon:()=>Qi,Item:()=>Yi,ItemDescription:()=>Xi,ItemIndicator:()=>Zi,ItemLabel:()=>Ji,Portal:()=>es,RadioGroup:()=>ns,RadioItem:()=>rs,Root:()=>cs,Separator:()=>qn,Sub:()=>is,SubContent:()=>ss,SubTrigger:()=>as,Trigger:()=>Ui});function ls(e){const t=et(),n=ht(),[r,o]=oe(e,["onCloseAutoFocus","onInteractOutside"]);let s=!1;return v(iu,W({onCloseAutoFocus:i=>{var u;(u=r.onCloseAutoFocus)==null||u.call(r,i),s||Ee(n.triggerRef()),s=!1,i.preventDefault()},onInteractOutside:i=>{var u;(u=r.onInteractOutside)==null||u.call(r,i),(!t.isModal()||i.detail.isContextMenu)&&(s=!0)}},o))}function cs(e){const t=`dropdownmenu-${Ne()}`,n=X({id:t},e);return v(fu,n)}var yu=Object.assign(cs,{Arrow:wr,CheckboxItem:Hi,Content:ls,Group:Cr,GroupLabel:Wi,Icon:Qi,Item:Yi,ItemDescription:Xi,ItemIndicator:Zi,ItemLabel:Ji,Portal:es,RadioGroup:ns,RadioItem:rs,Separator:qn,Sub:is,SubContent:ss,SubTrigger:as,Trigger:Ui}),S={colors:{inherit:"inherit",current:"currentColor",transparent:"transparent",black:"#000000",white:"#ffffff",neutral:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},darkGray:{50:"#525c7a",100:"#49536e",200:"#414962",300:"#394056",400:"#313749",500:"#292e3d",600:"#212530",700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},blue:{25:"#F5FAFF",50:"#EFF8FF",100:"#D1E9FF",200:"#B2DDFF",300:"#84CAFF",400:"#53B1FD",500:"#2E90FA",600:"#1570EF",700:"#175CD3",800:"#1849A9",900:"#194185"},green:{25:"#F6FEF9",50:"#ECFDF3",100:"#D1FADF",200:"#A6F4C5",300:"#6CE9A6",400:"#32D583",500:"#12B76A",600:"#039855",700:"#027A48",800:"#05603A",900:"#054F31"},red:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"},yellow:{25:"#FFFCF5",50:"#FFFAEB",100:"#FEF0C7",200:"#FEDF89",300:"#FEC84B",400:"#FDB022",500:"#F79009",600:"#DC6803",700:"#B54708",800:"#93370D",900:"#7A2E0E"},purple:{25:"#FAFAFF",50:"#F4F3FF",100:"#EBE9FE",200:"#D9D6FE",300:"#BDB4FE",400:"#9B8AFB",500:"#7A5AF8",600:"#6938EF",700:"#5925DC",800:"#4A1FB8",900:"#3E1C96"},teal:{25:"#F6FEFC",50:"#F0FDF9",100:"#CCFBEF",200:"#99F6E0",300:"#5FE9D0",400:"#2ED3B7",500:"#15B79E",600:"#0E9384",700:"#107569",800:"#125D56",900:"#134E48"},pink:{25:"#fdf2f8",50:"#fce7f3",100:"#fbcfe8",200:"#f9a8d4",300:"#f472b6",400:"#ec4899",500:"#db2777",600:"#be185d",700:"#9d174d",800:"#831843",900:"#500724"},cyan:{25:"#ecfeff",50:"#cffafe",100:"#a5f3fc",200:"#67e8f9",300:"#22d3ee",400:"#06b6d4",500:"#0891b2",600:"#0e7490",700:"#155e75",800:"#164e63",900:"#083344"}},alpha:{90:"e5",80:"cc"},font:{size:{xs:"calc(var(--tsqd-font-size) * 0.75)",sm:"calc(var(--tsqd-font-size) * 0.875)",md:"var(--tsqd-font-size)"},lineHeight:{xs:"calc(var(--tsqd-font-size) * 1)",sm:"calc(var(--tsqd-font-size) * 1.25)",md:"calc(var(--tsqd-font-size) * 1.5)"},weight:{medium:"500",semibold:"600",bold:"700"}},border:{radius:{xs:"calc(var(--tsqd-font-size) * 0.125)",sm:"calc(var(--tsqd-font-size) * 0.25)",full:"9999px"}},size:{.25:"calc(var(--tsqd-font-size) * 0.0625)",.5:"calc(var(--tsqd-font-size) * 0.125)",1:"calc(var(--tsqd-font-size) * 0.25)",1.5:"calc(var(--tsqd-font-size) * 0.375)",2:"calc(var(--tsqd-font-size) * 0.5)",2.5:"calc(var(--tsqd-font-size) * 0.625)",3:"calc(var(--tsqd-font-size) * 0.75)",3.5:"calc(var(--tsqd-font-size) * 0.875)",4:"calc(var(--tsqd-font-size) * 1)",4.5:"calc(var(--tsqd-font-size) * 1.125)",5:"calc(var(--tsqd-font-size) * 1.25)",6:"calc(var(--tsqd-font-size) * 1.5)",6.5:"calc(var(--tsqd-font-size) * 1.625)",14:"calc(var(--tsqd-font-size) * 3.5)"},shadow:{xs:(e="rgb(0 0 0 / 0.1)")=>"0 1px 2px 0 rgb(0 0 0 / 0.05)",sm:(e="rgb(0 0 0 / 0.1)")=>`0 1px 3px 0 ${e}, 0 1px 2px -1px ${e}`,md:(e="rgb(0 0 0 / 0.1)")=>`0 4px 6px -1px ${e}, 0 2px 4px -2px ${e}`,lg:(e="rgb(0 0 0 / 0.1)")=>`0 10px 15px -3px ${e}, 0 4px 6px -4px ${e}`,xl:(e="rgb(0 0 0 / 0.1)")=>`0 20px 25px -5px ${e}, 0 8px 10px -6px ${e}`,"2xl":(e="rgb(0 0 0 / 0.25)")=>`0 25px 50px -12px ${e}`,inner:(e="rgb(0 0 0 / 0.05)")=>`inset 0 2px 4px 0 ${e}`,none:()=>"none"}},vu=q('<svg width=14 height=14 viewBox="0 0 14 14"fill=none xmlns=http://www.w3.org/2000/svg><path d="M13 13L9.00007 9M10.3333 5.66667C10.3333 8.244 8.244 10.3333 5.66667 10.3333C3.08934 10.3333 1 8.244 1 5.66667C1 3.08934 3.08934 1 5.66667 1C8.244 1 10.3333 3.08934 10.3333 5.66667Z"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),mu=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),bu=q('<svg width=10 height=6 viewBox="0 0 10 6"fill=none xmlns=http://www.w3.org/2000/svg><path d="M1 1L5 5L9 1"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),pu=q('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 13.3333V2.66667M8 2.66667L4 6.66667M8 2.66667L12 6.66667"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),Sr=q('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 2.66667V13.3333M8 13.3333L4 9.33333M8 13.3333L12 9.33333"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),wu=q('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2v2m0 16v2M4 12H2m4.314-5.686L4.9 4.9m12.786 1.414L19.1 4.9M6.314 17.69 4.9 19.104m12.786-1.414 1.414 1.414M22 12h-2m-3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),xu=q('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M22 15.844a10.424 10.424 0 0 1-4.306.925c-5.779 0-10.463-4.684-10.463-10.462 0-1.536.33-2.994.925-4.307A10.464 10.464 0 0 0 2 11.538C2 17.316 6.684 22 12.462 22c4.243 0 7.896-2.526 9.538-6.156Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),$u=q('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 3 18.88 3 17.2 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 5.28 2 6.12 2 7.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Cu=q('<svg stroke=currentColor fill=currentColor stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M0 0h24v24H0z"></path><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z">'),Su=q('<svg stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M24 .01c0-.01 0-.01 0 0L0 0v24h24V.01zM0 0h24v24H0V0zm0 0h24v24H0V0z"></path><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7l2-2zm-4 4a9.793 9.793 0 00-4.49-2.56l3.53 3.53.96-.97zM2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24A9.684 9.684 0 005 13v.01L6.99 15a7.042 7.042 0 014.92-2.06L18.98 20l1.27-1.26L3.29 1.79 2 3.05zM9 17l3 3 3-3a4.237 4.237 0 00-6 0z">'),ku=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.3951 19.3711L9.97955 20.6856C10.1533 21.0768 10.4368 21.4093 10.7958 21.6426C11.1547 21.8759 11.5737 22.0001 12.0018 22C12.4299 22.0001 12.8488 21.8759 13.2078 21.6426C13.5667 21.4093 13.8503 21.0768 14.024 20.6856L14.6084 19.3711C14.8165 18.9047 15.1664 18.5159 15.6084 18.26C16.0532 18.0034 16.5678 17.8941 17.0784 17.9478L18.5084 18.1C18.9341 18.145 19.3637 18.0656 19.7451 17.8713C20.1265 17.6771 20.4434 17.3763 20.6573 17.0056C20.8715 16.635 20.9735 16.2103 20.9511 15.7829C20.9286 15.3555 20.7825 14.9438 20.5307 14.5978L19.684 13.4344C19.3825 13.0171 19.2214 12.5148 19.224 12C19.2239 11.4866 19.3865 10.9864 19.6884 10.5711L20.5351 9.40778C20.787 9.06175 20.933 8.65007 20.9555 8.22267C20.978 7.79528 20.8759 7.37054 20.6618 7C20.4479 6.62923 20.131 6.32849 19.7496 6.13423C19.3681 5.93997 18.9386 5.86053 18.5129 5.90556L17.0829 6.05778C16.5722 6.11141 16.0577 6.00212 15.6129 5.74556C15.17 5.48825 14.82 5.09736 14.6129 4.62889L14.024 3.31444C13.8503 2.92317 13.5667 2.59072 13.2078 2.3574C12.8488 2.12408 12.4299 1.99993 12.0018 2C11.5737 1.99993 11.1547 2.12408 10.7958 2.3574C10.4368 2.59072 10.1533 2.92317 9.97955 3.31444L9.3951 4.62889C9.18803 5.09736 8.83798 5.48825 8.3951 5.74556C7.95032 6.00212 7.43577 6.11141 6.9251 6.05778L5.49066 5.90556C5.06499 5.86053 4.6354 5.93997 4.25397 6.13423C3.87255 6.32849 3.55567 6.62923 3.34177 7C3.12759 7.37054 3.02555 7.79528 3.04804 8.22267C3.07052 8.65007 3.21656 9.06175 3.46844 9.40778L4.3151 10.5711C4.61704 10.9864 4.77964 11.4866 4.77955 12C4.77964 12.5134 4.61704 13.0137 4.3151 13.4289L3.46844 14.5922C3.21656 14.9382 3.07052 15.3499 3.04804 15.7773C3.02555 16.2047 3.12759 16.6295 3.34177 17C3.55589 17.3706 3.8728 17.6712 4.25417 17.8654C4.63554 18.0596 5.06502 18.1392 5.49066 18.0944L6.92066 17.9422C7.43133 17.8886 7.94587 17.9979 8.39066 18.2544C8.83519 18.511 9.18687 18.902 9.3951 19.3711Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><path d="M12 15C13.6568 15 15 13.6569 15 12C15 10.3431 13.6568 9 12 9C10.3431 9 8.99998 10.3431 8.99998 12C8.99998 13.6569 10.3431 15 12 15Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Eu=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M16 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M11.5 12.5L17 7M17 7H12M17 7V12M6.2 21H8.8C9.9201 21 10.4802 21 10.908 20.782C11.2843 20.5903 11.5903 20.2843 11.782 19.908C12 19.4802 12 18.9201 12 17.8V15.2C12 14.0799 12 13.5198 11.782 13.092C11.5903 12.7157 11.2843 12.4097 10.908 12.218C10.4802 12 9.92011 12 8.8 12H6.2C5.0799 12 4.51984 12 4.09202 12.218C3.71569 12.4097 3.40973 12.7157 3.21799 13.092C3 13.5198 3 14.0799 3 15.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Du=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path class=copier d="M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round stroke=currentColor>'),Au=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M2.5 21.4998L8.04927 19.3655C8.40421 19.229 8.58168 19.1607 8.74772 19.0716C8.8952 18.9924 9.0358 18.901 9.16804 18.7984C9.31692 18.6829 9.45137 18.5484 9.72028 18.2795L21 6.99982C22.1046 5.89525 22.1046 4.10438 21 2.99981C19.8955 1.89525 18.1046 1.89524 17 2.99981L5.72028 14.2795C5.45138 14.5484 5.31692 14.6829 5.20139 14.8318C5.09877 14.964 5.0074 15.1046 4.92823 15.2521C4.83911 15.4181 4.77085 15.5956 4.63433 15.9506L2.5 21.4998ZM2.5 21.4998L4.55812 16.1488C4.7054 15.7659 4.77903 15.5744 4.90534 15.4867C5.01572 15.4101 5.1523 15.3811 5.2843 15.4063C5.43533 15.4351 5.58038 15.5802 5.87048 15.8703L8.12957 18.1294C8.41967 18.4195 8.56472 18.5645 8.59356 18.7155C8.61877 18.8475 8.58979 18.9841 8.51314 19.0945C8.42545 19.2208 8.23399 19.2944 7.85107 19.4417L2.5 21.4998Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),us=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Mu=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke=#F04438 stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Tu=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 xmlns=http://www.w3.org/2000/svg><rect class=list width=20 height=20 y=2 x=2 rx=2></rect><line class=list-item y1=7 y2=7 x1=6 x2=18></line><line class=list-item y2=12 y1=12 x1=6 x2=18></line><line class=list-item y1=17 y2=17 x1=6 x2=18>'),Fu=q('<svg viewBox="0 0 24 24"height=20 width=20 fill=none xmlns=http://www.w3.org/2000/svg><path d="M3 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Iu=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Ou=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><animateTransform attributeName=transform attributeType=XML type=rotate from=0 to=360 dur=2s repeatCount=indefinite>'),Lu=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Pu=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.5 15V9M14.5 15V9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),qu=q('<svg version=1.0 viewBox="0 0 633 633"><linearGradient x1=-666.45 x2=-666.45 y1=163.28 y2=163.99 gradientTransform="matrix(633 0 0 633 422177 -103358)"gradientUnits=userSpaceOnUse><stop stop-color=#6BDAFF offset=0></stop><stop stop-color=#F9FFB5 offset=.32></stop><stop stop-color=#FFA770 offset=.71></stop><stop stop-color=#FF7373 offset=1></stop></linearGradient><circle cx=316.5 cy=316.5 r=316.5></circle><defs><filter x=-137.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=316.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=316.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=316.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=272.2 y=308 width=176.9 height=129.3 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=272.2 y=308 width=176.9 height=129.3 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><line x1=436 x2=431 y1=403.2 y2=431.8 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=291 x2=280 y1=341.5 y2=403.5 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=332.9 x2=328.6 y1=384.1 y2=411.2 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><linearGradient x1=-670.75 x2=-671.59 y1=164.4 y2=164.49 gradientTransform="matrix(-184.16 -32.472 -11.461 64.997 -121359 -32126)"gradientUnits=userSpaceOnUse><stop stop-color=#EE2700 offset=0></stop><stop stop-color=#FF008E offset=1></stop></linearGradient><path d="m344.1 363 97.7 17.2c5.8 2.1 8.2 6.1 7.1 12.1s-4.7 9.2-11 9.9l-106-18.7-57.5-59.2c-3.2-4.8-2.9-9.1 0.8-12.8s8.3-4.4 13.7-2.1l55.2 53.6z"clip-rule=evenodd fill-rule=evenodd></path><line x1=428.2 x2=429.1 y1=384.5 y2=378 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=395.2 x2=396.1 y1=379.5 y2=373 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=362.2 x2=363.1 y1=373.5 y2=367.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=324.2 x2=328.4 y1=351.3 y2=347.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=303.2 x2=307.4 y1=331.3 y2=327.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line></g><defs><filter x=73.2 y=113.8 width=280.6 height=317.4 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=73.2 y=113.8 width=280.6 height=317.4 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-672.16 x2=-672.16 y1=165.03 y2=166.03 gradientTransform="matrix(-100.18 48.861 97.976 200.88 -83342 -93.059)"gradientUnits=userSpaceOnUse><stop stop-color=#A17500 offset=0></stop><stop stop-color=#5D2100 offset=1></stop></linearGradient><path d="m192.3 203c8.1 37.3 14 73.6 17.8 109.1 3.8 35.4 2.8 75.1-3 119.2l61.2-16.7c-15.6-59-25.2-97.9-28.6-116.6s-10.8-51.9-22.1-99.6l-25.3 4.6"clip-rule=evenodd fill-rule=evenodd></path><g stroke=#2F8A00><linearGradient x1=-660.23 x2=-660.23 y1=166.72 y2=167.72 gradientTransform="matrix(92.683 4.8573 -2.0259 38.657 61680 -3088.6)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9s-12.6-22.1-36.5-29.9c-15.9-5.2-34.4-1.5-55.5 11.1 15.9 14.3 29.5 22.6 40.7 24.9 16.8 3.6 51.3-6.1 51.3-6.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-661.36 x2=-661.36 y1=164.18 y2=165.18 gradientTransform="matrix(110 5.7648 -6.3599 121.35 73933 -15933)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5s-47.5-8.5-83.2 15.7c-23.8 16.2-34.3 49.3-31.6 99.4 30.3-27.8 52.1-48.5 65.2-61.9 19.8-20.2 49.6-53.2 49.6-53.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.79 x2=-656.79 y1=165.15 y2=166.15 gradientTransform="matrix(62.954 3.2993 -3.5023 66.828 42156 -8754.1)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9c-0.8-21.9 6-38 20.6-48.2s29.8-15.4 45.5-15.3c-6.1 21.4-14.5 35.8-25.2 43.4s-24.4 14.2-40.9 20.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-663.07 x2=-663.07 y1=165.44 y2=166.44 gradientTransform="matrix(152.47 7.9907 -3.0936 59.029 101884 -4318.7)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c31.9-30 64.1-39.7 96.7-29s50.8 30.4 54.6 59.1c-35.2-5.5-60.4-9.6-75.8-12.1-15.3-2.6-40.5-8.6-75.5-18z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-662.57 x2=-662.57 y1=164.44 y2=165.44 gradientTransform="matrix(136.46 7.1517 -5.2163 99.533 91536 -11442)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c35.8-7.6 65.6-0.2 89.2 22s37.7 49 42.3 80.3c-39.8-9.7-68.3-23.8-85.5-42.4s-32.5-38.5-46-59.9z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.43 x2=-656.43 y1=163.86 y2=164.86 gradientTransform="matrix(60.866 3.1899 -8.7773 167.48 41560 -25168)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c-33.6 13.8-53.6 35.7-60.1 65.6s-3.6 63.1 8.7 99.6c27.4-40.3 43.2-69.6 47.4-88s5.6-44.1 4-77.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><path d="m196.5 182.3c-14.8 21.6-25.1 41.4-30.8 59.4s-9.5 33-11.1 45.1"fill=none stroke-linecap=round stroke-width=8></path><path d="m194.9 185.7c-24.4 1.7-43.8 9-58.1 21.8s-24.7 25.4-31.3 37.8"fill=none stroke-linecap=round stroke-width=8></path><path d="m204.5 176.4c29.7-6.7 52-8.4 67-5.1s26.9 8.6 35.8 15.9"fill=none stroke-linecap=round stroke-width=8></path><path d="m196.5 181.4c20.3 9.9 38.2 20.5 53.9 31.9s27.4 22.1 35.1 32"fill=none stroke-linecap=round stroke-width=8></path></g></g><defs><filter x=50.5 y=399 width=532 height=633 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=50.5 y=399 width=532 height=633 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-666.06 x2=-666.23 y1=163.36 y2=163.75 gradientTransform="matrix(532 0 0 633 354760 -102959)"gradientUnits=userSpaceOnUse><stop stop-color=#FFF400 offset=0></stop><stop stop-color=#3C8700 offset=1></stop></linearGradient><ellipse cx=316.5 cy=715.5 rx=266 ry=316.5></ellipse></g><defs><filter x=391 y=-24 width=288 height=283 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=391 y=-24 width=288 height=283 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-664.56 x2=-664.56 y1=163.79 y2=164.79 gradientTransform="matrix(227 0 0 227 151421 -37204)"gradientUnits=userSpaceOnUse><stop stop-color=#FFDF00 offset=0></stop><stop stop-color=#FF9D00 offset=1></stop></linearGradient><circle cx=565.5 cy=89.5 r=113.5></circle><linearGradient x1=-644.5 x2=-645.77 y1=342 y2=342 gradientTransform="matrix(30 0 0 1 19770 -253)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=427 x2=397 y1=89 y2=89 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-641.56 x2=-642.83 y1=196.02 y2=196.07 gradientTransform="matrix(26.5 0 0 5.5 17439 -1025.5)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=430.5 x2=404 y1=55.5 y2=50 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-643.73 x2=-645 y1=185.83 y2=185.9 gradientTransform="matrix(29 0 0 8 19107 -1361)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=431 x2=402 y1=122 y2=130 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-638.94 x2=-640.22 y1=177.09 y2=177.39 gradientTransform="matrix(24 0 0 13 15783 -2145)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=442 x2=418 y1=153 y2=166 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-633.42 x2=-634.7 y1=172.41 y2=173.31 gradientTransform="matrix(20 0 0 19 13137 -3096)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=464 x2=444 y1=180 y2=199 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-619.05 x2=-619.52 y1=170.82 y2=171.82 gradientTransform="matrix(13.83 0 0 22.85 9050 -3703.4)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=491.4 x2=477.5 y1=203 y2=225.9 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-578.5 x2=-578.63 y1=170.31 y2=171.31 gradientTransform="matrix(7.5 0 0 24.5 4860 -3953)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=524.5 x2=517 y1=219.5 y2=244 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=666.5 x2=666.5 y1=170.31 y2=171.31 gradientTransform="matrix(.5 0 0 24.5 231.5 -3944)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=564.5 x2=565 y1=228.5 y2=253 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12>');function _u(){return vu()}function ds(){return mu()}function rn(){return bu()}function Do(){return pu()}function Ao(){return Sr()}function Ru(){return(()=>{var e=Sr();return e.style.setProperty("transform","rotate(90deg)"),e})()}function zu(){return(()=>{var e=Sr();return e.style.setProperty("transform","rotate(-90deg)"),e})()}function Ku(){return wu()}function Bu(){return xu()}function Nu(){return $u()}function Hu(){return Cu()}function Uu(){return Su()}function Vu(){return ku()}function Gu(){return Eu()}function ju(){return Du()}function Wu(){return Au()}function Qu(e){return(()=>{var t=us(),n=t.firstChild;return V(()=>M(n,"stroke",e.theme==="dark"?"#12B76A":"#027A48")),t})()}function Yu(){return Mu()}function Xu(){return Tu()}function Zu(e){return[v(B,{get when(){return e.checked},get children(){var t=us(),n=t.firstChild;return V(()=>M(n,"stroke",e.theme==="dark"?"#9B8AFB":"#6938EF")),t}}),v(B,{get when(){return!e.checked},get children(){var t=Fu(),n=t.firstChild;return V(()=>M(n,"stroke",e.theme==="dark"?"#9B8AFB":"#6938EF")),t}})]}function Ju(){return Iu()}function ed(){return Ou()}function td(){return Lu()}function nd(){return Pu()}function Mo(){const e=Ne();return(()=>{var t=qu(),n=t.firstChild,r=n.nextSibling,o=r.nextSibling,s=o.firstChild,a=o.nextSibling,l=a.firstChild,i=a.nextSibling,u=i.nextSibling,h=u.firstChild,f=u.nextSibling,c=f.firstChild,g=f.nextSibling,d=g.nextSibling,y=d.firstChild,b=d.nextSibling,m=b.firstChild,p=b.nextSibling,w=p.nextSibling,x=w.firstChild,$=w.nextSibling,P=$.firstChild,I=$.nextSibling,_=I.nextSibling,C=_.firstChild,T=_.nextSibling,K=T.firstChild,U=T.nextSibling,ne=U.nextSibling,Z=ne.firstChild,se=ne.nextSibling,R=se.firstChild,Q=se.nextSibling,J=Q.nextSibling,le=J.firstChild,ye=J.nextSibling,Me=ye.firstChild,ge=ye.nextSibling,De=ge.firstChild,A=De.nextSibling,fe=A.nextSibling,ee=fe.nextSibling,yt=ee.nextSibling,j=ge.nextSibling,Ce=j.firstChild,Se=j.nextSibling,It=Se.firstChild,Pe=Se.nextSibling,vt=Pe.firstChild,St=vt.nextSibling,tt=St.nextSibling,Qe=tt.firstChild,nt=Qe.nextSibling,O=nt.nextSibling,te=O.nextSibling,ve=te.nextSibling,ie=ve.nextSibling,ae=ie.nextSibling,ce=ae.nextSibling,me=ce.nextSibling,re=me.nextSibling,rt=re.nextSibling,ot=rt.nextSibling,He=Pe.nextSibling,kt=He.firstChild,it=He.nextSibling,Et=it.firstChild,st=it.nextSibling,mt=st.firstChild,hn=mt.nextSibling,jt=st.nextSibling,yn=jt.firstChild,Ot=jt.nextSibling,vn=Ot.firstChild,Wt=Ot.nextSibling,Qt=Wt.firstChild,Yt=Qt.nextSibling,Lt=Yt.nextSibling,kr=Lt.nextSibling,Er=kr.nextSibling,Dr=Er.nextSibling,Ar=Dr.nextSibling,Mr=Ar.nextSibling,Tr=Mr.nextSibling,Fr=Tr.nextSibling,Ir=Fr.nextSibling,Or=Ir.nextSibling,Lr=Or.nextSibling,Pr=Lr.nextSibling,qr=Pr.nextSibling,_r=qr.nextSibling,Rr=_r.nextSibling,bs=Rr.nextSibling;return M(n,"id",`a-${e}`),M(r,"fill",`url(#a-${e})`),M(s,"id",`am-${e}`),M(a,"id",`b-${e}`),M(l,"filter",`url(#am-${e})`),M(i,"mask",`url(#b-${e})`),M(h,"id",`ah-${e}`),M(f,"id",`k-${e}`),M(c,"filter",`url(#ah-${e})`),M(g,"mask",`url(#k-${e})`),M(y,"id",`ae-${e}`),M(b,"id",`j-${e}`),M(m,"filter",`url(#ae-${e})`),M(p,"mask",`url(#j-${e})`),M(x,"id",`ai-${e}`),M($,"id",`i-${e}`),M(P,"filter",`url(#ai-${e})`),M(I,"mask",`url(#i-${e})`),M(C,"id",`aj-${e}`),M(T,"id",`h-${e}`),M(K,"filter",`url(#aj-${e})`),M(U,"mask",`url(#h-${e})`),M(Z,"id",`ag-${e}`),M(se,"id",`g-${e}`),M(R,"filter",`url(#ag-${e})`),M(Q,"mask",`url(#g-${e})`),M(le,"id",`af-${e}`),M(ye,"id",`f-${e}`),M(Me,"filter",`url(#af-${e})`),M(ge,"mask",`url(#f-${e})`),M(ee,"id",`m-${e}`),M(yt,"fill",`url(#m-${e})`),M(Ce,"id",`ak-${e}`),M(Se,"id",`e-${e}`),M(It,"filter",`url(#ak-${e})`),M(Pe,"mask",`url(#e-${e})`),M(vt,"id",`n-${e}`),M(St,"fill",`url(#n-${e})`),M(Qe,"id",`r-${e}`),M(nt,"fill",`url(#r-${e})`),M(O,"id",`s-${e}`),M(te,"fill",`url(#s-${e})`),M(ve,"id",`q-${e}`),M(ie,"fill",`url(#q-${e})`),M(ae,"id",`p-${e}`),M(ce,"fill",`url(#p-${e})`),M(me,"id",`o-${e}`),M(re,"fill",`url(#o-${e})`),M(rt,"id",`l-${e}`),M(ot,"fill",`url(#l-${e})`),M(kt,"id",`al-${e}`),M(it,"id",`d-${e}`),M(Et,"filter",`url(#al-${e})`),M(st,"mask",`url(#d-${e})`),M(mt,"id",`u-${e}`),M(hn,"fill",`url(#u-${e})`),M(yn,"id",`ad-${e}`),M(Ot,"id",`c-${e}`),M(vn,"filter",`url(#ad-${e})`),M(Wt,"mask",`url(#c-${e})`),M(Qt,"id",`t-${e}`),M(Yt,"fill",`url(#t-${e})`),M(Lt,"id",`v-${e}`),M(kr,"stroke",`url(#v-${e})`),M(Er,"id",`aa-${e}`),M(Dr,"stroke",`url(#aa-${e})`),M(Ar,"id",`w-${e}`),M(Mr,"stroke",`url(#w-${e})`),M(Tr,"id",`ac-${e}`),M(Fr,"stroke",`url(#ac-${e})`),M(Ir,"id",`ab-${e}`),M(Or,"stroke",`url(#ab-${e})`),M(Lr,"id",`y-${e}`),M(Pr,"stroke",`url(#y-${e})`),M(qr,"id",`x-${e}`),M(_r,"stroke",`url(#x-${e})`),M(Rr,"id",`z-${e}`),M(bs,"stroke",`url(#z-${e})`),t})()}var rd=q('<span><svg width=16 height=16 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 12L10 8L6 4"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),od=q('<button title="Copy object to clipboard">'),id=q('<button title="Remove all items"aria-label="Remove all items">'),sd=q('<button title="Delete item"aria-label="Delete item">'),ad=q('<button title="Toggle value"aria-label="Toggle value">'),ld=q('<button title="Bulk Edit Data"aria-label="Bulk Edit Data">'),Jt=q("<div>"),cd=q("<div><button> <span></span> <span> "),ud=q("<input>"),To=q("<span>"),dd=q("<div><span>:"),fd=q("<div><div><button> [<!>...<!>]");function gd(e,t){let n=0;const r=[];for(;n<e.length;)r.push(e.slice(n,n+t)),n=n+t;return r}var Fo=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Gt(n):Vt(n));return(()=>{var o=rd();return V(()=>F(o,L(r().expander,n`
          transform: rotate(${e.expanded?90:0}deg);
        `,e.expanded&&n`
            & svg {
              top: -1px;
            }
          `))),o})()},hd=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Gt(n):Vt(n)),[o,s]=z("NoCopy");return(()=>{var a=od();return Fs(a,"click",o()==="NoCopy"?()=>{navigator.clipboard.writeText(Is(e.value)).then(()=>{s("SuccessCopy"),setTimeout(()=>{s("NoCopy")},1500)},l=>{s("ErrorCopy"),setTimeout(()=>{s("NoCopy")},1500)})}:void 0,!0),k(a,v(Os,{get children(){return[v(zn,{get when(){return o()==="NoCopy"},get children(){return v(ju,{})}}),v(zn,{get when(){return o()==="SuccessCopy"},get children(){return v(Qu,{get theme(){return t()}})}}),v(zn,{get when(){return o()==="ErrorCopy"},get children(){return v(Yu,{})}})]}})),V(l=>{var i=r().actionButton,u=`${o()==="NoCopy"?"Copy object to clipboard":o()==="SuccessCopy"?"Object copied to clipboard":"Error copying object to clipboard"}`;return i!==l.e&&F(a,l.e=i),u!==l.t&&M(a,"aria-label",l.t=u),l},{e:void 0,t:void 0}),a})()},yd=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Gt(n):Vt(n)),o=N().client;return(()=>{var s=id();return s.$$click=()=>{const a=e.activeQuery.state.data,l=ir(a,e.dataPath,[]);o.setQueryData(e.activeQuery.queryKey,l)},k(s,v(Xu,{})),V(()=>F(s,r().actionButton)),s})()},Io=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Gt(n):Vt(n)),o=N().client;return(()=>{var s=sd();return s.$$click=()=>{const a=e.activeQuery.state.data,l=Ls(a,e.dataPath);o.setQueryData(e.activeQuery.queryKey,l)},k(s,v(ds,{})),V(()=>F(s,L(r().actionButton))),s})()},vd=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Gt(n):Vt(n)),o=N().client;return(()=>{var s=ad();return s.$$click=()=>{const a=e.activeQuery.state.data,l=ir(a,e.dataPath,!e.value);o.setQueryData(e.activeQuery.queryKey,l)},k(s,v(Zu,{get theme(){return t()},get checked(){return e.value}})),V(()=>F(s,L(r().actionButton,n`
          width: ${S.size[3.5]};
          height: ${S.size[3.5]};
        `))),s})()};function Oo(e){return Symbol.iterator in e}function bt(e){const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Gt(n):Vt(n)),o=N().client,[s,a]=z((e.defaultExpanded||[]).includes(e.label)),l=()=>a(d=>!d),[i,u]=z([]),h=D(()=>Array.isArray(e.value)?e.value.map((d,y)=>({label:y.toString(),value:d})):e.value!==null&&typeof e.value=="object"&&Oo(e.value)&&typeof e.value[Symbol.iterator]=="function"?e.value instanceof Map?Array.from(e.value,([d,y])=>({label:d,value:y})):Array.from(e.value,(d,y)=>({label:y.toString(),value:d})):typeof e.value=="object"&&e.value!==null?Object.entries(e.value).map(([d,y])=>({label:d,value:y})):[]),f=D(()=>Array.isArray(e.value)?"array":e.value!==null&&typeof e.value=="object"&&Oo(e.value)&&typeof e.value[Symbol.iterator]=="function"?"Iterable":typeof e.value=="object"&&e.value!==null?"object":typeof e.value),c=D(()=>gd(h(),100)),g=e.dataPath??[];return(()=>{var d=Jt();return k(d,v(B,{get when(){return c().length},get children(){return[(()=>{var y=cd(),b=y.firstChild,m=b.firstChild,p=m.nextSibling,w=p.nextSibling,x=w.nextSibling,$=x.firstChild;return b.$$click=()=>l(),k(b,v(Fo,{get expanded(){return s()}}),m),k(p,()=>e.label),k(x,()=>String(f()).toLowerCase()==="iterable"?"(Iterable) ":"",$),k(x,()=>h().length,$),k(x,()=>h().length>1?"items":"item",null),k(y,v(B,{get when(){return e.editable},get children(){var P=Jt();return k(P,v(hd,{get value(){return e.value}}),null),k(P,v(B,{get when(){return e.itemsDeletable&&e.activeQuery!==void 0},get children(){return v(Io,{get activeQuery(){return e.activeQuery},dataPath:g})}}),null),k(P,v(B,{get when(){return f()==="array"&&e.activeQuery!==void 0},get children(){return v(yd,{get activeQuery(){return e.activeQuery},dataPath:g})}}),null),k(P,v(B,{get when(){return D(()=>!!e.onEdit)()&&!Ms(e.value).meta},get children(){var I=ld();return I.$$click=()=>{var _;(_=e.onEdit)==null||_.call(e)},k(I,v(Wu,{})),V(()=>F(I,r().actionButton)),I}}),null),V(()=>F(P,r().actions)),P}}),null),V(P=>{var I=r().expanderButtonContainer,_=r().expanderButton,C=r().info;return I!==P.e&&F(y,P.e=I),_!==P.t&&F(b,P.t=_),C!==P.a&&F(x,P.a=C),P},{e:void 0,t:void 0,a:void 0}),y})(),v(B,{get when(){return s()},get children(){return[v(B,{get when(){return c().length===1},get children(){var y=Jt();return k(y,v(xn,{get each(){return h()},by:b=>b.label,children:b=>v(bt,{get defaultExpanded(){return e.defaultExpanded},get label(){return b().label},get value(){return b().value},get editable(){return e.editable},get dataPath(){return[...g,b().label]},get activeQuery(){return e.activeQuery},get itemsDeletable(){return f()==="array"||f()==="Iterable"||f()==="object"}})})),V(()=>F(y,r().subEntry)),y}}),v(B,{get when(){return c().length>1},get children(){var y=Jt();return k(y,v(Ts,{get each(){return c()},children:(b,m)=>(()=>{var p=fd(),w=p.firstChild,x=w.firstChild,$=x.firstChild,P=$.nextSibling,I=P.nextSibling,_=I.nextSibling;return _.nextSibling,x.$$click=()=>u(C=>C.includes(m)?C.filter(T=>T!==m):[...C,m]),k(x,v(Fo,{get expanded(){return i().includes(m)}}),$),k(x,m*100,P),k(x,m*100+100-1,_),k(w,v(B,{get when(){return i().includes(m)},get children(){var C=Jt();return k(C,v(xn,{get each(){return b()},by:T=>T.label,children:T=>v(bt,{get defaultExpanded(){return e.defaultExpanded},get label(){return T().label},get value(){return T().value},get editable(){return e.editable},get dataPath(){return[...g,T().label]},get activeQuery(){return e.activeQuery}})})),V(()=>F(C,r().subEntry)),C}}),null),V(C=>{var T=r().entry,K=r().expanderButton;return T!==C.e&&F(w,C.e=T),K!==C.t&&F(x,C.t=K),C},{e:void 0,t:void 0}),p})()})),V(()=>F(y,r().subEntry)),y}})]}})]}}),null),k(d,v(B,{get when(){return c().length===0},get children(){var y=dd(),b=y.firstChild,m=b.firstChild;return k(b,()=>e.label,m),k(y,v(B,{get when(){return D(()=>!!(e.editable&&e.activeQuery!==void 0))()&&(f()==="string"||f()==="number"||f()==="boolean")},get fallback(){return(()=>{var p=To();return k(p,()=>wn(e.value)),V(()=>F(p,r().value)),p})()},get children(){return[v(B,{get when(){return D(()=>!!(e.editable&&e.activeQuery!==void 0))()&&(f()==="string"||f()==="number")},get children(){var p=ud();return p.addEventListener("change",w=>{const x=e.activeQuery.state.data,$=ir(x,g,f()==="number"?w.target.valueAsNumber:w.target.value);o.setQueryData(e.activeQuery.queryKey,$)}),V(w=>{var x=f()==="number"?"number":"text",$=L(r().value,r().editableInput);return x!==w.e&&M(p,"type",w.e=x),$!==w.t&&F(p,w.t=$),w},{e:void 0,t:void 0}),V(()=>p.value=e.value),p}}),v(B,{get when(){return f()==="boolean"},get children(){var p=To();return k(p,v(vd,{get activeQuery(){return e.activeQuery},dataPath:g,get value(){return e.value}}),null),k(p,()=>wn(e.value),null),V(()=>F(p,L(r().value,r().actions,r().editableInput))),p}})]}}),null),k(y,v(B,{get when(){return e.editable&&e.itemsDeletable&&e.activeQuery!==void 0},get children(){return v(Io,{get activeQuery(){return e.activeQuery},dataPath:g})}}),null),V(p=>{var w=r().row,x=r().label;return w!==p.e&&F(y,p.e=w),x!==p.t&&F(b,p.t=x),p},{e:void 0,t:void 0}),y}}),null),V(()=>F(d,r().entry)),d})()}var fs=(e,t)=>{const{colors:n,font:r,size:o,border:s}=S,a=(l,i)=>e==="light"?l:i;return{entry:t`
      & * {
        font-size: ${r.size.xs};
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
      }
      position: relative;
      outline: none;
      word-break: break-word;
    `,subEntry:t`
      margin: 0 0 0 0.5em;
      padding-left: 0.75em;
      border-left: 2px solid ${a(n.gray[300],n.darkGray[400])};
      /* outline: 1px solid ${n.teal[400]}; */
    `,expander:t`
      & path {
        stroke: ${n.gray[400]};
      }
      & svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      display: inline-flex;
      align-items: center;
      transition: all 0.1s ease;
      /* outline: 1px solid ${n.blue[400]}; */
    `,expanderButtonContainer:t`
      display: flex;
      align-items: center;
      line-height: ${o[4]};
      min-height: ${o[4]};
      gap: ${o[2]};
    `,expanderButton:t`
      cursor: pointer;
      color: inherit;
      font: inherit;
      outline: inherit;
      height: ${o[5]};
      background: transparent;
      border: none;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: ${o[1]};
      position: relative;
      /* outline: 1px solid ${n.green[400]}; */

      &:focus-visible {
        border-radius: ${s.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }

      & svg {
        position: relative;
        left: 1px;
      }
    `,info:t`
      color: ${a(n.gray[500],n.gray[500])};
      font-size: ${r.size.xs};
      margin-left: ${o[1]};
      /* outline: 1px solid ${n.yellow[400]}; */
    `,label:t`
      color: ${a(n.gray[700],n.gray[300])};
      white-space: nowrap;
    `,value:t`
      color: ${a(n.purple[600],n.purple[400])};
      flex-grow: 1;
    `,actions:t`
      display: inline-flex;
      gap: ${o[2]};
      align-items: center;
    `,row:t`
      display: inline-flex;
      gap: ${o[2]};
      width: 100%;
      margin: ${o[.25]} 0px;
      line-height: ${o[4.5]};
      align-items: center;
    `,editableInput:t`
      border: none;
      padding: ${o[.5]} ${o[1]} ${o[.5]} ${o[1.5]};
      flex-grow: 1;
      border-radius: ${s.radius.xs};
      background-color: ${a(n.gray[200],n.darkGray[500])};

      &:hover {
        background-color: ${a(n.gray[300],n.darkGray[600])};
      }
    `,actionButton:t`
      background-color: transparent;
      color: ${a(n.gray[500],n.gray[500])};
      border: none;
      display: inline-flex;
      padding: 0px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: ${o[3]};
      height: ${o[3]};
      position: relative;
      z-index: 1;

      &:hover svg {
        color: ${a(n.gray[600],n.gray[400])};
      }

      &:focus-visible {
        border-radius: ${s.radius.xs};
        outline: 2px solid ${n.blue[800]};
        outline-offset: 2px;
      }
    `}},Vt=e=>fs("light",e),Gt=e=>fs("dark",e);or(["click"]);var md=q('<div><div aria-hidden=true></div><button type=button aria-label="Open Tanstack query devtools"class=tsqd-open-btn>'),_n=q("<div>"),bd=q('<aside aria-label="Tanstack query devtools"><div></div><button aria-label="Close tanstack query devtools">'),pd=q("<select name=tsqd-queries-filter-sort>"),wd=q("<select name=tsqd-mutations-filter-sort>"),xd=q("<span>Asc"),$d=q("<span>Desc"),Cd=q('<button aria-label="Open in picture-in-picture mode"title="Open in picture-in-picture mode">'),Sd=q("<div>Settings"),kd=q("<span>Position"),Ed=q("<span>Top"),Dd=q("<span>Bottom"),Ad=q("<span>Left"),Md=q("<span>Right"),Td=q("<span>Theme"),Fd=q("<span>Light"),Id=q("<span>Dark"),Od=q("<span>System"),Ld=q("<div><div class=tsqd-queries-container>"),Pd=q("<div><div class=tsqd-mutations-container>"),qd=q('<div><div><div><button aria-label="Close Tanstack query devtools"><span>TANSTACK</span><span> v</span></button></div></div><div><div><div><input aria-label="Filter queries by query key"type=text placeholder=Filter name=tsqd-query-filter-input></div><div></div><button class=tsqd-query-filter-sort-order-btn></button></div><div><button aria-label="Clear query cache"></button><button>'),Lo=q("<option>Sort by "),_d=q("<div class=tsqd-query-disabled-indicator>disabled"),Rd=q("<div class=tsqd-query-static-indicator>static"),gs=q("<button><div></div><code class=tsqd-query-hash>"),zd=q("<div role=tooltip id=tsqd-status-tooltip>"),Kd=q("<span>"),Bd=q("<button><span></span><span>"),Nd=q("<button><span></span> Error"),Hd=q('<div><span></span>Trigger Error<select><option value=""disabled selected>'),Ud=q('<div class="tsqd-query-details-explorer-container tsqd-query-details-data-explorer">'),Vd=q("<form><textarea name=data></textarea><div><span></span><div><button type=button>Cancel</button><button>Save"),Gd=q('<div><div>Query Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-observers-count><span>Observers:</span><span></span></div><div class=tsqd-query-details-last-updated><span>Last Updated:</span><span></span></div></div><div>Actions</div><div><button><span></span>Refetch</button><button><span></span>Invalidate</button><button><span></span>Reset</button><button><span></span>Remove</button><button><span></span> Loading</button></div><div>Data </div><div>Query Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),jd=q("<option>"),Wd=q('<div><div>Mutation Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-last-updated><span>Submitted At:</span><span></span></div></div><div>Variables Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Context Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Data Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Mutations Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),[Ie,Rn]=z(null),[pt,hs]=z(null),[ut,ys]=z(0),[en,Qd]=z(!1),Yd=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?We(n):je(n)),o=D(()=>N().onlineManager);At(()=>{const f=o().subscribe(c=>{Qd(!c)});G(()=>{f()})});const s=sr(),a=D(()=>N().buttonPosition||Ws),l=D(()=>e.localStore.open==="true"?!0:e.localStore.open==="false"?!1:N().initialIsOpen||Ys),i=D(()=>e.localStore.position||N().position||Wn);let u;H(()=>{const f=u.parentElement,c=e.localStore.height||Ro,g=e.localStore.width||zo,d=i();f.style.setProperty("--tsqd-panel-height",`${d==="top"?"-":""}${c}px`),f.style.setProperty("--tsqd-panel-width",`${d==="left"?"-":""}${g}px`)}),At(()=>{const f=()=>{const c=u.parentElement,g=getComputedStyle(c).fontSize;c.style.setProperty("--tsqd-font-size",g)};f(),window.addEventListener("focus",f),G(()=>{window.removeEventListener("focus",f)})});const h=D(()=>e.localStore.pip_open??"false");return[v(B,{get when(){return D(()=>!!s().pipWindow)()&&h()=="true"},get children(){return v(Po,{get mount(){var f;return(f=s().pipWindow)==null?void 0:f.document.body},get children(){return v(Xd,{get children(){return v(vs,e)}})}})}}),(()=>{var f=_n(),c=u;return typeof c=="function"?An(c,f):u=f,k(f,v(Qr,{name:"tsqd-panel-transition",get children(){return v(B,{get when(){return D(()=>!!(l()&&!s().pipWindow))()&&h()=="false"},get children(){return v(Zd,{get localStore(){return e.localStore},get setLocalStore(){return e.setLocalStore}})}})}}),null),k(f,v(Qr,{name:"tsqd-button-transition",get children(){return v(B,{get when(){return!l()},get children(){var g=md(),d=g.firstChild,y=d.nextSibling;return k(d,v(Mo,{})),y.$$click=()=>e.setLocalStore("open","true"),k(y,v(Mo,{})),V(()=>F(g,L(r().devtoolsBtn,r()[`devtoolsBtn-position-${a()}`],"tsqd-open-btn-container"))),g}})}}),null),V(()=>F(f,L(n`
            & .tsqd-panel-transition-exit-active,
            & .tsqd-panel-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
            }

            & .tsqd-panel-transition-exit-to,
            & .tsqd-panel-transition-enter {
              ${i()==="top"||i()==="bottom"?"transform: translateY(var(--tsqd-panel-height));":"transform: translateX(var(--tsqd-panel-width));"}
            }

            & .tsqd-button-transition-exit-active,
            & .tsqd-button-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
              opacity: 1;
            }

            & .tsqd-button-transition-exit-to,
            & .tsqd-button-transition-enter {
              transform: ${a()==="relative"?"none;":a()==="top-left"?"translateX(-72px);":a()==="top-right"?"translateX(72px);":"translateY(72px);"};
              opacity: 0;
            }
          `,"tsqd-transitions-container"))),f})()]},Xd=e=>{const t=sr(),n=$e(),r=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,o=D(()=>n()==="dark"?We(r):je(r)),s=()=>{const{colors:a}=S,l=(i,u)=>n()==="dark"?u:i;return ut()<Bt?r`
        flex-direction: column;
        background-color: ${l(a.gray[300],a.gray[600])};
      `:r`
      flex-direction: row;
      background-color: ${l(a.gray[200],a.darkGray[900])};
    `};return H(()=>{const a=t().pipWindow,l=()=>{a&&ys(a.innerWidth)};a&&(a.addEventListener("resize",l),l()),G(()=>{a&&a.removeEventListener("resize",l)})}),(()=>{var a=_n();return a.style.setProperty("--tsqd-font-size","16px"),a.style.setProperty("max-height","100vh"),a.style.setProperty("height","100vh"),a.style.setProperty("width","100vw"),k(a,()=>e.children),V(()=>F(a,L(o().panel,s(),{[r`
            min-width: min-content;
          `]:ut()<_o},"tsqd-main-panel"))),a})()},Zd=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?We(n):je(n)),[o,s]=z(!1),a=D(()=>e.localStore.position||N().position||Wn),l=h=>{const f=h.currentTarget.parentElement;if(!f)return;s(!0);const{height:c,width:g}=f.getBoundingClientRect(),d=h.clientX,y=h.clientY;let b=0;const m=zr(3.5),p=zr(12),w=$=>{if($.preventDefault(),a()==="left"||a()==="right"){const P=a()==="right"?d-$.clientX:$.clientX-d;b=Math.round(g+P),b<p&&(b=p),e.setLocalStore("width",String(Math.round(b)));const I=f.getBoundingClientRect().width;Number(e.localStore.width)<I&&e.setLocalStore("width",String(I))}else{const P=a()==="bottom"?y-$.clientY:$.clientY-y;b=Math.round(c+P),b<m&&(b=m,Rn(null)),e.setLocalStore("height",String(Math.round(b)))}},x=()=>{o()&&s(!1),document.removeEventListener("mousemove",w,!1),document.removeEventListener("mouseUp",x,!1)};document.addEventListener("mousemove",w,!1),document.addEventListener("mouseup",x,!1)};let i;At(()=>{Sa(i,({width:h},f)=>{f===i&&ys(h)})}),H(()=>{var y,b;const h=(b=(y=i.parentElement)==null?void 0:y.parentElement)==null?void 0:b.parentElement;if(!h)return;const f=e.localStore.position||Wn,c=$s("padding",f),g=e.localStore.position==="left"||e.localStore.position==="right",d=(({padding:m,paddingTop:p,paddingBottom:w,paddingLeft:x,paddingRight:$})=>({padding:m,paddingTop:p,paddingBottom:w,paddingLeft:x,paddingRight:$}))(h.style);h.style[c]=`${g?e.localStore.width:e.localStore.height}px`,G(()=>{Object.entries(d).forEach(([m,p])=>{h.style[m]=p})})});const u=()=>{const{colors:h}=S,f=(c,g)=>t()==="dark"?g:c;return ut()<Bt?n`
        flex-direction: column;
        background-color: ${f(h.gray[300],h.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${f(h.gray[200],h.darkGray[900])};
    `};return(()=>{var h=bd(),f=h.firstChild,c=f.nextSibling,g=i;return typeof g=="function"?An(g,h):i=h,f.$$mousedown=l,c.$$click=()=>e.setLocalStore("open","false"),k(c,v(rn,{})),k(h,v(vs,e),null),V(d=>{var y=L(r().panel,r()[`panel-position-${a()}`],u(),{[n`
            min-width: min-content;
          `]:ut()<_o&&(a()==="right"||a()==="left")},"tsqd-main-panel"),b=a()==="bottom"||a()==="top"?`${e.localStore.height||Ro}px`:"auto",m=a()==="right"||a()==="left"?`${e.localStore.width||zo}px`:"auto",p=L(r().dragHandle,r()[`dragHandle-position-${a()}`],"tsqd-drag-handle"),w=L(r().closeBtn,r()[`closeBtn-position-${a()}`],"tsqd-minimize-btn");return y!==d.e&&F(h,d.e=y),b!==d.t&&((d.t=b)!=null?h.style.setProperty("height",b):h.style.removeProperty("height")),m!==d.a&&((d.a=m)!=null?h.style.setProperty("width",m):h.style.removeProperty("width")),p!==d.o&&F(f,d.o=p),w!==d.i&&F(c,d.i=w),d},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),h})()},vs=e=>{i0(),s0();let t;const n=$e(),r=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,o=D(()=>n()==="dark"?We(r):je(r)),s=sr(),[a,l]=z("queries"),i=D(()=>e.localStore.sort||Zs),u=D(()=>Number(e.localStore.sortOrder)||Nr),h=D(()=>e.localStore.mutationSort||Js),f=D(()=>Number(e.localStore.mutationSortOrder)||Nr),c=D(()=>Vn[i()]),g=D(()=>Gn[h()]),d=D(()=>N().onlineManager),y=D(()=>N().client.getQueryCache()),b=D(()=>N().client.getMutationCache()),m=be(I=>I().getAll().length,!1),p=D(dt(()=>[m(),e.localStore.filter,i(),u()],()=>{const I=y().getAll(),_=e.localStore.filter?I.filter(T=>Hr(T.queryHash,e.localStore.filter||"").passed):[...I];return c()?_.sort((T,K)=>c()(T,K)*u()):_})),w=Ue(I=>I().getAll().length,!1),x=D(dt(()=>[w(),e.localStore.mutationFilter,h(),f()],()=>{const I=b().getAll(),_=e.localStore.mutationFilter?I.filter(T=>{const K=`${T.options.mutationKey?JSON.stringify(T.options.mutationKey)+" - ":""}${new Date(T.state.submittedAt).toLocaleString()}`;return Hr(K,e.localStore.mutationFilter||"").passed}):[...I];return g()?_.sort((T,K)=>g()(T,K)*f()):_})),$=I=>{e.setLocalStore("position",I)},P=I=>{const C=getComputedStyle(t).getPropertyValue("--tsqd-font-size");I.style.setProperty("--tsqd-font-size",C)};return[(()=>{var I=qd(),_=I.firstChild,C=_.firstChild,T=C.firstChild,K=T.firstChild,U=K.nextSibling,ne=U.firstChild,Z=_.nextSibling,se=Z.firstChild,R=se.firstChild,Q=R.firstChild,J=R.nextSibling,le=J.nextSibling,ye=se.nextSibling,Me=ye.firstChild,ge=Me.nextSibling,De=t;return typeof De=="function"?An(De,I):t=I,T.$$click=()=>{if(!s().pipWindow&&!e.showPanelViewOnly){e.setLocalStore("open","false");return}e.onClose&&e.onClose()},k(U,()=>N().queryFlavor,ne),k(U,()=>N().version,null),k(C,v(ze.Root,{get class(){return L(o().viewToggle)},get value(){return a()},onChange:A=>{l(A),Rn(null),hs(null)},get children(){return[v(ze.Item,{value:"queries",class:"tsqd-radio-toggle",get children(){return[v(ze.ItemInput,{}),v(ze.ItemControl,{get children(){return v(ze.ItemIndicator,{})}}),v(ze.ItemLabel,{title:"Toggle Queries View",children:"Queries"})]}}),v(ze.Item,{value:"mutations",class:"tsqd-radio-toggle",get children(){return[v(ze.ItemInput,{}),v(ze.ItemControl,{get children(){return v(ze.ItemIndicator,{})}}),v(ze.ItemLabel,{title:"Toggle Mutations View",children:"Mutations"})]}})]}}),null),k(_,v(B,{get when(){return a()==="queries"},get children(){return v(t0,{})}}),null),k(_,v(B,{get when(){return a()==="mutations"},get children(){return v(n0,{})}}),null),k(R,v(_u,{}),Q),Q.$$input=A=>{a()==="queries"?e.setLocalStore("filter",A.currentTarget.value):e.setLocalStore("mutationFilter",A.currentTarget.value)},k(J,v(B,{get when(){return a()==="queries"},get children(){var A=pd();return A.addEventListener("change",fe=>{e.setLocalStore("sort",fe.currentTarget.value)}),k(A,()=>Object.keys(Vn).map(fe=>(()=>{var ee=Lo();return ee.firstChild,ee.value=fe,k(ee,fe,null),ee})())),V(()=>A.value=i()),A}}),null),k(J,v(B,{get when(){return a()==="mutations"},get children(){var A=wd();return A.addEventListener("change",fe=>{e.setLocalStore("mutationSort",fe.currentTarget.value)}),k(A,()=>Object.keys(Gn).map(fe=>(()=>{var ee=Lo();return ee.firstChild,ee.value=fe,k(ee,fe,null),ee})())),V(()=>A.value=h()),A}}),null),k(J,v(rn,{}),null),le.$$click=()=>{a()==="queries"?e.setLocalStore("sortOrder",String(u()*-1)):e.setLocalStore("mutationSortOrder",String(f()*-1))},k(le,v(B,{get when(){return(a()==="queries"?u():f())===1},get children(){return[xd(),v(Do,{})]}}),null),k(le,v(B,{get when(){return(a()==="queries"?u():f())===-1},get children(){return[$d(),v(Ao,{})]}}),null),Me.$$click=()=>{a()==="queries"?(Ye({type:"CLEAR_QUERY_CACHE"}),y().clear()):(Ye({type:"CLEAR_MUTATION_CACHE"}),b().clear())},k(Me,v(ds,{})),ge.$$click=()=>{d().setOnline(!d().isOnline())},k(ge,(()=>{var A=D(()=>!!en());return()=>A()?v(Uu,{}):v(Hu,{})})()),k(ye,v(B,{get when(){return D(()=>!s().pipWindow)()&&!s().disabled},get children(){var A=Cd();return A.$$click=()=>{s().requestPipWindow(Number(window.innerWidth),Number(e.localStore.height??500))},k(A,v(Gu,{})),V(()=>F(A,L(o().actionsBtn,"tsqd-actions-btn","tsqd-action-open-pip"))),A}}),null),k(ye,v(he.Root,{gutter:4,get children(){return[v(he.Trigger,{get class(){return L(o().actionsBtn,"tsqd-actions-btn","tsqd-action-settings")},get children(){return v(Vu,{})}}),v(he.Portal,{ref:A=>P(A),get mount(){return D(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return v(he.Content,{get class(){return L(o().settingsMenu,"tsqd-settings-menu")},get children(){return[(()=>{var A=Sd();return V(()=>F(A,L(o().settingsMenuHeader,"tsqd-settings-menu-header"))),A})(),v(B,{get when(){return!e.showPanelViewOnly},get children(){return v(he.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[v(he.SubTrigger,{get class(){return L(o().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[kd(),v(rn,{})]}}),v(he.Portal,{ref:A=>P(A),get mount(){return D(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return v(he.SubContent,{get class(){return L(o().settingsMenu,"tsqd-settings-submenu")},get children(){return[v(he.Item,{onSelect:()=>{$("top")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[Ed(),v(Do,{})]}}),v(he.Item,{onSelect:()=>{$("bottom")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[Dd(),v(Ao,{})]}}),v(he.Item,{onSelect:()=>{$("left")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[Ad(),v(Ru,{})]}}),v(he.Item,{onSelect:()=>{$("right")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-right")},get children(){return[Md(),v(zu,{})]}})]}})}})]}})}}),v(he.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[v(he.SubTrigger,{get class(){return L(o().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[Td(),v(rn,{})]}}),v(he.Portal,{ref:A=>P(A),get mount(){return D(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return v(he.SubContent,{get class(){return L(o().settingsMenu,"tsqd-settings-submenu")},get children(){return[v(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","light")},as:"button",get class(){return L(o().settingsSubButton,e.localStore.theme_preference==="light"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[Fd(),v(Ku,{})]}}),v(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","dark")},as:"button",get class(){return L(o().settingsSubButton,e.localStore.theme_preference==="dark"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[Id(),v(Bu,{})]}}),v(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","system")},as:"button",get class(){return L(o().settingsSubButton,e.localStore.theme_preference==="system"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[Od(),v(Nu,{})]}})]}})}})]}})]}})}})]}}),null),k(I,v(B,{get when(){return a()==="queries"},get children(){var A=Ld(),fe=A.firstChild;return k(fe,v(xn,{by:ee=>ee.queryHash,get each(){return p()},children:ee=>v(Jd,{get query(){return ee()}})})),V(()=>F(A,L(o().overflowQueryContainer,"tsqd-queries-overflow-container"))),A}}),null),k(I,v(B,{get when(){return a()==="mutations"},get children(){var A=Pd(),fe=A.firstChild;return k(fe,v(xn,{by:ee=>ee.mutationId,get each(){return x()},children:ee=>v(e0,{get mutation(){return ee()}})})),V(()=>F(A,L(o().overflowQueryContainer,"tsqd-mutations-overflow-container"))),A}}),null),V(A=>{var fe=L(o().queriesContainer,ut()<Bt&&(Ie()||pt())&&r`
              height: 50%;
              max-height: 50%;
            `,ut()<Bt&&!(Ie()||pt())&&r`
              height: 100%;
              max-height: 100%;
            `,"tsqd-queries-container"),ee=L(o().row,"tsqd-header"),yt=o().logoAndToggleContainer,j=L(o().logo,"tsqd-text-logo-container"),Ce=L(o().tanstackLogo,"tsqd-text-logo-tanstack"),Se=L(o().queryFlavorLogo,"tsqd-text-logo-query-flavor"),It=L(o().row,"tsqd-filters-actions-container"),Pe=L(o().filtersContainer,"tsqd-filters-container"),vt=L(o().filterInput,"tsqd-query-filter-textfield-container"),St=L("tsqd-query-filter-textfield"),tt=L(o().filterSelect,"tsqd-query-filter-sort-container"),Qe=`Sort order ${(a()==="queries"?u():f())===-1?"descending":"ascending"}`,nt=(a()==="queries"?u():f())===-1,O=L(o().actionsContainer,"tsqd-actions-container"),te=L(o().actionsBtn,"tsqd-actions-btn","tsqd-action-clear-cache"),ve=`Clear ${a()} cache`,ie=L(o().actionsBtn,en()&&o().actionsBtnOffline,"tsqd-actions-btn","tsqd-action-mock-offline-behavior"),ae=`${en()?"Unset offline mocking behavior":"Mock offline behavior"}`,ce=en(),me=`${en()?"Unset offline mocking behavior":"Mock offline behavior"}`;return fe!==A.e&&F(I,A.e=fe),ee!==A.t&&F(_,A.t=ee),yt!==A.a&&F(C,A.a=yt),j!==A.o&&F(T,A.o=j),Ce!==A.i&&F(K,A.i=Ce),Se!==A.n&&F(U,A.n=Se),It!==A.s&&F(Z,A.s=It),Pe!==A.h&&F(se,A.h=Pe),vt!==A.r&&F(R,A.r=vt),St!==A.d&&F(Q,A.d=St),tt!==A.l&&F(J,A.l=tt),Qe!==A.u&&M(le,"aria-label",A.u=Qe),nt!==A.c&&M(le,"aria-pressed",A.c=nt),O!==A.w&&F(ye,A.w=O),te!==A.m&&F(Me,A.m=te),ve!==A.f&&M(Me,"title",A.f=ve),ie!==A.y&&F(ge,A.y=ie),ae!==A.g&&M(ge,"aria-label",A.g=ae),ce!==A.p&&M(ge,"aria-pressed",A.p=ce),me!==A.b&&M(ge,"title",A.b=me),A},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0}),V(()=>Q.value=a()==="queries"?e.localStore.filter||"":e.localStore.mutationFilter||""),I})(),v(B,{get when(){return D(()=>a()==="queries")()&&Ie()},get children(){return v(r0,{})}}),v(B,{get when(){return D(()=>a()==="mutations")()&&pt()},get children(){return v(o0,{})}})]},Jd=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?We(n):je(n)),{colors:o,alpha:s}=S,a=(d,y)=>t()==="dark"?y:d,l=be(d=>{var y;return(y=d().find({queryKey:e.query.queryKey}))==null?void 0:y.state},!0,d=>d.query.queryHash===e.query.queryHash),i=be(d=>{var y;return((y=d().find({queryKey:e.query.queryKey}))==null?void 0:y.isDisabled())??!1},!0,d=>d.query.queryHash===e.query.queryHash),u=be(d=>{var y;return((y=d().find({queryKey:e.query.queryKey}))==null?void 0:y.isStatic())??!1},!0,d=>d.query.queryHash===e.query.queryHash),h=be(d=>{var y;return((y=d().find({queryKey:e.query.queryKey}))==null?void 0:y.isStale())??!1},!0,d=>d.query.queryHash===e.query.queryHash),f=be(d=>{var y;return((y=d().find({queryKey:e.query.queryKey}))==null?void 0:y.getObserversCount())??0},!0,d=>d.query.queryHash===e.query.queryHash),c=D(()=>Ss({queryState:l(),observerCount:f(),isStale:h()})),g=()=>c()==="gray"?n`
        background-color: ${a(o[c()][200],o[c()][700])};
        color: ${a(o[c()][700],o[c()][300])};
      `:n`
      background-color: ${a(o[c()][200]+s[80],o[c()][900])};
      color: ${a(o[c()][800],o[c()][300])};
    `;return v(B,{get when(){return l()},get children(){var d=gs(),y=d.firstChild,b=y.nextSibling;return d.$$click=()=>Rn(e.query.queryHash===Ie()?null:e.query.queryHash),k(y,f),k(b,()=>e.query.queryHash),k(d,v(B,{get when(){return i()},get children(){return _d()}}),null),k(d,v(B,{get when(){return u()},get children(){return Rd()}}),null),V(m=>{var p=L(r().queryRow,Ie()===e.query.queryHash&&r().selectedQueryRow,"tsqd-query-row"),w=`Query key ${e.query.queryHash}`,x=L(g(),"tsqd-query-observer-count");return p!==m.e&&F(d,m.e=p),w!==m.t&&M(d,"aria-label",m.t=w),x!==m.a&&F(y,m.a=x),m},{e:void 0,t:void 0,a:void 0}),d}})},e0=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?We(n):je(n)),{colors:o,alpha:s}=S,a=(c,g)=>t()==="dark"?g:c,l=Ue(c=>{const d=c().getAll().find(y=>y.mutationId===e.mutation.mutationId);return d==null?void 0:d.state}),i=Ue(c=>{const d=c().getAll().find(y=>y.mutationId===e.mutation.mutationId);return d?d.state.isPaused:!1}),u=Ue(c=>{const d=c().getAll().find(y=>y.mutationId===e.mutation.mutationId);return d?d.state.status:"idle"}),h=D(()=>Rt({isPaused:i(),status:u()})),f=()=>h()==="gray"?n`
        background-color: ${a(o[h()][200],o[h()][700])};
        color: ${a(o[h()][700],o[h()][300])};
      `:n`
      background-color: ${a(o[h()][200]+s[80],o[h()][900])};
      color: ${a(o[h()][800],o[h()][300])};
    `;return v(B,{get when(){return l()},get children(){var c=gs(),g=c.firstChild,d=g.nextSibling;return c.$$click=()=>{hs(e.mutation.mutationId===pt()?null:e.mutation.mutationId)},k(g,v(B,{get when(){return h()==="purple"},get children(){return v(nd,{})}}),null),k(g,v(B,{get when(){return h()==="green"},get children(){return v(Ju,{})}}),null),k(g,v(B,{get when(){return h()==="red"},get children(){return v(td,{})}}),null),k(g,v(B,{get when(){return h()==="yellow"},get children(){return v(ed,{})}}),null),k(d,v(B,{get when(){return e.mutation.options.mutationKey},get children(){return[D(()=>JSON.stringify(e.mutation.options.mutationKey))," -"," "]}}),null),k(d,()=>new Date(e.mutation.state.submittedAt).toLocaleString(),null),V(y=>{var b=L(r().queryRow,pt()===e.mutation.mutationId&&r().selectedQueryRow,"tsqd-query-row"),m=`Mutation submitted at ${new Date(e.mutation.state.submittedAt).toLocaleString()}`,p=L(f(),"tsqd-query-observer-count");return b!==y.e&&F(c,y.e=b),m!==y.t&&M(c,"aria-label",y.t=m),p!==y.a&&F(g,y.a=p),y},{e:void 0,t:void 0,a:void 0}),c}})},t0=()=>{const e=be(i=>i().getAll().filter(u=>Pt(u)==="stale").length),t=be(i=>i().getAll().filter(u=>Pt(u)==="fresh").length),n=be(i=>i().getAll().filter(u=>Pt(u)==="fetching").length),r=be(i=>i().getAll().filter(u=>Pt(u)==="paused").length),o=be(i=>i().getAll().filter(u=>Pt(u)==="inactive").length),s=$e(),a=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,l=D(()=>s()==="dark"?We(a):je(a));return(()=>{var i=_n();return k(i,v(ct,{label:"Fresh",color:"green",get count(){return t()}}),null),k(i,v(ct,{label:"Fetching",color:"blue",get count(){return n()}}),null),k(i,v(ct,{label:"Paused",color:"purple",get count(){return r()}}),null),k(i,v(ct,{label:"Stale",color:"yellow",get count(){return e()}}),null),k(i,v(ct,{label:"Inactive",color:"gray",get count(){return o()}}),null),V(()=>F(i,L(l().queryStatusContainer,"tsqd-query-status-container"))),i})()},n0=()=>{const e=Ue(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="green").length),t=Ue(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="yellow").length),n=Ue(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="purple").length),r=Ue(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="red").length),o=$e(),s=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,a=D(()=>o()==="dark"?We(s):je(s));return(()=>{var l=_n();return k(l,v(ct,{label:"Paused",color:"purple",get count(){return n()}}),null),k(l,v(ct,{label:"Pending",color:"yellow",get count(){return t()}}),null),k(l,v(ct,{label:"Success",color:"green",get count(){return e()}}),null),k(l,v(ct,{label:"Error",color:"red",get count(){return r()}}),null),V(()=>F(l,L(a().queryStatusContainer,"tsqd-query-status-container"))),l})()},ct=e=>{const t=$e(),n=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?We(n):je(n)),{colors:o,alpha:s}=S,a=(g,d)=>t()==="dark"?d:g;let l;const[i,u]=z(!1),[h,f]=z(!1),c=D(()=>!(Ie()&&ut()<js&&ut()>Bt||ut()<Bt));return(()=>{var g=Bd(),d=g.firstChild,y=d.nextSibling,b=l;return typeof b=="function"?An(b,g):l=g,g.addEventListener("mouseleave",()=>{u(!1),f(!1)}),g.addEventListener("mouseenter",()=>u(!0)),g.addEventListener("blur",()=>f(!1)),g.addEventListener("focus",()=>f(!0)),As(g,W({get disabled(){return c()},get class(){return L(r().queryStatusTag,!c()&&n`
            cursor: pointer;
            &:hover {
              background: ${a(o.gray[200],o.darkGray[400])}${s[80]};
            }
          `,"tsqd-query-status-tag",`tsqd-query-status-tag-${e.label.toLowerCase()}`)}},()=>i()||h()?{"aria-describedby":"tsqd-status-tooltip"}:{}),!1,!0),k(g,v(B,{get when(){return D(()=>!c())()&&(i()||h())},get children(){var m=zd();return k(m,()=>e.label),V(()=>F(m,L(r().statusTooltip,"tsqd-query-status-tooltip"))),m}}),d),k(g,v(B,{get when(){return c()},get children(){var m=Kd();return k(m,()=>e.label),V(()=>F(m,L(r().queryStatusTagLabel,"tsqd-query-status-tag-label"))),m}}),y),k(y,()=>e.count),V(m=>{var p=L(n`
            width: ${S.size[1.5]};
            height: ${S.size[1.5]};
            border-radius: ${S.border.radius.full};
            background-color: ${S.colors[e.color][500]};
          `,"tsqd-query-status-tag-dot"),w=L(r().queryStatusCount,e.count>0&&e.color!=="gray"&&n`
              background-color: ${a(o[e.color][100],o[e.color][900])};
              color: ${a(o[e.color][700],o[e.color][300])};
            `,"tsqd-query-status-tag-count");return p!==m.e&&F(d,m.e=p),w!==m.t&&F(y,m.t=w),m},{e:void 0,t:void 0}),g})()},r0=()=>{const e=$e(),t=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,n=D(()=>e()==="dark"?We(t):je(t)),{colors:r}=S,o=(C,T)=>e()==="dark"?T:C,s=N().client,[a,l]=z(!1),[i,u]=z("view"),[h,f]=z(!1),c=D(()=>N().errorTypes||[]),g=be(C=>C().getAll().find(T=>T.queryHash===Ie()),!1),d=be(C=>C().getAll().find(T=>T.queryHash===Ie()),!1),y=be(C=>{var T;return(T=C().getAll().find(K=>K.queryHash===Ie()))==null?void 0:T.state},!1),b=be(C=>{var T;return(T=C().getAll().find(K=>K.queryHash===Ie()))==null?void 0:T.state.data},!1),m=be(C=>{const T=C().getAll().find(K=>K.queryHash===Ie());return T?Pt(T):"inactive"}),p=be(C=>{const T=C().getAll().find(K=>K.queryHash===Ie());return T?T.state.status:"pending"}),w=be(C=>{var T;return((T=C().getAll().find(K=>K.queryHash===Ie()))==null?void 0:T.getObserversCount())??0}),x=D(()=>ks(m())),$=()=>{var T,K;Ye({type:"REFETCH",queryHash:(T=g())==null?void 0:T.queryHash});const C=(K=g())==null?void 0:K.fetch();C==null||C.catch(()=>{})},P=C=>{const T=g();if(!T)return;Ye({type:"TRIGGER_ERROR",queryHash:T.queryHash,metadata:{error:C==null?void 0:C.name}});const K=(C==null?void 0:C.initializer(T))??new Error("Unknown error from devtools"),U=T.options;T.setState({status:"error",error:K,fetchMeta:{...T.state.fetchMeta,__previousQueryOptions:U}})},I=()=>{const C=g();if(!C)return;Ye({type:"RESTORE_LOADING",queryHash:C.queryHash});const T=C.state,K=C.state.fetchMeta?C.state.fetchMeta.__previousQueryOptions:null;C.cancel({silent:!0}),C.setState({...T,fetchStatus:"idle",fetchMeta:null}),K&&C.fetch(K)};H(()=>{m()!=="fetching"&&l(!1)});const _=()=>x()==="gray"?t`
        background-color: ${o(r[x()][200],r[x()][700])};
        color: ${o(r[x()][700],r[x()][300])};
        border-color: ${o(r[x()][400],r[x()][600])};
      `:t`
      background-color: ${o(r[x()][100],r[x()][900])};
      color: ${o(r[x()][700],r[x()][300])};
      border-color: ${o(r[x()][400],r[x()][600])};
    `;return v(B,{get when(){return D(()=>!!g())()&&y()},get children(){var C=Gd(),T=C.firstChild,K=T.nextSibling,U=K.firstChild,ne=U.firstChild,Z=ne.firstChild,se=ne.nextSibling,R=U.nextSibling,Q=R.firstChild,J=Q.nextSibling,le=R.nextSibling,ye=le.firstChild,Me=ye.nextSibling,ge=K.nextSibling,De=ge.nextSibling,A=De.firstChild,fe=A.firstChild,ee=A.nextSibling,yt=ee.firstChild,j=ee.nextSibling,Ce=j.firstChild,Se=j.nextSibling,It=Se.firstChild,Pe=Se.nextSibling,vt=Pe.firstChild,St=vt.nextSibling,tt=De.nextSibling;tt.firstChild;var Qe=tt.nextSibling,nt=Qe.nextSibling;return k(Z,()=>wn(g().queryKey,!0)),k(se,m),k(J,w),k(Me,()=>new Date(y().dataUpdatedAt).toLocaleTimeString()),A.$$click=$,ee.$$click=()=>{var O;Ye({type:"INVALIDATE",queryHash:(O=g())==null?void 0:O.queryHash}),s.invalidateQueries(g())},j.$$click=()=>{var O;Ye({type:"RESET",queryHash:(O=g())==null?void 0:O.queryHash}),s.resetQueries(g())},Se.$$click=()=>{var O;Ye({type:"REMOVE",queryHash:(O=g())==null?void 0:O.queryHash}),s.removeQueries(g()),Rn(null)},Pe.$$click=()=>{var O;if(((O=g())==null?void 0:O.state.data)===void 0)l(!0),I();else{const te=g();if(!te)return;Ye({type:"TRIGGER_LOADING",queryHash:te.queryHash});const ve=te.options;te.fetch({...ve,queryFn:()=>new Promise(()=>{}),gcTime:-1}),te.setState({data:void 0,status:"pending",fetchMeta:{...te.state.fetchMeta,__previousQueryOptions:ve}})}},k(Pe,()=>p()==="pending"?"Restore":"Trigger",St),k(De,v(B,{get when(){return c().length===0||p()==="error"},get children(){var O=Nd(),te=O.firstChild,ve=te.nextSibling;return O.$$click=()=>{var ie;g().state.error?(Ye({type:"RESTORE_ERROR",queryHash:(ie=g())==null?void 0:ie.queryHash}),s.resetQueries(g())):P()},k(O,()=>p()==="error"?"Restore":"Trigger",ve),V(ie=>{var ae=L(t`
                  color: ${o(r.red[500],r.red[400])};
                `,"tsqd-query-details-actions-btn","tsqd-query-details-action-error"),ce=p()==="pending",me=t`
                  background-color: ${o(r.red[500],r.red[400])};
                `;return ae!==ie.e&&F(O,ie.e=ae),ce!==ie.t&&(O.disabled=ie.t=ce),me!==ie.a&&F(te,ie.a=me),ie},{e:void 0,t:void 0,a:void 0}),O}}),null),k(De,v(B,{get when(){return!(c().length===0||p()==="error")},get children(){var O=Hd(),te=O.firstChild,ve=te.nextSibling,ie=ve.nextSibling;return ie.firstChild,ie.addEventListener("change",ae=>{const ce=c().find(me=>me.name===ae.currentTarget.value);P(ce)}),k(ie,v(Es,{get each(){return c()},children:ae=>(()=>{var ce=jd();return k(ce,()=>ae.name),V(()=>ce.value=ae.name),ce})()}),null),k(O,v(rn,{}),null),V(ae=>{var ce=L(n().actionsSelect,"tsqd-query-details-actions-btn","tsqd-query-details-action-error-multiple"),me=t`
                  background-color: ${S.colors.red[400]};
                `,re=p()==="pending";return ce!==ae.e&&F(O,ae.e=ce),me!==ae.t&&F(te,ae.t=me),re!==ae.a&&(ie.disabled=ae.a=re),ae},{e:void 0,t:void 0,a:void 0}),O}}),null),k(tt,()=>i()==="view"?"Explorer":"Editor",null),k(C,v(B,{get when(){return i()==="view"},get children(){var O=Ud();return k(O,v(bt,{label:"Data",defaultExpanded:["Data"],get value(){return b()},editable:!0,onEdit:()=>u("edit"),get activeQuery(){return g()}})),V(te=>(te=S.size[2])!=null?O.style.setProperty("padding",te):O.style.removeProperty("padding")),O}}),Qe),k(C,v(B,{get when(){return i()==="edit"},get children(){var O=Vd(),te=O.firstChild,ve=te.nextSibling,ie=ve.firstChild,ae=ie.nextSibling,ce=ae.firstChild,me=ce.nextSibling;return O.addEventListener("submit",re=>{re.preventDefault();const ot=new FormData(re.currentTarget).get("data");try{const He=JSON.parse(ot);g().setState({...g().state,data:He}),u("view")}catch{f(!0)}}),te.addEventListener("focus",()=>f(!1)),k(ie,()=>h()?"Invalid Value":""),ce.$$click=()=>u("view"),V(re=>{var rt=L(n().devtoolsEditForm,"tsqd-query-details-data-editor"),ot=n().devtoolsEditTextarea,He=h(),kt=n().devtoolsEditFormActions,it=n().devtoolsEditFormError,Et=n().devtoolsEditFormActionContainer,st=L(n().devtoolsEditFormAction,t`
                      color: ${o(r.gray[600],r.gray[300])};
                    `),mt=L(n().devtoolsEditFormAction,t`
                      color: ${o(r.blue[600],r.blue[400])};
                    `);return rt!==re.e&&F(O,re.e=rt),ot!==re.t&&F(te,re.t=ot),He!==re.a&&M(te,"data-error",re.a=He),kt!==re.o&&F(ve,re.o=kt),it!==re.i&&F(ie,re.i=it),Et!==re.n&&F(ae,re.n=Et),st!==re.s&&F(ce,re.s=st),mt!==re.h&&F(me,re.h=mt),re},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),V(()=>te.value=JSON.stringify(b(),null,2)),O}}),Qe),k(nt,v(bt,{label:"Query",defaultExpanded:["Query","queryKey"],get value(){return d()}})),V(O=>{var te=L(n().detailsContainer,"tsqd-query-details-container"),ve=L(n().detailsHeader,"tsqd-query-details-header"),ie=L(n().detailsBody,"tsqd-query-details-summary-container"),ae=L(n().queryDetailsStatus,_()),ce=L(n().detailsHeader,"tsqd-query-details-header"),me=L(n().actionsBody,"tsqd-query-details-actions-container"),re=L(t`
                color: ${o(r.blue[600],r.blue[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-refetch"),rt=m()==="fetching",ot=t`
                background-color: ${o(r.blue[600],r.blue[400])};
              `,He=L(t`
                color: ${o(r.yellow[600],r.yellow[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-invalidate"),kt=p()==="pending",it=t`
                background-color: ${o(r.yellow[600],r.yellow[400])};
              `,Et=L(t`
                color: ${o(r.gray[600],r.gray[300])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-reset"),st=p()==="pending",mt=t`
                background-color: ${o(r.gray[600],r.gray[400])};
              `,hn=L(t`
                color: ${o(r.pink[500],r.pink[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-remove"),jt=m()==="fetching",yn=t`
                background-color: ${o(r.pink[500],r.pink[400])};
              `,Ot=L(t`
                color: ${o(r.cyan[500],r.cyan[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-loading"),vn=a(),Wt=t`
                background-color: ${o(r.cyan[500],r.cyan[400])};
              `,Qt=L(n().detailsHeader,"tsqd-query-details-header"),Yt=L(n().detailsHeader,"tsqd-query-details-header"),Lt=S.size[2];return te!==O.e&&F(C,O.e=te),ve!==O.t&&F(T,O.t=ve),ie!==O.a&&F(K,O.a=ie),ae!==O.o&&F(se,O.o=ae),ce!==O.i&&F(ge,O.i=ce),me!==O.n&&F(De,O.n=me),re!==O.s&&F(A,O.s=re),rt!==O.h&&(A.disabled=O.h=rt),ot!==O.r&&F(fe,O.r=ot),He!==O.d&&F(ee,O.d=He),kt!==O.l&&(ee.disabled=O.l=kt),it!==O.u&&F(yt,O.u=it),Et!==O.c&&F(j,O.c=Et),st!==O.w&&(j.disabled=O.w=st),mt!==O.m&&F(Ce,O.m=mt),hn!==O.f&&F(Se,O.f=hn),jt!==O.y&&(Se.disabled=O.y=jt),yn!==O.g&&F(It,O.g=yn),Ot!==O.p&&F(Pe,O.p=Ot),vn!==O.b&&(Pe.disabled=O.b=vn),Wt!==O.T&&F(vt,O.T=Wt),Qt!==O.A&&F(tt,O.A=Qt),Yt!==O.O&&F(Qe,O.O=Yt),Lt!==O.I&&((O.I=Lt)!=null?nt.style.setProperty("padding",Lt):nt.style.removeProperty("padding")),O},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0,T:void 0,A:void 0,O:void 0,I:void 0}),C}})},o0=()=>{const e=$e(),t=N().shadowDOMTarget?Y.bind({target:N().shadowDOMTarget}):Y,n=D(()=>e()==="dark"?We(t):je(t)),{colors:r}=S,o=(h,f)=>e()==="dark"?f:h,s=Ue(h=>{const c=h().getAll().find(g=>g.mutationId===pt());return c?c.state.isPaused:!1}),a=Ue(h=>{const c=h().getAll().find(g=>g.mutationId===pt());return c?c.state.status:"idle"}),l=D(()=>Rt({isPaused:s(),status:a()})),i=Ue(h=>h().getAll().find(f=>f.mutationId===pt()),!1),u=()=>l()==="gray"?t`
        background-color: ${o(r[l()][200],r[l()][700])};
        color: ${o(r[l()][700],r[l()][300])};
        border-color: ${o(r[l()][400],r[l()][600])};
      `:t`
      background-color: ${o(r[l()][100],r[l()][900])};
      color: ${o(r[l()][700],r[l()][300])};
      border-color: ${o(r[l()][400],r[l()][600])};
    `;return v(B,{get when(){return i()},get children(){var h=Wd(),f=h.firstChild,c=f.nextSibling,g=c.firstChild,d=g.firstChild,y=d.firstChild,b=d.nextSibling,m=g.nextSibling,p=m.firstChild,w=p.nextSibling,x=c.nextSibling,$=x.nextSibling,P=$.nextSibling,I=P.nextSibling,_=I.nextSibling,C=_.nextSibling,T=C.nextSibling,K=T.nextSibling;return k(y,v(B,{get when(){return i().options.mutationKey},fallback:"No mutationKey found",get children(){return wn(i().options.mutationKey,!0)}})),k(b,v(B,{get when(){return l()==="purple"},children:"pending"}),null),k(b,v(B,{get when(){return l()!=="purple"},get children(){return a()}}),null),k(w,()=>new Date(i().state.submittedAt).toLocaleTimeString()),k($,v(bt,{label:"Variables",defaultExpanded:["Variables"],get value(){return i().state.variables}})),k(I,v(bt,{label:"Context",defaultExpanded:["Context"],get value(){return i().state.context}})),k(C,v(bt,{label:"Data",defaultExpanded:["Data"],get value(){return i().state.data}})),k(K,v(bt,{label:"Mutation",defaultExpanded:["Mutation"],get value(){return i()}})),V(U=>{var ne=L(n().detailsContainer,"tsqd-query-details-container"),Z=L(n().detailsHeader,"tsqd-query-details-header"),se=L(n().detailsBody,"tsqd-query-details-summary-container"),R=L(n().queryDetailsStatus,u()),Q=L(n().detailsHeader,"tsqd-query-details-header"),J=S.size[2],le=L(n().detailsHeader,"tsqd-query-details-header"),ye=S.size[2],Me=L(n().detailsHeader,"tsqd-query-details-header"),ge=S.size[2],De=L(n().detailsHeader,"tsqd-query-details-header"),A=S.size[2];return ne!==U.e&&F(h,U.e=ne),Z!==U.t&&F(f,U.t=Z),se!==U.a&&F(c,U.a=se),R!==U.o&&F(b,U.o=R),Q!==U.i&&F(x,U.i=Q),J!==U.n&&((U.n=J)!=null?$.style.setProperty("padding",J):$.style.removeProperty("padding")),le!==U.s&&F(P,U.s=le),ye!==U.h&&((U.h=ye)!=null?I.style.setProperty("padding",ye):I.style.removeProperty("padding")),Me!==U.r&&F(_,U.r=Me),ge!==U.d&&((U.d=ge)!=null?C.style.setProperty("padding",ge):C.style.removeProperty("padding")),De!==U.l&&F(T,U.l=De),A!==U.u&&((U.u=A)!=null?K.style.setProperty("padding",A):K.style.removeProperty("padding")),U},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0}),h}})},En=new Map,i0=()=>{const e=D(()=>N().client.getQueryCache()),t=e().subscribe(n=>{Cs(()=>{for(const[r,o]of En.entries())o.shouldUpdate(n)&&o.setter(r(e))})});return G(()=>{En.clear(),t()}),t},be=(e,t=!0,n=()=>!0)=>{const r=D(()=>N().client.getQueryCache()),[o,s]=z(e(r),t?void 0:{equals:!1});return H(()=>{s(e(r))}),En.set(e,{setter:s,shouldUpdate:n}),G(()=>{En.delete(e)}),o},Dn=new Map,s0=()=>{const e=D(()=>N().client.getMutationCache()),t=e().subscribe(()=>{for(const[n,r]of Dn.entries())queueMicrotask(()=>{r(n(e))})});return G(()=>{Dn.clear(),t()}),t},Ue=(e,t=!0)=>{const n=D(()=>N().client.getMutationCache()),[r,o]=z(e(n),t?void 0:{equals:!1});return H(()=>{o(e(n))}),Dn.set(e,o),G(()=>{Dn.delete(e)}),r},a0="@tanstack/query-devtools-event",Ye=({type:e,queryHash:t,metadata:n})=>{const r=new CustomEvent(a0,{detail:{type:e,queryHash:t,metadata:n},bubbles:!0,cancelable:!0});window.dispatchEvent(r)},ms=(e,t)=>{const{colors:n,font:r,size:o,alpha:s,shadow:a,border:l}=S,i=(u,h)=>e==="light"?u:h;return{devtoolsBtn:t`
      z-index: 100000;
      position: fixed;
      padding: 4px;
      text-align: left;

      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      box-shadow: ${a.md()};
      overflow: hidden;

      & div {
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 9999px;

        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        filter: blur(6px) saturate(1.2) contrast(1.1);
      }

      &:focus-within {
        outline-offset: 2px;
        outline: 3px solid ${n.green[600]};
      }

      & button {
        position: relative;
        z-index: 1;
        padding: 0;
        border-radius: 9999px;
        background-color: transparent;
        border: none;
        height: 40px;
        display: flex;
        width: 40px;
        overflow: hidden;
        cursor: pointer;
        outline: none;
        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      }
    `,panel:t`
      position: fixed;
      z-index: 9999;
      display: flex;
      gap: ${S.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${i(n.gray[300],n.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${i(n.gray[400],n.darkGray[300])};
      }
    `,parentPanel:t`
      z-index: 9999;
      display: flex;
      height: 100%;
      gap: ${S.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${i(n.gray[300],n.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${i(n.gray[400],n.darkGray[300])};
      }
    `,"devtoolsBtn-position-bottom-right":t`
      bottom: 12px;
      right: 12px;
    `,"devtoolsBtn-position-bottom-left":t`
      bottom: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-left":t`
      top: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-right":t`
      top: 12px;
      right: 12px;
    `,"devtoolsBtn-position-relative":t`
      position: relative;
    `,"panel-position-top":t`
      top: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
    `,"panel-position-bottom":t`
      bottom: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
    `,"panel-position-right":t`
      bottom: 0;
      right: 0;
      top: 0;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      max-width: 90%;
    `,"panel-position-left":t`
      bottom: 0;
      left: 0;
      top: 0;
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      max-width: 90%;
    `,closeBtn:t`
      position: absolute;
      cursor: pointer;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline: 2px solid ${n.blue[600]};
      }
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
        width: ${o[2]};
        height: ${o[2]};
      }
    `,"closeBtn-position-top":t`
      bottom: 0;
      right: ${o[2]};
      transform: translate(0, 100%);
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: none;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: 0px 0px ${l.radius.sm} ${l.radius.sm};
      padding: ${o[.5]} ${o[1.5]} ${o[1]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }

      & svg {
        transform: rotate(180deg);
      }
    `,"closeBtn-position-bottom":t`
      top: 0;
      right: ${o[2]};
      transform: translate(0, -100%);
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: none;
      border-radius: ${l.radius.sm} ${l.radius.sm} 0px 0px;
      padding: ${o[1]} ${o[1.5]} ${o[.5]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }
    `,"closeBtn-position-right":t`
      bottom: ${o[2]};
      left: 0;
      transform: translate(-100%, 0);
      border-right: none;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: ${l.radius.sm} 0px 0px ${l.radius.sm};
      padding: ${o[1.5]} ${o[.5]} ${o[1.5]} ${o[1]};

      &::after {
        content: ' ';
        position: absolute;
        left: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(-90deg);
      }
    `,"closeBtn-position-left":t`
      bottom: ${o[2]};
      right: 0;
      transform: translate(100%, 0);
      border-left: none;
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: 0px ${l.radius.sm} ${l.radius.sm} 0px;
      padding: ${o[1.5]} ${o[1]} ${o[1.5]} ${o[.5]};

      &::after {
        content: ' ';
        position: absolute;
        right: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(90deg);
      }
    `,queriesContainer:t`
      flex: 1 1 700px;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      display: flex;
      flex-direction: column;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
    `,dragHandle:t`
      position: absolute;
      transition: background-color 0.125s ease;
      &:hover {
        background-color: ${n.purple[400]}${i("",s[90])};
      }
      z-index: 4;
    `,"dragHandle-position-top":t`
      bottom: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-bottom":t`
      top: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-right":t`
      left: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,"dragHandle-position-left":t`
      right: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,row:t`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${S.size[2]} ${S.size[2.5]};
      gap: ${S.size[2.5]};
      border-bottom: ${i(n.gray[300],n.darkGray[500])} 1px solid;
      align-items: center;
      & > button {
        padding: 0;
        background: transparent;
        border: none;
        display: flex;
        gap: ${o[.5]};
        flex-direction: column;
      }
    `,logoAndToggleContainer:t`
      display: flex;
      gap: ${S.size[3]};
      align-items: center;
    `,logo:t`
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      border: none;
      gap: ${S.size[.5]};
      padding: 0px;
      &:hover {
        opacity: 0.7;
      }
      &:focus-visible {
        outline-offset: 4px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,tanstackLogo:t`
      font-size: ${r.size.md};
      font-weight: ${r.weight.bold};
      line-height: ${r.lineHeight.xs};
      white-space: nowrap;
      color: ${i(n.gray[600],n.gray[300])};
    `,queryFlavorLogo:t`
      font-weight: ${r.weight.semibold};
      font-size: ${r.size.xs};
      background: linear-gradient(
        to right,
        ${i("#ea4037, #ff9b11","#dd524b, #e9a03b")}
      );
      background-clip: text;
      -webkit-background-clip: text;
      line-height: 1;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    `,queryStatusContainer:t`
      display: flex;
      gap: ${S.size[2]};
      height: min-content;
    `,queryStatusTag:t`
      display: flex;
      gap: ${S.size[1.5]};
      box-sizing: border-box;
      height: ${S.size[6.5]};
      background: ${i(n.gray[50],n.darkGray[500])};
      color: ${i(n.gray[700],n.gray[300])};
      border-radius: ${S.border.radius.sm};
      font-size: ${r.size.sm};
      padding: ${S.size[1]};
      padding-left: ${S.size[1.5]};
      align-items: center;
      font-weight: ${r.weight.medium};
      border: ${i("1px solid "+n.gray[300],"1px solid transparent")};
      user-select: none;
      position: relative;
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
    `,queryStatusTagLabel:t`
      font-size: ${r.size.xs};
    `,queryStatusCount:t`
      font-size: ${r.size.xs};
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${i(n.gray[500],n.gray[400])};
      background-color: ${i(n.gray[200],n.darkGray[300])};
      border-radius: 2px;
      font-variant-numeric: tabular-nums;
      height: ${S.size[4.5]};
    `,statusTooltip:t`
      position: absolute;
      z-index: 1;
      background-color: ${i(n.gray[50],n.darkGray[500])};
      top: 100%;
      left: 50%;
      transform: translate(-50%, calc(${S.size[2]}));
      padding: ${S.size[.5]} ${S.size[2]};
      border-radius: ${S.border.radius.sm};
      font-size: ${r.size.xs};
      border: 1px solid ${i(n.gray[400],n.gray[600])};
      color: ${i(n.gray[600],n.gray[300])};

      &::before {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, -100%);
        position: absolute;
        border-color: transparent transparent
          ${i(n.gray[400],n.gray[600])} transparent;
        border-style: solid;
        border-width: 7px;
        /* transform: rotate(180deg); */
      }

      &::after {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, calc(-100% + 2px));
        position: absolute;
        border-color: transparent transparent
          ${i(n.gray[100],n.darkGray[500])} transparent;
        border-style: solid;
        border-width: 7px;
      }
    `,filtersContainer:t`
      display: flex;
      gap: ${S.size[2]};
      & > button {
        cursor: pointer;
        padding: ${S.size[.5]} ${S.size[1.5]} ${S.size[.5]}
          ${S.size[2]};
        border-radius: ${S.border.radius.sm};
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: 1px solid ${i(n.gray[300],n.darkGray[200])};
        color: ${i(n.gray[700],n.gray[300])};
        font-size: ${r.size.xs};
        display: flex;
        align-items: center;
        line-height: ${r.lineHeight.sm};
        gap: ${S.size[1.5]};
        max-width: 160px;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${l.radius.xs};
          outline: 2px solid ${n.blue[800]};
        }
        & svg {
          width: ${S.size[3]};
          height: ${S.size[3]};
          color: ${i(n.gray[500],n.gray[400])};
        }
      }
    `,filterInput:t`
      padding: ${o[.5]} ${o[2]};
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      display: flex;
      box-sizing: content-box;
      align-items: center;
      gap: ${S.size[1.5]};
      max-width: 160px;
      min-width: 100px;
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      height: min-content;
      color: ${i(n.gray[600],n.gray[400])};
      & > svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      & input {
        font-size: ${r.size.xs};
        width: 100%;
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: none;
        padding: 0;
        line-height: ${r.lineHeight.sm};
        color: ${i(n.gray[700],n.gray[300])};
        &::placeholder {
          color: ${i(n.gray[700],n.gray[300])};
        }
        &:focus {
          outline: none;
        }
      }

      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,filterSelect:t`
      padding: ${S.size[.5]} ${S.size[2]};
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      display: flex;
      align-items: center;
      gap: ${S.size[1.5]};
      box-sizing: content-box;
      max-width: 160px;
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      height: min-content;
      & > svg {
        color: ${i(n.gray[600],n.gray[400])};
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
      & > select {
        appearance: none;
        color: ${i(n.gray[700],n.gray[300])};
        min-width: 100px;
        line-height: ${r.lineHeight.sm};
        font-size: ${r.size.xs};
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: none;
        &:focus {
          outline: none;
        }
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,actionsContainer:t`
      display: flex;
      gap: ${S.size[2]};
    `,actionsBtn:t`
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      width: ${S.size[6.5]};
      height: ${S.size[6.5]};
      justify-content: center;
      display: flex;
      align-items: center;
      gap: ${S.size[1.5]};
      max-width: 160px;
      cursor: pointer;
      padding: 0;
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      & svg {
        color: ${i(n.gray[700],n.gray[300])};
        width: ${S.size[3]};
        height: ${S.size[3]};
      }
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,actionsBtnOffline:t`
      & svg {
        stroke: ${i(n.yellow[700],n.yellow[500])};
        fill: ${i(n.yellow[700],n.yellow[500])};
      }
    `,overflowQueryContainer:t`
      flex: 1;
      overflow-y: auto;
      & > div {
        display: flex;
        flex-direction: column;
      }
    `,queryRow:t`
      display: flex;
      align-items: center;
      padding: 0;
      border: none;
      cursor: pointer;
      color: ${i(n.gray[700],n.gray[300])};
      background-color: ${i(n.gray[50],n.darkGray[700])};
      line-height: 1;
      &:focus {
        outline: none;
      }
      &:focus-visible {
        outline-offset: -2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      &:hover .tsqd-query-hash {
        background-color: ${i(n.gray[200],n.darkGray[600])};
      }

      & .tsqd-query-observer-count {
        padding: 0 ${S.size[1]};
        user-select: none;
        min-width: ${S.size[6.5]};
        align-self: stretch;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${r.size.xs};
        font-weight: ${r.weight.medium};
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[700])};
      }
      & .tsqd-query-hash {
        user-select: text;
        font-size: ${r.size.xs};
        display: flex;
        align-items: center;
        min-height: ${S.size[6]};
        flex: 1;
        padding: ${S.size[1]} ${S.size[2]};
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
        text-align: left;
        text-overflow: clip;
        word-break: break-word;
      }

      & .tsqd-query-disabled-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${S.size[2]};
        color: ${i(n.gray[800],n.gray[300])};
        background-color: ${i(n.gray[300],n.darkGray[600])};
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
        font-size: ${r.size.xs};
      }

      & .tsqd-query-static-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${S.size[2]};
        color: ${i(n.teal[800],n.teal[300])};
        background-color: ${i(n.teal[100],n.teal[900])};
        border-bottom: 1px solid ${i(n.teal[300],n.teal[700])};
        font-size: ${r.size.xs};
      }
    `,selectedQueryRow:t`
      background-color: ${i(n.gray[200],n.darkGray[500])};
    `,detailsContainer:t`
      flex: 1 1 700px;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      color: ${i(n.gray[700],n.gray[300])};
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      display: flex;
      text-align: left;
    `,detailsHeader:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: ${i(n.gray[200],n.darkGray[600])};
      padding: ${S.size[1.5]} ${S.size[2]};
      font-weight: ${r.weight.medium};
      font-size: ${r.size.xs};
      line-height: ${r.lineHeight.xs};
      text-align: left;
    `,detailsBody:t`
      margin: ${S.size[1.5]} 0px ${S.size[2]} 0px;
      & > div {
        display: flex;
        align-items: stretch;
        padding: 0 ${S.size[2]};
        line-height: ${r.lineHeight.sm};
        justify-content: space-between;
        & > span {
          font-size: ${r.size.xs};
        }
        & > span:nth-child(2) {
          font-variant-numeric: tabular-nums;
        }
      }

      & > div:first-child {
        margin-bottom: ${S.size[1.5]};
      }

      & code {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        margin: 0;
        font-size: ${r.size.xs};
        line-height: ${r.lineHeight.xs};
      }

      & pre {
        margin: 0;
        display: flex;
        align-items: center;
      }
    `,queryDetailsStatus:t`
      border: 1px solid ${n.darkGray[200]};
      border-radius: ${S.border.radius.sm};
      font-weight: ${r.weight.medium};
      padding: ${S.size[1]} ${S.size[2.5]};
    `,actionsBody:t`
      flex-wrap: wrap;
      margin: ${S.size[2]} 0px ${S.size[2]} 0px;
      display: flex;
      gap: ${S.size[2]};
      padding: 0px ${S.size[2]};
      & > button {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
        font-size: ${r.size.xs};
        padding: ${S.size[1]} ${S.size[2]};
        display: flex;
        border-radius: ${S.border.radius.sm};
        background-color: ${i(n.gray[100],n.darkGray[600])};
        border: 1px solid ${i(n.gray[300],n.darkGray[400])};
        align-items: center;
        gap: ${S.size[2]};
        font-weight: ${r.weight.medium};
        line-height: ${r.lineHeight.xs};
        cursor: pointer;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${l.radius.xs};
          outline: 2px solid ${n.blue[800]};
        }
        &:hover {
          background-color: ${i(n.gray[200],n.darkGray[500])};
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        & > span {
          width: ${o[1.5]};
          height: ${o[1.5]};
          border-radius: ${S.border.radius.full};
        }
      }
    `,actionsSelect:t`
      font-size: ${r.size.xs};
      padding: ${S.size[.5]} ${S.size[2]};
      display: flex;
      border-radius: ${S.border.radius.sm};
      overflow: hidden;
      background-color: ${i(n.gray[100],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[400])};
      align-items: center;
      gap: ${S.size[2]};
      font-weight: ${r.weight.medium};
      line-height: ${r.lineHeight.sm};
      color: ${i(n.red[500],n.red[400])};
      cursor: pointer;
      position: relative;
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      & > span {
        width: ${o[1.5]};
        height: ${o[1.5]};
        border-radius: ${S.border.radius.full};
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      & select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        appearance: none;
        background-color: transparent;
        border: none;
        color: transparent;
        outline: none;
      }

      & svg path {
        stroke: ${S.colors.red[400]};
      }
      & svg {
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
    `,settingsMenu:t`
      display: flex;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
      flex-direction: column;
      gap: ${o[.5]};
      border-radius: ${S.border.radius.sm};
      border: 1px solid ${i(n.gray[300],n.gray[700])};
      background-color: ${i(n.gray[50],n.darkGray[600])};
      font-size: ${r.size.xs};
      color: ${i(n.gray[700],n.gray[300])};
      z-index: 99999;
      min-width: 120px;
      padding: ${o[.5]};
    `,settingsSubTrigger:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: ${S.border.radius.xs};
      padding: ${S.size[1]} ${S.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      color: ${i(n.gray[700],n.gray[300])};
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
        transform: rotate(-90deg);
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
      &.data-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,settingsMenuHeader:t`
      padding: ${S.size[1]} ${S.size[1]};
      font-weight: ${r.weight.medium};
      border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
      color: ${i(n.gray[500],n.gray[400])};
      font-size: ${r.size.xs};
    `,settingsSubButton:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${i(n.gray[700],n.gray[300])};
      font-size: ${r.size.xs};
      border-radius: ${S.border.radius.xs};
      padding: ${S.size[1]} ${S.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
    `,themeSelectedButton:t`
      background-color: ${i(n.purple[100],n.purple[900])};
      color: ${i(n.purple[700],n.purple[300])};
      & svg {
        color: ${i(n.purple[700],n.purple[300])};
      }
      &:hover {
        background-color: ${i(n.purple[100],n.purple[900])};
      }
    `,viewToggle:t`
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[200],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      display: flex;
      padding: 0;
      font-size: ${r.size.xs};
      color: ${i(n.gray[700],n.gray[300])};
      overflow: hidden;

      &:has(:focus-visible) {
        outline: 2px solid ${n.blue[800]};
      }

      & .tsqd-radio-toggle {
        opacity: 0.5;
        display: flex;
        & label {
          display: flex;
          align-items: center;
          cursor: pointer;
          line-height: ${r.lineHeight.md};
        }

        & label:hover {
          background-color: ${i(n.gray[100],n.darkGray[500])};
        }
      }

      & > [data-checked] {
        opacity: 1;
        background-color: ${i(n.gray[100],n.darkGray[400])};
        & label:hover {
          background-color: ${i(n.gray[100],n.darkGray[400])};
        }
      }

      & .tsqd-radio-toggle:first-child {
        & label {
          padding: 0 ${S.size[1.5]} 0 ${S.size[2]};
        }
        border-right: 1px solid ${i(n.gray[300],n.darkGray[200])};
      }

      & .tsqd-radio-toggle:nth-child(2) {
        & label {
          padding: 0 ${S.size[2]} 0 ${S.size[1.5]};
        }
      }
    `,devtoolsEditForm:t`
      padding: ${o[2]};
      & > [data-error='true'] {
        outline: 2px solid ${i(n.red[200],n.red[800])};
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
      }
    `,devtoolsEditTextarea:t`
      width: 100%;
      max-height: 500px;
      font-family: 'Fira Code', monospace;
      font-size: ${r.size.xs};
      border-radius: ${l.radius.sm};
      field-sizing: content;
      padding: ${o[2]};
      background-color: ${i(n.gray[100],n.darkGray[800])};
      color: ${i(n.gray[900],n.gray[100])};
      border: 1px solid ${i(n.gray[200],n.gray[700])};
      resize: none;
      &:focus {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${i(n.blue[200],n.blue[800])};
      }
    `,devtoolsEditFormActions:t`
      display: flex;
      justify-content: space-between;
      gap: ${o[2]};
      align-items: center;
      padding-top: ${o[1]};
      font-size: ${r.size.xs};
    `,devtoolsEditFormError:t`
      color: ${i(n.red[700],n.red[500])};
    `,devtoolsEditFormActionContainer:t`
      display: flex;
      gap: ${o[2]};
    `,devtoolsEditFormAction:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      font-size: ${r.size.xs};
      padding: ${o[1]} ${S.size[2]};
      display: flex;
      border-radius: ${l.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[400])};
      align-items: center;
      gap: ${o[2]};
      font-weight: ${r.weight.medium};
      line-height: ${r.lineHeight.xs};
      cursor: pointer;
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `}},je=e=>ms("light",e),We=e=>ms("dark",e);or(["click","mousedown","input"]);var l0=e=>{const[t,n]=Vs({prefix:"TanstackQueryDevtools"}),r=_s(),o=D(()=>{const s=t.theme_preference||Qs;return s!=="system"?s:r()});return v(Ko.Provider,{value:e,get children(){return v(ea,{localStore:t,setLocalStore:n,get children(){return v(No.Provider,{value:o,get children(){return v(Yd,{localStore:t,setLocalStore:n})}})}})}})},d0=l0;export{d0 as default};
