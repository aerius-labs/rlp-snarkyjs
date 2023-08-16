/**
 * @fileoverview This file contains utility functions for working with fields in snarkyjs.
 * @packageDocumentation
 */

import { Field, Provable } from 'snarkyjs';
import { Snarky } from 'snarkyjs/dist/node/snarky';
import { FieldConst } from 'snarkyjs/dist/node/lib/field';
import { Field as Fp } from 'snarkyjs/dist/node/provable/field-bigint';

/**
 * Separates a field into its high and low parts.
 * @param x The field to separate.
 * @returns An array containing the high and low parts of the field.
 */
const separateHighPart = (x: Field): [Field, Field] => {
  let [, isOddVar, xDiv2Var] = Snarky.exists(2, () => {
    let bits = Fp.toBits(x.toBigInt());
    let highPart = [];
    for (let i = 0; i < 2; i++) {
      highPart.push(bits.shift()! ? 1n : 0n);
    }

    return [
      0,
      FieldConst.fromBigint(Fp.fromBits(highPart.map((x) => x === 1n))),
      FieldConst.fromBigint(Fp.fromBits(bits)),
    ];
  });
  return [new Field(xDiv2Var), new Field(isOddVar)];
};

/**
 * Determines if one field is less than another.
 * @param a The first field.
 * @param b The second field.
 * @returns A boolean indicating if a is less than b.
 */
export const lessThanWrapper = (a: Field, b: Field) => {
  let [aHigh, aLow] = separateHighPart(a);
  let [bHigh, bLow] = separateHighPart(b);

  let highPartLessThan = aHigh.lessThan(bHigh);
  let lowPartLessThan = aLow.lessThan(bLow);

  return highPartLessThan
    .or(lowPartLessThan.and(aHigh.equals(bHigh)))
    .toField();
};

/**
 * Selects an element from an array based on an index.
 * @param arr The array to select from.
 * @param index The index of the element to select.
 * @returns The selected element.
 */
export const quinSelector = (arr: Field[], index: Field) => {
  index.lessThan(Field(arr.length)).assertTrue();

  let out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i].mul(index.equals(Field(i)).toField()));
  }

  let res = Field(0);
  for (let i = 0; i < arr.length; i++) {
    res = res.add(out[i]);
  }

  return res;
};

/**
 * Takes a slice of an array and applies a dot product to it.
 * @param arr The array to slice and dot product.
 * @param n The starting index of the slice.
 * @param M The length of the slice.
 * @returns An array containing the results of the dot product.
 */
export const takeDotDrop = (arr: Field[], n: Field, M: number) => {
  let out = [];

  for (let i = 0; i < M; i++) {
    const j = Field(i)
      .add(n)
      .lessThan(Field(arr.length))
      .toField()
      .mul(Field(i).add(n));
    out.push(quinSelector(arr, j));
  }

  return out;
};
