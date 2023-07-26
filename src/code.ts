figma.showUI(__html__);

figma.ui.resize(320, 210);

interface Message {
  readonly type: string;
  readonly currentScaleValue: number;
  readonly convertScaleValue: number;
}

type SelectedNode =
  | TextNode
  | FrameNode
  | ComponentNode
  | InstanceNode
  | GroupNode;

figma.ui.onmessage = (msg: Message) => {
  let selectedFrame= figma.currentPage.selection;

  if (selectedFrame.length > 0) {
    if (msg.convertScaleValue > 0 && msg.currentScaleValue > 0) {
      const convertRatio = msg.convertScaleValue / msg.currentScaleValue;
        
      let textLists = [];
        switch(msg.type){
          case "apply": 
            textLists = textLayers(selectedFrame);
            fontScaling(textLists, convertRatio, msg.convertScaleValue);
            break;

          case "clone":
            let clonedFrame = createClone(selectedFrame,msg);
            textLists = textLayers(clonedFrame);
            fontScaling(textLists, convertRatio, msg.convertScaleValue);
            break;
        }
      } else {
      figma.notify("🚫 Please select a valid input value");
    } 
  } else {
    figma.notify("🚫 No valid selection");
  }

};

//Clone Function
function createClone(selectedFrame,msg){
    let clonedFrame = selectedFrame.map((f) => {
      let nf = f.clone();
      nf.name = String.raw`${f.name} (@${msg.convertScaleValue}px base size)`;
      if (nf.height > nf.width) {
        nf.y = f.y + Math.round(1.25 * f.height);
      } else {
        nf.y = f.y + Math.round(1.15 * f.height);
      }
      figma.viewport.center = { y: nf.y, x: nf.x };
      figma.viewport.zoom = 0.5;
      return nf;
    });
    return clonedFrame;
}

//Text Layers Function
function textLayers(frames){
  let textList = [];
    frames.forEach((selected: SelectedNode) => {
      if (selected.type === "TEXT") {
        textList.push(selected);
      } else {
        textList = textList.concat(
          selected.findAll().filter((layer) => layer.type === "TEXT")
        );
      }
    });
    return textList;
}

//Scale Function
function fontScaling(
  textList: TextNode[],
  convertRatio: number,
  newScaleValue
) {
  let unresolved = 0;
  textList.forEach(async (selected,index) => {
    //Loading font
    if (selected.hasMissingFont) {
      unresolved++;
    } else {
      if (typeof selected.fontName !== "symbol") {
        await figma.loadFontAsync(selected.fontName).then(() => {
          if (
            typeof selected.fontSize !== "symbol" &&
            typeof selected.lineHeight !== "symbol"
          ) {
            selected.fontSize = Math.round(selected.fontSize * convertRatio);
            if (selected.lineHeight.unit === "PIXELS") {
              let lineHeightValue = selected.lineHeight.value;
              selected.lineHeight = {
                value: Math.round(lineHeightValue * convertRatio),
                unit: "PIXELS",
              };
            }
          } else {
            unresolved++;
          }
        });
      } else {
        unresolved++;
      }
    }
    if(index == textList.length-1){
      if (unresolved > 0) {
        figma.notify(
          `🚨Cloned ${textList.length - unresolved}/${
            textList.length
          } text layers to ${newScaleValue}px base size`
        );
      } else {
        figma.notify(
          `✅ Successfully updated all the text layers to ${newScaleValue}px base size`
        );
      }
     figma.closePlugin();
    }
  });
}
