const assert = require('assert');

const Majiang = require('../');

suite('Majiang.He', ()=>{

    test('クラスが存在すること', ()=> assert.ok(Majiang.He));

    suite('constructor()', ()=>{
        test('インスタンスが生成できること', ()=> assert.ok(new Majiang.He()));
        test('インスタンス生成時は捨て牌の長さが0であること', ()=>
            assert.equal(new Majiang.He()._pai.length, 0));
    });

    suite('dapai(p)', ()=>{
        test('不正な打牌ができないこと', ()=>
            assert.throws(()=>new Majiang.He().dapai('z8')));
        test('打牌後捨て牌の長さが1増えること', ()=>{
            let he = new Majiang.He();
            assert.equal(he._pai.length + 1, he.dapai('m1')._pai.length);
        });
        test('ツモ切りを表現できること', ()=>
            assert.equal(new Majiang.He().dapai('m1_')._pai.pop(), 'm1_'));
        test('リーチを表現できること', ()=>
            assert.equal(new Majiang.He().dapai('m1*')._pai.pop(), 'm1*'));
        test('ツモ切りリーチを表現できること', ()=>
            assert.equal(new Majiang.He().dapai('m1_*')._pai.pop(), 'm1_*'));
    });

    suite('fulou(m)', ()=>{
        test('不正な面子で鳴けないこと', ()=>{
            assert.throws(()=>new Majiang.He().dapai('m1').fulou('m1-'));
            assert.throws(()=>new Majiang.He().dapai('m1').fulou('m1111'));
            assert.throws(()=>new Majiang.He().dapai('m1').fulou('m12-3'));
        });
        test('鳴かれても捨て牌の長さが変わらないこと', ()=>{
            let he = new Majiang.He().dapai('m1_');
            assert.equal(he._pai.length, he.fulou('m111+')._pai.length);
        });
        test('誰から鳴かれたか表現できること', ()=>{
            let he = new Majiang.He().dapai('m2*');
            assert.equal(he.fulou('m12-3')._pai.pop(), 'm2*-');
        });
    });

    suite('find(p)', ()=>{
        let he = new Majiang.He();
        test('捨てられた牌を探せること', ()=>
            assert.ok(he.dapai('m1').find('m1')));
        test('ツモ切りの牌を探せること', ()=>
            assert.ok(he.dapai('m2_').find('m2')));
        test('リーチ打牌を探せること', ()=>
            assert.ok(he.dapai('m3*').find('m3')));
        test('赤牌を探せること', ()=>
            assert.ok(he.dapai('m0').find('m5')));
        test('鳴かれた牌を探せること', ()=>
            assert.ok(he.dapai('m4_').fulou('m234-').find('m4')));
        test('入力が正規化されていない場合でも探せること', ()=>
            assert.ok(he.find('m0_*')));
    });
});
