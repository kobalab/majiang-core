const assert = require('assert');

const Majiang = require('../');

const data = require('./data/hule.json');

const param = Majiang.Util.hule_param;

suite('Majiang.Util', ()=>{

    suite('hule_mianzi(shoupai, rongpai)', ()=>{
        test('一般手(ツモ和了)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m123p055s789z11122'), null),
                [ ['z22_!','m123','p555','s789','z111'] ]));
        test('一般手(ロン和了)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m123p055s789z1112'), 'z2+'),
                [ ['z22+!','m123','p555','s789','z111'] ]));
        test('一般手(副露あり)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m123p055z1112,s7-89'), 'z2='),
                [ ['z22=!','m123','p555','z111','s7-89'] ]));
        test('七対子形', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m225p4466s1199z33'), 'm0-'),
                [ ['m22','m55-!','p44','p66','s11','s99','z33'] ]));
        test('国士無双形(ツモ)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m9p19s19z12345677m1'), null),
                [ ['z77','m1_!','m9','p1','p9','s1','s9',
                   'z1','z2','z3','z4','z5','z6'] ]));
        test('国士無双形(13面待ちロン)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m19p19s19z1234567'), 'm9+'),
                [ ['m99+!','m1','p1','p9','s1','s9',
                   'z1','z2','z3','z4','z5','z6','z7'] ]));
        test('九蓮宝燈形', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m1112345678999'), 'm0='),
                [ ['m55=!','m111','m234','m678','m999'],
                  ['m11123456789995=!'] ]));
        test('和了形以外(少牌)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m123p055s789z1122')),
                []));
        test('和了形以外(三面子)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('___m123p055z2,s7-89'), 'z2='),
                []));
        test('和了形以外(一対子)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m22')),
                []));
        test('和了形以外(国士無双テンパイ)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m19p19s19z123456'), 'z7='),
                []));
        test('和了形以外(九蓮宝燈テンパイ)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m111234567899'), 'm9='),
                []));
        test('複数の和了形としない(順子優先)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m111123p789999z1z1'), null),
                [ ['z11_!','m123','m111','p789','p999'] ]));
        test('複数の和了形(二盃口か七対子か)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m223344p556677s88')),
                [ ['s88_!','m234','m234','p567','p567'],
                  ['m22','m33','m44','p55','p66','p77','s88_!'] ]));
        test('複数の和了形(順子か刻子か)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m111222333p89997')),
                [ ['p99','m123','m123','m123','p7_!89'],
                  ['p99','m111','m222','m333','p7_!89'] ]));
        test('複数の和了形(雀頭の選択、平和かサンショクか)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m2234455p234s234m3')),
                [ ['m22','m3_!45','m345','p234','s234'],
                  ['m55','m23_!4','m234','p234','s234'] ]));
        test('複数の和了形(暗刻を含む形)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('m23p567s33345666m1')),
                [ ['s33','m1_!23','p567','s345','s666'],
                  ['s66','m1_!23','p567','s333','s456'] ]));
        test('複数の和了形(九蓮宝燈形)', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('s1113445678999s2')),
                [ ['s99','s111','s2_!34','s456','s789'],
                  ['s11134456789992_!'] ]));
        test('バグ: 暗槓しているの5枚目の牌で和了', ()=>
            assert.deepEqual(
                Majiang.Util.hule_mianzi(
                    Majiang.Shoupai.fromString('s4067999z444s8,s8888')),
                [ ['s99','s456','s78_!9','z444','s8888'] ]));
    });

    suite('hule(shoupai, rongpai, param)', ()=>{

        let hule;

        test('パラメータ不正', ()=>{
            assert.throws(()=>{
                Majiang.Util.hule(Majiang.Shoupai.fromString(), 'm1', param());
            });
        });

        test('和了形以外', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(), null, param());
            assert.ifError(hule);
        });

        test('符計算: 平和ツモは20符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567p234s33789'),
                        null, param());
            assert.equal(hule.fu, 20);
        });
        test('符計算: 平和ロンは30符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567p234s3378'),
                        's9=', param());
            assert.equal(hule.fu, 30);
        });
        test('符計算: オタ風の雀頭に符はつかない', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m112233p456z33s78'),
                        's9=', param());
            assert.equal(hule.fu, 30);
        });
        test('符計算: 場風の雀頭は2符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m112233p456z11s78'),
                        's9=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 自風の雀頭は2符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m112233p456z22s78'),
                        's9=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 三元牌の雀頭は2符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m112233p456z55s78'),
                        's9=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 連風牌の雀頭は4符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m112233z444z11s78'),
                        's9=', param({menfeng:0}));
            assert.equal(hule.fu, 50);
        });
        test('符計算: 中張牌の明刻は2符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m123z11m88,p888+,s888-'),
                        'm8=', param({menfeng:0}));
            assert.equal(hule.fu, 30);
        });
        test('符計算: 幺九牌の明刻は4符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m123p22s99,z222+,p111-'),
                        's9=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 中張牌の暗刻は4符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33p222777s888m23'),
                        'm4=', param());
            assert.equal(hule.fu, 50);
        });
        test('符計算: 幺九牌の暗刻は8符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s33p111999z555m23'),
                        'm4=', param());
            assert.equal(hule.fu, 60);
        });
        test('符計算: 中張牌の明槓は8符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33m22245667,s444+4'),
                        'm8=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 幺九牌の明槓は16符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33m23445667,z6666-'),
                        'm8=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 中張牌の暗槓は16符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33m23445667,s4444'),
                        'm8=', param());
            assert.equal(hule.fu, 50);
        });
        test('符計算: 幺九牌の暗槓は32符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33m23445667,z7777'),
                        'm8=', param());
            assert.equal(hule.fu, 70);
        });
        test('符計算: ツモ和了は2符加算', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33m222s222345,s888-'),
                        null, param());
                        assert.equal(hule.fu, 40);
        });
        test('符計算: 単騎待ちは2符加算', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m222s222345p3,s888-'),
                        'p3=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 嵌張待ちは2符加算', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33m222s22235,s888-'),
                        's4=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 辺張待ちは2符加算', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p33z111m12389,s222-'),
                        'm7=', param());
            assert.equal(hule.fu, 40);
        });
        test('符計算: 喰い平和は30符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22p345678s34,s67-8'),
                        's5=', param());
            assert.equal(hule.fu, 30);
        });
        test('符計算: 七対子は25符', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m2255p88s1166z1155'),
                        null, param());
            assert.equal(hule.fu, 25);
        });
        test('符計算: 国士無双は符なし', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m19p19s1z12345677s9'),
                        null, param());
            assert.ifError(hule.fu);
        });
        test('符計算: 九蓮宝燈は符なし', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11123456789995'),
                        null, param());
            assert.ifError(hule.fu);
        });

        test('和了役: 役なし', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66'),
                        's3=', param());
            assert.ifError(hule.hupai);
        });

        test('和了役: 立直', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66*'),
                        's3=', param({lizhi:1}));
            assert.deepEqual(hule.hupai, [{ name: '立直', fanshu: 1 }]);
        });
        test('和了役: ダブル立直', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66*'),
                        's3=', param({lizhi:2}));
            assert.deepEqual(hule.hupai, [{ name: 'ダブル立直', fanshu: 2 }]);
        });
        test('和了役: 立直・一発', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66*'),
                        's3=', param({lizhi:1, yifa:true}));
            assert.deepEqual(hule.hupai, [{ name: '立直', fanshu: 1 },
                                          { name: '一発', fanshu: 1 }]);
        });
        test('和了役: 海底摸月', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24z66s3,s6-78'),
                        null, param({haidi:1}));
            assert.deepEqual(hule.hupai, [{ name: '海底摸月', fanshu: 1 }]);
        });
        test('和了役: 河底撈魚', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66'),
                        's3=', param({haidi:2}));
            assert.deepEqual(hule.hupai, [{ name: '河底撈魚', fanshu: 1 }]);
        });
        test('和了役: 嶺上開花', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24z66s3,s777+7'),
                        null, param({lingshang:true}));
            assert.deepEqual(hule.hupai, [{ name: '嶺上開花', fanshu: 1 }]);
        });
        test('和了役: 槍槓', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66'),
                        's3=', param({qianggang:true}));
            assert.deepEqual(hule.hupai, [{ name: '槍槓', fanshu: 1 }]);
        });
        test('和了役: 天和', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66s3'),
                        null, param({tianhu:1}));
            assert.deepEqual(hule.hupai, [{ name: '天和', fanshu: '*' }]);
        });
        test('和了役: 地和', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66s3'),
                        null, param({tianhu:2}));
            assert.deepEqual(hule.hupai, [{ name: '地和', fanshu: '*' }]);
        });

        test('和了役: 門前清自摸和', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66s3'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '門前清自摸和', fanshu: 1 }]);
        });
        test('和了役: 場風 東', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567s3378z111'),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 }]);
        });
        test('和了役: 自風 西', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567s33789,z333+'),
                        null, param({menfeng:2}));
            assert.deepEqual(hule.hupai, [{ name: '自風 西', fanshu: 1 }]);
        });
        test('和了役: 連風牌 南', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567s33z22,s789-'),
                        'z2=', param({zhuangfeng:1}));
            assert.deepEqual(hule.hupai, [{ name: '場風 南', fanshu: 1 },
                                          { name: '自風 南', fanshu: 1 }]);
        });
        test('和了役: 翻牌 白', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567s33789,z555+5'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '翻牌 白', fanshu: 1 }]);
        });
        test('和了役: 翻牌 發・中', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m345567s33,z6666+,z7777'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '翻牌 發', fanshu: 1 },
                                          { name: '翻牌 中', fanshu: 1 }]);
        });
        test('和了役: 平和', ()=>{
            hule = Majiang.Util.hule(
                    Majiang.Shoupai.fromString('z33m234456p78s123'),
                    'p9=', param());
            assert.deepEqual(hule.hupai, [{ name: '平和', fanshu: 1 }]);
        });
        test('和了役: 平和・ツモ', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m234456p78s123p9'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '門前清自摸和', fanshu: 1 },
                                          { name: '平和', fanshu: 1 }]);
        });
        test('和了役: 喰い平和(役なし)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m234456p78,s1-23'),
                        'p9=', param());
            assert.ifError(hule.hupai);
        });
        test('和了役: 断幺九', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22555p234s78,p777-'),
                        's6=', param());
            assert.deepEqual(hule.hupai, [{ name: '断幺九', fanshu: 1 }]);
        });
        test('和了役: 断幺九(七対子形)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m2255p4488s33667'),
                        's7=', param());
            assert.deepEqual(hule.hupai, [{ name: '断幺九', fanshu: 1 },
                                          { name: '七対子', fanshu: 2 }]);
        });
        test('和了役: 一盃口', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m33455p111s33789'),
                        'm4=', param());
            assert.deepEqual(hule.hupai, [{ name: '一盃口', fanshu: 1 }]);
        });
        test('和了役: 喰い一盃口(役なし)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m33455p111s33,s78-9'),
                        'm4=', param());
            assert.ifError(hule.hupai);
        });
        test('和了役: 三色同順', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m567p567s2256799'),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '三色同順', fanshu: 2 }]);
        });
        test('和了役: 三色同順(喰い下がり)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m567s2256799,p56-7'),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '三色同順', fanshu: 1 }]);
        });
        test('和了役: 一気通貫', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m12456789s33789'),
                        'm3=', param());
            assert.deepEqual(hule.hupai, [{ name: '一気通貫', fanshu: 2 }]);
        });
        test('和了役: 一気通貫(喰い下がり)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m12789s33789,m4-56'),
                        'm3=', param());
            assert.deepEqual(hule.hupai, [{ name: '一気通貫', fanshu: 1 }]);
        });
        test('和了役: 混全帯幺九', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m123999p789z33s12'),
                        's3=', param());
            assert.deepEqual(hule.hupai, [{ name: '混全帯幺九', fanshu: 2 }]);
        });
        test('和了役: 混全帯幺九(喰い下がり)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m123p789z33s12,m999+'),
                        's3=', param());
            assert.deepEqual(hule.hupai, [{ name: '混全帯幺九', fanshu: 1 }]);
        });
        test('和了役: 七対子', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m115599p2233s8z22'),
                        's8=', param());
            assert.deepEqual(hule.hupai, [{ name: '七対子', fanshu: 2 }]);
        });
        test('和了役: 対々和', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m55888z333s22,p111='),
                        's2=', param());
            assert.deepEqual(hule.hupai, [{ name: '対々和', fanshu: 2 }]);
        });
        test('和了役: 三暗刻', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p99s111m555,p345-,s3333'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '三暗刻', fanshu: 2 }]);
        });
        test('和了役: 三槓子', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                                'p11m45,s2222+,m888=8,z4444'),
                        'm3=', param());
            assert.deepEqual(hule.hupai, [{ name: '三槓子', fanshu: 2 }]);
        });
        test('和了役: 三色同刻', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s12377m22,p222-,s222-'),
                        'm2=', param());
            assert.deepEqual(hule.hupai, [{ name: '三色同刻', fanshu: 2 }]);
        });
        test('和了役: 混老頭(対々和形)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z11p11199,m111=,z333+'),
                        'p9=', param());
            assert.deepEqual(hule.hupai, [{ name: '対々和', fanshu: 2 },
                                          { name: '混老頭', fanshu: 2 }]);
        });
        test('和了役: 混老頭(七対子形)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1199p11s99z11335'),
                        'z5=', param());
            assert.deepEqual(hule.hupai, [{ name: '七対子', fanshu: 2 },
                                          { name: '混老頭', fanshu: 2 }]);
        });
        test('和了役: 小三元', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z55577m567p22,z666-'),
                        'p2=', param());
            assert.deepEqual(hule.hupai, [{ name: '翻牌 白', fanshu: 1 },
                                          { name: '翻牌 發', fanshu: 1 },
                                          { name: '小三元',  fanshu: 2 }]);
        });
        test('和了役: 混一色', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m111234789z1133'),
                        'z3=', param());
            assert.deepEqual(hule.hupai, [{ name: '混一色', fanshu: 3 }]);
        });
        test('和了役: 混一色(喰い下がり)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z11333p23478,p111+'),
                        'p9=', param());
            assert.deepEqual(hule.hupai, [{ name: '混一色', fanshu: 2 }]);
        });
        test('和了役: 混一色(七対子形)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s11224488z22557'),
                        'z7=', param());
            assert.deepEqual(hule.hupai, [{ name: '七対子', fanshu: 2 },
                                          { name: '混一色', fanshu: 3 }]);
        });
        test('和了役: 純全帯幺九', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11s123p789s789m99'),
                        'm9=', param());
            assert.deepEqual(hule.hupai, [{ name: '純全帯幺九', fanshu: 3 }]);
        });
        test('和了役: 純全帯幺九(喰い下がり)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11s123p789s78,m999='),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '純全帯幺九', fanshu: 2 }]);
        });
        test('和了役: 二盃口', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m223344p667788s9'),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '二盃口', fanshu: 3 }]);
        });
        test('和了役: 二盃口(4枚使い)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m222233334444s9'),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '二盃口', fanshu: 3 }]);
        });
        test('和了役: 喰い二盃口(役なし)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m223344p678s9,p678-'),
                        's9=', param());
            assert.ifError(hule.hupai);
        });
        test('和了役: 清一色', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1113456677778'),
                        'm9=', param());
            assert.deepEqual(hule.hupai, [{ name: '清一色', fanshu: 6 }]);
        });
        test('和了役: 清一色(喰い下がり)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p2344555,p12-3,p7-89'),
                        'p1=', param());
            assert.deepEqual(hule.hupai, [{ name: '清一色', fanshu: 5 }]);
        });
        test('和了役: 清一色(七対子形)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s1122445577889'),
                        's9=', param());
            assert.deepEqual(hule.hupai, [{ name: '七対子', fanshu: 2 },
                                          { name: '清一色', fanshu: 6 }]);
        });
        test('和了役: 国士無双', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m119p19s19z1234567'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '国士無双', fanshu: '*' }]);
        });
        test('和了役: 国士無双十三面', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m19p19s19z1234567m1'),
                        null, param());
            assert.deepEqual(hule.hupai,
                                    [{ name: '国士無双十三面', fanshu: '**' }]);
        });
        test('和了役: 四暗刻', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m33m111p333s777z111'),
                        null, param());
            assert.deepEqual(hule.hupai, [{ name: '四暗刻', fanshu: '*' }]);
        });
        test('和了役: 四暗刻単騎', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m111p333s777z111m3'),
                        'm3=', param());
            assert.deepEqual(hule.hupai, [{ name: '四暗刻単騎', fanshu: '**' }]);
        });
        test('和了役: 大三元', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z555m456p22z66,z777+'),
                        'z6=', param());
            assert.deepEqual(hule.hupai, [{ name: '大三元', fanshu: '*'}]);
        });
        test('和了役: 大三元(パオ)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m2234,z555-5,z6666,z777+'),
                        'm5=', param());
            assert.deepEqual(hule.hupai,
                                [{ name: '大三元', fanshu: '*', baojia: '+' }]);
        });
        test('和了役: 小四喜', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m234z2244,z333+,z111-'),
                        'z4=', param());
            assert.deepEqual(hule.hupai, [{ name: '小四喜', fanshu: '*' }]);
        });
        test('和了役: 大四喜', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22z22244,z333+,z111-'),
                        'z4=', param());
            assert.deepEqual(hule.hupai, [{ name: '大四喜', fanshu: '**'}]);
        });
        test('和了役: 大四喜(パオ)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                                'm2,z222+,z4444,z333+,z111-'),
                        'm2=', param());
            assert.deepEqual(hule.hupai,
                                [{ name: '大四喜', fanshu: '**', baojia: '-' }]);
        });
        test('和了役: 字一色', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z1112277,z555=,z444+'),
                        'z7=', param());
            assert.deepEqual(hule.hupai, [{ name: '字一色', fanshu: '*' }]);
        });
        test('和了役: 字一色(七対子形)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z1122334455667'),
                        'z7=', param());
            assert.deepEqual(hule.hupai, [{ name: '字一色', fanshu: '*' }]);
        });
        test('和了役: 緑一色', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s22334466z66,s888+'),
                        'z6=', param());
            assert.deepEqual(hule.hupai, [{ name: '緑一色', fanshu: '*' }]);
        });
        test('和了役: 緑一色(發なし)', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s4466,s222=,s333+,s888-'),
                        's6=', param());
            assert.deepEqual(hule.hupai, [{ name: '緑一色', fanshu: '*' }]);
        });
        test('和了役: 清老頭', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s11p111m11,s999-,m999='),
                        'm1=', param());
            assert.deepEqual(hule.hupai, [{ name: '清老頭', fanshu: '*' }]);
        });
        test('和了役: 四槓子', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                            'm1,z5555,p222+2,p777-7,s1111-'),
                        'm1=', param());
            assert.deepEqual(hule.hupai, [{ name: '四槓子', fanshu: '*' }]);
        });
        test('和了役: 九蓮宝燈', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1112235678999'),
                        'm4=', param());
            assert.deepEqual(hule.hupai, [{ name: '九蓮宝燈', fanshu: '*' }]);
        });
        test('和了役: 純正九蓮宝燈', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1112345678999'),
                        'm2=', param());
            assert.deepEqual(hule.hupai,
                                    [{ name: '純正九蓮宝燈', fanshu: '**' }]);
        });

        test('ドラ: ドラなし', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m234s78,m4-56,z111+'),
                        's9=', param({baopai:['s1']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 }]);
        });
        test('ドラ: 手牌内: 1', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m234s78,m4-56,z111+'),
                        's9=', param({baopai:['m2']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: 'ドラ',    fanshu: 1 }]);
        });
        test('ドラ: 手牌内: 2', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m234s78,m4-56,z111+'),
                        's9=', param({baopai:['p4']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: 'ドラ',    fanshu: 2 }]);
        });
        test('ドラ: 手牌内: 1, 副露内: 1', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m23s789,m4-56,z111+'),
                        'm4=', param({baopai:['m3']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: 'ドラ',    fanshu: 2 }]);
        });
        test('ドラ: 槓ドラ: 1', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m234s78,m4-56,z111+'),
                        's9=', param({baopai:['s1','m2']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: 'ドラ',    fanshu: 1 }]);
        });
        test('ドラ: 赤ドラ: 2', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p50m234s78,m4-06,z111+'),
                        's9=', param({baopai:['s1']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: '赤ドラ',  fanshu: 2 }]);
        });
        test('ドラ: 赤のダブドラ', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m234s78,m4-06,z111+'),
                        's9=', param({baopai:['m4']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: 'ドラ',    fanshu: 1 },
                                          { name: '赤ドラ',  fanshu: 1 }]);
        });
        test('ドラ: ドラ表示牌が赤牌', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p55m234s78,m4-56,z111+'),
                        's9=', param({baopai:['m0']}));
            assert.deepEqual(hule.hupai, [{ name: '場風 東', fanshu: 1 },
                                          { name: 'ドラ',    fanshu: 1 }]);
        });
        test('ドラ: 裏ドラなし', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66*'),
                        's3=', param({lizhi:1, baopai:['s9'],
                                      fubaopai:['s9']}));
            assert.deepEqual(hule.hupai, [{ name: '立直',   fanshu: 1 }]);
        });
        test('ドラ: 裏ドラ: 1', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66*'),
                        's3=', param({lizhi:1, baopai:['s9'],
                                      fubaopai:['m2']}));
            assert.deepEqual(hule.hupai, [{ name: '立直',   fanshu: 1 },
                                          { name: '裏ドラ', fanshu: 1 }]);
        });
        test('ドラ: ドラ: 1, 裏ドラ: 1', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66*'),
                        's3=', param({lizhi:1, baopai:['m2'],
                                      fubaopai:['m2']}));
            assert.deepEqual(hule.hupai, [{ name: '立直',   fanshu: 1 },
                                          { name: 'ドラ',   fanshu: 1 },
                                          { name: '裏ドラ', fanshu: 1 }]);
        });
        test('ドラ: ドラのみでの和了は不可', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m344556s24678z66'),
                        's3=', param({baopai:['m2']}));
            assert.ifError(hule.hupai);
        });
        test('ドラ: 役満にドラはつかない', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m119p19s19z1234567'),
                        null, param({baopai:['m9']}));
            assert.deepEqual(hule.hupai, [{ name: '国士無双', fanshu: '*' }]);
        });

        test('点計算: 20符 2翻 子 ツモ → 400/700', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m123p456s789m234'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '平和',       fanshu: 1 }],
                          fu: 20, fanshu: 2, damanguan: null, defen: 1500,
                          fenpei: [  -700,  1500,  -400,  -400]});
        });
        test('点計算: 20符 3翻 親 ツモ → 1300∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m123p456s789m231'),
                        null, param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '平和',       fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 }],
                          fu: 20, fanshu: 3, damanguan: null, defen: 3900,
                          fenpei: [  3900, -1300, -1300, -1300]});
        });
        test('点計算: 20符 4翻 子 ツモ → 1300/2600', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m123p234s234m234'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '平和',       fanshu: 1 },
                                  { name: '三色同順',    fanshu: 2 }],
                          fu: 20, fanshu: 4, damanguan: null, defen: 5200,
                          fenpei: [ -2600,  5200, -1300, -1300]});
        });
        test('点計算: 25符 2翻 子 ロン → 1600', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1122p3344s5566z7'),
                        'z7-', param({lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '七対子', fanshu: 2 }],
                          fu: 25, fanshu: 2, damanguan: null, defen: 1600,
                          fenpei: [ -1900,  2900,     0,     0]});
        });
        test('点計算: 25符 3翻 親 ツモ → 1600∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1122p3344s5566z77'),
                        null, param({menfeng:0,lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '七対子',      fanshu: 2 }],
                          fu: 25, fanshu: 3, damanguan: null, defen: 4800,
                          fenpei: [  6100, -1700, -1700, -1700]});
        });
        test('点計算: 25符 4翻 子 ツモ → 1600/3200', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m2277p3344s556688'),
                        null, param({lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '断幺九',      fanshu: 1 },
                                  { name: '七対子',      fanshu: 2 }],
                          fu: 25, fanshu: 4, damanguan: null, defen: 6400,
                          fenpei: [ -3300,  7700, -1700, -1700]});
        });
        test('点計算: 30符 1翻 親 ロン → 1500', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m77234p456s67,m34-5'),
                        's8=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '断幺九', fanshu: 1 }],
                          fu: 30, fanshu: 1, damanguan: null, defen: 1500,
                          fenpei: [  1500,     0, -1500,     0]});
        });
        test('点計算: 30符 2翻 子 ロン → 2000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m77234p345s34,m34-5'),
                        's5-', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '断幺九',    fanshu: 1 },
                                  { name: '三色同順',  fanshu: 1 }],
                          fu: 30, fanshu: 2, damanguan: null, defen: 2000,
                          fenpei: [ -2000,  2000,     0,     0]});
        });
        test('点計算: 30符 3翻 親 ツモ → 2000∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22z111p445566s789'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '自風 東',     fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 }],
                          fu: 30, fanshu: 3, damanguan: null, defen: 6000,
                          fenpei: [  6000, -2000, -2000, -2000]});
        });
        test('点計算: 30符 4翻 子 ツモ → 2000/3900', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11z111p123789s789'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '場風 東',     fanshu: 1 },
                                  { name: '混全帯幺九',   fanshu: 2 }],
                          fu: 30, fanshu: 4, damanguan: null, defen: 7900,
                          fenpei: [ -3900,  7900, -2000, -2000]});
        });
        test('点計算: 40符 1翻 親 ロン → 2000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11234234p456s89'),
                        's7=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '一盃口', fanshu: 1 }],
                          fu: 40, fanshu: 1, damanguan: null, defen: 2000,
                          fenpei: [  2000,     0, -2000,     0]});
        });
        test('点計算: 40符 2翻 子 ロン → 2600', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22334455p456s68'),
                        's7-', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '断幺九',    fanshu: 1 },
                                  { name: '一盃口',    fanshu: 1 }],
                          fu: 40, fanshu: 2, damanguan: null, defen: 2600,
                          fenpei: [ -2600,  2600,     0,     0]});
        });
        test('点計算: 40符 3翻 親 ツモ → 2600∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33222m222,s222=,p999+'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '対々和',      fanshu: 2 }],
                          fu: 40, fanshu: 3, damanguan: null, defen: 7800,
                          fenpei: [  7800, -2600, -2600, -2600]});
        });
        test('点計算: 40符 4翻 子 ツモ → 2000/4000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33222m222,s222=,p999+'),
                        null, param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 },
                                  { name: '対々和',      fanshu: 2 }],
                          fu: 40, fanshu: 4, damanguan: null, defen: 8000,
                          fenpei: [ -4000,  8000, -2000, -2000]});
        });
        test('点計算: 50符 1翻 親 ロン → 2400', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m123p456s789z2227'),
                        'z7=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 }],
                          fu: 50, fanshu: 1, damanguan: null, defen: 2400,
                          fenpei: [  2400,     0, -2400,     0]});
        });
        test('点計算: 50符 2翻 子 ロン → 3200', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m123p456s789z2227'),
                        'z7-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 }],
                          fu: 50, fanshu: 2, damanguan: null, defen: 3200,
                          fenpei: [ -3200,  3200,     0,     0]});
        });
        test('点計算: 50符 3翻 親 ツモ → 3200∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m222z222,p8888,s789-'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '三暗刻',      fanshu: 2 }],
                          fu: 50, fanshu: 3, damanguan: null, defen: 9600,
                          fenpei: [  9600, -3200, -3200, -3200]});
        });
        test('点計算: 50符 4翻 子 ツモ → 2000/4000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z33m222z222,p8888,s789-'),
                        null, param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 },
                                  { name: '三暗刻',      fanshu: 2 }],
                          fu: 50, fanshu: 4, damanguan: null, defen: 8000,
                          fenpei: [ -4000,  8000, -2000, -2000]});
        });
        test('点計算: 60符 1翻 親 ロン → 2900', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s789z2227,m2222,p111='),
                        'z7=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 }],
                          fu: 60, fanshu: 1, damanguan: null, defen: 2900,
                          fenpei: [  2900,     0, -2900,     0]});
        });
        test('点計算: 60符 2翻 子 ロン → 3900', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s789z2227,m2222,p111='),
                        'z7-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 }],
                          fu: 60, fanshu: 2, damanguan: null, defen: 3900,
                          fenpei: [ -3900,  3900,     0,     0]});
        });
        test('点計算: 60符 3翻 親 ツモ → 3900∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11222789,z2222,m444='),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '混一色',      fanshu: 2 }],
                          fu: 60, fanshu: 3, damanguan: null, defen: 11700,
                          fenpei: [ 11700, -3900, -3900, -3900]});
        });
        test('点計算: 60符 4翻 子 ツモ → 2000/4000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11222789,z2222,m444='),
                        null, param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 },
                                  { name: '混一色',      fanshu: 2 }],
                          fu: 60, fanshu: 4, damanguan: null, defen: 8000,
                          fenpei: [ -4000,  8000, -2000, -2000]});
        });
        test('点計算: 70符 1翻 親 ロン → 3400', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m12377p456s78,z2222'),
                        's9=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 }],
                          fu: 70, fanshu: 1, damanguan: null, defen: 3400,
                          fenpei: [  3400,     0, -3400,     0]});
        });
        test('点計算: 70符 2翻 子 ロン → 4500', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m12377p456s78,z2222'),
                        's9-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 }],
                          fu: 70, fanshu: 2, damanguan: null, defen: 4500,
                          fenpei: [ -4500,  4500,     0,     0]});
        });
        test('点計算: 70符 3翻 親 ツモ → 4000∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p77s223344,z2222,m2222'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '場風 南',     fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 }],
                          fu: 70, fanshu: 3, damanguan: null, defen: 12000,
                          fenpei: [ 12000, -4000, -4000, -4000]});
        });
        test('点計算: 80符 1翻 親 ロン → 3900', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22s888p34,z222+2,z4444'),
                        'p5=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 }],
                          fu: 80, fanshu: 1, damanguan: null, defen: 3900,
                          fenpei: [  3900,     0, -3900,     0]});
        });
        test('点計算: 80符 2翻 子 ロン → 5200', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22s888p34,z222+2,z4444'),
                        'p5-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 }],
                          fu: 80, fanshu: 2, damanguan: null, defen: 5200,
                          fenpei: [ -5200,  5200,     0,     0]});
        });
        test('点計算: 80符 3翻 親 ツモ → 4000∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11p999s123,z222+2,z1111'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 東',     fanshu: 1 },
                                  { name: '混全帯幺九',   fanshu: 1 }],
                          fu: 80, fanshu: 3, damanguan: null, defen: 12000,
                          fenpei: [ 12000, -4000, -4000, -4000]});
        });
        test('点計算: 90符 1翻 親 ロン → 4400', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p88m123s99,s6666,z2222'),
                        's9=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 }],
                          fu: 90, fanshu: 1, damanguan: null, defen: 4400,
                          fenpei: [  4400,     0, -4400,     0]});
        });
        test('点計算: 90符 2翻 子 ロン → 5800', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p88m123s99,s6666,z2222'),
                        's9-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 }],
                          fu: 90, fanshu: 2, damanguan: null, defen: 5800,
                          fenpei: [ -5800,  5800,     0,     0]});
        });
        test('点計算: 90符 3翻 親 ツモ → 4000∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22s345,z5555,z2222,z666-'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '翻牌 白',     fanshu: 1 },
                                  { name: '翻牌 發',     fanshu: 1 }],
                          fu: 90, fanshu: 3, damanguan: null, defen: 12000,
                          fenpei: [ 12000, -4000, -4000, -4000]});
        });
        test('点計算: 100符 1翻 親 ロン → 4800', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22p345s67,z2222,s9999'),
                        's8=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 }],
                          fu: 100, fanshu: 1, damanguan: null, defen: 4800,
                          fenpei: [  4800,     0, -4800,     0]});
        });
        test('点計算: 100符 2翻 子 ロン → 6400', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22p345s67,z2222,s9999'),
                        's8-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 }],
                          fu: 100, fanshu: 2, damanguan: null, defen: 6400,
                          fenpei: [ -6400,  6400,     0,     0]});
        });
        test('点計算: 100符 3翻 親 ツモ → 4000∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z11m999p243,s1111,s9999'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '三暗刻',      fanshu: 2 }],
                          fu: 100, fanshu: 3, damanguan: null, defen: 12000,
                          fenpei: [ 12000, -4000, -4000, -4000]});
        });
        test('点計算: 110符 1翻 親 ロン → 5300', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m234z1177,p1111,s9999'),
                        'z7=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '翻牌 中',     fanshu: 1 }],
                          fu: 110, fanshu: 1, damanguan: null, defen: 5300,
                          fenpei: [  5300,     0, -5300,     0]});
        });
        test('点計算: 110符 2翻 子 ロン → 7100', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m234z2277,p1111,z5555'),
                        'z7-', param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '翻牌 白',     fanshu: 1 },
                                  { name: '翻牌 中',     fanshu: 1 }],
                          fu: 110, fanshu: 2, damanguan: null, defen: 7100,
                          fenpei: [ -7100,  7100,     0,     0]});
        });
        test('点計算: 110符 3翻 親 ツモ → 4000∀', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                                'm243z11,p1111,s9999,z555+5'),
                        null, param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '翻牌 白',     fanshu: 1 },
                                  { name: '三槓子',      fanshu: 2 }],
                          fu: 110, fanshu: 3, damanguan: null, defen: 12000,
                          fenpei: [ 12000, -4000, -4000, -4000]});
        });
        test('点計算: 5翻 親 ロン → 12000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22456p456s44556'),
                        's6=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '平和',        fanshu: 1 },
                                  { name: '断幺九',      fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 },
                                  { name: '三色同順',    fanshu: 2 }],
                          fu: 30, fanshu: 5, damanguan: null, defen: 12000,
                          fenpei: [ 12000,     0,-12000,     0]});
        });
        test('点計算: 6翻 子 ツモ → 3000/6000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m22456p456s445566'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '平和',        fanshu: 1 },
                                  { name: '断幺九',      fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 },
                                  { name: '三色同順',    fanshu: 2 }],
                          fu: 20, fanshu: 6, damanguan: null, defen: 12000,
                          fenpei: [ -6000, 12000, -3000, -3000]});
        });
        test('点計算: 7翻 親 ロン → 18000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m111z3334,z222=,m999-'),
                        'z4=', param({zhuangfeng:1,menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '対々和',      fanshu: 2 },
                                  { name: '混老頭',      fanshu: 2 },
                                  { name: '混一色',      fanshu: 2 }],
                          fu: 50, fanshu: 7, damanguan: null, defen: 18000,
                          fenpei: [ 18000,     0,-18000,     0]});
        });
        test('点計算: 8翻 子 ツモ → 4000/8000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m111z333444,z222=,m999-'),
                        null, param({zhuangfeng:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '場風 南',     fanshu: 1 },
                                  { name: '自風 南',     fanshu: 1 },
                                  { name: '対々和',      fanshu: 2 },
                                  { name: '混老頭',      fanshu: 2 },
                                  { name: '混一色',      fanshu: 2 }],
                          fu: 50, fanshu: 8, damanguan: null, defen: 16000,
                          fenpei: [ -8000, 16000, -4000, -4000]});
        });
        test('点計算: 9翻 親 ロン → 24000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s2223334455567'),
                        's8=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '断幺九',      fanshu: 1 },
                                  { name: '三暗刻',      fanshu: 2 },
                                  { name: '清一色',      fanshu: 6 }],
                          fu: 50, fanshu: 9, damanguan: null, defen: 24000,
                          fenpei: [ 24000,     0,-24000,     0]});
        });
        test('点計算: 10翻 子 ツモ → 4000/8000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s22233344555678'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '断幺九',      fanshu: 1 },
                                  { name: '三暗刻',      fanshu: 2 },
                                  { name: '清一色',      fanshu: 6 }],
                          fu: 40, fanshu: 10, damanguan: null, defen: 16000,
                          fenpei: [ -8000, 16000, -4000, -4000]});
        });
        test('点計算: 11翻 親 ロン → 36000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p2233445566778'),
                        'p8=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '平和',        fanshu: 1 },
                                  { name: '断幺九',      fanshu: 1 },
                                  { name: '二盃口',      fanshu: 3 },
                                  { name: '清一色',      fanshu: 6 }],
                          fu: 30, fanshu: 11, damanguan: null, defen: 36000,
                          fenpei: [ 36000,     0,-36000,     0]});
        });
        test('点計算: 12翻 子 ツモ → 6000/12000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('p22334455667788'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                  { name: '平和',        fanshu: 1 },
                                  { name: '断幺九',      fanshu: 1 },
                                  { name: '二盃口',      fanshu: 3 },
                                  { name: '清一色',      fanshu: 6 }],
                          fu: 20, fanshu: 12, damanguan: null, defen: 24000,
                          fenpei: [-12000, 24000, -6000, -6000]});
        });
        test('点計算: 13翻 親 ロン → 48000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m1177778888999'),
                        'm9=', param({menfeng:0}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '平和',        fanshu: 1 },
                                  { name: '純全帯幺九',   fanshu: 3 },
                                  { name: '二盃口',      fanshu: 3 },
                                  { name: '清一色',      fanshu: 6 }],
                          fu: 30, fanshu: 13, damanguan: null, defen: 48000,
                          fenpei: [ 48000,     0,-48000,     0]});
        });
        test('点計算: 役満複合 子 ツモ → 24000/48000', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('z77111z444,z222+,z333-'),
                        null, param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '大四喜',      fanshu: '**' },
                                  { name: '字一色',      fanshu: '*'  }],
                          fu: null, fanshu: null, damanguan: 3, defen: 96000,
                          fenpei: [-48000, 96000,-24000,-24000]});
        });
        test('点計算: 役満パオ 放銃者なし、責任払い', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11p456,z555+,z666=,z777-'),
                        null, param({menfeng:0,lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '大三元', fanshu: '*', baojia: '-' }],
                          fu: null, fanshu: null, damanguan: 1, defen: 48000,
                          fenpei: [ 49300,     0,     0,-48300]});
        });
        test('点計算: 役満パオ 放銃者あり、放銃者と折半', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11p45,z555+,z666=,z777-'),
                        'p6=', param({menfeng:0,lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '大三元', fanshu: '*', baojia: '-' }],
                          fu: null, fanshu: null, damanguan: 1, defen: 48000,
                          fenpei: [ 49300,     0,-24300,-24000]});
        });
        test('点計算: 役満パオ パオが放銃、全額責任払い', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11p45,z555+,z666=,z777-'),
                        'p6-', param({menfeng:0,lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '大三元', fanshu: '*', baojia: '-' }],
                          fu: null, fanshu: null, damanguan: 1, defen: 48000,
                          fenpei: [ 49300,     0,     0,-48300]});
        });
        test('点計算: ダブル役満パオ 放銃者なし、関連役満のみ責任払い', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                                'z77,z111-,z2222,z333=3,z444+'),
                        null, param({lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '大四喜', fanshu: '**', baojia: '+' },
                                  { name: '字一色', fanshu: '*' }],
                          fu: null, fanshu: null, damanguan: 3, defen: 96000,
                          fenpei: [-16100, 97300,-72100, -8100]});
        });
        test('点計算: ダブル役満パオ 放銃者あり、関連役満のみ放銃者と折半', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                                'z7,z111-,z2222,z333=3,z444+'),
                        'z7-', param({lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '大四喜', fanshu: '**', baojia: '+' },
                                  { name: '字一色', fanshu: '*' }],
                          fu: null, fanshu: null, damanguan: 3, defen: 96000,
                          fenpei: [-64300, 97300,-32000,     0]});
        });
        test('点計算: ダブル役満パオ パオが放銃、全額責任払い', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString(
                                                'z7,z111-,z2222,z333=3,z444+'),
                        'z7+', param({lizhibang:1,changbang:1}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '大四喜', fanshu: '**', baojia: '+' },
                                  { name: '字一色', fanshu: '*' }],
                          fu: null, fanshu: null, damanguan: 3, defen: 96000,
                          fenpei: [     0, 97300,-96300,     0]});
        });
        test('高点法: 七対子と二盃口の選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m223344p556677s8'),
                        's8=', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '断幺九',      fanshu: 1 },
                                  { name: '二盃口',      fanshu: 3 }],
                          fu: 40, fanshu: 4, damanguan: null, defen: 8000,
                          fenpei: [     0,  8000,    0, -8000]});
        });
        test('高点法: 雀頭候補2つの選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m2234455p234s234'),
                        'm3=', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '断幺九',      fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 },
                                  { name: '三色同順',    fanshu: 2 }],
                          fu: 40, fanshu: 4, damanguan: null, defen: 8000,
                          fenpei: [     0,  8000,    0, -8000]});
        });
        test('高点法: 順子と刻子の選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m111222333p8999'),
                        'p7=', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '一盃口',      fanshu: 1 },
                                  { name: '純全帯幺九',   fanshu: 3 }],
                          fu: 40, fanshu: 4, damanguan: null, defen: 8000,
                          fenpei: [     0,  8000,    0, -8000]});
        });
        test('高点法: 嵌張待ち両面待ちの選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m12334p567z11z777'),
                        'm2=', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '翻牌 中',     fanshu: 1 }],
                          fu: 50, fanshu: 1, damanguan: null, defen: 1600,
                          fenpei: [     0,  1600,    0, -1600]});
        });
        test('高点法: 得点が同じ場合は翻数が多い方を選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m111222333p7899'),
                        'p9=', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '平和',        fanshu: 1 },
                                  { name: '一盃口',      fanshu: 1 },
                                  { name: '純全帯幺九',   fanshu: 3 }],
                          fu: 30, fanshu: 5, damanguan: null, defen: 8000,
                          fenpei: [     0,  8000,    0, -8000]});
        });
        test('高点法: 得点・翻数が同じ場合は符が多い方を選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('s1112223335578'),
                        's9=', param());
            assert.deepEqual(hule,
                        { hupai: [{ name: '三暗刻',      fanshu: 2 },
                                  { name: '清一色',      fanshu: 6 }],
                          fu: 50, fanshu: 8, damanguan: null, defen: 16000,
                          fenpei: [     0, 16000,    0,-16000]});
        });
        test('高点法: 役満と数え役満では役満を選択', ()=>{
            hule = Majiang.Util.hule(
                        Majiang.Shoupai.fromString('m11123457899996'),
                        null, param({lizhi:1,yifa:true,baopai:['m2'],
                                     fubaopai:['m5']}));
            assert.deepEqual(hule,
                        { hupai: [{ name: '九蓮宝燈',    fanshu: '*' }],
                          fu: null, fanshu: null, damanguan: 1, defen: 32000,
                          fenpei: [-16000, 32000, -8000, -8000]});
        });

        test('和了点計算: 10000パターン', ()=>{
            for (let t of data) {
                t.in.param.rule = Majiang.rule();
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString(t.in.shoupai),
                            t.in.rongpai, t.in.param);
                assert.deepEqual(hule, t.out, t.in.shoupai);
            }
        });
    });

    suite('ルール変更', ()=>{

        let hule;

        suite('連風牌は２符', ()=>{
            test('連風牌を２符とする', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString(
                                    'm123p123z1z1,s1-23,z555='),
                            null,
                            param({menfeng:0,
                                   rule:Majiang.rule({'連風牌は2符':true})}));
                assert.equal(hule.fu, 30);
            });
        });
        suite('クイタンなし', ()=>{
            test('クイタンは役とならない', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m22555p234s78,p777-'),
                            's6=',
                            param({rule:Majiang.rule({'クイタンあり':false})}));
                assert.ifError(hule.hupai);
            });
            test('門前ならOK', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m22555p234777s78'),
                            's6=',
                            param({rule:Majiang.rule({'クイタンあり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '断幺九', fanshu: 1 }],
                              fu: 40, fanshu: 1, damanguan: null, defen: 1300,
                              fenpei: [ 0,  1300, 0, -1300]});
            });
        });
        suite('ダブル役満なし', ()=>{
            test('国士無双十三面', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m19p19s19z1234567'),
                            'm1+',
                            param({rule:Majiang.rule({'ダブル役満あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '国士無双十三面', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [  0, 32000, -32000, 0]});
            });
            test('四暗刻単騎', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m111p333s777z111m3'),
                            'm3=',
                            param({rule:Majiang.rule({'ダブル役満あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '四暗刻単騎', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [  0, 32000, 0, -32000]});
            });
            test('大四喜', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m22z22244,z333+,z111-'),
                            'z4=',
                            param({rule:Majiang.rule({'ダブル役満あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '大四喜', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [  0, 32000, 0, -32000]});
            });
            test('純正九蓮宝燈', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m1112345678999'),
                            'm2=',
                            param({rule:Majiang.rule({'ダブル役満あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '純正九蓮宝燈', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [  0, 32000, 0, -32000]});
            });
        });
        suite('役満の複合なし', ()=>{
            test('ダブル役満 + 役満複合 + パオ (ツモ和了)', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString(
                                                'z77,z111-,z2222,z333=3,z444+'),
                            null,
                            param({lizhibang:1,changbang:1,
                                   rule:Majiang.rule({'役満の複合あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [
                                { name: '大四喜', fanshu: '**', baojia: '+' },
                                { name: '字一色', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [ 0, 33300, -32300, 0]});
            });
            test('ダブル役満 + 役満複合 + パオ (ロン和了)', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString(
                                                'z7,z111-,z2222,z333=3,z444+'),
                            'z7-',
                            param({lizhibang:1,changbang:1,
                                   rule:Majiang.rule({'役満の複合あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [
                                { name: '大四喜', fanshu: '**', baojia: '+' },
                                { name: '字一色', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [ -16300, 33300, -16000, 0]});
            });
        });
        suite('役満パオなし', ()=>{
            test('大三元', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString(
                                                    'm2234,z555-5,z6666,z777+'),
                            'm5=',
                            param({rule:Majiang.rule({'役満パオあり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '大三元', fanshu: '*' }],
                              fu: null, fanshu: null,
                              damanguan: 1, defen: 32000,
                              fenpei: [  0, 32000, 0, -32000]});
            });
            test('大四喜', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString(
                                                'm2,z222+,z4444,z333+,z111-'),
                            'm2=',
                            param({rule:Majiang.rule({'役満パオあり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '大四喜', fanshu: '**' }],
                              fu: null, fanshu: null,
                              damanguan: 2, defen: 64000,
                              fenpei: [  0, 64000, 0, -64000]});
            });
        });
        suite('数え役満なし', ()=>{
            test('13翻も3倍満とする', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('p22334455667788*'),
                            null,
                            param({lizhi:1,
                                   rule:Majiang.rule({'数え役満あり':false})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '立直',        fanshu: 1 },
                                      { name: '門前清自摸和', fanshu: 1 },
                                      { name: '平和',        fanshu: 1 },
                                      { name: '断幺九',      fanshu: 1 },
                                      { name: '二盃口',      fanshu: 3 },
                                      { name: '清一色',      fanshu: 6 }],
                              fu: 20, fanshu: 13, damanguan: null, defen: 24000,
                              fenpei: [-12000, 24000, -6000, -6000]});
            })
        });
        suite('切り上げ満貫あり', ()=>{
            test('30符 3翻 親 ツモ → 2000∀ (切り上げなし)', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m22z111p445566s789'),
                            null,
                            param({zhuangfeng:1,menfeng:0,
                                   rule:Majiang.rule(
                                            {'切り上げ満貫あり':true})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                      { name: '自風 東',     fanshu: 1 },
                                      { name: '一盃口',      fanshu: 1 }],
                              fu: 30, fanshu: 3, damanguan: null, defen: 6000,
                              fenpei: [  6000, -2000, -2000, -2000]});
            });
            test('30符 4翻 子 ツモ → 2000/4000', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m11z111p123789s789'),
                            null,
                            param({rule:Majiang.rule(
                                            {'切り上げ満貫あり':true})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '門前清自摸和', fanshu: 1 },
                                      { name: '場風 東',     fanshu: 1 },
                                      { name: '混全帯幺九',   fanshu: 2 }],
                              fu: 30, fanshu: 4, damanguan: null, defen: 8000,
                              fenpei: [ -4000,  8000, -2000, -2000]});
            });
            test('60符 3翻 親 ツモ → 4000∀', ()=>{
                hule = Majiang.Util.hule(
                            Majiang.Shoupai.fromString('m11222789,z2222,m444='),
                            null,
                            param({zhuangfeng:1,menfeng:0,
                                   rule:Majiang.rule(
                                            {'切り上げ満貫あり':true})}));
                assert.deepEqual(hule,
                            { hupai: [{ name: '場風 南',     fanshu: 1 },
                                      { name: '混一色',      fanshu: 2 }],
                              fu: 60, fanshu: 3, damanguan: null, defen: 12000,
                              fenpei: [ 12000, -4000, -4000, -4000]});
            });
        });
    });
});
