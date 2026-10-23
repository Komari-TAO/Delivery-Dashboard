from pathlib import Path
import zipfile,xml.etree.ElementTree as E
p=Path(__file__).resolve().parents[2]/'outputs/client_delivery_20261022/Client_Delivery_Status_and_Demand_2026-10-22.xlsx'
z=zipfile.ZipFile(p)
print('zip failure:',z.testzip())
for n in z.namelist():
 if n.endswith('.xml'):E.fromstring(z.read(n))
print('all XML well formed')
print(z.read('xl/workbook.xml').decode()[:1800])
print([(n,len(z.read(n))) for n in z.namelist() if 'chart' in n]);print(z.read('[Content_Types].xml').decode()[:800])
print('errors',sum(z.read(n).count(b't="e"') for n in z.namelist() if n.startswith('xl/worksheets/sheet')))

