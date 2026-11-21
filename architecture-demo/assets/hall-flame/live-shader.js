window.LIVE_VERTEX=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
window.LIVE_FRAGMENT=`
precision highp float;varying vec2 uv;
uniform sampler2D paper,nextPaper,arrival;
uniform float clock,burning;uniform vec2 grid,ratio;uniform vec3 tint;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+3.1;a*=.5;}return f;}
float at(vec2 q){vec4 t=texture2D(arrival,vec2(q.x,1.-q.y));return (t.r*65280.+t.g*255.)/64.;}
float front(vec2 q){vec2 e=1./grid;float center=at(q);vec2 g=vec2((at(q+vec2(e.x,0.))-at(q-vec2(e.x,0.)))/(2.*e.x*ratio.x),(at(q+vec2(0.,e.y))-at(q-vec2(0.,e.y)))/(2.*e.y*ratio.y));return (center-clock)/max(3.,length(g));}
void main(){
vec3 old=texture2D(paper,uv).rgb;if(burning<.5){gl_FragColor=vec4(old,1.);return;}
vec2 p=uv*ratio;float d=front(uv),mask=1.-smoothstep(-.0012,.0012,d);
vec3 color=mix(old,texture2D(nextPaper,uv).rgb*.958,mask);
color=mix(color,vec3(.52,.31,.22),exp(-abs(d)*195.)*.30);
color=mix(color,vec3(.18,.105,.095),exp(-abs(d)*700.)*.94);
color=mix(color,vec3(.92,.40,.14),exp(-abs(d+.0018)*950.)*.84);
float flow=fbm(vec2(p.x*48.,p.y*14.-clock*2.8));
float lift=.008+pow(flow,2.)*.105,sway=(noise(vec2(p.y*18.-clock*1.8,p.x*16.))-.5)*.032;
float outside=smoothstep(-.001,.0025,d);
float tongue=(1.-smoothstep(-.003,.004,front(uv-vec2(sway,lift)/ratio)))*outside*smoothstep(.28,.57,flow);
float fold=sin(p.x*188.+flow*17.+p.y*69.-clock*8.);
vec3 membrane=mix(tint,vec3(.92,.89,.98),smoothstep(-.8,.8,fold)*.66);
membrane=mix(membrane,vec3(.82,.67,.37),pow(max(0.,fold),8.)*.40);
color=mix(color,membrane,tongue*(.34+.30*abs(fold)));
color=mix(color,tint*.6,pow(max(0.,sin(fold*4.+flow*22.)),12.)*tongue*.35);
color=mix(color,tint,exp(-abs(d-.0027)*900.)*.78);
float smoke=(1.-smoothstep(-.01,.035,front(uv-vec2(sway,lift+.018)/ratio)))*outside*(1.-tongue);
color=mix(color,vec3(.58,.56,.60),smoke*smoothstep(.5,.77,flow)*.05);
vec2 sparks=vec2(p.x*110.,(p.y-clock*.026)*110.),cell=floor(sparks),point=fract(sparks)-.5;
float fleck=step(.995,hash(cell))*exp(-dot(point,point)*70.)*outside*(1.-smoothstep(.04,.20,d));
color=mix(color,vec3(.40,.31,.30),fleck*.66);
gl_FragColor=vec4(color,1.);
}`;
