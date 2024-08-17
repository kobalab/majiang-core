import Mahjong from '../src';

test('正常ケース', () => {
  expect(() => new Mahjong.Hai(Mahjong.HaiType.manzu, 2)).not.toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.pinzu, 1)).not.toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.souzu, 9)).not.toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.jihai, 1)).not.toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.jihai, 3)).not.toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.jihai, 7)).not.toThrow();
});

test('異常ケース', () => {
  expect(() => new Mahjong.Hai(Mahjong.HaiType.manzu, 0)).toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.pinzu, -1)).toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.souzu, -5)).toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.manzu, 10)).toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.pinzu, 15)).toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.jihai, 8)).toThrow();
  expect(() => new Mahjong.Hai(Mahjong.HaiType.jihai, 10)).toThrow();
});
