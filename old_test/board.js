const assert = require('assert');

const Majiang = require('../');

function init_board(param = {}) {

    const board = new Majiang.Board({
        title: 'タイトル',
        player: ['私','下家','対面','上家'],
        qijia: 1
    });

    let qipai = {
        zhuangfeng: 1,
        jushu:      2,
        changbang:  3,
        lizhibang:  4,
        defen:      [10000, 20000, 30000, 36000],
        baopai:     'm1',
        shoupai:    ['','','','']
    };
    board.qipai(qipai);

    return board;
}

suite('Majiang.Board', ()=>{

    test('クラスが存在すること', ()=> assert.ok(Majiang.Board));

    suite('constructor(kaiju)', ()=>{
        const board = new Majiang.Board({
            title: 'タイトル',
            player: ['私','下家','対面','上家'],
            qijia: 1
        });
        test('インスタンスが生成できること', ()=> assert.ok(board));
        test('タイトルが設定されること', ()=>
            assert.equal(board.title, 'タイトル'));
        test('対局者情報が設定されること', ()=>
            assert.deepEqual(board.player, ['私','下家','対面','上家']));
        test('起家が設定されること', ()=>
            assert.equal(board.qijia, 1));
        test('パラメータなしでもインスタンスが生成できること', ()=>
            assert.ok(new Majiang.Board()));
    });

    suite('manfeng(id)', ()=>{
        const board = new Majiang.Board({});
        test('起家: 仮東、東一局', ()=>{
            board.qijia = 0; board.jushu = 0;
            assert.equal(board.menfeng(0), 0);
            assert.equal(board.menfeng(1), 1);
            assert.equal(board.menfeng(2), 2);
            assert.equal(board.menfeng(3), 3);
        });
        test('起家: 仮東、東二局', ()=>{
            board.qijia = 0; board.jushu = 1;
            assert.equal(board.menfeng(0), 3);
            assert.equal(board.menfeng(1), 0);
            assert.equal(board.menfeng(2), 1);
            assert.equal(board.menfeng(3), 2);
        });
        test('起家: 仮南、東一局', ()=>{
            board.qijia = 1; board.jushu = 0;
            assert.equal(board.menfeng(0), 3);
            assert.equal(board.menfeng(1), 0);
            assert.equal(board.menfeng(2), 1);
            assert.equal(board.menfeng(3), 2);
        });
    });

    suite('qipai(qipai)', ()=>{
        const board = new Majiang.Board({
            title: 'タイトル',
            player: ['私','下家','対面','上家'],
            qijia: 1
        });
        let qipai = {
            zhuangfeng: 1,
            jushu:      2,
            changbang:  3,
            lizhibang:  4,
            defen:      [10000, 20000, 30000, 36000],
            baopai:     'm1',
            shoupai:    ['','m123p456s789z1234','','']
        };
        board.qipai(qipai);
        test('場風が設定されること', ()=>
            assert.equal(board.zhuangfeng, 1));
        test('局数が設定されること', ()=> assert.equal(board.jushu, 2));
        test('本場が設定されること', ()=> assert.equal(board.changbang, 3));
        test('供託が設定されること', ()=> assert.equal(board.lizhibang, 4));
        test('ドラが設定されること', ()=>
                                    assert.equal(board.shan.baopai[0], 'm1'));
        test('持ち点が設定されること', ()=> assert.equal(board.defen[0], 20000));
        test('手牌が設定されること', ()=>
                                    assert.equal(board.shoupai[1].toString(),
                                                 'm123p456s789z1234'));
        test('捨て牌が初期化されること', ()=>
                                assert.equal(board.he.map(he=>he._pai.length)
                                                     .reduce((x,y)=>x+y), 0));
        test('手番が初期化されること', ()=> assert.equal(board.lunban, -1));
    });

    suite('zimo(zimo)', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        test('手番が移動すること', ()=>
                assert.equal(board.lunban, 0));
        test('牌数が減ること', ()=>
                assert.equal(board.shan.paishu, 69));
        test('手牌にツモ牌が加えられること', ()=>
                assert.equal(board.shoupai[0].get_dapai().pop(), 'm1_'));
        test('伏せ牌をツモれること', ()=>{
            const board = init_board();
            board.zimo({ l: 0, p: '' });
            assert.ok(board.shoupai[0].get_dapai());
        });
        test('リーチ宣言後のツモでリーチが成立すること', ()=>{
            const board = init_board();
            board.zimo({ l: 0, p: 'm1' });
            board.dapai({ l: 0, p: 'm1_*' });
            board.zimo({ l: 1, p: 's9' });
            assert.equal(board.defen[board.player_id[0]], 9000);
            assert.equal(board.lizhibang, 5);
        });
        test('多牌となるツモができること', ()=>{
            const board = init_board();
            board.zimo({ l: 0, p: 'm1' });
            board.zimo({ l: 0, p: 'm2' });
        });
    });

    suite('dapai(dapai)', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        board.dapai({ l: 0, p: 'm1_' });
        test('手牌から打牌が切り出されること', ()=>
                assert.ifError(board.shoupai[0].get_dapai()));
        test('捨て牌に加えられること', ()=>
                assert.equal(board.he[0]._pai[0], 'm1_'));
        test('少牌となる打牌ができること', ()=>{
            const board = init_board();
            board.dapai({ l: 0, p: 'm1' });
        });
    });

    suite('fulou(fulou)', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        board.dapai({ l: 0, p: 'm1_' });
        board.fulou({ l: 2, m: 'm111=' });
        test('河から副露牌が拾われること', ()=>
                assert.equal(board.he[0]._pai[0], 'm1_='));
        test('手番が移動すること', ()=>
                assert.equal(board.lunban, 2));
        test('手牌が副露されること', ()=>
                assert.equal(board.shoupai[2]._fulou[0], 'm111='));
        test('リーチ宣言後の副露でリーチが成立すること', ()=>{
            const board = init_board();
            board.zimo({ l: 0, p: 'm1' });
            board.dapai({ l: 0, p: 'm1_*' });
            board.fulou({ l: 2, m: 'm111=' });
            assert.equal(board.defen[board.player_id[0]], 9000);
            assert.equal(board.lizhibang, 5);
        });
        test('多牌となる副露ができること', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        board.dapai({ l: 2, p: 'm1' });
        board.fulou({ l: 0, m: 'm111=' });
        });
    });

    suite('gang(gang)', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        board.gang({ l: 0, m: 'm1111' });
        test('手牌が副露されること', ()=>
                assert.equal(board.shoupai[0]._fulou[0], 'm1111'));
        test('少牌となるカンができること', ()=>{
            const board = init_board();
            board.gang({ l: 0, m: 'm1111' });
        });
    });

    suite('kaigang(kaigang)', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        board.gang({ l: 0, m: 'm1111' });
        board.kaigang({ baopai: 's9' });
        test('ドラが増えること', ()=>
                assert.equal(board.shan.baopai[1], 's9'));
    });

    suite('hule(hule)', ()=>{
        const board = init_board();
        board.zimo({ l: 0, p: 'm1' });
        board.hule({ l: 0, shoupai: 'm123p456s789z1122z2*', fubaopai: ['s9'] });
        test('和了者の手牌が設定されること', ()=>{
            assert.equal(board.shoupai[0], 'm123p456s789z1122z2*')
        });
        test('裏ドラを参照できること', ()=>
                assert.equal(board.shan.fubaopai[0], 's9'));
        test('ダブロンの際に持ち点の移動が反映されていること', ()=>{
            const board = init_board();
            board.zimo({ l: 1, p: '' });
            board.dapai({ l: 1, p: 'p4_' });
            board.hule({ l: 2, shoupai: 'm444678p44s33p4,s505=', baojia: 1,
                         fubaopai: null, fu: 30, fanshu: 2, defen: 2000,
                         hupai: [ { name: '断幺九', fanshu: 1 },
                                  { name: '赤ドラ', fanshu: 1 } ],
                         fenpei: [ 0, -2900, 6900, 0 ] });
            board.hule({ l: 0, shoupai: 'p06s12344p4,z777-,p333+', baojia: 1,
                         fubaopai: null, fu: 30, fanshu: 2, defen: 2900,
                         hupai: [ { name: '役牌 中', fanshu: 1 },
                                  { name: '赤ドラ', fanshu: 1 } ],
                         fenpei: [ 0, -2900, 2900, 0 ] });
            assert.equal(board.changbang, 0);
            assert.equal(board.lizhibang, 0);
            assert.deepEqual(board.defen, [ 17100, 36900, 36000, 10000 ]);
        });
    });

    suite('pingju(pingju)', ()=>{
        test('倒牌した手牌が設定されること', ()=>{
            const board = init_board();
            board.pingju({ name: '', shoupai: ['','m123p456s789z1122','','']});
            assert.equal(board.shoupai[1], 'm123p456s789z1122');
        });
        test('リーチ宣言後の流局でリーチが成立すること', ()=>{
            const board = init_board();
            board.zimo({ l: 0, p: 'm1' });
            board.dapai({ l: 0, p: 'm1_*' });
            board.pingju({ name: '荒牌平局', shoupai: [] });
            assert.equal(board.defen[board.player_id[0]], 9000);
            assert.equal(board.lizhibang, 5);
        });
        test('三家和の場合はリーチが成立しないこと', ()=>{
            const board = init_board();
            board.zimo({ l: 0, p: 'm1' });
            board.dapai({ l: 0, p: 'm1_*' });
            board.pingju({ name: '三家和', shoupai: [] });
            assert.equal(board.defen[board.player_id[0]], 10000);
            assert.equal(board.lizhibang, 4);
        });
    });

    suite('jieju(paipu)', ()=>{
        const board = init_board();
        board.lunban = 0;
        const paipu = {
            defen: [ 17100, 36900, 36000, 10000 ]
        };
        board.jieju(paipu);
        test('終局時の持ち点が反映されること', ()=>
                assert.deepEqual(board.defen, [ 17100, 36900, 36000, 10000 ]));
        test('手番が初期化されること', ()=> assert.equal(board.lunban, -1));
    });
});
