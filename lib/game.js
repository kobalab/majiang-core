/*
 *  Majiang.Game
 */
"use strict";

const Majiang = {
    rule:    require('./rule'),
    Shoupai: require('./shoupai'),
    Shan:    require('./shan'),
    He:      require('./he'),
    Util:    Object.assign(require('./xiangting'),
                           require('./hule'))
};

module.exports = class Game {

    constructor(players, callback, rule, title) {

        this._players  = players;
        this._callback = callback || (()=>{});
        this._rule     = rule || Majiang.rule();

        this._model = {
            title:      title || '電脳麻将\n' + new Date().toLocaleString(),
            player:     ['私','下家','対面','上家'],
            qijia:      0,
            zhuangfeng: 0,
            jushu:      0,
            changbang:  0,
            lizhibang:  0,
            defen:      [0,0,0,0].map(x=>this._rule['配給原点']),
            shan:       null,
            shoupai:    [],
            he:         [],
            player_id:  [ 0, 1, 2, 3 ]
        };

        this._view;

        this._status;
        this._reply = [];

        this._sync  = false;
        this._stop  = null;
        this._speed = 3;
        this._wait  = 0;
        this._timeout_id;

        this._handler;
    }

    get model()      { return this._model  }
    set view(view)   { this._view = view   }
    get speed()      { return this._speed  }
    set speed(speed) { this._speed = speed }
    set wait(wait)   { this._wait = wait   }

    set handler(callback) { this._handler = callback }

    add_paipu(paipu) {
        this._paipu.log[this._paipu.log.length - 1].push(paipu);
    }

    delay(callback, timeout) {

        if (this._sync) return callback();

        timeout = this._speed == 0 ? 0
                : timeout == null  ? Math.max(500, this._speed * 200)
                :                    timeout;
        setTimeout(callback, timeout);
    }

    stop(callback = ()=>{}) {
        this._stop = callback;
    }

    start() {
        if (this._timeout_id) return;
        this._stop = null;
        this._timeout_id = setTimeout(()=>this.next(), 0);
    }

    notify_players(type, msg) {

        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            if (this._sync)
                    this._players[id].action(msg[l]);
            else    setTimeout(()=>{
                        this._players[id].action(msg[l]);
                    }, 0);
        }
    }

    call_players(type, msg, timeout) {

        timeout = this._speed == 0 ? 0
                : timeout == null  ? this._speed * 200
                :                    timeout;
        this._status = type;
        this._reply  = [];
        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            if (this._sync)
                    this._players[id].action(
                            msg[l], reply => this.reply(id, reply));
            else    setTimeout(()=>{
                        this._players[id].action(
                            msg[l], reply => this.reply(id, reply));
                    }, 0);
        }
        if (! this._sync)
                this._timeout_id = setTimeout(()=>this.next(), timeout);
    }

    reply(id, reply) {
        this._reply[id] = reply || {};
        if (this._sync) return;
        if (this._reply.filter(x=>x).length < 4) return;
        if (! this._timeout_id)
                this._timeout_id = setTimeout(()=>this.next(), 0);
    }

    next() {
        this._timeout_id = clearTimeout(this._timeout_id);
        if (this._reply.filter(x=>x).length < 4) return;
        if (this._stop) return this._stop();

        if      (this._status == 'kaiju')    this.reply_kaiju();
        else if (this._status == 'qipai')    this.reply_qipai();
        else if (this._status == 'zimo')     this.reply_zimo();
        else if (this._status == 'dapai')    this.reply_dapai();
        else if (this._status == 'fulou')    this.reply_fulou();
        else if (this._status == 'gang')     this.reply_gang();
        else if (this._status == 'gangzimo') this.reply_zimo();
        else if (this._status == 'hule')     this.reply_hule();
        else if (this._status == 'pingju')   this.reply_pingju();
        else                                 this._callback(this._paipu);
    }

    do_sync() {

        this._sync  = true;

        this.kaiju();

        for (;;) {
            if      (this._status == 'kaiju')    this.reply_kaiju();
            else if (this._status == 'qipai')    this.reply_qipai();
            else if (this._status == 'zimo')     this.reply_zimo();
            else if (this._status == 'dapai')    this.reply_dapai();
            else if (this._status == 'fulou')    this.reply_fulou();
            else if (this._status == 'gang')     this.reply_gang();
            else if (this._status == 'gangzimo') this.reply_zimo();
            else if (this._status == 'hule')     this.reply_hule();
            else if (this._status == 'pingju')   this.reply_pingju();
            else                                 break;
        }

        this._callback(this._paipu);

        return this;
    }

    kaiju(qijia) {

        this._model.qijia = qijia ?? Math.floor(Math.random() * 4);

        this._max_jushu = this._rule['場数'] == 0 ? 0
                        : this._rule['場数'] * 4 - 1;

        this._paipu = {
            title:  this._model.title,
            player: this._model.player,
            qijia:  this._model.qijia,
            log:    [],
            defen:  this._model.defen.concat(),
            point:  [],
            rank:   []
        };

        let msg = [];
        for (let id = 0; id < 4; id++) {
            msg[id] = JSON.parse(JSON.stringify({
                kaiju: {
                    id:     id,
                    rule:   this._rule,
                    title:  this._paipu.title,
                    player: this._paipu.player,
                    qijia:  this._paipu.qijia
                }
            }));
        }
        this.call_players('kaiju', msg, 0);

        if (this._view) this._view.kaiju();
    }

    qipai(shan) {

        let model = this._model;

        model.shan = shan || new Majiang.Shan(this._rule);
        for (let l = 0; l < 4; l++) {
            let qipai = [];
            for (let i = 0; i < 13; i++) {
                qipai.push(model.shan.zimo());
            }
            model.shoupai[l]   = new Majiang.Shoupai(qipai);
            model.he[l]        = new Majiang.He();
            model.player_id[l] = (model.qijia + model.jushu + l) % 4;
        }
        model.lunban = -1;

        this._diyizimo = true;
        this._fengpai  = this._rule['途中流局あり'];

        this._dapai = null;
        this._gang  = null;

        this._lizhi     = [ 0, 0, 0, 0 ];
        this._yifa      = [ 0, 0, 0, 0 ];
        this._n_gang    = [ 0, 0, 0, 0 ];
        this._neng_rong = [ 1, 1, 1, 1 ];

        this._hule        = [];
        this._hule_option = null;
        this._no_game     = false;
        this._lianzhuang  = false;
        this._changbang   = model.changbang;
        this._fenpei      = null;

        this._paipu.defen = model.defen.concat();
        this._paipu.log.push([]);
        let paipu = {
            qipai: {
                zhuangfeng: model.zhuangfeng,
                jushu:      model.jushu,
                changbang:  model.changbang,
                lizhibang:  model.lizhibang,
                defen:      model.player_id.map(id => model.defen[id]),
                baopai:     model.shan.baopai[0],
                shoupai:    model.shoupai.map(shoupai => shoupai.toString())
            }
        };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            for (let i = 0; i < 4; i++) {
                if (i != l) msg[l].qipai.shoupai[i] = '';
            }
        }
        this.call_players('qipai', msg, 0);

        if (this._view) this._view.redraw();
    }

    zimo() {

        let model = this._model;

        model.lunban = (model.lunban + 1) % 4;

        let zimo = model.shan.zimo();
        model.shoupai[model.lunban].zimo(zimo);

        let paipu = { zimo: { l: model.lunban, p: zimo } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            if (l != model.lunban) msg[l].zimo.p = '';
        }
        this.call_players('zimo', msg);

        if (this._view) this._view.update(paipu);
    }

    dapai(dapai) {

        let model = this._model;

        this._yifa[model.lunban] = 0;

        if (! model.shoupai[model.lunban].lizhi)
                                    this._neng_rong[model.lunban] = true;

        model.shoupai[model.lunban].dapai(dapai);
        model.he[model.lunban].dapai(dapai);

        if (this._diyizimo) {
            if (! dapai.match(/^z[1234]/))  this._fengpai = false;
            if (this._dapai && this._dapai.substr(0,2) != dapai.substr(0,2))
                                            this._fengpai = false;
        }
        else                                this._fengpai = false;

        if (dapai.substr(-1) == '*') {
            this._lizhi[model.lunban] = this._diyizimo ? 2 : 1;
            this._yifa[model.lunban]  = this._rule['一発あり'];
        }

        if (Majiang.Util.xiangting(model.shoupai[model.lunban]) == 0
            && Majiang.Util.tingpai(model.shoupai[model.lunban])
                            .find(p=>model.he[model.lunban].find(p)))
        {
            this._neng_rong[model.lunban] = false;
        }

        this._dapai = dapai;

        let paipu = { dapai: { l: model.lunban, p: dapai } };
        this.add_paipu(paipu);

        if (this._gang) this.kaigang();

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('dapai', msg);

        if (this._view) this._view.update(paipu);
    }

    fulou(fulou) {

        let model = this._model;

        this._diyizimo = false;
        this._yifa     = [0,0,0,0];

        model.he[model.lunban].fulou(fulou);

        let d = fulou.match(/[\+\=\-]/);
        model.lunban = (model.lunban + '_-=+'.indexOf(d)) % 4;

        model.shoupai[model.lunban].fulou(fulou);

        if (fulou.match(/^[mpsz]\d{4}/)) {
            this._gang = fulou;
            this._n_gang[model.lunban]++;
        }

        let paipu = { fulou: { l: model.lunban, m: fulou } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('fulou', msg);

        if (this._view) this._view.update(paipu);
    }

    gang(gang) {

        let model = this._model;

        model.shoupai[model.lunban].gang(gang);

        let paipu = { gang: { l: model.lunban, m: gang } };
        this.add_paipu(paipu);

        if (this._gang) this.kaigang();

        this._gang = gang;
        this._n_gang[model.lunban]++;

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('gang', msg);

        if (this._view) this._view.update(paipu);
    }

    gangzimo() {

        let model = this._model;

        this._diyizimo = false;
        this._yifa     = [0,0,0,0];

        let zimo = model.shan.gangzimo();
        model.shoupai[model.lunban].zimo(zimo);

        let paipu = { gangzimo: { l: model.lunban, p: zimo } };
        this.add_paipu(paipu);

        if (! this._rule['カンドラ後乗せ'] ||
            this._gang.match(/^[mpsz]\d{4}$/)) this.kaigang();

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            if (l != model.lunban) msg[l].gangzimo.p = '';
        }
        this.call_players('gangzimo', msg);

        if (this._view) this._view.update(paipu);
    }

    kaigang() {

        this._gang = null;

        if (! this._rule['カンドラあり']) return;

        let model = this._model;

        model.shan.kaigang();
        let baopai = model.shan.baopai.pop();

        let paipu = { kaigang: { baopai: baopai } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.notify_players('kaigang', msg);

        if (this._view) this._view.update(paipu);
    }

    hule() {

        let model = this._model;

        if (this._status != 'hule') {
            model.shan.close();
            this._hule_option = this._status == 'gang'     ? 'qianggang'
                              : this._status == 'gangzimo' ? 'lingshang'
                              :                              null;
        }

        let menfeng  = this._hule.length ? this._hule.shift() : model.lunban;
        let rongpai  = menfeng == model.lunban ? null
                     : (this._hule_option == 'qianggang'
                            ? this._gang[0] + this._gang.substr(-1)
                            : this._dapai.substr(0,2)
                       ) + '_+=-'[(4 + model.lunban - menfeng) % 4];
        let shoupai  = model.shoupai[menfeng].clone();
        let fubaopai = shoupai.lizhi ? model.shan.fubaopai : null;

        let param = {
            rule:           this._rule,
            zhuangfeng:     model.zhuangfeng,
            menfeng:        menfeng,
            hupai: {
                lizhi:      this._lizhi[menfeng],
                yifa:       this._yifa[menfeng],
                qianggang:  this._hule_option == 'qianggang',
                lingshang:  this._hule_option == 'lingshang',
                haidi:      model.shan.paishu > 0
                            || this._hule_option == 'lingshang' ? 0
                                : ! rongpai                     ? 1
                                :                                 2,
                tianhu:     ! (this._diyizimo && ! rongpai)     ? 0
                                : menfeng == 0                  ? 1
                                :                                 2
            },
            baopai:         model.shan.baopai,
            fubaopai:       fubaopai,
            jicun:          { changbang: model.changbang,
                              lizhibang: model.lizhibang }
        };
        let hule = Majiang.Util.hule(shoupai, rongpai, param);

        if (this._rule['連荘方式'] > 0 && menfeng == 0) this._lianzhuang = true;
        if (this._rule['場数'] == 0) this._lianzhuang = false;
        this._fenpei = hule.fenpei;

        let paipu = {
            hule: {
                l:          menfeng,
                shoupai:    rongpai ? shoupai.zimo(rongpai).toString()
                                    : shoupai.toString(),
                baojia:     rongpai ? model.lunban : null,
                fubaopai:   fubaopai,
                fu:         hule.fu,
                fanshu:     hule.fanshu,
                damanguan:  hule.damanguan,
                defen:      hule.defen,
                hupai:      hule.hupai,
                fenpei:     hule.fenpei
            }
        };
        for (let key of ['fu','fanshu','damanguan']) {
            if (! paipu.hule[key]) delete paipu.hule[key];
        }
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('hule', msg, this._wait);

        if (this._view) this._view.update(paipu);
    }

    pingju(name, shoupai = ['','','','']) {

        let model = this._model;

        let fenpei  = [0,0,0,0];

        if (! name) {

            let n_tingpai = 0;
            for (let l = 0; l < 4; l++) {
                if (this._rule['ノーテン宣言あり'] && ! shoupai[l]
                    && ! model.shoupai[l].lizhi) continue;
                if (! this._rule['ノーテン罰あり']
                    && (this._rule['連荘方式'] != 2 || l != 0)
                    && ! model.shoupai[l].lizhi)
                {
                    shoupai[l] = '';
                }
                else if (Majiang.Util.xiangting(model.shoupai[l]) == 0
                        && Majiang.Util.tingpai(model.shoupai[l]).length > 0)
                {
                    n_tingpai++;
                    shoupai[l] = model.shoupai[l].toString();
                    if (this._rule['連荘方式'] == 2 && l == 0)
                                                    this._lianzhuang = true;
                }
                else {
                    shoupai[l] = '';
                }
            }
            if (this._rule['流し満貫あり']) {
                for (let l = 0; l < 4; l++) {
                    let all_yaojiu = true;
                    for (let p of model.he[l]._pai) {
                        if (p.match(/[\+\=\-]$/)) { all_yaojiu = false; break }
                        if (p.match(/^z/))          continue;
                        if (p.match(/^[mps][19]/))  continue;
                        all_yaojiu = false; break;
                    }
                    if (all_yaojiu) {
                        name = '流し満貫';
                        for (let i = 0; i < 4; i++) {
                            fenpei[i] += l == 0 && i == l ? 12000
                                       : l == 0           ? -4000
                                       : l != 0 && i == l ?  8000
                                       : l != 0 && i == 0 ? -4000
                                       :                    -2000;
                        }
                    }
                }
            }
            if (! name) {
                name = '荒牌平局';
                if (this._rule['ノーテン罰あり']
                    && 0 < n_tingpai && n_tingpai < 4)
                {
                    for (let l = 0; l < 4; l++) {
                        fenpei[l] = shoupai[l] ?  3000 / n_tingpai
                                               : -3000 / (4 - n_tingpai);
                    }
                }
            }
            if (this._rule['連荘方式'] == 3) this._lianzhuang = true;
        }
        else {
            this._no_game    = true;
            this._lianzhuang = true;
        }

        if (this._rule['場数'] == 0) this._lianzhuang = true;

        this._fenpei = fenpei;

        let paipu = {
            pingju: { name: name, shoupai: shoupai, fenpei: fenpei }
        };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('pingju', msg, this._wait);

        if (this._view) this._view.update(paipu);
    }

    last() {

        let model = this._model;

        model.lunban = -1;
        if (this._view) this._view.update();

        if (! this._lianzhuang) {
            model.jushu++;
            model.zhuangfeng += (model.jushu / 4)|0;
            model.jushu = model.jushu % 4;
        }

        let jieju = false;
        let guanjun = -1;
        const defen = model.defen;
        for (let i = 0; i < 4; i++) {
            let id = (model.qijia + i) % 4;
            if (defen[id] < 0 && this._rule['トビ終了あり'])    jieju = true;
            if (defen[id] >= 30000
                && (guanjun < 0 || defen[id] > defen[guanjun])) guanjun = id;
        }

        let sum_jushu = model.zhuangfeng * 4 + model.jushu;

        if      (15 < sum_jushu)                                jieju = true;
        else if ((this._rule['場数'] + 1) * 4 - 1 < sum_jushu)  jieju = true;
        else if (this._max_jushu < sum_jushu) {
            if      (this._rule['延長戦方式'] == 0)             jieju = true;
            else if (this._rule['場数'] == 0)                   jieju = true;
            else if (guanjun >= 0)                              jieju = true;
            else {
                this._max_jushu += this._rule['延長戦方式'] == 3 ? 4
                                 : this._rule['延長戦方式'] == 2 ? 1
                                 :                                 0;
            }
        }
        else if (this._max_jushu == sum_jushu) {
            if (this._rule['オーラス止めあり'] && guanjun == model.player_id[0]
                && this._lianzhuang && ! this._no_game)         jieju = true;
        }

        if (jieju)  this.delay(()=>this.jieju(), 0);
        else        this.delay(()=>this.qipai(), 0);
    }

    jieju() {

        let model = this._model;

        let paiming = [];
        const defen = model.defen;
        for (let i = 0; i < 4; i++) {
            let id = (model.qijia + i) % 4;
            for (let j = 0; j < 4; j++) {
                if (j == paiming.length || defen[id] > defen[paiming[j]]) {
                    paiming.splice(j, 0, id);
                    break;
                }
            }
        }
        defen[paiming[0]] += model.lizhibang * 1000;
        this._paipu.defen = defen;

        let rank = [0,0,0,0];
        for (let i = 0; i < 4; i++) {
            rank[paiming[i]] = i + 1;
        }
        this._paipu.rank = rank;

        const round = ! this._rule['順位点'].find(p=>p.match(/\.\d$/));
        let point = [0,0,0,0];
        for (let i = 1; i < 4; i++) {
            let id = paiming[i];
            point[id] = (defen[id] - 30000) / 1000
                      + + this._rule['順位点'][i];
            if (round) point[id] = Math.round(point[id]);
            point[paiming[0]] -= point[id];
        }
        this._paipu.point = point.map(p=> p.toFixed(round ? 0 : 1));

        let paipu = { jieju: this._paipu };

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('jieju', msg, this._wait);

        if (this._view) this._view.summary(this._paipu);

        if (this._handler) this._handler();
    }

    get_reply(l) {
        let model = this._model;
        return this._reply[model.player_id[l]];
    }

    reply_kaiju() { this.delay(()=>this.qipai(), 0) }

    reply_qipai() { this.delay(()=>this.zimo(), 0) }

    reply_zimo() {

        let model = this._model;

        let reply = this.get_reply(model.lunban);
        if (reply.daopai) {
            if (this.allow_pingju()) {
                let shoupai = ['','','',''];
                shoupai[model.lunban] = model.shoupai[model.lunban].toString();
                return this.delay(()=>this.pingju('九種九牌', shoupai), 0);
            }
        }
        else if (reply.hule) {
            if (this.allow_hule()) {
                if (this._view) this._view.say('zimo', model.lunban);
                return this.delay(()=>this.hule());
            }
        }
        else if (reply.gang) {
            if (this.get_gang_mianzi().find(m => m == reply.gang)) {
                if (this._view) this._view.say('gang', model.lunban);
                return this.delay(()=>this.gang(reply.gang));
            }
        }
        else if (reply.dapai) {
            let dapai = reply.dapai.replace(/\*$/,'');
            if (this.get_dapai().find(p => p == dapai)) {
                if (reply.dapai.substr(-1) == '*' && this.allow_lizhi(dapai)) {
                    if (this._view) this._view.say('lizhi', model.lunban);
                    return this.delay(()=>this.dapai(reply.dapai));
                }
                return this.delay(()=>this.dapai(dapai), 0);
            }
        }

        let p = this.get_dapai().pop();
        this.delay(()=>this.dapai(p), 0);
    }

    reply_dapai() {

        let model = this._model;

        for (let i = 1; i < 4; i++) {
            let l = (model.lunban + i) % 4;
            let reply = this.get_reply(l);
            if (reply.hule && this.allow_hule(l)) {
                if (this._rule['最大同時和了数'] == 1  && this._hule.length)
                                                                    continue;
                if (this._view) this._view.say('rong', l);
                this._hule.push(l);
            }
            else {
                let shoupai = model.shoupai[l].clone().zimo(this._dapai);
                if (Majiang.Util.xiangting(shoupai) == -1)
                                                this._neng_rong[l] = false;
            }
        }
        if (this._hule.length == 3 && this._rule['最大同時和了数'] == 2) {
            let shoupai = ['','','',''];
            for (let l of this._hule) {
                shoupai[l] = model.shoupai[l].toString();
            }
            return this.delay(()=>this.pingju('三家和', shoupai));
        }
        else if (this._hule.length) {
            return this.delay(()=>this.hule());
        }

        if (this._dapai.substr(-1) == '*') {
            model.defen[model.player_id[model.lunban]] -= 1000;
            model.lizhibang++;

            if (this._lizhi.filter(x=>x).length == 4
                && this._rule['途中流局あり'])
            {
                let shoupai = model.shoupai.map(s=>s.toString());
                return this.delay(()=>this.pingju('四家立直', shoupai));
            }
        }

        if (this._diyizimo && model.lunban == 3) {
            this._diyizimo = false;
            if (this._fengpai) {
                return this.delay(()=>this.pingju('四風連打'), 0);
            }
        }

        if (this._n_gang.reduce((x, y)=> x + y) == 4) {
            if (Math.max(...this._n_gang) < 4 && this._rule['途中流局あり']) {
                return this.delay(()=>this.pingju('四開槓'), 0);
            }
        }

        if (! model.shan.paishu) {
            let shoupai = ['','','',''];
            for (let l = 0; l < 4; l++) {
                let reply = this.get_reply(l);
                if (reply.daopai) shoupai[l] = reply.daopai;
            }
            return this.delay(()=>this.pingju('', shoupai), 0);
        }

        for (let i = 1; i < 4; i++) {
            let l = (model.lunban + i) % 4;
            let reply = this.get_reply(l);
            if (reply.fulou) {
                let m = reply.fulou.replace(/0/g,'5');
                if (m.match(/^[mpsz](\d)\1\1\1/)) {
                    if (this.get_gang_mianzi(l).find(m => m == reply.fulou)) {
                        if (this._view) this._view.say('gang', l);
                        return this.delay(()=>this.fulou(reply.fulou));
                    }
                }
                else if (m.match(/^[mpsz](\d)\1\1/)) {
                    if (this.get_peng_mianzi(l).find(m => m == reply.fulou)) {
                        if (this._view) this._view.say('peng', l);
                        return this.delay(()=>this.fulou(reply.fulou));
                    }
                }
            }
        }
        let l = (model.lunban + 1) % 4;
        let reply = this.get_reply(l);
        if (reply.fulou) {
            if (this.get_chi_mianzi(l).find(m => m == reply.fulou)) {
                if (this._view) this._view.say('chi', l);
                return this.delay(()=>this.fulou(reply.fulou));
            }
        }

        this.delay(()=>this.zimo(), 0);
    }

    reply_fulou() {

        let model = this._model;

        if (this._gang) {
            return this.delay(()=>this.gangzimo(), 0);
        }

        let reply = this.get_reply(model.lunban);
        if (reply.dapai) {
            if (this.get_dapai().find(p => p == reply.dapai)) {
                return this.delay(()=>this.dapai(reply.dapai), 0);
            }
        }

        let p = this.get_dapai().pop();
        this.delay(()=>this.dapai(p), 0);
    }

    reply_gang() {

        let model = this._model;

        if (this._gang.match(/^[mpsz]\d{4}$/)) {
            return this.delay(()=>this.gangzimo(), 0);
        }

        for (let i = 1; i < 4; i++) {
            let l = (model.lunban + i) % 4;
            let reply = this.get_reply(l);
            if (reply.hule && this.allow_hule(l)) {
                if (this._rule['最大同時和了数'] == 1  && this._hule.length)
                                                                    continue;
                if (this._view) this._view.say('rong', l);
                this._hule.push(l);
            }
            else {
                let p = this._gang[0] + this._gang.substr(-1);
                let shoupai = model.shoupai[l].clone().zimo(p);
                if (Majiang.Util.xiangting(shoupai) == -1)
                                                this._neng_rong[l] = false;
            }
        }
        if (this._hule.length) {
            return this.delay(()=>this.hule());
        }

        this.delay(()=>this.gangzimo(), 0);
    }

    reply_hule() {

        let model = this._model;

        for (let l = 0; l < 4; l++) {
            model.defen[model.player_id[l]] += this._fenpei[l];
        }
        model.changbang = 0;
        model.lizhibang = 0;

        if (this._hule.length) {
            return this.delay(()=>this.hule());
        }
        else {
            if (this._lianzhuang) model.changbang = this._changbang + 1;
            return this.delay(()=>this.last(), 0);
        }
    }

    reply_pingju() {

        let model = this._model;

        for (let l = 0; l < 4; l++) {
            model.defen[model.player_id[l]] += this._fenpei[l];
        }
        model.changbang++;

        this.delay(()=>this.last(), 0);
    }

    get_dapai() {
        let model = this._model;
        return Game.get_dapai(this._rule, model.shoupai[model.lunban]);
    }

    get_chi_mianzi(l) {
        let model = this._model;
        let d = '_+=-'[(4 + model.lunban - l) % 4];
        return Game.get_chi_mianzi(this._rule, model.shoupai[l],
                                   this._dapai + d, model.shan.paishu);
    }

    get_peng_mianzi(l) {
        let model = this._model;
        let d = '_+=-'[(4 + model.lunban - l) % 4];
        return Game.get_peng_mianzi(this._rule, model.shoupai[l],
                                    this._dapai + d, model.shan.paishu);
    }

    get_gang_mianzi(l) {
        let model = this._model;
        if (l == null) {
            return Game.get_gang_mianzi(this._rule, model.shoupai[model.lunban],
                                        null, model.shan.paishu,
                                        this._n_gang.reduce((x, y)=> x + y));
        }
        else {
            let d = '_+=-'[(4 + model.lunban - l) % 4];
            return Game.get_gang_mianzi(this._rule, model.shoupai[l],
                                        this._dapai + d, model.shan.paishu,
                                        this._n_gang.reduce((x, y)=> x + y));
        }
    }

    allow_lizhi(p) {
        let model = this._model;
        return Game.allow_lizhi(this._rule, model.shoupai[model.lunban],
                                p, model.shan.paishu,
                                model.defen[model.player_id[model.lunban]]);
    }

    allow_hule(l) {
        let model = this._model;
        if (l == null) {
            let hupai = model.shoupai[model.lunban].lizhi
                     || this._status == 'gangzimo'
                     || model.shan.paishu == 0;
            return Game.allow_hule(this._rule,
                                   model.shoupai[model.lunban], null,
                                   model.zhuangfeng, model.lunban, hupai);
        }
        else {
            let p = (this._status == 'gang'
                        ? this._gang[0] + this._gang.substr(-1)
                        : this._dapai
                    ) + '_+=-'[(4 + model.lunban - l) % 4];
            let hupai = model.shoupai[l].lizhi
                     || this._status == 'gang'
                     || model.shan.paishu == 0;
            return Game.allow_hule(this._rule,
                                   model.shoupai[l], p,
                                   model.zhuangfeng, l, hupai,
                                   this._neng_rong[l]);
        }
    }

    allow_pingju() {
        let model = this._model;
        return Game.allow_pingju(this._rule, model.shoupai[model.lunban],
                                 this._diyizimo);
    }

    static get_dapai(rule, shoupai) {

        if (rule['喰い替え許可レベル'] == 0) return shoupai.get_dapai(true);
        if (rule['喰い替え許可レベル'] == 1
            && shoupai._zimo && shoupai._zimo.length > 2)
        {
            let deny = shoupai._zimo[0]
                     + (+shoupai._zimo.match(/\d(?=[\+\=\-])/)||5);
            return shoupai.get_dapai(false)
                                .filter(p => p.replace(/0/,'5') != deny);
        }
        return shoupai.get_dapai(false);
    }

    static get_chi_mianzi(rule, shoupai, p, paishu) {

        let mianzi = shoupai.get_chi_mianzi(p, rule['喰い替え許可レベル'] == 0);
        if (! mianzi) return mianzi;
        if (rule['喰い替え許可レベル'] == 1
            && shoupai._fulou.length == 3
            && shoupai._bingpai[p[0]][p[1]] == 2) mianzi = [];
        return paishu == 0 ? [] : mianzi;
    }

    static get_peng_mianzi(rule, shoupai, p, paishu) {

        let mianzi = shoupai.get_peng_mianzi(p);
        if (! mianzi) return mianzi;
        return paishu == 0 ? [] : mianzi;
    }

    static get_gang_mianzi(rule, shoupai, p, paishu, n_gang) {

        let mianzi = shoupai.get_gang_mianzi(p);
        if (! mianzi || mianzi.length == 0) return mianzi;

        if (shoupai.lizhi) {
            if (rule['リーチ後暗槓許可レベル'] == 0) return [];
            else if (rule['リーチ後暗槓許可レベル'] == 1) {
                let new_shoupai, n_hule1 = 0, n_hule2 = 0;
                new_shoupai = shoupai.clone().dapai(shoupai._zimo);
                for (let p of Majiang.Util.tingpai(new_shoupai)) {
                    n_hule1 += Majiang.Util.hule_mianzi(new_shoupai, p).length;
                }
                new_shoupai = shoupai.clone().gang(mianzi[0]);
                for (let p of Majiang.Util.tingpai(new_shoupai)) {
                    n_hule2 += Majiang.Util.hule_mianzi(new_shoupai, p).length;
                }
                if (n_hule1 > n_hule2) return [];
            }
            else {
                let new_shoupai;
                new_shoupai = shoupai.clone().dapai(shoupai._zimo);
                let n_tingpai1 = Majiang.Util.tingpai(new_shoupai).length;
                new_shoupai = shoupai.clone().gang(mianzi[0]);
                if (Majiang.Util.xiangting(new_shoupai) > 0) return [];
                let n_tingpai2 = Majiang.Util.tingpai(new_shoupai).length;
                if (n_tingpai1 > n_tingpai2) return [];
            }
        }
        return paishu == 0 || n_gang == 4 ? [] : mianzi;
    }

    static allow_lizhi(rule, shoupai, p, paishu, defen) {

        if (! shoupai._zimo)   return false;
        if (shoupai.lizhi)     return false;
        if (! shoupai.menqian) return false;

        if (! rule['ツモ番なしリーチあり'] && paishu < 4) return false;
        if (rule['トビ終了あり'] && defen < 1000)         return false;

        if (Majiang.Util.xiangting(shoupai) > 0) return false;

        if (p) {
            let new_shoupai = shoupai.clone().dapai(p);
            return Majiang.Util.xiangting(new_shoupai) == 0
                    && Majiang.Util.tingpai(new_shoupai).length > 0;
        }
        else {
            let dapai = [];
            for (let p of Game.get_dapai(rule, shoupai)) {
                let new_shoupai = shoupai.clone().dapai(p);
                if (Majiang.Util.xiangting(new_shoupai) == 0
                    && Majiang.Util.tingpai(new_shoupai).length > 0)
                {
                    dapai.push(p);
                }
            }
            return dapai.length ? dapai : false;
        }
    }

    static allow_hule(rule, shoupai, p, zhuangfeng, menfeng, hupai, neng_rong) {

        if (p && ! neng_rong) return false;

        let new_shoupai = shoupai.clone();
        if (p) new_shoupai.zimo(p);
        if (Majiang.Util.xiangting(new_shoupai) != -1) return false;

        if (hupai) return true;

        let param = {
            rule:       rule,
            zhuangfeng: zhuangfeng,
            menfeng:    menfeng,
            hupai:      {},
            baopai:     [],
            jicun:      { changbang: 0, lizhibang: 0 }
        };
        let hule = Majiang.Util.hule(shoupai, p, param);

        return hule.hupai != null;
    }

    static allow_pingju(rule, shoupai, diyizimo) {

        if (! (diyizimo && shoupai._zimo)) return false;
        if (! rule['途中流局あり']) return false;

        let n_yaojiu = 0;
        for (let s of ['m','p','s','z']) {
            let bingpai = shoupai._bingpai[s];
            let nn = (s == 'z') ? [1,2,3,4,5,6,7] : [1,9];
            for (let n of nn) {
                if (bingpai[n] > 0) n_yaojiu++;
            }
        }
        return n_yaojiu >= 9;
    }

    static allow_no_daopai(rule, shoupai, paishu) {

        if (paishu > 0 || shoupai._zimo) return false;
        if (! rule['ノーテン宣言あり']) return false;
        if (shoupai.lizhi) return false;

        return Majiang.Util.xiangting(shoupai) == 0
                && Majiang.Util.tingpai(shoupai).length > 0;
    }
}
