function loadComponents(session) {
  console.log('lc', session);
  document.querySelector('#loginForm').addEventListener('submit', formLogin);

  if (!session) return;
  window.location = '/';
}

function formLogin(ev) {
  ev.preventDefault();

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
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return refreshSession();
    });
}
