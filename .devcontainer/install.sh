#!/bin/bash
set -e

echo "Instalando dependências do PlantUML..."

sudo apt-get update -y && sudo apt-get install -y \
  graphviz \
  wget \
  fontconfig \
  fonts-dejavu-core

PLANTUML_VERSION="1.2024.6"
PLANTUML_JAR="/usr/local/lib/plantuml.jar"

echo "Baixando PlantUML ${PLANTUML_VERSION}..."
sudo wget -q \
  "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/plantuml-${PLANTUML_VERSION}.jar" \
  -O "${PLANTUML_JAR}"

java -jar "${PLANTUML_JAR}" -version

echo "PlantUML instalado com sucesso em ${PLANTUML_JAR}"
echo "Versão Graphviz: $(dot -V 2>&1)"