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
  vUv = (aUv/4.0) / uTextureSize;
  vColor = aColor;
  vec3 pos = aPos;
  pos.y += sin(pos.x*0.7) * cos(pos.z*0.7) * 0.5;
  gl_Position =  uProjection * uView * uModel * vec4(pos, 1.0);
}