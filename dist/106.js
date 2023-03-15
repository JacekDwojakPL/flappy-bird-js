(()=>{const t=[],e=new class{constructor(t=.95,e=.005,s=.7){this.position={x:150,y:150},this.gravity=45,this.dy=0,this.qValues={},this.discount=t,this.epsilon=e,this.learningRate=s,this.reward=0}update(t){this.dy=this.dy+t/this.gravity,this.position.y=Math.round(this.position.y+this.dy)}getAgentPosition(){return this.position}getBestAction(t){const e=this.getLegalActions(),s=Math.floor(Math.random()*e.length);let i=-1/0,n=null;for(let s in e){const e=this.getQValue(t,s);e>i&&(i=e,n=s)}return Math.random()<this.epsilon?e[s]:n}getQValue(t,e){return this.qValues[t]||(this.qValues[t]=[0,0]),this.qValues[t][e]}updateQValue(t,e,s,i){const n=this.getLegalActions(),a=Math.max(...n.map((t=>this.getQValue(s,t)))),r=this.getQValue(t,e),o=i+this.discount*a-r;this.qValues[t][e]=r+this.learningRate*o}getLegalActions(){return[0,1]}takeAction(t){1===Number(t)&&(this.dy=-2)}reset(){this.position={x:150,y:150},this.dy=0,this.reward=0}getReward(){return this.reward}updateReward(t){this.reward+=t}getQValues(){return this.qValues}},s=new class{constructor(){this.pipe={x:670,height:150},this.pipeSpeed=.06666666666666667}getPipePosition(){return this.pipe}update(t){this.pipe.x=Math.round(this.pipe.x+-t*this.pipeSpeed),this.pipe.x<-50&&this.reset()}getReward(t){return this.isTerminalState(t)?-1e3:1}reset(){this.pipe={x:670,height:150}}isTerminalState(t){const{nextPipeDistanceX:e,nextPipeDistanceY:s,nextDistanceGround:i}=t;return i<=10||e<=0&&s<=0&&!(e<=-50)}getRandomArbitrary(t,e){return Math.random()*(e-t)+t}},i={position:{x:0,y:272}};function n(n){const a=s.getPipePosition(),r=e.getAgentPosition(),o=Math.round(a.x-r.x),h=Math.round(a.height-r.y),p=Math.round(i.position.y-r.y),u=e.getBestAction([o,h,p]);e.takeAction(u),e.update(n),s.update(n);const l=s.getPipePosition(),d=e.getAgentPosition(),g=Math.round(l.x-d.x),c=Math.round(l.height-d.y),y=Math.round(i.position.y-d.y),x={currentPipeDistanceX:o,currentPipeDistanceY:h,currentDistanceGround:p},P={nextPipeDistanceX:g,nextPipeDistanceY:c,nextDistanceGround:y},V=s.getReward(x,u,P);e.updateReward(V),e.updateQValue([o,h,p],u,[g,c,y],V);const A=s.isTerminalState(P);return A&&(t.push({x:t.length+1,y:e.getReward()}),e.reset(),s.reset()),A}self.onmessage=s=>{const{type:i,parameters:a}=s.data;if("START_TRAINING"===i){const{iterations:t}=a;!function(t,e){let s=t;for(let t=0;t<s;t++){let e=!1;t%1e3==0&&console.log(t),t>=8e4&&t%10==0&&console.log(t);do{e=n(1/60*1e3/2)}while(!e)}self.postMessage({type:"END_TRAINING",parameters:null})}(t)}"EXPORT_Q_VALUES"===i&&self.postMessage({type:"Q_VALUES",parameters:{qValues:e.getQValues()}}),"EXPORT_SCORES"===i&&self.postMessage({type:"SCORES",parameters:{scores:t}})}})();