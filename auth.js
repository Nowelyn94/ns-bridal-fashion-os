(async function(){
  const overlay=document.getElementById('loginOverlay');
  const form=document.getElementById('loginForm');
  const errorBox=document.getElementById('loginError');
  if(!window.NSCloud?.configured){ overlay.classList.add('hidden'); return; }
  const user=await NSCloud.currentUser();
  if(!user) overlay.classList.remove('hidden');
  form.addEventListener('submit',async e=>{
    e.preventDefault(); errorBox.textContent='';
    const btn=form.querySelector('button'); btn.disabled=true; btn.textContent='Signing in…';
    try{ const f=Object.fromEntries(new FormData(form)); await NSCloud.signIn(f.email,f.password); overlay.classList.add('hidden'); }
    catch(err){ errorBox.textContent=err.message||'Could not sign in.'; }
    finally{ btn.disabled=false; btn.textContent='Sign In'; }
  });
})();
