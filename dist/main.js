(()=>{"use strict";var t={m:{},u:t=>t+".js"};t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),t.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{var e;t.g.importScripts&&(e=t.g.location+"");var i=t.g.document;if(!e&&i&&(i.currentScript&&(e=i.currentScript.src),!e)){var n=i.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),t.p=e})(),t.b=document.baseURI||self.location.href;const e=class{constructor(t,e,i={x:0,y:0},n){this.domNode=document.querySelector(t),this.position=i,this.loopingPoint=e,this.speed=n}update(t){this.loopingPoint?this.position.x=Math.round((this.position.x+-t*this.speed)%this.loopingPoint):this.position.x=Math.round(this.position.x+-t*this.speed)}setPosition(t){const{x:e,y:i}=t;this.position.x=e,this.position.y=i}render(){this.domNode.style.left=this.position.x,this.domNode.style.top=this.position.y}},i=1/30;!function(){const n=new e(".background",413,void 0,i),s=new e(".ground",500,{x:0,y:272},.06666666666666667),r=new e(".pipe",void 0),o=new e(".bird",{x:150,y:150}),a=new class{constructor(){this.pipe={x:670,height:150},this.pipeSpeed=.06666666666666667}getPipePosition(){return this.pipe}update(t){this.pipe.x=Math.round(this.pipe.x+-t*this.pipeSpeed),this.pipe.x<-50&&this.reset()}getReward(t){return this.isTerminalState(t)?-1e3:1}reset(){this.pipe={x:670,height:150}}isTerminalState(t){const{nextPipeDistanceX:e,nextPipeDistanceY:i,nextDistanceGround:n}=t;return n<=10||e<=0&&i<=0&&!(e<=-50)}getRandomArbitrary(t,e){return Math.random()*(e-t)+t}},c=new class{constructor(t=.95,e=.005,i=.7){this.position={x:150,y:150},this.gravity=45,this.dy=0,this.qValues={},this.discount=t,this.epsilon=e,this.learningRate=i,this.reward=0}update(t){this.dy=this.dy+t/this.gravity,this.position.y=Math.round(this.position.y+this.dy)}getAgentPosition(){return this.position}getBestAction(t){const e=this.getLegalActions(),i=Math.floor(Math.random()*e.length);let n=-1/0,s=null;for(let i in e){const e=this.getQValue(t,i);e>n&&(n=e,s=i)}return Math.random()<this.epsilon?e[i]:s}getQValue(t,e){return this.qValues[t]||(this.qValues[t]=[0,0]),this.qValues[t][e]}updateQValue(t,e,i,n){const s=this.getLegalActions(),r=Math.max(...s.map((t=>this.getQValue(i,t)))),o=this.getQValue(t,e),a=n+this.discount*r-o;this.qValues[t][e]=o+this.learningRate*a}getLegalActions(){return[0,1]}takeAction(t){1===Number(t)&&(this.dy=-2)}reset(){this.position={x:150,y:150},this.dy=0,this.reward=0}getReward(){return this.reward}updateReward(t){this.reward+=t}},d=document.querySelector(".train-iterations"),u=[],p=new Worker(new URL(t.p+t.u(106),t.b));let h,l=0,g=0,y=!0,m=0;function x(){a.reset(),c.reset(),r.setPosition({x:670,y:170}),o.setPosition({x:150,y:150})}function w(t){h=requestAnimationFrame(w),l=t-g,g=t,function(t){const e=a.getPipePosition(),i=c.getAgentPosition(),d=Math.round(e.x-i.x),p=Math.round(e.height-i.y),h=Math.round(s.position.y-i.y),l=c.getBestAction([d,p,h]);c.takeAction(l),c.update(t),a.update(t),n.update(t),s.update(t);const g=a.getPipePosition(),w=c.getAgentPosition(),P=Math.round(g.x-w.x),S=Math.round(g.height-w.y),f=Math.round(s.position.y-w.y),A={currentPipeDistanceX:d,currentPipeDistanceY:p,currentDistanceGround:h},v={nextPipeDistanceX:P,nextPipeDistanceY:S,nextDistanceGround:f},q=a.getReward(A,l,v);c.updateReward(q),y&&c.updateQValue([d,p,h],l,[P,S,f],q);const M=a.isTerminalState(v);M?(u.push({x:u.length+1,y:c.getReward()}),m++,x()):(r.setPosition({x:g.x,y:g.height}),o.setPosition({x:w.x,y:w.y}))}(l),r.render(),n.render(),s.render(),o.render(),document.querySelector(".episode").innerHTML=m}document.querySelector(".train-start-btn").addEventListener("click",(()=>{x(),y=!0,document.title="[TRAINING] Flappy Bird",setTimeout((()=>p.postMessage({type:"START_TRAINING",parameters:{iterations:Number(d.value)}})),100)})),document.querySelector(".start-simulation").addEventListener("click",(()=>{x(),y=!1,h=requestAnimationFrame(w)})),document.querySelector(".stop-simulation").addEventListener("click",(()=>{x(),cancelAnimationFrame(h)})),document.querySelector(".show-chart").addEventListener("click",(()=>{p.postMessage({type:"EXPORT_SCORES"})})),document.querySelector(".epsilon").addEventListener("change",(t=>{c.epsilon=Number(t.target.value)})),document.querySelector(".alpha").addEventListener("change",(t=>{c.learningRate=Number(t.target.value)})),document.querySelector(".gamma").addEventListener("change",(t=>{c.reward=Number(t.target.value)})),p.onmessage=t=>{const{type:e,parameters:i}=t.data;if("END_TRAINING"===e&&(document.title="Flappy Bird",p.postMessage({type:"EXPORT_Q_VALUES"})),"Q_VALUES"===e){const{qValues:t}=i;c.qValues=t}if("SCORES"===e){const{scores:t}=i;!function(t){document.querySelector("svg").innerHTML="";const e=d3.select("svg").attr("width",640).attr("height",400).append("g").attr("transform","translate(30, 30)"),i=d3.scaleLinear().domain([0,d3.max(t,(t=>t.x))]).range([0,580]),n=d3.scaleLinear().domain([0,d3.max(t,(t=>t.y))]).range([340,0]),s=(d3.line().x((t=>i(t.x))).y((t=>n(t.y))),d3.scaleLinear().domain([0,d3.max(t,(t=>t.y))]).range(["#0EA5E9","#EF4444"]).interpolate(d3.interpolateHcl));e.selectAll("circle").data(t).enter().append("circle").attr("cx",(t=>i(t.x))).attr("cy",(t=>n(t.y))).attr("r",1).attr("fill",(t=>s(t.y))),e.append("g").attr("transform","translate(0, 340)").call(d3.axisBottom(i)),e.append("g").call(d3.axisLeft(n))}(t)}}}()})();