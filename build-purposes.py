import json,pathlib
p=pathlib.Path(__file__).parent;out=[];category=''
for line in (p/'purposes.txt').read_text().splitlines():
 if line.startswith('# '):category=line[2:];continue
 name,goal,ids,seed=line.split('|');out.append(dict(id=len(out)+1,name=name,category=category,goal=goal,structures=list(map(int,ids.split(','))),seed=seed))
(p/'dist/purposes.js').write_text('const PURPOSES = '+json.dumps(out,ensure_ascii=False)+';\n')
print(f'{len(out)} purposes across {len({x["category"] for x in out})} families')
