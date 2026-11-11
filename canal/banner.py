import math, random
random.seed(21)
W,H=2560,1440; CX,CY=1280,720
def smooth(pts):
    n=len(pts); d=f"M{pts[0][0]:.1f} {pts[0][1]:.1f} "
    for i in range(n):
        p0,p1,p2,p3=pts[i-1],pts[i],pts[(i+1)%n],pts[(i+2)%n]
        c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6); c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
        d+=f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f} "
    return d+"Z"
def eye(x,y,r,px=0.3,py=0.2):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" stroke="#1E293B" stroke-width="5"/><circle cx="{x+r*px:.1f}" cy="{y+r*py:.1f}" r="{r*0.5:.1f}" fill="#1E293B"/><circle cx="{x+r*px+r*0.16:.1f}" cy="{y+r*py-r*0.2:.1f}" r="{r*0.17:.1f}" fill="#fff"/>'
def cell(x,y,s,rot,col,dark,seed,mood=None,op=1,blur=False):
    rr=random.Random(seed); n=9
    pts=[(100*(1+rr.uniform(-.13,.13))*math.cos(i/n*6.283),92*(1+rr.uniform(-.13,.13))*math.sin(i/n*6.283)) for i in range(n)]
    d=smooth(pts)
    flag="".join(f'<path d="M{88*math.cos(a):.0f} {80*math.sin(a):.0f} c{40*math.cos(a+.6):.0f} {40*math.sin(a+.6):.0f} {70*math.cos(a-.5):.0f} {70*math.sin(a-.5):.0f} {110*math.cos(a):.0f} {110*math.sin(a):.0f}" stroke="{dark}" stroke-width="8" fill="none" stroke-linecap="round"/>' for a in [rr.uniform(0,6.28) for _ in range(rr.choice([0,2,3]))])
    cil="".join(f'<path d="M{100*math.cos(a):.0f} {92*math.sin(a):.0f} l{14*math.cos(a):.0f} {14*math.sin(a):.0f}" stroke="{dark}" stroke-width="5" stroke-linecap="round"/>' for a in [i/22*6.283 for i in range(22)]) if rr.random()<.4 else ""
    org="".join(f'<ellipse cx="{rr.uniform(-50,50):.0f}" cy="{rr.uniform(25,60):.0f}" rx="{rr.uniform(8,14):.0f}" ry="7" fill="{dark}" opacity=".35"/>' for _ in range(3))
    m=mood or rr.choice(["tongue","fang","wow","grin"])
    mouth={"tongue":'<path d="M-32 28 C-14 72 18 72 36 28 Z" fill="#7F1D1D"/><path d="M-4 44 C2 76 24 74 24 44 Z" fill="#FB7185"/>',
           "fang":'<path d="M-36 32 Q0 62 36 32" stroke="#1E293B" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-10 44 l12 1 l-7 15 Z" fill="#fff" stroke="#1E293B" stroke-width="2"/>',
           "wow":'<ellipse cx="2" cy="44" rx="20" ry="27" fill="#7F1D1D"/><ellipse cx="2" cy="56" rx="11" ry="8" fill="#FB7185"/>',
           "grin":'<path d="M-40 26 Q2 80 42 26 Z" fill="#7F1D1D"/><path d="M-34 30 L36 30 L32 42 L-30 42 Z" fill="#fff"/>'}[m]
    brow=f'<path d="M-56 -50 L-12 -40" stroke="#1E293B" stroke-width="7" stroke-linecap="round"/><path d="M14 -56 L48 -64" stroke="#1E293B" stroke-width="7" stroke-linecap="round"/>' if rr.random()<.5 else ""
    f=' filter="url(#bl)"' if blur else ""
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" opacity="{op}"{f}>{flag}{cil}<path d="{d}" fill="{col}" stroke="{dark}" stroke-width="8"/><path d="{smooth([(p[0]*.82,p[1]*.82) for p in pts])}" fill="#fff" opacity=".12"/>{org}<ellipse cx="-40" cy="-50" rx="22" ry="12" fill="#fff" opacity=".45" transform="rotate(-30 -40 -50)"/>{eye(-30,-12,28,rr.uniform(-.45,.45),rr.uniform(-.45,.45))}{eye(28,-18,19,rr.uniform(-.45,.45),rr.uniform(-.45,.45))}{brow}{mouth}</g>'
def tooth(x,y,s,rot,face,op=1):
    f={'happy':'<circle cx="-10" cy="-4" r="4" fill="#1F2937"/><circle cx="10" cy="-4" r="4" fill="#1F2937"/><path d="M-9 6 C-4 13 4 13 9 6" stroke="#1F2937" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
       'wink':'<path d="M-15 -4 L-6 -4" stroke="#1F2937" stroke-width="3.5" stroke-linecap="round"/><circle cx="10" cy="-4" r="4" fill="#1F2937"/><path d="M-9 5 C-4 14 4 14 9 5 Z" fill="#BE123C"/>',
       'wow':'<circle cx="-10" cy="-5" r="5" fill="#1F2937"/><circle cx="10" cy="-5" r="5" fill="#1F2937"/><ellipse cx="0" cy="9" rx="5" ry="6" fill="#BE123C"/>',
       'cool':'<rect x="-22" y="-12" width="18" height="11" rx="4" fill="#1F2937"/><rect x="4" y="-12" width="18" height="11" rx="4" fill="#1F2937"/><path d="M-4 -8 H4" stroke="#1F2937" stroke-width="3"/><path d="M-9 8 C-4 14 4 14 9 8" stroke="#1F2937" stroke-width="3.5" fill="none" stroke-linecap="round"/>'}[face]
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" opacity="{op}"><path d="M-32 -20 C-46 -50 -10 -62 0 -44 C10 -62 46 -50 32 -20 C28 6 26 50 14 52 C6 52 6 22 0 22 C-6 22 -6 52 -14 52 C-26 50 -28 6 -32 -20 Z" fill="#fff" stroke="#1E293B" stroke-width="5"/>{f}<ellipse cx="-17" cy="6" rx="6" ry="3.5" fill="#F9A8D4"/><ellipse cx="17" cy="6" rx="6" ry="3.5" fill="#F9A8D4"/><path d="M-24 -34 C-20 -42 -12 -44 -6 -40" stroke="#fff" stroke-width="0"/></g>'
def lips(x,y,s,rot):
    t="".join(f'<rect x="{-75+i*25}" y="-32" width="23" height="26" rx="6" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>' for i in range(6))
    b="".join(f'<rect x="{-62+i*25}" y="12" width="23" height="22" rx="6" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>' for i in range(5))
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})"><path d="M-130 0 C-100 -70 -40 -70 0 -52 C40 -70 100 -70 130 0 C100 80 -100 80 -130 0 Z" fill="#E11D48" stroke="#881337" stroke-width="8"/><path d="M-100 -4 C-60 -36 60 -36 100 -4 C60 50 -60 50 -100 -4 Z" fill="#4C0519"/>{t}{b}<path d="M-40 28 C-30 80 30 80 40 28 C20 14 -20 14 -40 28 Z" fill="#FB7185" stroke="#BE123C" stroke-width="4"/><ellipse cx="-70" cy="-48" rx="22" ry="8" fill="#fff" opacity=".45"/></g>'
def dna(x,y,s,rot):
    a="";b="";r=""
    for i in range(41):
        t=i/40; yy=-200+400*t; xx=50*math.sin(t*4*math.pi)
        a+=("M" if i==0 else "L")+f"{xx:.1f} {yy:.1f} "; b+=("M" if i==0 else "L")+f"{-xx:.1f} {yy:.1f} "
        if i%3==1: r+=f'<path d="M{xx:.1f} {yy:.1f} L{-xx:.1f} {yy:.1f}" stroke="{["#22D3EE","#A3E635","#F472B6","#FACC15"][i%4]}" stroke-width="11" stroke-linecap="round"/>'
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})">{r}<path d="{a}" stroke="#1E293B" stroke-width="24" fill="none" stroke-linecap="round"/><path d="{b}" stroke="#1E293B" stroke-width="24" fill="none" stroke-linecap="round"/><path d="{a}" stroke="#8B5CF6" stroke-width="14" fill="none" stroke-linecap="round"/><path d="{b}" stroke="#EC4899" stroke-width="14" fill="none" stroke-linecap="round"/></g>'
def atom(x,y,s,rot,core="#F43F5E"):
    o="".join(f'<ellipse rx="150" ry="52" fill="none" stroke="#1E293B" stroke-width="16" transform="rotate({a})"/><ellipse rx="150" ry="52" fill="none" stroke="#fff" stroke-width="8" transform="rotate({a})"/>' for a in (0,60,120))
    e="".join(f'<circle cx="{150*math.cos(math.radians(t)):.0f}" cy="{52*math.sin(math.radians(t)):.0f}" r="16" fill="#22D3EE" stroke="#1E293B" stroke-width="5" transform="rotate({a})"/>' for a,t in ((0,30),(60,200),(120,320)))
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})">{o}{e}<circle r="38" fill="{core}" stroke="#1E293B" stroke-width="7"/><circle cx="-11" cy="-11" r="10" fill="#fff" opacity=".6"/></g>'
def flask(x,y,s,rot,col):
    bub="".join(f'<circle cx="{(-1)**i*14:.0f}" cy="{-160-i*44:.0f}" r="{12+i*5}" fill="{col}" stroke="#1E293B" stroke-width="4" opacity="{1-i*.18:.2f}"/>' for i in range(4))
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({s})">{bub}<path d="M-30 -120 L-30 -40 L-110 90 C-120 110 -105 125 -85 125 L85 125 C105 125 120 110 110 90 L30 -40 L30 -120 Z" fill="#E0F2FE" stroke="#1E293B" stroke-width="8" stroke-linejoin="round"/><path d="M-62 20 L62 20 L105 95 C112 110 100 118 85 118 L-85 118 C-100 118 -112 110 -105 95 Z" fill="{col}"/><rect x="-40" y="-136" width="80" height="22" rx="8" fill="#94A3B8" stroke="#1E293B" stroke-width="6"/>{eye(-30,70,18)}{eye(28,72,18)}<path d="M-14 96 Q2 108 18 96" stroke="#1E293B" stroke-width="5" fill="none" stroke-linecap="round"/></g>'''
def microscope(x,y,s,rot):
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({s})" stroke="#1E293B" stroke-width="7" stroke-linejoin="round"><rect x="-110" y="150" width="220" height="40" rx="14" fill="#8B5CF6"/><path d="M40 150 C120 120 120 0 60 -40" fill="none" stroke-width="30"/><path d="M40 150 C120 120 120 0 60 -40" fill="none" stroke-width="16" stroke="#A78BFA"/><rect x="-90" y="70" width="140" height="22" rx="8" fill="#C4B5FD"/><g transform="rotate(-28)"><rect x="-40" y="-170" width="60" height="200" rx="14" fill="#E2E8F0"/><rect x="-50" y="-200" width="80" height="40" rx="12" fill="#22D3EE"/><rect x="-26" y="30" width="32" height="40" rx="8" fill="#94A3B8"/></g></g>'''
def tubes(x,y,s,rot):
    cs=["#A3E635","#F472B6","#22D3EE"]
    t="".join(f'<g transform="translate({-70+i*70},0)"><rect x="-22" y="-150" width="44" height="220" rx="22" fill="#F8FAFC" stroke="#1E293B" stroke-width="6"/><rect x="-16" y="{-40-i*25}" width="32" height="{104+i*25}" rx="16" fill="{cs[i]}"/></g>' for i in range(3))
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})"><rect x="-120" y="-20" width="240" height="26" rx="8" fill="#F97316" stroke="#1E293B" stroke-width="6"/>{t}<rect x="-120" y="60" width="240" height="26" rx="8" fill="#F97316" stroke="#1E293B" stroke-width="6"/></g>'
def bolt(x,y,s,rot): return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})"><path d="M10 -90 L-50 10 L-5 10 L-25 90 L50 -20 L5 -20 Z" fill="#FDE047" stroke="#1E293B" stroke-width="7" stroke-linejoin="round"/></g>'
def sparkle(x,y,s,c="#fff"): return f'<path transform="translate({x},{y}) scale({s})" d="M0 -30 l8 22 l22 8 l-22 8 l-8 22 l-8 -22 l-22 -8 l22 -8 Z" fill="{c}"/>'
def burst(x,y,R,r,n,fill,stroke,sw,rot=0):
    pts=[]
    for i in range(2*n):
        rad=R if i%2==0 else r; rad*= (1+random.uniform(-.08,.08)) if i%2==0 else 1
        a=math.radians(rot)+i*math.pi/n; pts.append(f"{x+rad*math.cos(a):.0f},{y+rad*math.sin(a)*0.72:.0f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'
# ── boca gegant (portal) ──
def megamouth(x,y,s):
    stars="".join(sparkle(random.uniform(-150,150),random.uniform(-40,60),random.uniform(.2,.5),random.choice(["#FDE047","#fff","#67E8F9"])) for _ in range(14))
    ut="".join(f'<path d="M{-170+i*42} -58 h38 v40 q-19 18 -38 0 Z" fill="#fff" stroke="#94A3B8" stroke-width="3"/>' for i in range(9))
    lt="".join(f'<path d="M{-150+i*42} 92 h38 v-34 q-19 -16 -38 0 Z" fill="#fff" stroke="#94A3B8" stroke-width="3"/>' for i in range(8))
    return f'''<g transform="translate({x},{y}) scale({s})">
    <path d="M-300 10 C-260 -150 -90 -150 0 -110 C90 -150 260 -150 300 10 C250 200 -250 200 -300 10 Z" fill="#E11D48" stroke="#1E293B" stroke-width="14"/>
    <path d="M-230 14 C-170 -96 170 -96 230 14 C170 150 -170 150 -230 14 Z" fill="url(#space)"/>
    {stars}
    <path d="M-90 100 C-80 40 80 40 90 100 C60 130 -60 130 -90 100 Z" fill="#FB7185" stroke="#BE123C" stroke-width="6"/><path d="M0 60 V112" stroke="#BE123C" stroke-width="5"/>
    {ut}{lt}
    <path d="M-250 -80 C-200 -126 -120 -128 -70 -110" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M-120 150 C-60 172 60 172 120 150" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".35"/></g>'''
def speed(x,y,ang,L):
    a=math.radians(ang); return f'<path d="M{x:.0f} {y:.0f} l{-L*math.cos(a):.0f} {-L*math.sin(a):.0f}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>'
rays=""
for i in range(40):
    a0=i*9; a1=a0+4.5
    p=lambda a:(CX+3200*math.cos(math.radians(a)),CY+3200*math.sin(math.radians(a)))
    x0,y0=p(a0);x1,y1=p(a1)
    rays+=f'<path d="M{CX} {CY} L{x0:.0f} {y0:.0f} L{x1:.0f} {y1:.0f} Z" fill="#FB923C" opacity=".45"/>'
conf=""
cols=["#EC4899","#22D3EE","#A3E635","#8B5CF6","#F43F5E","#FFFFFF"]
for i in range(200):
    x=random.uniform(0,W); y=random.uniform(0,H)
    if abs(x-CX)<420 and abs(y-CY)<220: continue
    c=random.choice(cols); r=random.uniform(0,180)
    conf+= f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{random.uniform(6,12):.0f}" fill="{c}"/>' if i%3==0 else f'<rect x="{x:.0f}" y="{y:.0f}" width="26" height="12" rx="5" fill="{c}" transform="rotate({r:.0f} {x:.0f} {y:.0f})"/>'
back=[cell(180,260,0.9,10,"#FBCFE8","#9D174D",31,op=.5,blur=True),cell(2380,1180,0.9,-10,"#BAE6FD","#075985",32,op=.5,blur=True),
      cell(820,160,0.6,-20,"#D9F99D","#3F6212",33,op=.5,blur=True),cell(1760,1300,0.6,20,"#E9D5FF","#6B21A8",34,op=.5,blur=True),
      cell(2050,140,0.7,15,"#FED7AA","#9A3412",35,op=.5,blur=True),cell(520,1320,0.7,-15,"#A5F3FC","#155E75",36,op=.5,blur=True),
      dna(1050,1330,0.55,-80)]
# esclat central
center=burst(CX,CY,520,380,18,"#FEF08A","#1E293B",0)+burst(CX,CY,470,360,18,"#FFFFFF","#1E293B",10,8)
lines="".join(speed(CX+r*math.cos(math.radians(a)),CY+r*0.62*math.sin(math.radians(a)),a,120) for a,r in [(a,560+random.uniform(0,60)) for a in range(0,360,20)])
mid=[
 # zona segura: x 507..2053, y 508..932
 megamouth(CX,CY+10,1.05),
 cell(CX-130,CY-235,0.62,-20,"#A3E635","#3F6212",1,"tongue"), cell(CX+150,CY-245,0.55,18,"#F0ABFC","#86198F",2,"grin"),
 atom(CX+390,CY-160,0.45,-15), dna(CX-410,CY-130,0.42,60),
 cell(800,700,1.15,-10,"#C4B5FD","#5B21B6",3,"wow"), cell(1770,700,1.15,10,"#67E8F9","#155E75",4,"fang"),
 tooth(615,600,1.4,-14,"cool"), tooth(1960,600,1.4,14,"wink"), flask(620,860,0.55,-10,"#F472B6"), flask(1950,870,0.55,12,"#A3E635"),
 sparkle(CX-330,CY+230,1.1,"#fff"), sparkle(CX+330,CY+235,1.0,"#fff"), sparkle(1060,560,.8), sparkle(1500,880,.8),
 # fora
 cell(250,640,1.35,15,"#F9A8D4","#9D174D",5,"tongue"), cell(2320,700,1.35,-15,"#FDE68A","#92400E",6,"grin"),
 cell(470,300,0.9,-10,"#86EFAC","#166534",7,"fang"), cell(2100,330,0.9,10,"#FDBA74","#9A3412",8,"wow"),
 cell(430,1110,0.85,20,"#93C5FD","#1E3A8A",9,"grin"), cell(2140,1100,0.85,-20,"#F0ABFC","#86198F",10,"tongue"),
 lips(1000,260,0.95,-10), lips(1580,1210,0.95,8), lips(1580,250,0.75,12), lips(980,1200,0.75,-8),
 microscope(110,1000,0.9,-6), microscope(2460,1010,0.9,6), tubes(130,150,0.75,-10), tubes(2430,170,0.75,10),
 atom(760,1250,0.65,25,"#8B5CF6"), atom(1830,190,0.6,-10,"#22D3EE"), dna(1290,180,0.5,90), dna(1290,1270,0.5,90),
 bolt(700,430,0.7,-15), bolt(1870,440,0.7,15), bolt(1190,1050,0.55,10), bolt(1390,390,0.5,-10),
 tooth(1180,400,0.9,-8,"happy"), tooth(1700,1000,0.9,10,"wow"), tooth(880,1010,0.9,-8,"wink"),
]
for x,y,s in [(330,420,1.2),(2230,520,1.1),(1100,120,.9),(1700,1350,1),(60,520,.9),(2500,420,.9)]: mid.append(sparkle(x,y,s))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<radialGradient id="bgB" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#FEF08A"/><stop offset=".5" stop-color="#FACC15"/><stop offset="1" stop-color="#F97316"/></radialGradient>
<radialGradient id="space" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#7C3AED"/><stop offset=".6" stop-color="#3B0764"/><stop offset="1" stop-color="#1E0B36"/></radialGradient>
<pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="17" cy="17" r="5" fill="#EA580C" opacity=".35"/></pattern>
<radialGradient id="fadeC" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
<mask id="mDots"><rect width="{W}" height="{H}" fill="url(#fadeC)"/></mask>
<filter id="bl"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#7C2D12" flood-opacity=".35"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="url(#bgB)"/>{rays}
<rect width="{W}" height="{H}" fill="url(#dots)" mask="url(#mDots)" transform="scale(1)"/>
{conf}{''.join(back)}
<g filter="url(#sh)">{center}</g>{lines}
<g filter="url(#sh)">{''.join(mid)}</g>
</svg>'''
open('banner.svg','w').write(svg)
