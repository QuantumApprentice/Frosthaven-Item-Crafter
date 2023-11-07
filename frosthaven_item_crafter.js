"use strict";
///home/quantum/.wine/drive_c/Program Files/Blackmagic Design/DaVinci Resolve

//done// frosthaven supplies, 
//done// owned items listing, 
//done// saving the different player's resources to the URL so the entire state can be saved/reloaded, 
//done// including player names
//done// unlocked items not universal yet
//done// need to parse out the "," commas for the url
// buttons on top of the items to add them to the owned/unlocked list, 

addEventListener("hashchange", () => {
  parse_hash(window.location.hash);
  refresh_owned_items_list();
  parse_input();
});

let players = [];
let selected_player = 1;
let g_stats = {};
let global_hash = "";
let dev_tools = false;

g_stats.gold           = 0;

g_stats.wood           = 0;
g_stats.metal          = 0;
g_stats.hide           = 0;

g_stats.arrowvine      = 0;
g_stats.axenut         = 0;
g_stats.corpsecap      = 0;
g_stats.flamefruit     = 0;
g_stats.rockroot       = 0;
g_stats.snowthistle    = 0;

g_stats.owned_items    = [];

let unlocked_ranges = [];
let slot_type      = "";
let selectedFilter = "";
let item_data;

const EMPTY_RESOURCES = {
  w: 0, m: 0, h: 0,
  v: 0, n: 0, c: 0,
  f: 0, r: 0, s: 0,
  g: 0,
};

const SLOT_BY_CODE = {
  h: {alt: 'Head',          src: 's-head.png'},
  b: {alt: 'Body',          src: 's-body.png'},
  d: {alt: 'Dual-Handed',   src: 's-dual-hand.png'},
  s: {alt: 'Single-Handed', src: 's-single-hand.png'},
  l: {alt: 'Legs',          src: 's-legs.png'},
  i: {alt: 'Small Item',    src: 's-item.png'},
};

window.addEventListener('load', load);
async function load()
{
  if (item_data) { return item_data; }
  let item_data_json = await fetch("./assets/item-data.json");
  item_data = await item_data_json.json();

  let card_container = document.getElementById("card_display");
  let html_parts = [];
  for (const item of item_data.items) {
    parse_cost(item);
    html_parts.push(create_item_card_div_html(item));
  }
  card_container.innerHTML = html_parts.join('');
  for (const item of item_data.items) {
    item.el = document.getElementById(`item${item.number}`);
  }
  // console.log(item_data);

  if (location.hash) {
    let hash = location.hash;
    // console.log("test?");
    parse_hash(hash);
  }

  if (unlocked_ranges.length == 0) {
    // show all items by default if nothing is unlocked
    document.getElementById('locked_input').value = 'all';
  }
  g_stats.owned_items = players[selected_player]?.owned_items || [];
  refresh_owned_items_list();
  parse_input();
}



function parse_hash(hash)
{
  if (hash == global_hash) { return; }
  global_hash = hash;
  players = [];
  unlocked_ranges = [];
  dev_tools = false;

  let str_arr = hash.substring(1).split(";");

  for (const el of str_arr) {
    let [key, val] = el.split("=");
    // console.log("key:val", key, val);

    if (key == "dev") {
      dev_tools = true;
      let el = document.getElementById('devtools_style');
      if (el) el.parentNode.removeChild(el);
    }

    if (key == "ul") {
      // console.log(key, val);
      unlocked_ranges = parse_ranges(val);
    }

    if (key == "fs") {
      if (!players[0]) {
        players[0] = {};
      }

      string_to_resources(players[0], val, true);
    }


    if (key.startsWith("p")) {
      let indx = parseInt(key.slice(1), 10);
      let [name, res_str, owned] = val.split(":");
      // console.log("indx nro", decodeURIComponent(name), res_str, owned);

      if (!players[indx]) {
        players[indx] = {};
      }

      name = decodeURIComponent(name).trim();
      if (name) document.getElementById(key).innerText = name;

      string_to_resources(players[indx], res_str || "");

      let owned_items = (owned || "").split(',').map(s => parseInt(s, 10) || 0);
      // we probably don't need to deal with the URL hash containing unexpected
      // things but here we remove duplicates and non-numbers from the string anyway
      owned_items.sort((a, b) => a - b);
      for (let i = 1; i < owned_items.length; ++i) {
        if (owned_items[i] === owned_items[i-1]) {
          owned_items.splice(i, 1);
          --i;
        }
      }
      if (owned_items[0] === 0) owned_items.splice(0, 1);

      players[indx].owned_items = owned_items;
    }

  }
  for (let item of item_data.items) {
    item.el.classList.toggle('locked', is_locked(item.number));
  }
  show_player_stats(selected_player);
}

function string_to_resources(player, str, fh_supplies = false)
{
  let resource_string_parts = str.split(",");
  let idx = 0;
  if (!fh_supplies) {
    player.gold      = resource_string_parts[idx++] || "";
  }
  player.wood        = resource_string_parts[idx++] || "";
  player.metal       = resource_string_parts[idx++] || "";
  player.hide        = resource_string_parts[idx++] || "";
  player.arrowvine   = resource_string_parts[idx++] || "";
  player.axenut      = resource_string_parts[idx++] || "";
  player.corpsecap   = resource_string_parts[idx++] || "";
  player.flamefruit  = resource_string_parts[idx++] || "";
  player.rockroot    = resource_string_parts[idx++] || "";
  player.snowthistle = resource_string_parts[idx++] || "";
}

function resources_to_string(player, skipGold = false)
{
  let resource_string_parts = [];

  if (!skipGold) {
    resource_string_parts.push(player.gold      || "");
  }

  resource_string_parts.push(player.wood        || "");
  resource_string_parts.push(player.metal       || "");
  resource_string_parts.push(player.hide        || "");
  resource_string_parts.push(player.arrowvine   || "");
  resource_string_parts.push(player.axenut      || "");
  resource_string_parts.push(player.corpsecap   || "");
  resource_string_parts.push(player.flamefruit  || "");
  resource_string_parts.push(player.rockroot    || "");
  resource_string_parts.push(player.snowthistle || "");

  let last_non_empty_index = resource_string_parts.findLastIndex(s=>s);
  resource_string_parts = resource_string_parts.slice(0, last_non_empty_index + 1);

  let out = resource_string_parts.join(",");
  return out;

}

function update_hash()
{
  let parts = ["#"];

  if (players[0]) {
    let fs = resources_to_string(players[0], true);
    if (fs) parts.push("fs=", fs, ";");
  }

  /* create link from players variable instead of form */
  for (let i = 1; i <= 4; i++) {

    if (!players[i]) { continue; }

    let name = document.getElementById(`p${i}`).innerText;
    if (name == `Player ${i}`) name = "";
    let resources = resources_to_string(players[i]);
    let owned = (players[i].owned_items || []).join(',');
    if (name || resources || owned) {
      // we could try to remove trailing : here but it's very unlikely for a
      // player to have no owned items or resources so the benefit is minimal
      parts.push("p", i, "=",
        encodeURIComponent(name),
        ":", resources,
        ":", owned,
        ";");
    }
  }

  if (unlocked_ranges.length > 0) {
    parts.push("ul=");
    let first = true;
    for (let [min, max] of unlocked_ranges) {
      if (!first) parts.push(",");
      else first = false;
      parts.push(min);
      if (max != min) parts.push("-", max);
    }
    parts.push(";");
  }

  if (dev_tools) {
    parts.push('dev', ';');
  }

  // we don't want to remove the # if it's the only item in parts as the entire
  // page will reload if the string we pass to window.location.replace is empty
  if (parts.length > 1) parts = parts.slice(0, -1);
  global_hash = parts.join('');
  if (global_hash == '#' && !window.location.hash) {
    global_hash = '';
  } else {
    window.location.replace(global_hash);
  }
}

function parse_ranges(input)
{
  let ranges = [];
  let card_range_array = input.split(',');

  for (let card_range of card_range_array) {
    let [min, max] = card_range.split("-");
    min = parseInt(min, 10);
    max = parseInt(max, 10) || min;
    ranges.push([min, max]);
  }
  return ranges;
}

function parse_input()
{
  slot_type           = document.getElementById("slot_filter" ).value;
  selectedFilter      = document.getElementById("locked_input").value;

  g_stats.gold        = document.getElementById("gold"       ).valueAsNumber || 0;

  g_stats.wood        = document.getElementById("wood"       ).valueAsNumber || 0;
  g_stats.metal       = document.getElementById("metal"      ).valueAsNumber || 0;
  g_stats.hide        = document.getElementById("hide"       ).valueAsNumber || 0;

  g_stats.arrowvine   = document.getElementById("arrowvine"  ).valueAsNumber || 0;
  g_stats.axenut      = document.getElementById("axenut"     ).valueAsNumber || 0;
  g_stats.corpsecap   = document.getElementById("corpsecap"  ).valueAsNumber || 0;
  g_stats.flamefruit  = document.getElementById("flamefruit" ).valueAsNumber || 0;
  g_stats.rockroot    = document.getElementById("rockroot"   ).valueAsNumber || 0;
  g_stats.snowthistle = document.getElementById("snowthistle").valueAsNumber || 0;

  assign_player_stats(selected_player);

  for (let item of item_data.items) {
    let visible = filter_func(item);
    item.el.classList.toggle('hide', !visible);
  }

  update_hash();
}

document.querySelector("form").addEventListener("submit",
  submitEvent => {
    submitEvent.preventDefault();
    parse_input();
});


for (const input_el of document.querySelectorAll("input")) {
  input_el.addEventListener("input", parse_input);
}

function reset_crafting()
{
  for (const i of document.querySelectorAll("input[type=number]")) {
    i.value = "";
  }
  g_stats.owned_items = [];
  parse_input();
}

function has_at_least_herbs(amt, min)
{
  let herbs = [];
  if (amt <= g_stats.arrowvine  ) { herbs.push('v');
    if (herbs.length >= min) {return herbs;}
  }
  if (amt <= g_stats.axenut     ) { herbs.push('n');
    if (herbs.length >= min) {return herbs;}
  }
  if (amt <= g_stats.corpsecap  ) { herbs.push('c');
    if (herbs.length >= min) {return herbs;}
  }
  if (amt <= g_stats.flamefruit ) { herbs.push('f');
    if (herbs.length >= min) {return herbs;}
  }
  if (amt <= g_stats.rockroot   ) { herbs.push('r');
    if (herbs.length >= min) {return herbs;}
  }
  if (amt <= g_stats.snowthistle) { herbs.push('s');
    if (herbs.length >= min) {return herbs;}
  }

  return null;
}

// So at the start of the function, 
// I'd build up an array of 
// "items that require crafting" 
// - it would start with the item passed in, 
// and then I would build it up until it has 
// every non-owned dependant item in it. 
// Then I'd get the total of each resource required 
// for all of the items in that array and check 
// the user has enough for the total. 
// The only items that would then still be left
// would be the ones with special requirements 
// (i.e. 98 and 119) which the current handling 
// would work fine for

function init_player_0()
{
  players[0] = {};
  players[0].wood        = "";
  players[0].metal       = "";
  players[0].hide        = "";
  players[0].arrowvine   = "";
  players[0].axenut      = "";
  players[0].corpsecap   = "";
  players[0].flamefruit  = "";
  players[0].rockroot    = "";
  players[0].snowthistle = "";
  players[0].gold        = "";
}

function is_locked(item_number)
{
  for (let [min, max] of unlocked_ranges) {
    if (item_number < min) return true;
    if (item_number <= max) return false;
  }
  return true;
}

function is_owned(item_number)
{
  return g_stats.owned_items.includes(item_number);
}

function calculate_crafting_cost(el)
{
  if (is_owned(el.number)) {
    return null;
  }

  if (el.number >= 248 && el.number <= 264) {
    return null;
  }

  let items_required = [];
  let items_to_craft = [el];
  let regular_items_to_craft = new Set();
  let special_items_to_craft = new Set();
  // this assumes each item is only ever in a crafting chain once
  while (items_to_craft.length > 0) {
    let item = items_to_craft.shift();
    if (selectedFilter != "all_craft" && is_locked(item.number)) {
      return null;
    }

    if (item.resources["-"]) {
      special_items_to_craft.add(item);
    }
    else {
      regular_items_to_craft.add(item);
      for (let item_num of item.resources.i) {
        if (is_owned(item_num)) {
          items_required.push(item_num);
        } else {
          items_to_craft.push(item_data.items[item_num-1]);
        }
      }
    }
  }

  let total = Object.assign({}, EMPTY_RESOURCES);

  let current_stats = {...g_stats};

  for (let item of regular_items_to_craft) {
    total.w += item.resources.w;
    total.m += item.resources.m;
    total.h += item.resources.h;

    total.v += item.resources.v;
    total.n += item.resources.n;
    total.c += item.resources.c;
    total.f += item.resources.f;
    total.r += item.resources.r;
    total.s += item.resources.s;

    total.g += item.resources.g;
  }

  g_stats.wood        -= total.w;
  g_stats.metal       -= total.m;
  g_stats.hide        -= total.h;

  g_stats.arrowvine   -= total.v;
  g_stats.axenut      -= total.n;
  g_stats.corpsecap   -= total.c;
  g_stats.flamefruit  -= total.f;
  g_stats.rockroot    -= total.r;
  g_stats.snowthistle -= total.s;

  g_stats.gold        -= total.g;

  if (selected_player != 0) {
    if (!players[0]) {
      init_player_0();
    }
    g_stats.arrowvine   += parseInt(players[0].arrowvine,   10) || 0;
    g_stats.axenut      += parseInt(players[0].axenut,      10) || 0;
    g_stats.corpsecap   += parseInt(players[0].corpsecap,   10) || 0;
    g_stats.flamefruit  += parseInt(players[0].flamefruit,  10) || 0;
    g_stats.rockroot    += parseInt(players[0].rockroot,    10) || 0;
    g_stats.snowthistle += parseInt(players[0].snowthistle, 10) || 0;
  }

  try {
    if (
           g_stats.wood        < 0
        || g_stats.metal       < 0
        || g_stats.hide        < 0

        || g_stats.arrowvine   < 0
        || g_stats.axenut      < 0
        || g_stats.corpsecap   < 0
        || g_stats.flamefruit  < 0
        || g_stats.rockroot    < 0
        || g_stats.snowthistle < 0

        || g_stats.gold        < 0
    ) {
      return null;
    }

    let has_item_98   = special_items_to_craft.delete(item_data.items[97]);
    let has_item_119  = special_items_to_craft.delete(item_data.items[118]);

    if (special_items_to_craft.size > 0) {
      console.warn("Unhandled special items", special_items_to_craft);
      return null;
    }

    // this code seems messier than it should be - there's
    // probably a simpler way to handle these potions
    if (has_item_98 && has_item_119) {
      // this is never the case but for completeness we handle it anyway
      let h1, h2;
      if (h1 = has_at_least_herbs(5, 1)) {
        total[h1[0]] += 5;
      } else if ((h1 = has_at_least_herbs(4, 1))
              && (h2 = has_at_least_herbs(1, 2))) {
        total[h1[0]] += 4;
        for (let r of h2) if (!h1.includes(r)) total[r] += 1;
      } else if ((h1 = has_at_least_herbs(3, 1))
              && (h2 = has_at_least_herbs(2, 2))) {
        total[h1[0]] += 3;
        for (let r of h2) if (!h1.includes(r)) total[r] += 2;
      } else if ((h1 = has_at_least_herbs(2, 2))
              && (h2 = has_at_least_herbs(1, 3))) {
        for (let r of h1) total[r] += 2;
        for (let r of h2) if (!h1.includes(r)) total[r] += 1;
      } else {
        return null;
      }
    } else if (has_item_98) {
      let h1;
      if (h1 = has_at_least_herbs(2, 1)) {
        total[h1[0]] += 2;
      } else {
        return null;
      }
    } else if (has_item_119) {
      let h1, h2;
      if (h1 = has_at_least_herbs(3, 1)) {
        total[h1[0]] += 3;
      } else if ((h1 = has_at_least_herbs(2, 1))
              && (h2 = has_at_least_herbs(1, 2))) {
        total[h1[0]] += 2;
        for (let r of h2) if (!h1.includes(r)) total[r] += 1;
      } else {
        return null;
      }
    }
  } finally {
    g_stats = current_stats;
  }
  return {
    items_required,
    ...total,
  };
}

function parse_cost(item)
{
  let cost_array = item.cost.split(",");
  item.resources = Object.assign({}, EMPTY_RESOURCES);
  item.resources.i = [];

  for (const el of cost_array) {
    let resource = el.substring(0,1);
    let amount = parseInt(el.substring(1), 10) || 1;

    if (resource == "i") {
      item.resources.i.push(amount);
    }
    else {
      item.resources[resource] = amount;
    }
  }
}

function filter_func(el, indx, arr)
{
  //slot filter to isolate body parts
  if (slot_type && el.slot !== slot_type) {
    return false;
  }

  //unlocked items/owned items/craftable items filter
  //interesting logic crossing here
  if (selectedFilter == "unlock" || selectedFilter == "unlock_craft")
    if (is_locked(el.number)) {
    return false;
  }
  if (selectedFilter == "all_craft" || selectedFilter == "unlock_craft") {
    if (!calculate_crafting_cost(el)) {
      return false;
    }
  }
  if (selectedFilter == "owned") {
    if (!is_owned(el.number)) {
      return false;
    }
  }

  return true;
}

function create_item_card_div_html(item)
{
  // we used to return the div here but returning the HTML
  // reduced loading time in non-scientific tests by 15-25%
  let html = `<div id="item${item.number}" data-item-number="${item.number}" class="card_div locked">
    <img loading="lazy" class="card_front" src="./assets/item-images/${item.file}">
    ${item.usage == 'f' ? `<img onclick="onItemCardClick(this)" loading="lazy" class="card_back hide_when_locked" src="./assets/item-images/${item.file_back}">` : ''}
    <div class="card_overlay">
      <div class="card_name">
        <span class="card_number">${item.number}</span>
        <span class="hide_when_locked">${item.name}</span>
        <span class="hide_when_unlocked">Locked Item</span>
      </div>
      <button class="hide_when_locked dev_tools" onClick="toggle_item_lock(this)">Lock</button>
      <button class="hide_when_unlocked" onClick="toggle_item_lock(this)">Unlock</button>
      <button class="hide_when_locked hide_when_owned" onClick="gain_item(this)">Gain</button>
      ${item.usage == 'f' ? `<button class="hide_when_locked" onclick="onItemCardClick(this)">Flip</button>` : ''}
    </div>
  </div>`;
  return html;
}

function gain_item(el)
{
  let div = el.closest(".card_div");
  let num = parseInt(div.dataset.itemNumber, 10);
  g_stats.owned_items.push(num);
  g_stats.owned_items.sort((a, b) => a - b);
  for (let i = 1; i < g_stats.owned_items.length; ++i) {
    if (g_stats.owned_items[i] === g_stats.owned_items[i - 1]) {
      g_stats.owned_items.splice(i, 1);
      --i;
    }
  }
  refresh_owned_items_list();
  parse_input();
}

function lose_item(item_number)
{
  let idx = g_stats.owned_items.indexOf(item_number);
  if (idx >= 0) g_stats.owned_items.splice(idx, 1);
  refresh_owned_items_list();
  parse_input();
}

function toggle_item_lock(el)
{
  let div = el.closest(".card_div");
  let num = parseInt(div.dataset.itemNumber, 10);
  let locked = div.classList.toggle("locked");

  // we could try to be clever here and just alter the few entries in
  // unlocked_ranges that would need to be changed but it's more
  // straightforward to just build up an array of all the numbers
  // then sort and compress the list
  let unlocked_items = [];
  for (let [min, max] of unlocked_ranges) {
    for (let i = min; i <= max; ++i) {
      unlocked_items.push(i);
    }
  }
  unlocked_ranges = [];
  if (locked) {
    let idx = unlocked_items.indexOf(num);
    unlocked_items.splice(idx, 1);
  } else {
    unlocked_items.push(num);
    unlocked_items.sort((a, b) => a - b);
  }
  if (unlocked_items.length == 0) {
    update_hash();
    return;
  }
  let range = [unlocked_items[0], unlocked_items[0]];
  for (let i = 1; i < unlocked_items.length; ++i) {
    let num = unlocked_items[i];
    if (num == range[1] + 1) {
      range[1] = num;
    } else {
      unlocked_ranges.push(range);
      range = [num, num];
    }
  }
  unlocked_ranges.push(range);
  update_hash();
}

function onItemCardClick(el)
{
  let div = el.closest(".card_div");
  let backImg = div.querySelector('.card_back');
  if (!backImg) return;
  let frontImg = div.querySelector('.card_front');
  let tmp = backImg.src;
  backImg.src = frontImg.src;
  frontImg.src = tmp;
}

function create_link()
{
  let link = window.location.href;
  navigator.clipboard.writeText(link);
}

function change_name(el)
{
  let new_name = window.prompt("Enter player name.", el.textContent.trim())?.trim();
  if (!new_name) {
    return;
  }
  // el.firstElementChild.innerHTML = new_name.trim();
  el.innerText = new_name;
  // el.replaceChild(document.createTextNode(new_name.trim()), el.firstChild);
  update_hash();
}

function assign_player_stats(num)
{
  players[num] = {};

  const form = document.getElementById("form");
  for (const el of new FormData(form)) {
    let [key, val] = el;
    // console.log("1key:val =>", key, ":", val);

    if (val == "0") { val = ""; }
    players[num][key] = val;
  }
  players[num].owned_items = g_stats.owned_items;
}

function update_highlight(current_button)
{
  //toggle way of doing this
  for (const button of current_button.parentElement.querySelectorAll('button')) {
    button.classList.toggle("highlight", button === current_button);
  }
}

function swap_player_stats(num)
{
  assign_player_stats(selected_player);
  show_player_stats(num);
  parse_input();
}

function show_player_stats(num)
{
  selected_player = num;

  if (!players[num]) {
    players[num] = {};
    reset_crafting();
  }

  const form = document.getElementById("form");
  for (const el of Object.entries(players[num])) {
    let [key, val] = el;
    // console.log("2key:val= ", key, ":", val);
    if (form.elements[key]) form.elements[key].value = val;
  }
  g_stats.owned_items = players[num].owned_items || [];
  refresh_owned_items_list();
}

function sidebar_toggle()
{
  document.getElementById('sidebar').classList.toggle('expanded');
}

function refresh_owned_items_list()
{
  let div = document.getElementById('owned_items_container');
  let parts = [];
  let idx = 0;
  for (let item of item_data.items) {
    let owned = item.number === g_stats.owned_items[idx];
    item.el.classList.toggle("owned", owned);
    if (owned) {
      ++idx;
      if (parts.length === 0) parts.push("<h4>Owned Items</h4>");
      let slot = SLOT_BY_CODE[item.slot];
      parts.push(`<div>
          <span class="card_number">${item.number}</span>
          <img src="./assets/${slot.src}" alt="${slot.alt}">
          <span class="item_name">${item.name}</span>
          <button onClick="lose_item(${item.number})"><img src="./assets/clear.png" alt="x"></button>
        </div>`);
    }
  }
  div.innerHTML = parts.join('');
}
