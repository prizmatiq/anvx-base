function fixTypo(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
  
    nodes.forEach(node => {
      let t = node.nodeValue;
      // короткие слова склеиваем со следующим словом
      for (let i = 0; i < 3; i++) {
        t = t.replace(/(^|[\s(«"])([a-zA-Zа-яёА-ЯЁ]{1,2})\s+/g, '$1$2\u00A0');
      }
      // тире оставляем в конце строки, а не в начале следующей
      t = t.replace(/\s+—/g, '\u00A0—');
      node.nodeValue = t;
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    fixTypo(document.querySelector('.content'));
  });