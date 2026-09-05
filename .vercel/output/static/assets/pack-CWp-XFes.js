const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gifenc-D9RKotU2.js","assets/rolldown-runtime-hePW80VL.js"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-hePW80VL.js";import{t}from"./index-D7EFyn0b.js";import{a as n,c as r,d as i,i as a,l as o,n as s,o as c,r as l,s as u,u as d}from"./routes-LAD3yqh0.js";var f=Uint8Array,p=Uint16Array,m=Int32Array,h=new f([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),g=new f([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),_=new f([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),v=function(e,t){for(var n=new p(31),r=0;r<31;++r)n[r]=t+=1<<e[r-1];for(var i=new m(n[30]),r=1;r<30;++r)for(var a=n[r];a<n[r+1];++a)i[a]=a-n[r]<<5|r;return{b:n,r:i}},y=v(h,2),b=y.b,x=y.r;b[28]=258,x[258]=28;var S=v(g,0);S.b;for(var ee=S.r,C=new p(32768),w=0;w<32768;++w){var T=(w&43690)>>1|(w&21845)<<1;T=(T&52428)>>2|(T&13107)<<2,T=(T&61680)>>4|(T&3855)<<4,C[w]=((T&65280)>>8|(T&255)<<8)>>1}for(var E=(function(e,t,n){for(var r=e.length,i=0,a=new p(t);i<r;++i)e[i]&&++a[e[i]-1];var o=new p(t);for(i=1;i<t;++i)o[i]=o[i-1]+a[i-1]<<1;var s;if(n){s=new p(1<<t);var c=15-t;for(i=0;i<r;++i)if(e[i])for(var l=i<<4|e[i],u=t-e[i],d=o[e[i]-1]++<<u,f=d|(1<<u)-1;d<=f;++d)s[C[d]>>c]=l}else for(s=new p(r),i=0;i<r;++i)e[i]&&(s[i]=C[o[e[i]-1]++]>>15-e[i]);return s}),D=new f(288),w=0;w<144;++w)D[w]=8;for(var w=144;w<256;++w)D[w]=9;for(var w=256;w<280;++w)D[w]=7;for(var w=280;w<288;++w)D[w]=8;for(var O=new f(32),w=0;w<32;++w)O[w]=5;var te=E(D,9,0),k=E(O,5,0),A=function(e){return(e+7)/8|0},j=function(e,t,n){return(t==null||t<0)&&(t=0),(n==null||n>e.length)&&(n=e.length),new f(e.subarray(t,n))},M=[`unexpected EOF`,`invalid block type`,`invalid length/literal`,`invalid distance`,`stream finished`,`no stream handler`,,`no callback`,`invalid UTF-8 data`,`extra field too long`,`date not in range 1980-2099`,`filename too long`,`stream finishing`,`invalid zip data`],N=function(e,t,n){var r=Error(t||M[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,N),!n)throw r;return r},P=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8},F=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8,e[r+2]|=n>>16},I=function(e,t){for(var n=[],r=0;r<e.length;++r)e[r]&&n.push({s:r,f:e[r]});var i=n.length,a=n.slice();if(!i)return{t:V,l:0};if(i==1){var o=new f(n[0].s+1);return o[n[0].s]=1,{t:o,l:1}}n.sort(function(e,t){return e.f-t.f}),n.push({s:-1,f:25001});var s=n[0],c=n[1],l=0,u=1,d=2;for(n[0]={s:-1,f:s.f+c.f,l:s,r:c};u!=i-1;)s=n[n[l].f<n[d].f?l++:d++],c=n[l!=u&&n[l].f<n[d].f?l++:d++],n[u++]={s:-1,f:s.f+c.f,l:s,r:c};for(var m=a[0].s,r=1;r<i;++r)a[r].s>m&&(m=a[r].s);var h=new p(m+1),g=L(n[u-1],h,0);if(g>t){var r=0,_=0,v=g-t,y=1<<v;for(a.sort(function(e,t){return h[t.s]-h[e.s]||e.f-t.f});r<i;++r){var b=a[r].s;if(h[b]>t)_+=y-(1<<g-h[b]),h[b]=t;else break}for(_>>=v;_>0;){var x=a[r].s;h[x]<t?_-=1<<t-h[x]++-1:++r}for(;r>=0&&_;--r){var S=a[r].s;h[S]==t&&(--h[S],++_)}g=t}return{t:new f(h),l:g}},L=function(e,t,n){return e.s==-1?Math.max(L(e.l,t,n+1),L(e.r,t,n+1)):t[e.s]=n},R=function(e){for(var t=e.length;t&&!e[--t];);for(var n=new p(++t),r=0,i=e[0],a=1,o=function(e){n[r++]=e},s=1;s<=t;++s)if(e[s]==i&&s!=t)++a;else{if(!i&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(i),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(i);a=1,i=e[s]}return{c:n.subarray(0,r),n:t}},z=function(e,t){for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},ne=function(e,t,n){var r=n.length,i=A(t+2);e[i]=r&255,e[i+1]=r>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var a=0;a<r;++a)e[i+a+4]=n[a];return(i+4+r)*8},B=function(e,t,n,r,i,a,o,s,c,l,u){P(t,u++,n),++i[256];for(var d=I(i,15),f=d.t,m=d.l,v=I(a,15),y=v.t,b=v.l,x=R(f),S=x.c,ee=x.n,C=R(y),w=C.c,T=C.n,A=new p(19),j=0;j<S.length;++j)++A[S[j]&31];for(var j=0;j<w.length;++j)++A[w[j]&31];for(var M=I(A,7),N=M.t,L=M.l,B=19;B>4&&!N[_[B-1]];--B);var re=l+5<<3,V=z(i,D)+z(a,O)+o,H=z(i,f)+z(a,y)+o+14+3*B+z(A,N)+2*A[16]+3*A[17]+7*A[18];if(c>=0&&re<=V&&re<=H)return ne(t,u,e.subarray(c,c+l));var U,W,G,K;if(P(t,u,1+(H<V)),u+=2,H<V){U=E(f,m,0),W=f,G=E(y,b,0),K=y;var q=E(N,L,0);P(t,u,ee-257),P(t,u+5,T-1),P(t,u+10,B-4),u+=14;for(var j=0;j<B;++j)P(t,u+3*j,N[_[j]]);u+=3*B;for(var ie=[S,w],J=0;J<2;++J)for(var Y=ie[J],j=0;j<Y.length;++j){var X=Y[j]&31;P(t,u,q[X]),u+=N[X],X>15&&(P(t,u,Y[j]>>5&127),u+=Y[j]>>12)}}else U=te,W=D,G=k,K=O;for(var j=0;j<s;++j){var Z=r[j];if(Z>255){var X=Z>>18&31;F(t,u,U[X+257]),u+=W[X+257],X>7&&(P(t,u,Z>>23&31),u+=h[X]);var Q=Z&31;F(t,u,G[Q]),u+=K[Q],Q>3&&(F(t,u,Z>>5&8191),u+=g[Q])}else F(t,u,U[Z]),u+=W[Z]}return F(t,u,U[256]),u+W[256]},re=new m([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),V=new f(0),H=function(e,t,n,r,i,a){var o=a.z||e.length,s=new f(r+o+5*(1+Math.ceil(o/7e3))+i),c=s.subarray(r,s.length-i),l=a.l,u=(a.r||0)&7;if(t){u&&(c[0]=a.r>>3);for(var d=re[t-1],_=d>>13,v=d&8191,y=(1<<n)-1,b=a.p||new p(32768),S=a.h||new p(y+1),C=Math.ceil(n/3),w=2*C,T=function(t){return(e[t]^e[t+1]<<C^e[t+2]<<w)&y},E=new m(25e3),D=new p(288),O=new p(32),te=0,k=0,M=a.i||0,N=0,P=a.w||0,F=0;M+2<o;++M){var I=T(M),L=M&32767,R=S[I];if(b[L]=R,S[I]=L,P<=M){var z=o-M;if((te>7e3||N>24576)&&(z>423||!l)){u=B(e,c,0,E,D,O,k,N,F,M-F,u),N=te=k=0,F=M;for(var V=0;V<286;++V)D[V]=0;for(var V=0;V<30;++V)O[V]=0}var H=2,U=0,W=v,G=L-R&32767;if(z>2&&I==T(M-G))for(var K=Math.min(_,z)-1,q=Math.min(32767,M),ie=Math.min(258,z);G<=q&&--W&&L!=R;){if(e[M+H]==e[M+H-G]){for(var J=0;J<ie&&e[M+J]==e[M+J-G];++J);if(J>H){if(H=J,U=G,J>K)break;for(var Y=Math.min(G,J-2),X=0,V=0;V<Y;++V){var Z=M-G+V&32767,Q=Z-b[Z]&32767;Q>X&&(X=Q,R=Z)}}}L=R,R=b[L],G+=L-R&32767}if(U){E[N++]=268435456|x[H]<<18|ee[U];var ae=x[H]&31,oe=ee[U]&31;k+=h[ae]+g[oe],++D[257+ae],++O[oe],P=M+H,++te}else E[N++]=e[M],++D[e[M]]}}for(M=Math.max(M,P);M<o;++M)E[N++]=e[M],++D[e[M]];u=B(e,c,l,E,D,O,k,N,F,M-F,u),l||(a.r=u&7|c[u/8|0]<<3,u-=7,a.h=S,a.p=b,a.i=M,a.w=P)}else{for(var M=a.w||0;M<o+l;M+=65535){var se=M+65535;se>=o&&(c[u/8|0]=l,se=o),u=ne(c,u+1,e.subarray(M,se))}a.i=o}return j(s,0,r+A(u)+i)},U=(function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var n=t,r=9;--r;)n=(n&1&&-306674912)^n>>>1;e[t]=n}return e})(),W=function(){var e=-1;return{p:function(t){for(var n=e,r=0;r<t.length;++r)n=U[n&255^t[r]]^n>>>8;e=n},d:function(){return~e}}},G=function(e,t,n,r,i){if(!i&&(i={l:1},t.dictionary)){var a=t.dictionary.subarray(-32768),o=new f(a.length+e.length);o.set(a),o.set(e,a.length),e=o,i.w=a.length}return H(e,t.level==null?6:t.level,t.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,n,r,i)},K=function(e,t){var n={};for(var r in e)n[r]=e[r];for(var r in t)n[r]=t[r];return n},q=function(e,t,n){for(;n;++t)e[t]=n,n>>>=8};function ie(e,t){return G(e,t||{},0,0)}var J=function(e,t,n,r){for(var i in e){var a=e[i],o=t+i,s=r;Array.isArray(a)&&(s=K(r,a[1]),a=a[0]),ArrayBuffer.isView(a)?n[o]=[a,s]:(n[o+=`/`]=[new f(0),s],J(a,o,n,r))}},Y=typeof TextEncoder<`u`&&new TextEncoder,X=typeof TextDecoder<`u`&&new TextDecoder;try{X.decode(V,{stream:!0})}catch{}function Z(e,t){if(t){for(var n=new f(e.length),r=0;r<e.length;++r)n[r]=e.charCodeAt(r);return n}if(Y)return Y.encode(e);for(var i=e.length,a=new f(e.length+(e.length>>1)),o=0,s=function(e){a[o++]=e},r=0;r<i;++r){if(o+5>a.length){var c=new f(o+8+(i-r<<1));c.set(a),a=c}var l=e.charCodeAt(r);l<128||t?s(l):l<2048?(s(192|l>>6),s(128|l&63)):l>55295&&l<57344?(l=65536+(l&1047552)|e.charCodeAt(++r)&1023,s(240|l>>18),s(128|l>>12&63),s(128|l>>6&63),s(128|l&63)):(s(224|l>>12),s(128|l>>6&63),s(128|l&63))}return j(a,0,o)}var Q=function(e){var t=0;if(e)for(var n in e){var r=e[n].length;r>65535&&N(9),t+=r+4}return t},ae=function(e,t,n,r,i,a,o,s){var c=r.length,l=n.extra,u=s&&s.length,d=Q(l);q(e,t,o==null?67324752:33639248),t+=4,o!=null&&(e[t++]=20,e[t++]=n.os),e[t]=20,t+=2,e[t++]=n.flag<<1|(a<0&&8),e[t++]=i&&8,e[t++]=n.compression&255,e[t++]=n.compression>>8;var f=new Date(n.mtime==null?Date.now():n.mtime),p=f.getFullYear()-1980;if((p<0||p>119)&&N(10),q(e,t,p<<25|f.getMonth()+1<<21|f.getDate()<<16|f.getHours()<<11|f.getMinutes()<<5|f.getSeconds()>>1),t+=4,a!=-1&&(q(e,t,n.crc),q(e,t+4,a<0?-a-2:a),q(e,t+8,n.size)),q(e,t+12,c),q(e,t+14,d),t+=16,o!=null&&(q(e,t,u),q(e,t+6,n.attrs),q(e,t+10,o),t+=14),e.set(r,t),t+=c,d)for(var m in l){var h=l[m],g=h.length;q(e,t,+m),q(e,t+2,g),e.set(h,t+4),t+=4+g}return u&&(e.set(s,t),t+=u),t},oe=function(e,t,n,r,i){q(e,t,101010256),q(e,t+8,n),q(e,t+10,n),q(e,t+12,r),q(e,t+16,i)};function se(e,t){t||={};var n={},r=[];J(e,``,n,t);var i=0,a=0;for(var o in n){var s=n[o],c=s[0],l=s[1],u=l.level==0?0:8,d=Z(o),p=d.length,m=l.comment,h=m&&Z(m),g=h&&h.length,_=Q(l.extra);p>65535&&N(11);var v=u?ie(c,l):c,y=v.length,b=W();b.p(c),r.push(K(l,{size:c.length,crc:b.d(),c:v,f:d,m:h,u:p!=o.length||h&&m.length!=g,o:i,compression:u})),i+=30+p+_+y,a+=76+2*(p+_)+(g||0)+y}for(var x=new f(a+22),S=i,ee=a-i,C=0;C<r.length;++C){var d=r[C];ae(x,d.o,d,d.f,d.u,d.c.length);var w=30+d.f.length+Q(d.extra);x.set(d.c,d.o+w),ae(x,i,d,d.f,d.u,d.c.length,d.o,d.m),i+=16+w+(d.m?d.m.length:0)}return oe(x,i,r.length,ee,S),x}function ce(e){let t=[],n={};for(let e of u){let i=r[e];o.forEach((r,a)=>{let o=`${e}_${r}`,s=[];for(let t=0;t<i.frames;t++)s.push({texture:`${e}.png`,x:t*64,y:a*64,w:64,h:64});t.push({name:o,speed:i.fps,loop:i.loop,frames:s}),i.hitFrame!==void 0&&(n[o]=i.hitFrame)})}return{resource:`SpriteFrames`,animations:t,meta:{hitFrames:n,pivot:{...i},hitbox:{...d}}}}var le=`@tool
extends EditorScript
## SPRITEFORGE — Godot 4.x importer
## Place this pack at res://sprites/spriteforge/<id>/ then run:
##   File → Run (this script)  or  attach as a tool and click Run
## Reads atlas.json (source of truth). Never hardcodes frame counts.

const CELL := 64

func _run() -> void:
	var godot_dir := get_script().resource_path.get_base_dir()
	var engines_dir := godot_dir.get_base_dir()
	var pack_dir := engines_dir.get_base_dir()
	var atlas_path := pack_dir.path_join("atlas.json")
	if not FileAccess.file_exists(atlas_path):
		push_error("SPRITEFORGE: atlas.json not found at %s" % atlas_path)
		return
	var atlas := JSON.parse_string(FileAccess.get_file_as_string(atlas_path))
	if typeof(atlas) != TYPE_DICTIONARY:
		push_error("SPRITEFORGE: invalid atlas.json")
		return

	var frames := SpriteFrames.new()
	var cell_w: int = int(atlas.get("cell", {}).get("w", CELL))
	var cell_h: int = int(atlas.get("cell", {}).get("h", CELL))
	var dirs: Array = atlas.get("directions", ["down", "up", "right", "left"])
	var anims: Dictionary = atlas.get("animations", {})
	var per_action: Dictionary = atlas.get("sheet", {}).get("perAction", {})
	var shared_dir := engines_dir.path_join("_shared")

	for action in anims.keys():
		var spec: Dictionary = anims[action]
		var png_rel: String = String(per_action.get(action, "engines/_shared/%s.png" % action))
		var png_path := pack_dir.path_join(png_rel)
		if not FileAccess.file_exists(png_path):
			png_path = shared_dir.path_join("%s.png" % action)
		if not FileAccess.file_exists(png_path):
			push_warning("SPRITEFORGE: missing %s.png" % action)
			continue
		var tex := load(png_path) as Texture2D
		if tex == null:
			push_warning("SPRITEFORGE: could not load %s" % png_path)
			continue
		var nframes: int = int(spec.get("frames", 8))
		var fps: float = float(spec.get("fps", 8))
		var loop: bool = bool(spec.get("loop", true))
		var dir_i := 0
		for dir in dirs:
			var anim_name := "%s_%s" % [action, dir]
			if frames.has_animation(anim_name):
				frames.remove_animation(anim_name)
			frames.add_animation(anim_name)
			frames.set_animation_speed(anim_name, fps)
			frames.set_animation_loop(anim_name, loop)
			for f in nframes:
				var at := AtlasTexture.new()
				at.atlas = tex
				at.region = Rect2(f * cell_w, dir_i * cell_h, cell_w, cell_h)
				at.filter_clip = true
				frames.add_frame(anim_name, at)
			dir_i += 1

	var out_path := pack_dir.path_join("%s_frames.tres" % String(atlas.get("id", "hero")))
	var err := ResourceSaver.save(frames, out_path)
	if err != OK:
		push_error("SPRITEFORGE: failed to save %s (%s)" % [out_path, err])
		return
	print("SPRITEFORGE: wrote ", out_path)

	_make_scene(atlas, frames, pack_dir)

func _make_scene(atlas: Dictionary, frames: SpriteFrames, pack_dir: String) -> void:
	var id := String(atlas.get("id", "hero"))
	var root := Node2D.new()
	root.name = id.capitalize()
	var sprite := AnimatedSprite2D.new()
	sprite.name = "AnimatedSprite2D"
	sprite.sprite_frames = frames
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var pivot: Dictionary = atlas.get("pivot", {"x": 32, "y": 56})
	# Cell origin is top-left; put feet (pivot) on the Node2D origin.
	sprite.offset = Vector2(-float(pivot.get("x", 32)), -float(pivot.get("y", 56)))
	sprite.centered = false
	if frames.has_animation("walk_down"):
		sprite.animation = "walk_down"
		sprite.play("walk_down")
	var hit := atlas.get("animations", {}).get("attack", {}).get("hitFrame", 3)
	sprite.set_meta("hit_frame", int(hit))
	root.add_child(sprite)
	sprite.owner = root

	var body := CharacterBody2D.new()
	body.name = "Hitbox"
	var col := CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var hb: Dictionary = atlas.get("hitbox", {"x": 22, "y": 20, "w": 20, "h": 36})
	var shape := RectangleShape2D.new()
	shape.size = Vector2(float(hb.get("w", 20)), float(hb.get("h", 36)))
	col.shape = shape
	# Hitbox is defined in cell space; offset relative to pivot (feet).
	col.position = Vector2(
		float(hb.get("x", 22)) + float(hb.get("w", 20)) / 2.0 - float(pivot.get("x", 32)),
		float(hb.get("y", 20)) + float(hb.get("h", 36)) / 2.0 - float(pivot.get("y", 56))
	)
	body.add_child(col)
	root.add_child(body)
	body.owner = root
	col.owner = root

	var scene := PackedScene.new()
	scene.pack(root)
	var scene_path := pack_dir.path_join("%s.tscn" % id)
	ResourceSaver.save(scene, scene_path)
	print("SPRITEFORGE: wrote ", scene_path)
`,ue=`# SPRITEFORGE → Godot 4.x

Drop-in do pack \`<id>/\` para um projeto Godot **4.x** (Godot 3 está fora do MVP).

## Importar

1. Copie a pasta do personagem para \`res://sprites/spriteforge/<id>/\`.
2. Abra o Godot 4. Confirme que os PNG em \`engines/_shared/\` importaram com
   **Filter = Nearest** (Point) e **Mipmaps off**.
3. Abra \`engines/godot/spriteforge_importer.gd\` e rode **File → Run**.
4. O script lê \`atlas.json\` (source of truth), fatiar cada PNG 64×64,
   grava \`<id>_frames.tres\` e uma cena \`<id>.tscn\` com:
   - \`AnimatedSprite2D\` (animações \`{action}_{direction}\`)
   - \`CollisionShape2D\` do hitbox, offset relativo ao pivot (32, 56)
   - meta \`hit_frame\` no sprite (ataque = 3, 0-index)

## API sugerida

\`\`\`gdscript
func play_action(action: String, dir: String) -> void:
    $AnimatedSprite2D.play("%s_%s" % [action, dir])

func is_hit_frame() -> bool:
    var anim := $AnimatedSprite2D.animation
    if not anim.begins_with("attack"):
        return false
    return $AnimatedSprite2D.frame == int($AnimatedSprite2D.get_meta("hit_frame", 3))
\`\`\`

Filtro: **Nearest / Point**. Nunca bilinear — derrete o pixel.
`,de=`; SPRITEFORGE example scene (generated by spriteforge_importer.gd)
; Godot 4.x — AnimatedSprite2D + hitbox
; Animations: walk_down, walk_up, walk_right, walk_left, run_*, attack_*, ...
`;function fe(e){let t={},n={};for(let i of u){let a=r[i].frames;o.forEach((r,o)=>{let s=[];for(let e=0;e<a;e++){let n=`${i}_${r}_${e}`;s.push(n),t[n]={frame:{x:e*64,y:o*64,w:64,h:64}}}n[`${e.id}-${i}-${r}`]=s})}return{frames:t,meta:{image:`walk.png`,size:{w:512,h:256},scale:`1`,app:`SPRITEFORGE`},animations:n}}function pe(e){let t=u.map(t=>`    this.load.spritesheet("${e.id}_${t}", "engines/_shared/${t}.png", { frameWidth: 64, frameHeight: 64 });`).join(`
`),n=u.map(t=>{let n=r[t];return`    dirs.forEach((dir, row) => {
      this.anims.create({
        key: "${e.id}-${t}-" + dir,
        frames: this.anims.generateFrameNumbers("${e.id}_${t}", { start: row * 8, end: row * 8 + ${n.frames-1} }),
        frameRate: ${n.fps},
        repeat: ${n.loop?-1:0},
      });
    });`}).join(`
`);return`// SPRITEFORGE — Phaser 3 example scene
import Phaser from "phaser";

export class ${ve(e.id)}Scene extends Phaser.Scene {
  constructor() { super("${e.id}"); }
  preload() {
${t}
  }
  create() {
    const dirs = ["down", "up", "right", "left"] as const;
${n}
    const sprite = this.add.sprite(160, 120, "${e.id}_walk", 0);
    sprite.setScale(2);
    sprite.play("${e.id}-walk-down");
    sprite.setData("hitFrame", 3);
  }
}
`}function me(e,t){let n=r[t].frames,i={},a={};return o.forEach((e,r)=>{let o=[];for(let a=0;a<n;a++){let n=`${t}_${e}_${a}`;o.push(n),i[n]={frame:{x:a*64,y:r*64,w:64,h:64},sourceSize:{w:64,h:64},spriteSourceSize:{x:0,y:0,w:64,h:64},rotated:!1,trimmed:!1}}a[`${t}_${e}`]=o}),{frames:i,animations:a,meta:{image:`${t}.png`,size:{w:512,h:256},scale:`1`,app:`SPRITEFORGE`,format:`RGBA8888`}}}function he(e){let t=[];for(let e of u){let n=r[e].frames;o.forEach((r,i)=>{for(let a=0;a<n;a++)t.push({name:`${e}_${r}_${a}`,rect:{x:a*64,y:i*64,w:64,h:64},pivot:{x:32/64,y:1-56/64}})})}return{texture:`walk.png`,pixelsPerUnit:64,filter:`Point`,compression:`None`,spriteMode:`Multiple`,sprites:t,atlasId:e.id}}var ge=`// SPRITEFORGE Unity 2D importer
// Place this file in Assets/Editor/SpriteForgeImporter.cs (rename from .cs.txt)
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

public class SpriteForgeImporter : EditorWindow
{
    [MenuItem("SPRITEFORGE/Import Selected Folder")]
    static void Import()
    {
        var path = EditorUtility.OpenFolderPanel("SPRITEFORGE pack", "Assets", "");
        if (string.IsNullOrEmpty(path)) return;
        Debug.Log("SPRITEFORGE: import " + path + " — use slice.json for grid 8x4, PPU=64, Filter=Point.");
    }
}
#endif
`,_e=`# SPRITEFORGE → Unity 2D

1. Importe os PNG de \`engines/_shared/\` (um por ação, 512×256, 8×4 células 64×64).
2. Texture Type = Sprite (2D and UI), Sprite Mode = **Multiple**, Pixels Per Unit = **64**,
   Filter Mode = **Point**, Compression = **None**.
3. Sprite Editor → Slice Grid By Cell Size 64×64.
4. Nomes: \`walk_down_0\` … (row 0 = down, row 1 = up, row 2 = right, row 3 = left).
5. Copie \`SpriteForgeImporter.cs.txt\` para \`Assets/Editor/SpriteForgeImporter.cs\`.
`;function ve(e){return e.split(/[-_]/).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(``)}function $(e,t){let n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=t,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1500)}async function ye(e){return new Uint8Array(await e.arrayBuffer())}async function be(n){let i=await t(()=>import(`./gifenc-D9RKotU2.js`).then(t=>e(t.default,1)),__vite__mapDeps([0,1])),a=i.GIFEncoder,o=i.quantize,s=i.applyPalette,c=r.walk.frames,l=a(),u=null;for(let e=0;e<c;e++){let t=new Uint8ClampedArray(16384),r=n.perAction.walk;for(let n=0;n<64;n++)for(let i=0;i<64;i++){let a=(n*r.w+(e*64+i))*4,o=(n*64+i)*4;t[o]=r.data[a],t[o+1]=r.data[a+1],t[o+2]=r.data[a+2],t[o+3]=r.data[a+3],t[o+3]<8&&(t[o]=11,t[o+1]=12,t[o+2]=14,t[o+3]=255)}u||=o(t,256);let i=s(t,u);l.writeFrame(i,64,64,{palette:u,delay:125})}return l.finish(),l.bytes()}async function xe(e,t=`master`){let n=s(e.id),r=t===`icon`?n.icon32:n.master;$(await a(r),`${e.id}-${t===`icon`?`icon32`:`sheet`}.png`)}async function Se(e){let t=s(e.id);$(await l(t.master),`${e.id}-sheet.jpg`)}function Ce(e){let t=s(e.id),r=n(t.icon32);$(new Blob([r],{type:`image/svg+xml`}),`${e.id}-idle_32.svg`)}function we(e){let t=c(e),n=JSON.stringify(t,null,2);$(new Blob([n],{type:`application/json`}),`atlas.json`)}async function Te(e,t){let n=se(await De(e,t),{level:6}),r=t===`generico`?`${e.id}-generic.zip`:`${e.id}-${t}-pack.zip`;$(new Blob([n],{type:`application/zip`}),r)}async function Ee(e){let t=await De(e,`godot`),n=await De(e,`phaser`),r={...t};for(let[e,t]of Object.entries(n))e in r||(r[e]=t);let i=await De(e,`pixi`);for(let[e,t]of Object.entries(i))e in r||(r[e]=t);let a=await De(e,`unity`);for(let[e,t]of Object.entries(a))e in r||(r[e]=t);let o=se(r,{level:6});$(new Blob([o],{type:`application/zip`}),`${e.id}-gamepack.zip`)}async function De(e,t){let r=s(e.id),i=c(e),o=`${e.id}/`,l={};l[o+`atlas.json`]=Z(JSON.stringify(i,null,2)),l[o+`sheet.png`]=await ye(await a(r.master)),l[o+`icons/idle_32.png`]=await ye(await a(r.icon32)),l[o+`icons/idle_32.svg`]=Z(n(r.icon32)),l[o+`preview.gif`]=await be(r);for(let e of u)l[o+`engines/_shared/${e}.png`]=await ye(await a(r.perAction[e]));return(t===`godot`||t===`generico`)&&(l[o+`engines/godot/spriteforge_importer.gd`]=Z(le),l[o+`engines/godot/spriteframes.json`]=Z(JSON.stringify(ce(i),null,2)),l[o+`engines/godot/templar.tscn.example`]=Z(de),l[o+`engines/godot/README.md`]=Z(ue)),(t===`phaser`||t===`generico`)&&(l[o+`engines/phaser/templar-atlas.json`]=Z(JSON.stringify(fe(i),null,2)),l[o+`engines/phaser/example-scene.ts`]=Z(pe(e))),(t===`pixi`||t===`generico`)&&(l[o+`engines/pixi/templar-pixi.json`]=Z(JSON.stringify(me(i,`walk`),null,2))),(t===`unity`||t===`generico`)&&(l[o+`engines/unity/slice.json`]=Z(JSON.stringify(he(i),null,2)),l[o+`engines/unity/SpriteForgeImporter.cs.txt`]=Z(ge),l[o+`engines/unity/AnimationImport.md`]=Z(_e)),l}export{we as exportAtlasJson,Ee as exportBatchZip,Te as exportEnginePack,Se as exportJpg,xe as exportPng,Ce as exportSvg};