// Load and display all the products on the index page
function loadList() {
  fetch("http://localhost:3000/api/products")
  .then((response) => response.json())
  .then((data) => {
      let listItems = '';
      
      for (let obj of data){
        listItems += 
        `<a href="./product.html?id=${obj._id}">
          <article>
            <img src="${obj.imageUrl}" alt="${obj.altTxt}">
            <h3 class="productName">${obj.name}</h3>
            <p class="productDescription">${obj.description}</p>
          </article>
        </a>`;
      }
      document.querySelector("#items").insertAdjacentHTML("beforeend", listItems);
    })
  .catch(() => {
    alert('Le serveur est inaccessible. Veuillez nous excuser pour la gêne occasionnée.');
  });
};

loadList();