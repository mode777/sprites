attribute vec3 aPos;
attribute vec2 aUv;
attribute vec4 aColor;

uniform vec2 uTextureSize;
uniform mat4 uView;
uniform mat4 uProjection;
uniform mat4 uModel;

varying vec2 vUv;
varying vec4 vColor;

void main(void) {
  vUv = aUv / uTextureSize;
  vColor = aColor;
  gl_Position =  uProjection * uView * uModel * vec4(aPos, 1.0);
}