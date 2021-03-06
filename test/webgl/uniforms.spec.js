/* eslint-disable no-inline-comments */
import test from 'tape-catch';
import {Program, Texture2D} from 'luma.gl';
import 'luma.gl/headless';
import {checkUniformValues, areUniformsEqual} from 'luma.gl/webgl/uniforms';

import {fixture} from '../setup';

const MATRIX_2 = [
  1, 0,
  0, 1
];

const MATRIX_3 = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
const MATRIX_4 = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
];

const VERTEX_SHADER = `
#ifdef GL_ES
precision highp float;
#endif

void main(void) {
  gl_Position = vec4(0., 0., 0., 0.);
}
`;

const WEBGL1_FRAGMENT_SHADER = `
#ifdef GL_ES
precision highp float;
#endif

uniform float f;
uniform vec2 v2;
uniform vec3 v3;
uniform vec4 v4;

uniform int i;
uniform ivec2 iv2;
uniform ivec3 iv3;
uniform ivec4 iv4;

uniform bool b;
uniform bvec2 bv2;
uniform bvec3 bv3;
uniform bvec4 bv4;

uniform mat2 m2;
uniform mat3 m3;
uniform mat4 m4;

uniform sampler2D s2d;
// uniform samplerCube sCube;

void main(void) {
  vec4 v = vec4(f) + vec4(v2, 0., 0.) + vec4(v3, 0.) + v4;
  ivec4 iv = ivec4(i) + ivec4(iv2, 0., 0.) + ivec4(iv3, 0.) + iv4;

  bvec4 bv = bv4;
  bv = bvec4(bv3, 0.);
  bv = bvec4(bv2, 0., 0.);
  bv = bvec4(b);

  vec2 transform_v2 = m2 * v2;
  vec3 transform_v3 = m3 * v3;
  vec4 transform_v4 = m4 * v4;

  v = texture2D(s2d, v2);

  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

const WEBGL1_GOOD_UNIFORMS = {
  f: 1.0,
  v2: new Float32Array([1, 2]), // FLOAT_VEC2  0x8B50
  v3: new Float32Array([1, 2, 3]), // FLOAT_VEC3  0x8B51
  v4: new Float32Array([1, 2, 3, 4]), // FLOAT_VEC4  0x8B52

  i: -1,
  iv2: new Int32Array([1, 2]), // INT_VEC2  0x8B53
  iv3: new Int32Array([1, 2, 3]), // INT_VEC3  0x8B54
  iv4: new Int32Array([1, 2, 3, 4]), // INT_VEC4  0x8B55

  b: true, // BOOL  0x8B56
  bv2: new Int32Array([false, true]), // BOOL_VEC2 0x8B57
  bv3: new Int32Array([false, true, false]), // BOOL_VEC3 0x8B58
  bv4: new Int32Array([false, true, false, true]), // BOOL_VEC4 0x8B59

  m2: new Float32Array(MATRIX_2), // FLOAT_MAT2  0x8B5A
  m3: new Float32Array(MATRIX_3), // FLOAT_MAT3  0x8B5B
  m4: new Float32Array(MATRIX_4), // FLOAT_MAT4  0x8B5C

  s2d: new Texture2D(fixture.gl)    // SAMPLER_2D  0x8B5E
  // sCube: new TextureCube(gl) // SAMPLER_CUBE  0x8B60
};

// const WEBGL1_ARRAYS_FRAGMENT_SHADER = `
// #ifdef GL_ES
// precision highp float;
// #endif

// uniform float f[3];
// uniform int i[3];
// uniform bool b[3];
// uniform vec2 v2[3];
// uniform vec3 v3[3];
// uniform vec4 v4[3];
// // int vectors
// // bool vectors
// uniform mat2 m2[3];
// uniform mat3 m3[3];
// uniform mat4 m4[3];

// uniform sampler2D s2d[5];
// // uniform samplerCube sCube;

// void main(void) {
//   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
// }
// `;

// const WEBGL1_ARRAYS_GOOD_UNIFORMS = {
//   f: 1.0,
//   i: 1,
//   b: true,
//   v2: new Float32Array([...[1, 2], ...[1, 2], ...[1, 2]]),
//   v3: new Float32Array([...[1, 2, 3], ...[1, 2, 3], ...[1, 2, 3]]),
//   v4: new Float32Array([...[1, 2, 3, 4], ...[1, 2, 3, 4], ...[1, 2, 3, 4]]),
//   // INT_VEC2  0x8B53
//   // INT_VEC3  0x8B54
//   // INT_VEC4  0x8B55
//   // BOOL  0x8B56
//   // BOOL_VEC2 0x8B57
//   // BOOL_VEC3 0x8B58
//   // BOOL_VEC4 0x8B59
//   m2: new Float32Array([...MATRIX_2, ...MATRIX_2, ...MATRIX_2]),
//   m3: new Float32Array([...MATRIX_3, ...MATRIX_3, ...MATRIX_3]),
//   m4: new Float32Array([...MATRIX_4, ...MATRIX_4, ...MATRIX_4]),

//   s2d: [new Texture2D(gl), new Texture2D(gl), new Texture2D(gl)]
//   // sCube: new TextureCube(gl) // SAMPLER_CUBE  0x8B60
// };

// const WEBGL2_FRAGMENT_SHADER = `
// #ifdef GL_ES
// precision highp float;
// #endif
// uniform sampler1D;
// uniform sampler3D;

// void main(void) {
//   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
// }
// `;

// const WEBGL2_GOOD_UNIFORMS = {
//   s1d: 2, // SAMPLER_1D  0x8B5E
//   s3d: 3  // SAMPLER_3D  0x8B60
// };

// const BUFFER_DATA = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);

test('WebGL#Uniforms pre verify uniforms', t => {
  t.ok(checkUniformValues(WEBGL1_GOOD_UNIFORMS,
    'Uniform values are well formed'));

  // t.throws()

  t.end();
});

test('WebGL#Uniforms Program uniform locations', t => {
  const {gl} = fixture;

  const program = new Program(gl, {
    vs: VERTEX_SHADER,
    fs: WEBGL1_FRAGMENT_SHADER
  });

  for (const uniformName in WEBGL1_GOOD_UNIFORMS) {
    t.ok(program._uniformSetters[uniformName], `Program found uniform setter ${uniformName}`);
  }

  t.end();
});

const testSetUniform = (gl, t) => {
  const program = new Program(gl, {
    vs: VERTEX_SHADER,
    fs: WEBGL1_FRAGMENT_SHADER
  });
  program.use();

  let uniforms = Object.assign({}, WEBGL1_GOOD_UNIFORMS);

  t.comment('Test setting typed arrays');
  program.setUniforms(uniforms);
  t.pass('Set typed array uniforms successful');

  uniforms = {};
  for (const uniformName in WEBGL1_GOOD_UNIFORMS) {
    const value = WEBGL1_GOOD_UNIFORMS[uniformName];
    if (value.length) {
      // Convert to plain array
      uniforms[uniformName] = Array.from(value);
    }
  }

  t.comment('Test setting plain arrays');
  program.setUniforms(uniforms);
  t.pass('Set plain array uniforms successful');

  uniforms = {};
  for (const uniformName in WEBGL1_GOOD_UNIFORMS) {
    const value = WEBGL1_GOOD_UNIFORMS[uniformName];
    if (value.length) {
      // Convert to wrong typed array
      uniforms[uniformName] = (value instanceof Float32Array) ?
        new Int32Array(value) : new Float32Array(value);
    }
  }

  t.comment('Test setting malformed typed arrays');
  program.setUniforms(uniforms);
  t.pass('Set malformed typed array uniforms successful');

  t.end();
};

test('WebGL#Uniforms Program setUniforms', t => {
  const {gl} = fixture;

  testSetUniform(gl, t);
});

test('WebGL2#Uniforms Program setUniforms', t => {
  const {gl2} = fixture;

  if (gl2) {
    testSetUniform(gl2, t);
  } else {
    t.end();
  }

});

test('WebGL#Uniforms areUniformsEqual', t => {
  const {gl} = fixture;

  const TEST_TEXTURE = new Texture2D(gl);

  const TEST_CASES = [
    {
      title: 'Numeric values',
      value1: 1,
      value2: 1,
      equals: true
    }, {
      title: 'Numeric values',
      value1: 1,
      value2: 2,
      equals: false
    }, {
      title: 'Texture objects',
      value1: TEST_TEXTURE,
      value2: TEST_TEXTURE,
      equals: true
    }, {
      title: 'Texture objects',
      value1: TEST_TEXTURE,
      value2: new Texture2D(gl),
      equals: false
    }, {
      title: 'null',
      value1: null,
      value2: null,
      equals: true
    }, {
      title: 'Array vs array',
      value1: [0, 0, 0],
      value2: [0, 0, 0],
      equals: true
    }, {
      title: 'TypedArray vs array',
      value1: new Float32Array(3),
      value2: [0, 0, 0],
      equals: true
    }, {
      title: 'Array different length',
      value1: [0, 0, 0, 0],
      value2: new Float32Array(3),
      equals: false
    }, {
      title: 'Array vs null',
      value1: new Float32Array(3),
      value2: null,
      equals: false
    }
  ];

  TEST_CASES.forEach(testCase => {
    t.is(areUniformsEqual(testCase.value1, testCase.value2), testCase.equals, testCase.title);
  });

  t.end();
});
