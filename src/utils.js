export const Utils = {
  replaceAllTextWithinElement: (element, newText, newTextPosition) => {
    const notText = [...element.childNodes].filter(
      (n) => n.nodeType !== Node.TEXT_NODE
    );
    element.replaceChildren(...notText);
    element.insertAdjacentText(newTextPosition, newText);
  },
};
