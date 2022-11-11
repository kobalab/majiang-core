# majiang-core

麻雀基本ライブラリ

手牌の操作、シャンテン数・和了点計算、局進行・卓情報の管理、思考ルーチンの雛形を含む基本クラス群を提供します。

## インストール
```sh
$ npm i @kobalab/majiang-core
```

## 使用法
```javascript
const Majiang = require('@kobalab/majiang-core');
```

## 提供機能
| クラス名            | 機能                                 |
|:--------------------|:-------------------------------------|
| ``Majiang.Shoupai`` | 手牌を表現するクラス                 |
| ``Majiang.Shan``    | 牌山を表現するクラス                 |
| ``Majiang.He``      | 捨て牌を表現するクラス               |
| ``Majiang.Util``    | シャンテン数計算、和了点計算ルーチン |
| ``Majiang.Game``    | 局進行を実現するクラス               |
| ``Majiang.Board``   | 卓情報を更新するクラス               |
| ``Majiang.Player``  | 対局者を実現する基底クラス           |

- [API仕様](https://github.com/kobalab/majiang-core/wiki)

## ライセンス
[MIT](https://github.com/kobalab/majiang-core/blob/master/LICENSE)

## 作者
[Satoshi Kobayashi](https://github.com/kobalab)
