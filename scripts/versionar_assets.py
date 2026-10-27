"""Acrescenta a versão (?v=) aos scripts e estilos de assets/ nas páginas HTML, para que os navegadores,
inclusive o do Instagram, busquem os arquivos novos a cada atualização em vez de usar a cópia guardada.

A versão é o começo do hash SHA-256 do conteúdo de cada arquivo: só muda quando o arquivo muda. Roda pela
Action .github/workflows/versao.yml a cada mudança na main; também pode rodar à mão: python scripts/versionar_assets.py
"""
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REF = re.compile(r'((?:src|href)=")(assets/[^"?#]+\.(?:js|css))(?:\?v=[^"]*)?(")')


def main() -> int:
    versoes: dict[str, str] = {}

    def versao(caminho: str) -> str | None:
        if caminho not in versoes:
            arq = RAIZ / caminho
            versoes[caminho] = hashlib.sha256(arq.read_bytes()).hexdigest()[:8] if arq.is_file() else None
        return versoes[caminho]

    mudou = 0
    for pagina in sorted(RAIZ.glob("*.html")):
        texto = pagina.read_text(encoding="utf-8")
        novo = REF.sub(lambda m: f"{m[1]}{m[2]}?v={versao(m[2])}{m[3]}" if versao(m[2]) else m[0], texto)
        if novo != texto:
            pagina.write_text(novo, encoding="utf-8")
            mudou += 1
            print(f"{pagina.name}: versões atualizadas", file=sys.stderr)
    print(f"{mudou} páginas alteradas, {sum(1 for v in versoes.values() if v)} arquivos versionados.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
