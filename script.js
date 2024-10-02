function init(){
  render(); 
  renderShoppingBasket();  
  checkout(); 

  if (window.innerWidth <= 1280) {
    openPopup();
  }
} 
let isTakeaway = false;

window.onscroll = function() { 
  let shoppingCard = document.getElementById('shoppingCard');
  if(window.scrollY > 0) {
    shoppingCard.style = 'top: 0';
  } else {
    shoppingCard.style = 'top: 100px';
  }
}

/*Render function for all menus*/
function render() {
  let menuContainer = document.getElementById('menuContainer');
  menuContainer.innerHTML = '';

  for (let i = 0; i < menuArray.length; i++) {
    let menu = menuArray[i];
    let category = menu.category[0];

    if (!categories.includes(category)) {
      categories.push(category);

      menuContainer.innerHTML += `
        <div id="${category}" class="menuSection">
          <h2 style="display: flex; align-items: center;">${category}</h2>
        </div>
        <div class="foodPicture"><img class="menuImage" src="${foodImage[menu.categoryImageIndex]}"></div>
        `;
    }
    menuContainer.innerHTML += htmlTemplate(menu, i);
  }
  emptyCheckoutContainer();
}

function htmlTemplate(menu, i) { 
  let formattedPrice = menu.price.replace('.',',')

  return `
    <div class="menu">
      <h4 class="h4">${menu.food}</h4>
      <p class="dishDescription">${menu.description}</p>
      <h4 class="h4">${(formattedPrice)}€</h4>
      <button class="buttonAddToBasket" onclick="addToBasket(${i})">+</button>
    </div>
  `;
}

/*add menus to shopping basket*/
function addToBasket(i) { 
  let menu = menuArray[i];
  let existingMenuIndex = food.indexOf(menu.food);

  if (existingMenuIndex === -1) { /*pushes only menus that don't already exist in array*/
    food.push(menu.food);
    price.push(menu.price);
    amount.push(1);
  } else {
    amount[existingMenuIndex]++;
  }
 updateBasket();
}

function updateBasket() {
  if (food.length == 0) {
    emptyBasket(); 
  }
  emptyCheckoutContainer();
  renderShoppingBasket();
  checkout();
  openPopup();
}

function emptyBasket() {
  let emptyBasketElement = document.getElementById('emptyBasket');
  emptyBasketElement.classList.add('d-none');
}

function emptyCheckoutContainer() { 
  let checkoutContainer = document.getElementById('checkout');
  if (checkoutContainer) {
    checkoutContainer.style.display = food.length === 0 ? 'none' : 'block'; 
  }
}

/*shopping basket*/
function renderShoppingBasket() {
  let container = document.getElementById('renderShoppingBasket');
  container.innerHTML = '';

  for (let i = 0; i < food.length; i++) {
    let currentFood = food[i];
    let currentPrice = price[i];
    let currentAmount  = amount[i];

    container.innerHTML += htmlTemplateRenderBasket(i, currentAmount, currentFood, currentPrice);
  }
}
    
function htmlTemplateRenderBasket(i, currentAmount, currentFood, currentPrice) { 
  return /*html*/ `
    <div class="order">
      <div>${currentAmount}x</div>
      <span>${currentFood}</span> 
      <button class="PlusMinusIcon" onclick="minus(${i})">-</button>
      <button class="PlusMinusIcon" onclick="plus(${i})">+</button>
      <span>${(currentPrice * currentAmount).toFixed(2).replace('.',',')} €</span>
      <button class="trashIcon" onclick="deleteItem(${i})"><img src="./img/trash_icon.png"></button>
    </div>
  `;
}

function minus(i) {
  amount[i]--;
  if (amount[i] === 0) {
    food.splice(i, 1);
    price.splice(i, 1);
    amount.splice(i, 1);
  }
  renderShoppingBasket();
  checkout();
  openPopup();
}

function plus(i) {
  amount[i]++;
  renderShoppingBasket();
  checkout();
  openPopup();
}

function checkout() {
  let sum = 0;
  let subtotalValue = 0;

  for (let i = 0; i < food.length; i++) {  
    subtotalValue += price[i] * amount[i];
  }

  let deliveryCosts = isTakeaway ? 0 : 3.5;   /*Ternärer Operator als Alternative zu if-else für Abholung & Delivery i.V.m. globaler Variablen let Abholung = false, d.h. Standardmäßig ist Lieferung*/
  let totalValue = Number((subtotalValue + deliveryCosts).toFixed(2));

  renderCheckout(sum, subtotalValue, totalValue, deliveryCosts);
}

function renderCheckout(sum, subtotalValue, totalValue, deliveryCosts) {
  let checkout = document.getElementById('checkout'); 
  let mobileShoppingButton = document.getElementById('mobileShoppingButton'); 

  mobileShoppingButton.innerHTML = `<img class="warenkorbIcon" src="./img/shoppingBasket.png"> Warenkorb ${totalValue.toFixed(2).replace('.',',')}€`;

  checkout.innerHTML = htmlTemplateCheckout(subtotalValue, totalValue, deliveryCosts);

  checkMinOrder(subtotalValue);
}

function htmlTemplateCheckout(subtotalValue, totalValue, deliveryCosts) {
  return /*html*/ ` 
  <div id="checkoutContainer" class="checkoutContainer">
    <div class="checkoutLeft">
      <span>Zwischensumme</span><br>
      <span>Lieferkosten</span><br>
      <span style="font-weight: bold;">Gesamt</span>
    </div>
    <div class="checkoutRight">
      <span id="minValueOrder">${subtotalValue.toFixed(2).replace('.',',')}€</span><br>
      <span>${deliveryCosts.toFixed(2).replace('.',',')}€</span><br>
      <span id="BasketValue" style="font-weight: bold;">${totalValue.toFixed(2).replace('.',',')}€</span>
    </div> 
  </div>
  <button id="payment" class="payment" onclick="alert('Sie werden zum Bezahlvorgang weitergeleitet.');">Bezahlen(${totalValue.toFixed(2).replace('.',',')}€)</button>
`;
}

function deleteItem(i) {
  let index = food.indexOf(food[i]);
  
    if (amount[index] >= 1) {
      food.splice(index, 1);
      price.splice(index, 1);
      amount.splice(index, 1);
    } else {
      amount[index]--;
    }

  categories = []; 
  render(); 
  renderShoppingBasket();  
  checkout();  
  openPopup();
}

/*Toggle between delivery & takeaway*/
function basketIsEmpty() {
  return food.length === 0;
}

function delivery() {
  if (basketIsEmpty()) {
    alert("Bitte wähle zuerst dein Wunschgericht");
  } else {
  isTakeaway = false;
  updateButtonStyle();
  checkout();  
  openPopup();
}
}

function takeaway() {
  if (basketIsEmpty()) {
    alert("Bitte wähle zuerst dein Wunschgericht.");
  } else {
  isTakeaway = true;
  updateButtonStyle();
  checkout();  
  openPopup();
}
}

function updateButtonStyle() {
  let deliveryButton = document.getElementById('delivery');
  let takeawayButton = document.getElementById('takeaway');

  if (isTakeaway) {
    deliveryButton.style.backgroundColor = "var(--Background_body)";
    takeawayButton.style.backgroundColor = "var(--Lieferando_orange)";
  } else {
    deliveryButton.style.backgroundColor = "var(--Lieferando_orange)";
    takeawayButton.style.backgroundColor = "var(--Background_body)";
  }
}


/*search function*/
function openSearch() { 
  let searchIcon = document.getElementById('searchIcon');
  let searchContainer = document.getElementById('searchContainer');
  let overview = document.getElementById('overview')
  
  searchIcon.style.display = 'none';
  searchContainer.style.display = 'flex';
  overview.style.display = 'none';
}

function closeSearch() {
  let searchIcon = document.getElementById('searchIcon');
  let searchContainer = document.getElementById('searchContainer');
  let overview = document.getElementById('overview');
  let searchInput = document.getElementById('searchInput');

  searchIcon.style.display = 'block';
  searchContainer.style.display = 'none';
  overview.style.display = 'flex';
  searchInput.value = '';
  
  categories = [];
  render();
}

function searchMenu() {
  let searchInput = document.getElementById('searchInput').value.toLowerCase(); 

  let menuContainer = document.getElementById('menuContainer');
  menuContainer.innerHTML = '';

  let searchResults = false;

  for (let i = 0; i < menuArray.length; i++) {
    let menu = menuArray[i].food.toLowerCase();

    if (menu.includes(searchInput)) {
      menuContainer.innerHTML += htmlTemplate(menuArray[i], i);
      searchResults = true;
    }
  }

  if (!searchResults) {
    alert('Deine Suche hat leider kein Ergebnis');
  }
}

function checkMinOrder(subtotalValue) {
  let minValueInfo = document.getElementById('minValueInfo');

  if (subtotalValue < 20.00) {
    minValueInfo.style.display = 'block';
  } else {
    minValueInfo.style.display = 'none';
  }
}

/*mobile shopping basket*/
function openPopup() {
  let popup = document.getElementById('popup'); 
  let shoppingCardContent = document.getElementById('shoppingCard');

  if (window.innerWidth <= 1280) {  
    popup.innerHTML = shoppingCardContent.innerHTML;
    popup.style.display = "block"; 
  } else {
    closePopup();
  }
}

function closePopup() {
  let popup = document.getElementById('popup'); 
  let shoppingCardContent = document.getElementById('shoppingCard');
  let mobileShoppingButton = document.getElementById('mobileShoppingButton');  
  let BasketValue = document.getElementById('BasketValue');

  if (window.innerWidth <= 1280) {
  popup.style.display = 'none';
  shoppingCardContent.style.display = 'none';
  mobileShoppingButton.innerHTML = `<img class="warenkorbIcon" src="./img/shoppingBasket.png"> Warenkorb ${BasketValue.textContent}`;
  mobileShoppingButton.style.backgroundColor = "var(--Lieferando_orange)";
  mobileShoppingButton.style.border = "none";
  } 
}

let PopupWindowOpen = false;

function TogglePopup() {
  let popup = document.getElementById('popup'); 
  let shoppingCardContent = document.getElementById('shoppingCard');
  let mobileShoppingButton = document.getElementById('mobileShoppingButton');  
  let BasketValue = document.getElementById('BasketValue');

  PopupWindowOpen = !PopupWindowOpen;

  popup.style.display = PopupWindowOpen ? "block" : "none";

  if (!PopupWindowOpen) { 
    popup.innerHTML = "";
    mobileShoppingButton.innerHTML = `<img class="warenkorbIcon" src="./img/shoppingBasket.png"> Warenkorb ${BasketValue.textContent}`;
    mobileShoppingButton.style.backgroundColor = "var(--Lieferando_orange)";
    mobileShoppingButton.style.border = "none";
  } else {
    popup.innerHTML = shoppingCardContent.innerHTML;
    mobileShoppingButton.innerHTML = 'Weitere Produkte hinzufügen';
    mobileShoppingButton.style.backgroundColor = "white";
    mobileShoppingButton.style.border = "1px solid grey"; 
  } 
} 
