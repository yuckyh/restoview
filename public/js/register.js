function loadComponents(session) {
  var registerForm = document.querySelector('#registerForm');

  document
    .querySelector('#registerForm')
    .addEventListener('submit', formRegister);

  if (!session) return;
  window.location = '/';
}

function formRegister(ev) {
  ev.preventDefault();

  console.log(ev.target);

  var data = jsonFormData(ev.target);

  data.password += '';
  data.confirmPassword += '';

  const { password, confirmPassword } = data;

  if (password !== confirmPassword) return alert("Passwords doesn't match!");

  var formData = new FormData(ev.target);
  formData.delete('confirmPassword');
  return fetch('/api/register', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: '*/*',
      // 'Content-Type':
      //   'multipart/form-data; boundary=------WebKitFormBoundaryyXTpZQAfU1lqBqgo',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return refreshSession();
    });
}
