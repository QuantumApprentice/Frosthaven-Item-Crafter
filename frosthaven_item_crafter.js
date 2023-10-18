"use strict";
///home/quantum/.wine/drive_c/Program Files/Blackmagic Design/DaVinci Resolve
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

let owned_cards = [];
let unlocked_cards = [];
let slot_type = "";
let useItemNumberFilter = false;
let show_craftable = false;

let item_data;
get_data();
async function get_data()
{
  if (item_data) { return item_data; }
  let item_data_json = await fetch("/item-data.json");
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
  // console.log("hash: ", hash);
  // let arr = hash.split(";");
  // console.log("hash arr: ", arr);

  const form = document.getElementById("form");
  // const form = document.querySelector("form");
  const formData = new FormData(form);
  for (const [key, val] of formData) {
    console.log("formdata:", key,  val);
  }


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
  let unlocked_cards_string = document.getElementById("unlocked_cards").value;
  unlocked_cards = parse_numbers(unlocked_cards_string);

  let card_nums_string = document.getElementById("owned_cards").value;
  owned_cards = parse_numbers(card_nums_string);

  slot_type           = document.getElementById("slot_filter").value;
  useItemNumberFilter = !document.getElementById("ignore_unlocked_cards").checked;
  show_craftable      = document.getElementById("show_craftable").checked;

  gold        = document.getElementById("gold"       ).valueAsNumber || 0;

  wood        = document.getElementById("wood"       ).valueAsNumber || 0;
  metal       = document.getElementById("metl"       ).valueAsNumber || 0;
  hide        = document.getElementById("hide"       ).valueAsNumber || 0;

  arrowvine   = document.getElementById("arrowvine"  ).valueAsNumber || 0;
  axenut      = document.getElementById("axenut"     ).valueAsNumber || 0;
  corpsecap   = document.getElementById("corpsecap"  ).valueAsNumber || 0;
  flamefruit  = document.getElementById("flamefruit" ).valueAsNumber || 0;
  rockroot    = document.getElementById("rockroot"   ).valueAsNumber || 0;
  snowthistle = document.getElementById("snowthistle").valueAsNumber || 0;

  show_items();
}

document.querySelector("form").addEventListener("submit",
  submitEvent => {
    submitEvent.preventDefault();
    parse_input();
});
document.getElementById("ignore_unlocked_cards").addEventListener(
  'change', parse_input
);
document.getElementById("show_craftable").addEventListener(
  'change', parse_input
);
document.getElementById("owned_cards").addEventListener(
  'change', parse_input
);


for (const input_el of document.querySelectorAll("input")) {
  input_el.addEventListener("input", parse_input);
}

function reset_crafting ()
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
      if (!owned_cards.includes(item_num)) {
        items_to_craft.push(item_data.items[item_num-1]);
      }
    }
    if (!unlocked_cards.includes(item.number)) {
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

    let has_item_98  = special_items_to_craft.has(item_data.items[97]);
    let has_item_119 = special_items_to_craft.has(item_data.items[118]);
    if (special_items_to_craft.size > (has_item_98 ? 1 : 0) + (has_item_119 ? 1 : 0)) {
      // ^ this if check feels dumb, particularly the ternaries
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


function filter_craftable_b(el)
{
  let flag = false;
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
        if (!owned_cards.includes(item_num)) {
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

                    if (!owned_cards.includes(item_num2)) {
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
                    if (!owned_cards.includes(item_num)) {
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

  //unlocked filter to only show unlocked items
  if (useItemNumberFilter && !unlocked_cards.includes(el.number)){
    return false;
  }

  //crafting filter to show items that are craftable (but not owned?)
  if (show_craftable) {
    if (!filter_craftable_c(el)) {
      return false;
    }
  }
  return true;
}

function show_items()
{
  let item_array = item_data.items.filter(filter_func);
  create_cards(item_array);
}

function flip_card(item)
{
  src="/item-images/"+item.file_back;
}

function create_cards(item_array)
{
  let card_front;
  let card_button;
  let output = document.getElementById("grid_layout");
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

    card_front.src="/item-images/" + item.file;
    card_front.className="card_front";
    div.append(card_button);

    if (item.usage == "f") {
      card_front.dataset.otherSide = '/item-images/'+item.file_back;
      card_front.dataset.otherFake = '/icons-slots/fake-card-front.png';

      let card_back = document.createElement("img");
      card_back.src="/icons-slots/fake-card-back.png";
      card_back.className="back_of_card";
      div.append(card_back);
    }

    output.append(div);
  }
}


// function show_all_cards(slot_type)
// {
//   document.getElementById("grid_layout").innerHTML="";

//   let card_front;
//   let card_button;
//   let output = document.getElementById("grid_layout");

//   for (const i of item_data.items) {
//     card_button = document.createElement("button");
//     card_front = document.createElement("img");
//     card_button.append(card_front);

//     if (!slot_type || slot_type==i.slot) {
//       card_front.src = "/item-images/" + i.file;
//       output.append(card_button);
//     }
//   }
// }
