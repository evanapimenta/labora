#!/bin/bash

# Diretorios de origem e destino
ORIGEM="/Users/evana/Documents/Projetos/labora-admin-panel/"
DESTINO="/Users/evana/Documents/Projetos/labora/labora-admin-panel/"

echo "🔄 Sincronizando labora-admin-panel..."
echo "De: $ORIGEM"
echo "Para: $DESTINO"

# Executa o rsync excluindo dependencias e arquivos de build/git
rsync -av --delete \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.git/' \
  --exclude '.env*' \
  --exclude '.DS_Store' \
  "$ORIGEM" "$DESTINO"

echo "✅ Sincronização concluída com sucesso!"
