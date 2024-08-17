export enum HaiType {
  manzu = 'manzu',
  pinzu = 'pinzu',
  souzu = 'souzu',
  jihai = 'jihai',
};
export type EHaiType = HaiType;

/**
 * 牌クラス
 * ValueObjectとする
 */
export class Hai {
  /**
   * コンストラクタ
   * @param type 牌の種類
   * @param num 牌の番号
   */
  constructor (private _type: EHaiType, private _num: number) {
    const e = new Error(`Invalid Hai. Type: ${this._type} num: ${this._num}`);
    if (this._num < 0) { throw e; }
    if (this._type !== HaiType.jihai && this._num > 9) { throw e; }
    else if (this._type === HaiType.jihai && this._num > 7) { throw e; }
  }

  /**
   * 牌の種類
   */
  get type(): EHaiType { return this._type; }

  /**
   * 牌の番号
   */
  get num(): number { return this._num; }
}
