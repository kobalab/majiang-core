/*
 *  Majiang.Board
 */
"use strict";

const Majiang = {
    Shoupai: require('./shoupai'),
    He:      require('./he')
};

class Shan {
    constructor(baopai) {
        this.paishu = 136 - 13 * 4 - 14;
        this.baopai = [ baopai ];
        this.fubaopai;
    }
    zimo(p)         { this.paishu--; return p || '_' }
    kaigang(baopai) { this.baopai.push(baopai);      }
}

module.exports = class Board {

    constructor(kaiju) {

        this.title  = kaiju.title;
        this.player = kaiju.player;
        this.qijia  = kaiju.qijia;

        this.zhuangfeng = 0;
        this.jushu      = 0;
        this.changbang  = 0;
        this.lizhibang  = 0;
        this.defen      = [];
        this.shan       = null;
        this.shoupai    = [];
        this.he         = [];
        this.player_id  = [0,1,2,3];
        this.lunban     = -1;
    }

    qipai(qipai) {
        this.zhuangfeng = qipai.zhuangfeng;
        this.jushu      = qipai.jushu;
        this.changbang  = qipai.changbang;
        this.lizhibang  = qipai.lizhibang;
        this.shan       = new Shan(qipai.baopai);
        for (let l = 0; l < 4; l++) {
            let paistr = qipai.shoupai[l] || '_'.repeat(13);
            this.shoupai[l] = Majiang.Shoupai.fromString(paistr);
            this.he[l]      = new Majiang.He();
            this.player_id[l] = (this.qijia + this.jushu + l) % 4;
            this.defen[this.player_id[l]] = qipai.defen[l];
        }
        this.lunban     = -1;
    }

    zimo(zimo) {
        this.lunban = zimo.l;
        this.shoupai[zimo.l].zimo(this.shan.zimo(zimo.p));
    }

    dapai(dapai) {
        this.shoupai[dapai.l].dapai(dapai.p);
        this.he[dapai.l].dapai(dapai.p);
    }

    fulou(fulou) {
        this.he[this.lunban].fulou(fulou.m);
        this.lunban = fulou.l;
        this.shoupai[fulou.l].fulou(fulou.m);
    }

    gang(gang) {
        this.shoupai[gang.l].gang(gang.m);
    }

    kaigang(kaigang) {
        this.shan.kaigang(kaigang.baopai);
    }

    hule(hule) {
        this.shan.fubaopai = hule.fubaopai;
    }
}
