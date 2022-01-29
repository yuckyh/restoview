function getRestaurants() {
  return fetch('/api/restaurants')
    .then((res) => res.json())
    .then((body) => {
      console.log(body);
      return renderRestaurantCards('#restaurants', body.restaurants);
    });
}

var loadComponents = () => getRestaurants();

var loadNoSessionComponents = () => {};
var loadSessionComponents = () => {};

// var loadNoSessionComponents = () => getRestaurants();
// var loadSessionComponents = () => getRestaurants();
