import { Experimental, Field, Provable } from 'snarkyjs';
import {
  IS_STRING,
  MAX_FIELDS,
  RLP_Header,
  data_len,
  decode1,
  decode_len,
} from './RLP';
import { quinSelector } from './Utils';

describe('RLP', () => {
  xit('should compute correct data length', async () => {
    const circuit = Experimental.ZkProgram({
      publicInput: undefined,

      methods: {
        data_len: {
          privateInputs: [Provable.Array(Field, 3), Field, Field],

          method(arr: Field[], lenlen: Field, data_length: Field) {
            Field(data_length).assertEquals(data_len(arr, lenlen));
          },
        },
      },
    });

    const arr = [Field(185), Field(4), Field(0)];
    const lenlen = Field(2);
    const data_length = Field(1024);

    await circuit.compile();
    const proof = await circuit.data_len(arr, lenlen, data_length);
    await circuit.verify(proof);
  });

  xit('should correctly decode RLP header', async () => {
    const circuit1 = Experimental.ZkProgram({
      publicInput: undefined,

      methods: {
        decode_len: {
          privateInputs: [Provable.Array(Field, 3), RLP_Header],

          method(arr: Field[], rlp_header: RLP_Header) {
            let res = decode_len(arr);
            rlp_header.offset.assertEquals(res.offset);
            rlp_header.length.assertEquals(res.length);
            rlp_header.data_type.assertEquals(res.data_type);
          },
        },
      },
    });
    await circuit1.compile();

    const arr1 = [130, 4, 0].map((x) => Field(x));
    const rlp_header1 = new RLP_Header(Field(1), Field(2), Field(IS_STRING));

    const proof1 = await circuit1.decode_len(arr1, rlp_header1);
    await circuit1.verify(proof1);

    const circuit2 = Experimental.ZkProgram({
      publicInput: undefined,

      methods: {
        decode_len: {
          privateInputs: [Provable.Array(Field, 1027), RLP_Header],

          method(arr: Field[], rlp_header: RLP_Header) {
            let res = decode_len(arr);
            rlp_header.offset.assertEquals(res.offset);
            rlp_header.length.assertEquals(res.length);
            rlp_header.data_type.assertEquals(res.data_type);
          },
        },
      },
    });
    await circuit2.compile();

    const arr2 = [
      185, 4, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
      55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72,
      73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
      91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106,
      107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
      122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136,
      137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
      152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166,
      167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181,
      182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196,
      197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
      212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226,
      227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241,
      242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 0,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75,
      76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
      94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
      110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124,
      125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139,
      140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154,
      155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169,
      170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184,
      185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199,
      200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214,
      215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229,
      230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244,
      245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 0, 1, 2, 3, 4, 5,
      6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
      25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
      43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
      61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
      79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
      97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
      112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
      127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141,
      142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156,
      157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
      172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186,
      187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201,
      202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216,
      217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
      232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246,
      247, 248, 249, 250, 251, 252, 253, 254, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
      10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
      46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
      64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81,
      82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
      100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
      115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
      130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
      145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
      160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174,
      175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189,
      190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204,
      205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
      220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234,
      235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249,
      250, 251, 252, 253, 254, 255, 0,
    ].map((x) => Field(x));
    const rlp_header2 = new RLP_Header(Field(3), Field(1024), Field(IS_STRING));

    const proof2 = await circuit2.decode_len(arr2, rlp_header2);
    await circuit2.verify(proof2);
  });

  xit('should random access array', async () => {
    const circuit = Experimental.ZkProgram({
      publicInput: undefined,

      methods: {
        quin_selector: {
          privateInputs: [Provable.Array(Field, 5), Field, Field],

          method(arr: Field[], index: Field, val: Field) {
            const res_val = quinSelector(arr, index);
            val.assertEquals(res_val);
          },
        },
      },
    });

    await circuit.compile();

    const arr = [Field(1), Field(2), Field(3), Field(4), Field(5)];
    const index = Field(3);
    const val = Field(4);

    const proof = await circuit.quin_selector(arr, index, val);
    await circuit.verify(proof);
  });

  it('should test RLP decode list', async () => {
    const circuit1 = Experimental.ZkProgram({
      publicInput: undefined,

      methods: {
        decode1: {
          privateInputs: [Provable.Array(Field, 1), Field],

          method(arr: Field[], num_fields: Field) {
            const rlp_list = decode1(arr);
            rlp_list.num_fields.assertEquals(num_fields);
          },
        },
      },
    });

    await circuit1.compile();

    const arr1 = [Field(192)];
    const num_fields1 = Field(0);

    const proof1 = await circuit1.decode1(arr1, num_fields1);
    await circuit1.verify(proof1);

    const circuit2 = Experimental.ZkProgram({
      publicInput: undefined,

      methods: {
        decode1: {
          privateInputs: [
            Provable.Array(Field, 11),
            Provable.Array(Field, MAX_FIELDS),
            Provable.Array(Field, MAX_FIELDS),
            Field,
          ],

          method(
            arr: Field[],
            offset: Field[],
            length: Field[],
            num_fields: Field
          ) {
            const rlp_list = decode1(arr);

            rlp_list.num_fields.assertEquals(num_fields);

            for (let i = 0; i < MAX_FIELDS; i++) {
              rlp_list.offset[i].assertEquals(offset[i]);
              rlp_list.length[i].assertEquals(length[i]);
            }
          },
        },
      },
    });

    const arr2 = [
      '0xc9',
      '0x83',
      '0x63',
      '0x61',
      '0x74',
      '0x83',
      '0x64',
      '0x6f',
      '0x68',
      '0x00',
      '0x00',
    ].map((x) => Field(parseInt(x, 16)));

    const offset2 = [2, 6, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(
      (x) => Field(x)
    );
    const length2 = [3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(
      (x) => Field(x)
    );
    const num_fields2 = Field(3);

    await circuit2.compile();
    const proof2 = await circuit2.decode1(arr2, offset2, length2, num_fields2);
    await circuit2.verify(proof2);
  });
});
