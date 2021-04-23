const assert = require('assert');

const Majiang = require('../');

let MSG = [];

class Player {
    constructor(id, reply = [], delay = 0) {
        this._id    = id;
        this._reply = reply;
        this._delay = delay;
    }
    action(msg, callback) {
        MSG[this._id] = msg;
        if (callback)
            setTimeout(()=>callback(this._reply.shift()), this._delay);
    }
}

class View {
    kaiju  (param) { this._param = { kaiju:   param } }
    redraw (param) { this._param = { redraw:  param } }
    update (param) { this._param = { update:  param } }
    summary(param) { this._param = { summary: param } }
}

function init_game(param = {}) {

    const players = [0,1,2,3].map(id => new Player(id));
    const rule = param.rule || Majiang.rule();
    const game = new Majiang.Game(players, null, rule);

    game.view = new View();
    game.stop();
    game.kaiju();
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
    if (param.defen) {
        for (let l = 0; l < 4; l++) {
            let id = game.model.player_id[l];
            game.model.defen[id] = param.defen[l];
        }
    }

    return game;
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

    suite('delay(callback, timeout)', ()=>{

        const game = new Majiang.Game();

        test('speed: 0 → 0ms', (done)=>{
            let called;
            game._speed = 0;
            game.delay(()=>{ called = 1 });
            assert.ifError(called);
            setTimeout(()=>{ assert.ok(called); done() }, 0);
        });
        test('speed: 1 → 500ms', (done)=>{
            let called;
            game._speed = 1;
            game.delay(()=>{ called = 1 });
            setTimeout(()=>{ assert.ifError(called)    }, 200);
            setTimeout(()=>{ assert.ok(called); done() }, 500);
        });
        test('speed: 3 → 600ms', (done)=>{
            let called;
            game._speed = 3;
            game.delay(()=>{ called = 1 });
            setTimeout(()=>{ assert.ifError(called)    }, 500);
            setTimeout(()=>{ assert.ok(called); done() }, 600);
        });
        test('speed: 0, timeout: 100 → 0ms', (done)=>{
            let called;
            game._speed = 0;
            game.delay(()=>{ called = 1 }, 100);
            assert.ifError(called);
            setTimeout(()=>{ assert.ok(called); done() }, 0);
        });
        test('speed: 5, timeout: 100 → 100ms', (done)=>{
            let called;
            game._speed = 5;
            game.delay(()=>{ called = 1 }, 100);
            setTimeout(()=>{ assert.ifError(called)    }, 0);
            setTimeout(()=>{ assert.ok(called); done() }, 100);
        });
    });

    suite('stop()', ()=>{

        const game = new Majiang.Game();

        test('停止すること', (done)=>{
            game.stop(done);
            assert.ok(game._stop);
            assert.ok(! game._timeout_id);
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
        game._speed = 1;
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
        game._speed = 0;
        game.stop();

        test('起家が設定されること', ()=>{
            MSG =[];
            game.kaiju(1);
            assert.equal(game._model.qijia, 1);
        });
        test('牌譜が初期化されること', ()=>{
            assert.equal(game._paipu.title, game._model.title);
            assert.deepEqual(game._paipu.player, game._model.player);
            assert.equal(game._paipu.qijia, game._model.qijia);
            assert.equal(game._paipu.log.length, 0);
        });
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { kaiju: null }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let id = 0; id < 4; id++) {
                let msg = {
                    kaiju: {
                        id:     id,
                        rule:   game._rule,
                        player: game._model.player,
                        qijia:  1
                    }
                };
                assert.deepEqual(MSG[id], msg);
            }
            done();
        }, 0));
        test('起家を乱数で設定できること', ()=>{
            game.kaiju();
            assert.ok(game._model.qijia == 0 ||
                      game._model.qijia == 1 ||
                      game._model.qijia == 2 ||
                      game._model.qijia == 3);
        });
    });

    suite('qipai(shan)', ()=>{

        const game = init_game();

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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().qipai));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { redraw: null }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].qipai.defen[l], 25000);
                assert.ok(MSG[id].qipai.shoupai[l]);
            }
            done();
        }, 0));

        test('使用する牌山を指定できること', ()=>{
            const shan = new Majiang.Shan(game._rule);
            const shoupai = new Majiang.Shoupai(shan._pai.slice(-13));
            game.qipai(shan);
            assert.equal(game.model.shoupai[0].toString(), shoupai.toString());
        });
        test('途中流局なしの場合、最初から四風連打中でないこと', ()=>{
            const rule = Majiang.rule({'途中流局あり':false});
            const game = init_game({rule:rule});
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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().zimo));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].zimo.l, game.model.lunban);
                if (l == game.model.lunban)
                        assert.ok(MSG[id].zimo.p);
                else    assert.ok(! MSG[id].zimo.p);
            }
            done();
        }, 0));
        test('ツモ牌がない場合、流局すること');
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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().dapai));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].dapai.l, game.model.lunban);
                assert.equal(MSG[id].dapai.p, dapai);
            }
            done();
        }, 0));

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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().fulou));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].fulou.l, game.model.lunban);
                assert.equal(MSG[id].fulou.m, 'm12-3');
            }
            done();
        }, 0));

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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().gang));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].gang.l, game.model.lunban);
                assert.equal(MSG[id].gang.m, 's555+0');
            }
            done();
        }, 0));

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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu(-1).gangzimo));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param,
                             { update: game.last_paipu(-1) }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].gangzimo.l, game.model.lunban);
                if (l == game.model.lunban)
                        assert.ok(MSG[id].gangzimo.p);
                else    assert.ok(! MSG[id].gangzimo.p);
            }
            done();
        }, 0));

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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().kaigang));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].kaigang.baopai,
                             game.model.shan.baopai.pop());
            }
            done();
        }, 0));

        test('カンドラなしの場合、開槓しないこと', ()=>{
            const rule = Majiang.rule({'カンドラあり':false});
            const game = init_game({rule:rule,shoupai:['_','','','','']});
            game.zimo();
            game.gang('m1111');
            game.gangzimo();
            assert.equal(game.model.shan.baopai.length, 1);
        });
    });

    suite('hule()', ()=>{

        const game = init_game({shoupai:['_','','m123p456s789z1122','']});

        test('牌譜が記録されること', ()=>{
            game.zimo();
            game.dapai('z1');
            game._hule = [2];
            game.hule();
            assert.ok(game.last_paipu().hule);
        });
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].hule.l, 2);
            }
            done();
        }, 0));

        test('立直・一発', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','_','','']});
            game._diyizimo = false;
            game.zimo();
            game.dapai(game.model.shoupai[0]._zimo + '_*');
            game.zimo();
            game.dapai('z1');
            game._hule = [0];
            game.hule();
            assert.ok(game.last_paipu().hule.hupai.find(h=>h.name == '立直'));
            assert.ok(game.last_paipu().hule.hupai.find(h=>h.name == '一発'));
        });
        test('ダブル立直', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','_','','']});
            game.zimo();
            game.dapai(game.model.shoupai[0]._zimo + '_*');
            game.zimo();
            game.dapai('z1');
            game._hule = [0];
            game.hule();
            assert.ok(game.last_paipu().hule.hupai
                                    .find(h=>h.name == 'ダブル立直'));
        });
        test('槍槓', ()=>{
            const game = init_game({shoupai:['_________m1,m111=','_',
                                             'm23p456s789z11222','']});
            game.zimo();
            game.gang('m111=1');
            game._hule = [2];
            game.hule();
            assert.ok(game.last_paipu().hule.hupai.find(h=>h.name == '槍槓'));
        });
        test('嶺上開花', ()=>{
            const game = init_game({shoupai:['m123p456s78z11,m111=','','',''],
                                    zimo:['m4'],gangzimo:['s9']});
            game.zimo();
            game.gang('m111=1');
            game.gangzimo();
            game.hule();
            assert.ok(game.last_paipu().hule.hupai
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
            assert.ok(! game.last_paipu().hule.hupai
                                    .find(h=>h.name == '海底摸月'));
        });
        test('海底摸月', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z2']});
            game._diyizimo = false;
            game.zimo();
            while (game.model.shan.paishu > 0) game.model.shan.zimo();
            game.hule();
            assert.ok(game.last_paipu().hule.hupai
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
            assert.ok(game.last_paipu().hule.hupai
                                    .find(h=>h.name == '河底撈魚'));
        });
        test('天和', ()=>{
            const game = init_game({shoupai:['m123p456s789z1122','','',''],
                                    zimo:['z2']});
            game.zimo();
            game.hule();
            assert.ok(game.last_paipu().hule.hupai.find(h=>h.name == '天和'));
        });
        test('地和', ()=>{
            const game = init_game({shoupai:['_','m123p456s789z1122','',''],
                                    zimo:['m1','z2']});
            game.zimo();
            game.dapai('m1_');
            game.zimo();
            game.hule();
            assert.ok(game.last_paipu().hule.hupai.find(h=>h.name == '地和'));
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
            assert.ok(game.last_paipu().hule.hupai.find(h=>h.name == '槍槓'));
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
            const game = init_game({rule:Majiang.rule({'連荘方式':3}),
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
        test('牌譜が記録されること', ()=> assert.ok(game.last_paipu().pingju));
        test('表示処理が呼び出されること', ()=>
            assert.deepEqual(game._view._param, { update: game.last_paipu() }));
        test('通知が伝わること', (done)=>setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let id = game.model.player_id[l];
                assert.equal(MSG[id].pingju.name, '九種九牌');
            }
            done();
        }, 0));

        test('全員テンパイ', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false}),
                                    shoupai:['m22p12366s406789',
                                             'm55p40s123,z111-,p678-',
                                             'm67p678s22,s56-7,p444-',
                                             'm12345p33s333,m406-']});
            game.pingju();
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
            assert.equal(game.last_paipu().pingju.shoupai
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
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
            assert.equal(game.last_paipu().pingju.shoupai
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
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
            assert.equal(game.last_paipu().pingju.shoupai
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
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
            assert.equal(game.last_paipu().pingju.shoupai
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
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
            assert.equal(game.last_paipu().pingju.shoupai
                                            .filter(s=>s).length, 3)
            assert.deepEqual(game._fenpei, [-3000,1000,1000,1000]);
        });
        test('ノーテン罰なし', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       'ノーテン罰あり':false}),
                                    shoupai:['m22p12366s406789',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm12345p33s333,m406-']});
            game.pingju();
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
            assert.equal(game.last_paipu().pingju.shoupai
                                            .filter(s=>s).length, 2)
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
                                                       '連荘方式':3}),
                                    shoupai:['m22p12366s406789',
                                             'm99p12306z277,m345-',
                                             'm3p1234689z55,s7-89',
                                             'm2233467p234555']});
            game.pingju();
            assert.ok(! game._lianzhuang);
        });
        test('ノーテン連荘の場合、親がノーテンでも連荘すること', ()=>{
            const game = init_game({rule:Majiang.rule({'流し満貫あり':false,
                                                       '連荘方式':0}),
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
            assert.equal(game.last_paipu().pingju.name, '流し満貫');
            assert.deepEqual(game._fenpei, [12000,-4000,-4000,-4000]);
        });
        test('鳴かれた場合、流し満貫は成立しない', ()=>{
            const game = init_game({shoupai:['_','_','_','_']});
            game.zimo(); game.dapai('z1');
            game.fulou('z111-'); game.dapai('m2');
            game.zimo(); game.dapai('p2');
            game.zimo(); game.dapai('s2');
            game.pingju();
            assert.equal(game.last_paipu().pingju.name, '荒牌平局');
        });
        test('2人が流し満貫', ()=>{
            const game = init_game({shoupai:['_','_','_','_']});
            game.zimo(); game.dapai('z1');
            game.zimo(); game.dapai('m1');
            game.zimo(); game.dapai('p2');
            game.zimo(); game.dapai('s2');
            game.pingju();
            assert.equal(game.last_paipu().pingju.name, '流し満貫');
            assert.deepEqual(game._fenpei, [8000,4000,-6000,-6000]);
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
        test('東風戦は東四局で終局すること', (done)=>{
            const game = init_game({rule:Majiang.rule({'場数':1}),
                                    defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 0;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('東南戦は南四局で終局すること', (done)=>{
            const game = init_game({rule:Majiang.rule({'場数':2}),
                                    defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('一荘戦は北四局で終局すること', (done)=>{
            const game = init_game({rule:Majiang.rule({'場数':4}),
                                    defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 3;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('連荘中でもトビ終了すること', (done)=>{
            const game = init_game({defen:[50100,30000,20000,-100]});
            game._lianzhuang = true;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('オーラス止め(東風戦)', (done)=>{
            const game = init_game({rule:Majiang.rule({'場数':1}),
                                    defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 0;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('オーラス止め(東南戦)', (done)=>{
            const game = init_game({defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('途中流局ではオーラス止めしないこと', (done)=>{
            const game = init_game({defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game._no_game = true;
            game.last();
            setTimeout(()=>{
                assert.ok(! game._view._param.summary);
                done();
            }, 0);
        });
        test('オーラス止めなし', (done)=>{
            const game = init_game({rule:Majiang.rule({'オーラス止めあり':false}),
                                    defen:[40000,30000,20000,10000]});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game._lianzhuang = true;
            game.last();
            setTimeout(()=>{
                assert.ok(! game._view._param.summary);
                done();
            }, 0);
        });
        test('一荘戦では延長戦がないこと', (done)=>{
            const game = init_game({rule:Majiang.rule({'場数':4})});
            game.model.zhuangfeng = 3;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('延長戦なし', (done)=>{
            const game = init_game({rule:Majiang.rule({'延長戦方式':0})});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('延長戦突入', (done)=>{
            const game = init_game();
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(! game._view._param.summary);
                done();
            }, 0);
        });
        test('延長戦サドンデス', (done)=>{
            const game = init_game({defen:[10000,20000,30000,40000]});
            game.model.zhuangfeng = 2;
            game.model.jushu = 0;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('連荘優先サドンデス', (done)=>{
            const game = init_game({rule:Majiang.rule({'延長戦方式':2})});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._max_jushu, 8);
            setTimeout(()=>{
                assert.ok(! game._view._param.summary);
                done();
            }, 0);
        });
        test('4局固定延長戦オーラス止め', (done)=>{
            const game = init_game({rule:Majiang.rule({'延長戦方式':3})});
            game.model.zhuangfeng = 1;
            game.model.jushu = 3;
            game.last();
            assert.equal(game._max_jushu, 11);
            setTimeout(()=>{
                assert.ok(! game._view._param.summary);
                done();
            }, 0);
        });
        test('延長戦は最大四局で終了すること', (done)=>{
            const game = init_game();
            game.model.zhuangfeng = 2;
            game.model.jushu = 3;
            game.last();
            setTimeout(()=>{
                assert.ok(game._view._param.summary);
                done();
            }, 0);
        });
        test('一局戦');
    });

    suite('static get_dapai(rule, shoupai)', ()=>{

        let shoupai = Majiang.Shoupai.fromString('m1234p567,z111=,s789-')
                                     .fulou('m1-23');
        test('喰い替えなし', ()=>
            assert.deepEqual(
                Majiang.Game.get_dapai(
                    Majiang.rule({'喰い替え許可レベル':0}), shoupai),
                ['p5','p6','p7']));
        test('現物以外の喰い替えあり', ()=>
            assert.deepEqual(
                Majiang.Game.get_dapai(
                    Majiang.rule({'喰い替え許可レベル':1}), shoupai),
                ['m4','p5','p6','p7']));
        test('現物喰い替えもあり', ()=>
            assert.deepEqual(
                Majiang.Game.get_dapai(
                    Majiang.rule({'喰い替え許可レベル':2}), shoupai),
                ['m1','m4','p5','p6','p7']));
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
    });

    suite('static get_gang_mianzi(rule, shoupai, p, paishu)', ()=>{

        let shoupai1 = Majiang.Shoupai.fromString('m1112p456s789z111z1*');
        let shoupai2 = Majiang.Shoupai.fromString('m1112p456s789z111m1*');
        let shoupai3 = Majiang.Shoupai.fromString('m23p567s33345666s3*');
        let shoupai4 = Majiang.Shoupai.fromString('s1113445678999s1*');

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

        test('第一ツモでない場合、九種九牌とならない', ()=>{
            let shoupai = Majiang.Shoupai.fromString('m1234569z1234567');
            assert.ok(! Majiang.Game.allow_pingju(rule, shoupai, false));
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
});
