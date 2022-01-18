// Global variables
var cartComplete = [];
var getCart = JSON.parse(localStorage.getItem('products'));

// Checks if the client is on cart.html or confirmation.html and load the function accordingly
async function checkLocation() {
    // If the client is on cart.html displays the content of the cart
    if (window.location.href.indexOf("cart") > 0) {
        
        if(getCart != "" && getCart != null) {
            await loadProducts();
            console.log(cartComplete)

            addToDisplay(cartComplete);
            displayTotals();
            changeQuantity();
            deleteProduct();
            postForm();

            let testId = getAllIds()
            console.log(testId);
            if (testId != null || testId != 0) {
                console.log("L'ID des produits a été chargé avec succès.");
            }          

        // If the cart is empty displays "Votre panier est vide", hide the totals and the contact form
        } else {
            document.querySelector("#cartAndFormContainer h1").textContent = "Votre panier est vide";
            document.querySelector(".cart__price").style.display = "none";
            document.querySelector(".cart").style.display = "none";
        }

    // If the client is on confirmation.html displays a confirmation message with the order number
    } else {
        let orderId = (new URL(window.location).searchParams.get("id"));
        if(orderId != null) {
            document.querySelector("#orderId").innerHTML = orderId;

        // If there is no order ID, displays "Vous n'avez pas encore passé de commande !"
        } else {
            document.querySelector(".confirmation p").textContent = "Vous n'avez pas encore passé de commande !";
        }
        
    };
}
checkLocation();

// Matches the items in local storage with the API and concatenates the results
async function loadProducts() {
    let result = 
        await fetch('http://localhost:3000/api/products')
            .then((response) => {return response})
            .catch(()=> {
                alert('Le serveur est inaccessible. Veuillez nous excuser pour la gêne occasionnée.');
            });

    let products = await result.json();
  
    const newCart = JSON.parse(localStorage.getItem('products'));

    cartComplete = newCart.map(item => {
        const product = products.find(({ _id }) => item.productId === _id)

        return {
         ...product,
         ...item,
        }
    });   
}

// Displays all the items on the cart.html page
function addToDisplay(cartComplete) {
    for (let product of cartComplete){
        let listItems = '';

        listItems +=
        `<article class="cart__item" data-id="${product.productId}" data-color="${product.productColor}">
        <div class="cart__item__img">
        <img src="${product.imageUrl}" alt="${product.description}">
        </div>
        <div class="cart__item__content">
        <div class="cart__item__content__description">
            <h2>${product.name}</h2>
            <p>${product.productColor}</p>
            <p>${product.price.toLocaleString()}€</p>
        </div>
        <div class="cart__item__content__settings">
            <div class="cart__item__content__settings__quantity">
            <p>Qté : </p>
            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.productQuantity}">
            </div>
            <div class="cart__item__content__settings__delete">
            <p class="deleteItem">Supprimer</p>
            </div>
        </div>
        </div>
        </article>`;

        document.querySelector("#cart__items").insertAdjacentHTML("beforeend", listItems);
    }
}

// Displays the total number of items and the total amount of the cart
async function displayTotals () {
    let quantityInput =  document.querySelectorAll(".itemQuantity");

    // Calculates the total number of items in the cart
    let totalItems = 0;
    for (let item of quantityInput){
        totalItems += parseInt(item.value);
    }
    document.querySelector("#totalQuantity").textContent = totalItems;

    // Calculates the total amount of the cart
    let totalPrice = 0;

    await loadProducts();

    for (let item of cartComplete) {
        totalPrice += item.productQuantity * item.price;
    }

    document.querySelector("#totalPrice").textContent = totalPrice.toLocaleString();  
}


// Changes the number of items for a product
function changeQuantity() {
    let inputNumber = document.querySelectorAll('input[type=number]');
    
    //boucle pour récupérer les modifications de quantité sur le panier
    for (let j of inputNumber) {
        
        j.addEventListener('change', (event) => {
            // Resets the custom validity message
            j.setCustomValidity('');
    
            if (/^\d+$/.test(j.value)) {
                if (j.reportValidity()) {
                    // récupérer la nouvelle valeur:
                    let newQuantity = event.target.value;
                    //récupérer l'id et la couleur de l'article modifié
                    let selectedProductId = j.closest(".cart__item").dataset.id;
                    let selectedProductColor = j.closest(".cart__item").dataset.color;
                    
                    let productInLocalStorage = JSON.parse(localStorage.getItem("products"));
            
                    const foundProduct = productInLocalStorage.find(
                        (waldo) => waldo.productId === selectedProductId && waldo.productColor === selectedProductColor);
                        foundProduct.productQuantity = newQuantity;
                        
                        localStorage.setItem("products", JSON.stringify(productInLocalStorage))
                        displayTotals();
                }
            } else {
                j.setCustomValidity(`Veuillez renseigner un nombre entier compris entre ${j.min} et ${j.max}`);
                j.reportValidity();
            }
        });
    }
}
   
// Deletes the selected product from cart
function deleteProduct() {
    let deleteBtn = document.querySelectorAll(".deleteItem");

    for (let j = 0; j < deleteBtn.length; j++){
        deleteBtn[j].addEventListener("click", (event) => {
            event.preventDefault();

            // Find the right product (with the id and color) in the local storage
            let idDelete = getCart[j].productId;
            let colorDelete = getCart[j].productColor;

            getCart = getCart.filter( el => el.productId !== idDelete || el.productColor !== colorDelete );
            
            localStorage.setItem("products", JSON.stringify(getCart));

            // Pop-up to alert user that the product has been deleted and refreshes the page
            alert("Ce produit a bien été supprimé du panier");
            location.reload();
        })
    }
}


// Gets all the products IDs
function getAllIds() {
    if (this.getCart.length >= 1) {
        return this.getCart.map(products => products.productId);
    } else {
        return [];
    }
}

// Handles the client contact infos
function postForm() {
    let firstName = document.querySelector('#firstName');
    let lastName = document.querySelector('#lastName');
    let address = document.querySelector('#address');
    let city = document.querySelector('#city');
    let email = document.querySelector('#email');

    const order = document.querySelector("#order");
    const orderForm = document.querySelector(".cart__order__form");

    order.addEventListener('click', (event) => {
        event.preventDefault();
        
        // Displays an error message if a field is invalid in the contact form
        let fields = document.querySelectorAll(".cart__order__form input")

        for (let field of fields) {
            if (!field.name.checkValidity && field.name != ""){
                document.querySelector('#'+field.name+'ErrorMsg').textContent = field.validationMessage;
            } 
        }

        if (orderForm.checkValidity()) {
            fetch(`http://localhost:3000/api/products/order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contact : {
                        firstName : firstName.value,
                        lastName : lastName.value,
                        address : address.value,
                        city : city.value,
                        email : email.value
                    },
                    products : getAllIds()
                })
            })
            .then((response) => response.json())
            .then((data) => {
                localStorage.clear();
                document.location.href = 'confirmation.html?id='+ data.orderId;
            });
        }
    });
};