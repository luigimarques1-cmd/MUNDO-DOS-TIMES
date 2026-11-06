/* Catálogo premium adaptável — JavaScript puro. */
(() => {
  'use strict';
  const cfg = typeof configuracao === 'object' ? configuracao : null;
  if (!cfg || !Array.isArray(cfg.ligas)) {
    document.getElementById('conteudo').textContent = 'Não foi possível carregar os dados do catálogo.';
    return;
  }
  const $ = (selector, base=document) => base.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const normalize = (v) => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  const iconArrow = (dir) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','2.1');
    svg.setAttribute('stroke-linecap','round');
    svg.setAttribute('stroke-linejoin','round');
    svg.setAttribute('aria-hidden','true');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',dir === 'left' ? 'M18 12H6m5.5 5.5L6 12l5.5-5.5' : 'M6 12h12m-5.5-5.5L18 12l-5.5 5.5');
    svg.append(path);
    return svg;
  };
  const allClubs = [];
  const carouselStates = [];
  const reducesMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanWhatsapp = (value) => String(value || '').replace(/\D/g,'');
  const asUrl = (u) => /^https:\/\//i.test(u || '') ? u : '';
  const instagramHref = asUrl(cfg.loja?.instagram);

  function makeWhatsappIcon(){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','currentColor');
    svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M12.04 2A9.94 9.94 0 0 0 2.1 11.92a9.8 9.8 0 0 0 1.34 4.96L2 22l5.29-1.38A9.96 9.96 0 1 0 12.04 2Zm0 18.12a8.15 8.15 0 0 1-4.16-1.14l-.3-.18-3.14.82.84-3.05-.2-.31A8.2 8.2 0 1 1 12.04 20.12Zm4.51-6.13c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.22-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.38.11-.5.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.22-.16-.46-.29Z');
    svg.append(path);return svg;
  }
  const whatsappNumber = cleanWhatsapp(cfg.loja?.whatsapp);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  function renderFloatingWhatsapp(){
    if(!whatsappHref) return;
    const link=el('a','whatsapp-floating');
    link.href=whatsappHref;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.title='Abrir conversa no WhatsApp';
    link.setAttribute('aria-label','Conversar conosco pelo WhatsApp (abre em nova aba)');
    link.append(makeWhatsappIcon());
    $('#floating-contact').append(link);
  }
  function makeClub(club,isClone=false){
    const href=asUrl(club.link);
    const card=el(href?'a':'div','club-card'+(href?'':' is-unavailable'));
    if(href){card.href=href;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`Abrir catálogo de ${club.nome}`)}
    else{card.setAttribute('title',`Catálogo de ${club.nome} ainda não disponível`)}
    if(isClone){card.setAttribute('aria-hidden','true');if(href) card.tabIndex=-1}
    const circle=el('span','club-circle');
    const image=el('img');image.src=club.imagem;image.alt='';image.width=100;image.height=100;
    image.loading='lazy';image.decoding='async';image.draggable=false;
    const fallback=el('span','club-fallback',club.nome.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toLocaleUpperCase('pt-BR'));
    fallback.setAttribute('aria-hidden','true');
    image.addEventListener('load',()=>circle.classList.add('has-image'),{once:true});
    image.addEventListener('error',()=>circle.classList.add('has-fallback'),{once:true});
    circle.append(image,fallback);
    card.append(circle,el('span','club-name',club.nome.toLocaleUpperCase('pt-BR')));
    return card;
  }
  function makeSet(clubs,isClone){
    const set=el('div','carousel-set');
    if(isClone)set.setAttribute('aria-hidden','true');
    clubs.forEach(club=>set.append(makeClub(club,isClone)));
    return set;
  }
  function makeCarousel(liga){
    const shell=el('div','carousel');
    const viewport=el('div','carousel-viewport');viewport.setAttribute('aria-label',`Clubes de ${liga.nome}`);
    viewport.setAttribute('role','region');viewport.setAttribute('aria-roledescription','carrossel');
    viewport.tabIndex=0;
    const track=el('div','carousel-track');
    const first=makeSet(liga.clubes,true),middle=makeSet(liga.clubes,false),last=makeSet(liga.clubes,true);
    track.append(first,middle,last);viewport.append(track);shell.append(viewport);
    const controls=el('div','carousel-controls');
    for (const dir of ['left','right']) {
      const arrow=el('button','carousel-arrow');arrow.type='button';
      arrow.setAttribute('aria-label',dir==='left'?`Voltar clubes de ${liga.nome}`:`Avançar clubes de ${liga.nome}`);
      arrow.append(iconArrow(dir));
      arrow.addEventListener('click',()=>{
        state.pauseUntil=performance.now()+4000;
        const distance=viewport.querySelector('.club-card').getBoundingClientRect().width+
          parseFloat(getComputedStyle(first).gap || 0);
        viewport.scrollBy({left:(dir==='left'?-1:1)*distance*2,behavior:reducesMotion.matches?'instant':'smooth'});
      });
      controls.append(arrow);
    }
    shell.append(controls);
    const state={viewport,first,segment:0,visible:true,hovered:false,focused:false,dragging:false,pauseUntil:0};
    carouselStates.push(state);
    const resetScroll=()=>{
      const newWidth=first.getBoundingClientRect().width;
      if(newWidth<1) return;
      if(state.segment){
        const fraction=(viewport.scrollLeft-state.segment)/state.segment;
        viewport.scrollLeft=newWidth+fraction*newWidth;
      }else viewport.scrollLeft=newWidth;
      state.segment=newWidth;
    };
    requestAnimationFrame(resetScroll);
    if('ResizeObserver' in window){
      const observer=new ResizeObserver(resetScroll);observer.observe(first);
    }else window.addEventListener('resize',resetScroll,{passive:true});
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting},{threshold:.04});
      observer.observe(shell);
    }
    viewport.addEventListener('mouseenter',()=>state.hovered=true);
    viewport.addEventListener('mouseleave',()=>state.hovered=false);
    viewport.addEventListener('focusin',()=>state.focused=true);
    viewport.addEventListener('focusout',()=>state.focused=viewport.contains(document.activeElement));
    viewport.addEventListener('touchstart',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
    viewport.addEventListener('touchmove',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
    let dragStartX=0,dragStartScroll=0,suppressClickUntil=0,dragMoved=false;
    viewport.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch'||e.button!==0) return;
      state.dragging=true;dragMoved=false;dragStartX=e.clientX;dragStartScroll=viewport.scrollLeft;
      state.pauseUntil=performance.now()+5000;
    });
    viewport.addEventListener('pointermove',e=>{
      if(!state.dragging) return;
      const delta=e.clientX-dragStartX;
      if(Math.abs(delta)>5){
        if(!dragMoved){dragMoved=true;viewport.classList.add('is-dragging')}
        viewport.scrollLeft=dragStartScroll-delta;
        e.preventDefault();
      }
    });
    const dragEnd=()=>{
      if(!state.dragging) return;
      state.dragging=false;viewport.classList.remove('is-dragging');
      if(dragMoved){suppressClickUntil=Date.now()+350;dragMoved=false}
    };
    viewport.addEventListener('pointerup',dragEnd);
    viewport.addEventListener('pointercancel',dragEnd);
    viewport.addEventListener('pointerleave',dragEnd);
    viewport.addEventListener('click',e=>{
      if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}
    },true);
    // Pausar apenas nas entradas do usuário: scroll gerado pelo próprio autoplay não deve interromper o loop.
    viewport.addEventListener('wheel',()=>{state.pauseUntil=performance.now()+4000},{passive:true});
    viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))state.pauseUntil=performance.now()+4000;});
    return shell;
  }
  function renderSections(){
    const root=$('#conteudo');
    cfg.ligas.forEach((liga,i)=>{
      const section=el('section','liga-section');section.id=liga.id;
      section.setAttribute('aria-label',liga.nome);
      const banner=el('div','banner-container');
      const image=el('img');image.src=liga.bannerMobile && window.matchMedia('(max-width: 619px)').matches ? liga.bannerMobile:liga.bannerDesktop;
      image.alt=`Banner ${liga.nome}`;image.width=1080;image.height=608;
      image.loading=i===0?'eager':'lazy';image.decoding='async';
      if(i===0) image.setAttribute('fetchpriority','high');
      banner.append(image);
      section.append(banner,makeCarousel(liga));root.append(section);
      liga.clubes.forEach(club=>allClubs.push({club,liga}));
    });
  }
  function renderNavigation(){
    const nav=$('#navigation-content');
    const home=el('a','nav-top-link','INÍCIO');home.href='#inicio';nav.append(home);
    nav.append(el('span','nav-heading','COMPRE POR LIGA'));
    cfg.ligas.forEach(liga=>{
      const details=el('details','nav-league');
      const summary=el('summary','',liga.nome.toLocaleUpperCase('pt-BR'));
      const items=el('div','nav-items');
      liga.clubes.forEach(club=>{
        const href=asUrl(club.link);
        const node=el(href?'a':'span',href?'':'no-link',club.nome.toLocaleUpperCase('pt-BR'));
        if(href){node.href=href;node.target='_blank';node.rel='noopener noreferrer'}
        else node.title='Catálogo indisponível';
        items.append(node);
      });
      details.append(summary,items);nav.append(details);
    });
    const collectionsLink=el('a','nav-top-link nav-collections-link','OUTRAS COLEÇÕES');
    collectionsLink.href='#outras-colecoes';nav.append(collectionsLink);
    if(whatsappHref){
      const contato=el('a','nav-contact-link','WHATSAPP');
      contato.href=whatsappHref;contato.target='_blank';contato.rel='noopener noreferrer';
      contato.setAttribute('aria-label','Entrar em contato pelo WhatsApp (abre em nova aba)');
      nav.append(contato);
    }
    if(instagramHref){
      const insta=el('a','nav-contact-link','INSTAGRAM');
      insta.href=instagramHref;insta.target='_blank';insta.rel='noopener noreferrer';
      insta.setAttribute('aria-label','Abrir Instagram da loja (abre em nova aba)');
      nav.append(insta);
    }
  }
  let openOverlay=null,lastFocused=null;
  const overlays={nav:$('#nav-overlay'),search:$('#search-overlay')};
  const triggers={nav:$('#menu-button'),search:$('#search-button')};
  const panels={nav:$('#navigation-panel'),search:$('#search-panel')};
  function openPanel(type){
    if(openOverlay)closePanel(false);
    lastFocused=document.activeElement;
    overlays[type].hidden=false;document.body.classList.add('overlay-open');
    triggers[type].setAttribute('aria-expanded','true');openOverlay=type;
    requestAnimationFrame(()=>{if(type==='search')$('#search-input').focus();else $('#close-menu').focus()});
  }
  function closePanel(restoreFocus=true){
    if(!openOverlay)return;
    const type=openOverlay;overlays[type].hidden=true;document.body.classList.remove('overlay-open');
    triggers[type].setAttribute('aria-expanded','false');openOverlay=null;
    if(restoreFocus && lastFocused instanceof HTMLElement)lastFocused.focus();
  }
  $('#menu-button').addEventListener('click',()=>openPanel('nav'));
  $('#search-button').addEventListener('click',()=>openPanel('search'));
  $('#close-menu').addEventListener('click',()=>closePanel());
  $('#close-search').addEventListener('click',()=>closePanel());
  document.querySelectorAll('[data-close]').forEach(node=>node.addEventListener('click',()=>closePanel()));
  $('#navigation-content').addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#"]');if(anchor)closePanel(false);
  });
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault();openPanel('search');return;
    }
    if(!openOverlay)return;
    if(e.key==='Escape'){e.preventDefault();closePanel();return;}
    if(e.key==='Tab'){
      const panel=panels[openOverlay];
      const focusables=[...panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(node=>node.getClientRects().length);
      if(!focusables.length){e.preventDefault();panel.focus();return;}
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  function searchResult(label,detail,onClick,disabled=false){
    const node=el('button','search-row'+(disabled?' is-unavailable':''));node.type='button';node.disabled=disabled;
    node.append(el('span','',label.toLocaleUpperCase('pt-BR')),el('small','',detail.toLocaleUpperCase('pt-BR')));
    if(!disabled)node.addEventListener('click',onClick);
    return node;
  }
  function renderSearch(query){
    const results=$('#search-results');results.replaceChildren();
    const word=normalize(query);
    if(!word){results.append(el('p','search-message','Digite o nome de uma liga, clube ou seleção.'));return;}
    const frag=document.createDocumentFragment();let count=0;
    cfg.ligas.forEach(liga=>{
      if(normalize(liga.nome).includes(word)){
        frag.append(searchResult(liga.nome,'LIGA',()=>{
          closePanel(false);document.getElementById(liga.id)?.scrollIntoView({behavior:reducesMotion.matches?'instant':'smooth'});
        }));count++;
      }
    });
    if(normalize('Outras Coleções').includes(word)){
      frag.append(searchResult('Outras Coleções','SEÇÃO',()=>{
        closePanel(false);document.getElementById('outras-colecoes')?.scrollIntoView({behavior:reducesMotion.matches?'instant':'smooth'});
      }));count++;
    }
    allClubs.forEach(({club,liga})=>{
      if(count>=70)return;
      if(normalize(club.nome).includes(word)){
        const href=asUrl(club.link);
        frag.append(searchResult(club.nome,href?liga.nome:'SEM CATÁLOGO',()=>{
          if(href){window.open(href,'_blank','noopener,noreferrer')}
        },!href));count++;
      }
    });
    if(!count)results.append(el('p','search-message','Nenhum resultado encontrado.'));
    else results.append(frag);
  }
  $('#search-input').addEventListener('input',e=>renderSearch(e.target.value));

  function renderMainCarousel(){
    const entries=(Array.isArray(cfg.loja?.bannersPrincipais)?cfg.loja.bannersPrincipais:[]).slice(0,4);
    const slides=$('#hero-slides');
    const dots=$('#hero-dots');
    const carousel=$('#hero-carousel');
    const advanceMs=Math.max(2500,Math.min(20000,Number(cfg.loja?.trocaAutomaticaSegundos || 5)*1000));
    let current=0, lastUserAction=0, touchStartX=null;
    const slideNodes=[],dotNodes=[];
    entries.forEach((item,i)=>{
      const desktop=asUrl(item.desktop);
      const mobile=asUrl(item.mobile);
      const href=asUrl(item.link);
      const slide=el(href?'a':'div','hero-slide');
      if(href){slide.href=href;slide.target='_blank';slide.rel='noopener noreferrer';}
      slide.setAttribute('aria-label',item.alt||`Banner ${i+1}`);
      const imgUrl=desktop||mobile;
      if(imgUrl){
        const picture=el('picture');
        if(mobile){const source=el('source');source.media='(max-width:619px)';source.srcset=mobile;picture.append(source)}
        const img=el('img');img.src=imgUrl;img.alt=item.alt||`Banner ${i+1} de ${cfg.loja.nome}`;
        img.width=1080;img.height=1440;img.decoding='async';img.loading=i===0?'eager':'lazy';
        if(i===0)img.setAttribute('fetchpriority','high');
        picture.append(img);slide.append(picture);
      }else{
        const placeholder=el('div','hero-placeholder');
        const kicker=el('span','hero-placeholder__kicker','COLEÇÃO EM DESTAQUE');
        const center=el('div','hero-placeholder__center');
        center.append(el('strong','',cfg.loja.nome||'NOVA LOJA'),el('span','',`Banner ${String(i+1).padStart(2,'0')} — personalize com sua imagem`));
        const bottom=el('div','hero-placeholder__bottom');
        bottom.append(el('span','','CATÁLOGO PREMIUM'),el('span','',`${String(i+1).padStart(2,'0')} / 04`));
        placeholder.append(kicker,center,bottom);slide.append(placeholder);
      }
      slides.append(slide);slideNodes.push(slide);
      const dot=el('button','hero-dot');dot.type='button';dot.setAttribute('aria-label',`Exibir banner ${i+1}`);
      dot.addEventListener('click',()=>{lastUserAction=Date.now();show(i,true)});
      dots.append(dot);dotNodes.push(dot);
    });
    if(!slideNodes.length){carousel.hidden=true;return}
    function show(next,announce){
      current=(next+slideNodes.length)%slideNodes.length;
      slideNodes.forEach((node,i)=>{
        const active=i===current;
        node.classList.toggle('is-active',active);
        node.setAttribute('aria-hidden',String(!active));
        if(node.tagName==='A')node.tabIndex=active?0:-1;
      });
      dotNodes.forEach((node,i)=>{node.classList.toggle('is-active',i===current);node.setAttribute('aria-pressed',String(i===current))});
      if(announce)$('#hero-live').textContent=`Banner ${current+1} de ${slideNodes.length}`;
    }
    function manuallyStep(amount){lastUserAction=Date.now();show(current+amount,true)}
    $('#hero-prev').addEventListener('click',()=>manuallyStep(-1));
    $('#hero-next').addEventListener('click',()=>manuallyStep(1));
    carousel.addEventListener('keydown',(event)=>{
      if(event.key==='ArrowLeft'){event.preventDefault();manuallyStep(-1)}
      if(event.key==='ArrowRight'){event.preventDefault();manuallyStep(1)}
    });
    carousel.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0]?.clientX??null;lastUserAction=Date.now()},{passive:true});
    carousel.addEventListener('touchend',e=>{
      if(touchStartX===null)return;
      const delta=(e.changedTouches[0]?.clientX??touchStartX)-touchStartX;
      touchStartX=null;
      if(Math.abs(delta)>55)manuallyStep(delta<0?1:-1);
    },{passive:true});
    show(0,false);
    if(slideNodes.length<2){$('#hero-prev').hidden=true;$('#hero-next').hidden=true;dots.hidden=true;return;}
    let inView=true;
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting},{threshold:.05});observer.observe(carousel);
    }
    window.setInterval(()=>{
      if(document.hidden||!inView||reducesMotion.matches||carousel.matches(':hover')||carousel.contains(document.activeElement)||Date.now()-lastUserAction<advanceMs)return;
      show(current+1,false);
    },advanceMs);
  }

  // "Outras Coleções": banner horizontal (1080x608) + carrossel quadrado (1:1).
  // Cada imagem quadrada recebe o nome da coleção, em letras maiúsculas, logo abaixo.
  function renderOutrasColecoes(){
    const data=cfg.loja?.outrasColecoes || {};
    const section=el('section','liga-section other-collections-section');
    section.id='outras-colecoes';
    section.setAttribute('aria-label','Outras Coleções');

    const banner=el('div','banner-container other-collections-banner');
    const desktop=asUrl(data.bannerDesktop);
    const mobile=asUrl(data.bannerMobile);
    if(desktop||mobile){
      const picture=el('picture');
      if(mobile){
        const source=el('source');source.media='(max-width:619px)';source.srcset=mobile;
        picture.append(source);
      }
      const img=el('img');img.src=desktop||mobile;
      img.alt='Banner de Outras Coleções';img.width=1080;img.height=608;
      img.loading='lazy';img.decoding='async';
      picture.append(img);banner.append(picture);
    }else{
      const placeholder=el('div','other-collections-banner-placeholder');
      placeholder.setAttribute('aria-label','Espaço reservado ao banner horizontal de Outras Coleções (1080 por 608 pixels)');
      banner.append(placeholder);
    }
    section.append(banner);

    const entries=Array.isArray(data.imagens)?data.imagens.slice(0,30):[];
    if(entries.length){
      const shell=el('div','carousel collection-carousel');
      const viewport=el('div','carousel-viewport collection-viewport');
      viewport.setAttribute('role','region');
      viewport.setAttribute('aria-roledescription','carrossel');
      viewport.setAttribute('aria-label','Imagens das Outras Coleções');
      viewport.tabIndex=0;
      const track=el('div','carousel-track');
      const createSet=(clone)=>{
        const set=el('div','carousel-set collection-set');
        if(clone)set.setAttribute('aria-hidden','true');
        entries.forEach((item,i)=>{
          const href=asUrl(item?.link);
          const src=asUrl(item?.imagem);
          const nome=String(item?.nome || item?.alt || `Coleção ${String(i+1).padStart(2,'0')}`).trim().toLocaleUpperCase('pt-BR');
          const card=el(href?'a':'div','collection-card'+(src?'':' collection-card--empty'));
          if(href){
            card.href=href;card.target='_blank';card.rel='noopener noreferrer';
            card.setAttribute('aria-label',`Abrir ${nome}`);
            if(clone)card.tabIndex=-1;
          }
          const media=el('div','collection-card-media');
          if(src){
            const img=el('img');img.src=src;
            img.alt=clone?'':`Imagem da coleção ${nome}`;
            img.width=1080;img.height=1080;img.loading='lazy';img.decoding='async';
            img.draggable=false;media.append(img);
          }else{
            media.append(el('span','collection-card-placeholder'));
          }
          card.append(media,el('span','collection-card-name',nome));
          set.append(card);
        });
        return set;
      };
      const first=createSet(true),middle=createSet(false),last=createSet(true);
      track.append(first,middle,last);viewport.append(track);shell.append(viewport);
      const controls=el('div','carousel-controls');
      const state={viewport,first,segment:0,visible:true,hovered:false,focused:false,dragging:false,pauseUntil:0};
      carouselStates.push(state); // compartilha o mesmo movimento automático dos escudos
      for(const dir of ['left','right']){
        const arrow=el('button','carousel-arrow');arrow.type='button';
        arrow.setAttribute('aria-label',dir==='left'?'Voltar imagens de Outras Coleções':'Avançar imagens de Outras Coleções');
        arrow.append(iconArrow(dir));
        arrow.addEventListener('click',()=>{
          state.pauseUntil=performance.now()+4500;
          const card=viewport.querySelector('.collection-card');
          const distance=card.getBoundingClientRect().width + parseFloat(getComputedStyle(first).gap||0);
          viewport.scrollBy({left:(dir==='left'?-1:1)*distance*2,behavior:reducesMotion.matches?'instant':'smooth'});
        });
        controls.append(arrow);
      }
      shell.append(controls);section.append(shell);
      const resetScroll=()=>{
        const width=first.getBoundingClientRect().width;
        if(width<1)return;
        if(state.segment){
          const fraction=(viewport.scrollLeft-state.segment)/state.segment;
          viewport.scrollLeft=width+fraction*width;
        }else viewport.scrollLeft=width;
        state.segment=width;
      };
      requestAnimationFrame(resetScroll);
      if('ResizeObserver' in window){
        const observer=new ResizeObserver(resetScroll);observer.observe(first);
      }else window.addEventListener('resize',resetScroll,{passive:true});
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(items=>{state.visible=items[0].isIntersecting},{threshold:.04});
        observer.observe(shell);
      }
      viewport.addEventListener('mouseenter',()=>state.hovered=true);
      viewport.addEventListener('mouseleave',()=>state.hovered=false);
      viewport.addEventListener('focusin',()=>state.focused=true);
      viewport.addEventListener('focusout',()=>state.focused=viewport.contains(document.activeElement));
      viewport.addEventListener('touchstart',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
      viewport.addEventListener('touchmove',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
      viewport.addEventListener('wheel',()=>{state.pauseUntil=performance.now()+4000},{passive:true});
      viewport.addEventListener('keydown',event=>{
        if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))state.pauseUntil=performance.now()+4000;
      });
      let pointerStartX=0,pointerStartScroll=0,dragMoved=false,suppressClickUntil=0;
      viewport.addEventListener('pointerdown',event=>{
        if(event.pointerType==='touch'||event.button!==0)return;
        state.dragging=true;dragMoved=false;pointerStartX=event.clientX;pointerStartScroll=viewport.scrollLeft;
        state.pauseUntil=performance.now()+5000;
      });
      viewport.addEventListener('pointermove',event=>{
        if(!state.dragging)return;
        const delta=event.clientX-pointerStartX;
        if(Math.abs(delta)>5){
          dragMoved=true;viewport.classList.add('is-dragging');
          viewport.scrollLeft=pointerStartScroll-delta;event.preventDefault();
        }
      });
      const endDrag=()=>{
        if(!state.dragging)return;
        state.dragging=false;viewport.classList.remove('is-dragging');
        if(dragMoved){suppressClickUntil=Date.now()+350;dragMoved=false;}
      };
      viewport.addEventListener('pointerup',endDrag);
      viewport.addEventListener('pointercancel',endDrag);
      viewport.addEventListener('pointerleave',endDrag);
      viewport.addEventListener('click',event=>{
        if(Date.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}
      },true);
    }
    $('#conteudo').append(section);
  }

  // Banner vertical único, posicionado após todas as ligas e antes do rodapé.
  // Usa a mesma proporção 3:4 dos quatro banners principais.
  function renderFinalBanner(){
    const item=cfg.loja?.bannerFinal || {};
    const desktop=asUrl(item.desktop);
    const mobile=asUrl(item.mobile);
    const href=asUrl(item.link);
    const section=el('section','closing-banner-section');
    section.id='banner-final';
    section.setAttribute('aria-label','Banner final da loja');
    const banner=el(href?'a':'div','closing-banner');
    if(href){banner.href=href;banner.target='_blank';banner.rel='noopener noreferrer';}
    if(desktop || mobile){
      const picture=el('picture');
      if(mobile){
        const source=el('source');source.media='(max-width:619px)';source.srcset=mobile;
        picture.append(source);
      }
      const img=el('img');
      img.src=desktop||mobile;
      img.alt=item.alt||`Banner final de ${cfg.loja?.nome||'NOVA LOJA'}`;
      img.width=1080;img.height=1440;
      img.loading='lazy';img.decoding='async';
      picture.append(img);banner.append(picture);
    }else{
      const placeholder=el('div','closing-banner-placeholder');
      placeholder.append(
        el('span','closing-banner-placeholder__eyebrow','ESPAÇO PARA BANNER FINAL'),
        el('strong','closing-banner-placeholder__size','1080 × 1440 px'),
        el('span','closing-banner-placeholder__note','Cole a URL em configuracao.js → loja → bannerFinal → desktop')
      );
      banner.append(placeholder);
    }
    section.append(banner);
    $('#conteudo').append(section);
  }

  renderMainCarousel();renderFloatingWhatsapp();renderSections();renderOutrasColecoes();renderFinalBanner();renderNavigation();renderSearch('');
  const brandLogo=$('#brand-logo-image');
  const brandPlaceholder=$('#brand-placeholder');
  const headerWhatsapp=$('#header-whatsapp');
  const headerInstagram=$('#header-instagram');
  const logoUrl=asUrl(cfg.loja?.logoCabecalho);
  if(logoUrl){brandLogo.src=logoUrl;brandLogo.hidden=false;brandLogo.alt=`Logo de ${cfg.loja.nome}`;brandPlaceholder.hidden=true}
  else{brandLogo.hidden=true;brandPlaceholder.textContent=cfg.loja.nome||'NOVA LOJA'}
  if(whatsappHref)headerWhatsapp.href=whatsappHref;
  else headerWhatsapp.hidden=true;
  if(instagramHref)headerInstagram.href=instagramHref;
  else headerInstagram.hidden=true;
  $('#brand-link').setAttribute('aria-label',`${cfg.loja.nome} — voltar ao início`);
  $('#footer-name').textContent=cfg.loja.nome;
  $('#footer-year').textContent=String(new Date().getFullYear());
  document.title=`${cfg.loja.nome} | Catálogo Esportivo`;

  // Animação contínua: um único requestAnimationFrame, com pausa em interação,
  // fora da tela, em abas ocultas e quando há preferência de movimento reduzido.
  let lastTime=0;
  function animate(now){
    const delta=lastTime?Math.min(80,now-lastTime):0;lastTime=now;
    if(!document.hidden&&!reducesMotion.matches){
      for(const state of carouselStates){
        const {viewport,segment}=state;
        if(segment<1)continue;
        if(viewport.scrollLeft < segment*.5)viewport.scrollLeft+=segment;
        else if(viewport.scrollLeft>segment*1.5)viewport.scrollLeft-=segment;
        if(!state.visible||state.hovered||state.focused||state.dragging||now<state.pauseUntil)continue;
        viewport.scrollLeft += delta * .024;
      }
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
