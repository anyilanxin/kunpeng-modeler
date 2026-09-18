/**
 * Create a mouse-based dragger that calls the passed function with
 * { event, delta } on each mousemove during the drag.
 *
 * Uses mousedown/mousemove/mouseup instead of the HTML5 Drag and Drop API,
 * which is more reliable (no interference from other drag handlers like
 * diagram-js / DMN canvas, and works without a draggable attribute).
 *
 * @param {Function} fn       callback(event, delta) called on each mousemove
 * @param {Function} [onEnd]  callback() called when the drag ends (mouseup)
 *
 * @return {Function} mousedown handler
 */
export default function createDragger(fn, onEnd) {
  let startX, startY;

  function onMouseDown(event) {
    // only respond to left button
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    startX = event.clientX;
    startY = event.clientY;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event) {
    const delta = {
      x: event.clientX - startX,
      y: event.clientY - startY,
    };

    fn(event, delta);
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    if (typeof onEnd === 'function') {
      onEnd();
    }
  }

  return onMouseDown;
}
