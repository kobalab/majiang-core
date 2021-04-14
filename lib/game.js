/*
 *  Majiang.Game
 */
"use strict";

const Majiang = { rule: require('./rule') };

module.exports = class Game {

    constructor(players, callback, rule) {

        this._players  = players;
        this._callback = callback || (()=>{});
        this._rule     = rule || Majiang.rule();

        this._sync  = false;
        this._stop  = false;
        this._speed = 3;
        this._wait  = 5000;

        this._status;
        this._reply;
        this._timeout_id;
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

    kaiju() {}

    do_sync() {
        this._stop  = false;
        this._speed = 0;
        this._wait  = 0;
        this._sync  = true;
    }

    next(force) {
        this._timeout_id = clearTimeout(this._timeout_id);
        if (this._reply.filter(x=>x).length < 4) return;
        if (this._stop && ! force) return;

        if (this._status == 'test') this._callback();

        this._reply = null;
    }

    notify_players(msg) {

        for (let l = 0; l < 4; l++) {
            let id = l;
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
            let id = l;
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
}
