"use strict";
///home/quantum/.wine/drive_c/Program Files/Blackmagic Design/DaVinci Resolve

//check// frosthaven supplies, 
//check// owned items listing, 
// buttons on top of the items to add them to the owned/unlocked list, 
//check// saving the different player's resources to the URL so the entire state can be saved/reloaded, 
//check// including player names


let players = [];
let selected_player = 1;
let g_stats = {};

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

let unlocked_items = [];
let ul             = "";
let slot_type      = "";
let selectedFilter = "";
let item_data;
get_data();
async function get_data()
{
  if (item_data) { return item_data; }
  let item_data_json = await fetch("./item-data.json");
  item_data = await item_data_json.json();

  for (const el of item_data.items) {
    parse_cost(el);
  }
  // console.log(item_data);

  if (location.hash) {
    let hash = location.hash;
    parse_hash(hash);
  }

}

function parse_hash(hash)
{
  let str_arr = hash.substring(1).split(";");

  for (const el of str_arr) {
    let [key, val] = el.split("=");
    // console.log("key:val", key, val);

    if (key == "ul") {
      ul = val;
    }
    if (key == "fs") {
      if (!players[0]) {
        players[0] = {};
      }

      let resources = val.split(",");
      players[0].gold        = parseInt(resources[0]) || 0;
      players[0].wood        = parseInt(resources[1]) || 0;
      players[0].metal       = parseInt(resources[2]) || 0;
      players[0].hide        = parseInt(resources[3]) || 0;
      players[0].arrowvine   = parseInt(resources[4]) || 0;
      players[0].axenut      = parseInt(resources[5]) || 0;
      players[0].corpsecap   = parseInt(resources[6]) || 0;
      players[0].flamefruit  = parseInt(resources[7]) || 0;
      players[0].rockroot    = parseInt(resources[8]) || 0;
      players[0].snowthistle = parseInt(resources[9]) || 0;
    }


    if (key.startsWith("p")) {
      let indx = parseInt(key.slice(1));
      let [name, res_str, owned] = val.split(":");
      // console.log("indx nro", decodeURIComponent(name), res_str, owned);

      if (!players[indx]) {
        players[indx] = {};
      }

      document.getElementById(key).innerText = decodeURIComponent(name);

      let resources = res_str.split(",");

      players[indx].wood        = resources[0];
      players[indx].metal       = resources[1];
      players[indx].hide        = resources[2];
      players[indx].arrowvine   = resources[3];
      players[indx].axenut      = resources[4];
      players[indx].corpsecap   = resources[5];
      players[indx].flamefruit  = resources[6];
      players[indx].rockroot    = resources[7];
      players[indx].snowthistle = resources[8];

      players[indx].owned_items = owned;
    }

  }

  if (players[1]) {
    show_player_stats(1);
  }
  else if (players[2]) {
    show_player_stats(2);
  }
  else if (players[3]) {
    show_player_stats(3);
  }
  else if (players[4]) {
    show_player_stats(4);
  }

  create_hash();
}

function create_hash()
{
  const form = document.getElementById("form");
  const formData = new FormData(form);

  // /* approach 1 - functional: */ 
  // let s = Array.from(formData).map(
  //   kvPair => kvPair.join('=')
  //   ).join(';');

  // /* approach 2 - string concatenation: */
  // let s = '';
  // for (let [key, value] of formData) {
  //   // if (s.length) { s += ';'; }
  //   s += `${key}=${value};`;
  // }
  // s = s.slice(0,-1);
  // console.log("s: ", s);

  /* approach 3 - array joining: */
  let parts = ["#"];
  // for (let [key, value] of formData) {
  //   parts.push(key);
  //   parts.push('=');
  //   parts.push(value);
  //   parts.push(";");
  // }


  /* create link from players variable instead of form */
  for (let i = 0; i <= 4; i++) {

    if (!players[i]) { continue; }

    if (i == 0) {
      parts.push(`fs=`);

      parts.push(players[i].wood        || "");
      parts.push(",");
      parts.push(players[i].metal       || "");
      parts.push(",");
      parts.push(players[i].hide        || "");
      parts.push(",");
      parts.push(players[i].arrowvine   || "");
      parts.push(",");
      parts.push(players[i].axenut      || "");
      parts.push(",");
      parts.push(players[i].corpsecap   || "");
      parts.push(",");
      parts.push(players[i].flamefruit  || "");
      parts.push(",");
      parts.push(players[i].rockroot    || "");
      parts.push(",");
      parts.push(players[i].snowthistle || "");

      parts.push(";");
    }
    else {

      let name = document.getElementById(`p${i}`);
      parts.push(`p${i}=`, encodeURIComponent(name.innerText || `Player ${i}`));
      parts.push(":");

      parts.push(players[i].gold        || "");
      parts.push(",");
      parts.push(players[i].wood        || "");
      parts.push(",");
      parts.push(players[i].metal       || "");
      parts.push(",");
      parts.push(players[i].hide        || "");
      parts.push(",");
      parts.push(players[i].arrowvine   || "");
      parts.push(",");
      parts.push(players[i].axenut      || "");
      parts.push(",");
      parts.push(players[i].corpsecap   || "");
      parts.push(",");
      parts.push(players[i].flamefruit  || "");
      parts.push(",");
      parts.push(players[i].rockroot    || "");
      parts.push(",");
      parts.push(players[i].snowthistle || "");

      parts.push(":");
      parts.push(players[i].owned_items || "");

      parts.push(";")
    }
  }

  parts.push("ul=");
  parts.push(ul);

  let s = parts.join('');

  return s;
}

function parse_numbers(input)
{
  let storage_arr = [];
  let card_range_array = input.split(',');

  for (let card_range of card_range_array) {
    let range_array = card_range.split("-");

    if (range_array.length > 1) {
      let begin = parseInt(range_array[0]);
      let end = parseInt(range_array[1]);
      for (let i = begin; i <= end; i++) {
        storage_arr.push(i);
      }
    }
    else {
      storage_arr.push(parseInt(card_range));
    }
  }
  return storage_arr;
}

function parse_input()
{
  ul = document.getElementById("unlocked_items").value;
  unlocked_items = parse_numbers(ul);

  let card_nums_string = document.getElementById("owned_items").value;
  g_stats.owned_items = parse_numbers(card_nums_string);

  slot_type      = document.getElementById("slot_filter" ).value;
  selectedFilter = document.getElementById("locked_input").value;

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

  let item_array = item_data.items.filter(filter_func);
  // console.log(item_array);
  create_cards(item_array);

  window.location.replace(create_hash());
}

document.querySelector("form").addEventListener("submit",
  submitEvent => {
    submitEvent.preventDefault();
    parse_input();
});
document.getElementById("locked_input").addEventListener(
  'change', parse_input
)
document.getElementById("owned_items").addEventListener(
  'change', parse_input
);


for (const input_el of document.querySelectorAll("input")) {
  input_el.addEventListener("input", parse_input);
}

function reset_crafting()
{
  for (const i of document.querySelectorAll("input[type=number]")) {
    i.value = "";
  }
  parse_input();
}

function has_at_least_herbs(amt, min)
{
  let total = 0;
  if (amt <= g_stats.arrowvine  ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= g_stats.axenut     ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= g_stats.corpsecap  ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= g_stats.flamefruit ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= g_stats.rockroot   ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= g_stats.snowthistle) { total += 1;
    if (total >= min) {return true;}
  }

  return false;
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

function handle_special(el)
{
  if (el.number == 98) {
    if (has_at_least_herbs(2, 1)) {
      return true;
    }
  }
  if (el.number == 119) {
    if ((has_at_least_herbs(2, 1)) &&
        (has_at_least_herbs(1, 2)) ||
        (has_at_least_herbs(3, 1)))
      {
      return true;
    }
  }
  return false;
}

function filter_craftable_c(el)
{
  if (g_stats.owned_items.includes(el.number)) {
    return false;
  }

  if (el.number >= 248 && el.number <= 264) {
    return false;
  }

  let items_to_craft = [el];
  let regular_items_to_craft = new Set();
  let special_items_to_craft = new Set();
  // this assumes each item is only ever in a crafting chain once
  while (items_to_craft.length > 0) {
    let item = items_to_craft.shift();
    if (selectedFilter != "all&craft" && !unlocked_items.includes(item.number)) {
      
      return false;
    }

    if (item.resources["-"]) {
      special_items_to_craft.add(item);
    }
    else {
      regular_items_to_craft.add(item);
      for (let item_num of item.resources.i) {
        if (!g_stats.owned_items.includes(item_num)) {
          items_to_craft.push(item_data.items[item_num-1]);
        }
      }
    }
  }

  let total_w = 0;
  let total_m = 0;
  let total_h = 0;

  let total_v = 0;
  let total_n = 0;
  let total_c = 0;
  let total_f = 0;
  let total_r = 0;
  let total_s = 0;

  let total_g = 0;

  let current_stats = {...g_stats};

  for (let item of regular_items_to_craft) {
    total_w += item.resources.w;
    total_m += item.resources.m;
    total_h += item.resources.h;

    total_v += item.resources.v;
    total_n += item.resources.n;
    total_c += item.resources.c;
    total_f += item.resources.f;
    total_r += item.resources.r;
    total_s += item.resources.s;

    total_g += item.resources.g;
  }

  g_stats.wood        -= total_w;
  g_stats.metal       -= total_m;
  g_stats.hide        -= total_h;

  g_stats.arrowvine   -= total_v;
  g_stats.axenut      -= total_n;
  g_stats.corpsecap   -= total_c;
  g_stats.flamefruit  -= total_f;
  g_stats.rockroot    -= total_r;
  g_stats.snowthistle -= total_s;

  if (selected_player != 0) {
    if (!players[0]) {
      init_player_0();
    }
    g_stats.arrowvine   += parseInt(players[0].arrowvine  ) || 0;
    g_stats.axenut      += parseInt(players[0].axenut     ) || 0;
    g_stats.corpsecap   += parseInt(players[0].corpsecap  ) || 0;
    g_stats.flamefruit  += parseInt(players[0].flamefruit ) || 0;
    g_stats.rockroot    += parseInt(players[0].rockroot   ) || 0;
    g_stats.snowthistle += parseInt(players[0].snowthistle) || 0;
  }

  g_stats.gold        -= total_g;

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
      return false;
    }

    let has_item_98   = special_items_to_craft.delete(item_data.items[97]);
    let has_item_119  = special_items_to_craft.delete(item_data.items[118]);

    if (special_items_to_craft.size > 0) {
      console.warn("Unhandled special items", special_items_to_craft);
      return false;
    }

    if (has_item_98 && has_item_119) {
      // this is never the case but for completeness we handle it anyway
      return (
            has_at_least_herbs(5, 1)
        || (has_at_least_herbs(4, 1) && has_at_least_herbs(1, 2))
        || (has_at_least_herbs(3, 1) && has_at_least_herbs(2, 2))
        || (has_at_least_herbs(2, 2) && has_at_least_herbs(1, 3))
      );
    } else if (has_item_98) {
      return has_at_least_herbs(2, 1);
    } else if (has_item_119) {
      return (
        has_at_least_herbs(3, 1) ||
       (has_at_least_herbs(2, 1) &&
        has_at_least_herbs(1, 2))
      );
    }
  } finally {
    g_stats = current_stats;
  }
  return true;
}

function filter_craftable_b(el)
{
  let flag = false;
  if (el.resources["-"]) {
    handle_special(el);
  }
  else {
    if (el.resources.i.length > 0) {
      let current_req = {};
      current_req.w = 0;
      current_req.m = 0;
      current_req.h = 0;

      current_req.v = 0;
      current_req.n = 0;
      current_req.c = 0;
      current_req.f = 0;
      current_req.r = 0;
      current_req.s = 0;

      current_req.g = 0;

      for (const item_num of el.resources.i) {
        let current_item = item_data.items[item_num-1];
        if (!owned_items.includes(item_num)) {
          current_req.w += current_item.resources.w;
          current_req.m += current_item.resources.m;
          current_req.h += current_item.resources.h;

          current_req.v += current_item.resources.v;
          current_req.n += current_item.resources.n;
          current_req.c += current_item.resources.c;
          current_req.f += current_item.resources.f;
          current_req.r += current_item.resources.r;
          current_req.s += current_item.resources.s;

          current_req.g += current_item.resources.g;
        }
      }
      if (
        current_req.w <= g_stats.wood        &&
        current_req.m <= g_stats.metal       &&
        current_req.h <= g_stats.hide        &&
        current_req.v <= g_stats.arrowvine   &&
        current_req.n <= g_stats.axenut      &&
        current_req.c <= g_stats.corpsecap   &&
        current_req.f <= g_stats.flamefruit  &&
        current_req.r <= g_stats.rockroot    &&
        current_req.s <= g_stats.snowthistle &&
        current_req.g <= g_stats.gold
      ) {
        flag = true;
      }
    } else {
      flag = true;
    }

    if (flag == true) {
      if (//required        inventory
        el.resources.w <= g_stats.wood        &&
        el.resources.m <= g_stats.metal       &&
        el.resources.h <= g_stats.hide        &&

        el.resources.v <= g_stats.arrowvine   &&
        el.resources.n <= g_stats.axenut      &&
        el.resources.c <= g_stats.corpsecap   &&
        el.resources.f <= g_stats.flamefruit  &&
        el.resources.r <= g_stats.rockroot    &&
        el.resources.s <= g_stats.snowthistle &&

        el.resources.g <= g_stats.gold
        ) {
          return true;
        }
        return false;
    }
    else {
      return false;
    }
  }
}

function filter_craftable(el)
{
  // if (el.number === 1) debugger;
  if (el.resources["-"]) {

    if (el.number == 98) {
      if (has_at_least_herbs(2, 1)) {
        return true;
      }
    }
    if (el.number == 119) {
      if ((has_at_least_herbs(2, 1)) &&
          (has_at_least_herbs(1, 2)) ||
          (has_at_least_herbs(3, 1)))
       {
        return true;
      }
    }
    return false;
  }
  else
  if (//required        inventory
      el.resources.w <= g_stats.wood        &&
      el.resources.m <= g_stats.metal       &&
      el.resources.h <= g_stats.hide        &&

      el.resources.v <= g_stats.arrowvine   &&
      el.resources.n <= g_stats.axenut      &&
      el.resources.c <= g_stats.corpsecap   &&
      el.resources.f <= g_stats.flamefruit  &&
      el.resources.r <= g_stats.rockroot    &&
      el.resources.s <= g_stats.snowthistle &&

      el.resources.g <= g_stats.gold
      ) {
        if (el.resources.i.length > 0) {
            g_stats.wood        -= el.resources.w;
            g_stats.metal       -= el.resources.m;
            g_stats.hide        -= el.resources.h;

            g_stats.arrowvine   -= el.resources.v;
            g_stats.axenut      -= el.resources.n;
            g_stats.corpsecap   -= el.resources.c;
            g_stats.flamefruit  -= el.resources.f;
            g_stats.rockroot    -= el.resources.r;
            g_stats.snowthistle -= el.resources.s;
          try {
            for (const item_num of el.resources.i) {

                if (el.resources.i.length > 1) {
          // debugger;
                  for (const item_num2 of el.resources.i) {
                    if (item_num == item_num2) {continue;}

                    if (!owned_items.includes(item_num2)) {
                      let current = item_data.items[item_num2-1];

                      g_stats.wood        -= current.resources.w;
                      g_stats.metal       -= current.resources.m;
                      g_stats.hide        -= current.resources.h;

                      g_stats.arrowvine   -= current.resources.v;
                      g_stats.axenut      -= current.resources.n;
                      g_stats.corpsecap   -= current.resources.c;
                      g_stats.flamefruit  -= current.resources.f;
                      g_stats.rockroot    -= current.resources.r;
                      g_stats.snowthistle -= current.resources.s;
                    }
                  }
                  try {
                    if (!owned_items.includes(item_num)) {
                      if (!filter_craftable(item_data.items[item_num-1])) {
                        return false;
                      }
                    }
                  }
                  finally {
                    for (const item_num2 of el.resources.i) {
                      if (item_num == item_num2) {continue;}

                      g_stats.wood        += item_data.items[item_num2-1].resources.w;
                      g_stats.metal       += item_data.items[item_num2-1].resources.m;
                      g_stats.hide        += item_data.items[item_num2-1].resources.h;

                      g_stats.arrowvine   += item_data.items[item_num2-1].resources.v;
                      g_stats.axenut      += item_data.items[item_num2-1].resources.n;
                      g_stats.corpsecap   += item_data.items[item_num2-1].resources.c;
                      g_stats.flamefruit  += item_data.items[item_num2-1].resources.f;
                      g_stats.rockroot    += item_data.items[item_num2-1].resources.r;
                      g_stats.snowthistle += item_data.items[item_num2-1].resources.s;
                    }
                  }

                }

            }
          }
          finally {
            g_stats.wood        += el.resources.w;
            g_stats.metal       += el.resources.m;
            g_stats.hide        += el.resources.h;

            g_stats.arrowvine   += el.resources.v;
            g_stats.axenut      += el.resources.n;
            g_stats.corpsecap   += el.resources.c;
            g_stats.flamefruit  += el.resources.f;
            g_stats.rockroot    += el.resources.r;
            g_stats.snowthistle += el.resources.s;
          }
        }
        return true;
      }
      return false;
}

function parse_cost(item)
{
  let cost_array = item.cost.split(",");
  item.resources = {};
  item.resources.w = 0;
  item.resources.m = 0;
  item.resources.h = 0;

  item.resources.v = 0;
  item.resources.n = 0;
  item.resources.c = 0;
  item.resources.f = 0;
  item.resources.r = 0;
  item.resources.s = 0;

  item.resources.g = 0;

  item.resources.i = [];

  for (const el of cost_array) {
    let resource = el.substring(0,1);
    let amount = parseInt(el.substring(1)) || 1;

    if (resource == "i") {
      item.resources.i.push(amount);
    }
    else {
      Object.assign(item.resources, {[resource]:amount});
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
  if (selectedFilter == "unlock" || selectedFilter == "unlock&craft")
    if (!unlocked_items.includes(el.number)){
    return false;
  }
  if (selectedFilter == "all&craft" || selectedFilter == "unlock&craft") {
    if (!filter_craftable_c(el)) {
      return false;
    }
  }
  if (selectedFilter == "owned") {
    if (!g_stats.owned_items.includes(el.number)) {
      return false;
    }
  }

  return true;
}

function create_cards(item_array)
{
  let card_front;
  let card_button;
  let output = document.getElementById("card_display");
  output.innerHTML="";

  for (const item of item_array) {

    // console.log(item_array);

    let div = document.createElement("div");
    let num = document.createElement("span");

    num.className="card_number";
    num.innerHTML = `${item.number}`;

    div.append(num);
    div.className="card_div";

    card_button = document.createElement("button");
    card_front = document.createElement("img");
    card_button.append(card_front);

    // Swap front and back button
    card_button.onclick=function (event) {
      let backSide=event.target.dataset.otherSide;
      let currentSide = event.target.src;
      event.target.src = backSide;
      event.target.dataset.otherSide = currentSide;

      let back = event.target.parentElement.nextSibling;
      currentSide = back.src;
      back.src=event.target.dataset.otherFake;
      event.target.dataset.otherFake = currentSide;
    };

    card_front.src="./item-images/" + item.file;
    card_front.className="card_front";
    div.append(card_button);

    if (item.usage == "f") {
      card_front.dataset.otherSide = './item-images/'+item.file_back;
      card_front.dataset.otherFake = './icons-slots/fake-card-front.png';

      let card_back = document.createElement("img");
      card_back.src="./icons-slots/fake-card-back.png";
      card_back.className="card_back";
      div.append(card_back);
    }

    output.append(div);
  }
}

function create_link()
{
  let link = window.location.href;
  navigator.clipboard.writeText(link);
}

function change_name(el)
{
  let new_name = window.prompt("Enter player name.", el.textContent.trim());
  if (!new_name) {
    return;
  }
  // el.firstElementChild.innerHTML = new_name.trim();
  el.innerText = new_name.trim();
  // el.replaceChild(document.createTextNode(new_name.trim()), el.firstChild);
  create_hash();
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

}

function update_highlight(current_button)
{
  ////normal way of doing this
  // for (const otherButtons of current_button.parentElement.querySelectorAll('button')) {
  //   otherButtons.classList.remove("highlight");
  // }
  // el.classList.add("highlight");

  //toggle way of doing this
  for (const button of current_button.parentElement.querySelectorAll('button')) {
    button.classList.toggle("highlight", button === current_button);
  }
}

function swap_player_stats(num)
{
  assign_player_stats(selected_player);
  show_player_stats(num);
}

function show_player_stats(num)
{
  selected_player = num;

  if (!players[num]) {
    players[num] = {}
    reset_crafting();
  }

  const form = document.getElementById("form");
  for (const el of Object.entries(players[num])) {
    let [key, val] = el;

  //   console.log("2key:val= ", key, ":", val);
      form.elements[key].value = val;
  }

  parse_input();

}