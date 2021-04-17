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
        this._reply;

        this._sync  = false;
        this._stop  = false;
        this._speed = 3;
        this._wait  = 5000;
        this._timeout_id;
    }

    get model()    { return this._model }
    set view(view) { this._view = view  }

    add_paipu(paipu) {
        this._paipu.log[this._paipu.log.length - 1].push(paipu);
    }

    last_paipu(i = 0) {
        let log = this._paipu.log[this._paipu.log.length - 1];
        return log[log.length - 1 + i];
    }

    delay(callback, timeout) {

        if (this._sync) return callback();

        timeout = this._speed == 0 ? 0
                : timeout == null  ? Math.max(500, this._speed * 200)
                :                    timeout;
        setTimeout(callback, timeout);
    }

    stop() {
        if (this._sync) return;
        this._stop = true;
        this._timeout_id = clearTimeout(this._timeout_id);
    }

    start() {
        if (this._sync) return;
        if (this._timeout_id) return;
        this._stop = false;
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
        if (this._reply.filter(x=>x).length < 4) return;
        if (! this._timeout_id)
                this._timeout_id = setTimeout(()=>this.next(), 0);
    }

    next(force) {
        this._timeout_id = clearTimeout(this._timeout_id);
        if (this._reply.filter(x=>x).length < 4) return;
        if (this._stop && ! force) return;

        if (this._status == 'test') this._callback();

        this._reply = null;
    }

    kaiju(qijia) {

        this._model.qijia = (qijia == null) ? Math.floor(Math.random() * 4)
                                            : qijia;
        this._paipu = {
            title:  this._model.title,
            player: this._model.player,
            qijia:  this._model.qijia,
            log:    [],
            defen:  this._model.defen.concat(),
            point:  [0,0,0,0],
            rank:   [1,2,3,4]
        };

        let msg = [];
        for (let id = 0; id < 4; id++) {
            msg[id] = JSON.parse(JSON.stringify({
                kaiju: {
                    id:     id,
                    rule:   this._rule,
                    player: this._paipu.player,
                    qijia:  this._paipu.qijia
                }
            }));
        }
        this.call_players('kaiju', msg);

        if (this._view) this._view.kaiju();
    }

    qipai(shan) {

        let model = this._model;

        model.shan = shan || new Majiang.Shan(this._rule);
        let qipai = [];
        for (let l = 0; l < 4; l++) {
            qipai[l] = [];
            for (let i = 0; i < 13; i++) {
                qipai[l].push(model.shan.zimo());
            }
            model.shoupai[l]   = new Majiang.Shoupai(qipai[l]);
            model.he[l]        = new Majiang.He();
            model.player_id[l] = (model.qijia + model.jushu + l) % 4;
        }
        model.lunban = -1;

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
        this.call_players('qipai', msg);

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

        model.shoupai[model.lunban].dapai(dapai);
        model.he[model.lunban].dapai(dapai);

        let paipu = { dapai: { l: model.lunban, p: dapai } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('dapai', msg);

        if (this._view) this._view.update(paipu);
    }

    fulou(fulou) {

        let model = this._model;

        model.he[model.lunban].fulou(fulou);

        let d = fulou.match(/[\+\=\-]/);
        model.lunban = (model.lunban + '_-=+'.indexOf(d)) % 4;

        model.shoupai[model.lunban].fulou(fulou);

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

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
        }
        this.call_players('gang', msg);

        if (this._view) this._view.update(paipu);
    }

    gangzimo() {

        let model = this._model;

        let zimo = model.shan.gangzimo();
        model.shoupai[model.lunban].zimo(zimo);

        let paipu = { gangzimo: { l: model.lunban, p: zimo } };
        this.add_paipu(paipu);

        let msg = [];
        for (let l = 0; l < 4; l++) {
            msg[l] = JSON.parse(JSON.stringify(paipu));
            if (l != model.lunban) msg[l].gangzimo.p = '';
        }
        this.call_players('gangzimo', msg);

        if (this._view) this._view.update(paipu);
    }

    do_sync() {
        this._stop  = false;
        this._speed = 0;
        this._wait  = 0;
        this._sync  = true;
    }

    static get_dapai(rule, shoupai) {

        if (rule['喰い替え許可レベル'] == 0) return shoupai.get_dapai(true);
        if (rule['喰い替え許可レベル'] == 1
            && shoupai._zimo && shoupai._zimo.length > 2)
        {
            let deny = shoupai._zimo[0]
                     + shoupai._zimo.match(/\d(?=[\+\=\-])/);
            return shoupai.get_dapai(false).filter(p => p != deny);
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

    static get_gang_mianzi(rule, shoupai, p, paishu) {

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
                let n_tingpai2 = Majiang.Util.tingpai(new_shoupai).length;
                if (n_tingpai1 > n_tingpai2) return [];
            }
        }
        return paishu == 0 ? [] : mianzi;
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

        if (! diyizimo)             return false;
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
}
