(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;


const themeButton=$('.theme-toggle');
const applyTheme=theme=>{
 document.documentElement.dataset.theme=theme;
 try{localStorage.setItem('northling-theme',theme)}catch{}
 if(themeButton){themeButton.innerHTML=theme==='light'?'<svg class="i" aria-hidden="true"><use href="#i-sun"/></svg>':'<svg class="i" aria-hidden="true"><use href="#i-moon"/></svg>';}
};
let savedTheme='dark';try{savedTheme=localStorage.getItem('northling-theme')||'dark'}catch{}
applyTheme(savedTheme);
if(themeButton)themeButton.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));
\n/* ——— меню ——— */
const toggle=$('.nav-toggle'),nav=$('nav');
if(toggle&&nav){
  const set=open=>{
    nav.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
    document.documentElement.classList.toggle('menu-open',open);
  };
  toggle.addEventListener('click',()=>set(!nav.classList.contains('open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){set(false);toggle.focus()}});
  $$('a',nav).forEach(a=>a.addEventListener('click',()=>set(false)));
  matchMedia('(min-width: 761px)').addEventListener('change',e=>{if(e.matches)set(false)});
}

/* ——— появление при скролле (через translate/opacity, чтобы не ломать hover) ——— */
const targets=$$('.rv');
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  targets.forEach(el=>{
    const sibs=el.parentElement?[...el.parentElement.children].filter(c=>c.classList.contains('rv')):[];
    el.style.setProperty('--d',Math.min(sibs.indexOf(el),5)*.08+'s');
    io.observe(el);
  });
}else targets.forEach(el=>el.classList.add('in'));

/* ——— подсветка карточек за курсором ——— */
if(fine){
  $$('.card').forEach(c=>c.addEventListener('pointermove',e=>{
    const r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  }));
}

/* ——— лёгкий 3D-наклон главной картинки ——— */
const frame=$('.frame');
if(frame&&fine&&!reduce){
  const box=frame.parentElement;
  box.addEventListener('pointermove',e=>{
    const r=box.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    frame.style.transform=`perspective(900px) rotateY(${x*9}deg) rotateX(${-y*9}deg)`;
  });
  box.addEventListener('pointerleave',()=>{frame.style.transform=''});
}

/* ——— приветствия ——— */
const hello=$('#welcome');
if(hello){
  const list=['Привет. Я northling.','Кого сюда занесло? Добро пожаловать!','Hey, it’s me, it’s northling!','Заходит как-то на northling.space анон, а это вы.','Ну всё, вась, связь.','У нас тут есть печеньки, заходи!','Васап мабой!','WELCOME TO MY SPACE'];
  let last=-1;
  const show=()=>{
    let i;do{i=Math.floor(Math.random()*list.length)}while(i===last&&list.length>1);
    last=i;hello.textContent=list[i];
    hello.classList.toggle('long',list[i].length>20);
  };
  show();
  const again=$('#again');
  if(again)again.addEventListener('click',show);
}

/* ——— копирование (Discord) ——— */
const toast=$('.toast');let tt;
const say=t=>{if(!toast)return;toast.textContent=t;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('show'),2200)};
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const v=b.dataset.copy;
  try{await navigator.clipboard.writeText(v)}
  catch{
    const t=document.createElement('textarea');t.value=v;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();
    try{document.execCommand('copy')}catch{}
    t.remove();
  }
  say('Скопировано: '+v);
}));

/* ——— лайтбокс с листанием, включая галереи, загруженные из CMS ——— */
const lb=$('#lightbox');
if(lb){
  const img=$('img',lb),cap=$('figcaption',lb);
  let items=[],cur=0,opener=null,sx=null;
  const refresh=()=>{
    items=$$('[data-full]');
    items.forEach((button,i)=>{
      if(button.dataset.lightboxBound)return;
      button.dataset.lightboxBound='true';
      button.addEventListener('click',()=>open(i));
    });
  };
  const show=i=>{
    if(!items.length)return;
    cur=(i+items.length)%items.length;
    const button=items[cur];
    img.src=button.dataset.full;img.alt=button.dataset.alt||'';
    cap.textContent=button.dataset.alt||'';
  };
  const open=i=>{refresh();opener=items[i];show(i);lb.hidden=false;document.documentElement.classList.add('menu-open');$('.close',lb).focus()};
  const close=()=>{lb.hidden=true;img.removeAttribute('src');document.documentElement.classList.remove('menu-open');if(opener)opener.focus()};
  $('.close',lb).addEventListener('click',close);
  $('.prev',lb).addEventListener('click',()=>show(cur-1));
  $('.next',lb).addEventListener('click',()=>show(cur+1));
  lb.addEventListener('click',e=>{if(e.target===lb)close()});
  document.addEventListener('keydown',e=>{
    if(lb.hidden)return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')show(cur-1);
    if(e.key==='ArrowRight')show(cur+1);
    if(e.key==='Tab'){
      const f=$$('button',lb),first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  lb.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',e=>{
    if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;
    if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));
  });
  refresh();
  document.addEventListener('gallery:updated',refresh);
}
})();
