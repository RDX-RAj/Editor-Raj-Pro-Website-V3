window.EDITOR_RAJ_CONFIG=window.EDITOR_RAJ_CONFIG||{};
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const body=document.body,audio=$('#audio'),heroPlay=$('#heroPlay'),miniPlay=$('#miniPlay'),wave=$('#wave'),miniPlayer=$('#miniPlayer'),progress=$('#progress'),toast=$('#toast');
const CHANNEL_ID='UCXBXbRGKFvyH83jjgCVD2gQ';
const FALLBACK=[
{id:'mQGjBsBttLE',title:'Featured Lofi Edit',category:'haryanvi',views:'Popular',date:'Featured'},
{id:'cnVmRi_q0l0',title:'Late Night Melody',category:'rajasthani',views:'Popular',date:'Featured'},
{id:'OmGzOoHEJbo',title:'Cinematic Reverb Mix',category:'bollywood',views:'Popular',date:'Featured'},
{id:'mQGjBsBttLE',title:'Slowed + Reverb Music Vibes',category:'dj',views:'Editor Raj',date:'Playlist'},
{id:'cnVmRi_q0l0',title:'Best Headphone Lofi Experience',category:'haryanvi',views:'Editor Raj',date:'Playlist'},
{id:'OmGzOoHEJbo',title:'Midnight Music Edit',category:'rajasthani',views:'Editor Raj',date:'Playlist'}
];
let latestVideos=[],activeFilter='all';
addEventListener('load',()=>setTimeout(()=>body.classList.add('loaded'),300));
addEventListener('scroll',()=>{$('#topbar').classList.toggle('scrolled',scrollY>30);miniPlayer.classList.toggle('show',scrollY>430)});
$('#menuBtn').onclick=()=>$('#navLinks').classList.toggle('open');$$('#navLinks a').forEach(a=>a.onclick=()=>$('#navLinks').classList.remove('open'));
const saved=localStorage.getItem('editor-raj-theme');if(saved==='light')body.classList.add('light');
function themeIcon(){$('#themeBtn').innerHTML=body.classList.contains('light')?'<i class="fa-solid fa-sun"></i>':'<i class="fa-solid fa-moon"></i>'}themeIcon();
$('#themeBtn').onclick=()=>{body.classList.toggle('light');localStorage.setItem('editor-raj-theme',body.classList.contains('light')?'light':'dark');themeIcon()};
function syncAudio(){const n=audio.paused?'play':'pause';heroPlay.innerHTML=`<i class="fa-solid fa-${n}"></i>`;miniPlay.innerHTML=`<i class="fa-solid fa-${n}"></i>`;wave.classList.toggle('playing',!audio.paused)}
async function toggleAudio(){try{audio.paused?await audio.play():audio.pause();syncAudio()}catch(e){showToast('music.mp3 upload nahi hai ya audio blocked hai')}}
heroPlay.onclick=toggleAudio;miniPlay.onclick=toggleAudio;audio.onplay=syncAudio;audio.onpause=syncAudio;audio.ontimeupdate=()=>{if(audio.duration)progress.style.width=(audio.currentTime/audio.duration*100)+'%'};
$('#year').textContent=new Date().getFullYear();$('#topBtn').onclick=()=>scrollTo({top:0,behavior:'smooth'});
$('#shareBtn').onclick=async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);showToast('Website link copied')}}catch(e){}};
function showToast(t){toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2200)}
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.12});$$('.reveal').forEach(x=>io.observe(x));
function fmt(n){n=Number(n||0);if(n>=1e9)return(n/1e9).toFixed(1)+'B';if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return String(n)}
function card(v){const thumb=v.thumbnail||`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;return `<article class="video-card reveal show" data-category="${v.category||'all'}"><a class="thumb" target="_blank" href="https://www.youtube.com/watch?v=${v.id}"><img loading="lazy" src="${thumb}" alt="${escapeHtml(v.title)}"><span class="play-overlay"><i class="fa-solid fa-play"></i></span></a><div class="video-info"><small>${(v.category||'lofi').toUpperCase()} • EDITOR RAJ</small><h3>${escapeHtml(v.title)}</h3><div class="video-meta"><span><i class="fa-regular fa-eye"></i> ${v.views||'—'}</span><span>${v.date||''}</span></div></div></article>`}
function escapeHtml(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function renderLatest(){const q=$('#videoSearch').value.toLowerCase().trim();const f=latestVideos.filter(v=>(activeFilter==='all'||v.category===activeFilter)&&v.title.toLowerCase().includes(q));$('#latestGrid').innerHTML=f.length?f.map(card).join(''):'<p class="no-results">Koi matching video nahi mila.</p>'}
function renderPopular(vs){$('#popularGrid').innerHTML=vs.slice(0,6).map(card).join('')}
function guessCategory(title=''){const t=title.toLowerCase();if(/dj|remix/.test(t))return'dj';if(/rajasthani|marwadi|meena/.test(t))return'rajasthani';if(/bollywood|hindi/.test(t))return'bollywood';return'haryanvi'}
async function api(path){const base=(window.EDITOR_RAJ_CONFIG.API_BASE||'').replace(/\/$/,'');if(!base)throw new Error('No proxy');const r=await fetch(base+path);if(!r.ok)throw new Error('API');return r.json()}
async function loadLive(){
 try{
  const [stats,latest,popular]=await Promise.all([api(`/channel?channelId=${CHANNEL_ID}`),api(`/latest?channelId=${CHANNEL_ID}&maxResults=9`),api(`/popular?channelId=${CHANNEL_ID}&maxResults=6`)]);
  $('#subscriberCount').textContent=fmt(stats.subscriberCount);$('#viewCount').textContent=fmt(stats.viewCount);$('#videoCount').textContent=fmt(stats.videoCount);
  latestVideos=(latest.items||[]).map(x=>({...x,category:guessCategory(x.title),views:fmt(x.views),date:x.publishedAt?new Date(x.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}));
  const pop=(popular.items||[]).map(x=>({...x,category:guessCategory(x.title),views:fmt(x.views),date:x.publishedAt?new Date(x.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}));
  $('#dataStatus').textContent='Live YouTube data connected';renderLatest();renderPopular(pop);
 }catch(e){
  latestVideos=FALLBACK;renderLatest();renderPopular(FALLBACK.slice().reverse());$('#dataStatus').textContent='Showing featured videos. Connect the secure proxy for real-time stats, latest and popular uploads.';
 }finally{$('#latestSkeleton').classList.add('hide')}
}
$('#videoSearch').oninput=renderLatest;$$('#filters button').forEach(b=>b.onclick=()=>{$$('#filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeFilter=b.dataset.filter;renderLatest()});
const canvas=$('#particles'),ctx=canvas.getContext('2d');let dots=[];function resize(){canvas.width=innerWidth;canvas.height=innerHeight;dots=Array.from({length:Math.min(90,Math.floor(innerWidth/14))},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.7+.2,s:Math.random()*.35+.08,a:Math.random()*.42+.1}))}function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);dots.forEach(d=>{d.y+=d.s;if(d.y>canvas.height){d.y=-2;d.x=Math.random()*canvas.width}ctx.fillStyle=`rgba(215,205,255,${d.a})`;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill()});requestAnimationFrame(animate)}resize();animate();addEventListener('resize',resize);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
loadLive();