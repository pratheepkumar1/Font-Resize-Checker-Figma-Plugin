import "../src/ui.css";

document.getElementById('clone').onclick = () => {

  let currentScale = document.getElementById("current-base")! as HTMLInputElement;
  let currentScaleValue = currentScale.value;
  let convertScale = document.getElementById("new-base")! as HTMLInputElement;
  let convertScaleValue = convertScale.value;
  parent.postMessage({ pluginMessage: { type: 'clone', currentScaleValue, convertScaleValue} }, '*');
  
}

document.getElementById('apply').onclick = () => {

  let currentScale = document.getElementById("current-base")! as HTMLInputElement;
  let currentScaleValue = currentScale.value;
  let convertScale = document.getElementById("new-base")! as HTMLInputElement;
  let convertScaleValue = convertScale.value;
  parent.postMessage({ pluginMessage: { type: 'apply', currentScaleValue, convertScaleValue} }, '*');
  
}

