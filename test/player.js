const assert = require('assert');

const Majiang = require('../');

function init_player(param = {}) {

    const player = new Majiang.Player();

    const kaiju = { id: 1, rule: Majiang.rule(), title: 'タイトル',
                    player: ['私','下家','対面','上家'], qijia: 1 };
    const qipai = { zhuangfeng: 0, jushu: 0, changbang: 0, lizhibang: 0,
                    defen: [ 25000, 25000, 25000, 25000 ], baopai: 'm1',
                    shoupai: ['','','',''] };

    if (param.rule)          kaiju.rule  = param.rule;
    if (param.jushu != null) qipai.jushu = param.jushu;

    let menfeng = (kaiju.id + 4 - kaiju.qijia + 4 - qipai.jushu) % 4;
    qipai.shoupai[menfeng] = param.shoupai || 'm123p456s789z1234';

    player.kaiju(kaiju);
    player.qipai(qipai);

    return player;
}

class Player extends Majiang.Player {
    action_kaiju(kaiju)         { this._callback() }
    action_qipai(qipai)         { this._callback() }
    action_zimo(zimo, gangzimo) { this._callback() }
    action_dapai(dapai)         { this._callback() }
    action_fulou(fulou)         { this._callback() }
    action_gang(gang)           { this._callback() }
    action_hule(hule)           { this._callback() }
    action_pingju(pingju)       { this._callback() }
    action_jieju(paipu)         { this._callback() }
}

class View {
    kaiju  (param) { this._param = { kaiju:   param } }
    redraw (param) { this._param = { redraw:  param } }
    update (param) { this._param = { update:  param } }
    say (...param) { this._say   = param              }
    summary(param) { this._param = { summary: param } }
}

suite('Majiang.Player', ()=>{

    test('クラスが存在すること',        ()=> assert.ok(Majiang.Player));

    suite('constructor()', ()=>{
        const player = new Majiang.Player();
        test('インスタンスが生成できること', ()=> assert.ok(player));
        test('初期値が設定されること', ()=> assert.ok(player.model));
    });

    suite('kaiju(kaiju)', ()=>{
        test('初期値が設定されること', ()=>{

            const player = new Majiang.Player();
            const kaiju = { id: 1, rule: Majiang.rule(), title: 'タイトル',
                            player: ['私','下家','対面','上家'], qijia: 2 };
            player.kaiju(kaiju);

            assert.equal(player._id, 1);
            assert.deepEqual(player._rule, Majiang.rule());
            assert.equal(player.model.title, 'タイトル');
        });
        test('表示処理が呼び出されること', ()=>{
            const player = new Majiang.Player();
            player.view = new View();
            const kaiju = { id: 1, rule: Majiang.rule(), title: 'タイトル',
                            player: ['私','下家','対面','上家'], qijia: 2 };
            player.kaiju(kaiju);
            assert.deepEqual(player._view._param, { kaiju: 1 });
        });
    });
    suite('qipai(qipai)', ()=>{
        test('初期値が設定されること', ()=>{

            const player = new Majiang.Player();
            const kaiju = { id: 1, rule: Majiang.rule(), title: 'タイトル',
                            player: ['私','下家','対面','上家'], qijia: 2 };
            player.kaiju(kaiju);

            const qipai = { zhuangfeng: 1, jushu: 2, changbang: 3, lizhibang: 4,
                            defen: [ 25000, 25000, 25000, 25000 ], baopai: 's5',
                            shoupai: ['','m123p456s789z1234','',''] };
            player.qipai(qipai);

            assert.equal(player._menfeng, 1);
            assert.ok(player._diyizimo);
            assert.equal(player._n_gang, 0);
            assert.ok(player._neng_rong);
            assert.equal(player.shoupai, 'm123p456s789z1234');
            assert.equal(player.he._pai.length, 0);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = new Majiang.Player();
            player.view = new View();
            const kaiju = { id: 1, rule: Majiang.rule(), title: 'タイトル',
                            player: ['私','下家','対面','上家'], qijia: 2 };
            player.kaiju(kaiju);
            const qipai = { zhuangfeng: 1, jushu: 2, changbang: 3, lizhibang: 4,
                            defen: [ 25000, 25000, 25000, 25000 ], baopai: 's5',
                            shoupai: ['','m123p456s789z1234','',''] };
            player.qipai(qipai);
            assert.deepEqual(player._view._param, { redraw: null });
        });
    });
    suite('zimo(zimo)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player();
            player.zimo({ l: 0, p: 'z5' });
            assert.equal(player.shoupai, 'm123p456s789z1234z5');
        });
        test('槓ヅモで槓数が増えること', ()=>{
            const player = init_player();
            player.zimo({ l: 0, p: 'z5' }, true);
            assert.equal(player._n_gang, 1);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player();
            player.view = new View();
            player.zimo({ l: 0, p: 'z5' });
            assert.deepEqual(player._view._param,
                                { update: { zimo: { l: 0, p: 'z5' } } });
            player.zimo({ l: 1, p: '' }, true);
            assert.deepEqual(player._view._param,
                                { update: { gangzimo: { l: 1, p: '' } } });
        });
    });
    suite('dapai(dapai)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1234z5'});
            player.dapai({ l: 0, p: 'z5_' });
            assert.equal(player.shoupai, 'm123p456s789z1234');
        });
        test('自身の打牌の後、第一ツモ巡でなくなること', ()=>{
            const player = init_player({jushu:3});
            player.dapai({ l: 0, p: 'z5'});
            assert.ok(player._diyizimo);
            player.dapai({ l: 1, p: 'z1' });
            assert.ok(! player._diyizimo);
        });
        test('自身の打牌に和了牌がある場合、フリテンとなること', ()=>{
            const player = init_player({shoupai:'m123p406s789z11222'});
            player.dapai({ l: 0, p: 'p0' });
            assert.ok(! player._neng_rong);
        });
        test('自身の打牌でフリテンが解除されること', ()=>{
            const player = init_player({shoupai:'m123p456s789z11223'});
            player._neng_rong = false;
            player.dapai({ l: 0, p: 'z3_' });
            assert.ok(player._neng_rong);
        });
        test('リーチ宣言まではフリテンが解除されること', ()=>{
            const player = init_player({shoupai:'m123p456s789z11232'});
            player._neng_rong = false;
            player.dapai({ l: 0, p: 'z3*' });
            assert.ok(player._neng_rong);
        });
        test('リーチ後はフリテンが解除されないこと', ()=>{
            const player = init_player({shoupai:'m123p456s789z11223*'});
            player._neng_rong = false;
            player.dapai({ l: 0, p: 'z3_' });
            assert.ok(! player._neng_rong);
        });
        test('和了牌を見逃した場合、フリテンとなること', ()=>{
            const player = init_player({shoupai:'m123p46s789z11122'});
            player.dapai({ l: 1, p: 'p0' });
            assert.ok(! player._neng_rong);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1234z5'});
            player.view = new View();
            player.dapai({ l: 0, p: 'z5_' });
            assert.deepEqual(player._view._param,
                                { update: { dapai: { l: 0, p: 'z5_' } } });
        });
    });
    suite('fulou(fulou)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1134'});
            player.dapai({ l: 2, p: 'z1' });
            player.fulou({ l: 0, m: 'z111=' });
            assert.equal(player.shoupai, 'm123p456s789z34,z111=,');
        });
        test('第一ツモ巡でなくなること', ()=>{
            const player = init_player({jushu:1});
            player.dapai({ l: 0, p: 'z3' });
            assert.ok(player._diyizimo);
            player.fulou({ l: 1, m: 'z333=' });
            assert.ok(! player._diyizimo);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1134'});
            player.view = new View();
            player.dapai({ l: 2, p: 'z1' });
            player.fulou({ l: 0, m: 'z111=' });
            assert.deepEqual(player._view._param,
                                { update: { fulou: { l: 0, m: 'z111=' } } });
        });
    });
    suite('gang(gang)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player({shoupai:'m123p456s788z12,z111='});
            player.gang({ l: 0, m: 'z111=1' });
            assert.equal(player.shoupai, 'm123p456s788z2,z111=1');
        });
        test('第一ツモ巡でなくなること',()=>{
            const player = init_player({jushu:1});
            player.gang({ l: 0, m: 'm9999' });
            assert.ok(! player._diyizimo);
        });
        test('和了牌を見逃した場合、フリテンとなること', ()=>{
            const player = init_player({shoupai:'m34p456s788z11222'});
            player.dapai({ l: 2, p: 'm5' });
            player.fulou({ l: 3, m: 'm555-' });
            player.dapai({ l: 2, p: 's4' });
            player.fulou({ l: 3, m: 's444-' })
            player.zimo({ l: 0, p: 's9' });
            player.dapai({ l: 0, p: 's8' });
            player.gang({ l: 3, m: 's444-4' });
            assert.ok(player._neng_rong);
            player.gang({ l: 3, m: 'm555-0' });
            assert.ok(! player._neng_rong);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player({shoupai:'m123p456s788z12,z111='});
            player.view = new View();
            player.gang({ l: 0, m: 'z111=1' });
            assert.deepEqual(player._view._param,
                                { update: { gang: { l: 0, m: 'z111=1' } } });
        });
    });
    suite('kaigang(kaigang)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player();
            player.kaigang({ baopai: 'p1' });
            assert.equal(player.shan.baopai.pop(), 'p1');
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player();
            player.view = new View();
            player.kaigang({ baopai: 'p1' });
            assert.deepEqual(player._view._param,
                                { update: { kaigang: { baopai: 'p1' } } });
        });
    });
    suite('hule(hule)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player();
            player.hule({ l: 1, shoupai: 'm123p456s789z1122z1*',
                          fubaopai: ['s1'] });
            assert.equal(player.model.shoupai[1], 'm123p456s789z1122z1*')
            assert.equal(player.shan.fubaopai[0], 's1');
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player();
            player.view = new View();
            player.hule({ l: 1, shoupai: 'm123p456s789z1122z1*',
                          fubaopai: ['s1'] });
            assert.deepEqual(player._view._param,
                                { update: { hule: {
                                    l: 1, shoupai:  'm123p456s789z1122z1*',
                                    fubaopai: ['s1'] } } });
        });
    });
    suite('pingju(pingju)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player();
            player.dapai({ l: 1, p: 'm3*' });
            player.pingju({ name:'', shoupai:['','','','m123p456s789z1122*'] });
            assert.equal(player.model.shoupai[3], 'm123p456s789z1122*');
            assert.equal(player.model.lizhibang, 1);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player();
            player.view = new View();
            player.dapai({ l: 1, p: 'm3*' });
            player.pingju({ name:'', shoupai:['','','','m123p456s789z1122*'] });
            assert.deepEqual(player._view._param,
                                { update: { pingju: {
                                    name:'',
                                    shoupai:['','','','m123p456s789z1122*']
                                } } });
        });
    });
    suite('jieju(paipu)', ()=>{
        test('卓情報が更新されること', ()=>{
            const player = init_player();
            const paipu = { defen: [ 10000, 20000, 30000, 40000 ] };
            player.jieju(paipu);
            assert.deepEqual(player.model.defen, paipu.defen);
        });
        test('牌譜を取得していること', ()=>{
            const player = init_player();
            player.jieju({ defen: [] });
            assert.ok(player._paipu);
        });
        test('表示処理が呼び出されること', ()=>{
            const player = init_player();
            player.view = new View();
            const paipu = { defen: [ 10000, 20000, 30000, 40000 ] };
            player.jieju(paipu);
            assert.deepEqual(player._view._param, { summary: paipu });
        });
    });

    suite('get_dapai(shoupai)', ()=>{
        test('喰い替えなし', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m14p45677s6788,m234-,');
            assert.deepEqual(player.get_dapai(shoupai),
                                    ['p4','p5','p6','p7','s6','s7','s8']);
        });
        test('喰い替えあり', ()=>{
            const player = init_player(
                                {rule:Majiang.rule({'喰い替え許可レベル':1})});
            let shoupai = Majiang.Shoupai.fromString('m14p45677s6788,m234-,');
            assert.deepEqual(player.get_dapai(shoupai),
                                    ['m1','p4','p5','p6','p7','s6','s7','s8']);
        });
    });
    suite('get_chi_mianzi(shoupai, p)', ()=>{
        test('喰い替えなし', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('p1112344,z111=,z222+');
            assert.deepEqual(player.get_chi_mianzi(shoupai, 'p4-'), []);
        });
        test('喰い替えあり', ()=>{
            const player = init_player(
                                {rule:Majiang.rule({'喰い替え許可レベル':1})});
            let shoupai = Majiang.Shoupai.fromString('p1112344,z111=,z222+');
            assert.deepEqual(player.get_chi_mianzi(shoupai, 'p4-'), ['p234-']);
        });
        test('ハイテイ牌でチーできないこと', ()=>{
            const player = init_player();
            while (player.shan.paishu) player.shan.zimo();
            let shoupai = Majiang.Shoupai.fromString('m23p456s789z11123');
            assert.deepEqual(player.get_chi_mianzi(shoupai, 'm1-'), []);
        });
    });
    suite('get_peng_mianzi(shoupai, p)', ()=>{
        test('ポンできるメンツを返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1123');
            assert.deepEqual(player.get_peng_mianzi(shoupai, 'z1+'), ['z111+']);
        });
        test('ハイテイ牌でポンできないこと', ()=>{
            const player = init_player();
            while (player.shan.paishu) player.shan.zimo();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1123');
            assert.deepEqual(player.get_peng_mianzi(shoupai, 'z1+'), []);
        });
    });
    suite('get_gang_mianzi(shoupai, p)', ()=>{
        test('暗槓できるメンツを返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11112');
            assert.deepEqual(player.get_gang_mianzi(shoupai), ['z1111']);
        });
        test('大明槓できるメンツを返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1112');
            assert.deepEqual(player.get_gang_mianzi(shoupai,'z1='), ['z1111=']);
        });
        test('ハイテイ牌でカンできないこと', ()=>{
            const player = init_player();
            while (player.shan.paishu) player.shan.zimo();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11112');
            assert.deepEqual(player.get_gang_mianzi(shoupai), []);
        });
        test('5つ目のカンはできないこと', ()=>{
            const player = init_player();
            player._n_gang = 4;
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z11112');
            assert.deepEqual(player.get_gang_mianzi(shoupai), []);
        });
        test('リーチ後の暗槓あり', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1112z1*');
            assert.deepEqual(player.get_gang_mianzi(shoupai), ['z1111']);
        });
        test('リーチ後の暗槓なし', ()=>{
            const player = init_player(
                                {rule:Majiang.rule({'リーチ後暗槓許可レベル':0})});
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1112z1*');
            assert.deepEqual(player.get_gang_mianzi(shoupai), []);
        });
    });
    suite('allow_lizhi(shoupai, p)', ()=>{
        test('リーチ可能な牌の一覧を返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m223p456s789z11122');
            assert.deepEqual(player.allow_lizhi(shoupai), ['m2','m3']);
        });
        test('リーチ可能か判定すること', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m223p456s789z11122');
            assert.ok(player.allow_lizhi(shoupai, 'm2'));
        });
        test('ツモ番なしリーチなし', ()=>{
            const player = init_player();
            while(player.shan.paishu >=4) player.shan.zimo();
            let shoupai = Majiang.Shoupai.fromString('m223p456s789z11122');
            assert.ok(! player.allow_lizhi(shoupai));
        });
        test('ツモ番なしリーチあり', ()=>{
            const player = init_player(
                            {rule:Majiang.rule({'ツモ番なしリーチあり':true})});
            while(player.shan.paishu >=4) player.shan.zimo();
            let shoupai = Majiang.Shoupai.fromString('m223p456s789z11122');
            assert.ok(player.allow_lizhi(shoupai));
        });
        test('トビ終了あり', ()=>{
            const player = init_player();
            player.model.defen[player._id] = 900;
            let shoupai = Majiang.Shoupai.fromString('m223p456s789z11122');
            assert.ok(! player.allow_lizhi(shoupai));
        });
        test('トビ終了なし', ()=>{
            const player = init_player(
                                    {rule:Majiang.rule({'トビ終了あり':false})});
            player.model.defen[player._id] = 900;
            let shoupai = Majiang.Shoupai.fromString('m223p456s789z11122');
            assert.ok(player.allow_lizhi(shoupai));
        });
    });
    suite('allow_hule(shoupai, p)', ()=>{
        test('役なしの場合、偽を返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            assert.ok(! player.allow_hule(shoupai, 'z2='));
        });
        test('状況役ありの場合(リーチ)、真を返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122*');
            assert.ok(player.allow_hule(shoupai, 'z2='));
        });
        test('状況役ありの場合(ハイテイ)、真を返すこと', ()=>{
            const player = init_player();
            while (player.shan.paishu) player.shan.zimo();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            assert.ok(player.allow_hule(shoupai, 'z2='));
        });
        test('状況役ありの場合(槍槓)、真を返すこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            assert.ok(player.allow_hule(shoupai, 'z2=', true));
        });
        test('フリテンの場合、偽を返すこと', ()=>{
            const player = init_player();
            player._neng_rong = false;
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            assert.ok(! player.allow_hule(shoupai, 'z1='));
        });
    });
    suite('allow_pingju(shoupai)', ()=>{
        test('九種九牌で流せること', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m1234569z1234567');
            assert.ok(player.allow_pingju(shoupai));
        });
        test('最初のツモ巡をすぎた場合、流せないこと', ()=>{
            const player = init_player();
            player._diyizimo = false;
            let shoupai = Majiang.Shoupai.fromString('m123459z1234567');
            assert.ok(! player.allow_pingju(shoupai));
        });
        test('途中流局なしの場合、流せないこと', ()=>{
            const player = init_player(
                                    {rule:Majiang.rule({'途中流局あり':false})});
            let shoupai = Majiang.Shoupai.fromString('m123459z1234567');
            assert.ok(! player.allow_pingju(shoupai));
        });
    });
    suite('allow_no_daopai(shoupai)', ()=>{
        test('ノーテン宣言できること', ()=>{
            const player = init_player(
                                {rule:Majiang.rule({'ノーテン宣言あり':true})});
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            while (player.shan.paishu) player.shan.zimo();
            assert.ok(player.allow_no_daopai(shoupai));
        });
        test('ノーテン宣言なしの場合、ノーテン宣言できないこと', ()=>{
            const player = init_player();
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            while (player.shan.paishu) player.shan.zimo();
            assert.ok(! player.allow_no_daopai(shoupai));
        });
        test('テンパイしていない場合、ノーテン宣言できないこと', ()=>{
            const player = init_player(
                                {rule:Majiang.rule({'ノーテン宣言あり':true})});
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1123');
            while (player.shan.paishu) player.shan.zimo();
            assert.ok(! player.allow_no_daopai(shoupai));
        });
        test('流局していない場合、ノーテン宣言できないこと', ()=>{
            const player = init_player(
                                {rule:Majiang.rule({'ノーテン宣言あり':true})});
            let shoupai = Majiang.Shoupai.fromString('m123p456s789z1122');
            assert.ok(! player.allow_no_daopai(shoupai));
        });
    });

    suite('action(msg, callback)', ()=>{

        const player = new Player();
        const error  = ()=>{ throw new Error() };

        test('開局 (kaiju)', (done)=>{
            const kaiju = { kaiju:
                { id: 1, rule: Majiang.rule(), title: 'タイトル',
                  player: ['私','下家','対面','上家'], qijia: 2 }
            };
            player.action(kaiju, done);
        });
        test('配牌 (qipai)', (done)=>{
            const qipai = { qipai:
                { zhuangfeng: 1, jushu: 2, changbang: 3, lizhibang: 4,
                  defen: [ 25000, 25000, 25000, 25000 ], baopai: 's5',
                  shoupai: ['','m123p456s789z1234','',''] }
            };
            player.action(qipai, done);
        });
        test('自摸 (zimo)', (done)=>{
            player.action({ zimo: { l: 0, p: 'm1' } }, done);
        });
        test('打牌 (dapai)', (done)=>{
            player.action({ dapai: { l: 0, p: 'm1_' } }, done);
        });
        test('副露 (fulou)', (done)=>{
            player.action({ fulou: { l: 1, m: 'm1-23' } }, done);
        });
        test('槓 (gang)', (done)=>{
            player.action({ gang: { l: 2, m: 's1111' } }, done);
        });
        test('槓自摸 (gangzimo)', (done)=>{
            player.action({ gangzimo: { l: 2, p: 's2' } }, done);
        });
        test('開槓 (kaigang)', ()=>{
            player.action({ kaigang: { baopai: 'm1' } }, error);
        });
        test('和了 (hule)', (done)=>{
            const hule = { hule: {
                l:          2,
                shoupai:    'p7p7,z111-,z222=,z333+,z444-',
                baojia:     3,
                fubaopai:   null,
                damanguan:  2,
                defen:      64000,
                hupai:      [ { name: '大四喜', fanshu: '**', baojia: 0 } ],
                fenpai:     [ -32000, 0, 64000, -32000 ]
            } };
            player.action(hule, done);
        });
        test('流局 (pingju)', (done)=>{
            const pingju = { pingju: {
                name:    '荒牌平局',
                shoupai: [ '', 'p2234406z333555', '', 'p11223346777z77' ],
                fenpai:  [ -1500, 1500, -1500, 1500 ]
            } };
            player.action(pingju, done);
        });
        test('終局 (jieju)', (done)=>{
            player.action({ jieju: { defen: [] } }, done);
        });
        test('その他', ()=>{
            player.action({}, error);
        });
    });
});
