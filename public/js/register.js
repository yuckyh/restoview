function loadComponents(session) {
  document
    .querySelector('#registerForm')
    .addEventListener('submit', formRegister);
}

function formRegister(ev) {
  ev.preventDefault();

  var data = jsonFormData(ev.target);

  data.password += '';
  data.confirmPassword += '';

  const { password, confirmPassword } = data;

  if (password !== confirmPassword)
    return M.toast({ html: "Passwords doesn't match!" });

  var formData = new FormData(ev.target);
  formData.delete('confirmPassword');
  return fetch('/api/register', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: '*/*',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return refreshSession();
    });
}
