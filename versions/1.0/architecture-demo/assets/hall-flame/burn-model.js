(function(root){
'use strict';
const clamp=v=>Math.max(0,Math.min(1,v));
function hash(x,y){const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v;}
function warp(x,y){return [
 x+(noise(x*3.8+7,y*3.8)-.5)*.14+(noise(x*13,y*13+4)-.5)*.055+(noise(x*39+19,y*39)-.5)*.025+(noise(x*83,y*83+7)-.5)*.012,
 y+(noise(x*3.8+31,y*3.8+17)-.5)*.14+(noise(x*13+6,y*13)-.5)*.055+(noise(x*39,y*39+23)-.5)*.025+(noise(x*83+13,y*83)-.5)*.012
];}
class PaperBurn{
 constructor(width,height){this.state={phase:'idle',pageIndex:0,elapsed:0,ignitions:[],playing:false,paused:false,speed:1.25,coverage:0};this.rate=.095;this.dirty=true;this.resize(width,height);}
 targetPage(){return this.state.pageIndex===4?1:this.state.pageIndex+1;}
 resize(width,height){
  const old=this.arrival,ow=this.columns,oh=this.rows;
  this.width=width;this.height=height;const short=Math.min(width,height);this.ratioX=width/short;this.ratioY=height/short;
  const scale=360/Math.max(width,height);this.columns=Math.max(96,Math.round(width*scale));this.rows=Math.max(96,Math.round(height*scale));
  this.arrival=new Float32Array(this.columns*this.rows);this.arrival.fill(Infinity);this.warpX=new Float32Array(this.arrival.length);this.warpY=new Float32Array(this.arrival.length);this.resistance=new Float32Array(this.arrival.length);
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.columns;x++){
   const i=y*this.columns+x,px=x/(this.columns-1)*this.ratioX,py=y/(this.rows-1)*this.ratioY,p=warp(px,py);
   this.warpX[i]=p[0];this.warpY[i]=p[1];
   this.resistance[i]=.9+.2*noise(px*5+41,py*5+17)+.12*(noise(px*21+3,py*21+29)-.5);
  }
  for(const point of this.state.ignitions)this.propagate(point);
  if(old&&this.state.phase==='burning')for(let y=0;y<this.rows;y++)for(let x=0;x<this.columns;x++){const i=y*this.columns+x,ox=Math.round(x/(this.columns-1)*(ow-1)),oy=Math.round(y/(this.rows-1)*(oh-1));this.arrival[i]=Math.min(this.arrival[i],old[oy*ow+ox]);}
  this.measure();this.dirty=true;
 }
 propagate(point){
  const origin=warp(point.x*this.ratioX,point.y*this.ratioY),phase=point.x*9.1+point.y*13.7+this.state.pageIndex*1.57;
  for(let i=0;i<this.arrival.length;i++){
   const dx=this.warpX[i]-origin[0],dy=this.warpY[i]-origin[1],angle=Math.atan2(dy,dx);
   // Different directions and local fibre densities give the front an uneven pace.
   const directionalSpeed=1+.18*Math.sin(angle*3+phase)+.11*Math.sin(angle*7-phase*1.3)+.055*Math.sin(angle*13+phase*.8);
   const travel=Math.hypot(dx,dy)*this.resistance[i]/(this.rate*directionalSpeed);
   this.arrival[i]=Math.min(this.arrival[i],point.born+travel);
  }
 }
 ignite(x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y))return;
  if(this.state.phase==='idle'){this.state.elapsed=0;this.arrival.fill(Infinity);this.state.phase='burning';}
  const point={x:clamp(x),y:clamp(y),born:this.state.elapsed};this.state.ignitions.push(point);this.propagate(point);this.state.playing=!this.state.paused;this.measure();this.dirty=true;
 }
 measure(){let end=0,burned=0;for(const t of this.arrival){if(Number.isFinite(t))end=Math.max(end,t);if(t<=this.state.elapsed)burned++;}this.finishAt=end+.2;this.state.coverage=burned/this.arrival.length;}
 advance(seconds){
  if(this.state.phase!=='burning'||this.state.paused)return false;
  this.state.elapsed+=Math.max(0,seconds)*this.state.speed;this.measure();
  if(this.state.elapsed<this.finishAt)return false;
  this.state.pageIndex=this.targetPage();this.state.phase='idle';this.state.elapsed=0;this.state.ignitions=[];this.state.coverage=0;this.state.playing=false;this.arrival.fill(Infinity);this.dirty=true;return true;
 }
 pause(value){this.state.paused=value;this.state.playing=this.state.phase==='burning'&&!value;}
 reset(){this.state.pageIndex=0;this.state.phase='idle';this.state.elapsed=0;this.state.ignitions=[];this.state.coverage=0;this.state.paused=false;this.state.playing=false;this.arrival.fill(Infinity);this.dirty=true;}
 encode(){const bytes=new Uint8Array(this.arrival.length*4);for(let i=0;i<this.arrival.length;i++){const t=Math.min(65535,Math.round(this.arrival[i]*64));bytes[i*4]=t>>8;bytes[i*4+1]=t&255;bytes[i*4+3]=255;}this.dirty=false;return bytes;}
}
root.PaperBurn=PaperBurn;if(typeof module!=='undefined')module.exports={PaperBurn};
})(globalThis);
