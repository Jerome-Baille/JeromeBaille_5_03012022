// Loads and displays all the selected product information
function loadProduct() {
  // Get the id of the product from the page URL
  let idProduct = (new URL(window.location).searchParams.get("id"));

  fetch("http://localhost:3000/api/products/"+idProduct)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        document.title = data.name;
        document.querySelector(".item__img").insertAdjacentHTML("afterbegin", `<img src="${data.imageUrl}" alt="${data.altTxt}"></img>`);
        document.querySelector("#title").insertAdjacentHTML("afterbegin", data.name);
        document.querySelector("#price").insertAdjacentHTML("afterbegin", data.price.toLocaleString());
        document.querySelector("#description").insertAdjacentHTML("afterbegin", data.description);
        document.querySelector("#colors").insertAdjacentHTML("beforeend", data.colors.map(color => `<option value="${color}">${color}</option>`).join());
        addToCart(data);
    })
    // Displays an error message if the API cannot be reached
    .catch(() => {
      alert('Le serveur est inaccessible. Veuillez nous excuser pour la gêne occasionnée.');
    });
}
loadProduct();

// Adds the selected product to the local storage and redirect to cart.html
function addToCart(data){
  document.querySelector("#addToCart").addEventListener("click", ()=> {

    let quantityInput = document.querySelector("#quantity");
    let colorsInput = document.querySelector("#colors");

    // Reset the custom error message (if the input "quantity" is not an integer)
    quantityInput.setCustomValidity('');

    // Checks if the field "quantity" contain only numbers
    if(/^\d+$/.test(quantityInput.value)) {
      /* 
      Checks if the input "quantity" is valid (contains an integer number between 1 and 100)
      Checks a color is selected in the input "colors" (the input is not empty)
      */
      if (quantityInput.reportValidity() && colorsInput.value != "") {
        let tempCart = {
          productId : data._id,
          productColor : colorsInput.value,
          productQuantity : quantityInput.value
        };

        // Create a var associated to a key "products" in the local storage
        let productInLocalStorage = JSON.parse(localStorage.getItem("products"));
  
        // Checks if the key "products" exists in local storage
        if (productInLocalStorage) {
          // Looks for the product (same Id and same color) in the local storage
          const foundProduct = productInLocalStorage.find(
          (waldo) => waldo.productId === data._id && waldo.productColor === colorsInput.value);

          // If the product already exists in local storage then increases quantity
          if (foundProduct) {
            let newQuantity = parseInt(tempCart.productQuantity) + parseInt(foundProduct.productQuantity);
            foundProduct.productQuantity = newQuantity;
            localStorage.setItem("products", JSON.stringify(productInLocalStorage))
            window.location.assign("cart.html");

          // If the product does not exist in local storage then pushes informations in the "products" key
          } else {
            productInLocalStorage.push(tempCart);
            localStorage.setItem("products", JSON.stringify(productInLocalStorage));
            window.location.assign("cart.html");
          }
        } else {
          productInLocalStorage = [];
          productInLocalStorage.push(tempCart);
          localStorage.setItem("products", JSON.stringify(productInLocalStorage));
          window.location.assign("cart.html");
        }
      }

    // If the input "quantity" does not contain an integer number then display an error message
    } else {
      quantityInput.setCustomValidity(`Veuillez renseigner un nombre entier compris entre ${quantityInput.min} et ${quantityInput.max}`);
      quantityInput.reportValidity();
    }
  })
}