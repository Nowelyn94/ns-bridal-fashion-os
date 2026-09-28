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
  async function listSocialMessages(){
    if(!client) return [];
    const {data,error}=await client.from('social_messages').select('*').eq('direction','inbound').order('received_at',{ascending:false}).limit(200);
    if(error) throw error;
    return data||[];
  }
  async function enrichSocialSender(sender_id,platform){
    if(!client||!sender_id) return null;
    const {data,error}=await client.functions.invoke('meta-actions',{body:{action:'profile',sender_id,platform}});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    return data;
  }
  async function replySocialMessage(row_id,sender_id,platform,text){
    if(!client) throw new Error('Cloud connection required.');
    const {data,error}=await client.functions.invoke('meta-actions',{body:{action:'reply',row_id,sender_id,platform,text}});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    return data;
  }
  async function deleteSocialMessage(id){
    if(!client) throw new Error('Cloud connection required.');
    const {error}=await client.from('social_messages').delete().eq('id',id);
    if(error) throw error;
    return true;
  }
  async function uploadMarketingImage(file){
    if(!client) return null;
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path=`posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const {error}=await client.storage.from('marketing-media').upload(path,file,{upsert:false});
    if(error) throw error;
    const {data}=client.storage.from('marketing-media').getPublicUrl(path);
    return data.publicUrl;
  }
  async function getMetaStatus(){
    if(!client) return null;
    const {data,error}=await client.functions.invoke('meta-publish',{body:{action:'status'}});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    return data;
  }
  async function publishMetaPost(caption,image_url,platforms){
    if(!client) throw new Error('Cloud connection required.');
    const {data,error}=await client.functions.invoke('meta-publish',{body:{action:'publish',caption,image_url,platforms}});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    return data;
  }
  window.NSCloud={configured,client,signIn,signOut,currentUser,submitBooking,uploadInventoryImage,listBookingRequests,saveCloudRecord,fetchCloudTable,listSocialMessages,enrichSocialSender,replySocialMessage,deleteSocialMessage,uploadMarketingImage,getMetaStatus,publishMetaPost};
})();
