function loadComponents(session) {
  document
    .querySelector('#resetPasswordForm')
    .addEventListener('submit', formResetPassword);
}

function formResetPassword(ev) {
  ev.preventDefault();

  console.log(ev.target.dataset.active);

  if (ev.target.dataset.active) return;

  ev.target.dataset.active = 'true';

  var data = jsonFormData(ev.target);

  return fetch('/api/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      delete ev.target.dataset.active;
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return M.toast({
        html: 'Password reset email sent successfully!',
        completeCallback: () => (window.location = '/'),
      });
    });
}
