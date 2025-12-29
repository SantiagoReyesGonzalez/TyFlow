(async () => {
  if (!window.supabaseClient) {
    console.error('Supabase no inicializado');
    window.location.href = '/TyFlow/index.html';
    return;
  }

  const { data, error } = await window.supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = '/TyFlow/index.html';
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');

  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '/TyFlow/index.html';
  });
});
