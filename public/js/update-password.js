function loadComponents() {
  document
    .querySelector('#updatePasswordForm')
    .addEventListener('submit', formUpdatePassword);
}

function formUpdatePassword(ev) {
  ev.preventDefault();

  var data = jsonFormData(ev.target);

  data.password += '';
  data.confirmPassword += '';

  const { password, confirmPassword } = data;

  if (password !== confirmPassword)
    return M.toast({ html: "Passwords doesn't match!" });

  var url = new URL(window.location).pathname;

  return fetch(`/api${url}`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return M.toast({
        html: 'Password updated successfully!',
        completeCallback: () => (window.location = '/login'),
      });
    });
}
