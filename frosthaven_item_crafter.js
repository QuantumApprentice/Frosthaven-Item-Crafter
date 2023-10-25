"use strict";
///home/quantum/.wine/drive_c/Program Files/Blackmagic Design/DaVinci Resolve

let players = [];
let globalnum = 0;

let gold  = 0;

let wood  = 0;
let metal = 0;
let hide  = 0;

let arrowvine   = 0;
let axenut      = 0;
let corpsecap   = 0;
let flamefruit  = 0;
let rockroot    = 0;
let snowthistle = 0;

let owned_items = [];
let unlocked_items = [];
let slot_type = "";
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
  let final_arr = [];

  for (const el of str_arr) {
    final_arr.push(el.split("="));
  }
  const form = document.getElementById("form");

  for (const el of final_arr) {
    let [key, val] = el;

    let formEl = form.elements[key];
    if (!formEl) { continue; }

    // console.log("key:val= ", key, ":", val);
    formEl.value = val;
  }

  parse_input();
  create_hash();
}

function create_hash()
{

  const form = document.getElementById("form");
  const formData = new FormData(form);

  // temp_str = Array.from(formData).map(
  //   kvPair => kvPair.join('=')
  //   ).join(';')

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
  for (let [key, value] of formData) {
    // if (parts.length) { parts.push(';');}
    parts.push(key);
    parts.push('=');
    parts.push(value);
    parts.push(";");
  }
  parts.splice(-1,1);
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
  let unlocked_cards_string = document.getElementById("unlocked_items").value;
  unlocked_items = parse_numbers(unlocked_cards_string);

  let card_nums_string = document.getElementById("owned_items").value;
  owned_items = parse_numbers(card_nums_string);

  slot_type      = document.getElementById("slot_filter" ).value;
  selectedFilter = document.getElementById("locked_input").value;

  gold        = document.getElementById("gold"       ).valueAsNumber || 0;

  wood        = document.getElementById("wood"       ).valueAsNumber || 0;
  metal       = document.getElementById("metal"       ).valueAsNumber || 0;
  hide        = document.getElementById("hide"       ).valueAsNumber || 0;

  arrowvine   = document.getElementById("arrowvine"  ).valueAsNumber || 0;
  axenut      = document.getElementById("axenut"     ).valueAsNumber || 0;
  corpsecap   = document.getElementById("corpsecap"  ).valueAsNumber || 0;
  flamefruit  = document.getElementById("flamefruit" ).valueAsNumber || 0;
  rockroot    = document.getElementById("rockroot"   ).valueAsNumber || 0;
  snowthistle = document.getElementById("snowthistle").valueAsNumber || 0;

  assign_player_stats(globalnum);

  let item_array = item_data.items.filter(filter_func);
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
  if (amt <= arrowvine  ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= axenut     ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= corpsecap  ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= flamefruit ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= rockroot   ) { total += 1;
    if (total >= min) {return true;}
  }
  if (amt <= snowthistle) { total += 1;
    if (total >= min) {return true;}
  }

  return false;
}

// So at the start of the function, 
// I'd build up an array of "items that require crafting" 
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

function filter_craftable_c(el)
{
  if (owned_items.includes(el.number)) {
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
    if (item.resources["-"]) {
      special_items_to_craft.add(item);
      continue;
    }
    regular_items_to_craft.add(item);
    for (let item_num of item.resources.i) {
      if (!owned_items.includes(item_num)) {
        items_to_craft.push(item_data.items[item_num-1]);
      }
    }
    if (!unlocked_items.includes(item.number)) {
      return false;
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

  wood        -= total_w;
  metal       -= total_m;
  hide        -= total_h;

  arrowvine   -= total_v;
  axenut      -= total_n;
  corpsecap   -= total_c;
  flamefruit  -= total_f;
  rockroot    -= total_r;
  snowthistle -= total_s;

  gold        -= total_g;

  try {
    if (
           wood        < 0
        || metal       < 0
        || hide        < 0

        || arrowvine   < 0
        || axenut      < 0
        || corpsecap   < 0
        || flamefruit  < 0
        || rockroot    < 0
        || snowthistle < 0

        || gold        < 0
    ) {
      return false;
    }

    // let is_single_class_item = special_items_to_craft.size === 1 && special_items_to_craft.keys().next().value.resources.z;
    // if (is_single_class_item) return false;

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
      return has_at_least_herbs(2, 2);
    } else if (has_item_119) {
      return (
        has_at_least_herbs(3, 1)
        || (has_at_least_herbs(2, 1) && has_at_least_herbs(1, 2))
      );
    }
  } finally {
    wood        += total_w;
    metal       += total_m;
    hide        += total_h;

    arrowvine   += total_v;
    axenut      += total_n;
    corpsecap   += total_c;
    flamefruit  += total_f;
    rockroot    += total_r;
    snowthistle += total_s;

    gold        += total_g;
  }
  return true;
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


function filter_craftable_b(el)
{
  let flag = false;
  // if (el.number === 1) debugger;
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
        current_req.w <= wood        &&
        current_req.m <= metal       &&
        current_req.h <= hide        &&
        current_req.v <= arrowvine   &&
        current_req.n <= axenut      &&
        current_req.c <= corpsecap   &&
        current_req.f <= flamefruit  &&
        current_req.r <= rockroot    &&
        current_req.s <= snowthistle &&
        current_req.g <= gold
      ) {
        flag = true;
      }
    } else {
      flag = true;
    }

    if (flag == true) {
      if (//required        inventory
        el.resources.w <= wood        &&
        el.resources.m <= metal       &&
        el.resources.h <= hide        &&

        el.resources.v <= arrowvine   &&
        el.resources.n <= axenut      &&
        el.resources.c <= corpsecap   &&
        el.resources.f <= flamefruit  &&
        el.resources.r <= rockroot    &&
        el.resources.s <= snowthistle &&

        el.resources.g <= gold
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
      el.resources.w <= wood        &&
      el.resources.m <= metal       &&
      el.resources.h <= hide        &&

      el.resources.v <= arrowvine   &&
      el.resources.n <= axenut      &&
      el.resources.c <= corpsecap   &&
      el.resources.f <= flamefruit  &&
      el.resources.r <= rockroot    &&
      el.resources.s <= snowthistle &&

      el.resources.g <= gold
      ) {
        if (el.resources.i.length > 0) {
            wood        -= el.resources.w;
            metal       -= el.resources.m;
            hide        -= el.resources.h;

            arrowvine   -= el.resources.v;
            axenut      -= el.resources.n;
            corpsecap   -= el.resources.c;
            flamefruit  -= el.resources.f;
            rockroot    -= el.resources.r;
            snowthistle -= el.resources.s;
          try {
            for (const item_num of el.resources.i) {

                if (el.resources.i.length > 1) {
          // debugger;
                  for (const item_num2 of el.resources.i) {
                    if (item_num == item_num2) {continue;}

                    if (!owned_items.includes(item_num2)) {
                      let current = item_data.items[item_num2-1];

                      wood        -= current.resources.w;
                      metal       -= current.resources.m;
                      hide        -= current.resources.h;

                      arrowvine   -= current.resources.v;
                      axenut      -= current.resources.n;
                      corpsecap   -= current.resources.c;
                      flamefruit  -= current.resources.f;
                      rockroot    -= current.resources.r;
                      snowthistle -= current.resources.s;
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

                      wood        += item_data.items[item_num2-1].resources.w;
                      metal       += item_data.items[item_num2-1].resources.m;
                      hide        += item_data.items[item_num2-1].resources.h;

                      arrowvine   += item_data.items[item_num2-1].resources.v;
                      axenut      += item_data.items[item_num2-1].resources.n;
                      corpsecap   += item_data.items[item_num2-1].resources.c;
                      flamefruit  += item_data.items[item_num2-1].resources.f;
                      rockroot    += item_data.items[item_num2-1].resources.r;
                      snowthistle += item_data.items[item_num2-1].resources.s;
                    }
                  }

                }

            }
          }
          finally {
            wood        += el.resources.w;
            metal       += el.resources.m;
            hide        += el.resources.h;

            arrowvine   += el.resources.v;
            axenut      += el.resources.n;
            corpsecap   += el.resources.c;
            flamefruit  += el.resources.f;
            rockroot    += el.resources.r;
            snowthistle += el.resources.s;
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
    if (!owned_items.includes(el.number)) {
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

    let div = document.createElement("div");
    let num = document.createElement("span");

    num.className="card_number";
    num.innerHTML = `${item.number}`;

    div.append(num);
    div.className="card_div";

    card_button = document.createElement("button");
    card_button.style="background-color: blue";
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
  el.firstElementChild.innerHTML = new_name.trim();
  // el.replaceChild(document.createTextNode(new_name.trim()), el.firstChild);
}

function assign_player_stats(num)
{
  // let num = document.querySelector('form').elements['player'].value;
  players[num] = {}
  players[num].gold           = gold          ;
  players[num].wood           = wood          ;
  players[num].metal          = metal         ;
  players[num].hide           = hide          ;
  players[num].arrowvine      = arrowvine     ;
  players[num].axenut         = axenut        ;
  players[num].corpsecap      = corpsecap     ;
  players[num].flamefruit     = flamefruit    ;
  players[num].rockroot       = rockroot      ;
  players[num].snowthistle    = snowthistle   ;
  players[num].owned_items    = owned_items   ;
}

function show_player_stats()
{
  let num = Number(document.querySelector('form').elements['player'].value);
  assign_player_stats(globalnum);
  globalnum = num;

  if (players[num]) {
    gold           = players[num].gold          ;
    wood           = players[num].wood          ;
    metal          = players[num].metal         ;
    hide           = players[num].hide          ;
    arrowvine      = players[num].arrowvine     ;
    axenut         = players[num].axenut        ;
    corpsecap      = players[num].corpsecap     ;
    flamefruit     = players[num].flamefruit    ;
    rockroot       = players[num].rockroot      ;
    snowthistle    = players[num].snowthistle   ;
    owned_items    = players[num].owned_items   ;
  }
  else {
    console.log("running?");
    players[num] = {}
    gold           = 0;
    wood           = 0;
    metal          = 0;
    hide           = 0;
    arrowvine      = 0;
    axenut         = 0;
    corpsecap      = 0;
    flamefruit     = 0;
    rockroot       = 0;
    snowthistle    = 0;
    owned_items    = 0;
    reset_crafting();
  }

  const form = document.getElementById("form");

  for (const el of Object.entries(players[num])) {
    let [key, val] = el;
    console.log("key:val= ", key, ":", val);
    form.elements[key].value = val;
  }

  
  parse_input()
}