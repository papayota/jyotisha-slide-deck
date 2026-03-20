(function(){
  const slides=document.querySelectorAll('.slide');
  const total=slides.length;
  let current=0;
  let isAnimating=false;

  // Build nav dots
  const dotsContainer=document.getElementById('navDots');
  slides.forEach((_,i)=>{
    const dot=document.createElement('div');
    dot.className='nav-dot'+(i===0?' active':'');
    dot.addEventListener('click',()=>goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots=dotsContainer.querySelectorAll('.nav-dot');
  const progressBar=document.getElementById('progressBar');

  function updateProgress(){
    const pct=((current+1)/total)*100;
    progressBar.style.width=pct+'%';
  }

  function goTo(index){
    if(isAnimating||index===current||index<0||index>=total)return;
    isAnimating=true;
    const prev=current;
    current=index;

    slides[prev].classList.remove('active');
    slides[prev].classList.add('prev');
    dots[prev].classList.remove('active');

    setTimeout(()=>{
      slides[prev].classList.remove('prev');
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      updateProgress();
      isAnimating=false;
    },100);
  }

  function next(){goTo(current+1)}
  function prev(){goTo(current-1)}

  // Keyboard
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();next()}
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();prev()}
    if(e.key==='Home'){e.preventDefault();goTo(0)}
    if(e.key==='End'){e.preventDefault();goTo(total-1)}
  });

  // Wheel
  let wheelTimeout=null;
  document.addEventListener('wheel',e=>{
    e.preventDefault();
    if(wheelTimeout)return;
    if(e.deltaY>30)next();
    else if(e.deltaY<-30)prev();
    wheelTimeout=setTimeout(()=>{wheelTimeout=null},600);
  },{passive:false});

  // Touch
  let touchStartY=0;
  document.addEventListener('touchstart',e=>{touchStartY=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',e=>{
    const diff=touchStartY-e.changedTouches[0].clientY;
    if(Math.abs(diff)>50){
      if(diff>0)next();else prev();
    }
  },{passive:true});

  // Click sides
  document.addEventListener('click',e=>{
    if(e.target.closest('#autoplayBtn'))return;
    const x=e.clientX;
    const w=window.innerWidth;
    if(x>w*0.8)next();
    else if(x<w*0.2)prev();
  });

  // ===== AUTO-PLAY =====
  const autoBtn=document.getElementById('autoplayBtn');
  const autoTimer=document.getElementById('autoplayTimer');
  const autoFill=document.getElementById('autoplayTimerFill');
  const btnIcon=autoBtn.querySelector('.btn-icon');
  const btnLabel=autoBtn.querySelector('.btn-label');
  let autoPlaying=false;
  let autoInterval=null;
  let timerStart=0;
  let timerRAF=null;
  const AUTO_DELAY=10000;

  function startAutoPlay(){
    autoPlaying=true;
    autoBtn.classList.add('playing');
    btnIcon.textContent='\u275A\u275A';
    btnLabel.textContent='Stop';
    autoTimer.classList.add('visible');
    resetTimer();
  }
  function stopAutoPlay(){
    autoPlaying=false;
    autoBtn.classList.remove('playing');
    btnIcon.textContent='\u25B6';
    btnLabel.textContent='Auto';
    autoTimer.classList.remove('visible');
    autoFill.style.width='0';
    if(autoInterval)clearTimeout(autoInterval);
    if(timerRAF)cancelAnimationFrame(timerRAF);
  }
  function resetTimer(){
    if(autoInterval)clearTimeout(autoInterval);
    if(timerRAF)cancelAnimationFrame(timerRAF);
    autoFill.style.width='0';
    timerStart=performance.now();
    function tick(now){
      if(!autoPlaying)return;
      const elapsed=now-timerStart;
      const pct=Math.min(elapsed/AUTO_DELAY*100,100);
      autoFill.style.width=pct+'%';
      if(elapsed<AUTO_DELAY){timerRAF=requestAnimationFrame(tick)}
    }
    timerRAF=requestAnimationFrame(tick);
    autoInterval=setTimeout(()=>{
      if(!autoPlaying)return;
      if(current<total-1){next();resetTimer()}
      else{stopAutoPlay()}
    },AUTO_DELAY);
  }
  autoBtn.addEventListener('click',e=>{
    e.stopPropagation();
    if(autoPlaying)stopAutoPlay();else startAutoPlay();
  });

  updateProgress();
})();