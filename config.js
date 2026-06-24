// ใส่ URL ของ Web App ที่ deploy จาก Google Apps Script ตรงนี้
// (ลงท้ายด้วย /exec)
window.API_URL = 'https://script.google.com/macros/s/AKfycbwGmzDjrlvyHFwBy5YxFb6f_rW2HkekP0Y5As7_KPYsQTRPbGOHyJvMxUE2FEH5p0HTXQ/exec';

// ⚠️ ค่าด้านล่างเป็นแค่ FALLBACK เผื่อโหลดแท็บ Channels ไม่ได้
// ปกติรายชื่อช่องทางมาจากแท็บ Channels ใน Sheet (จัดการได้จากหน้า Dashboard)
window.AD_CHANNELS = ['FB+IG', 'Google', 'Line@', 'Shopee', 'Lazada', 'TikTok', 'Cp-shopee', 'Cp-lazada', 'Cp-tiktok'];

window.MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

// อัตราต้นทุน% และ GP% ต่อแบรนด์ (ใช้ในตาราง P&L) — แก้ได้ตรงนี้ แล้วรีโหลดหน้า
window.BRAND_RATES = {
  'Folio Brand': { cost: 30, gp: 21 },
  'Folio Art':   { cost: 35, gp: 21 },
  'FoFellow':    { cost: 35, gp: 21 },
  'Giftbox':     { cost: 35, gp: 9.5 }
};
// แบรนด์ที่แสดงในตาราง P&L (มีรายได้) — เรียงตามนี้
window.PNL_BRANDS = ['Folio Brand', 'Folio Art', 'FoFellow', 'Giftbox'];

// ---------- ระบบ Login / สิทธิ์ (ใช้ร่วมทุกหน้า) ----------
window.AUTH = {
  token: function(){ return localStorage.getItem('folio_token'); },
  role:  function(){ return localStorage.getItem('folio_role'); },
  name:  function(){ return localStorage.getItem('folio_name'); },
  user:  function(){ return localStorage.getItem('folio_user'); },
  set: function(d){ localStorage.setItem('folio_token',d.token); localStorage.setItem('folio_role',d.role||''); localStorage.setItem('folio_name',d.name||''); localStorage.setItem('folio_user',d.username||''); },
  clear: function(){ ['folio_token','folio_role','folio_name','folio_user'].forEach(function(k){ localStorage.removeItem(k); }); },
  // เรียกตอนเปิดหน้า — ถ้าไม่มี token เด้งไป login
  guard: function(){ if(!localStorage.getItem('folio_token')){ location.href='login.html'; return false; } return true; },
  logout: function(){ var t=localStorage.getItem('folio_token'); window.AUTH.clear();
    try{ fetch(API_URL,{method:'POST',body:JSON.stringify({action:'logout',token:t})}); }catch(e){}
    location.href='login.html'; },
  // เช็คผลลัพธ์ ถ้า token หมดอายุ/ไม่ผ่าน เด้งไป login
  check: function(j){ if(j && j.needLogin){ window.AUTH.clear(); location.href='login.html'; return false; } return true; },
  isAdmin:  function(){ return localStorage.getItem('folio_role')==='admin'; },
  canEdit:  function(){ var r=localStorage.getItem('folio_role'); return r==='admin'||r==='editor'; }
};
// URL bootstrap แนบ token
window.bootstrapUrl = function(){ return API_URL+'?action=bootstrap&token='+encodeURIComponent(window.AUTH.token()||''); };

// สิทธิ์เข้าถึงแต่ละหน้า ตาม role
window.PAGE_ACCESS = {
  'index.html':   ['admin','editor','viewer'],   // Dashboard — ทุกคน
  'form.html':    ['admin','editor'],             // กรอกข้อมูล — admin+editor
  'target.html':  ['admin'],
  'scratch.html': ['admin'],
  'adsdoc.html':  ['admin'],
  'login.html':   ['admin','editor','viewer']
};
AUTH.canAccess = function(page){ var a=window.PAGE_ACCESS[page]; var r=this.role(); return !a || (r && a.indexOf(r)!==-1); };
// guard + เช็คสิทธิ์หน้า ถ้าไม่มีสิทธิ์เด้งกลับ Dashboard
AUTH.guardPage = function(page){ if(!this.guard()) return false; if(!this.canAccess(page)){ alert('คุณไม่มีสิทธิ์เข้าหน้านี้'); location.href='index.html'; return false; } return true; };
// ซ่อนปุ่มเมนูของหน้าที่ role นี้เข้าไม่ได้
AUTH.applyNav = function(){ var r=this.role(); document.querySelectorAll('.nav a[href]').forEach(function(a){ var allow=window.PAGE_ACCESS[a.getAttribute('href')]; if(allow && r && allow.indexOf(r)===-1) a.style.display='none'; }); };

// ---------- ตัวช่วย Export Excel (.xlsx) — ใช้ร่วมทุกหน้า ----------
// sheets = [{ name:'ชื่อชีท', aoa:[[แถว1...],[แถว2...]] }]
window.exportXLSX = function(filename, sheets){
  if (typeof XLSX === 'undefined') { alert('ยังโหลดตัวสร้าง Excel ไม่เสร็จ ลองใหม่อีกครั้ง'); return; }
  var wb = XLSX.utils.book_new();
  sheets.forEach(function(s){
    var ws = XLSX.utils.aoa_to_sheet(s.aoa);
    XLSX.utils.book_append_sheet(wb, ws, String(s.name).substring(0,31));
  });
  XLSX.writeFile(wb, filename);
};
