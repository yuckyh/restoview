window.addEventListener('load', refreshSession);

var sidenavInstances = [];

function materializeInit() {
  console.log('Materialize init');

  sidenavInstances.forEach((instance) => instance.destroy());

  M.AutoInit();

  var sidenavs = document.querySelectorAll('.sidenav.no-autoinit');
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

      if (data.user) return data.user;
    })
    .then(checkURL)
    .then(loadPartials)
    .then(loadComponents)
    .then(materializeInit);
}

// Util functions

function reloadImage(url) {
  return fetch(url, { cache: 'reload', mode: 'no-cors' }).then(() =>
    document.body
      .querySelectorAll(`img[src='${url}']`)
      .forEach((img) => (img.src = url))
  );
}

function checkURL(session) {
  var location = new URL(window.location).pathname;
  if (!session && location === '/dashboard') {
    window.location = '/login';
  }

  var noLoggedIn = ['/login', '/register', '/reset-password'];

  if (session && noLoggedIn.some((path) => location.includes(path))) {
    window.location = '/';
  }

  return session;
}

function includeHeader(session) {
  var header = document.querySelector('header');
  header.classList.toggle('navbar-fixed', true);

  header.innerHTML = '';
  return getPartial('/header', (rawHeader) =>
    parseHeaderTemplate(rawHeader, session).then((headerHTML) => {
      header.innerHTML = headerHTML;
      window.addEventListener('scroll', (ev) => {
        var navClasses = header.querySelector('nav').classList;
        if (scrollY < header.scrollHeight) {
          navClasses.toggle('white', true);
          navClasses.toggle('black-text', true);
          navClasses.toggle('z-depth-0', true);
          return;
        }
        navClasses.toggle('white', false);
        navClasses.toggle('black-text', false);
        navClasses.toggle('z-depth-0', false);
      });
    })
  );
}

function includeFooter() {
  var footer = document.querySelector('footer');
  footer.innerHTML = '';
  return getPartial('/footer', (footerHTML) => (footer.innerHTML = footerHTML));
}

function renderRestaurantCards(selector, restaurants) {
  var element = document.querySelector(selector);
  return getPartial('/restaurant-card', (html) => {
    var content = restaurants.map((data) => parseHandlebars(html, data));

    element.innerHTML = content.join('');

    element.style.opacity = 1;

    var viewMore = document.querySelector('#viewMore');

    if (restaurants.length < 12)
      return viewMore && viewMore.parentElement.parentElement.remove();

    return renderViewMoreButton(selector, viewMore);
  });
}

function renderViewMoreButton(selector, viewMore) {
  return getPartial('/view-more', (html) => {
    if (!viewMore)
      return document
        .querySelector(selector)
        .insertAdjacentHTML('afterend', html);
  });
}

function renderCuisineFilters(selector, cuisines) {
  return getPartial('/cuisine-filter', (html) => {
    var content = cuisines
      .map((cuisine) => parseHandlebars(html, cuisine))
      .join('');
    document.querySelector(selector).innerHTML = content;
  });
}

function parseHeaderTemplate(html, session) {
  var path = session ? '/session-nav' : '/no-session-nav';
  return getPartial(path, (nav) =>
    html.replaceAll('{{ nav }}', parseHandlebars(nav, session))
  );
}

function parseHandlebars(html, data, depth) {
  if (data === null || data === undefined) {
    var key = depth.replace('.', '');
    return html.replaceAll(`{{ ${key} }}`, `There are no ${key}.`);
  }

  Object.keys(data).forEach((key) => {
    depth = depth || '';
    if (typeof data[key] === 'object')
      return (html = parseHandlebars(html, data[key], depth + key + '.'));

    html = html.replaceAll(`{{ ${depth + key} }}`, data[key]);
  });

  return html;
}

function jsonFormData(form) {
  var data = {};
  var prevKey;
  for (let entry of new FormData(form).entries()) {
    entry[1] = tryParseInt(entry[1]);
    if (prevKey === entry[0]) {
      if (!data[entry[0]].length) {
        var existingValue = data[entry[0]];
        data[entry[0]] = [existingValue, entry[1]];
      } else {
        data[entry[0]].push(entry[1]);
      }
    } else {
      data[entry[0]] = entry[1];
    }
    prevKey = entry[0];
  }

  return data;
}

function tryParseInt(val) {
  return isNaN(parseInt(val)) ? val : parseInt(val);
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

function getPartial(file, callback) {
  return fetch(`/partials${file}.html`)
    .then((res) => res.text())
    .then((html) => callback(html));
}
