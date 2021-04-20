const assert = require('assert');

const Majiang = require('../');

function Shan(rule) {
    return new Majiang.Shan(Majiang.rule(rule));
}

suite('Majiang.Shan', ()=>{

    test('クラスが存在すること', ()=> assert.ok(Majiang.Shan));

    suite('static zhenbaopai(p)', ()=>{
        test('一萬 → 二萬', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('m1'), 'm2'));
        test('九萬 → 一萬', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('m9'), 'm1'));
        test('赤五萬 → 六萬', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('m0'), 'm6'));
        test('一筒 → 二筒', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('p1'), 'p2'));
        test('九筒 → 一筒', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('p9'), 'p1'));
        test('赤五筒 → 六筒', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('p0'), 'p6'));
        test('一索 → 二索', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('s1'), 's2'));
        test('九索 → 一索', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('s9'), 's1'));
        test('赤五索 → 六索', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('s0'), 's6'));
        test('東 → 南', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('z1'), 'z2'));
        test('北 → 東', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('z4'), 'z1'));
        test('白 → 發', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('z5'), 'z6'));
        test('中 → 白', ()=>
            assert.equal(Majiang.Shan.zhenbaopai('z7'), 'z5'));
        test('不正な牌 → エラー', ()=>
            assert.throws(()=>Majiang.Shan.zhenbaopai('z0')));
    });

    suite('constructor(rule)', ()=>{
        test('赤牌なしでインスタンスが生成できること', ()=>{
            const pai =
                'm1,m1,m1,m1,m2,m2,m2,m2,m3,m3,m3,m3,m4,m4,m4,m4,m5,m5,m5,m5,'
              + 'm6,m6,m6,m6,m7,m7,m7,m7,m8,m8,m8,m8,m9,m9,m9,m9,'
              + 'p1,p1,p1,p1,p2,p2,p2,p2,p3,p3,p3,p3,p4,p4,p4,p4,p5,p5,p5,p5,'
              + 'p6,p6,p6,p6,p7,p7,p7,p7,p8,p8,p8,p8,p9,p9,p9,p9,'
              + 's1,s1,s1,s1,s2,s2,s2,s2,s3,s3,s3,s3,s4,s4,s4,s4,s5,s5,s5,s5,'
              + 's6,s6,s6,s6,s7,s7,s7,s7,s8,s8,s8,s8,s9,s9,s9,s9,'
              + 'z1,z1,z1,z1,z2,z2,z2,z2,z3,z3,z3,z3,z4,z4,z4,z4,'
              + 'z5,z5,z5,z5,z6,z6,z6,z6,z7,z7,z7,z7';
            assert.equal(new Majiang.Shan({'赤牌':{m:0,p:0,s:0}})
                            ._pai.concat().sort().join(), pai);
        });
        test('赤牌ありでインスタンスが生成できること', ()=>{
            const pai =
                'm0,m1,m1,m1,m1,m2,m2,m2,m2,m3,m3,m3,m3,m4,m4,m4,m4,m5,m5,m5,'
              + 'm6,m6,m6,m6,m7,m7,m7,m7,m8,m8,m8,m8,m9,m9,m9,m9,'
              + 'p0,p0,p1,p1,p1,p1,p2,p2,p2,p2,p3,p3,p3,p3,p4,p4,p4,p4,p5,p5,'
              + 'p6,p6,p6,p6,p7,p7,p7,p7,p8,p8,p8,p8,p9,p9,p9,p9,'
              + 's0,s0,s0,s1,s1,s1,s1,s2,s2,s2,s2,s3,s3,s3,s3,s4,s4,s4,s4,s5,'
              + 's6,s6,s6,s6,s7,s7,s7,s7,s8,s8,s8,s8,s9,s9,s9,s9,'
              + 'z1,z1,z1,z1,z2,z2,z2,z2,z3,z3,z3,z3,z4,z4,z4,z4,'
              + 'z5,z5,z5,z5,z6,z6,z6,z6,z7,z7,z7,z7';
            assert.equal(new Majiang.Shan({'赤牌':{m:1,p:2,s:3}})
                            ._pai.concat().sort().join(), pai);
        });
    });

    suite('get paishu()', ()=>{
        test('牌山生成直後の残牌数は122', ()=>
            assert.equal(Shan().paishu, 122));
    });

    suite('get baopai()', ()=>{
        test('牌山生成直後のドラは1枚', ()=>
            assert.equal(Shan().baopai.length, 1));
    });

    suite('get fubaopai()', ()=>{
        test('牌山生成直後は null を返す', ()=>
            assert.ifError(Shan().fubaopai));
        test('牌山固定後は裏ドラを返す', ()=>
            assert.equal(Shan().close().fubaopai.length, 1));
        test('裏ドラなしの場合は牌山固定後も null を返す', ()=>
            assert.ifError(Shan({'裏ドラあり':false}).close().fubaopai));
    });

    suite('zimo()', ()=>{
        test('牌山生成直後にツモれること', ()=>
            assert.ok(Shan().zimo()));
        test('ツモ後に残牌数が減ること', ()=>{
            let shan = Shan();
            assert.equal(shan.paishu - 1, shan.zimo() && shan.paishu);
        });
        test('王牌はツモれないこと', ()=>{
            let shan = Shan();
            while (shan.paishu) { shan.zimo() }
            assert.throws(()=>shan.zimo());
        });
        test('牌山固定後はツモれないこと', ()=>
            assert.throws(()=>Shan().close().zimo()));
    });

    suite('gangzimo()', ()=>{
        test('牌山生成直後に槓ツモできること', ()=>
            assert.ok(Shan().gangzimo()));
        test('槓ツモ後に残牌数が減ること', ()=>{
            let shan = Shan();
            assert.equal(shan.paishu - 1, shan.gangzimo() && shan.paishu);
        });
        test('槓ツモ直後はツモれないこと', ()=>{
            let shan = Shan();
            assert.throws(()=>shan.gangzimo() && shan.zimo());
        });
        test('槓ツモ直後に続けて槓ツモできないこと', ()=>{
            let shan = Shan();
            assert.throws(()=>shan.gangzimo() && shan.gangzimo());
        });
        test('ハイテイで槓ツモできないこと', ()=>{
            let shan = Shan();
            while (shan.paishu) { shan.zimo() }
            assert.throws(()=>shan.gangzimo());
        });
        test('牌山固定後は槓ツモできないこと', ()=>
            assert.throws(()=>Shan().close().gangzimo()));
        test('5つ目の槓ツモができないこと', ()=>{
            let shan = Shan();
            for (let i = 0; i < 4; i++) {
                shan.gangzimo();
                shan.kaigang();
            }
            assert.throws(()=>shan.gangzimo());
        });
        test('カンドラなしでも5つ目の槓ツモができないこと', ()=>{
            let shan = Shan({'カンドラあり':false});
            for (let i = 0; i < 4; i++) {
                shan.gangzimo();
            }
            assert.equal(shan.baopai.length, 1);
            assert.throws(()=>shan.gangzimo());
        });
    });

    suite('kaigang()', ()=>{
        test('牌山生成直後に開槓できないこと', ()=>
            assert.throws(()=>Shan().kaigang()));
        test('槓ツモ後に開槓できること', ()=>{
            let shan = Shan();
            assert.ok(shan.gangzimo() && shan.kaigang());
        });
        test('開槓によりドラが増えること', ()=>{
            let shan = Shan();
            shan.gangzimo();
            assert.equal(shan.baopai.length + 1,
                         shan.kaigang().baopai.length);
        });
        test('開槓により裏ドラが増えること', ()=>{
            let shan = Shan();
            shan.gangzimo();
            assert.equal(shan.kaigang().close().fubaopai.length, 2);
        });
        test('開槓後はツモできること', ()=>{
            let shan = Shan();
            shan.gangzimo();
            assert.ok(shan.kaigang().zimo());
        });
        test('開槓後は槓ツモできること', ()=>{
            let shan = Shan();
            shan.gangzimo();
            assert.ok(shan.kaigang().gangzimo());
        });
        test('牌山固定後は開槓できないこと', ()=>{
            let shan = Shan();
            shan.gangzimo();
            assert.throws(()=>shan.close().kaigang());
        });
        test('カンドラなしの場合は開槓できないこと', ()=>{
            let shan = Shan({'カンドラあり':false});
            shan.gangzimo();
            assert.throws(()=>shan.kaigang());
        });
        test('カン裏なしの場合は開槓で裏ドラが増えないこと', ()=>{
            let shan = Shan({'カン裏あり':false});
            shan.gangzimo();
            assert.equal(shan.kaigang().close().fubaopai.length, 1);
        });
        test('裏ドラなしの場合は開槓で裏ドラ発生しないこと', ()=>{
            let shan = Shan({'裏ドラあり':false});
            shan.gangzimo();
            assert.ifError(shan.kaigang().close().fubaopai);
        });
    });
});
