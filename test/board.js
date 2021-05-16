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
        defen:      [10000, 20000, 30000, 40000],
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
            defen:      [10000, 20000, 30000, 40000],
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
        board.hule({ fubaopai: ['s9'] });
        test('裏ドラを参照できること', ()=>
                assert.equal(board.shan.fubaopai[0], 's9'));
    });
});
