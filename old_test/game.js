const assert = require('assert');

const Majiang = require('../');
Majiang.Dev = { Game: require('../dev/game') };

const script = require('./data/script.json');

let MSG = [];

class Player {
    constructor(id, reply = [], delay = 0) {
        this._id    = id;
        this._reply = reply;
        this._delay = delay;
    }
    action(msg, callback) {
        MSG[this._id] = msg;
        if (callback) {
            if (this._delay)
                    setTimeout(()=>callback(this._reply.shift()), this._delay);
            else    callback(this._reply.shift());
        }
    }
}

class View {
    kaiju  (param) { this._param = { kaiju:   param } }
    redraw (param) { this._param = { redraw:  param } }
    update (param) { this._param = { update:  param } }
    say (...param) { this._say   = param              }
    summary(param) { this._param = { summary: param } }
}

function init_game(param = {}) {

    const players = [0,1,2,3].map(id => new Player(id));
    const rule = param.rule || Majiang.rule();
    const game = new Majiang.Game(players, param.callback, rule);

    game.view = new View();
    game._sync = true;
    if (param.qijia != null) game.kaiju(param.qijia);
    else                     game.kaiju();

    if (param.lizhibang) {
        game.model.lizhibang = param.lizhibang;
    }
    if (param.changbang) {
        game.model.changbang = param.changbang;
    }

    game.qipai();

    if (param.shoupai) {
        for (let l = 0; l < 4; l++) {
            if (! param.shoupai[l]) continue;
            let paistr = param.shoupai[l];
            if (paistr == '_') paistr = '_'.repeat(13);
            game.model.shoupai[l] = Majiang.Shoupai.fromString(paistr);
        }
    }
    if (param.zimo) {
        let pai = game.model.shan._pai;
        for (let i = 0; i < param.zimo.length; i++) {
            pai[pai.length - 1 - i] = param.zimo[i];
        }
    }
    if (param.gangzimo) {
        let pai = game.model.shan._pai;
        for (let i = 0; i < param.gangzimo.length; i++) {
            pai[i] = param.gangzimo[i];
        }
    }
    if (param.baopai) {
        game.model.shan._baopai = [ param.baopai ];
    }
    if (param.defen) {
        for (let l = 0; l < 4; l++) {
            let id = game.model.player_id[l];
            game.model.defen[id] = param.defen[l];
        }
    }

    return game;
}

function set_reply(game, reply) {
    for (let l = 0; l < 4; l++) {
        let id = game.model.player_id[l];
        game._players[id]._reply = [reply[l]];
    }
}

function last_paipu(game, i = 0) {
    let log = game._paipu.log[game._paipu.log.length - 1];
    return log[log.length - 1 + i];
}

suite('Majiang.Game', ()=>{

    test('クラスが存在すること', ()=> assert.ok(Majiang.Game));

    suite('constructor(players, callback, rule)', ()=>{

        const game = new Majiang.Game();
        const rule = Majiang.rule();

        test('インスタンスが生成できること', ()=> assert.ok(game));
        test('タイトルが設定されていること', ()=> assert.ok(game._model.title));
        test('タイトルが設定可能なこと', ()=>{
            const game = new Majiang.Game([], null, rule, 'タイトル');
            assert.equal(game._model.title, 'タイトル');
        });
        test('対局者名が設定されていること', ()=>
            assert.deepEqual(game._model.player, ['私','下家','対面','上家']));
        test('局数が初期化されていること', ()=>{
            assert.equal(game._model.zhuangfeng, 0);
            assert.equal(game._model.jushu, 0);
        });
        test('供託が初期化されていること', ()=>{
            assert.equal(game._model.changbang, 0);
            assert.equal(game._model.lizhibang, 0);
        });
        test('持ち点が初期化されていること', ()=>
            assert.deepEqual(game._model.defen, [25000,25000,25000,25000]));
        test('持ち点が変更可能なこと', ()=>{
            const rule = Majiang.rule({'配給原点':30000});
            const game = new Majiang.Game([], null, rule);
            assert.deepEqual(game._model.defen, [30000,30000,30000,30000]);
        });
    });

    suite('speed()', ()=>{
        test('speed が変更できること', ()=>{
            const game = new Majiang.Game();
            game.speed = 5;
            assert.equal(game.speed, 5);
        });
    });

    suite('delay(callback, timeout)', ()=>{

        const game = new Majiang.Game();

        test('speed: 0 → 0ms', (done)=>{
            let called;
            game.speed = 0;
            game.delay(()=>{ called = 1 });
            assert.ifError(called);
            setTimeout(()=>{ assert.ok(called); done() }, 0);
        });
        test('speed: 1 → 500ms', (done)=>{
            let called;
            game.speed = 1;
            game.delay(()=>{ called = 1 });
            setTimeout(()=>{ assert.ifError(called)    }, 200);
            setTimeout(()=>{ assert.ok(called); done() }, 500);
        });
        test('speed: 3 → 600ms', (done)=>{
            let called;
            game.speed = 3;
            game.delay(()=>{ called = 1 });
            setTimeout(()=>{ assert.ifError(called)    }, 500);
            setTimeout(()=>{ assert.ok(called); done() }, 600);
        });
        test('speed: 0, timeout: 100 → 0ms', (done)=>{
            let called;
            game.speed = 0;
            game.delay(()=>{ called = 1 }, 100);
            assert.ifError(called);
            setTimeout(()=>{ assert.ok(called); done() }, 0);
        });
        test('speed: 5, timeout: 100 → 100ms', (done)=>{
            let called;
            game.speed = 5;
            game.delay(()=>{ called = 1 }, 100);
            setTimeout(()=>{ assert.ifError(called)    }, 0);
            setTimeout(()=>{ assert.ok(called); done() }, 100);
        });
    });

    suite('stop()', ()=>{

        const game = new Majiang.Game();

        test('停止すること', ()=>{
            game.stop();
            assert.ok(game._stop);
            game._reply = [1,1,1,1];
            game.next();
        });
        test('停止時に指定したコールバックが呼ばれること', (done)=>{
            game.stop(done);
            game._reply = [1,1,1,1];
            game.next();
        });
    });

    suite('start()', ()=>{

        const game = new Majiang.Game();

        test('再開すること', (done)=>{
            game.stop();
            game.start();
            assert.ok(! game._stop);
            assert.ok(game._timeout_id);
            setTimeout(()=>{
                assert.ok(! game._timeout_id);
                done();
            }, 0);
        });
        test('二重起動しないこと', ()=>{
            game._timeout_id = 1;
            game.start();
            assert.equal(game._timeout_id, 1);
        });
    });

    suite('notify_players(type, msg)', ()=>{

        const players = [0,1,2,3].map(id => new Player(id));
        const game = new Majiang.Game(players);
        let msg  = ['a','b','c','d'];

        test('通知が伝わること', (done)=>{
            MSG = [];
            game.notify_players('type', msg);
            assert.equal(MSG.length, 0);
            setTimeout(()=>{
                assert.deepEqual(MSG, msg);
                done();
            }, 0);
        });
    });

    suite('call_players(type, msg, timeout)', ()=>{

        const players = [0,1,2,3].map(id => new Player(id));
        const game = new Majiang.Game(players);
        game.speed = 1;
        let type = 'test';
        let msg  = ['a','b','c','d'];

        test('通知が伝わること', (done)=>{
            game.stop(()=>{
                assert.deepEqual(MSG, msg);
                done();
            });
            MSG = [];
            game.call_players(type, msg);
            assert.equal(MSG.length, 0);
        });
        test('応答が返ること', (done)=>{
            game.stop(done);
            game.call_players(type, msg);
        });
        test('遅い player がいても応答を取得できること', (done)=>{
            game.stop(done);
            for (let player of players) { player._delay = 100 }
            game.call_players(type, msg, 0);
        });
    });

    suite('kaiju(qijia)', ()=>{

        const players = [0,1,2,3].map(id => new Player(id));
        const rule = Majiang.rule();
        const game = new Majiang.Game(players, rule);
        game.view = new View();
        game.speed = 0;
        game._sync = true;
        game.stop();

        test('起家が設定されること', ()=>{
            MSG =[];
            game.kaiju(0);
            assert.equal(game._model.qijia, 0);
        });
        test('牌譜が初期化されること', ()=>{
            assert.equal(game._paipu.title, game._model.title);
            assert.deepEqual(game._paipu.player, game._model.player);
            assert.equal(game._paipu.qijia, game._model.qijia);
            assert.equal(game._paipu.log.length, 0);
        });
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { kaiju: null }));
        test('通知が伝わること', ()=>{
            for (let id = 0; id < 4; id++) {
                let msg = {
                    kaiju: {
                        id:     id,
                        rule:   game._rule,
                        title:  game._model.title,
                        player: game._model.player,
                        qijia:  0
                    }
                };
                assert.deepEqual(MSG[id], msg);
            }
        });
        test('起家を乱数で設定できること', ()=>{
            game.stop();
            game.kaiju();
            assert.ok(game._model.qijia == 0 ||
                      game._model.qijia == 1 ||
                      game._model.qijia == 2 ||
                      game._model.qijia == 3);
        });
    });

    suite('qipai(shan)', ()=>{

        const players = [0,1,2,3].map(id => new Player(id));
        const rule = Majiang.rule();
        const game = new Majiang.Game(players, rule);
        game.view = new View();
        game._sync = true;
        game.kaiju();

        test('牌山が生成されること', ()=>{
            game.qipai();
            const shan = game.model.shan;
            assert.equal(shan.paishu, 70);
            assert.equal(shan.baopai.length, 1);
            assert.ifError(shan.fubaopai);
        });
        test('配牌されること', ()=>{
            for (let l = 0; l < 4; l++) {
                assert.equal(game.model.shoupai[l]
                                .toString().replace(/[mpsz]/g,'').length, 13);
            }
        });
        test('河が初期化されること', ()=>{
            for (let l = 0; l < 4; l++) {
                assert.equal(game.model.he[l]._pai.length, 0);
            }
        });
        test('第一ツモ巡であること', ()=> assert.ok(game._diyizimo));
        test('四風連打中であること', ()=> assert.ok(game._fengpai));
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).qipai));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { redraw: null }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].qipai.defen[l], 25000);
                assert.ok(MSG[id].qipai.shoupai[l]);
            }
        });

        test('使用する牌山を指定できること', ()=>{
            const game = init_game();
            const shan = new Majiang.Shan(game._rule);
            const shoupai = new Majiang.Shoupai(shan._pai.slice(-13));
            game.qipai(shan);
            assert.equal(game.model.shoupai[0].toString(), shoupai.toString());
        });
        test('途中流局なしの場合、最初から四風連打中でないこと', ()=>{
            const game = init_game({rule:Majiang.rule({'途中流局あり':false})});
            game.qipai();
            assert.ok(! game._fengpai);
        });
    });

    suite('zimo()', ()=>{

        const game = init_game();

        test('手番が更新されること', ()=>{
            game.zimo();
            assert.equal(game.model.lunban, 0);
        });
        test('牌山からツモられること', ()=>
            assert.equal(game.model.shan.paishu, 69));
        test('手牌にツモ牌が加えられること', ()=>
            assert.ok(game.model.shoupai[0].get_dapai()));
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).zimo));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].zimo.l, game.model.lunban);
                if (l == game.model.lunban)
                        assert.ok(MSG[id].zimo.p);
                else    assert.ok(! MSG[id].zimo.p);
            }
        });
    });

    suite('dapai(dapai)', ()=>{

        const game = init_game();
        let dapai;

        test('手牌から打牌が切り出されること', ()=>{
            game.zimo();
            dapai = game.model.shoupai[0].get_dapai()[0];
            game.dapai(dapai);
            assert.ok(! game.model.shoupai[0].get_dapai());
        });
        test('河に打牌されること', ()=>
            assert.equal(game.model.he[0]._pai[0], dapai));
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).dapai));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].dapai.l, game.model.lunban);
                assert.equal(MSG[id].dapai.p, dapai);
            }
        });

        test('風牌以外の打牌で四風連打中でなくなること', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game.zimo();
            game.dapai('m1');
            assert.ok(! game._fengpai);
        });
        test('異なる風牌の打牌で四風連打中でなくなること', ()=>{
            const game = init_game({shoupai:['_','_','','']});
            game.zimo();
            game.dapai('z1');
            game.zimo();
            game.dapai('z2');
            assert.ok(! game._fengpai);
        });
        test('第一ツモ巡終了で四風連打中でなくなること', ()=>{
            const game = init_game({shoupai:['_','_','','']});
            game.zimo();
            game.dapai('z1');
            game.zimo();
            game._diyizimo = false;
            game.dapai('z1');
            assert.ok(! game._fengpai);
        });
        test('ダブルリーチ', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game.zimo();
            game.dapai('m1*');
            assert.equal(game._lizhi[game.model.lunban], 2);
            assert.ok(game._yifa[game.model.lunban]);
        });
        test('リーチ', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game._diyizimo = false;
            game.zimo();
            game.dapai('m1_*');
            assert.equal(game._lizhi[game.model.lunban], 1);
            assert.ok(game._yifa[game.model.lunban]);
        });
        test('一発なし', ()=>{
            const game = init_game({rule:Majiang.rule({'一発あり':false}),
                                    shoupai:['_','','','']});
            game._diyizimo = false;
            game.zimo();
            game.dapai('m1*');
            assert.equal(game._lizhi[game.model.lunban], 1);
            assert.ok(! game._yifa[game.model.lunban]);
        });
        test('リーチ後の打牌で一発の権利を失うこと', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game._yifa[0] = true;
            game.zimo();
            game.dapai('m1');
            assert.ok(! game._yifa[game.model.lunban]);
        });
        test('テンパイ時に和了牌が河にある場合、フリテンとなること', ()=>{
            const game = init_game({shoupai:['m123p456s789z11122','','','']});
            game.model.lunban = 0;
            game.dapai('m1');
            assert.ok(! game._neng_rong[game.model.lunban]);
        });
        test('打牌によりフリテンが解除されること', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game._neng_rong[0] = false;
            game.zimo();
            game.dapai('m1');
            assert.ok(game._neng_rong[game.model.lunban]);
        });
        test('リーチ後はフリテンが解除されないこと', ()=>{
            const game = init_game({shoupai:['_____________*','','','']});
            game._neng_rong[0] = false;
            game.zimo();
            let dapai = game.model.shoupai[0]._zimo;
            game.dapai(dapai);
            assert.ok(! game._neng_rong[game.model.lunban]);
        });
        test('加槓後の打牌で開槓されること', ()=>{
            const game = init_game({shoupai:['__________,s333=','','','']});
            game.zimo();
            game.gang('s333=3');
            game.gangzimo();
            game.dapai('p1');
            assert.equal(game.model.shan.baopai.length, 2);
        });
    });

    suite('fulou(fulou)', ()=>{

        const game = init_game({shoupai:['_','_','','']});

        test('河から副露牌が拾われること', ()=>{
            game.zimo();
            game.dapai('m2_');
            game.fulou('m12-3');
            assert.equal(game.model.he[0]._pai[0], 'm2_-');
        });
        test('手番が更新されること(上家からのチー)', ()=>
            assert.equal(game.model.lunban, 1));
        test('手牌が副露されること', ()=>
            assert.equal(game.model.shoupai[1]._fulou[0], 'm12-3'));
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).fulou));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].fulou.l, game.model.lunban);
                assert.equal(MSG[id].fulou.m, 'm12-3');
            }
        });

        test('大明槓が副露されること', ()=>{
            const game = init_game({shoupai:['_','','','_']});
            game.zimo();
            game.dapai('m2');
            game.fulou('m2222+');
            assert.equal(game.model.shoupai[3]._fulou[0], 'm2222+');
        });
        test('第一ツモ巡でなくなること', ()=>{
            const game = init_game({shoupai:['_','_','','_']});
            game.zimo();
            game.dapai('m3');
            game.fulou('m123-');
            assert.ok(! game._diyizimo)
        });
        test('一発がなくなること', ()=>{
            const game = init_game({shoupai:['_','_','','_']});
            game.zimo();
            game.dapai('m3*');
            game.fulou('m123-');
            assert.ok(! game._yifa.find(x=>x));
        });
    });

    suite('gang(gang)', ()=>{

        const game = init_game({shoupai:['__________,s555+','','','']});

        test('加槓が副露されること', ()=>{
            game.zimo();
            game.gang('s555+0');
            assert.equal(game.model.shoupai[0]._fulou[0], 's555+0');
        });
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).gang));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].gang.l, game.model.lunban);
                assert.equal(MSG[id].gang.m, 's555+0');
            }
        });

        test('暗槓が副露されること', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game.zimo();
            game.gang('s5550');
            assert.equal(game.model.shoupai[0]._fulou[0], 's5550');
        });
        test('後乗せの槓が開槓されること', ()=>{
            const game = init_game({shoupai:['_______,s222+,z111=','','','']});
            game.zimo();
            game.gang('z111=1');
            game.gangzimo();
            game.gang('s222+2');
            assert.equal(game.model.shan.baopai.length, 2);
        });
    });

    suite('gangzimo()', ()=>{

        const game = init_game({shoupai:['_','','','']});

        test('牌山からツモられること', ()=>{
            game.zimo();
            game.gang('m5550');
            game.gangzimo();
            assert.equal(game.model.shan.paishu, 68);
        });
        test('手牌にツモ牌が加えられること', ()=>
            assert.ok(game.model.shoupai[0].get_dapai()));
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game, -1).gangzimo));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param,
                             { update: last_paipu(game, -1) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].gangzimo.l, game.model.lunban);
                if (l == game.model.lunban)
                        assert.ok(MSG[id].gangzimo.p);
                else    assert.ok(! MSG[id].gangzimo.p);
            }
        });

        test('第一ツモ巡でなくなること', ()=>{
            const game = init_game({shoupai:['_','','','_']});
            game.zimo();
            game.gang('m3333');
            game.gangzimo();
            assert.ok(! game._diyizimo)
        });
        test('一発がなくなること', ()=>{
            const game = init_game({shoupai:['_','_','','_']});
            game.zimo();
            game.dapai('m3*');
            game.zimo();
            game.gang('m4444');
            game.gangzimo();
            assert.ok(! game._yifa.find(x=>x));
        });
        test('加槓の場合、即座には開槓されないこと', ()=>{
            const game = init_game({shoupai:['__________,s333=','','','']});
            game.zimo();
            game.gang('s333=3');
            game.gangzimo();
            assert.equal(game.model.shan.baopai.length, 1);
        });
        test('カンドラ後乗せではない場合、加槓も即座に開槓されること', ()=>{
            const game = init_game({rule:Majiang.rule({'カンドラ後乗せ':false}),
                                    shoupai:['__________,s333=','','','']});
            game.zimo();
            game.gang('s333=3');
            game.gangzimo();
            assert.equal(game.model.shan.baopai.length, 2);
        });
        test('大明槓の場合、即座には開槓されないこと', ()=>{
            const game = init_game({shoupai:['_','','_','']});
            game.zimo();
            game.dapai('s3');
            game.fulou('s3333=');
            game.gangzimo();
            assert.equal(game.model.shan.baopai.length, 1);
        });
        test('カンドラ後乗せではない場合、大明槓も即座に開槓されること', ()=>{
            const game = init_game({rule:Majiang.rule({'カンドラ後乗せ':false}),
                                    shoupai:['_','','_','']});
            game.zimo();
            game.dapai('s3');
            game.fulou('s3333=');
            game.gangzimo();
            assert.equal(game.model.shan.baopai.length, 2);
        });
    });

    suite('kakigang()', ()=>{

        const game = init_game({shoupai:['__________,s555+','','','']});

        test('槓ドラが増えること', ()=>{
            game.zimo();
            game.gang('s555+0');
            game.gangzimo();
            game.kaigang();
            assert.equal(game.model.shan.baopai.length, 2);
            assert.ok(! game._gang);
        });
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).kaigang));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].kaigang.baopai,
                             game.model.shan.baopai.pop());
            }
        });

        test('カンドラなしの場合、開槓しないこと', ()=>{
            const rule = Majiang.rule({'カンドラあり':false});
            const game = init_game({rule:rule,shoupai:['_','','','','']});
            game.zimo();
            game.gang('m1111');
            game.gangzimo();
            assert.equal(game.model.shan.baopai.length, 1);
            assert.ok(! game._gang);
        });
    });

    suite('hule()', ()=>{

        const game = init_game({shoupai:['_','','m123p456s789z1122','']});

        test('牌譜が記録されること', ()=>{
            game.zimo();
            game.dapai('z1');
            game._hule = [2];
            game.hule();
            assert.ok(last_paipu(game).hule);
        });
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].hule.l, 2);
            }
        });

        test('通知のタイミングを変更できること', (done)=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z2']});
            game.wait = 20;
            game.zimo();
            MSG = [];
            game._sync = false;
            game.stop(done);
            game.hule();
            assert.equal(MSG.length, 0);
            setTimeout(()=>assert.equal(MSG.length, 4), 20);
        });

        test('立直・一発', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','_','','']});
            game._diyizimo = false;
            game.zimo();
            game.dapai(game.model.shoupai[0]._zimo + '_*');
            game.zimo();
            game.dapai('z1');
            game._hule = [0];
            game.hule();
            assert.ok(last_paipu(game).hule.hupai.find(h=>h.name == '立直'));
            assert.ok(last_paipu(game).hule.hupai.find(h=>h.name == '一発'));
        });
        test('ダブル立直', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','_','','']});
            game.zimo();
            game.dapai(game.model.shoupai[0]._zimo + '_*');
            game.zimo();
            game.dapai('z1');
            game._hule = [0];
            game.hule();
            assert.ok(last_paipu(game).hule.hupai
                                    .find(h=>h.name == 'ダブル立直'));
        });
        test('槍槓', ()=>{
            const game = init_game({shoupai:['_________m1,m111=','_',
                                             'm23p456s789z11222','']});
            game.zimo();
            game.gang('m111=1');
            game._hule = [2];
            game.hule();
            assert.ok(last_paipu(game).hule.hupai.find(h=>h.name == '槍槓'));
        });
        test('嶺上開花', ()=>{
            const game = init_game({shoupai:['m123p456s78z11,m111=','','',''],
                                    zimo:['m4'],gangzimo:['s9']});
            game.zimo();
            game.gang('m111=1');
            game.gangzimo();
            game.hule();
            assert.ok(last_paipu(game).hule.hupai
                                    .find(h=>h.name == '嶺上開花'));
        });
        test('最終牌で嶺上開花', ()=>{
            const game = init_game({shoupai:['m123p456s78z11,m111=','','',''],
                                    zimo:['m4'],gangzimo:['s9']});
            game._diyizimo = false;
            game.zimo();
            game.gang('m111=1');
            while (game.model.shan.paishu > 1) game.model.shan.zimo();
            game.gangzimo();
            game.hule();
            assert.ok(! last_paipu(game).hule.hupai
                                    .find(h=>h.name == '海底摸月'));
        });
        test('海底摸月', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z2']});
            game._diyizimo = false;
            game.zimo();
            while (game.model.shan.paishu > 0) game.model.shan.zimo();
            game.hule();
            assert.ok(last_paipu(game).hule.hupai
                                    .find(h=>h.name == '海底摸月'));
        });
        test('河底撈魚', ()=>{
            const game = init_game({shoupai:['_','','m123p456s789z1122','']});
            game._diyizimo = false;
            game.zimo();
            while (game.model.shan.paishu > 0) game.model.shan.zimo();
            game.dapai('z2');
            game._hule = [2];
            game.hule();
            assert.ok(last_paipu(game).hule.hupai
                                    .find(h=>h.name == '河底撈魚'));
        });
        test('天和', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z2']});
            game.zimo();
            game.hule();
            assert.ok(last_paipu(game).hule.hupai.find(h=>h.name == '天和'));
        });
        test('地和', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z1122','',''],
                                    zimo:['m1','z2']});
            game.zimo();
            game.dapai('m1_');
            game.zimo();
            game.hule();
            assert.ok(last_paipu(game).hule.hupai.find(h=>h.name == '地和'));
        });
        test('槍槓でダブロン', ()=>{
            const game = init_game({shoupai:['__________,m111=',
                                             'm23p456s789z11122',
                                             'm23p789s456z33344','']});
            game.zimo();
            game.gang('m111=1');
            game._hule = [ 1, 2 ];
            game.hule();
            game.hule();
            assert.ok(last_paipu(game).hule.hupai.find(h=>h.name == '槍槓'));
        });
        test('子の和了は輪荘', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z1122','','']});
            game.zimo();
            game.dapai('z1');
            game._hule = [ 1 ];
            game.hule();
            assert.ok(! game._lianzhuang);
        });
        test('親の和了は連荘', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z1']});
            game.zimo();
            game.hule();
            assert.ok(game._lianzhuang);
        });
        test('ダブロンは親の和了があれば連荘', ()=>{
            const game = init_game({shoupai:['m23p456s789z11122','_',
                                             'm23p789s546z33344',''],
                                    zimo:['m2','m1']});
            game.zimo();
            game.dapai('m2');
            game.zimo();
            game.dapai('m1');
            game._hule = [ 2, 0 ];
            game.hule();
            game.hule();
            assert.ok(game._lianzhuang);
        });
        test('連荘なしの場合は親の和了があっても輪荘', ()=>{
            const game = init_game({rule:Majiang.rule({'連荘方式':0}),
                                    shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z1']});
            game.zimo();
            game.hule();
            assert.ok(! game._lianzhuang);
        });
        test('一局戦の場合は親の和了でも輪荘', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':0}),
                                    shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z1']});
            game.zimo();
            game.hule();
            assert.ok(! game._lianzhuang);
        });
    });

    suite('pingju(name, shoupai)', ()=>{

        const game = init_game();

        test('途中流局', ()=>{
            game.pingju('九種九牌')
            assert.ok(game._no_game);
            assert.ok(game._lianzhuang);
        });
        test('牌譜が記録されること', ()=> assert.ok(last_paipu(game).pingju));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: last_paipu(game) }));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].pingju.name, '九種九牌');
            }
        });

        test('通知のタイミングを変更できること', (done)=>{
            const game = init_game();
            game.wait = 20;
            game.zimo();
            MSG = [];
            game._sync = false;
            game.stop(done);
            game.pingju('九種九牌')
            assert.equal(MSG.length, 0);
            setTimeout(()=>assert.equal(MSG.length, 4), 20);
        });

        test('全員テンパイ', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m22p12366s406789',
                                             'm55p40s123,z111-,p678-',
                                             'm67p678s22,s56-7,p444-',
                                             'm12345p33s333,m406-']});
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.equal(last_paipu(game).pingju.shoupai
                                            .filter(s=>s).length, 4)
            assert.deepEqual(game._fenpei, [0,0,0,0]);
        });
        test('全員ノーテン', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m40789p4667s8z577',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.equal(last_paipu(game).pingju.shoupai
                                            .filter(s=>s).length, 0)
            assert.deepEqual(game._fenpei, [0,0,0,0]);
        });
        test('2人テンパイ', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m22p12366s406789',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm12345p33s333,m406-']});
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.equal(last_paipu(game).pingju.shoupai
                                            .filter(s=>s).length, 2)
            assert.deepEqual(game._fenpei, [1500,-1500,-1500,1500]);
        });
        test('形式テンパイとならない牌姿', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m123p456s789z1111',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm12345p33s333,m406-']});
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.equal(last_paipu(game).pingju.shoupai
                                            .filter(s=>s).length, 1)
            assert.deepEqual(game._fenpei, [-1000,-1000,-1000,3000]);
        });
        test('ノーテン宣言ありの場合、宣言なしをノーテンとみなすこと', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン宣言あり':true}),
                                    shoupai:['m22p12366s406789',
                                             'm55p40s123,z111-,p678-',
                                             'm67p678s22,s56-7,p444-',
                                             'm12345p33s333,m406-']});
            game.pingju('',['','_','_','_']);
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.equal(last_paipu(game).pingju.shoupai
                                            .filter(s=>s).length, 3)
            assert.deepEqual(game._fenpei, [-3000,1000,1000,1000]);
        });
        test('ノーテン宣言であってもリーチ者の手牌は公開すること', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン宣言あり':true}),
                                    shoupai:['m22p12366s406789*','','','']});
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.ok(last_paipu(game).pingju.shoupai[0]);
        });
        test('ノーテン罰なし', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン罰あり':false}),
                                    shoupai:['m22p12366s406789',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm12345p33s333,m406-']});
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.equal(last_paipu(game).pingju.shoupai
                                            .filter(s=>s).length, 1)
            assert.deepEqual(game._fenpei, [0,0,0,0]);
        });
        test('テンパイ連荘', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m22p12366s406789',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.ok(game._lianzhuang);
        });
        test('ノーテン親流れ', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m40789p4667s8z577',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.ok(! game._lianzhuang);
        });
        test('和了連荘の場合、親のテンパイでも輪荘すること', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       '連荘方式':1}),
                                    shoupai:['m22p12366s406789',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.ok(! game._lianzhuang);
        });
        test('ノーテン連荘の場合、親がノーテンでも連荘すること', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       '連荘方式':3}),
                                    shoupai:['m40789p4667s8z577',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.ok(game._lianzhuang);
        });
        test('一局戦の場合、親がノーテンでも連荘すること', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       '場数':0}),
                                    shoupai:['m40789p4667s8z577',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.ok(game._lianzhuang);
        });
        test('流し満貫', ()=>{
            const game = init_game({shoupai:['_','_','_','_']});
            game.zimo(); game.dapai('z1');
            game.zimo(); game.dapai('m2');
            game.zimo(); game.dapai('p2');
            game.zimo(); game.dapai('s2');
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '流し満貫');
            assert.deepEqual(game._fenpei, [12000,-4000,-4000,-4000]);
        });
        test('鳴かれた場合、流し満貫は成立しない', ()=>{
            const game = init_game({shoupai:['_','_','_','_']});
            game.zimo(); game.dapai('z1');
            game.fulou('z111-'); game.dapai('m2');
            game.zimo(); game.dapai('p2');
            game.zimo(); game.dapai('s2');
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
        });
        test('2人が流し満貫', ()=>{
            const game = init_game({shoupai:['_','_','_','_']});
            game.zimo(); game.dapai('z1');
            game.zimo(); game.dapai('m1');
            game.zimo(); game.dapai('p2');
            game.zimo(); game.dapai('s2');
            game.pingju();
            assert.equal(last_paipu(game).pingju.name, '流し満貫');
            assert.deepEqual(game._fenpei, [8000,4000,-6000,-6000]);
        });
        test('ノーテン罰なしのルールの場合、'
            + 'リーチ者と親以外は手牌を開かないこと',()=>
        {
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン罰あり':false}),
                                    shoupai:['m567999s4466777',
                                             'm05p123s56z333*,s8888',
                                             'm11p789s06,z555-,p406-',
                                             '']});
            game.pingju();
            assert.deepEqual(last_paipu(game).pingju.shoupai,
                             [ 'm567999s4466777', 'm05p123s56z333*,s8888',
                               '', ''])
        });
        test('ノーテン罰なしで和了連荘のルールの場合、'
            + 'リーチ者以外は手牌を開かないこと', ()=>
        {
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン罰あり':false,
                                                       '連荘方式':1}),
                                    shoupai:['m567999s4466777',
                                             'm05p123s56z333*,s8888',
                                             'm11p789s06,z555-,p406-',
                                             '']});
            game.pingju();
            assert.deepEqual(last_paipu(game).pingju.shoupai,
                             [ '', 'm05p123s56z333*,s8888', '', ''])
        });
    });

    suite('last()', ()=>{
        test('連荘時に局が進まないこと', ()=>{
            const game = init_game();
            game._lianzhuang = true;
            game.last();
            assert.equal(game.model.zhuangfeng, 0);
            assert.equal(game.model.jushu, 0);
        });
        test('輪荘時に局が進むこと', ()=>{
            const game = init_game();
            game.model.zhuangfeng = 0;
            game.model.jushu = 3;
            game.last();
            assert.equal(game.model.zhuangfeng, 1);
            assert.equal(game.model.jushu, 0);
        });
        test('東風戦は東四局で終局すること', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':1}),
                                    defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 0;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('東南戦は南四局で終局すること', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':2}),
                                    defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('一荘戦は北四局で終局すること', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':4}),
                                    defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 3;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('連荘中でもトビ終了すること', ()=>{
            const game = init_game({defen:[50100,30000,20000,-100]});
            game._lianzhuang = true;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('トビ終了なし', ()=>{
            const game = init_game({rule:Majiang.rule({'トビ終了あり':false}),
                                    defen:[50100,30000,20000,-100]});
            game.last();
            assert.equal(game._status, 'qipai');
        });
        test('オーラス止め(東風戦)', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':1}),
                                    defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 0;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('オーラス止め(東南戦)', ()=>{
            const game = init_game({defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('途中流局ではオーラス止めしないこと', ()=>{
            const game = init_game({defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game._no_game = true;
            game.last();
            assert.equal(game._status, 'qipai');
        });
        test('オーラス止めなし', ()=>{
            const game = init_game({rule:Majiang.rule({'オーラス止めあり':false}),
                                    defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game.last();
            assert.equal(game._status, 'qipai');
        });
        test('一荘戦では延長戦がないこと', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':4})});
            game.model.zhuangfeng = 3;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('延長戦なし', ()=>{
            const game = init_game({rule:Majiang.rule({'延長戦方式':0})});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('延長戦突入', ()=>{
            const game = init_game();
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'qipai');
        });
        test('延長戦サドンデス', ()=>{
            const game = init_game({defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 2;
            game.model.jushu = 0;
            game.last();
            assert.equal(game._max_jushu, 7);
            assert.equal(game._status, 'jieju');
        });
        test('連荘優先サドンデス', ()=>{
            const game = init_game({rule:Majiang.rule({'延長戦方式':2})});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._max_jushu, 8);
            assert.equal(game._status, 'qipai');
        });
        test('4局固定延長戦オーラス止め', ()=>{
            const game = init_game({rule:Majiang.rule({'延長戦方式':3})});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._max_jushu, 11);
            assert.equal(game._status, 'qipai');
        });
        test('延長戦は最大四局で終了すること', ()=>{
            const game = init_game();
            game.model.zhuangfeng = 2;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._status, 'jieju');
        });
        test('一局戦には延長戦はない', ()=>{
            const game = init_game({rule:Majiang.rule({'場数':0})});
            game.model.zhuangfeng = 0;
            game.model.jushu = 0;
            game.last();
            assert.equal(game._status, 'jieju');
        });
    });

    suite('jieju()', ()=>{

        const game = init_game({qijia:1,defen:[20400,28500,20500,30600]});

        test('牌譜が記録されること', ()=>{
            game.jieju();
            assert.deepEqual(game._paipu.defen, [30600,20400,28500,20500]);
            assert.deepEqual(game._paipu.rank, [1,4,2,3]);
            assert.deepEqual(game._paipu.point, ['40.6','-29.6','8.5','-19.5']);
        });
        test('表示処理が呼び出されること', ()=>
            assert.ok(game._view._param.summary));
        test('通知が伝わること', ()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.ok(MSG[id].jieju);
            }
        });

        test('通知のタイミングを変更できること', (done)=>{
            const game = init_game();
            game.wait = 20;
            MSG = [];
            game._sync = false;
            game.stop(done);
            game.jieju();
            assert.equal(MSG.length, 0);
            setTimeout(()=>assert.equal(MSG.length, 4), 20);
        });

        test('同点の場合は起家に近い方を上位とする', ()=>{
            const game = init_game({qijia:2});
            game.jieju();
            assert.deepEqual(game._paipu.rank, [3,4,1,2]);
            assert.deepEqual(game._paipu.point, ['-15.0','-25.0','35.0','5.0']);
        });
        test('終局時に残った供託リーチ棒はトップの得点に加算', ()=>{
            const game = init_game({qijia:3,defen:[9000,19000,29000,40000],
                                    lizhibang:3});
            game.jieju();
            assert.deepEqual(game._paipu.defen, [19000,29000,43000,9000]);
        });
        test('1000点未満のポイントは四捨五入する', ()=>{
            const game = init_game({qijia:0,defen:[20400,28500,20500,30600],
                                    rule:Majiang.rule({'順位点':
                                                ['20','10','-10','-20']})});
            game.jieju();
            assert.deepEqual(game._paipu.point, ['-30','9','-19','40']);
        });
        test('1000点未満のポイントは四捨五入する(負のケース)', ()=>{
            const game = init_game({qijia:0,defen:[-1500,83800,6000,11700],
                                    rule:Majiang.rule({'順位点':
                                                ['20','10','-10','-20']})});
            game.jieju();
            assert.deepEqual(game._paipu.point, ['-51','93','-34','-8']);
        });
        test('順位点を変更できること', ()=>{
            const game = init_game({rule:Majiang.rule({'順位点':
                                                ['30','10','-10','-30']}),
                                    qijia:2});
            game.jieju();
            assert.deepEqual(game._paipu.rank, [3,4,1,2]);
            assert.deepEqual(game._paipu.point, ['-15','-35','45','5']);
        });

        test('ハンドラがある場合、それを呼び出すこと', (done)=>{
            const game = init_game();
            game.handler = done;
            game.jieju();
        });
    });

    suite('reply_kaiju()', ()=>{
        test('配牌に遷移すること', ()=>{
            const players = [0,1,2,3].map(id => new Player(id));
            const rule = Majiang.rule();
            const game = new Majiang.Game(players, rule);
            game.view = new View();
            game._sync = true;
            game.kaiju();
            game.next();
            assert.ok(last_paipu(game).qipai);
        });
    });

    suite('reply_qipai()', ()=>{
        test('ツモに遷移すること', ()=>{
            const game = init_game();
            game.qipai();
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
    });

    suite('reply_zimo()', ()=>{
        test('打牌', ()=>{
            const game = init_game({zimo:['m1']});
            set_reply(game, [{dapai:'m1_'},{},{},{}]);
            game.zimo();
            game.next();
            assert.equal(last_paipu(game).dapai.p, 'm1_');
        });
        test('リーチ', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['m1']});
            set_reply(game, [{dapai:'m1_*'},{},{},{}]);
            game.zimo();
            game.next();
            assert.equal(last_paipu(game).dapai.p, 'm1_*');
        });
        test('打牌(不正応答)', ()=>{
            const game = init_game({zimo:['m1']});
            set_reply(game, [{dapai:'m2_'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
        test('九種九牌', ()=>{
            const game = init_game({shoupai:['m123459z1234567','','','']});
            set_reply(game, [{daopai:'-'},{},{},{}]);
            game.zimo();
            game.next();
            assert.equal(last_paipu(game).pingju.name, '九種九牌');
        });
        test('九種九牌(不正応答)', ()=>{
            const game = init_game({shoupai:['m234567z1234567','','','']});
            set_reply(game, [{daopai:'-'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
        test('途中流局なしの場合は九種九牌にできないこと', ()=>{
            const game = init_game({rule:Majiang.rule({'途中流局あり':false}),
                                    shoupai:['m123459z1234567','','','']});
            set_reply(game, [{daopai:'-'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
        test('ツモ和了', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z1']});
            set_reply(game, [{hule:'-'},{},{},{}]);
            game.zimo();
            game.next();
            assert.deepEqual(game._view._say, ['zimo', 0]);
            assert.ok(last_paipu(game).hule);
        });
        test('ツモ和了(不正応答)', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z3']});
            set_reply(game, [{hule:'-'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
        test('カン', ()=>{
            const game = init_game({shoupai:['m123p456z1122,s888+','','',''],
                                    zimo:['s8']});
            set_reply(game, [{gang:'s888+8'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).gang.m, 's888+8');
        });
        test('カン(不正応答)', ()=>{
            const game = init_game({shoupai:['m123p456z1122,s888+','','',''],
                                    zimo:['s7']});
            set_reply(game, [{gang:'s888+8'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
        test('5つめのカンができないこと', ()=>{
            const game = init_game({shoupai:['m123p456z1122,s888+','','',''],
                                    zimo:['s8']});
            game._n_gang = [0,0,0,4];
            set_reply(game, [{gang:'s888+8'},{},{},{}]);
            game.zimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
        test('無応答のときにツモ切りすること', ()=>{
            const game = init_game({zimo:['m1']});
            game.zimo();
            game.next();
            assert.equal(last_paipu(game).dapai.p, 'm1_');
        });
        test('槓ツモ', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game.zimo();
            game.gang('m1111');
            game.gangzimo();
            game.next();
            assert.ok(last_paipu(game).dapai);
        });
    });

    suite('reply_dapai()', ()=>{
        test('応答なし', ()=>{
            const game = init_game({shoupai:['_','','','']});
            game.zimo();
            game.dapai('m1');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('ロン和了', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z1122','','']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{},{}]);
            game.dapai('z1');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 1]);
            assert.equal(last_paipu(game).hule.l, 1);
        });
        test('和了見逃しでフリテンになること', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z1122','','']});
            game.zimo();
            game.dapai('z1');
            game.next();
            assert.ok(! game._neng_rong[1]);
        });
        test('ダブロン', ()=>{
            const game = init_game({shoupai:['_','m23446p45688s345',
                                             'm34s33,s444-,s666+,p406-','']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{hule:'-'},{}]);
            game.dapai('m5*');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 2])
            assert.equal(last_paipu(game).hule.l, 1);
            assert.deepEqual(game._hule, [2]);
        });
        test('ダブロンを頭ハネに変更できること', ()=>{
            const game = init_game({rule:Majiang.rule({'最大同時和了数':1}),
                                    shoupai:['_','m23446p45688s345',
                                             'm34s33,s444-,s666+,p406-','']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{hule:'-'},{}]);
            game.dapai('m5*');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 1])
            assert.equal(last_paipu(game).hule.l, 1);
            assert.deepEqual(game._hule, []);
        });
        test('三家和', ()=>{
            const game = init_game({shoupai:['_','m23446p45688s345',
                                             'm34s33,s444-,s666+,p406-',
                                             'm23467s88,s222+,z666=']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{hule:'-'},{hule:'-'}]);
            game.dapai('m5*');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 3])
            assert.equal(last_paipu(game).pingju.name, '三家和');
            assert.deepEqual(last_paipu(game).pingju.shoupai,
                             ['','m23446p45688s345',
                              'm34s33,s444-,s666+,p406-',
                              'm23467s88,s222+,z666=']);
        });
        test('トリロン可に変更できること', ()=>{
            const game = init_game({rule:Majiang.rule({'最大同時和了数':3}),
                                    shoupai:['_','m23446p45688s345',
                                             'm34s33,s444-,s666+,p406-',
                                             'm23467s88,s222+,z666=']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{hule:'-'},{hule:'-'}]);
            game.dapai('m5*');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 3])
            assert.equal(last_paipu(game).hule.l, 1);
            assert.deepEqual(game._hule, [2, 3]);
        });
        test('リーチ成立', ()=>{
            const game = init_game({shoupai:['m55688p234567s06','','',''],
                                    qijia:0,zimo:['s7']});
            game.zimo();
            game.dapai('m5*');
            game.next();
            assert.equal(game.model.defen[0], 24000);
            assert.equal(game.model.lizhibang, 1);
            assert.ok(last_paipu(game).zimo);
        });
        test('リーチ不成立', ()=>{
            const game = init_game({shoupai:['m55688p234567s06',
                                             'm23446p45688s345','',''],
                                    qijia:0,zimo:['s7']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{},{}]);
            game.dapai('m5*');
            game.next();
            assert.equal(game.model.defen[0], 25000);
            assert.equal(game.model.lizhibang, 0);
            assert.ok(last_paipu(game).hule);
        });
        test('四家立直', ()=>{
            const game = init_game({shoupai:['m11156p5688s2346',
                                             'm2227p11340s2356',
                                             'm2346789p345699',
                                             'm34056p4678s3456'],
                                    qijia:0,zimo:['p4','s1','m7','s6']});
            for (let p of ['s6*','m7*','p6*','p4*']) {
                game.zimo();
                game.dapai(p);
            }
            game.next();
            assert.equal(last_paipu(game).pingju.name, '四家立直');
            assert.deepEqual(last_paipu(game).pingju.shoupai,
                             ['m11156p45688s234*',
                              'm222p11340s12356*',
                              'm23467789p34599*',
                              'm34056p678s34566*']);
        });
        test('途中流局なしの場合は四家立直でも続行すること', ()=>{
            const game = init_game({rule:Majiang.rule({'途中流局あり':false}),
                                    shoupai:['m11156p5688s2346',
                                             'm2227p11340s2356',
                                             'm2346789p345699',
                                             'm34056p4678s3456'],
                                    qijia:0,zimo:['p4','s1','m7','s6']});
            for (let p of ['s6*','m7*','p6*','p4*']) {
                game.zimo();
                game.dapai(p);
            }
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('四風連打', ()=>{
            const game = init_game({shoupai:['_','_','_','_']});
            for (let l = 0; l < 4; l++) {
                game.zimo();
                game.dapai('z1');
            }
            game.next();
            assert.equal(last_paipu(game).pingju.name, '四風連打');
            assert.deepEqual(last_paipu(game).pingju.shoupai, ['','','','']);
        });
        test('途中流局なしの場合は四風連打とならず、第一ツモ巡が終了すること', ()=>{
            const game = init_game({rule:Majiang.rule({'途中流局あり':false}),
                                    shoupai:['_','_','_','_']});
            for (let l = 0; l < 4; l++) {
                game.zimo();
                game.dapai('z1');
            }
            game.next();
            assert.ok(! game._diyizimo);
            assert.ok(last_paipu(game).zimo);
        });
        test('四開槓', ()=>{
            const game = init_game({shoupai:['_','m111p22279s57,s333=',
                                             'm123p456s222789z2',''],
                                    zimo:['m1'],
                                    gangzimo:['p2','s3','s2','z7']});
            game.zimo();
            game.dapai('m1_');
            game.fulou('m1111-');
            game.gangzimo();
            game.gang('p2222');
            game.gangzimo();
            game.gang('s333=3');
            game.gangzimo();
            game.dapai('s2');
            game.fulou('s2222-');
            game.gangzimo();
            game.dapai('z7_');
            game.next();
            assert.equal(last_paipu(game).pingju.name, '四開槓');
            assert.deepEqual(last_paipu(game).pingju.shoupai, ['','','','']);
        });
        test('1人で四開槓', ()=>{
            const game = init_game({shoupai:['m1112,p111+,s111=,z111-',
                                             '','',''],
                                    zimo:['m1'],
                                    gangzimo:['p1','s1','z1','z7']});
            game.zimo();
            game.gang('m1111');
            game.gangzimo();
            game.gang('p111+1');
            game.gangzimo();
            game.gang('s111=1');
            game.gangzimo();
            game.gang('z111-1');
            game.gangzimo();
            game.dapai('z7');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('途中流局なしでは四開槓とならない', ()=>{
            const game = init_game({rule:Majiang.rule({'途中流局あり':false}),
                                    shoupai:['_','m111p22279s57,s333=',
                                             'm123p456s222789z2',''],
                                    zimo:['m1'],
                                    gangzimo:['p2','s3','s2','z7']});
            game.zimo();
            game.dapai('m1_');
            game.fulou('m1111-');
            game.gangzimo();
            game.gang('p2222');
            game.gangzimo();
            game.gang('s333=3');
            game.gangzimo();
            game.dapai('s2');
            game.fulou('s2222-');
            game.gangzimo();
            game.dapai('z7_');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('流局', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン宣言あり':true}),
                                    shoupai:['_','m222p11340s12356',
                                             'm23467789p34599','_']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            set_reply(game, [{},{daopai:'-'},{daopai:'-'},{}]);
            game.dapai(game.model.shoupai[0].get_dapai()[0]);
            game.next();
            assert.equal(last_paipu(game).pingju.name, '荒牌平局');
            assert.deepEqual(last_paipu(game).pingju.shoupai,
                             ['','m222p11340s12356',
                              'm23467789p34599','']);
        });
        test('カン', ()=>{
            const game = init_game({shoupai:['_','','','m111234p567s3378']});
            game.zimo();
            set_reply(game, [{},{},{},{fulou:'m1111+'}]);
            game.dapai('m1');
            game.next();
            assert.deepEqual(game._view._say, ['gang', 3]);
            assert.equal(last_paipu(game).fulou.m, 'm1111+');
        });
        test('カン(不正応答)', ()=>{
            const game = init_game({shoupai:['_','','','m111234p567s3378']});
            game.zimo();
            set_reply(game, [{},{},{},{fulou:'m1111+'}]);
            game.dapai('m2');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('5つめのカンができないこと', ()=>{
            const game = init_game({shoupai:['_','','','m111234p567s3378']});
            game._n_gang = [4,0,0,0];
            game.zimo();
            set_reply(game, [{},{},{},{fulou:'m1111+'}]);
            game.dapai('m1');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('ポン', ()=>{
            const game = init_game({shoupai:['_','','m112345p567s3378','']});
            game.zimo();
            set_reply(game, [{},{},{fulou:'m111='},{}]);
            game.dapai('m1');
            game.next();
            assert.deepEqual(game._view._say, ['peng', 2]);
            assert.equal(last_paipu(game).fulou.m, 'm111=');
        });
        test('ポン(不正応答)', ()=>{
            const game = init_game({shoupai:['_','','m112345p567s3378','']});
            game.zimo();
            set_reply(game, [{},{},{fulou:'m111='},{}]);
            game.dapai('m2');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('チー', ()=>{
            const game = init_game({shoupai:['_','m112345p567s3378','','']});
            game.zimo();
            set_reply(game, [{},{fulou:'m456-'},{},{}]);
            game.dapai('m6');
            game.next();
            assert.deepEqual(game._view._say, ['chi', 1]);
            assert.equal(last_paipu(game).fulou.m, 'm456-');
        });
        test('チー(不正応答)', ()=>{
            const game = init_game({shoupai:['_','m112345p567s3378','','']});
            game.zimo();
            set_reply(game, [{},{fulou:'m456-'},{},{}]);
            game.dapai('m5');
            game.next();
            assert.ok(last_paipu(game).zimo);
        });
        test('ポンとチーの競合はポンを優先', ()=>{
            const game = init_game({shoupai:['_','m23567p456s889z11',
                                             'm11789p123s11289','']});
            game.zimo();
            set_reply(game, [{},{fulou:'m1-23'},{fulou:'m111='},{}]);
            game.dapai('m1');
            game.next();
            assert.deepEqual(game._view._say, ['peng', 2]);
            assert.equal(last_paipu(game).fulou.m, 'm111=');
        })
    });

    suite('reply_fulou()', ()=>{
        test('大明槓', ()=>{
            const game = init_game({shoupai:['_','m1112356p456s889','','']});
            game.zimo();
            game.dapai('m1');
            game.fulou('m1111-');
            game.next();
            assert.ok(last_paipu(game).gangzimo);
        });
        test('チー・ポン → 打牌', ()=>{
            const game = init_game({shoupai:['_','m23567p456s889z11','','']});
            game.zimo();
            game.dapai('m1');
            set_reply(game, [{},{dapai:'s9'},{},{}]);
            game.fulou('m1-23');
            game.next();
            assert.equal(last_paipu(game).dapai.p, 's9');
        });
        test('チー・ポン → 打牌(不正応答)', ()=>{
            const game = init_game({shoupai:['_','m23456p456s889z11','','']});
            game.zimo();
            game.dapai('m1');
            set_reply(game, [{},{dapai:'m4'},{},{}]);
            game.fulou('m1-23');
            game.next();
            assert.equal(last_paipu(game).dapai.p, 'z1');
        });
        test('無応答のときに右端の牌を切ること', ()=>{
            const game = init_game({shoupai:['_','m23567p456s889z11','','']});
            game.zimo();
            game.dapai('m1');
            game.fulou('m1-23');
            game.next();
            assert.equal(last_paipu(game).dapai.p, 'z1');
        });
    });

    suite('reply_gang()', ()=>{
        test('応答なし', ()=>{
            const game = init_game({shoupai:['m45p456s11789,m111+','','',''],
                                    zimo:['m1']});
            game.zimo();
            game.gang('m111+1');
            game.next();
            assert.ok(last_paipu(game).gangzimo);
        });
        test('ロン和了(槍槓)', ()=>{
            const game = init_game({shoupai:['m45p456s11789,m111+','',
                                             '','m23456p123s67899'],
                                    zimo:['m1']});
            game.zimo();
            set_reply(game, [{},{},{},{hule:'-'}]);
            game.gang('m111+1');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 3]);
            assert.equal(last_paipu(game).hule.l, 3);
        });
        test('ロン和了(不正応答)', ()=>{
            const game = init_game({shoupai:['m45p456s11789,m111+','',
                                             '','m33456p123s67899'],
                                    zimo:['m1']});
            game.zimo();
            set_reply(game, [{},{},{},{hule:'-'}]);
            game.gang('m111+1');
            game.next();
            assert.ok(last_paipu(game).gangzimo);
        });
        test('暗槓は槍槓できない', ()=>{
            const game = init_game({shoupai:['m11145p456s11789','',
                                             '','m23456p123s67899'],
                                    zimo:['m1']});
            game.zimo();
            set_reply(game, [{},{},{},{hule:'-'}]);
            game.gang('m1111');
            game.next();
            assert.ok(last_paipu(game, -1).gangzimo);
            assert.ok(last_paipu(game).kaigang);
        });
        test('和了見逃しでフリテンになること', ()=>{
            const game = init_game({shoupai:['m45p456s11789,m111+','',
                                             '','m23456p123s67899'],
                                    zimo:['m1']});
            game.zimo();
            game.gang('m111+1');
            game.next();
            assert.ok(! game._neng_rong[3]);
        });
        test('ダブロン', ()=>{
            const game = init_game({shoupai:['m11p222s88,z666=,m505-',
                                             'm23446p45688s345',
                                             'm34s33,s444-,s666+,p406-',''],
                                    zimo:['m5']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{hule:'-'},{}]);
            game.gang('m505-5');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 2]);
            assert.equal(last_paipu(game).hule.l, 1);
            assert.deepEqual(game._hule, [2]);
        });
        test('ダブロンを頭ハネに変更できること', ()=>{
            const game = init_game({rule:Majiang.rule({'最大同時和了数':1}),
                                    shoupai:['m11p222s88,z666=,m505-',
                                             'm23446p45688s345',
                                             'm34s33,s444-,s666+,p406-',''],
                                    zimo:['m5']});
            game.zimo();
            set_reply(game, [{},{hule:'-'},{hule:'-'},{}]);
            game.gang('m505-5');
            game.next();
            assert.deepEqual(game._view._say, ['rong', 1]);
            assert.equal(last_paipu(game).hule.l, 1);
            assert.deepEqual(game._hule, []);
        });
    });

    suite('reply_hule()', ()=>{
        test('親のツモ和了', ()=>{
            const game = init_game({shoupai:['m345567p111s3368','','',''],
                                    qijia:0,changbang:1,lizhibang:1,
                                    defen:[25000,25000,25000,24000],
                                    baopai:'p2',zimo:['s7']});
            game._diyizimo = false;
            game.zimo();
            game._hule = [0];
            game.hule();
            game.next();
            assert.deepEqual(game.model.defen, [28400,24200,24200,23200]);
            assert.equal(game.model.changbang, 2);
            assert.equal(game.model.lizhibang, 0);
            assert.ok(last_paipu(game).qipai)
        });
        test('子のロン和了', ()=>{
            const game = init_game({shoupai:['_','m345567p111s66z11','',''],
                                    qijia:0,changbang:1,lizhibang:1,
                                    defen:[25000,25000,25000,24000],
                                    baopai:'p2',zimo:['s7']});
            game.zimo();
            game.dapai('z1');
            game._hule = [1];
            game.hule();
            game.next();
            assert.deepEqual(game.model.defen, [23100,27900,25000,24000]);
            assert.equal(game.model.changbang, 0);
            assert.equal(game.model.lizhibang, 0);
            assert.ok(last_paipu(game).qipai)
        });
        test('ダブロンで連荘', ()=>{
            const game = init_game({shoupai:['m23p456s789z11122','_',
                                             'm23p789s546z33344',''],
                                    qijia:0,changbang:1,lizhibang:1,
                                    defen:[25000,25000,25000,24000],
                                    baopai:'s9',zimo:['m2','m1']});
            game.zimo();
            game.dapai('m2');
            game.zimo();
            game.dapai('m1');
            game._hule = [ 2, 0 ];
            game.hule();
            game.next();
            assert.deepEqual(game.model.defen, [25000,23400,27600,24000]);
            assert.equal(game.model.changbang, 0);
            assert.equal(game.model.lizhibang, 0);
            assert.ok(last_paipu(game).hule);
            game.next();
            assert.deepEqual(game.model.defen, [28900,19500,27600,24000]);
            assert.equal(game.model.changbang, 2);
            assert.equal(game.model.lizhibang, 0);
            assert.ok(last_paipu(game).qipai);
        })
    });

    suite('reply_pingju()', ()=>{
        test('流局', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','_','_','_'],
                                    qijia:0,changbang:1,lizhibang:1,
                                    defen:[25000,25000,25000,24000],
                                    zimo:['m2','m3','m4','m5']});
            for (let p of ['m2','m3','m4','m5']) {
                game.zimo();
                game.dapai(p);
            }
            game.pingju();
            game.next();
            assert.deepEqual(game.model.defen, [28000,24000,24000,23000]);
            assert.equal(game.model.changbang, 2);
            assert.equal(game.model.lizhibang, 1);
            assert.ok(last_paipu(game).qipai);
        });
    });

    suite('_callback()', ()=>{
        test('終局時にコンストラクタで指定したコールバックが呼ばれること', (done)=>{
            const callback = (paipu)=>{
                assert.deepEqual(paipu, game._paipu);
                done();
            }
            const game = init_game({rule:Majiang.rule({'場数':0}),
                                    shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z2'],callback:callback});
            game.zimo();
            game.hule();
            game.next();
            game.next();
        });
    });

    suite('get_dapai()', ()=>{
        test('現在の手番の可能な打牌を返すこと', ()=>{
            const game = init_game({shoupai:['m123,z111+,z222=,z333-','','',''],
                                    zimo:['m1']});
            game.zimo();
            assert.deepEqual(game.get_dapai(), ['m1','m2','m3','m1_']);
        });
        test('現物喰い替えありに変更できること', ()=>{
            const game = init_game({rule:Majiang.rule({'喰い替え許可レベル':2}),
                                    shoupai:['_','m1234p567,z111=,s789-',
                                             '','']});
            game.zimo();
            game.dapai('m1');
            game.fulou('m1-23');
            assert.deepEqual(game.get_dapai(), ['m1','m4','p5','p6','p7']);
        });
    });

    suite('get_chi_mianzi()', ()=>{
        test('現在打たれた牌でチーできる面子を返すこと', ()=>{
            const game = init_game({shoupai:['','_','m1234p456s789z111','']});
            game.zimo();
            game.dapai(game.get_dapai()[0]);
            game.zimo();
            game.dapai('m2');
            assert.deepEqual(game.get_chi_mianzi(2), ['m12-3','m2-34']);
        });
        test('自身はチーできないこと', ()=>{
            const game = init_game({shoupai:['m1234p456s789z111','','','']});
            game.zimo();
            game.dapai(game.get_dapai().pop());
            assert.throws(()=> game.get_chi_mianzi(0));
        });
        test('対面はチーできないこと', ()=>{
            const game = init_game({shoupai:['_','','m1234p456s789z111','']});
            game.zimo();
            game.dapai('m2');
            assert.deepEqual(game.get_chi_mianzi(2), []);
        });
        test('ハイテイ牌はチーできないこと', ()=>{
            const game = init_game({shoupai:['_','m1234p456s789z111','','']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            game.dapai('m2');
            assert.deepEqual(game.get_chi_mianzi(1), []);
        });
        test('現物喰い替えありに変更できること', ()=>{

            const game = init_game({rule:Majiang.rule({'喰い替え許可レベル':2}),
                                    shoupai:['_','m1123,p456-,z111=,s789-',
                                             '','']});
            game.zimo();
            game.dapai('m1');
            assert.deepEqual(game.get_chi_mianzi(1), ['m1-23']);
        });
    });

    suite('get_peng_mianzi(l)', ()=>{
        test('現在打たれた牌でポンできる面子を返すこと', ()=>{
            const game = init_game({shoupai:['','_','','m1123p456s789z111']});
            game.zimo();
            game.dapai(game.get_dapai()[0]);
            game.zimo();
            game.dapai('m1');
            assert.deepEqual(game.get_peng_mianzi(3), ['m111=']);
        });
        test('自身はポンできないこと', ()=>{
            const game = init_game({shoupai:['m1123p456s789z111','','','']});
            game.zimo();
            game.dapai(game.get_dapai().pop());
            assert.throws(()=> game.get_peng_mianzi(0));
        });
        test('ハイテイ牌はポンできないこと', ()=>{
            const game = init_game({shoupai:['_','','m1123p456s789z111','']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            game.dapai('m1');
            assert.deepEqual(game.get_peng_mianzi(2), []);
        });
    });

    suite('get_gang_mianzi(l)', ()=>{
        test('現在打たれた牌で大明槓できる面子を返すこと', ()=>{
            const game = init_game({shoupai:['','_','','m1112p456s789z111']});
            game.zimo();
            game.dapai(game.get_dapai()[0]);
            game.zimo();
            game.dapai('m1');
            assert.deepEqual(game.get_gang_mianzi(3), ['m1111=']);
        });
        test('自身は大明槓できないこと', ()=>{
            const game = init_game({shoupai:['m1112p456s789z111','','','']});
            game.zimo();
            game.dapai(game.get_dapai().pop());
            assert.throws(()=> game.get_gang_mianzi(0));
        });
        test('ハイテイ牌は大明槓できないこと', ()=>{
            const game = init_game({shoupai:['_','','m1112p456s789z111','']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            game.dapai('m1');
            assert.deepEqual(game.get_gang_mianzi(2), []);
        });
        test('現在の手番が暗槓もしくは加槓できる面子を返すこと', ()=>{
            const game = init_game({shoupai:['m1111p4569s78,z111='],
                                    zimo:['z1']});
            game.zimo();
            assert.deepEqual(game.get_gang_mianzi(), ['m1111','z111=1']);
        });
        test('ハイテイ牌は暗槓もしくは加槓できないこと', ()=>{
            const game = init_game({shoupai:['m1111p4567s78,z111='],
                                    zimo:['z1']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            assert.deepEqual(game.get_gang_mianzi(), []);
        });
        test('リーチ後の暗槓なしに変更できること', ()=>{
            const game = init_game({rule:Majiang.rule(
                                                    {'リーチ後暗槓許可レベル':0}),
                                    shoupai:['m111p456s789z1122*','','',''],
                                    zimo:['m1']});
            game.zimo();
            assert.deepEqual(game.get_gang_mianzi(), []);
        });
    });

    suite('allow_lizhi(p)', ()=>{
        test('指定された打牌でリーチ可能な場合、真を返す', ()=>{
            const game = init_game({shoupai:['m123p456s789z1123','','',''],
                                    zimo:['z2']});
            game.zimo();
            assert.ok(game.allow_lizhi('z3*'));
        });
        test('ツモ番がない場合、リーチできない', ()=>{
            const game = init_game({shoupai:['m123p456s789z1123','','',''],
                                    zimo:['z2']});
            game.zimo();
            while (game.model.shan.paishu >= 4) game.model.shan.zimo();
            assert.ok(! game.allow_lizhi('z3*'));
        });
        test('持ち点が1000点に満たない場合、リーチできない', ()=>{
            const game = init_game({shoupai:['m123p456s789z1123','','',''],
                                    zimo:['z2'],defen:[900,19100,45000,35000]});
            game.zimo();
            assert.ok(! game.allow_lizhi('z3*'));
        });
        test('ツモ番なしでもリーチできるように変更できること', ()=>{
            const game = init_game({rule:Majiang.rule(
                                                {'ツモ番なしリーチあり':true}),
                                    shoupai:['m123p456s789z1123','','',''],
                                    zimo:['z2']});
            game.zimo();
            while (game.model.shan.paishu >= 4) game.model.shan.zimo();
            assert.ok(game.allow_lizhi('z3*'));
        });
        test('持ち点が1000点に満たなくてもリーチできるように変更できること', ()=>{
            const game = init_game({rule:Majiang.rule({'トビ終了あり':false}),
                                    shoupai:['m123p456s789z1123','','',''],
                                    zimo:['z2'],defen:[900,19100,45000,35000]});
            game.zimo();
            assert.ok(game.allow_lizhi('z3*'));
        });
    });

    suite('allow_hule(l)', ()=>{
        test('ツモ和了', ()=>{
            const game = init_game({shoupai:['m123p456s789z3344','','',''],
                                    zimo:['z4']});
            game.zimo();
            assert.ok(game.allow_hule());
        });
        test('リーチ・ツモ', ()=>{
            const game = init_game({shoupai:['m123p456s789z4*,z333=','','',''],
                                    zimo:['z4']});
            game.zimo();
            assert.ok(game.allow_hule());
        });
        test('嶺上開花', ()=>{
            const game = init_game({shoupai:['_','','m123p456s789z3334',''],
                                    gangzimo:['z4']});
            game.zimo();
            game.dapai('z3');
            game.fulou('z3333=');
            game.gangzimo();
            assert.ok(game.allow_hule());
        });
        test('ハイテイ・ツモ', ()=>{
            const game = init_game({shoupai:['m123p456s789z4,z333=','','',''],
                                    zimo:['z4']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            assert.ok(game.allow_hule());
        });
        test('場風のみ・ツモ', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z4,z111=','',''],
                                    zimo:['m1','z4']});
            game.zimo();
            game.dapai('m1');
            game.zimo();
            assert.ok(game.allow_hule());
        });
        test('自風のみ・ツモ', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z4,z222=','',''],
                                    zimo:['m1','z4']});
            game.zimo();
            game.dapai('m1');
            game.zimo();
            assert.ok(game.allow_hule());
        });
        test('リーチ・ロン', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z3334*','','']});
            game.zimo();
            game.dapai('z4');
            assert.ok(game.allow_hule(1));
        });
        test('槍槓', ()=>{
            const game = init_game({shoupai:['m1234p567s789,m111=','',
                                             'm23p123567s12377','']});
            game.zimo();
            game.gang('m111=1');
            assert.ok(game.allow_hule(2));
        });
        test('ハイテイ・ロン', ()=>{
            const game = init_game({shoupai:['_','',
                                             '','m123p456s789z4,z333=']});
            game.zimo();
            while (game.model.shan.paishu) game.model.shan.zimo();
            game.dapai('z4');
            assert.ok(game.allow_hule(3));
        });
        test('場風のみ・ロン', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z4,z111=',
                                             '','']});
            game.zimo();
            game.dapai('z4');
            assert.ok(game.allow_hule(1));
        });
        test('自風のみ・ロン', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z4,z222=',
                                             '','']});
            game.zimo();
            game.dapai('z4');
            assert.ok(game.allow_hule(1));
        });
        test('フリテンはロン和了できないこと', ()=>{
            const game = init_game({shoupai:['m123p456s789z3344','','',''],
                                    zimo:['z4','z3']});
            game.zimo();
            game.dapai('z4');
            game.zimo();
            game.dapai('z3');
            assert.ok(! game.allow_hule(0));
        });
        test('クイタンなしにできること', ()=>{
            const game = init_game({rule:Majiang.rule({'クイタンあり':false}),
                                    shoupai:['_','m234p567s2244,m888-','','']});
            game.zimo();
            game.dapai('s4');
            assert.ok(! game.allow_hule(1));
        });
    });

    suite('allow_pingju()', ()=>{
        test('九種九牌', ()=>{
            const game = init_game({shoupai:['m123459z1234567','','','']});
            game.zimo();
            assert.ok(game.allow_pingju());
        });
        test('第一ツモ以降は九種九牌にならない', ()=>{
            const game = init_game({shoupai:['_','_','m123459z1234567','']});
            game.zimo();
            game.dapai('s2');
            game.fulou('s2-34');
            game.dapai('z3');
            game.zimo();
            assert.ok(! game.allow_pingju());
        });
        test('途中流局なしの場合は九種九牌にできない', ()=>{
            const game = init_game({rule:Majiang.rule({'途中流局あり':false}),
                                    shoupai:['m123459z1234567','','','']});
            game.zimo();
            assert.ok(! game.allow_pingju());
        });
    });

    suite('static get_dapai(rule, shoupai)', ()=>{
        let shoupai = Majiang.Shoupai.fromString('m5678p567,z111=,s789-')
                                     .fulou('m0-67');
        test('喰い替えなし', ()=>
            assert.deepEqual(
                Majiang.Game.get_dapai(
                    Majiang.rule({'喰い替え許可レベル':0}), shoupai),
                ['p5','p6','p7']));
        test('現物以外の喰い替えあり', ()=>
            assert.deepEqual(
                Majiang.Game.get_dapai(
                    Majiang.rule({'喰い替え許可レベル':1}), shoupai),
                ['m8','p5','p6','p7']));
        test('現物喰い替えもあり', ()=>
            assert.deepEqual(
                Majiang.Game.get_dapai(
                    Majiang.rule({'喰い替え許可レベル':2}), shoupai),
                ['m5','m8','p5','p6','p7']));
    });

    suite('static get_chi_mianzi(rule, shoupai, p, paishu)', ()=>{

        let shoupai1 = Majiang.Shoupai.fromString('m1234,p456-,z111=,s789-');
        let shoupai2 = Majiang.Shoupai.fromString('m1123,p456-,z111=,s789-');

        test('喰い替えなし', ()=>{
            const rule = Majiang.rule({'喰い替え許可レベル':0});
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(rule, shoupai1, 'm1-', 1), []);
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(rule, shoupai2, 'm1-', 1), []);
        });
        test('現物以外の喰い替えあり', ()=>{
            const rule = Majiang.rule({'喰い替え許可レベル':1});
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(rule, shoupai1, 'm1-', 1),
                ['m1-23']);
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(rule, shoupai2, 'm1-', 1), []);
        });
        test('現物喰い替えもあり', ()=>{
            const rule = Majiang.rule({'喰い替え許可レベル':2});
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(rule, shoupai1, 'm1-', 1),
                ['m1-23']);
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(rule, shoupai2, 'm1-', 1),
                ['m1-23']);
        });
        test('ハイテイは鳴けない', ()=>{
            assert.deepEqual(
                Majiang.Game.get_chi_mianzi(
                    Majiang.rule({'喰い替え許可レベル':2}), shoupai1, 'm1-', 0),
                []);
        });
        test('ツモした状態でチーできない', ()=>{
            assert.ifError(
                Majiang.Game.get_chi_mianzi(
                    Majiang.rule(),
                    Majiang.Shoupai.fromString('m123p456s12789z123'),
                    's3-', 1));
        });
    });

    suite('static get_peng_mianzi(rule, shoupai, p, paishu)', ()=>{

        let shoupai = Majiang.Shoupai.fromString('m1112,p456-,z111=,s789-');

        test('喰い替えのためにポンできないケースはない', ()=>
            assert.deepEqual(
                Majiang.Game.get_peng_mianzi(
                    Majiang.rule({'喰い替え許可レベル':0}), shoupai, 'm1+', 1),
                ['m111+']));
        test('ハイテイは鳴けない', ()=>
            assert.deepEqual(
                Majiang.Game.get_peng_mianzi(
                    Majiang.rule({'喰い替え許可レベル':0}), shoupai, 'm1+', 0),
                []));
        test('ツモした状態でポンできない', ()=>{
            assert.ifError(
                Majiang.Game.get_peng_mianzi(
                    Majiang.rule(),
                    Majiang.Shoupai.fromString('m123p456s11789z123'),
                    's1-', 1));
        });
    });

    suite('static get_gang_mianzi(rule, shoupai, p, paishu)', ()=>{

        let shoupai1 = Majiang.Shoupai.fromString('m1112p456s789z111z1*');
        let shoupai2 = Majiang.Shoupai.fromString('m1112p456s789z111m1*');
        let shoupai3 = Majiang.Shoupai.fromString('m23p567s33345666s3*');
        let shoupai4 = Majiang.Shoupai.fromString('s1113445678999s1*');
        let shoupai5 = Majiang.Shoupai.fromString('m23s77789s7*,s5550,z6666');

        test('リーチ後の暗槓なし', ()=>{
            const rule = Majiang.rule({'リーチ後暗槓許可レベル':0});
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai1, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai2, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai3, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai4, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai5, null, 1), []);
        });
        test('リーチ後の牌姿の変わる暗槓なし', ()=>{
            const rule = Majiang.rule({'リーチ後暗槓許可レベル':1});
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai1, null, 1),
                ['z1111']);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai2, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai3, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai4, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai5, null, 1), []);
        });
        test('リーチ後の待ちの変わる暗槓なし', ()=>{
            const rule = Majiang.rule({'リーチ後暗槓許可レベル':2});
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai1, null, 1),
                ['z1111']);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai2, null, 1), []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai3, null, 1),
                ['s3333']);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai4, null, 1),
                ['s1111']);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule, shoupai5, null, 1), []);
        });
        test('ハイテイはカンできない', ()=>{
            const rule = Majiang.rule();
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule,
                    Majiang.Shoupai.fromString('m1112p456s789z111z1'),
                    null, 0),
                []);
            assert.deepEqual(
                Majiang.Game.get_gang_mianzi(rule,
                    Majiang.Shoupai.fromString('m1112p456s789z111'),
                    'z1=', 0),
                []);
        });
    });

    suite('static allow_lizhi(rule, shoupai, p, paishu, defen)', ()=>{

        const rule = Majiang.rule();

        test('打牌できない場合、リーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai));
        });
        test('すでにリーチしている場合、リーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11223*');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai));
        });
        test('メンゼンでない場合、リーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z23,z111=');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai));
        });
        test('ツモ番がない場合、リーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11223');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai, 'z3', 3));
        });
        test('ルールが許せばツモ番がなくてもリーチは可能', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11223');
            assert.ok(Majiang.Game.allow_lizhi(
                            Majiang.rule({'ツモ番なしリーチあり':true}),
                            shoupai, 'z3', 3));
        });
        test('持ち点が1000点に満たない場合、リーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11223');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai, 'z3', 4, 900));
        });
        test('トビなしなら持ち点が1000点に満たなくてもリーチは可能', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11223');
            assert.ok(Majiang.Game.allow_lizhi(
                            Majiang.rule({'トビ終了あり':false}),
                            shoupai, 'z3', 4, 900));
        });
        test('テンパイしていない場合、リーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11234');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai));
        });
        test('形式テンパイと認められない牌姿でリーチはできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11112');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai, 'z2'));
        });
        test('指定された打牌でリーチ可能な場合、真を返すこと', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11112');
            assert.ok(Majiang.Game.allow_lizhi(rule, shoupai, 'z1'));
        });
        test('指定された打牌でリーチできない場合、偽を返すこと', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11112');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai, 'z2'));
        });
        test('打牌が指定されていない場合、リーチ可能な打牌一覧を返す', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s788z11122');
            assert.deepEqual(Majiang.Game.allow_lizhi(rule, shoupai),
                             ['s7','s8']);
            shoupai = Majiang.Shoupai.fromString('m123p456s789z11223');
            assert.deepEqual(Majiang.Game.allow_lizhi(rule, shoupai),
                             ['z3_']);
        });
        test('リーチ可能な打牌がない場合、false を返す', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m11112344449999');
            assert.ok(! Majiang.Game.allow_lizhi(rule, shoupai));
        });
    });

    suite('static allow_hule(shoupai, p, zhuangfeng, menfeng, '
                                                + 'hupai, neng_rong)', ()=>{
        const rule = Majiang.rule();

        test('フリテンの場合、ロン和了できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456z1122,s789-');
            assert.ok(! Majiang.Game.allow_hule(
                                rule, shoupai, 'z1=', 0, 1, false, false));
        });
        test('和了形になっていない場合、和了できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456z11223,s789-');
            assert.ok(! Majiang.Game.allow_hule(
                                rule, shoupai, null, 0, 1, false, true));
        });
        test('役あり和了形の場合、和了できる', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z3377');
            assert.ok(Majiang.Game.allow_hule(
                                rule, shoupai, 'z3+', 0, 1, true, true));
        });
        test('役なし和了形の場合、和了できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z3377');
            assert.ok(! Majiang.Game.allow_hule(
                                rule, shoupai, 'z3+', 0, 1, false, true));
        });
        test('クイタンなしの場合、クイタンでは和了できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m22555p234s78,p777-');
            assert.ok(! Majiang.Game.allow_hule(
                                Majiang.rule({'クイタンあり':false}),
                                shoupai, 's6=', 0, 1, false, true));
        });
        test('ツモ和了', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z33377');
            assert.ok(Majiang.Game.allow_hule(
                                rule, shoupai, null, 0, 1, false, false));
        });
        test('ロン和了', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456z1122,s789-');
            assert.ok(Majiang.Game.allow_hule(
                                rule, shoupai, 'z1=', 0, 1, false, true));
        });
    });

    suite('static allow_pingju(rule, shoupai, diyizimo)', ()=>{

        const rule = Majiang.rule();

        test('第一巡でない場合、九種九牌とならない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m1234569z1234567');
            assert.ok(! Majiang.Game.allow_pingju(rule, shoupai, false));
        });
        test('ツモ後でない場合、九種九牌とならない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123459z1234567');
            assert.ok(! Majiang.Game.allow_pingju(rule, shoupai, true));
        });
        test('途中流局なし場合、九種九牌とならない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m1234569z1234567');
            assert.ok(! Majiang.Game.allow_pingju(
                            Majiang.rule({'途中流局あり':false}), shoupai, true));
        });
        test('八種九牌は流局にできない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m1234567z1234567');
            assert.ok(! Majiang.Game.allow_pingju(rule, shoupai, true));
        });
        test('九種九牌', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m1234569z1234567');
            assert.ok(Majiang.Game.allow_pingju(rule, shoupai, true));
        });
    });

    suite('static allow_no_daopai(rule, shoupai, paishu)', ()=>{

        const rule = Majiang.rule({'ノーテン宣言あり': true});

        test('最終打牌以外はノーテン宣言できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456z1122,s789-');
            assert.ok(! Majiang.Game.allow_no_daopai(rule, shoupai, 1));
            assert.ok(! Majiang.Game.allow_no_daopai(
                                                rule, shoupai.zimo('z3'), 0));
        });
        test('ノーテン宣言ありのルールでない場合、ノーテン宣言できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456z1122,s789-');
            assert.ok(! Majiang.Game.allow_no_daopai(
                                                Majiang.rule(), shoupai, 0));
        });
        test('リーチしている場合、ノーテン宣言できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456p789z1122*');
            assert.ok(! Majiang.Game.allow_no_daopai(rule, shoupai, 0));
        });
        test('テンパイしていない場合、ノーテン宣言できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456p789z1123');
            assert.ok(! Majiang.Game.allow_no_daopai(rule, shoupai, 0));
        });
        test('形式テンパイと認められない牌姿の場合、ノーテン宣言できない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456p789z1111');
            assert.ok(! Majiang.Game.allow_no_daopai(rule, shoupai, 0));
        });
        test('ノーテン宣言', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m123p456z1122,s789-');
            assert.ok(Majiang.Game.allow_no_daopai(rule, shoupai, 0));
        });
    });

    suite('シナリオ通りに局が進むこと', ()=>{
        for (let paipu of script) {
            test(paipu.title, ()=>{
                const game = new Majiang.Dev.Game(
                                JSON.parse(JSON.stringify(paipu)),
                                Majiang.rule({'順位点':['20','10','-10','-20']})
                            ).do_sync();
                assert.deepEqual(paipu, game._paipu);
            });
        }
    });
});
