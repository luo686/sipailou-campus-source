function drawHallSheet(width,height,page,chapters,english,building,viewport){
  return drawBuildingManuscript(width,height,page,chapters,english,building,viewport);
}

async function startBuildingReader(dialog, english, building){
  const chapters=[[english ? "Introduction" : "建筑介绍", building.intro], ...(building.sections || []).map(s=>[s.title,s.body])].filter(c=>c[1]);
  const canvas=dialog.querySelector('canvas'), hint=dialog.querySelector('footer span'), live=dialog.querySelector('p');
  if(!dialog.open)return;
  const model=new PaperBurn(canvas.clientWidth,canvas.clientHeight);
  const end=chapters.length+1;
  model.state.speed *= 2;
  dialog.dataset.burnSpeed=String(model.state.speed);
  model.targetPage=()=>model.state.pageIndex+1;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false});
  const sheet=page=>drawHallSheet(canvas.width,canvas.height,page,chapters,english,building,{width:canvas.clientWidth,height:canvas.clientHeight,visibleHeight:dialog.clientHeight});
  let paint,resize,cleanup;
  if(gl){
    const program=gl.createProgram();
    const fragment=LIVE_FRAGMENT.replace('uniform float clock,burning;', 'uniform float clock,burning,ending;')
      .replace('gl_FragColor=vec4(color,1.);','float opacity=1.-mask*ending;gl_FragColor=vec4(color*opacity,opacity);');
    for(const [kind,source] of [[gl.VERTEX_SHADER,LIVE_VERTEX],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);gl.deleteShader(shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const u=Object.fromEntries(['paper','nextPaper','arrival','clock','burning','ending','grid','ratio','tint'].map(n=>[n,gl.getUniformLocation(program,n)]));
    ['paper','nextPaper','arrival'].forEach((n,i)=>gl.uniform1i(u[n],i));
    function texture(){
      const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
      for(const v of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,v,gl.LINEAR);
      for(const v of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,v,gl.CLAMP_TO_EDGE);
      return t;
    }
    const field=texture(),sheets=[];
    resize=()=>{
      sheets.splice(0).forEach(t=>gl.deleteTexture(t)); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      for(let i=0;i<end;i++){
        sheets.push(texture());gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,sheet(i));
      }
      gl.viewport(0,0,canvas.width,canvas.height);
    };
    paint=()=>{
      const state=model.state;
      [sheets[state.pageIndex],sheets[Math.min(end-1,model.targetPage())],field].forEach((t,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);});
      if(model.dirty){gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,model.columns,model.rows,0,gl.RGBA,gl.UNSIGNED_BYTE,model.encode());}
      gl.uniform1f(u.clock,state.elapsed);gl.uniform1f(u.burning,Number(state.phase==='burning'));gl.uniform1f(u.ending,Number(model.targetPage()===end));
      gl.uniform2f(u.grid,model.columns,model.rows);gl.uniform2f(u.ratio,model.ratioX,model.ratioY);
      gl.uniform3fv(u.tint,[[.62,.32,.19],[.29,.43,.65],[.45,.34,.61],[.28,.49,.34]][state.pageIndex%4]);gl.drawArrays(gl.TRIANGLES,0,6);
    };
    cleanup=()=>{gl.getExtension('WEBGL_lose_context')?.loseContext();};
  }else{
    const ctx=canvas.getContext('2d');let sheets;
    resize=()=>{sheets=Array.from({length:end},(_,i)=>sheet(i));};
    paint=()=>{ctx.drawImage(sheets[model.state.pageIndex],0,0);};
  }
  let raf=0,last=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function status(){
    const page=model.state.pageIndex;
    dialog.dataset.chapter=String(page);

    hint.textContent=page===end-1 ? (english?'Touch to return to the building':'轻触返回建筑详情') : (english?'Touch for the next section':'轻触阅读下一部分');
    if(dialog.classList.contains('manuscript-reader')&&canvas.clientHeight>dialog.clientHeight+1)hint.textContent=(english?'Scroll to read · ':'滑动阅读 · ')+hint.textContent;
    const description=page?chapters[page-1].join('。'):building.name;
    live.textContent=description;canvas.setAttribute('aria-label',description+' · '+hint.textContent);
  }
  function frame(now){
    if(!dialog.open)return;
    const done=model.advance(last?Math.min((now-last)/1000,.12):0);last=now;
    if(done){raf=0;last=0;if(model.state.pageIndex===end){dialog.close();return;}dialog.scrollTop=0;status();}
    paint();if(!done)raf=requestAnimationFrame(frame);
  }
  function ignite(x,y){
    if(dialog.dataset.phase==='welcome')return;
    if(model.state.pageIndex===end-1){dialog.close();return;}
    model.ignite(x,y);
    if(!gl || reduced.matches){model.advance(model.finishAt/model.state.speed+1);if(model.state.pageIndex===end){dialog.close();return;}dialog.scrollTop=0;status();paint();return;}
    if(!raf)raf=requestAnimationFrame(frame);
  }
  const point=e=>{const r=canvas.getBoundingClientRect();ignite((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
  if(dialog.classList.contains('manuscript-reader')){
    let down;
    canvas.onpointerdown=e=>{if(e.button===0)down={x:e.clientX,y:e.clientY};};
    canvas.onpointercancel=()=>{down=null;};
    canvas.onpointerup=e=>{
      const tap=down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<8;down=null;
      if(tap)point(e);
    };
  }else canvas.onpointerdown=e=>{if(e.button===0)point(e);};
  canvas.onkeydown=e=>{if(['Enter',' '].includes(e.key)&&!e.repeat){e.preventDefault();ignite(.5,.5);}};
  let layoutKey='',paperHeight=0;
  function fit(){
    const w=dialog.clientWidth,visibleHeight=dialog.clientHeight;if(!w||!visibleHeight)return;
    const key=w+'x'+visibleHeight;
    if(key!==layoutKey){paperHeight=manuscriptPaperHeight(w,visibleHeight,chapters,english,building);layoutKey=key;}
    canvas.style.height=paperHeight+'px';
    const h=canvas.clientHeight;
    const density=Math.min(devicePixelRatio||1,2,1500/w,1500/h);
    canvas.width=Math.round(w*density);canvas.height=Math.round(h*density);
    model.resize(w,h);resize();paint();status();
  }
  fit();status();
  const observer=new ResizeObserver(fit);observer.observe(canvas);
  return ()=>{observer.disconnect();cancelAnimationFrame(raf);cleanup?.();};
}
