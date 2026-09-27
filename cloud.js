(function(){
  const cfg = window.NS_CONFIG || {};
  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  let client = null;
  if(configured){ client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey); }

  async function signIn(email,password){
    if(!client) return {local:true,user:{email,role:'Owner'}};
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error) throw error;
    return data;
  }
  async function signOut(){ if(client) await client.auth.signOut(); }
  async function currentUser(){
    if(!client) return null;
    const {data}=await client.auth.getUser();
    return data?.user||null;
  }
  async function submitBooking(payload){
    if(!client){
      const key='nsBridalBookingRequests';
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      arr.push({id:'LOCAL-'+Date.now(),created_at:new Date().toISOString(),...payload});
      localStorage.setItem(key,JSON.stringify(arr));
      return {local:true};
    }
    const {error}=await client.from('booking_requests').insert(payload);
    if(error) throw error;
    return {local:false};
  }
  async function uploadInventoryImage(file){
    if(!client) return null;
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path=`inventory/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const {error}=await client.storage.from('inventory-images').upload(path,file,{upsert:false});
    if(error) throw error;
    const {data}=client.storage.from('inventory-images').getPublicUrl(path);
    return data.publicUrl;
  }
  async function listBookingRequests(){
    if(!client) return JSON.parse(localStorage.getItem('nsBridalBookingRequests')||'[]');
    const {data,error}=await client.from('booking_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    return data||[];
  }
  async function saveCloudRecord(table,record){
    if(!client) return null;
    const {data,error}=await client.from(table).upsert(record).select().single();
    if(error) throw error;
    return data;
  }
  async function fetchCloudTable(table){
    if(!client) return null;
    const {data,error}=await client.from(table).select('*');
    if(error) throw error;
    return data||[];
  }
  window.NSCloud={configured,client,signIn,signOut,currentUser,submitBooking,uploadInventoryImage,listBookingRequests,saveCloudRecord,fetchCloudTable};
})();
