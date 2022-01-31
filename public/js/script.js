window.addEventListener('load', refreshSession);

var sidenavInstances = [];

function materializeInit() {
  console.log('Materialize init');

  sidenavInstances.forEach((instance) => instance.destroy());

  M.AutoInit();

  var sidenavs = document.querySelectorAll('.sidenav');
  sidenavInstances = M.Sidenav.init(sidenavs, {});

  var counters = document.querySelectorAll('input[data-length]');
  var counterInstances = M.CharacterCounter.init(counters, {});
}

function loadPartials(session) {
  return Promise.all([includeHeader(session), includeFooter()]).then(() => {
    var logoutLinks = document.querySelectorAll('.logout-link');

    if (!logoutLinks.length) return;

    Array.from(logoutLinks).forEach((link) =>
      link.addEventListener('click', () =>
        fetch('/api/logout', { method: 'DELETE' }).then(refreshSession)
      )
    );

    return session;
  });
}

function refreshSession() {
  return fetch('/api/dashboard')
    .then((res) => res.json())
    .then((data) => {
      if (!data) return;

      if (data.err) return console.log(data.err);

      if (data.user) {
        console.log(data.user);
        return data.user;
      }
    })
    .then(loadPartials)
    .then(loadComponents)
    .then(materializeInit);
}

// Util functions

function includeHeader(session) {
  var element = document.querySelector('header');
  element.innerHTML = '';
  return fetch('/partials/header.html')
    .then((res) => res.text())
    .then((rawHeader) =>
      parseHeaderTemplate(rawHeader, session).then(
        (header) => (element.innerHTML = header)
      )
    );
}

function includeFooter() {
  var element = document.querySelector('footer');
  element.innerHTML = '';
  return fetch('/partials/footer.html')
    .then((res) => res.text())
    .then((footer) => (element.innerHTML = footer));
}

function renderRestaurantCards(selector, restaurants) {
  return fetch('/partials/restaurant-card.html')
    .then((res) => res.text())
    .then((html) => {
      const content = restaurants.map((data) =>
        parseRestaurantTemplate(html, data)
      );
      document
        .querySelectorAll(selector)
        .forEach((e) => (e.innerHTML = content.join('')));
    });
}

function renderReviewListItems(selector, reviews) {
  var list = document.querySelector(selector);
  list.innerHTML = '';

  if (!reviews.length) return;

  if (list.parentElement.querySelector('p'))
    list.parentElement.querySelector('p').remove();

  return fetch('/partials/review-list-item.html')
    .then((res) => res.text())
    .then((html) => {
      return Promise.all(reviews.map((data) => getUser(data.userId))).then(
        (users) => {
          const content = reviews
            .map((review, i) => ({ ...review, ...users[i] }))
            .map((data) => parseReviewTemplate(html, data))
            .join('');

          list.innerHTML = content;
        }
      );
    });
}

function parseHeaderTemplate(html, session) {
  var path = session
    ? '/partials/session-nav.html'
    : '/partials/no-session-nav.html';
  return fetch(path)
    .then((res) => res.text())
    .then((nav) =>
      html.replaceAll('{{ nav }}', parseNavTemplate(nav, session))
    );
}

function parseNavTemplate(html, user) {
  if (!user) return html;
  return html
    .replaceAll('{{ user.username }}', user.username)
    .replaceAll('{{ user.id }}', user.id)
    .replaceAll('{{ user.firstName }}', user.firstName)
    .replaceAll('{{ user.lastName }}', user.lastName)
    .replaceAll('{{ user.email }}', user.email);
}

function parseRestaurantTemplate(html, restaurantData) {
  return html
    .replaceAll('{{ name }}', restaurantData.name)
    .replaceAll('{{ id }}', restaurantData.id)
    .replaceAll('{{ description }}', restaurantData.description)
    .replaceAll('{{ rating }}', restaurantData.rating)
    .replaceAll('{{ location }}', restaurantData.location)
    .replaceAll('{{ openDays }}', restaurantData.openDays)
    .replaceAll('{{ openTime }}', restaurantData.openTime)
    .replaceAll('{{ closeTime }}', restaurantData.closeTime)
    .replaceAll(
      '{{ cuisines }}',
      restaurantData.cuisines.replaceAll(',', ', ')
    );
}

function parseReviewTemplate(html, reviewData) {
  if (reviewData.user) {
    html = html.replaceAll('{{ user.username }}', reviewData.user.username);
  }

  if (reviewData.restaurant) {
    html = html
      .replaceAll('{{ restaurant.name }}', reviewData.restaurant.name)
      .replaceAll('{{ restaurant.id }}', reviewData.restaurant.id);
  }

  html = html
    .replaceAll('{{ rating }}', reviewData.rating)
    .replaceAll('{{ userId }}', reviewData.userId)
    .replaceAll('{{ content }}', reviewData.content);

  return html;
}

function jsonFormData(form) {
  var data = {};
  for (let entry of new FormData(form).entries()) {
    if (!isNaN(parseInt(entry[1]))) {
      data[entry[0]] = parseInt(entry[1]);
      continue;
    }
    data[entry[0]] = entry[1];
  }
  return data;
}

function updateRatingInput(ev) {
  refreshRatingInput(ev.target.value);
}

function refreshRatingInput(value) {
  var inputRating = Array.from(
    document.querySelectorAll('.rating-input label')
  );

  for (let label of inputRating) {
    var classList = label.querySelector('i').classList;
    classList.toggle('pink-text', false);
    classList.toggle('lighten-1', false);
  }

  for (let i = 0; i < value; i++) {
    var classList = inputRating[i].querySelector('i').classList;
    classList.toggle('pink-text', true);
    classList.toggle('lighten-1', true);
  }
}
