/* global */

const ICONS = {
  moon:`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"/></svg>`,
  sun:`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM3 11h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Zm17 0h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2ZM5.2 5.2a1 1 0 0 1 1.4 0l.7.7A1 1 0 1 1 5.9 7.3l-.7-.7a1 1 0 0 1 0-1.4Zm12.2 12.2a1 1 0 0 1 1.4 0l.7.7a1 1 0 1 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4ZM18.8 5.2a1 1 0 0 1 0 1.4l-.7.7A1 1 0 1 1 16.7 5.9l.7-.7a1 1 0 0 1 1.4 0ZM7.3 16.7a1 1 0 0 1 0 1.4l-.7.7a1 1 0 1 1-1.4-1.4l.7-.7a1 1 0 0 1 1.4 0Z"/></svg>`,
};

const el = (id) => document.getElementById(id);
const THEME_KEY = "siymon_theme_v3";
const LANG_KEY = "siymon_lang_v1";
const LANGS = ["ar","en","fr"];

let lang = localStorage.getItem(LANG_KEY) || "ar";

const i18n = {
  ar: { dir:"rtl", title:"سياسة الشركة", pill:"سياسة الشركة", back:"الرجوع", footer:"© siymon", empty:"لا توجد سياسة مضافة حالياً.", updated:"آخر تحديث:", },
  en: { dir:"ltr", title:"Company policy", pill:"Company policy", back:"Back", footer:"© siymon", empty:"No policy has been added yet.", updated:"Last updated:", },
  fr: { dir:"ltr", title:"Politique de l’entreprise", pill:"Politique", back:"Retour", footer:"© siymon", empty:"Aucune politique n’a été ajoutée pour le moment.", updated:"Dernière mise à jour :", },
};

function nextLang(cur){
  const i = LANGS.indexOf(cur);
  return LANGS[(i+1) % LANGS.length];
}

function setLang(l){
  lang = l;
  localStorage.setItem(LANG_KEY, lang);
  const t = i18n[lang] || i18n.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;

  document.title = `siymon | ${t.title}`;
  el("brandSub").textContent = t.title;
  el("policyPill").textContent = t.pill;
  el("policyTitle").textContent = t.title;
  el("goBack").textContent = t.back;
  el("footerText").textContent = t.footer;

  const nxt = nextLang(lang);
  el("langToggle").textContent = nxt.toUpperCase();
}

function applyTheme(theme){
  const btn = el("themeToggle");
  if(theme === "dark"){
    document.documentElement.setAttribute("data-theme", "dark");
    btn.innerHTML = ICONS.sun;
  }else{
    document.documentElement.removeAttribute("data-theme");
    btn.innerHTML = ICONS.moon;
  }
}

function toggleTheme(){
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

async function loadPolicy(){
  el("policyHint").textContent = "";
  try{
    const res = await fetch(`/api/company-policy?lang=${encodeURIComponent(lang)}`);
    const data = await res.json().catch(()=>null);
    if(!data || !data.ok){
      el("policyHint").textContent = "❌";
      return;
    }
    const t = i18n[lang] || i18n.en;
    const text = String(data.text || "").trim();
    el("policyText").textContent = text || t.empty;

    const up = data.updatedAt ? String(data.updatedAt) : "";
    el("policyMeta").textContent = up ? `${t.updated} ${up}` : "";
  }catch(e){
    el("policyHint").textContent = String(e.message || e);
  }
}

el("langToggle").addEventListener("click", async ()=>{
  setLang(nextLang(lang));
  await loadPolicy();
});

el("themeToggle").addEventListener("click", toggleTheme);

(async function init(){
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
  setLang(lang);
  await loadPolicy();
})();
