function getRestaurant() {
  var url = new URL(location.href);
  var restaurantId = url.pathname.split('/')[2];

  return fetch(`/api/restaurant/${restaurantId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return fetch('/partials/restaurant-details.html')
        .then((res) => res.text())
        .then((html) => {
          var restaurantDetails = document.querySelector('#restaurantDetails');

          document.title = `Restoview - ${data.restaurant.name}`;

          restaurantDetails.innerHTML = parseRestaurantTemplate(
            html,
            data.restaurant
          );

          document.querySelector('nav .breadcrumb:last-child').innerHTML =
            data.restaurant.name;

          return data.restaurant.id;
        });
    });
}

function getReviews(restaurantId) {
  return fetch(`/api/restaurant/${restaurantId}/reviews`)
    .then((res) => res.json())
    .then((body) => {
      console.log(body);
      return Promise.all([
        renderReviewListItems('#reviews', body.reviews),
        restaurantId,
      ]);
    });
}

function getUser(userId) {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
}

var loadComponents = (session) => {
  var addReview = document.querySelector('#addReview');

  if (addReview) addReview.remove();

  return getRestaurant()
    .then(getReviews)
    .then((res) => loadSessionComponents(session, res[1]));
};

var loadSessionComponents = (session, restaurantId) => {
  if (!session) return;

  console.log(session);
  var matchingReview = Array.from(
    document.querySelectorAll('#reviews .collection-item')
  ).filter((element) => {
    return element.querySelector('span.title').innerHTML === session.username;
  });

  var verb = matchingReview.length ? 'edit' : 'add';

  var formModal = fetchFormModal(verb, session, restaurantId);

  if (verb === 'edit')
    return Promise.all([
      formModal,
      fetchButtons(matchingReview[0]),
      fetchDeleteModal(restaurantId),
    ]);

  return Promise.all([formModal, fetchButton()]);
};

function formAddReview(ev, restaurantId) {
  ev.preventDefault();

  var data = jsonFormData(ev.target);

  fetch(`/api/restaurant/${restaurantId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return refreshSession();
    });
}

function formEditReview(ev, restaurantId) {
  ev.preventDefault();

  var data = jsonFormData(ev.target);

  fetch(`/api/restaurant/${restaurantId}/review`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return refreshSession();
    });
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

function fetchButton() {
  return fetch('/partials/add-review.html')
    .then((res) => res.text())
    .then((html) => {
      document
        .querySelector('#reviews')
        .insertAdjacentHTML('beforebegin', html);
    });
}

function fetchFormModal(verb, session, restaurantId) {
  if (document.querySelector('#addReviewForm') && verb === 'edit') {
    document.querySelector('#addReviewForm').remove();
    materializeInit();
  }

  if (document.querySelector('#editReviewForm') && verb === 'add') {
    document.querySelector('#editReviewForm').remove();
    materializeInit();
  }

  return fetch('/partials/modals/review-form.html')
    .then((res) => res.text())
    .then((html) => {
      var form = document.querySelector(`#${verb}ReviewForm`);
      if (form) form.remove();

      var deleteModal = document.querySelector('#deleteReviewForm');
      if (deleteModal) deleteModal.remove();

      var content = html.replaceAll('{{ action }}', verb);
      document.querySelector('body').insertAdjacentHTML('beforeend', content);

      form = document.querySelector(`#${verb}ReviewForm`);

      if (verb === 'edit') {
        fetch(`/api/restaurant/${restaurantId}/review/user/${session.id}`)
          .then((res) => res.json())
          .then((data) => {
            form
              .querySelector('label[for=content]')
              .classList.toggle('active', true);
            form['content'].value = data.review.content;
            form['rating'].value = data.review.rating;
            refreshRatingInput(data.review.rating);
          });

        form.addEventListener('submit', (ev) =>
          formEditReview(ev, restaurantId)
        );
      } else {
        form.addEventListener('submit', (ev) =>
          formAddReview(ev, restaurantId)
        );
      }
      Array.from(
        document.querySelectorAll('.rating-input input[type=checkbox]')
      ).forEach((element) => {
        element.addEventListener('change', updateRatingInput);
      });
    });
}

function fetchDeleteModal(restaurantId) {
  return fetch('/partials/modals/delete-review.html')
    .then((res) => res.text())
    .then((html) => {
      document.querySelector('body').insertAdjacentHTML('beforeend', html);

      document
        .querySelector('#deleteReview')
        .addEventListener('click', (ev) => {
          ev.preventDefault();
          return fetch(`/api/restaurant/${restaurantId}/review`, {
            method: 'DELETE',
          }).then(refreshSession);
        });
    });
}
