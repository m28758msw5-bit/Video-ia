# Bàner 3 · «laboratori de nit»: fons fosc, cèl·lules lluminoses, ADN gegant, dent brillant.
import math, random
random.seed(5)
W,H=2560,1440; CX,CY=1280,720
def smooth(pts):
    n=len(pts); d=f"M{pts[0][0]:.1f} {pts[0][1]:.1f} "
    for i in range(n):
        p0,p1,p2,p3=pts[i-1],pts[i],pts[(i+1)%n],pts[(i+2)%n]
        d+=f"C{p1[0]+(p2[0]-p0[0])/6:.1f} {p1[1]+(p2[1]-p0[1])/6:.1f} {p2[0]-(p3[0]-p1[0])/6:.1f} {p2[1]-(p3[1]-p1[1])/6:.1f} {p2[0]:.1f} {p2[1]:.1f} "
    return d+"Z"
def eye(x,y,r,px,py):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff"/><circle cx="{x+r*px:.1f}" cy="{y+r*py:.1f}" r="{r*0.52:.1f}" fill="#0F172A"/><circle cx="{x+r*px+r*0.16:.1f}" cy="{y+r*py-r*0.2:.1f}" r="{r*0.18:.1f}" fill="#fff"/>'
GID=[0]
def cell(x,y,s,rot,c1,c2,seed,mood,blur=0,op=1):
    rr=random.Random(seed); n=10; GID[0]+=1; g=f"cg{GID[0]}"
    pts=[(100*(1+rr.uniform(-.1,.1))*math.cos(i/n*6.283),94*(1+rr.uniform(-.1,.1))*math.sin(i/n*6.283)) for i in range(n)]
    nuc=smooth([(p[0]*.33+18,p[1]*.33+30) for p in pts])
    orgs="".join(f'<ellipse cx="{rr.uniform(-60,60):.0f}" cy="{rr.uniform(-60,60):.0f}" rx="{rr.uniform(5,10):.0f}" ry="{rr.uniform(3,6):.0f}" fill="#fff" opacity=".35"/>' for _ in range(6))
    m={"tongue":'<path d="M-30 30 C-12 70 18 70 34 30 Z" fill="#3B0764"/><path d="M-2 44 C2 72 22 70 22 44 Z" fill="#FB7185"/>',
       "grin":'<path d="M-38 28 Q2 78 40 28 Z" fill="#3B0764"/><path d="M-32 31 L34 31 L30 42 L-28 42 Z" fill="#fff"/>',
       "wow":'<ellipse cx="2" cy="44" rx="18" ry="24" fill="#3B0764"/>',
       "fang":'<path d="M-34 32 Q0 60 34 32" stroke="#0F172A" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-10 44 l12 1 l-7 14 Z" fill="#fff"/>'}[mood]
    cil="".join(f'<path d="M{102*math.cos(a):.0f} {96*math.sin(a):.0f} l{16*math.cos(a+.3):.0f} {16*math.sin(a+.3):.0f}" stroke="{c1}" stroke-width="5" stroke-linecap="round" opacity=".8"/>' for a in [i/26*6.283 for i in range(26)]) if rr.random()<.5 else ""
    f=f' filter="url(#b{blur})"' if blur else ' filter="url(#glow)"'
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({s})" opacity="{op}"{f}>
    <defs><radialGradient id="{g}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="{c1}" stop-opacity=".95"/><stop offset="1" stop-color="{c2}" stop-opacity=".85"/></radialGradient></defs>
    {cil}<path d="{smooth(pts)}" fill="url(#{g})" stroke="{c1}" stroke-width="6"/>{orgs}<path d="{nuc}" fill="{c2}" opacity=".5"/>
    <ellipse cx="-42" cy="-50" rx="24" ry="12" fill="#fff" opacity=".5" transform="rotate(-30 -42 -50)"/>
    {eye(-30,-12,27,rr.uniform(-.4,.4),rr.uniform(-.4,.4))}{eye(28,-18,19,rr.uniform(-.4,.4),rr.uniform(-.4,.4))}{m}</g>'''
def dnaLong(x0,x1,y,amp,turns):
    a="";b="";r="";N=240
    for i in range(N+1):
        t=i/N; x=x0+(x1-x0)*t; ph=t*turns*2*math.pi; yy=amp*math.sin(ph)
        a+=("M" if i==0 else "L")+f"{x:.1f} {y+yy:.1f} "; b+=("M" if i==0 else "L")+f"{x:.1f} {y-yy:.1f} "
        if i%5==2:
            col=["#22D3EE","#A3E635","#F472B6","#FACC15"][(i//5)%4]
            r+=f'<path d="M{x:.1f} {y+yy:.1f} L{x:.1f} {y-yy:.1f}" stroke="{col}" stroke-width="9" stroke-linecap="round" opacity="{.45+.5*abs(math.cos(ph)):.2f}"/>'
    return f'<g filter="url(#glow)" opacity=".9">{r}<path d="{a}" stroke="#C084FC" stroke-width="16" fill="none" stroke-linecap="round"/><path d="{b}" stroke="#F472B6" stroke-width="16" fill="none" stroke-linecap="round"/></g>'
def tooth(x,y,s):
    return f'''<g transform="translate({x},{y}) scale({s})" filter="url(#glowW)">
    <path d="M-32 -20 C-46 -50 -10 -62 0 -44 C10 -62 46 -50 32 -20 C28 6 26 50 14 52 C6 52 6 22 0 22 C-6 22 -6 52 -14 52 C-26 50 -28 6 -32 -20 Z" fill="url(#gTooth)" stroke="#E0F2FE" stroke-width="2.5"/>
    <path d="M-24 -32 C-22 -42 -12 -46 -6 -40" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="-10" cy="-6" r="4.5" fill="#0F172A"/><circle cx="10" cy="-6" r="4.5" fill="#0F172A"/><circle cx="-8.5" cy="-7.5" r="1.5" fill="#fff"/><circle cx="11.5" cy="-7.5" r="1.5" fill="#fff"/>
    <path d="M-9 5 C-4 13 4 13 9 5 Z" fill="#BE123C"/><ellipse cx="-18" cy="3" rx="6" ry="3.5" fill="#F9A8D4"/><ellipse cx="18" cy="3" rx="6" ry="3.5" fill="#F9A8D4"/></g>'''
def lips(x,y,s,rot):
    t="".join(f'<rect x="{-75+i*25}" y="-32" width="23" height="26" rx="6" fill="#fff"/>' for i in range(6))
    b="".join(f'<rect x="{-62+i*25}" y="12" width="23" height="22" rx="6" fill="#fff"/>' for i in range(5))
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" filter="url(#glow)"><path d="M-130 0 C-100 -70 -40 -70 0 -52 C40 -70 100 -70 130 0 C100 80 -100 80 -130 0 Z" fill="#F43F5E" stroke="#FDA4AF" stroke-width="6"/><path d="M-100 -4 C-60 -36 60 -36 100 -4 C60 50 -60 50 -100 -4 Z" fill="#1E0B36"/>{t}{b}<path d="M-40 28 C-30 80 30 80 40 28 C20 14 -20 14 -40 28 Z" fill="#FB7185"/><ellipse cx="-70" cy="-48" rx="22" ry="8" fill="#fff" opacity=".5"/></g>'
def atom(x,y,s,rot,col):
    o="".join(f'<ellipse rx="150" ry="52" fill="none" stroke="{col}" stroke-width="7" transform="rotate({a})"/>' for a in (0,60,120))
    e="".join(f'<circle cx="{150*math.cos(math.radians(t)):.0f}" cy="{52*math.sin(math.radians(t)):.0f}" r="14" fill="#fff" transform="rotate({a})"/>' for a,t in ((0,30),(60,200),(120,320)))
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" filter="url(#glow)">{o}{e}<circle r="32" fill="{col}"/><circle cx="-9" cy="-9" r="9" fill="#fff" opacity=".7"/></g>'
def hexgrid():
    s="";R=60
    for row in range(-1,int(H/(R*1.5))+2):
        for col in range(-1,int(W/(R*1.732))+2):
            x=col*R*1.732+(row%2)*R*0.866; y=row*R*1.5
            pts=" ".join(f"{x+R*math.cos(math.radians(60*k+30)):.0f},{y+R*math.sin(math.radians(60*k+30)):.0f}" for k in range(6))
            s+=f'<polygon points="{pts}"/>'
    return f'<g fill="none" stroke="#818CF8" stroke-width="2" opacity=".10">{s}</g>'
bokeh="".join(f'<circle cx="{random.uniform(0,W):.0f}" cy="{random.uniform(0,H):.0f}" r="{random.uniform(8,40):.0f}" fill="{random.choice(["#22D3EE","#F472B6","#A78BFA","#FDE047","#A3E635"])}" opacity="{random.uniform(.12,.35):.2f}" filter="url(#b8)"/>' for _ in range(70))
stars="".join(f'<circle cx="{random.uniform(0,W):.0f}" cy="{random.uniform(0,H):.0f}" r="{random.uniform(1.5,3.5):.1f}" fill="#fff" opacity="{random.uniform(.3,.9):.2f}"/>' for _ in range(220))
def sparkle(x,y,s,c="#fff"): return f'<path transform="translate({x},{y}) scale({s})" d="M0 -30 l7 23 l23 7 l-23 7 l-7 23 l-7 -23 l-23 -7 l23 -7 Z" fill="{c}" filter="url(#glowW)"/>'
glows=f'''<ellipse cx="{CX}" cy="{CY}" rx="900" ry="420" fill="#7C3AED" opacity=".35" filter="url(#b120)"/>
<ellipse cx="500" cy="300" rx="500" ry="300" fill="#DB2777" opacity=".25" filter="url(#b120)"/>
<ellipse cx="2100" cy="1150" rx="500" ry="300" fill="#0891B2" opacity=".3" filter="url(#b120)"/>
<ellipse cx="2150" cy="250" rx="400" ry="260" fill="#65A30D" opacity=".18" filter="url(#b120)"/>
<ellipse cx="400" cy="1200" rx="450" ry="260" fill="#CA8A04" opacity=".15" filter="url(#b120)"/>'''
back=[cell(240,330,1.1,10,"#F9A8D4","#9D174D",1,"wow",blur=6,op=.55),cell(2330,1120,1.2,-10,"#67E8F9","#155E75",2,"grin",blur=6,op=.55),
      cell(900,1250,0.7,15,"#BEF264","#3F6212",3,"fang",blur=4,op=.5),cell(1700,170,0.7,-15,"#FDE68A","#92400E",4,"tongue",blur=4,op=.5),
      cell(2400,280,0.8,0,"#C4B5FD","#5B21B6",5,"grin",blur=5,op=.45),cell(170,1180,0.9,0,"#FDBA74","#9A3412",6,"wow",blur=5,op=.45)]
front=[
 tooth(CX,CY-10,3.6), sparkle(CX+150,CY-170,1.2), sparkle(CX-160,CY+150,.9,"#FDE047"), sparkle(CX+190,CY+140,.7,"#67E8F9"),
 cell(860,640,1.05,-12,"#C084FC","#6D28D9",11,"tongue"), cell(1700,800,1.05,12,"#22D3EE","#0E7490",12,"fang"),
 cell(1050,880,0.6,10,"#BEF264","#4D7C0F",13,"grin"), cell(1520,560,0.6,-10,"#F9A8D4","#BE185D",14,"wow"),
 lips(600,880,0.75,-10), lips(1960,580,0.75,10),
 atom(1960,880,0.55,-20,"#FDE047"), atom(600,560,0.55,20,"#22D3EE"),
 cell(330,720,1.2,10,"#FDE047","#A16207",15,"grin"), cell(2240,700,1.2,-8,"#F472B6","#9D174D",16,"tongue"),
 lips(1280,230,0.9,0), lips(1280,1230,0.8,180) ,
 atom(760,240,0.6,10,"#F472B6"), atom(1820,1220,0.6,-10,"#A3E635"),
 cell(560,1110,0.8,-20,"#7DD3FC","#1D4ED8",17,"wow"), cell(2000,310,0.8,20,"#A3E635","#3F6212",18,"grin"),
]
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<radialGradient id="bg" cx=".5" cy=".5" r=".8"><stop offset="0" stop-color="#2E1065"/><stop offset=".55" stop-color="#1E1B4B"/><stop offset="1" stop-color="#05040F"/></radialGradient>
<radialGradient id="gTooth" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F5F9"/><stop offset="1" stop-color="#C7D2FE"/></radialGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowW" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b"/><feFlood flood-color="#E0E7FF"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="b4"><feGaussianBlur stdDeviation="4"/></filter><filter id="b5"><feGaussianBlur stdDeviation="5"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b8"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="b120" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="120"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>{glows}{hexgrid()}{stars}{bokeh}
{''.join(back)}
{dnaLong(-100,2660,CY+20,150,5.5)}
<circle cx="{CX}" cy="{CY-10}" r="230" fill="#A5B4FC" opacity=".35" filter="url(#b120)"/>
{''.join(front)}
</svg>'''
open('banner.svg','w').write(svg)
