// ==================== 全局状态 ====================
const STATE = {
  currentStep: 1,
  currentView: 'create',
  members: [],
  currentPlan: null,
  currentDayTab: '周一',
  swapTarget: null,
  swapAlternatives: [],
  memberIdCounter: 0,
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => { initNavigation(); addMember(); });

function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    STATE.currentView = view;
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    if (view === 'history') loadHistory();
  }));
}

function goToStep(stepNum) {
  if (stepNum > STATE.currentStep && STATE.currentStep === 1 && STATE.members.length === 0) {
    showToast('⚠️ 请至少添加一位家庭成员'); return; }
  STATE.currentStep = stepNum;
  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active','completed');
    if(s<stepNum) el.classList.add('completed'); if(s===stepNum) el.classList.add('active');
  });
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`step-${stepNum}`);
  if (el) el.classList.add('active');
  if (stepNum === 3) initDailySettings();
}

// ==================== 成员管理 ====================
const RELATIONS = ['本人','妻子','丈夫','儿子','女儿','父亲','母亲','岳父','岳母','公公','婆婆','舍友','其他'];
const MALE_R = ['丈夫','儿子','父亲','岳父','公公'];
const FEMALE_R = ['妻子','女儿','母亲','岳母','婆婆'];
const AVATARS = {'本人':'👤','妻子':'👩','丈夫':'👨','儿子':'👦','女儿':'👧','父亲':'👴','母亲':'👵','岳父':'👴','岳母':'👵','公公':'👴','婆婆':'👵','舍友':'🧑','其他':'👤'};

function addMember() {
  STATE.members.push({ id:`member_${++STATE.memberIdCounter}`, name:'', gender:'female', height:165, weight:55, relationship:'本人', allergies:'', conditions:'' });
  renderMembers();
}
function removeMember(i) { if(STATE.members.length<=1){showToast('⚠️ 至少保留一位');return;} STATE.members.splice(i,1); renderMembers(); }

function updateMember(i,f,v) {
  if(f==='height'||f==='weight') v=parseFloat(v)||0;
  STATE.members[i][f]=v;
  if(['height','weight'].includes(f)) updateMemberBMI(i);
}
function updateMemberRelationship(i,v){
  STATE.members[i].relationship=v;
  STATE.members[i].gender=MALE_R.includes(v)?'male':FEMALE_R.includes(v)?'female':STATE.members[i].gender;
  renderMembers();
}
function bmiDisplay(h,w){ if(!h||!w)return'';const b=w/((h/100)**2);let c,t;if(b<18.5){c='bmi-underweight';t='偏瘦·建议增肌';}else if(b<24){c='bmi-normal';t='标准体重·保持！';}else if(b<28){c='bmi-overweight';t='超重·建议减重';}else{c='bmi-obese';t='肥胖·建议咨询营养师';}return`BMI <strong class="${c}">${b.toFixed(1)}</strong> <span class="bmini">${t}</span>`;}
function updateMemberBMI(i){const m=STATE.members[i];const el=document.getElementById(`bmi-${m.id}`);if(el)el.innerHTML=bmiDisplay(m.height,m.weight);}

function renderMembers(){
  document.getElementById('memberList').innerHTML = STATE.members.map((m,i)=>`
  <div class="member-card">
    <div class="member-card-header">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="member-num">${i+1}</div><span class="member-avatar" id="avatar-${m.id}">${AVATARS[m.relationship]||'👤'}</span>
        <span id="bmi-${m.id}" style="font-size:12px;">${bmiDisplay(m.height,m.weight)}</span>
      </div>
      <button class="btn-remove-member" onclick="removeMember(${i})">✕</button>
    </div>
    <div class="member-form-row"><div class="form-group"><label>👤 姓名</label><input type="text" value="${esc(m.name)}" placeholder="如：妈妈" onchange="updateMember(${i},'name',this.value)"></div>
    <div class="form-group"><label>🏷️ 身份</label><select onchange="updateMemberRelationship(${i},this.value)">${RELATIONS.map(r=>`<option ${m.relationship===r?'selected':''}>${r}</option>`).join('')}</select></div></div>
    <div class="member-form-row"><div class="form-group"><label>性别</label><select onchange="updateMember(${i},'gender',this.value)"><option value="female" ${m.gender==='female'?'selected':''}>👩 女</option><option value="male" ${m.gender==='male'?'selected':''}>👨 男</option></select></div></div>
    <div class="member-form-row">
      <div class="form-group input-unit"><label>📏 身高</label><input type="number" value="${m.height}" min="50" max="250" onchange="updateMember(${i},'height',this.value)"><span class="unit">cm</span></div>
      <div class="form-group input-unit"><label>⚖️ 体重</label><input type="number" value="${m.weight}" min="10" max="200" step=".1" onchange="updateMember(${i},'weight',this.value)"><span class="unit">kg</span></div>
    </div>
    <div class="member-form-row single"><div class="form-group"><label>🤧 过敏史</label><input type="text" value="${esc(m.allergies)}" placeholder="多个用逗号分隔" onchange="updateMember(${i},'allergies',this.value)"></div></div>
    <div class="member-form-row single"><div class="form-group"><label>💊 基础疾病（肠胃病/三高/痛风等）</label><input type="text" value="${esc(m.conditions)}" placeholder="手动输入" onchange="updateMember(${i},'conditions',this.value)"></div></div>
  </div>`).join('');
}
function esc(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):'';}
function recipeArt(r){
  const text=`${r.name||''} ${Object.keys(r.ingredients||{}).join(' ')}`;
  if(/虾/.test(text))return'🦐';
  if(/鸡胸|鸡腿|鸡肉|鸡翅|鸡汤|滑鸡/.test(text))return'🌿';
  if(/鱼|鳕|鲈|带鱼|鲫/.test(text))return'🐟';
  if(/牛/.test(text))return'🥩';
  if(/排骨|猪|里脊/.test(text))return'🍖';
  if(/蛋/.test(text))return'🥚';
  if(/豆腐|豆浆|豆制品/.test(text))return'🫘';
  if(/汤|羹/.test(text)||r.category==='汤羹')return'🍲';
  if(/米饭|燕麦|面|粥|红薯|小米/.test(text)||r.category==='主食')return'🌾';
  if(/水果|苹果|橙|草莓|猕猴桃|芒果|火龙果|香蕉|蓝莓/.test(text)||r.category==='水果')return'🍎';
  if(/菇/.test(text))return'🍄';
  if(/菜|菠菜|生菜|白菜|冬瓜|丝瓜|萝卜|黄瓜|番茄|胡萝卜/.test(text))return'🥬';
  return r.image_emoji||'🍽️';
}

// ==================== 每日三餐设置（人数+难易度）====================
function memberLabel(m,i){return m.name?.trim()||m.relationship||`成员${i+1}`;}
function mealCountOptions(n){return [...Array(n)].map((_,x)=>`<option value="${x+1}" ${x+1===n?'selected':''}>${x+1}人</option>`).join('');}
function mealPickerId(code,day){return `picker-${code}-${day}`;}
function renderMealMemberPicker(code,day){
  const id=mealPickerId(code,day);
  return `<div class="meal-member-picker" id="${id}" style="display:none;">
    <div class="picker-label">选择用餐人</div>
    <div class="picker-options">
      ${STATE.members.map((m,i)=>`<label class="picker-chip"><input type="checkbox" value="${m.id}" onchange="limitMealMembers('${code}','${day}',this)"> ${esc(memberLabel(m,i))}</label>`).join('')}
    </div>
  </div>`;
}
function updateMealMemberPicker(code,day){
  const n=STATE.members.length||1;
  const count=+(document.getElementById(`count-${code}-${day}`)?.value||n);
  const picker=document.getElementById(mealPickerId(code,day));
  if(!picker)return;
  picker.style.display=count<n?'block':'none';
  const boxes=Array.from(picker.querySelectorAll('input[type="checkbox"]'));
  if(count>=n){
    boxes.forEach(b=>b.checked=true);
    return;
  }
  const checked=boxes.filter(b=>b.checked);
  if(checked.length!==count){
    boxes.forEach((b,i)=>{b.checked=i<count;});
  }
}
function limitMealMembers(code,day,changed){
  const count=+(document.getElementById(`count-${code}-${day}`)?.value||STATE.members.length||1);
  const picker=document.getElementById(mealPickerId(code,day));
  const boxes=Array.from(picker?.querySelectorAll('input[type="checkbox"]')||[]);
  let checked=boxes.filter(b=>b.checked);
  if(!checked.length){
    changed.checked=true;
    checked=[changed];
  }
  if(checked.length>count){
    changed.checked=false;
  }
}
function getMealMemberIds(day,code,count){
  const n=STATE.members.length||1;
  if(count>=n)return STATE.members.map(m=>m.id);
  const picker=document.getElementById(mealPickerId(code,day));
  let ids=Array.from(picker?.querySelectorAll('input:checked')||[]).map(b=>b.value);
  if(ids.length!==count){
    ids=STATE.members.slice(0,count).map(m=>m.id);
  }
  return ids;
}

function initDailySettings(){
  const DAYS=['周一','周二','周三','周四','周五','周六','周日'];
  const DI={'周一':'☀️','周二':'🌤️','周三':'⛅','周四':'🌥️','周五':'🌈','周六':'🎉','周日':'😴'};
  const DC={'周一':'mon','周二':'tue','周三':'wed','周四':'thu','周五':'fri','周六':'sat','周日':'sun'};
  const n=STATE.members.length||1;
  document.getElementById('dailySettings').innerHTML=DAYS.map(d=>`
  <div class="day-setting-card">
    <div class="day-setting-header"><span class="day-dot ${DC[d]}"></span>${DI[d]} ${d}</div>
    <div class="meal-slots">
      <div class="slot-label-row"><span class="slot-label-title">🌅 早餐</span></div>
      <div class="meal-slot-row"><span class="ms-label">用餐人数</span><select id="count-bf-${d}" class="ss-s" onchange="updateMealMemberPicker('bf','${d}')">${mealCountOptions(n)}</select></div>
      ${renderMealMemberPicker('bf',d)}
      <div class="meal-slot-row"><span class="ms-label">烹饪难度</span><select id="diff-bf-${d}" class="ss-s"><option value="易">💚 容易</option><option value="中" selected>💛 中等</option><option value="难">❤️ 较难</option></select></div>

      <div class="slot-label-row"><span class="slot-label-title">☀️ 午餐</span></div>
      <div class="meal-slot-row"><span class="ms-label">用餐人数</span><select id="count-ln-${d}" class="ss-s" onchange="updateMealMemberPicker('ln','${d}')">${mealCountOptions(n)}</select></div>
      ${renderMealMemberPicker('ln',d)}
      <div class="meal-slot-row"><span class="ms-label">烹饪难度</span><select id="diff-ln-${d}" class="ss-s"><option value="易">💚 容易</option><option value="中" selected>💛 中等</option><option value="难">❤️ 较难</option></select></div>

      <div class="slot-label-row"><span class="slot-label-title">🌙 晚餐</span></div>
      <div class="meal-slot-row"><span class="ms-label">用餐人数</span><select id="count-dn-${d}" class="ss-s" onchange="updateMealMemberPicker('dn','${d}')">${mealCountOptions(n)}</select></div>
      ${renderMealMemberPicker('dn',d)}
      <div class="meal-slot-row"><span class="ms-label">烹饪难度</span><select id="diff-dn-${d}" class="ss-s"><option value="易">💚 容易</option><option value="中" selected>💛 中等</option><option value="难">❤️ 较难</option></select></div>
    </div>
  </div>`).join('');
  DAYS.forEach(d=>['bf','ln','dn'].forEach(code=>updateMealMemberPicker(code,d)));
}

// ==================== 收集数据 ====================
function collectData(){
  const members=STATE.members.map(m=>({id:m.id,name:m.name||`成员${STATE.members.indexOf(m)+1}`,gender:m.gender,height:m.height,weight:m.weight,relationship:m.relationship,allergies:m.allergies,conditions:m.conditions}));
  const getChecked=id=>{const el=document.getElementById(id);return el?Array.from(el.querySelectorAll('input:checked')).map(c=>c.value):[]};
  const preferences={taste_pref:getChecked('tastePrefs'),food_likes:getChecked('foodLikes'),food_restrictions:(document.getElementById('foodRestrictions')?.value||'').split(/[,，、]/).map(s=>s.trim()).filter(s=>s),cuisine_pref:getChecked('cuisinePrefs'),cooking_method_pref:getChecked('cookingPrefs')};
  const days=['周一','周二','周三','周四','周五','周六','周日'];
  const n=STATE.members.length||3;
  const daily_settings=days.map(d=>({
    day:d,
    breakfast:{meal_count:+(document.getElementById(`count-bf-${d}`)?.value||n),member_ids:getMealMemberIds(d,'bf',+(document.getElementById(`count-bf-${d}`)?.value||n)),cooking_difficulty:document.getElementById(`diff-bf-${d}`)?.value||'中'},
    lunch:{meal_count:+(document.getElementById(`count-ln-${d}`)?.value||n),member_ids:getMealMemberIds(d,'ln',+(document.getElementById(`count-ln-${d}`)?.value||n)),cooking_difficulty:document.getElementById(`diff-ln-${d}`)?.value||'中'},
    dinner:{meal_count:+(document.getElementById(`count-dn-${d}`)?.value||n),member_ids:getMealMemberIds(d,'dn',+(document.getElementById(`count-dn-${d}`)?.value||n)),cooking_difficulty:document.getElementById(`diff-dn-${d}`)?.value||'中'},
  }));
  return {members,preferences,daily_settings,fridge_ingredients:document.getElementById('fridgeIngredients')?.value||''};
}

// ==================== 生成食谱 ====================
async function generatePlan(){
  if(!STATE.members.length){showToast('⚠️ 先添加成员');goToStep(1);return;}
  showLoading(true);try{
    const r=await fetch('/api/generate-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(collectData())});
    if(!r.ok){const e=await r.json();throw new Error(e.detail||'失败');}
    STATE.currentPlan=await r.json();goToStep(4);renderMealPlan(STATE.currentPlan);showToast('✅ 一周食谱已生成！');
  }catch(e){showToast('❌ '+e.message);}finally{showLoading(false);}
}

// ==================== 渲染食谱 ====================
function renderMealPlan(plan){
  const c=document.getElementById('mealPlanContainer'),DAYS=['周一','周二','周三','周四','周五','周六','周日'],DI={'周一':'☀️','周二':'🌤️','周三':'⛅','周四':'🌥️','周五':'🌈','周六':'🎉','周日':'😴'};
  const nut=plan.nutrition_summary;

  c.innerHTML=`
  <div class="nutrition-summary"><h3>📊 家庭营养需求分析</h3>
    <div class="nutrition-grid">
      <div class="nutrition-item"><div class="nutrition-value">${nut.total_daily_calories}</div><div class="nutrition-label">日需热量 <span class="unit">kcal</span></div></div>
      <div class="nutrition-item"><div class="nutrition-value">${nut.total_macros.protein_g}</div><div class="nutrition-label">蛋白质 <span class="unit">g</span></div></div>
      <div class="nutrition-item"><div class="nutrition-value">${nut.total_macros.fat_g}</div><div class="nutrition-label">脂肪 <span class="unit">g</span></div></div>
      <div class="nutrition-item"><div class="nutrition-value">${nut.total_macros.carb_g}</div><div class="nutrition-label">碳水 <span class="unit">g</span></div></div>
    </div>
    <div class="member-nutrition-list">${nut.individual.map(m=>`<div class="member-nutrition-chip">${m.name}: BMI <span class="bmi ${getBC(m.bmi)}">${m.bmi}</span> | 日需${m.daily_calories}kcal ${m.note!=='使用实际体重计算'?`<span style="color:#f59e0b;font-size:10px;">⚠${m.note}</span>`:''}</div>`).join('')}
  </div>
  <div class="meal-plan-actions">
    <button class="btn-back" onclick="goToStep(3)">← 返回修改</button><button class="btn-back" onclick="goToStep(1)">👨‍👩‍👧‍👦 修改成员</button>
  </div>
  <div class="fridge-bar"><span>🧊</span><input type="text" id="fridgeInput" placeholder="输入冰箱食材，智能替换到当前天餐单..."><button class="btn-fridge" onclick="useFridge()">🔍 利用余材</button></div>
  <div id="fridgeResults"></div>
  <div class="day-tabs">${DAYS.map(d=>{
    const s=plan.days[d]?.setting||{};return`<button class="day-tab ${d===STATE.currentDayTab?'active':''}" onclick="switchDay('${d}')">${DI[d]} ${d}<span class="tab-info">${(s.breakfast?.meal_count||0)+(s.lunch?.meal_count||0)+(s.dinner?.meal_count||0)}人次</span></button>`;
  }).join('')}</div>
  ${DAYS.map((d,dayIdx)=>{
    const dd=plan.days[d];if(!dd)return '';
    const meals=dd.meals;
    return `<div class="day-meal-plan ${d===STATE.currentDayTab?'active':''}" id="day-${d}">
      ${meals.breakfast?.length?renderBlock('🌅早餐',meals.breakfast,dd.setting?.breakfast?.meal_count||0,`d${dayIdx}_bf`):''}
      ${meals.lunch?.length?renderBlock('☀️午餐',meals.lunch,dd.setting?.lunch?.meal_count||0,`d${dayIdx}_ln`):''}
      ${meals.lunch_soup?renderBlock('🍲午餐汤品',[meals.lunch_soup],dd.setting?.lunch?.meal_count||0,`d${dayIdx}_ln_soup`,'soup-block'):''}
      ${meals.dinner?.length?renderBlock('🌙晚餐',meals.dinner,dd.setting?.dinner?.meal_count||0,`d${dayIdx}_dn`):''}
      ${meals.dinner_soup?renderBlock('🍲晚餐汤品',[meals.dinner_soup],dd.setting?.dinner?.meal_count||0,`d${dayIdx}_dn_soup`,'soup-block'):''}
      ${meals.dinner_fruit?renderBlock('🍎晚餐水果',[meals.dinner_fruit],dd.setting?.dinner?.meal_count||0,`d${dayIdx}_dn_fruit`,'fruit-block'):''}
      ${meals.soup?renderBlock('🍲汤品',[meals.soup],dd.setting?.lunch?.meal_count||0,`d${dayIdx}_soup`,'soup-block'):''}
      <div class="shopping-list-panel">
        <button class="btn-shopping" onclick="generateShoppingList('${d}')">📋 生成采购清单</button>
        <div id="shopping-${d}" class="shopping-list-output"></div>
      </div>
    </div>`;
  }).join('')}
  <div class="weekly-quote-card sign-card"><span class="quote-icon">✍️</span><div><div class="quote-kicker">今日手账签</div><span class="quote-text">${plan.weekly_quote}</span></div></div>`;
  c.scrollIntoView({behavior:'smooth'});
}

function renderBlock(title,recipes,count,bid,extraCls=''){
  return `<div class="meal-block ${extraCls}">
    <div class="meal-block-header">${title}<span style="font-size:12px;color:var(--gray-400);margin-left:6px;">${count}人份</span></div>
    <div class="recipe-cards-grid">${recipes.map((r,i)=>{
      const rid=`rc__${bid.replace(/\W/g,'_')}__${i}`;
      return `<div class="recipe-card" id="${rid}">
        <div class="recipe-card-header" onclick="toggleRecipe('${rid}')">
          <div class="recipe-card-title">
            <span class="recipe-art" aria-hidden="true">${recipeArt(r)}</span>
            <span class="recipe-name">${r.name}</span>
          </div>
          <div class="recipe-card-actions">
            <button class="btn-swap" onclick="event.stopPropagation();openSwapModal('${rid}','${r.name}')">🔄 换一个</button>
            <span class="recipe-expand-icon">▼</span>
          </div>
        </div>
        <div class="recipe-card-body">
          <div class="recipe-section"><h4>🥬 食材</h4><div class="recipe-ingredients">${Object.entries(r.ingredients||{}).map(([ing,q])=>`<span class="ingredient-chip">${ing} ${q}g</span>`).join('')}</div></div>
          <div class="recipe-section"><h4>👨‍🍳 做法</h4><ol class="recipe-steps">${(r.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol></div>
          <div class="recipe-section"><h4>🌟 养生</h4><div class="health-benefit">${r.health_benefit||'营养均衡。'}</div></div>
          <div class="recipe-meta"><span>⏱️约${r.cooking_time||15}分钟</span><span>🏷️${(r.tags||[]).join('·')}</span><span>🍳${r.cooking_method}|${r.cuisine}</span></div>
        </div>
      </div>`;
    }).join('')}</div></div>`;
}

function toggleRecipe(id){const c=document.getElementById(id);if(c)c.classList.toggle('expanded');}

function switchDay(d){
  STATE.currentDayTab=d;
  document.querySelectorAll('.day-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.day-tab').forEach(t=>{if(t.textContent.includes(d))t.classList.add('active');});
  document.querySelectorAll('.day-meal-plan').forEach(e=>e.classList.remove('active'));
  const el=document.getElementById(`day-${d}`);if(el)el.classList.add('active');
}

function normalizeIngredient(name,qty){
  if(name==='熟米饭')return {name:'大米', qty:(parseFloat(qty)||0)*0.42};
  return {name, qty:parseFloat(qty)||0};
}
function shoppingCategory(name){
  if(name==='洋葱')return'蔬菜水果';
  if(name==='虾皮')return'佐料';
  if(/鸡|鸭|猪|牛|羊|排骨|肉|里脊|腩|虾|鱼|鳕|鲈|带鱼|鲫|蛤蜊|鱿鱼|海参|蛋/.test(name))return'肉蛋水产';
  if(/米|燕麦|小米|面|面粉|粉丝|红薯|紫薯|土豆|玉米|藜麦|糙米|荞麦/.test(name))return'主食杂粮';
  if(/豆腐|腐竹|豆浆|牛奶|酸奶/.test(name))return'豆奶制品';
  if(/盐|糖|食用油|橄榄油|芝麻油|白醋|陈醋|生抽|老抽|料酒|蚝油|豉油|豆瓣酱|番茄酱|淀粉|胡椒|八角|桂皮|香叶|花椒|蜂蜜|葱|姜|蒜|枸杞|虾皮|豆豉/.test(name))return'佐料';
  if(/鸡|鸭|猪|牛|羊|排骨|肉|里脊|腩|虾|鱼|鳕|鲈|带鱼|鲫|蛤蜊|鱿鱼|海参|蛋/.test(name))return'肉蛋水产';
  return'蔬菜水果';
}
function collectDayRecipes(day){
  const meals=STATE.currentPlan?.days?.[day]?.meals||{};
  return [
    ...(meals.breakfast||[]),
    ...(meals.lunch||[]),
    meals.lunch_soup,
    ...(meals.dinner||[]),
    meals.dinner_soup,
    meals.dinner_fruit,
    meals.soup
  ].filter(Boolean);
}
function generateShoppingList(day){
  const recipes=collectDayRecipes(day);
  const grouped={'蔬菜水果':{},'肉蛋水产':{},'主食杂粮':{},'豆奶制品':{},'佐料':{}};
  recipes.forEach(r=>{
    Object.entries(r.ingredients||{}).forEach(([raw,qty])=>{
      const normalized=normalizeIngredient(raw,qty);
      const name=normalized.name;
      const cat=shoppingCategory(name);
      const n=normalized.qty;
      grouped[cat][name]=(grouped[cat][name]||0)+n;
    });
  });
  const order=['蔬菜水果','肉蛋水产','主食杂粮','豆奶制品','佐料'];
  const html=order.map(cat=>{
    const items=Object.entries(grouped[cat]);
    if(!items.length)return'';
    return `<div class="shopping-category"><h4>${cat}</h4><div class="shopping-items">${items.map(([name,qty])=>`<span>${name}${qty?` ${Math.round(qty)}g`:''}</span>`).join('')}</div></div>`;
  }).join('');
  const el=document.getElementById(`shopping-${day}`);
  if(el)el.innerHTML=html||'<p class="empty-shopping">今天没有可汇总的食材。</p>';
}

// ==================== 换菜弹窗（2-3选1）====================
async function openSwapModal(recipeId, recipeName){
  STATE.swapTarget={recipeId,recipeName};
  document.getElementById('swapOrigName').textContent=`为「${recipeName}」选择替换菜品：`;
  const container=document.getElementById('swapAlternatives');
  container.innerHTML='<p style="text-align:center;padding:20px;color:#9a9;">⏳ 获取可换菜...</p>';
  document.getElementById('swapModal').classList.add('active');
  try{
    const d=await fetch('/api/swap-recipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipe_name:recipeName})});
    const data=await d.json();const alts=(data.alternatives||[]).slice(0,3);
    STATE.swapAlternatives=alts;
    container.innerHTML=!alts.length?'<p style="text-align:center;color:#9a9;">暂无更多同类菜</p>':
      alts.map((a,i)=>`<div class="swap-alt-item" onclick="confirmSwap(${i})"><span><span class="swap-alt-name">${a.image_emoji||'🍽️'} ${a.name}</span><div class="swap-alt-meta">${a.cuisine||''} · ${a.cooking_method||''} ⏱${a.cooking_time||0}分</div></span><span class="swap-pick-btn">选这个 →</span></div>`).join('');
  }catch(e){container.innerHTML='<p style="color:#e74c3c;text-align:center;">获取失败</p>';}
}

function confirmSwap(altIndex){
  if(!STATE.swapTarget)return;
  const {recipeId}=STATE.swapTarget;
  const found=STATE.swapAlternatives[altIndex];
  if(!found){showToast('❌ 替换失败');return;}
  const newName=found.name;
  closeSwapModal();
  const card=document.getElementById(recipeId);if(!card)return;
  replaceCard(card,found);showToast(`✨ 已换成「${newName}」`);
}

function replaceCard(card,r){
  const nameEl=card.querySelector('.recipe-name');if(nameEl)nameEl.textContent=r.name;
  const emojiEl=card.querySelector('.recipe-emoji');if(emojiEl)emojiEl.textContent=r.image_emoji||'🍽️';
  const thumbImg=card.querySelector('.recipe-thumb-img');if(thumbImg)thumbImg.src=`https://source.unsplash.com/88x88/?${encodeURIComponent(r.name)},food,chinese,dish`;
  // 重设按钮
  const rid=card.id;const actions=card.querySelector('.recipe-card-actions');
  if(actions)actions.innerHTML=`<button class="btn-swap" onclick="event.stopPropagation();openSwapModal('${rid}','${r.name}')">🔄 换一个</button><span class="recipe-expand-icon">▼</span>`;
  const body=card.querySelector('.recipe-card-body');
  if(body){
    body.querySelector('.recipe-ingredients').innerHTML=Object.entries(r.ingredients||{}).map(([ing,q])=>`<span class="ingredient-chip">${ing} ${q}g</span>`).join('');
    body.querySelector('.recipe-steps').innerHTML=(r.steps||[]).map(s=>`<li>${s}</li>`).join('');
    const hb=body.querySelector('.health-benefit');if(hb)hb.textContent=r.health_benefit||'营养均衡。';
    body.querySelector('.recipe-meta').innerHTML=`<span>⏱️约${r.cooking_time||15}分钟</span><span>🏷️${(r.tags||[]).join('·')}</span><span>🍳${r.cooking_method||''}|${r.cuisine||''}</span>`;
  }
}
function closeSwapModal(){document.getElementById('swapModal').classList.remove('active');STATE.swapTarget=null;STATE.swapAlternatives=[];}

// ==================== 冰箱余材 → 直接替换到当天餐单 ====================
async function useFridge(){
  const inp=document.getElementById('fridgeInput');if(!inp?.value.trim()){showToast('⚠️ 输入冰箱食材');return;}
  const container=document.getElementById('fridgeResults');
  container.innerHTML='<p style="text-align:center;padding:16px;color:#9a9;">⏳ 匹配中...</p>';
  try{
    const r=await fetch('/api/regenerate-with-fridge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ingredients:inp.value.trim(),day:STATE.currentDayTab})});
    const results=await r.json();
    if(!results.length){container.innerHTML='<p style="color:#9a9;text-align:center;">未匹配到菜品，换个食材试试～</p>';return;}

    container.innerHTML=`<p style="font-size:12px;color:#15803d;margin-bottom:8px;padding:4px 12px;background:#ecfdf5;border-radius:8px;display:inline-block;">
      🔍 匹配到 ${results.length} 道菜，点击即可替换到「${STATE.currentDayTab}」餐单
    </p>`+
    results.map(item=>`<div class="fridge-result-item" onclick="applyFridgeRecipe('${esc(item.name)}')">
      <span class="fr-emoji">${item.image_emoji||'🍽️'}</span><div><strong>${item.name}</strong><div class="fr-sub">${(item._matched_ingredients||[]).join('、')}可用</div></div>
      <span class="fr-match">${item._match_ratio}%</span>
    </div>`).join('');

    showToast(`✅ 找到${results.length}道菜，点一下就能替换进${STATE.currentDayTab}餐单`);
  }catch(e){container.innerHTML='<p style="color:#e74c3c;text-align:center;">查询失败</p>';}
}

function applyFridgeRecipe(name){
  // 在当前天的所有菜品中找一道来替换
  const dayData=STATE.currentPlan?.days[STATE.currentDayTab];
  if(!dayData){showToast('❌ 当前无餐单数据');return;}
  const allDishes=[];
  (dayData.meals.breakfast||[]).forEach(r=>allDishes.push({name:r.name,type:'breakfast'}));
  (dayData.meals.lunch||[]).forEach(r=>allDishes.push({name:r.name,type:'lunch'}));
  (dayData.meals.dinner||[]).forEach(r=>allDishes.push({name:r.name,type:'dinner'}));

  if(!allDishes.length){showToast('❌ 无可替换的菜');return;}
  // 随机选一道非主食类来替换
  const nonStaple=allDishes.filter(d=>!['米饭','熟米饭','蒸红薯','南瓜小米粥','鸡蛋羹'].includes(d.name));
  const target=nonStaple.length?nonStaple[Math.floor(Math.random()*nonStaple.length)]:allDishes[Math.floor(Math.random()*allDishes.length)];

  showToast(`🔄 正在把「${target.name}」换成「${name}」...`);
  fetch('/api/swap-recipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipe_name:target.name})})
    .then(resp=>resp.json())
    .then(data=>{
      const alts=data.alternatives||[];
      // 如果新菜在备选中就用它，否则用原逻辑
      const found=alts.find(a=>a.name===name);
      const recipeToUse=found||data.alternatives[0];
      if(!recipeToUse){showToast('❌ 替换失败');return;}

      // 找到对应的卡片DOM
      const cards=document.querySelectorAll(`#day-${STATE.currentDayTab} .recipe-card`);
      let targetCard=null;
      cards.forEach(card=>{
        if(card.querySelector('.recipe-name')?.textContent===target.name)targetCard=card;
      });
      if(targetCard)replaceCard(targetCard,recipeToUse);
      else showToast(`✨ 推荐制作「${recipeToUse.name}」（手动加入）`);
    })
    .catch(()=>showToast('❌ 替换失败'));
}

// ==================== 历史 ====================
async function loadHistory(){
  const c=document.getElementById('historyList');
  try{
    const h=(await(await fetch('/api/history')).json());
    c.innerHTML=h.length?h.map(x=>`<div class="history-card" onclick="loadHistoryDetail('${x.id}')"><div class="history-card-date">📅 ${new Date(x.generated_at).toLocaleString('zh-CN')}</div><div class="history-card-cal">🔥${x.nutrition_summary||'—'}kcal</div><div class="history-card-quote">${x.weekly_quote||''}</div></div>`).join('')
    :'<div class="empty-state"style="grid-column:1/-1;"><div class="empty-icon">📭</div><p>还没有历史餐单</p></div>';
  }catch(e){c.innerHTML='<div class="empty-state"><p>加载失败</p></div>';}
}
async function loadHistoryDetail(id){
  showLoading(true);
  try{
    const p=await(await fetch(`/api/history/${id}`)).json();
    STATE.currentPlan=p;document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.querySelector('.nav-btn[data-view="create"]').classList.add('active');
    document.querySelectorAll('.view-container').forEach(v=>v.classList.remove('active'));document.getElementById('view-create').classList.add('active');
    goToStep(4);renderMealPlan(p);showToast('📖 已加载');
  }catch(e){showToast('❌ 加载失败');}finally{showLoading(false);}
}

// ==================== 工具函数 ====================
function showLoading(s){document.getElementById('loadingOverlay').classList.toggle('active',s);}
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);}
function getBC(b){return b<18.5?'bmi-underweight':b<24?'bmi-normal':b<28?'bmi-overweight':'bmi-obese';}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))closeSwapModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSwapModal();});
