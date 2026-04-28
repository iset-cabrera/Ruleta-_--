import pandas as pd
from sqlalchemy import create_engine

# 📍 Ruta al archivo Excel (ajustala si usás otra ruta)
excel_path = r'C:\Users\iset\Desktop\Copia de Ruleta_para_los_funcionarios(1).xlsx'

# 🧠 Leer el archivo Excel (ajustá el nombre de hoja si hace falta)
df = pd.read_excel(excel_path)

# 🧽 Renombrar columnas a las que existen en tu tabla PostgreSQL
df = df.rename(columns={
    'Documento Nº': 'cedula',
    'SOCIO/ CASA CENTRAL': 'nombre_completo',
    'SucursalCodigo': 'sucursal_codigo',
    'SocioNumero': 'socio_numero'
})

# 🔒 Asegurar que los tipos de datos sean correctos
df['cedula'] = df['cedula'].astype(str)
df['nombre_completo'] = df['nombre_completo'].astype(str)
df['sucursal_codigo'] = df['sucursal_codigo'].astype(int)
df['socio_numero'] = df['socio_numero'].astype(int)

# 🛠️ Conexión a PostgreSQL (ajustá usuario, contraseña, host, etc.)
engine = create_engine('postgresql://postgres:R3duct02025**//@localhost:5432/sorteos')

# 🚀 Cargar los datos a la tabla 'funcionarios'
df.to_sql('funcionarios', engine, if_exists='append', index=False)

print("✔️ Datos cargados exitosamente a la tabla 'funcionarios'")
