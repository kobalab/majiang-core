### v0.1.5 / 2021-12-13

 - Majiang.Player
   - get tingpai() → get hulepai() に名称変更

### v0.1.4 / 2021-12-12

 - Majiang.Shoupai
   - 赤牌をツモったとき、get_dapai() が誤った値を返すバグを修正

### v0.1.3 / 2021-12-09

 - Majiang.Shoupai
   - インスタンスメソッド fromString() を追加
 - Majiang.Game
   - 対局終了時に呼び出す callback の引数に牌譜を渡すよう変更
   - Majiang.Player との待ち合わせ時間を変更
   - ロン和了の際にロン牌を手牌に加えているバグを修正
   - 和了・流局時に開かれた手牌が卓情報に反映されないバグを修正
 - Majiang.Board
   - パラメータなしでインスタンスが生成できるよう修正
 - Majiang.Player
   - コンストラクタで空の卓情報を生成するよう修正

### v0.1.2 / 2021-11-17

 - Majiang.Player
   - callback の呼び出しは全て action_XXX 系の抽象メソッドで行うよう修正

### v0.1.1 / 2021-11-16

 - Majiang.Util
   - hule() のパラメータ rongpai の形式をチェックする処理を追加
 - Majiang.Player
   - action_XXX 系の未実装メソッドを呼び出す仕様に変更(V1に戻した)

## v0.1.0 / 2021-11-13

 - β版リリース

### v0.0.5 / 2021-11-13

 - Majiang.Player を追加
 - 脆弱性警告に対応
   - mocha 8.4.0 → 9.1.3
   - ansi-regex 5.0.0 → 5.0.1
   - browserslist 4.16.3 → 4.17.6

### v0.0.4 / 2021-05-23

 - Majiang.Board を追加

### v0.0.3 / 2021-05-10

 - トビ終了なしのルールでもトビ終了してしまうバグを修正

### v0.0.2 / 2021-05-09

 - 流局時にテンパイ宣言するときの応答を shoupai → daopai に変更
 - 九種九牌で流すときの応答を pingju → daopai に変更

## v0.0.1 / 2021-05-03

 - α版リリース
