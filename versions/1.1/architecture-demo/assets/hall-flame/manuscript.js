const MANUSCRIPT_ROLES={
  "hall": [
    "intro",
    "history",
    "observation",
    "history",
    "observation"
  ],
  "library": [
    "intro",
    "history",
    "visit"
  ],
  "meian": [
    "intro",
    "history",
    "story",
    "observation",
    "visit"
  ],
  "liuchao": [
    "intro",
    "story",
    "observation",
    "visit"
  ],
  "nangao": [
    "intro",
    "history",
    "history",
    "observation",
    "observation"
  ],
  "workshop": [
    "intro",
    "history",
    "observation",
    "visit",
    "visit"
  ],
  "dongnan": [
    "intro",
    "history",
    "history",
    "observation"
  ],
  "mengfang-library": [
    "intro",
    "story",
    "observation",
    "history",
    "observation"
  ],
  "gymnasium": [
    "intro",
    "history",
    "observation",
    "story"
  ],
  "zhongshan": [
    "intro",
    "history",
    "history",
    "observation"
  ],
  "jianxiong": [
    "intro",
    "history",
    "history",
    "observation"
  ],
  "zhongda": [
    "intro",
    "history",
    "story",
    "observation"
  ],
  "qiangong": [
    "intro",
    "history",
    "history",
    "visit"
  ],
  "south-gate": [
    "intro",
    "history",
    "history",
    "observation",
    "observation"
  ],
  "jinling": [
    "intro",
    "history",
    "observation",
    "visit"
  ],
  "alumni-hall": [
    "intro",
    "story",
    "observation",
    "visit"
  ],
  "wusi": [
    "intro",
    "history",
    "observation",
    "visit"
  ],
  "hehai": [
    "intro",
    "history",
    "observation",
    "visit"
  ],
  "wuwu": [
    "intro",
    "history",
    "observation",
    "history"
  ],
  "power-building": [
    "intro",
    "observation",
    "observation"
  ],
  "wu-memorial": [
    "intro",
    "history",
    "story",
    "visit",
    "visit"
  ]
};
// CSS-pixel layout: texture density never changes the reader's type size.
const MEIAN_HAND='"Postcard Hand", "Kaiti SC", KaiTi, STKaiti, serif';
const MEIAN_BODY='"Songti SC", SimSun, "Noto Serif CJK SC", serif';
const MEIAN_LATIN='Georgia, "Times New Roman", serif';
function drawBuildingManuscript(width,height,page,chapters,english,building,viewport={width,height}){
  const sheet=document.createElement('canvas');sheet.width=viewport.measure?1:width;sheet.height=viewport.measure?1:height;
  const ctx=sheet.getContext('2d'),W=viewport.width,H=viewport.height;
  sheet.requiredHeight=H;
  const measuring=!!viewport.measure;
  ctx.scale(width/W,height/H);
  let seed=8237+page*619;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  if(!measuring){ctx.fillStyle='#fcfcfb';ctx.fillRect(0,0,W,H);
  // Light folds at the edges leave the central reading area quiet.
  for(let i=0;i<16;i++){
    const x=i%2?W-rand()*W*.13:rand()*W*.13,y=rand()*H;
    ctx.save();ctx.translate(x,y);ctx.rotate((rand()-.5)*2);
    const fold=ctx.createLinearGradient(0,-5,0,5);
    fold.addColorStop(0,'#55555500');fold.addColorStop(.48,'#5555550b');fold.addColorStop(.52,'#ffffff99');fold.addColorStop(1,'#ffffff00');
    ctx.fillStyle=fold;ctx.beginPath();ctx.moveTo(-55,0);ctx.lineTo(0,-5);ctx.lineTo(85,0);ctx.lineTo(0,5);ctx.closePath();ctx.fill();ctx.restore();
  }
  for(let i=0;i<550;i++){
    ctx.fillStyle=i%2?'#57514a06':'#ffffff44';ctx.fillRect(rand()*W,rand()*H,.5+rand(),.3);
  }
  }
  const family=['liuchao'].includes(building.id)?'garden':['library','mengfang-library'].includes(building.id)?'study':['workshop','jianxiong','power-building'].includes(building.id)?'science':['meian','wu-memorial'].includes(building.id)?'memory':'campus';
  const ink='#342f28',pencil='#71685c',accent={garden:'#5d6e5e',study:'#586779',science:'#64666c',memory:'#7c6250',campus:'#736551'}[family];
  const role=MANUSCRIPT_ROLES[building.id]?.[Math.max(0,page-1)]||'observation';
  const wide=W>=500&&W/(viewport.visibleHeight||H)>1.2;
  const contentWidth=Math.min(W,wide?1000:560),origin=(W-contentWidth)/2;
  const margin=W<360||(wide&&H<360)?28:44,left=origin+margin,right=origin+contentWidth-margin;
  const bodyFont=english?MEIAN_LATIN:MEIAN_BODY;
  const hand=english?'"Postcard Latin", "Segoe Print", cursive':MEIAN_HAND;
  const bodySize=english?(W<360||H<450?15:16):(W<360||H<450?16:18);
  const leading=bodySize*(english?1.45:1.65),gap=10,bottom=H-(wide?66:108);
  function text(s,x,y,size=bodySize,font=bodyFont,color=ink){ctx.fillStyle=color;ctx.font=`${size}px ${font}`;if(!measuring)ctx.fillText(s,x,y);}
  function stroke(points,color=pencil,lineWidth=.7){
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  }
  function note(s,x,y,size=14){text(s,x,y,size,hand,pencil);}
  // Keep years and Latin words intact, and keep paired punctuation with its text.
  function wrap(s,size,w,font=bodyFont){
    ctx.font=`${size}px ${font}`;
    const tokens=s.match(/[\p{Script=Latin}0-9]+(?:[’'./–-][\p{Script=Latin}0-9]+)*|\s+|[^\s]/gu)||[];
    const lines=[];let line='';
    const close=/^[，。！？、；：）】」』,.!?;:)]$/u,open=/[（【「『(]$/u,reserve=font===hand?0:english?size*.55:size;
    for(const token of tokens){
      if(!line&&/^\s+$/.test(token))continue;
      if(line&&ctx.measureText(line+token).width>w-reserve&&!close.test(token)){
        let carry='';if(open.test(line)){carry=line.slice(-1);line=line.slice(0,-1);}
        lines.push(line.trim());line=carry+token.trimStart();
      }else line+=token;
    }
    if(line.trim())lines.push(line.trim());
    if(!english&&lines.length>1&&lines.at(-1).length<3){
      let previous=lines.at(-2),last=lines.at(-1);
      while(last.length<4&&previous.length>5){const token=previous.match(/\d+$|.$/u)[0];previous=previous.slice(0,-token.length);last=token+last;}
      if(!open.test(previous)&&!close.test(last[0])){lines[lines.length-2]=previous;lines[lines.length-1]=last;}
    }
    return lines;
  }
  const chapter=page?chapters[page-1]:[building.name,english?'Touch to begin the story.':'轻触，展开这座建筑的故事。'];
  const sentences=english?chapter[1].split(/(?<=[.!?])\s+(?=[A-Z‘“])/u):(chapter[1].match(/[^。！？]+[。！？]+|[^。！？]+$/g)||[chapter[1]]);
  const join=parts=>parts.map(s=>s.trim()).join(english?' ':'');
  let paragraphs;
  if(building.id!=='meian'){
    paragraphs=chapter[1].split(/\n\s*\n/).filter(Boolean);
    if(paragraphs.length===1&&sentences.length>2){paragraphs=[];for(let i=0;i<sentences.length;i+=2)paragraphs.push(join(sentences.slice(i,i+2)));}
  }else if(page===3)paragraphs=[join(sentences.slice(0,2)),...sentences.slice(2).map(s=>s.trim())];
  else if(page===5)paragraphs=english?[join(sentences.slice(0,3)),join(sentences.slice(3,5)),join(sentences.slice(5))]:[join(sentences.slice(0,2)),join(sentences.slice(2,4)),join(sentences.slice(4))];
  else if(page===2)paragraphs=[join(sentences.slice(0,1)),join(sentences.slice(1,3)),join(sentences.slice(3))];
  else if(page===4)paragraphs=[join(sentences.slice(0,2)),join(sentences.slice(2,3)),join(sentences.slice(3))];
  else paragraphs=[chapter[1]];
  paragraphs=paragraphs.filter(Boolean);
  function body(x,top,w,columns=1){
    const gutter=28,cw=(w-gutter*(columns-1))/columns;
    let y=top,column=0,total=0;
    for(const [index,p] of paragraphs.entries()){
      const event=building.id==='meian'?page===3&&index>0:role==='history'&&/^\s*(?:[12]\d{3}|In [12]\d{3})/.test(p),indent=event?12:0,lines=wrap(p,bodySize,cw-indent);
      total+=lines.length*leading+gap;
      if(columns>1&&y>top&&y+leading*1.5>bottom){column++;y=top;}
      for(const [lineIndex,line] of lines.entries()){
        if(columns>1&&y>bottom){column++;y=top;}
        const tx=x+column*(cw+gutter)+indent;
        if(event&&lineIndex===0){ctx.fillStyle=accent;ctx.beginPath();ctx.arc(tx-9,y-bodySize*.3,1.8,0,Math.PI*2);ctx.fill();}
        text(line,tx,y);y+=leading;
      }
      y+=gap;
    }
    if(column>=columns||y-leading>bottom)sheet.requiredHeight=Math.max(sheet.requiredHeight,Math.ceil(columns===1?y-leading+108:top+total/columns+66+leading*2));
  }
  function heading(s,x,y,size=34,maxWidth=right-x){
    const lines=wrap(s,size,maxWidth,hand);
    lines.forEach((line,i)=>text(line,x,y+i*size*1.18,size,hand));return y+(lines.length-1)*size*1.18;
  }
  // Elevation after local archive photograph 04.jpg, used only on the opening sheet.
  function elevation(x,y,w){
    if(measuring)return;
    ctx.save();ctx.translate(x,y);ctx.scale(w/300,w/300);
    const lines=[[[8,65],[25,58],[25,47],[103,47],[103,55],[209,55],[209,47],[286,47],[291,63]],[[14,68],[104,65],[112,69],[204,69],[211,65],[289,65]],[[25,70],[25,157],[286,157],[286,70]],[[20,159],[294,159]],[[104,70],[104,140]],[[209,70],[209,140]],[[93,141],[222,141],[222,152],[85,152]],[[78,161],[233,161],[233,168],[71,168]],[[127,78],[188,78],[188,95],[127,95],[127,78]]];
    for(const pts of lines){stroke(pts,'#6a6257',.8);stroke(pts.map(([a,b])=>[a+.6,b+.8]),'#6a625730',.5);}
    for(const start of [38,70,119,151,184,226,258]){
      stroke([[start,103],[start+21,103],[start+21,139],[start,139],[start,103]],'#6a6257',.6);
      for(let j=1;j<4;j++)stroke([[start+j*5,104],[start+j*5,138]],'#6a625760',.4);
      stroke([[start,115],[start+21,115]],'#6a625760',.4);
    }
    note('梅庵',143,90,12);ctx.restore();
  }
  // Detail after archive photograph 01.jpg: dark horizontal board with gold characters.
  function plaque(x,y,w){
    const h=w*.32;if(measuring)return y+h;ctx.save();ctx.translate(x,y);ctx.rotate(-.025);
    ctx.fillStyle='#39372f';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#6a6257';ctx.lineWidth=.65;ctx.strokeRect(-2,-2,w+4,h+4);
    text('庵',w*.19,h*.77,h*.72,MEIAN_HAND,'#c5b37d');text('梅',w*.60,h*.77,h*.72,MEIAN_HAND,'#c5b37d');
    ctx.restore();return y+h;
  }
  if(building.id!=='meian'){
    note(english?building.name+' / notebook':building.name+' · 札记',left,wide?24:35,13);
    note(`${Math.max(1,page)} / ${chapters.length}`,right-30,wide?28:H-88,12);
    if(page<=1){
      const name=building.name;
      const parts=english?[name]:name.includes('（')?[name.split('（')[0],'（'+name.split('（')[1]]:name.split('·');
      let y=wide?65:140;
      for(const [i,part] of parts.entries()){
        const size=wide?(english?32:34):i?30:english?48:Math.max(34,Math.min(68,(right-left)/(part.length+.4)));
        y=heading(part,left,y,size,right-left)+size*.8;
      }
      stroke([[left,y-12],[left+Math.min(76,right-left*.25),y-12]],accent,1);
      body(left,wide?Math.max(110,y+8):Math.max(250,y+34),right-left,wide?2:1);
    }else{
      const titleX=left+(role==='story'&&!wide?12:0);
      const last=heading(chapter[0],titleX,wide?61:96,wide?english?29:28:W<360?31:34,right-titleX-(wide?45:0));
      const top=last+(wide?31:role==='history'?40:role==='observation'?58:48);
      if(role==='observation')stroke([[left,last+20],[left+38,last+20]],accent,.8);
      if(role==='story')stroke([[left,last-25],[left,last+8]],accent,.8);
      body(left,top,right-left,wide?2:1);
    }
  }else if(wide){
    note(english?'Mei’an / campus notebook':'梅庵 · 校园札记',left,24,13);
    heading(chapter[0],left,61,english?29:28,right-left-100);note(`${Math.max(1,page)} / ${chapters.length}`,right-33,28,12);
    body(left,H<360?87:97,right-left,2);
  }else{
    note(english?'Mei’an / campus notebook':'四牌楼 · 校园札记',left,35,13);note(`${Math.max(1,page)} / ${chapters.length}`,right-28,H-88,12);
    if(page<=1){
      note(english?'Introduction':'建筑介绍',left,84,16);heading(english?'Mei’an':'梅 庵',left,165,W<360?65:78);
      elevation(left,182,right-left);body(left,Math.min(450,H*.57),right-left);
    }else if(page===4){
      const last=heading(chapter[0],left,91,W<360?30:34),plaqueWidth=Math.min(240,right-left-26);
      const end=plaque(left+12,last+30,plaqueWidth);note(english?'Liu Yizheng · 1947':'柳诒徵题 · 1947',left,end+28,14);
      body(left,end+72,right-left);
    }else{
      const titles=english?{2:'Name & beginnings',3:'Guqin & meetings',5:'Around Mei’an'}:{2:'名称与早期馆舍',3:'古琴教学与会议',5:'周边遗存与纪念'};
      const last=heading(titles[page]||chapter[0],left,99,W<360?31:36);
      body(left,page===3?Math.max(english?145:181,last+(english?32:44)):Math.max(english?170:199,last+48),right-left);
    }
  }
  return sheet;
}

// Measure every original chapter at its readable type size before allocating burn textures.
function manuscriptPaperHeight(width,visibleHeight,chapters,english,building){
  const wide=width>=500&&width/visibleHeight>1.2;
  let height=Math.max(visibleHeight,!wide&&width<900?760:wide&&width<650?420:visibleHeight);
  for(let pass=0;pass<4;pass++){
    let required=height;
    for(let page=0;page<=chapters.length;page++){
      const sheet=drawBuildingManuscript(width,height,page,chapters,english,building,{width,height,visibleHeight,measure:true});
      required=Math.max(required,sheet.requiredHeight);
    }
    if(required<=height)return height;
    height=required;
  }
  return height;
}
