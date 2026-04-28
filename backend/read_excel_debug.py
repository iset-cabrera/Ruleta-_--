import pandas as pd
import json

def process_excel(path):
    xl = pd.ExcelFile(path)
    res = {}
    for sheet in xl.sheet_names:
        df = xl.parse(sheet, header=None)
        # Find row with 'CI'
        header_row_idx = -1
        for i, row in df.iterrows():
            if 'CI' in row.values:
                header_row_idx = i
                break
        if header_row_idx != -1:
            headers = df.iloc[header_row_idx].tolist()
            res[sheet] = {
                'headers': [str(x) for x in headers if pd.notna(x)]
            }
        else:
            res[sheet] = "No CI column found"
    print(json.dumps(res, indent=2))

process_excel('../FUNCIONARIOS COOPERATIVA REDUCTO 2026.xlsx')
