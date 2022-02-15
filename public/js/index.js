function loadComponents() {
  var contentTogglers = document.querySelectorAll('.content-toggler');
  contentTogglers.forEach((toggle) =>
    toggle.addEventListener('click', contentToggle)
  );

  getCuisines();

  getRestaurants();
  var form = document.querySelector('#filterForm');

  form.addEventListener('input', getRestaurants);
}

function getCuisines() {
  return fetch('/api/cuisines')
    .then((res) => res.json())
    .then((data) =>
      renderCuisineFilters('#filterContent .row:nth-child(2)', data)
    );
}

function getRestaurants(ev) {
  ev && ev.preventDefault();

  var form = (ev && ev.currentTarget) || document.querySelector('#filterForm');

  var data = new FormData(form);

  if (form['all']) toggleAllCheckbox(data, form);

  var url = new URL('/api/restaurants', window.location.origin);

  window.form = form;

  var jsonData = jsonFormData(form);

  Array.from(Object.entries(jsonData)).forEach((entry) => {
    url.searchParams.set(entry[0], entry[1]);
  });

  return fetch(url)
    .then((res) => res.json())
    .then((body) => {
      return renderRestaurantCards('#restaurants', body.restaurants);
    });
}

function toggleAllCheckbox(data, form) {
  if (!data.get('all')) {
    form['all'].value = 1;
    form['all'].parentElement.querySelector('button').innerHTML = 'View More';
    return;
  }
  form['all'].value = '';
  form['all'].parentElement.querySelector('button').innerHTML = 'View Less';
}

function contentToggle(ev) {
  var el = ev.currentTarget;
  var target = document.getElementById(el.dataset.target);
  if (!target.classList.contains('visible')) {
    el.innerHTML = `${el.dataset.text}<i class="material-icons right">done</i>`;
    target.classList.toggle('visible', true);
    return true;
  }

  el.innerHTML = `${el.dataset.text}<i class="material-icons right">${el.dataset.icon}</i>`;
  target.classList.toggle('visible', false);
}
