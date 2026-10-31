(() => {
const $ = id => document.getElementById(id);
const fields = ['mainText','verseText','verseSource','verseLabel','hadithText','hadithSource','narrator','quoteText','quoteAuthor','verseEnabled','hadithEnabled','format','fontFamily','accentColor','textScale','imageOpacity','imagePosition'];
const state = {template:'emerald', image:null, order:['main','verse','hadith','quote'], zoom:1};
const card = $('card');
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val = id => $(id).value;
const checked = id => $(id).checked;
function block(key) {
  if(key==='main' && val('mainText').trim()) return `<div class="content-block main-block">${esc(val('mainText')).replace(/\n/g,'<br>')}</div>`;
  if(key==='verse' && checked('verseEnabled') && val('verseText').trim()) return `<div class="content-block verse-block">${val('verseLabel').trim()?`<div class="verse-label">${esc(val('verseLabel'))}</div>`:''}${esc(val('verseText')).replace(/\n/g,'<br>')}${val('verseSource').trim()?`<div class="source">${esc(val('verseSource'))}</div>`:''}</div>`;
  if(key==='hadith' && checked('hadithEnabled') && val('hadithText').trim()) return `<div class="content-block hadith-block">${esc(val('hadithText')).replace(/\n/g,'<br>')}${val('hadithSource').trim()||val('narrator').trim()?`<div class="source">${[val('narrator'),val('hadithSource')].filter(Boolean).map(esc).join(' • ')}</div>`:''}</div>`;
  if(key==='quote' && val('quoteText').trim()) return `<div class="content-block quote-block">${esc(val('quoteText')).replace(/\n/g,'<br>')}${val('quoteAuthor').trim()?`<div class="quote-author">— ${esc(val('quoteAuthor'))}</div>`:''}</div>`;
  return '';
}
function render(){
  card.className=`card theme-${state.template} format-${val('format')}`;
  card.style.setProperty('--accent',val('accentColor'));
  card.style.setProperty('--scale',Number(val('textScale'))/100);
  card.style.fontFamily=`"${val('fontFamily')}",sans-serif`;
  $('cardContent').innerHTML=state.order.map(block).filter(Boolean).join('');
  if(!$('cardContent').innerHTML) $('cardContent').innerHTML='<div class="content-block main-block" style="opacity:.45">ابدأ بكتابة محتواك هنا<br>لتظهر معاينته في هذه المساحة</div>';
  const img=$('cardImage');
  img.className='card-image'+(state.image?' visible':'')+(state.image&&val('imagePosition')!=='cover'?' '+val('imagePosition'):'');
  img.style.backgroundImage=state.image?`url("${state.image}")`:'none';
  img.style.opacity=state.image?Number(val('imageOpacity'))/100:0;
  const dims={square:'1080 × 1080',portrait:'1080 × 1350',story:'1080 × 1920'};
  $('previewSize').textContent=dims[val('format')];
}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
fields.forEach(id=>$(id).addEventListener('input',render));
document.querySelectorAll('.template').forEach(btn=>btn.addEventListener('click',()=>{state.template=btn.dataset.template;document.querySelectorAll('.template').forEach(x=>x.classList.toggle('active',x===btn));render()}));
$('imageInput').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/'))return toast('يرجى اختيار ملف صورة');if(f.size>12*1024*1024)return toast('حجم الصورة يجب أن يكون أقل من 12MB');const r=new FileReader();r.onload=()=>{state.image=r.result;$('imageControls').hidden=false;render();toast('تمت إضافة الصورة')};r.readAsDataURL(f)});
$('removeImage').onclick=()=>{state.image=null;$('imageInput').value='';$('imageControls').hidden=true;render()};
$('clearBtn').onclick=()=>{if(!confirm('هل تريد مسح جميع الحقول؟'))return;fields.forEach(id=>{const el=$(id);if(el.type==='checkbox')el.checked=true;else if(id==='format')el.value='square';else if(id==='fontFamily')el.value='Cairo';else if(id==='accentColor')el.value='#d9b66f';else if(id==='textScale'||id==='imageOpacity')el.value=id==='textScale'?100:38;else if(id==='imagePosition')el.value='cover';else el.value=''});state.image=null;$('imageControls').hidden=true;render();toast('تم مسح المحتوى')};
$('autoBtn').onclick=()=>{const keys=['main','verse','hadith','quote'];state.order.sort((a,b)=>keys.indexOf(a)-keys.indexOf(b));$('orderList').innerHTML='';state.order.forEach(addOrderItem);if(val('verseText').trim()&&!val('mainText').trim())$('topLabel').textContent='آيَةٌ مِنَ الْقُرْآنِ الْكَرِيم';else $('topLabel').textContent='تَذْكِرَةٌ طَيِّبَة';render();toast('تم ترتيب المحتوى تلقائياً')};
function addOrderItem(key){const names={main:'النص الأساسي',verse:'الآية القرآنية',hadith:'الحديث النبوي',quote:'القول والاقتباس'};const d=document.createElement('div');d.className='order-item';d.draggable=true;d.dataset.key=key;d.innerHTML=`<span>⠿</span>${names[key]}`;d.addEventListener('dragstart',()=>{d.classList.add('dragging')});d.addEventListener('dragend',()=>{d.classList.remove('dragging');state.order=[...$('orderList').children].map(x=>x.dataset.key);render()});d.addEventListener('dragover',e=>{e.preventDefault();const dragging=$('.dragging');if(dragging&&dragging!==d){const r=d.getBoundingClientRect();$('orderList').insertBefore(dragging,e.clientY<r.top+r.height/2?d:d.nextSibling)}});$('orderList').appendChild(d)}
$('orderList').innerHTML='';state.order.forEach(addOrderItem);
function snapshot(){const data={};fields.forEach(id=>data[id]=$(id).type==='checkbox'?checked(id):val(id));return {data,template:state.template,image:state.image,order:state.order.slice(),created:Date.now()}}
function load(s){fields.forEach(id=>{if(s.data&&s.data[id]!==undefined){if($(id).type==='checkbox')$(id).checked=s.data[id];else $(id).value=s.data[id]}});state.template=s.template||'emerald';state.image=s.image||null;state.order=s.order||['main','verse','hadith','quote'];document.querySelectorAll('.template').forEach(x=>x.classList.toggle('active',x.dataset.template===state.template));$('imageControls').hidden=!state.image;$('orderList').innerHTML='';state.order.forEach(addOrderItem);render()}
function getSaved(){try{return JSON.parse(localStorage.getItem('faithCards')||'[]')}catch{return []}}
function setSaved(a){localStorage.setItem('faithCards',JSON.stringify(a));$('savedCount').textContent=a.length}
$('savedCount').textContent=getSaved().length;
$('saveBtn').onclick=()=>{const name=prompt('اكتب اسماً لهذا التصميم:','تصميم ديني جديد');if(name===null)return;const a=getSaved();a.unshift({name:name.trim()||'تصميم بلا اسم',...snapshot()});setSaved(a.slice(0,40));toast('تم حفظ التصميم على جهازك')};
function showSaved(){const a=getSaved();$('savedList').innerHTML='';if(!a.length){$('savedList').innerHTML='<div class="empty">لا توجد تصميمات محفوظة بعد.</div>'}a.forEach((s,i)=>{const row=document.createElement('div');row.className='saved-row';const title=document.createElement('span');title.textContent=s.name;const actions=document.createElement('div');const open=document.createElement('button');open.textContent='فتح';open.onclick=()=>{load(s);$('savedModal').hidden=true;toast('تم فتح التصميم')};const del=document.createElement('button');del.textContent='حذف';del.onclick=()=>{if(confirm('حذف هذا التصميم؟')){const list=getSaved();list.splice(i,1);setSaved(list);showSaved()}};actions.append(open,del);row.append(title,actions);$('savedList').append(row)});$('savedModal').hidden=false}
$('savedBtn').onclick=showSaved;$('closeModal').onclick=()=>$('savedModal').hidden=true;$('savedModal').addEventListener('click',e=>{if(e.target===$('savedModal'))$('savedModal').hidden=true});
$('themeBtn').onclick=()=>document.body.classList.toggle('light-mode');
$('zoomIn').onclick=()=>{state.zoom=Math.min(1.25,state.zoom+.1);card.style.transform=`scale(${state.zoom})`};
$('zoomOut').onclick=()=>{state.zoom=Math.max(.7,state.zoom-.1);card.style.transform=`scale(${state.zoom})`};
async function exportCard(){
  const clone=card.cloneNode(true);clone.style.transform='none';clone.style.width=val('format')==='story'?'1080px':'1080px';clone.style.height=val('format')==='square'?'1080px':val('format')==='portrait'?'1350px':'1920px';clone.style.aspectRatio='auto';clone.style.position='fixed';clone.style.left='-12000px';clone.style.top='0';clone.style.borderRadius='0';clone.querySelector('.card-inner').style.inset='68px 65px';clone.querySelector('.card-top').style.fontSize='24px';clone.querySelectorAll('.content-block').forEach(el=>{el.style.fontSize=(parseFloat(getComputedStyle(el).fontSize)*2.4)+'px';el.style.lineHeight='1.8'});clone.querySelectorAll('.source,.verse-label,.quote-author').forEach(el=>el.style.fontSize='22px');clone.querySelector('.card-footer').style.fontSize='20px';clone.querySelector('.card-pattern').style.inset='28px';document.body.appendChild(clone);
  try{await document.fonts.ready;const html2canvasScript=document.createElement('script');html2canvasScript.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';document.head.appendChild(html2canvasScript);await new Promise((res,rej)=>{html2canvasScript.onload=res;html2canvasScript.onerror=rej});const canvas=await html2canvas(clone,{backgroundColor:null,scale:1,useCORS:true,width:1080,height:clone.offsetHeight,windowWidth:1200});const a=document.createElement('a');a.download='بطاقتي-الايمانية.png';a.href=canvas.toDataURL('image/png');a.click();toast('تم تصدير البطاقة بنجاح')}catch(e){console.error(e);toast('تعذر التصدير. تحقق من اتصال الإنترنت وأعد المحاولة')}finally{clone.remove()}
}
$('exportTop').onclick=exportCard;
render();
})();