"""
Gera public/modelos/modelo-importacao-zarpellon.xlsx — o modelo que o
cliente baixa, preenche e sobe em /admin/compras/nova.

O layout TEM que bater com o parser do backend
(lumike-api/src/purchase-import/purchase-import.service.ts -> parseWorkbook):

  - primeira aba, linha 1 = cabecalho (o parser SEMPRE ignora a linha 1)
  - dados a partir da linha 2, lidos por POSICAO de coluna:
      A = Produto     -> sku2 (codigo da peca na Zarpellon; lido como texto)
      B = Descricao   -> nome da peca
      C = Qtd.        -> quantidade (> 0)
      D = Valor Base  -> custo unitario (>= 0; aceita virgula decimal)
  - colunas E+ sao ignoradas pelo parser (por isso as instrucoes ficam ali)

Rodar:  python scripts/gen-import-template.py   (precisa de openpyxl)
"""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill

OUT = Path(__file__).resolve().parent.parent / "public" / "modelos" / "modelo-importacao-zarpellon.xlsx"

HEADERS = ["Produto", "Descrição", "Qtd.", "Valor Base"]

# Linha de exemplo (a coluna A vai como TEXTO pra nao perder zero a esquerda
# nem virar notacao cientifica).
EXAMPLE = ["1171530601518", "ANEL PEQUENO ZIRCONIA REDONDO 3 GARRA RIVIERA 3MM BAN. DOURADO /INCOLOR /TAM. 18", 10, 8.85]

INSTRUCTIONS = [
    "COMO PREENCHER (apague esta coluna se quiser):",
    "1. Uma linha por produto, a partir da linha 2.",
    "2. Produto = código da peça na Zarpellon (coluna A).",
    "3. Descrição = nome/descrição da peça (coluna B).",
    "4. Qtd. = quantidade comprada. Valor Base = custo unitário (coluna D).",
    "5. A linha 2 é só um EXEMPLO — apague e coloque os seus itens.",
    "6. Não mexa na linha 1 (cabeçalho).",
]


def main() -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Compra Zarpellon"

    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="C9A227")  # lumilee-gold
    for col, text in enumerate(HEADERS, start=1):
        cell = ws.cell(row=1, column=col, value=text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    # Exemplo — coluna A explicitamente como texto.
    ws.cell(row=2, column=1, value=EXAMPLE[0]).number_format = "@"
    ws.cell(row=2, column=2, value=EXAMPLE[1])
    ws.cell(row=2, column=3, value=EXAMPLE[2])
    ws.cell(row=2, column=4, value=EXAMPLE[3]).number_format = "0.00"
    for col in range(1, 5):
        ws.cell(row=2, column=col).font = Font(italic=True, color="8A8A8A")

    # Instrucoes na coluna F (o parser ignora tudo a partir da coluna E).
    ws.cell(row=1, column=6, value=INSTRUCTIONS[0]).font = Font(bold=True)
    for i, line in enumerate(INSTRUCTIONS[1:], start=2):
        ws.cell(row=i, column=6, value=line)

    ws.column_dimensions["A"].width = 18
    ws.column_dimensions["B"].width = 70
    ws.column_dimensions["C"].width = 8
    ws.column_dimensions["D"].width = 12
    ws.column_dimensions["F"].width = 62
    ws.freeze_panes = "A2"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(f"gerado: {OUT}")


if __name__ == "__main__":
    main()
