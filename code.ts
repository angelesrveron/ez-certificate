figma.showUI(__html__);
figma.ui.resize(500, 450);
figma.loadAllPagesAsync();

figma.ui.onmessage = async ({ sheetId, sheetName, mostrarDni, preview, error }) => {
  if (error) {
    figma.notify(error);
    return;
  }

  const cargarFuentes = async (nodo: FrameNode | ComponentNode | GroupNode) => {
    const textos = nodo.findAll(n => n.type === "TEXT") as TextNode[];
    const fuentesUnicas = new Set<string>(
      textos
        .filter(t => typeof t.fontName === "object" && t.fontName !== null)
        .map(t => JSON.stringify(t.fontName))
    );
    for (const fuenteStr of fuentesUnicas) {
      const fuente: FontName = JSON.parse(fuenteStr);
      await figma.loadFontAsync(fuente);
    }
  };

  const apiUrl = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      figma.notify("No se encontraron datos en la hoja.");
      return;
    }

    const seleccion = figma.currentPage.selection;
    if (seleccion.length !== 1) {
      figma.notify(seleccion.length === 0
        ? "Seleccioná un Frame o Componente como diseño base."
        : "Seleccioná solo un (1) Frame o Componente.");
      return;
    }

    const seleccionado = seleccion[0];
    if (!["FRAME", "COMPONENT"].includes(seleccionado.type)) {
      figma.notify("El nodo seleccionado debe ser un Frame o Componente.");
      return;
    }

    const certificadoBase = seleccionado as FrameNode | ComponentNode;
    await cargarFuentes(certificadoBase);

    const instances: SceneNode[] = [];

    const paddingX = 50;
    const paddingY = 50;
    const certificadoWidth = certificadoBase.width;
    const certificadoHeight = certificadoBase.height;
    const certificadosPorFila = 3;

    let xPos = certificadoBase.x;
    let yPos = certificadoBase.y + certificadoBase.height + 50;

    const filasParaProcesar = preview ? [data[0]] : data;

    for (let i = 0; i < filasParaProcesar.length; i++) {
      const fila = filasParaProcesar[i];
      const instancia = certificadoBase.clone();
      instancia.x = xPos;
      instancia.y = yPos;

      const textNodes = instancia.findAll(n => n.type === "TEXT") as TextNode[];
      for (const textNode of textNodes) {
        if (textNode.name.startsWith("#")) {
          const campo = textNode.name.substring(1);
          const valor = (campo.toUpperCase() === "DNI" && !mostrarDni) ? "" : fila[campo];
          textNode.characters = valor !== undefined ? String(valor) : "";
          textNode.textAutoResize = "WIDTH_AND_HEIGHT";
        }
      }

      instances.push(instancia);

      if (preview) break;

      if ((i + 1) % certificadosPorFila === 0) {
        xPos = certificadoBase.x;
        yPos += certificadoHeight + paddingY;
      } else {
        xPos += certificadoWidth + paddingX;
      }
    }

    figma.currentPage.selection = instances;
    figma.viewport.scrollAndZoomIntoView(instances);

    figma.notify(
      preview
        ? "Vista previa generada (solo 1 certificado)."
        : `Generados ${instances.length} certificados.`
    );

    if (!preview) figma.closePlugin();

  } catch (error) {
    figma.notify("Error al obtener datos del Google Sheet.");
    console.error(error);
  }
};
