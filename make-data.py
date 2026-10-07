import re,json,pathlib
root=pathlib.Path(__file__).resolve().parent
u=root/'references'
def clean(s):
 return re.sub(r'[*_`]', '', s).strip()
s=(u/'81_Chapter_Introduction_Frameworks.md').read_text()
starts=[m for m in re.finditer(r'(?m)^(?:\*\*)?(\d+)\.\s+(.+)',s) if m[0].startswith('**') or int(m[1])>=32]
opens=[]
for i,m in enumerate(starts):
 n=int(m[1]);raw=m[2];end=starts[i+1].start() if i+1<len(starts) else s.index('Notes on Use')
 block=s[m.end():end].strip();block=re.split(r'\n\s*(?:---|## |\d+\. [A-Z].*\n\n)',block)[0].strip()
 if 12<=n<=31:
  title,desc=raw.split(':',1);block=clean(desc).strip()+'\n'+block
 else:title=raw
 title=clean(title)
 block=clean(block)
 opens.append(dict(id=n,name=title,text=block))
s=(u/'101_Chapter_Structures_Blueprint.md').read_text();structures=[];cat=''
for line in s.splitlines():
 if line.startswith('## §'):cat=line.split('·',1)[1].strip()
 m=re.match(r'(\d+)\. \*\*(.+?)\*\* (.*)',line)
 if m and cat:
  structures.append(dict(id=int(m[1]),name=m[2],text=clean(m[3]),category=cat))
assert len(opens)==81,len(opens)
assert len(structures)==94,len(structures)
(root/'references/source-data.json').write_text(json.dumps(dict(openings=opens,structures=structures),ensure_ascii=False))
print(len(opens),len(structures))
