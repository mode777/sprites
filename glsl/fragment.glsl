uniform sampler2D uTexture;

varying mediump vec2 vUv;
varying mediump vec4 vColor;

mediump float modI(mediump float a,mediump float b) {
    mediump float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

void main(void) {

  #ifndef QUADID
  mediump vec4 color = texture2D(uTexture, vUv) * vColor;
    #ifdef DITHERING
    mediump float offset = modI(gl_FragCoord.y, 2.0);
    if(color.a == 0.0 || (color.a < 1.0 && modI(gl_FragCoord.x+offset, 2.0) == 0.0)) discard;
    #else
    if(color.a == 0.0) discard;
    #endif
  #else
  mediump vec4 color = vColor;
  #endif

  gl_FragColor = color;
}
