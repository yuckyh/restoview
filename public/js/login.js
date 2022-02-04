function loadComponents(session) {
  document.querySelector('#loginForm').addEventListener('submit', formLogin);
}

function formLogin(ev) {
  ev.preventDefault();

  if (ev.target.dataset.active) return;

  ev.target.dataset.active = 'true';

  var data = jsonFormData(ev.target);
  var username = data.username;
  var password = data.password;

  return fetch('/api/login', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
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
