function getUserDetails(userId) {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
}
