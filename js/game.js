/* Норт против Ноэля — match-three */
(()=>{
'use strict';
const board=document.querySelector('#board');
if(!board)return;
const scoreEl=document.querySelector('#score'),bestEl=document.querySelector('#best'),status=document.querySelector('#gameStatus');
const N=8;
const ICONS=[
  {id:'i-cat',label:'Норт',color:'#b7a5ff'},
  {id:'i-snow',label:'Ноэль',color:'#f4f4fb'},
  {id:'i-moon',label:'Луна',color:'#7c88ff'},
  {id:'i-heart',label:'Сердце',color:'#c77dff'}
];
let cells=[],selected=-1,score=0,busy=false,run=0,best=0;
try{best=+localStorage.getItem('northling-best')||0}catch{}
const rand=()=>Math.floor(Math.random()*ICONS.length);
const adj=(a,b)=>Math.abs(Math.floor(a/N)-Math.floor(b/N))+Math.abs(a%N-b%N)===1;

function newBoard(){
  cells=[];
  for(let i=0;i<N*N;i++){
    let t;
    do{t=rand()}while((i%N>1&&cells[i-1]===t&&cells[i-2]===t)||(i>=2*N&&cells[i-N]===t&&cells[i-2*N]===t));
    cells.push(t);
  }
}
function matches(){
  const found=new Set();
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const i=r*N+c,t=cells[i];
    if(t<0)continue;
    let len=1;while(c+len<N&&cells[i+len]===t)len++;
    if(len>=3)for(let k=0;k<len;k++)found.add(i+k);
    len=1;while(r+len<N&&cells[i+len*N]===t)len++;
    if(len>=3)for(let k=0;k<len;k++)found.add(i+k*N);
  }
  return [...found];
}
function hasMoves(){
  for(let i=0;i<N*N;i++)for(const j of [i+1,i+N]){
    if(j>=N*N||(j===i+1&&j%N===0))continue;
    [cells[i],cells[j]]=[cells[j],cells[i]];
    const ok=matches().length>0;
    [cells[i],cells[j]]=[cells[j],cells[i]];
    if(ok)return true;
  }
  return false;
}
function render(popping=[]){
  board.innerHTML='';
  cells.forEach((t,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='tile'+(selected===i?' sel':'')+(popping.includes(i)?' pop':'');
    b.innerHTML=`<svg class="i" style="color:${ICONS[t].color}" aria-hidden="true"><use href="#${ICONS[t].id}"/></svg>`;
    b.setAttribute('aria-label',ICONS[t].label+', ряд '+(Math.floor(i/N)+1)+', колонка '+(i%N+1));
    b.setAttribute('aria-pressed',String(selected===i));
    b.addEventListener('click',()=>pick(i));
    board.appendChild(b);
  });
  scoreEl.textContent=score;
  if(bestEl)bestEl.textContent=best;
}
function settle(token){
  if(token!==run)return;
  const found=matches();
  if(!found.length){
    busy=false;
    if(!hasMoves()){status.textContent='Ходов не осталось — поле перемешано.';newBoard();}
    render();return;
  }
  score+=found.length*10;
  if(score>best){best=score;try{localStorage.setItem('northling-best',String(best))}catch{}}
  render(found);
  setTimeout(()=>{
    if(token!==run)return;
    found.forEach(i=>cells[i]=-1);
    for(let c=0;c<N;c++){
      const stack=[];
      for(let r=N-1;r>=0;r--)if(cells[r*N+c]>=0)stack.push(cells[r*N+c]);
      while(stack.length<N)stack.push(rand());
      for(let r=N-1;r>=0;r--)cells[r*N+c]=stack[N-1-r];
    }
    render();
    setTimeout(()=>settle(token),160);
  },230);
}
function pick(i){
  if(busy)return;
  if(selected<0){selected=i;status.textContent='Теперь нажми на соседнюю плитку.';render();return}
  if(selected===i){selected=-1;status.textContent='Выбери плитку, затем соседнюю.';render();return}
  if(!adj(selected,i)){selected=i;status.textContent='Нужна соседняя плитка.';render();return}
  const a=selected;selected=-1;
  [cells[a],cells[i]]=[cells[i],cells[a]];
  if(!matches().length){
    [cells[a],cells[i]]=[cells[i],cells[a]];
    status.textContent='Совпадения нет — попробуй другой ход.';render();return;
  }
  busy=true;status.textContent='Есть совпадение!';render();settle(run);
}
function start(){
  run++;score=0;selected=-1;busy=false;
  do{newBoard()}while(!hasMoves());
  status.textContent='Выбери плитку, затем соседнюю.';
  render();
}
document.querySelector('#newGame').addEventListener('click',start);
start();
})();
