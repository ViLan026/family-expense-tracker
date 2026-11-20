import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, parseMoney } from "./money.ts";

test("formatMoney theo bảng trong brief", () => {
  const cases: [number, string][] = [
    [5_000, "5k"],
    [50_000, "50k"],
    [250_000, "250k"],
    [500_000, "500k"],
    [1_000_000, "1tr"],
    [1_500_000, "1tr5"],
    [2_500_000, "2tr5"],
    [10_000_000, "10tr"],
    [12_500_000, "12tr5"],
  ];
  for (const [n, out] of cases) assert.equal(formatMoney(n), out);
});

test("formatMoney các trường hợp lẻ", () => {
  assert.equal(formatMoney(1_250_000), "1tr25");
  assert.equal(formatMoney(5_500), "5k5");
  assert.equal(formatMoney(999_000), "999k");
  assert.equal(formatMoney(500), "500đ");
  assert.equal(formatMoney(0), "0đ");
});

test("parseMoney", () => {
  assert.equal(parseMoney("250k"), 250_000);
  assert.equal(parseMoney("1tr5"), 1_500_000);
  assert.equal(parseMoney("1.5tr"), 1_500_000);
  assert.equal(parseMoney("1,5tr"), 1_500_000);
  assert.equal(parseMoney("12tr5"), 12_500_000);
  assert.equal(parseMoney("250.000"), 250_000);
  assert.equal(parseMoney("250000"), 250_000);
  assert.equal(parseMoney("250"), 250_000);
  assert.equal(parseMoney("abc"), null);
  assert.equal(parseMoney(""), null);
});

test("parseMoney và formatMoney khớp nhau", () => {
  for (const n of [5_000, 250_000, 1_500_000, 12_500_000]) {
    assert.equal(parseMoney(formatMoney(n)), n);
  }
});
