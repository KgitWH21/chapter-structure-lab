import json,pathlib,re
p=pathlib.Path(__file__).parent;d=json.loads((p/'references/source-data.json').read_text())
examples={int(x.split('|',1)[0]):x.split('|',1)[1] for x in (p/'open-examples.txt').read_text().splitlines()}
for o in d['openings']:
 o['example']=examples[o['id']]
 raw=o['text'];desc=re.split(r'\n|Touchstone:|Spin:',raw)[0].strip()
 o['description']=desc or raw
 o['name']=o['name'].replace(' (kin to your #1, Found Document)','').replace(' (kin to your #4, Wide-to-Narrow)','')
 o['name']=re.sub(r'\s*\(kin to.*','',o['name'])
 o['description']=re.sub(r'\(?Example:.*','',o['description']).strip()
for n,name in enumerate(['Perplexity Gradient','Collapsing Superposition','Stylometric Possession','Forgetting Engine','Latent Geodesic','The Crucible','Redaction Engine'],95):
 d['structures'].append(dict(id=n,name=name,text='A page-based exercise adapted from the source’s experimental interactive concept.',category='Experimental page adaptations'))
beats={}
for line in (p/'beats.txt').read_text().splitlines():
 n,b,rule=line.split('|'); beats[int(n)]=(b,rule)
for s in d['structures']:
 b,rule=beats[s['id']];s['rule']=rule;s['beats']=[]
 for part in b.split(' > '):
  title,example=part.split(': ',1);s['beats'].append(dict(title=title,example=example))
 s['description']=re.sub(r'^\[.*?\]\s*—\s*|^—\s*','',s['text'])
 s['description']=re.split(r'Kin:|Distinct from|Inverse of',s['description'])[0].strip()
 s['level']='wild' if s['id'] in [15,16,20,21,27,30,31,33,35,36,38,39,46,49,51,52,55,56,57,58,59,60,61,62,65,66,67,68,69,70,71,73,82,90,92,93] or s['id']>=95 else ('grounded' if s['id'] in [4,5,7,8,9,10,11,12,17,19,24,29,40,41,43,44,48,50,54,64,74,76,77,78,80,81,84,85,86,87,94] else 'exploratory')
# Use exercise-specific descriptions for broad or misleading source shorthand.
fix={1:'Four movements: introduce, develop, shift the context, then connect the parts. Conflict can be present, but the contextual turn organizes this exercise.',6:'Organize nested threads by what they ask readers to wait for: a journey, an answer, a personal change, or a restored situation.',8:'Shape the scene as a spacious beginning, a disruption, and a rapid finish.',18:'Accumulate encounters along a route that ends where it began, with changed meaning.',31:'Tell one event through separate channels for physical action, speech, and emotional commentary.',55:'Interrupt absorption in the scene so readers can examine how its social situation works.',62:'Arrange self-contained miniature scenes around a recurring phrase and emotional atmosphere.',70:'An invented repair arc that moves from damaged relationships toward restored balance.',71:'Let a fictional route organize the sequence of events and memories.',83:'An optional fictional sequence of contrasting responses to loss; it isn’t a model for how everyone grieves.',90:'An invented dialogue constraint in which alternating voices interlock and accelerate.'}
for s in d['structures']:
 if s['id'] in fix:s['description']=fix[s['id']]
# Preserve source files separately; visible copy uses plain, exercise-oriented terms.
blob=json.dumps(d,ensure_ascii=False).replace('pressure','tension').replace('Pressure','Tension').replace('quietly','softly')
(p/'dist/data.js').write_text('const CATALOG = '+blob+';\n')
print('Prepared',len(d['openings']),'openings and',len(d['structures']),'guided structures')
