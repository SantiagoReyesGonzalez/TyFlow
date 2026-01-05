// Herramienta simple de diagnóstico para el dashboard
window.showAppDiagnostics = function() {
  try {
    const info = {
      hasSupabaseLib: !!window.supabase,
      hasSupabaseClient: !!window.supabaseClient,
      currentUser: window.currentUser || null,
      currentUserIsAdmin: window.currentUserIsAdmin === true,
      bodyDatasetRole: document?.body?.dataset?.role || null,
      domLoaded: document?.readyState,
    };
    console.group('App diagnostics');
    console.log('Diagnostics object:', info);
    console.log('window.supabase:', window.supabase);
    console.log('window.supabaseClient:', window.supabaseClient);
    console.log('window.currentUser:', window.currentUser);
    console.log('window.currentUserIsAdmin:', window.currentUserIsAdmin);
    console.log('document.body.dataset.role:', document?.body?.dataset?.role);
    console.groupEnd();
    return info;
  } catch (e) {
    console.error('showAppDiagnostics error', e);
    return { error: String(e) };
  }
};

console.log('diagnostics.js loaded — use showAppDiagnostics() in console');
