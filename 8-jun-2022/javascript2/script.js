// 1.3.1
console.log(`The title of this page is: ${document.title}`);

// 1.3.2
const anchorTags = document.getElementsByTagName("a");
console.log(`Here are the links of the document:`)
for (const el of anchorTags) {
  console.log(el.href);
}

// 1.3.2
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 1.3.3.a
for (const tag of anchorTags) {
  tag.setAttribute("style", `color: ${getRandomColor()}; font-weight: bold;`);
}

// 1.3.3.b
for (const tag of anchorTags) {
  const im = document.createElement("img");
  im.setAttribute("src", "https://wdi.centralesupelec.fr/appliouaibe/downloads/Main/image-lien.gif");
  tag.appendChild(im);
}