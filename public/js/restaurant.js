function getRestaurant() {
  var url = new URL(window.location);
  var restaurantId = url.pathname.split('/')[2];

  return fetch(`/api/restaurant/${restaurantId}`)
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
      return getPartial('/restaurant-details', (html) => {
        var restaurantDetails = document.querySelector('#restaurantDetails');

        document.title = `Restoview - ${data.restaurant.name}`;

        console.log(data.restaurant);

        restaurantDetails.innerHTML = parseHandlebars(html, data.restaurant);

        restaurantDetails.style.opacity = 1;

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

  var action = matchingReview.length ? 'edit' : 'add';

  var renderModal = renderFormModal(action, session, restaurantId);

  if (action === 'edit')
    return Promise.all([
      renderModal,
      renderButtons(matchingReview[0]),
      renderDeleteModal(restaurantId),
    ]);

  return Promise.all([renderModal, renderButton()]);
};

function formAddReview(ev, restaurantId) {
  ev.preventDefault();

  if (ev.target.dataset.active) return;

  ev.target.dataset.active = 'true';

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
      delete ev.target.dataset.active;
      console.log(data);
      return refreshSession();
    });
}

function formEditReview(ev, restaurantId) {
  ev.preventDefault();

  if (ev.target.dataset.active) return;

  ev.target.dataset.active = 'true';

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
      delete ev.target.dataset.active;
      console.log(data);
      return refreshSession();
    });
}

function renderReviewListItems(selector, reviews) {
  var list = document.querySelector(selector);

  list.style.opacity = 1;
  list.innerHTML = '';

  list.parentElement.querySelector('p').innerHTML = 'There are no reviews yet...'

  if (!reviews.length) return;

    list.parentElement.querySelector('p').innerHTML = '';

  return getPartial('/review-list-item', (html) => {
    return Promise.all(reviews.map((data) => getUser(data.userId))).then(
      (users) => {
        const content = reviews
          .map((review, i) => ({ ...review, ...users[i] }))
          .map((data) => parseHandlebars(html, data))
          .join('');

        list.innerHTML = content;
      }
    );
  });
}

function renderButtons(review) {
  return getPartial('/edit-delete-review', (html) => {
    var editDeleteReview = document.querySelector('#editDeleteReview');
    if (editDeleteReview) editDeleteReview.remove();

    review.insertAdjacentHTML('beforeend', html);
    document.querySelector('#reviews').prepend(review);
  });
}

function renderButton() {
  return getPartial('/add-review', (html) => {
    document.querySelector('#reviews').insertAdjacentHTML('beforebegin', html);
  });
}

function renderFormModal(action, session, restaurantId) {
  if (document.querySelector('#addReviewForm') && action === 'edit') {
    document.querySelector('#addReviewForm').remove();
    materializeInit();
  }

  if (document.querySelector('#editReviewForm') && action === 'add') {
    document.querySelector('#editReviewForm').remove();
    materializeInit();
  }

  return getPartial('/modals/review-form', (html) => {
    var form = document.querySelector(`#${action}ReviewForm`);
    if (form) form.remove();

    var deleteModal = document.querySelector('#deleteReviewForm');
    if (deleteModal) deleteModal.remove();

    document
      .querySelector('body')
      .insertAdjacentHTML('beforeend', parseHandlebars(html, { action }));

    form = document.querySelector(`#${action}ReviewForm`);

    if (action === 'edit') {
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

      form.addEventListener('submit', (ev) => formEditReview(ev, restaurantId));
    } else {
      form.addEventListener('submit', (ev) => formAddReview(ev, restaurantId));
    }
    Array.from(
      document.querySelectorAll('.rating-input input[type=checkbox]')
    ).forEach((element) => {
      element.addEventListener('change', updateRatingInput);
    });
  });
}

function renderDeleteModal(restaurantId) {
  return getPartial('/modals/delete-review', (html) => {
    document.querySelector('body').insertAdjacentHTML('beforeend', html);

    document.querySelector('#deleteReview').addEventListener('click', (ev) => {
      ev.preventDefault();
      return fetch(`/api/restaurant/${restaurantId}/review`, {
        method: 'DELETE',
      }).then(refreshSession);
    });
  });
}
