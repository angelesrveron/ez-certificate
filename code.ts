figma.showUI(__html__);
figma.ui.resize(500, 500);

figma.ui.onmessage = async (pluginMessage) => {
  await figma.loadFontAsync({ family: "Rubik", style: "Regular" });

  const data = pluginMessage; // fila del sheet (clave: valor)
  const nodes: SceneNode[] = [];

  // Buscar todos los nodos de texto en la página actual
  const textNodes = figma.currentPage.findAll(node => node.type === "TEXT") as TextNode[];

  for (const node of textNodes) {
    // Solo procesar nodos cuyo nombre comience con '#'
    if (node.name.startsWith("#")) {
      const key = node.name.slice(1); // quitar el '#' → queda "NOMBRE"
      const value = data[key];

      if (value !== undefined) {
        await figma.loadFontAsync(node.fontName as FontName);
        node.characters = value;
        nodes.push(node);
      }
    }
  }

  if (nodes.length === 0) {
    figma.notify("No se encontró ningún texto con nombre '#CAMPO'.");
  } else {
    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.notify("Datos cargados con éxito.");
  }

  figma.closePlugin();
};
