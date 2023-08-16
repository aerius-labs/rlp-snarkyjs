/**
 * @file This file contains the implementation of RLP decoding in TypeScript using snarkyjs.
 * @module RLP
 */

import { Experimental, Field, Provable, Struct, arrayProp } from 'snarkyjs';
import { lessThanWrapper, takeDotDrop } from './Utils';

/**
 * Maximum length in bytes of RLP-encoded data.
 */
export const MAX_LEN_IN_BYTES = 2;

/**
 * Maximum number of fields/slots in a trie node.
 */
export const MAX_FIELDS = 17;

/**
 * RLP data type enum.
 */
export const IS_STRING = 0;
export const IS_LIST = 1;

/**
 * RLP header struct obtained from length decoding.
 */
export class RLP_Header extends Struct({
  offset: Field,
  length: Field,
  data_type: Field,
}) {
  constructor(offset: Field, length: Field, data_type: Field) {
    super({
      offset,
      length,
      data_type,
    });
  }
}

/**
 * RLP list struct represented by the offsets and lengths of the fields together with
 * the total number of fields.
 */
export class RLP_List extends Struct({
  offset: Provable.Array(Field, MAX_FIELDS),
  length: Provable.Array(Field, MAX_FIELDS),
  data_type: Provable.Array(Field, MAX_FIELDS),
  num_fields: Field,
}) {
  constructor(
    offset: Field[],
    length: Field[],
    data_type: Field[],
    num_fields: Field
  ) {
    super({
      offset,
      length,
      data_type,
      num_fields,
    });
  }
}

/**
 * Extract length from bytes following prefix in case data is of length >= 56 bytes.
 * @param arr - The byte array to extract the length from.
 * @param lenlen - The length of the length prefix.
 * @returns The length of the data.
 */
export const data_len = (arr: Field[], lenlen: Field) => {
  let out = Field(0);

  for (let i = 0; i < MAX_LEN_IN_BYTES; i++) {
    let arr_len_pred = i + 1 < arr.length ? 1 : 0;
    let len_len_pred = lessThanWrapper(Field(i), lenlen);
    out = Field(len_len_pred)
      .mul(
        Field(256)
          .mul(out)
          .add(arr[arr_len_pred * (i + 1)])
      )
      .add(Field(1).sub(len_len_pred).mul(out));
  }

  return out;
};

/**
 * Determine offset, length and type of RLP-encoded data.
 * May be used on any RLP-encoded byte array.
 * @param arr - The byte array to decode.
 * @returns The RLP header struct.
 */
export const decode_len = (arr: Field[]) => {
  let prefix = arr[0];

  let prefix_p1 = prefix.lessThan(Field(128)); // Single byte
  let prefix_p2 = prefix.lessThan(Field(184)); // 0-55 byte string
  let prefix_p3 = prefix.lessThan(Field(192)); // >55 byte string
  let prefix_p4 = prefix.lessThan(Field(248)); // 0-55 byte list
  // Else >55 byte list

  let offset = Provable.if(
    prefix_p1,
    Field(0),
    Provable.if(
      prefix_p2,
      Field(1),
      Provable.if(
        prefix_p3,
        Field(1).add(prefix.sub(Field(183))),
        Provable.if(prefix_p4, Field(1), Field(1).add(prefix.sub(Field(247))))
      )
    )
  );

  let len = Provable.if(
    prefix_p1,
    Field(1),
    Provable.if(
      prefix_p2,
      prefix.sub(Field(128)),
      Provable.if(
        prefix_p3,
        data_len(arr, prefix.sub(Field(183))),
        Provable.if(
          prefix_p4,
          prefix.sub(Field(192)),
          data_len(arr, prefix.sub(Field(247)))
        )
      )
    )
  );

  let data_type = prefix.greaterThanOrEqual(Field(192)).toField();

  return new RLP_Header(offset, len, data_type);
};

/**
 * RLP string decoder.
 * @param arr - The byte array to decode.
 * @returns An array containing the offset and length of the RLP-encoded string.
 */
export const decode0 = (arr: Field[]) => {
  const rlp_header = decode_len(arr);

  const total_len = rlp_header.length.add(rlp_header.offset);

  rlp_header.data_type.assertEquals(Field(IS_STRING));

  total_len.assertLessThanOrEqual(Field(arr.length));

  return [rlp_header.offset, rlp_header.length];
};

/**
 * RLP list decoder.
 * @param arr - The byte array to decode.
 * @param num_fields - The number of fields in the RLP-encoded list.
 * @returns An RLP list struct.
 */
export const decode1 = (arr: Field[]) => {
  let num_fields = Field(0);
  let dec_off = [];
  let dec_len = [];
  let dec_type = [];

  let rlp_header = decode_len(arr);

  const total_len = rlp_header.length.add(rlp_header.offset);

  rlp_header.data_type.assertEquals(Field(IS_LIST));

  total_len.assertLessThanOrEqual(Field(arr.length));

  for (let i = 0; i < MAX_FIELDS; i++) {
    const loop_p = rlp_header.offset.equals(total_len).not().toField();

    const header = takeDotDrop(arr, rlp_header.offset, MAX_LEN_IN_BYTES + 1);
    const rlp_header_in = decode_len(header);
    const total_field_len = rlp_header_in.length.add(rlp_header_in.offset);

    dec_off.push(
      loop_p.mul(
        rlp_header.offset.add(
          Field(1).sub(rlp_header_in.data_type).mul(rlp_header_in.offset)
        )
      )
    );
    dec_len.push(
      loop_p.mul(
        rlp_header_in.length.add(
          rlp_header_in.offset.mul(rlp_header_in.data_type)
        )
      )
    );
    dec_type.push(loop_p.mul(rlp_header_in.data_type));

    rlp_header.offset = rlp_header.offset.add(loop_p.mul(total_field_len));
    num_fields = num_fields.add(loop_p);
  }

  total_len.assertEquals(rlp_header.offset);

  return new RLP_List(dec_off, dec_len, dec_type, num_fields);
};
