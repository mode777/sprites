uniform sampler2D uTexture;

varying mediump vec2 vUv;

mediump float modI(mediump float a,mediump float b) {
    mediump float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

void main(void) {
  mediump vec4 color = texture2D(uTexture, vUv);
  
  //if(color.a == 0.0) discard;
  mediump float offset = modI(gl_FragCoord.y, 2.0);
  if(color.a == 0.0 || (color.a < 1.0 && modI(gl_FragCoord.x+offset, 2.0) == 0.0)) discard;
  //mediump vec4 color = vec4(1.0,1.0,1.0,1.0);
  gl_FragColor = color; /*mix(vec4(1.0,0.0,1.0,1.0), color, color.a);*/
}
