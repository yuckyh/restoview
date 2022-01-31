function loadComponents(session) {
  if (session) window.location = '/';

  document
    .querySelector('#resetPasswordForm')
    .addEventListener('submit', formResetPassword);
}

function formResetPassword(ev) {
  ev.preventDefault();

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
      if (data.err) return M.toast({ html: data.err.error });
      console.log(data);
      return M.toast({
        html: 'Password reset email sent successfully!',
        completeCallback: () => (window.location = '/login'),
      });
    });
}
