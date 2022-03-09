/*
 *  Majiang.Dev.Game
 */
"use strict";

const Majiang = require('../');

function make_shan(rule, log) {

    function set_qipai(paistr) {
        for (let suitstr of paistr.match(/[mpsz]\d+/g)) {
            let s = suitstr[0];
            for (let n of suitstr.match(/\d/g)) { shan._pai[--zimo_idx] = s+n }
        }
    }

    const shan = new Majiang.Shan(rule);
    for (let i = 0; i < shan._pai.length; i++) { shan._pai[i] = '_' }

    let zimo_idx = shan._pai.length;
    let gang_idx = 0;
    let baopai   = [];
    let fubaopai = [];

    for (let data of log) {
        if (data.qipai) {
            for (let l = 0; l < 4; l++) { set_qipai(data.qipai.shoupai[l]) }
            baopai.push(data.qipai.baopai);
        }
        else if (data.zimo)     shan._pai[--zimo_idx] = data.zimo.p;
        else if (data.gangzimo) shan._pai[gang_idx++] = data.gangzimo.p;
        else if (data.kaigang)  baopai.push(data.kaigang.baopai);
        else if (data.hule && data.hule.fubaopai)
                                fubaopai = data.hule.fubaopai;
    }

    for (let i = 0; i < baopai.length; i++)   { shan._pai[4 + i] = baopai[i] }
    for (let i = 0; i < fubaopai.length; i++) { shan._pai[9 + i] = fubaopai[i] }

    shan._baopai   = [ shan._pai[4] ];
    shan._fubaopai = [ shan._pai[9] ];

    return shan;
}

function make_reply(l, log) {

    const reply = [];

    for (let data of log) {
        if (data.zimo || data.gangzimo) reply.push({});
        else if (data.dapai)
            reply.push(l == data.dapai.l ? { dapai: data.dapai.p } : {});
        else if (data.fulou)
            reply.push(l == data.fulou.l ? { fulou: data.fulou.m } : {});
        else if (data.gang)
            reply.push(l == data.gang.l  ? { gang:  data.gang.m  } : {});
        else if (data.pingju) {
            if (data.pingju.shoupai[l]) {
                if (data.pingju.name.match(/^三家和/))
                        reply.push({ hule: '-' });
                else    reply.push({ daopai: '-' });
            }
        }
        else if (data.hule)
            if (l == data.hule.l) reply.push({ hule: '-' });
    }

    return reply;
}

class Player {
    constructor()         { this._reply = [] }
    action(msg, callback) { if (callback) callback(this._reply.shift()) }
}

module.exports = class Game extends Majiang.Game {

    constructor(script, rule) {
        super([0,1,2,3].map(x=> new Player()), null, rule);
        this._model.title = script.title;
        this._model.player = script.player;
        this._script = script;
    }
    kaiju() {
        super.kaiju(this._script.qijia);
    }
    qipai() {
        const log = this._script.log.shift();
        for (let l = 0; l < 4; l++) {
            let id = (this._model.qijia + this._model.jushu + l) % 4;
            this._players[id]._reply = make_reply(l, log);
        }
        super.qipai(make_shan(this._rule, log));
    }
}
