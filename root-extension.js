(function (Scratch) {
  'use strict';
  if (!Scratch.extensions.unsandboxed) throw new Error('Root拡張は非サンドボックスモードが必要です');

  const UART_SERVICE='6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const ROOT_SERVICE='48c5d828-ac2a-442d-97a3-0c9822b04979';
  const RX='6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  const TX='6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
  const crc8=bytes=>{let c=0;for(const v of bytes){c^=v;for(let i=0;i<8;i++)c=(c&128)?((c<<1)^7)&255:(c<<1)&255;}return c;};
  const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
  const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(' ');
  const parseHex=text=>{const s=String(text||'').replace(/[^0-9a-f]/gi,'');if(s.length%2)throw Error('16進数が不正です');return Uint8Array.from(s.match(/../g)?.map(x=>parseInt(x,16))||[]);};

  class Protocol {
    constructor(){this.id=0;}
    packet(dev,cmd,payload=[]){const p=new Uint8Array(20);p[0]=dev&255;p[1]=cmd&255;p[2]=this.id++&255;p.set(Uint8Array.from(payload).slice(0,16),3);p[19]=crc8(p.slice(0,19));return p;}
    i32(values){const a=new Uint8Array(values.length*4),v=new DataView(a.buffer);values.forEach((x,i)=>v.setInt32(i*4,Math.round(x),false));return a;}
    decode(p){if(p.length!==20||crc8(p.slice(0,19))!==p[19])return null;const v=new DataView(p.buffer,p.byteOffset,p.byteLength),r={device:p[0],command:p[1],id:p[2],raw:hex(p)};if(p[0]===14&&(p[1]===0||p[1]===1)){r.battery=v.getUint16(7,false);r.batteryPercent=p[9];}if(p[0]===12&&p[1]===0){r.leftBumper=!!(p[7]&128);r.rightBumper=!!(p[7]&64);}if(p[0]===17&&p[1]===0)r.touch=p[7];if(p[0]===20&&p[1]===0)r.cliff=!!p[7];if(p[0]===16&&p[1]===1){r.x=v.getInt16(7,false);r.y=v.getInt16(9,false);r.z=v.getInt16(11,false);}if(p[0]===13&&(p[1]===0||p[1]===1)){r.lightLeft=v.getUint16(7,false);r.lightRight=v.getUint16(9,false);}return r;}
  }

  class WebBluetoothTransport {
    async connect(onData){this.device=await navigator.bluetooth.requestDevice({filters:[{services:[ROOT_SERVICE]}],optionalServices:[UART_SERVICE]});this.server=await this.device.gatt.connect();const service=await this.server.getPrimaryService(UART_SERVICE);this.rx=await service.getCharacteristic(RX);this.tx=await service.getCharacteristic(TX);await this.tx.startNotifications();this.tx.addEventListener('characteristicvaluechanged',e=>onData(new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength)));}
    async write(bytes){await this.rx.writeValueWithResponse(bytes);}
    disconnect(){this.device?.gatt?.disconnect();}
  }

  class ScratchLinkTransport {
    rpc(method,params={}){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.socket.sendMessage({jsonrpc:'2.0',id,method,params});setTimeout(()=>{if(this.pending.delete(id))reject(Error(method+' timeout'));},15000);});}
    async connect(onData){this.onData=onData;this.id=0;this.pending=new Map();const Socket=Scratch.ScratchLinkSafariSocket;if(!Socket)throw Error('Scrub BLE bridge unavailable');this.socket=new Socket('BLE');this.socket.setHandleMessage(m=>this.message(m));await new Promise((res,rej)=>{this.socket.setOnOpen(res);this.socket.setOnError(rej);this.socket.open();});await this.rpc('discover',{filters:[{services:[ROOT_SERVICE]}],optionalServices:[UART_SERVICE]});const peripheral=await new Promise((res,rej)=>{this.discovered=res;setTimeout(()=>rej(Error('Rootが見つかりません')),20000);});await this.rpc('connect',{peripheralId:peripheral.peripheralId});await this.rpc('startNotifications',{serviceId:UART_SERVICE,characteristicId:TX,encoding:'base64'});}
    message(m){if(m.id&&this.pending.has(m.id)){const p=this.pending.get(m.id);this.pending.delete(m.id);m.error?p.reject(Error(m.error.message||'BLE error')):p.resolve(m.result);return;}if(m.method==='didDiscoverPeripheral'&&this.discovered){const f=this.discovered;this.discovered=null;f(m.params);}if(m.method==='characteristicDidChange')this.onData(unb64(m.params.message));}
    async write(bytes){await this.rpc('write',{serviceId:UART_SERVICE,characteristicId:RX,message:b64(bytes),encoding:'base64',withResponse:true});}
    disconnect(){this.socket?.close();}
  }

  class RootExtension {
    constructor(){this.p=new Protocol();this.connected=false;this.last={};this.changed={};}
    getInfo(){return{id:'irobotroot',name:'iRobot Root',color1:'#00a6a6',blocks:[
      {opcode:'connect',blockType:Scratch.BlockType.COMMAND,text:'Rootに接続する'},
      {opcode:'disconnect',blockType:Scratch.BlockType.COMMAND,text:'Rootを切断する'},
      {opcode:'isConnected',blockType:Scratch.BlockType.BOOLEAN,text:'Rootは接続済み'},
      '---',
      {opcode:'motors',blockType:Scratch.BlockType.COMMAND,text:'左モーター [L] 右モーター [R]',arguments:{L:{type:Scratch.ArgumentType.NUMBER,defaultValue:50},R:{type:Scratch.ArgumentType.NUMBER,defaultValue:50}}},
      {opcode:'drive',blockType:Scratch.BlockType.COMMAND,text:'[MM] mm進む',arguments:{MM:{type:Scratch.ArgumentType.NUMBER,defaultValue:100}}},
      {opcode:'turn',blockType:Scratch.BlockType.COMMAND,text:'[DEG] 度回る',arguments:{DEG:{type:Scratch.ArgumentType.NUMBER,defaultValue:90}}},
      {opcode:'arc',blockType:Scratch.BlockType.COMMAND,text:'半径 [R] mmで [DEG] 度弧を進む',arguments:{R:{type:Scratch.ArgumentType.NUMBER,defaultValue:100},DEG:{type:Scratch.ArgumentType.NUMBER,defaultValue:90}}},
      {opcode:'stop',blockType:Scratch.BlockType.COMMAND,text:'Rootを停止'},
      {opcode:'marker',blockType:Scratch.BlockType.COMMAND,text:'ペンを [POS]',arguments:{POS:{type:Scratch.ArgumentType.STRING,menu:'markerMenu'}}},
      {opcode:'led',blockType:Scratch.BlockType.COMMAND,text:'LEDを 赤 [R] 緑 [G] 青 [B]',arguments:{R:{type:Scratch.ArgumentType.NUMBER,defaultValue:255},G:{type:Scratch.ArgumentType.NUMBER,defaultValue:0},B:{type:Scratch.ArgumentType.NUMBER,defaultValue:0}}},
      {opcode:'note',blockType:Scratch.BlockType.COMMAND,text:'[HZ] Hzを [MS] ミリ秒鳴らす',arguments:{HZ:{type:Scratch.ArgumentType.NUMBER,defaultValue:440},MS:{type:Scratch.ArgumentType.NUMBER,defaultValue:500}}},
      '---',
      {opcode:'refreshSensor',blockType:Scratch.BlockType.COMMAND,text:'[SENSOR] を読み取る',arguments:{SENSOR:{type:Scratch.ArgumentType.STRING,menu:'sensorMenu'}}},
      {opcode:'sensor',blockType:Scratch.BlockType.REPORTER,text:'[SENSOR] の値',arguments:{SENSOR:{type:Scratch.ArgumentType.STRING,menu:'valueMenu'}}},
      {opcode:'whenEvent',blockType:Scratch.BlockType.HAT,text:'[EVENT] が変化したとき',isEdgeActivated:false,arguments:{EVENT:{type:Scratch.ArgumentType.STRING,menu:'eventMenu'}}},
      {opcode:'raw',blockType:Scratch.BlockType.COMMAND,text:'デバイス [DEV] コマンド [CMD] ペイロード [PAYLOAD]',arguments:{DEV:{type:Scratch.ArgumentType.NUMBER,defaultValue:1},CMD:{type:Scratch.ArgumentType.NUMBER,defaultValue:4},PAYLOAD:{type:Scratch.ArgumentType.STRING,defaultValue:'00 00 00 64 00 00 00 64'}}},
      {opcode:'lastPacket',blockType:Scratch.BlockType.REPORTER,text:'最後の受信パケット'}
    ],menus:{markerMenu:{acceptReporters:true,items:[{text:'上げる',value:'0'},{text:'下げる',value:'1'},{text:'消しゴム',value:'2'}]},sensorMenu:{items:[{text:'バッテリー',value:'battery'},{text:'明るさ',value:'light'},{text:'加速度',value:'accel'}]},valueMenu:{acceptReporters:true,items:['batteryPercent','battery','lightLeft','lightRight','x','y','z','leftBumper','rightBumper','touch','cliff']},eventMenu:{items:['bumper','touch','cliff','battery']}}};}
    async connect(){this.disconnect();this.t=Scratch.ScratchLinkSafariSocket?new ScratchLinkTransport():new WebBluetoothTransport();await this.t.connect(p=>this.receive(p));this.connected=true;}
    disconnect(){this.t?.disconnect();this.connected=false;}
    isConnected(){return this.connected;}
    async send(packet){if(!this.connected&&this.t===undefined)throw Error('Rootに接続してください');await this.t.write(packet);}
    receive(packet){const r=this.p.decode(packet);if(!r)return;this.last={...this.last,...r};if(r.device===12)this.changed.bumper=true;if(r.device===17)this.changed.touch=true;if(r.device===20)this.changed.cliff=true;if(r.device===14)this.changed.battery=true;}
    motors(a){return this.send(this.p.packet(1,4,this.p.i32([clamp(a.L,-100,100),clamp(a.R,-100,100)])));}
    drive(a){return this.send(this.p.packet(1,8,this.p.i32([a.MM])));}
    turn(a){return this.send(this.p.packet(1,12,this.p.i32([Number(a.DEG)*10])));}
    arc(a){return this.send(this.p.packet(1,27,this.p.i32([Number(a.DEG)*10,a.R])));}
    stop(){return this.send(this.p.packet(0,3));}
    marker(a){return this.send(this.p.packet(2,0,[Number(a.POS)]));}
    led(a){return this.send(this.p.packet(3,2,[1,clamp(a.R,0,255),clamp(a.G,0,255),clamp(a.B,0,255)]));}
    note(a){const d=new Uint8Array(6),v=new DataView(d.buffer);v.setUint32(0,Math.max(0,a.HZ),false);v.setUint16(4,clamp(a.MS,0,65535),false);return this.send(this.p.packet(5,0,d));}
    refreshSensor(a){const map={battery:[14,1],light:[13,1],accel:[16,1]};const x=map[a.SENSOR];return x&&this.send(this.p.packet(x[0],x[1]));}
    sensor(a){return this.last[a.SENSOR]??0;}
    whenEvent(a){if(this.changed[a.EVENT]){this.changed[a.EVENT]=false;return true;}return false;}
    raw(a){return this.send(this.p.packet(Number(a.DEV),Number(a.CMD),parseHex(a.PAYLOAD)));}
    lastPacket(){return this.last.raw||'';}
  }
  Scratch.extensions.register(new RootExtension());
})(Scratch);
