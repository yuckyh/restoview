function loadComponents(session) {
  var editProfileForm = document.querySelector('#editProfileForm');

  Object.keys(session).forEach((key) => {
    var val = session[key];

    editProfileForm[key].value = val;

    if (!editProfileForm[key].parentElement) return;

    editProfileForm[key].parentElement
      .querySelector('label')
      .classList.toggle('active', true);
  });

  document
    .querySelector('#profilePic')
    .setAttribute('src', `/storage/img/user/${session.id}.jpg`);

  reloadImage(`/storage/img/user/${session.id}.jpg`);

  editProfileForm.addEventListener('submit', formUpdate);

  document
    .querySelector('#confirmDelete')
    .addEventListener('click', confirmDelete);

  fetch('/api/dashboard/reviews')
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      renderYourReviewItems('#reviews', data.reviews);
    });
}

function getRestaurant(restaurantId) {
  return fetch(`/api/restaurant/${restaurantId}`).then((res) => res.json());
}

function renderYourReviewItems(selector, reviews) {
  var list = document.querySelector(selector);
  list.innerHTML = '';

  list.parentElement.querySelector('p').innerHTML =
    'You have no reviews yet...';

  if (!reviews.length) return;

  list.parentElement.querySelector('p').innerHTML = '';

  return getPartial('/your-review-item', (html) =>
    Promise.all(reviews.map((data) => getRestaurant(data.restaurantId))).then(
      (restaurants) => {
        const content = reviews
          .map((review, i) => ({ ...review, ...restaurants[i] }))
          .map((data) => parseHandlebars(html, data))
          .join('');

        list.innerHTML = content;

        list.style.opacity = 1;
      }
    )
  );
}

function renderButtons(review) {
  return getPartial('/edit-delete-review', (html) => {
    var editDeleteReview = document.querySelector('#editDeleteReview');
    if (editDeleteReview) editDeleteReview.remove();

    review.insertAdjacentHTML('beforeend', html);
    document.querySelector('#reviews').prepend(review);
  });
}

function formUpdate(ev) {
  ev.preventDefault();

  if (ev.target.dataset.active) return;

  ev.target.dataset.active = 'true';

  var formData = new FormData(ev.target);
  return fetch('/api/dashboard', {
    method: 'PATCH',
    body: formData,
    headers: {
      Accept: '*/*',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      delete ev.target.dataset.active;
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return refreshSession();
    });
}

function confirmDelete() {
  M.toast({
    html: 'Are you sure?<button id="deleteLink" class="btn-flat toast-action">yes</button>',
  });

  document.querySelector('#deleteLink').addEventListener('click', linkDelete);
}

function linkDelete() {
  return fetch('/api/dashboard', {
    method: 'DELETE',
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      M.toast({
        html: 'Account deleted successfully, redirecting...',
        completeCallback: () => (window.location = '/'),
      });
    });
}
