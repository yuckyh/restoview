function loadComponents(session) {
  if (!session) {
    window.location = '/login';
  }

  var editProfileForm = document.querySelector('#editProfileForm');

  Object.keys(session).forEach((key) => {
    var val = session[key];

    editProfileForm[key].value = val;

    if (!editProfileForm[key].parentElement) return;

    editProfileForm[key].parentElement
      .querySelector('label')
      .classList.toggle('active', true);
  });

  fetch('/api/dashboard/reviews')
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      renderYourReviewItems('#reviews', data.userId, data.reviews);
    });
}

function getRestaurant(restaurantId) {
  return fetch(`/api/restaurant/${restaurantId}`).then((res) => res.json());
}

function renderYourReviewItems(selector, userId, reviews) {
  var list = document.querySelector(selector);
  list.innerHTML = '';

  if (!reviews.length) return;

  list.parentElement.querySelector('p').remove();

  return fetch('/partials/your-review-item.html')
    .then((res) => res.text())
    .then((html) =>
      Promise.all(reviews.map((data) => getRestaurant(data.restaurantId))).then(
        (restaurants) => {
          const content = reviews
            .map((review, i) => ({ ...review, ...restaurants[i] }))
            .map((data) => parseReviewTemplate(html, data))
            .join('');

          list.innerHTML = content;
        }
      )
    );
}

function fetchButtons(review) {
  return fetch('/partials/edit-delete-review.html')
    .then((res) => res.text())
    .then((html) => {
      var editDeleteReview = document.querySelector('#editDeleteReview');
      if (editDeleteReview) editDeleteReview.remove();

      review.insertAdjacentHTML('beforeend', html);
      document.querySelector('#reviews').prepend(review);
    });
}
