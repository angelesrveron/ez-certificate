figma.showUI(__html__); //Mostrar en pantalla el plugin en Figma

figma.ui.resize(500,500); //Tamaño del modelo ui en pantalla(width, height)
 figma.loadAllPagesAsync();


figma.notify("hola!");

figma.ui.onmessage = async  (pluginMessage) => { //recibe el mensaje que mandamos en ui.html

await figma.loadFontAsync({ family: "Rubik", style: "Regular"});

const nodes:SceneNode[] = []; //para que funcione el scroll and zoom pq espera un array

 const postComponentSet = figma.root.findOne(node => node.type == "COMPONENT_SET" && node.name == "post") as ComponentSetNode  ;
 const defaultVariant = postComponentSet.defaultVariant as ComponentNode;
 
 const newPost = defaultVariant.createInstance();

 const templateNombreEstudiante = newPost.findOne(node => node.name == "@username" && node.type == "TEXT") as TextNode;
 const templateApellidoEstudiante = newPost.findOne(node => node.name == "displayName" && node.type == "TEXT") as TextNode;
 const templateDescription = newPost.findOne(node => node.name == "description" && node.type == "TEXT") as TextNode;

 templateNombreEstudiante.characters = pluginMessage.nombreEstudiante;
 templateApellidoEstudiante.characters = pluginMessage.apellidoEstudiante;
 templateDescription.characters = pluginMessage.description;

 //buscamos el nodo por el nombre y por el tipo que es "text"

figma.viewport.scrollAndZoomIntoView(nodes);

figma.closePlugin(); //Una vez que  mandamos la info cerrar la ventana del plugin ...


}