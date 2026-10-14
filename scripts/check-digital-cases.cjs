const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const path=require('path');
const root=path.resolve(__dirname,'..');
const fs=require('fs');
const server=require('child_process').spawn('python3',['-m','http.server','8098','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
process.on('exit',()=>server.kill());
(async()=>{
 for(let i=0;i<20;i++){try{await fetch('http://127.0.0.1:8098/');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox'],headless:true});
 const out=path.join(root,'review/digital-cases');fs.mkdirSync(out,{recursive:true});
 let checks=0;const errors=[];
 for(const width of [320,390,768,1440]) for(const lang of ['ru','en','sr']) for(const path of ['works.html','work/graphite.html','work/telegram-job-assistant.html']){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(path+': '+e.message));
  await page.goto('http://127.0.0.1:8098/'+path+'?lang='+lang,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  for(const img of await page.locator('img[loading="lazy"]').all()){
   if(await img.isVisible()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
  }
  await page.evaluate(()=>scrollTo(0,0));
  const data=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.getClientRects().length && (!i.complete||!i.naturalWidth)).map(i=>i.src),lang:document.documentElement.lang}));
  if(data.scroll>width+1) throw Error('Overflow '+JSON.stringify({width,lang,path,data}));
  if(data.broken.length) throw Error('Broken images '+data.broken.join(','));
  if(data.lang!==(lang==='sr'?'sr-Latn':lang))throw Error('Language not applied');
  for(const el of await page.locator('a[href]').all()){
   const href=await el.getAttribute('href');
   if(href.startsWith('http://127.0.0.1:8098/')||!/^([a-z]+:|#)/.test(href)){
    const url=new URL(href,page.url());const response=await page.request.get(url.href);if(!response.ok())throw Error('Link '+url+' '+response.status());
   }
  }
  if(path==='works.html') {
   const names=await page.locator('.works-catalog .row__name').allTextContents();
   if(JSON.stringify(names)!==JSON.stringify(['EMRA','NŌRA Studio','Alea Linen','OFF HOURS','Veyra',lang==='en'?'Darya T.':lang==='sr'?'Darja T.':'Дарья Т.']))throw Error('Existing order changed: '+JSON.stringify(names));
   const newCount=await page.locator('.digital-project').count();if(newCount!==2)throw Error('New count');
  }
  if(width===390&&lang==='ru'){
   await page.getByRole('button',{name:'Открыть меню',exact:true}).click();
   if(!(await page.locator('#site-nav').getAttribute('class')).includes('is-open'))throw Error('Menu did not open');
   await page.keyboard.press('Escape');
  }
  if(lang==='ru'&&(width===390||width===1440))await page.screenshot({path:out+'/'+path.replace('work/','').replace('.html','')+'-'+width+'.png',fullPage:true});
  if(lang!=='ru'){
   const untranslated=await page.locator('.digital-projects, .digital-case').evaluateAll(els=>els.flatMap(el=>{const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const r=[];let n;while(n=w.nextNode())if(/[А-Яа-яЁё]/.test(n.nodeValue))r.push(n.nodeValue.trim());return r;}));
   if(untranslated.length)throw Error('Untranslated '+JSON.stringify(untranslated));
  }
  checks++;await page.close();
 }
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS '+checks+' page/viewport/language combinations; local links, images, menu and project order.');
 await browser.close();server.kill();
})().catch(e=>{console.error(e);process.exit(1)});
