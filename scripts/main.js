import { widthChange } from './canvas.js';
import { initializeEventListeners, setValues } from './inputs.js';

setValues();
initializeEventListeners();

window.addEventListener('resize', () => {
  widthChange();
  setValues();
});
