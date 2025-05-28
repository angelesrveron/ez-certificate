figma.showUI(__html__); // Muestra la interfaz del plugin 

figma.ui.resize(500, 400); // Cambia el tamaño de la ventana del plugin 

figma.loadAllPagesAsync(); // Carga todas las páginas del documento Figma 

figma.ui.onmessage = async (pluginMessage) => {
  // pluginMessage tendrá: { sheetId, sheetName }
  // Datos que envía la UI con el ID y nombre de la hoja de cálculo
  
  // Función para cargar todas las fuentes usadas dentro de un nodo (Frame, Componente o Grupo)
  const cargarFuentes = async (nodo: FrameNode | ComponentNode | GroupNode) => {
    // Busca todos los nodos de tipo texto dentro del nodo dado
    const textos = nodo.findAll(n => n.type === "TEXT") as TextNode[];

    // Usamos un Set para almacenar las fuentes únicas y no repetir carga
    const fuentesUnicas = new Set<string>();
    for (const t of textos) {
      // Verificamos que fontName sea un objeto válido
      if (typeof t.fontName === "object" && t.fontName !== null) {
        // Guardamos la fuente en formato JSON para usarla como clave única
        fuentesUnicas.add(JSON.stringify(t.fontName));
      }
    }

    // Cargamos cada fuente única en Figma de forma asíncrona
    for (const fuenteStr of fuentesUnicas) {
      const fuente: FontName = JSON.parse(fuenteStr);
      await figma.loadFontAsync(fuente);
    }
  };


  // Construimos la URL para consultar la hoja de cálculo usando OpenSheet API
  const apiUrl = `https://opensheet.elk.sh/${pluginMessage.sheetId}/${pluginMessage.sheetName}`;

  try {
    // Hacemos la petición a la API para obtener los datos en formato JSON
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Validamos que los datos sean un arreglo y que no esté vacío
    if (!Array.isArray(data) || data.length === 0) {
      figma.notify("No se encontraron datos en la hoja.");
      return; // Salimos si no hay datos
    }

    // Buscamos el nodo base que será el diseño del certificado
    // Debe ser un COMPONENT o FRAME y que su nombre empiece con "#"
    const certificadoBase = figma.root.findOne(node =>
      (node.type === "COMPONENT" || node.type === "FRAME") 
    ) as ComponentNode | FrameNode;

    // Si no encontramos el diseño base, notificamos y salimos
    if (!certificadoBase) {
      figma.notify("No se encontró el diseño base llamado 'certificado'.");
      return;
    }

    // Cargamos las fuentes usadas en el diseño base para poder modificar textos sin error
    await cargarFuentes(certificadoBase);

    // Array para guardar todas las instancias (copias) que vamos a crear
    const instances: SceneNode[] = [];

    // Variables para posicionar los certificados en la página
    let xPos = 0;
    let yPos = 0;
    const paddingX = 50; // Espacio horizontal entre certificados
    const paddingY = 50; // Espacio vertical entre certificados
    const certificadoWidth = certificadoBase.width; // Ancho del certificado base
    const certificadoHeight = certificadoBase.height; // Alto del certificado base
    const certificadosPorFila = 3; // Cantidad de certificados por fila

    // Recorremos cada fila de datos de la hoja de cálculo
    for (let i = 0; i < data.length; i++) {
      const fila = data[i]; // Datos de una fila
      const instancia = certificadoBase.clone(); // Clonamos el certificado base
      instancia.x = xPos; // Posicionamos la instancia en X
      instancia.y = yPos; // Posicionamos la instancia en Y

      // Buscamos todos los nodos de texto dentro de la instancia clonada
      const textNodes = instancia.findAll(n => n.type === "TEXT") as TextNode[];

      // Recorremos cada nodo de texto para actualizar su contenido
      for (const textNode of textNodes) {
        // Solo modificamos nodos cuyo nombre empiece con "#"
        if (textNode.name.startsWith("#")) {
          const campo = textNode.name.substring(1); // Obtenemos el nombre del campo sin "#"
          const valor = fila[campo]; // Buscamos el valor correspondiente en la fila de datos

          if (valor !== undefined) {
            textNode.characters = String(valor); // Actualizamos el texto con el valor
            textNode.textAutoResize = "WIDTH_AND_HEIGHT"; // Ajustamos el tamaño del texto automáticamente
          } else {
            textNode.characters = ""; // Si no hay valor, dejamos vacío el texto
          }
        }
      }

      // Guardamos la instancia creada en el array
      instances.push(instancia);

      // Actualizamos la posición para el siguiente certificado
      if ((i + 1) % certificadosPorFila === 0) {
        // Si ya llenamos la fila, reiniciamos x y bajamos en y
        xPos = 0;
        yPos += certificadoHeight + paddingY;
      } else {
        // Si no, avanzamos en x para la siguiente instancia
        xPos += certificadoWidth + paddingX;
      }
    }

    // Seleccionamos todas las instancias generadas para que el usuario las vea
    figma.currentPage.selection = instances;
    // Ajustamos el zoom y desplazamiento para mostrar las instancias en pantalla
    figma.viewport.scrollAndZoomIntoView(instances);
    // Notificamos al usuario cuántos certificados se generaron
    figma.notify(`Generados ${instances.length} certificados.`);

  } catch (error) {
    // En caso de error al obtener datos, notificamos y mostramos error en consola
    figma.notify("Error al obtener datos del Google Sheet.");
    console.error(error);
  }

  // Cerramos el plugin al terminar
  figma.closePlugin();
};
